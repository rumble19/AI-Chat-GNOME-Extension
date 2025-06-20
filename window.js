// Modern ES modules imports for GNOME 45+
import GLib from "gi://GLib";
import Gtk from "gi://Gtk?version=4.0";
import WebKit from "gi://WebKit?version=6.0";

// Constants
const APP_NAME = "AI-Chat-GNOME-Extension";
const WINDOW_TITLE = "AI Chat";
const COOKIE_FILENAME = "cookies.sqlite";

function log(message) {
  console.log(`AI Chat Window: ${message}`);
}

function prepareCookieStorage() {
  const xdgDataHome =
    GLib.getenv("XDG_DATA_HOME") ||
    GLib.build_filenamev([GLib.get_home_dir(), ".local", "share"]);
  const appDataDir = GLib.build_filenamev([xdgDataHome, APP_NAME]);

  log(`Creating cookie storage directory: ${appDataDir}`);
  GLib.mkdir_with_parents(appDataDir, 0o700);
  return GLib.build_filenamev([appDataDir, COOKIE_FILENAME]);
}

function createWindow(x, y, width, height, url) {
  log(`Creating window at ${x},${y} with size ${width}x${height}`);

  try {
    const appWindow = new Gtk.Window({
      default_width: width,
      default_height: height,
      title: WINDOW_TITLE,
    });

    // Use HeaderBar for better system integration
    const headerBar = new Gtk.HeaderBar();
    headerBar.set_title_widget(new Gtk.Label({ label: WINDOW_TITLE }));
    headerBar.set_show_title_buttons(true);
    appWindow.set_titlebar(headerBar);

    // Handle window positioning
    log(`Received position coordinates: x=${x}, y=${y}`);

    // Note: GTK4 has limited window positioning capabilities, especially on Wayland
    try {
      const sessionType = GLib.getenv("XDG_SESSION_TYPE");
      if (sessionType === "x11") {
        log(
          "X11 session - window positioning may be possible with compositor cooperation"
        );
        // GTK4 removed gtk_window_move(), positioning now depends on compositor
      } else {
        log(
          `${
            sessionType || "Unknown"
          } session - window positioning is managed by compositor`
        );
      }
    } catch (e) {
      log(`Could not determine session type: ${e.message}`);
    }

    // Create scrolled window for WebView
    const scrolledWindow = new Gtk.ScrolledWindow();

    // Set up WebView with cookie persistence
    log("Creating WebView with cookie storage");
    const cookiePath = prepareCookieStorage();
    log(`Cookie storage path: ${cookiePath}`);

    const webView = new WebKit.WebView();

    // Configure cookie persistence using network session
    try {
      const networkSession = webView.get_network_session();
      const cookieManager = networkSession.get_cookie_manager();
      cookieManager.set_persistent_storage(
        cookiePath,
        WebKit.CookiePersistentStorage.SQLITE
      );
      cookieManager.set_accept_policy(WebKit.CookieAcceptPolicy.ALWAYS);
      log("Cookie persistence configured successfully");
    } catch (e) {
      log(`Failed to configure cookie persistence: ${e.message}`);
    }

    // Configure WebView settings for better experience
    const settings = webView.get_settings();
    settings.set_enable_javascript(true);
    settings.set_enable_write_console_messages_to_stdout(true);
    settings.set_user_agent("Mozilla/5.0 (X11; Linux x86_64) GNOME Chat Extension");

    scrolledWindow.set_child(webView);

    log(`Loading AI Chat URL: ${url}`);
    webView.load_uri(url);

    appWindow.set_child(scrolledWindow);

    // Handle window events
    appWindow.connect("destroy", () => {
      log("Window destroyed");
    });

    // Handle failed loads
    webView.connect("load-failed", (webView, loadEvent, failingUri, error) => {
      log(`Failed to load ${failingUri}: ${error.message}`);
      return false; // Allow WebKit to handle the error
    });

    // Log successful loads
    webView.connect("load-changed", (webView, loadEvent) => {
      if (loadEvent === WebKit.LoadEvent.FINISHED) {
        log("Page load completed successfully");
      }
    });

    log("Presenting window");
    appWindow.present();
    log("Window created and shown");

    return appWindow;
  } catch (error) {
    log(`Error creating window: ${error.message}`);
    if (error.stack) {
      log(`Error stack: ${error.stack}`);
    }
    throw error;
  }
}

// Initialize GTK and run main logic
log("AI Chat window starting up");

// Initialize GTK
Gtk.init();

// Match system color scheme preference
const settings = Gtk.Settings.get_default();
try {
  const result = GLib.spawn_command_line_sync(
    "gsettings get org.gnome.desktop.interface color-scheme"
  );
  if (result[0]) {
    // Success
    const colorScheme = new TextDecoder().decode(result[1]).trim();
    const preferDark = colorScheme.includes("prefer-dark");
    settings.set_property("gtk-application-prefer-dark-theme", preferDark);
    log(`Theme set to match system: ${preferDark ? "dark" : "light"}`);
  }
} catch (e) {
  log("Failed to read system color scheme, using default");
}

// Parse command line arguments
const args = ARGV; // ARGV is available globally in GJS scripts
if (args.length < 5) {
  log("Usage: window.js <x> <y> <width> <height> <url>");
} else {
  const [x, y, width, height, url] = args;
  log(`Arguments: x=${x}, y=${y}, width=${width}, height=${height}, url=${url}`);

  // Create and show the window
  const window = createWindow(
    parseInt(x),
    parseInt(y),
    parseInt(width),
    parseInt(height),
    url
  );

  // Run the main loop
  const loop = GLib.MainLoop.new(null, false);
  window.connect("destroy", () => {
    log("Window destroyed, quitting main loop");
    loop.quit();
  });

  loop.run();
  log("Script execution completed");
}
