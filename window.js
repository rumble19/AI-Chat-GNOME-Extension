imports.gi.versions.Gtk = '4.0';
imports.gi.versions.WebKit = '6.0';

const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const WebKit = imports.gi.WebKit;

// Translation function - simplified for standalone window
function _(str) {
    // In a real implementation, this would use proper gettext
    // For now, return the string as-is
    return str;
}

// Constants
const APP_NAME = 'AI-Chat-GNOME-Extension';
const WINDOW_TITLE = _('ChatGPT');
const DEFAULT_WINDOW_WIDTH = 1150;
const DEFAULT_WINDOW_HEIGHT = 650;
const CHATGPT_URL = 'https://chat.openai.com/chat';
const COOKIE_FILENAME = 'cookies.sqlite';

function log(message) {
    console.log('window.js: ' + message);
}

function prepareCookieStorage() {
    const appName = APP_NAME;
    const cookieFilename = COOKIE_FILENAME;

    const xdgDataHome = GLib.getenv('XDG_DATA_HOME') || GLib.build_filenamev([GLib.get_home_dir(), '.local', 'share']);
    const appDataDir = GLib.build_filenamev([xdgDataHome, appName]);

    log('Creating cookie storage directory: ' + appDataDir);
    GLib.mkdir_with_parents(appDataDir, 0o700);
    return GLib.build_filenamev([appDataDir, cookieFilename]);
}

function createWindow(x, y) {
    log('Creating window');
    try {
        const appWindow = new Gtk.Window({
            default_width: DEFAULT_WINDOW_WIDTH,
            default_height: DEFAULT_WINDOW_HEIGHT,
            title: WINDOW_TITLE
        });
        
        // Add accessibility properties (GTK4 compatible)
        try {
            // GTK4 uses different accessibility APIs
            appWindow.set_accessible_name(WINDOW_TITLE);
        } catch (e) {
            log('Could not set accessibility properties: ' + e.message);
        }

        // Use HeaderBar for better system integration
        const headerBar = new Gtk.HeaderBar();
        headerBar.set_title_widget(new Gtk.Label({ label: WINDOW_TITLE }));
        headerBar.set_show_title_buttons(true);
        appWindow.set_titlebar(headerBar);
        
        // Handle window positioning
        log(`Received position coordinates: x=${x}, y=${y}`);
        
        // Note: GTK4 has limited window positioning capabilities, especially on Wayland
        // The coordinates are calculated from the panel button position in extension.js
        // but direct window positioning is restricted by the compositor
        try {
            const sessionType = GLib.getenv('XDG_SESSION_TYPE');
            if (sessionType === 'x11') {
                log('X11 session - window positioning may be possible with compositor cooperation');
                // GTK4 removed gtk_window_move(), positioning now depends on compositor
                // Some compositors may honor size and position hints
            } else {
                log(`${sessionType || 'Unknown'} session - window positioning is managed by compositor`);
            }
        } catch (e) {
            log('Could not determine session type: ' + e.message);
        }

        log('Creating scrolled window');
        const scrolledWindow = new Gtk.ScrolledWindow();
        
        log('Creating WebView with cookie storage');
        const cookiePath = prepareCookieStorage();
        log('Cookie storage path: ' + cookiePath);
        
        const webView = new WebKit.WebView();
        
        // Set up cookie persistence using network session (from GNOME discourse solution)
        try {
            const networkSession = webView.get_network_session();
            if (networkSession) {
                const cookieManager = networkSession.get_cookie_manager();
                if (cookieManager) {
                    cookieManager.set_persistent_storage(cookiePath, WebKit.CookiePersistentStorage.SQLITE);
                    cookieManager.set_accept_policy(WebKit.CookieAcceptPolicy.ALWAYS);
                    log('Success: Cookie persistence configured via network session');
                } else {
                    log('Warning: Could not get cookie manager');
                }
            } else {
                log('Warning: Could not get network session');
            }
        } catch (e) {
            log('Failed: Network session cookie config - ' + e.message);
        }
        
        scrolledWindow.set_child(webView);
        
        log('Loading ChatGPT URL');
        webView.load_uri(CHATGPT_URL);

        appWindow.set_child(scrolledWindow);
        appWindow.connect('destroy', () => {
            log('Window destroyed');
            // Clean up WebView resources
            if (webView) {
                try {
                    webView.stop_loading();
                } catch (e) {
                    log('Error cleaning up WebView: ' + e.message);
                }
            }
        });
        
        log('Presenting window');
        appWindow.present();
        log('Window created and shown at calculated position');
        
        return appWindow;
    } catch (error) {
        log('Error creating window: ' + error.message);
        log('Error stack: ' + error.stack);
        throw error;
    }
}

log('Application starting up');
Gtk.init();

// Match system color scheme preference
const settings = Gtk.Settings.get_default();
try {
    const desktopSettings = new Gio.Settings({ schema: 'org.gnome.desktop.interface' });
    const colorScheme = desktopSettings.get_string('color-scheme');
    const preferDark = colorScheme === 'prefer-dark';
    settings.set_property('gtk-application-prefer-dark-theme', preferDark);
    log('Theme set to match system: ' + (preferDark ? 'dark' : 'light'));
} catch (e) {
    log('Failed to read system color scheme, using default: ' + e.message);
}

const [x, y] = ARGV;
log(`Arguments received: x=${x}, y=${y}`);
const window = createWindow(parseInt(x), parseInt(y));

const loop = GLib.MainLoop.new(null, false);
window.connect('destroy', () => {
    log('Window destroyed, quitting main loop');
    loop.quit();
});

loop.run();
log('Script execution completed');
