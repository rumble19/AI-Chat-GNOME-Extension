imports.gi.versions.Gtk = '4.0';
imports.gi.versions.WebKit = '6.0';

const GLib = imports.gi.GLib;
const System = imports.system;
const Gtk = imports.gi.Gtk;
const WebKit = imports.gi.WebKit;

function log(message) {
    print('window.js: ' + message);
}

function prepareCookieStorage() {
    const appName = 'ChatGPT-Gnome-Desktop-Extension';
    const cookieFilename = 'cookies.sqlite';

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
            default_width: 1150,
            default_height: 650,
            title: 'ChatGPT'
        });

        // Use HeaderBar for better system integration
        const headerBar = new Gtk.HeaderBar();
        headerBar.set_title_widget(new Gtk.Label({ label: 'ChatGPT' }));
        headerBar.set_show_title_buttons(true);
        appWindow.set_titlebar(headerBar);
        log(`Calculated position: x=${x}, y=${y}`);

        log('Creating scrolled window');
        const scrolledWindow = new Gtk.ScrolledWindow();
        
        log('Creating WebView with cookie storage');
        const cookiePath = prepareCookieStorage();
        log('Cookie storage path: ' + cookiePath);
        
        const webView = new WebKit.WebView();
        
        // Set up cookie persistence using network session (from GNOME discourse solution)
        try {
            const networkSession = webView.get_network_session();
            const cookieManager = networkSession.get_cookie_manager();
            cookieManager.set_persistent_storage(cookiePath, WebKit.CookiePersistentStorage.SQLITE);
            cookieManager.set_accept_policy(WebKit.CookieAcceptPolicy.ALWAYS);
            log('Success: Cookie persistence configured via network session');
        } catch (e) {
            log('Failed: Network session cookie config - ' + e.message);
        }
        
        scrolledWindow.set_child(webView);
        
        log('Loading ChatGPT URL');
        webView.load_uri('https://chat.openai.com/chat');

        appWindow.set_child(scrolledWindow);
        appWindow.connect('destroy', () => {
            log('Window destroyed');
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
    const colorScheme = GLib.spawn_command_line_sync('gsettings get org.gnome.desktop.interface color-scheme')[1].toString().trim();
    const preferDark = colorScheme.includes('prefer-dark');
    settings.set_property('gtk-application-prefer-dark-theme', preferDark);
    log('Theme set to match system: ' + (preferDark ? 'dark' : 'light'));
} catch (e) {
    log('Failed to read system color scheme, using default');
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
