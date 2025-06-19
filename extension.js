import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import Clutter from 'gi://Clutter';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import St from 'gi://St';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

// Constants
const ICON_SIZE = 18;

const AIChatIndicator = GObject.registerClass(
class AIChatIndicator extends PanelMenu.Button {
    _init(extension) {
        super._init(0.5, 'AI Chat Indicator', false);
        this._extension = extension;
        
        const icon = new St.Icon({
            gicon: Gio.icon_new_for_string(`${extension.path}/icons/chatgpt_icon.png`),
            style_class: 'system-status-icon',
            icon_size: ICON_SIZE
        });
        this.add_child(icon);
        
        // Add menu items
        let menuRestart = new PopupMenu.PopupMenuItem('Restart');
        let menuQuit = new PopupMenu.PopupMenuItem('Quit');
        
        this.menu.addMenuItem(menuRestart);
        this.menu.addMenuItem(menuQuit);
        
        menuRestart.connect('activate', () => this._extension.reloadWindow());
        menuQuit.connect('activate', () => this._extension.killWindow());
        
        // Handle button clicks - override the default behavior
        this.connect('button-press-event', (actor, event) => {
            if (event.get_button() == 1) {
                // Left click - toggle window and prevent menu
                this._extension.toggleWindow();
                return Clutter.EVENT_STOP;
            }
            return Clutter.EVENT_PROPAGATE;
        });
    }
    
    vfunc_event(event) {
        // Override the default PanelMenu.Button event handling
        if (event.type() == Clutter.EventType.BUTTON_PRESS) {
            if (event.get_button() == 1) {
                // Left click - don't call parent method to avoid menu
                this._extension.toggleWindow();
                return Clutter.EVENT_STOP;
            }
        }
        // For right clicks and other events, use default behavior
        return super.vfunc_event(event);
    }
    
    getButtonPosition() {
        return this.get_transformed_position();
    }
    
    getButtonSize() {
        return this.get_size();
    }
});

export default class ChatGPTGnomeDesktopExtension extends Extension {
    constructor(metadata) {
        super(metadata);
        this.indicator = null;
        this.proc = null;
        this.starting = false;
        this.initialized = false;
        this.automaticallyStartNewWindowAfterRestart = false;
    }

    enable() {
        if (this.initialized) {
            log('Extension already initialized');
            return;
        }
        this.initialized = true;

        log('Initializing extension');
        this.indicator = new AIChatIndicator(this);
        Main.panel.addToStatusArea(this.metadata.uuid, this.indicator, 1, 'right');
        log('Extension initialized and enabled');
    }

    disable() {
        log('Disabling extension');
        if (this.proc) {
            this.killWindow();
            this.proc = null;
        }
        if (this.indicator) {
            this.indicator.destroy();
            this.indicator = null;
        }
        this.initialized = false;
        log('Extension disabled and reset');
    }

    toggleWindow() {
        log('Toggling window');
        if (!this.proc && !this.starting) {
            log('Creating new subprocess');
            this.starting = true;

            // Calculate preferred window position based on button location
            // Note: Actual positioning depends on compositor support (limited on Wayland)
            let [x, y] = this.indicator.getButtonPosition();
            let [width, height] = this.indicator.getButtonSize();
            
            // Position window below the button
            const windowX = x;
            const windowY = y + height;
            log(`Button position: x=${x}, y=${y}, size: ${width}x${height}`);
            log(`Calculated window position: x=${windowX}, y=${windowY}`);
            this.proc = new Gio.Subprocess({
                argv: ['gjs', this.path + '/window.js', windowX.toString(), windowY.toString()]
            });

            this.proc.init(null);

            this.proc.wait_async(null, (proc, res) => {
                try {
                    this.proc.wait_finish(res);
                    log('Subprocess exited');
                } catch (e) {
                    log('Subprocess wait failed: ' + e.message);
                }
                this.proc = null;
                this.starting = false;

                if(this.automaticallyStartNewWindowAfterRestart){
                    this.automaticallyStartNewWindowAfterRestart = false;
                    this.toggleWindow();
                }
            });

            return;
        }

        this.killWindow();
    }

    reloadWindow() {
        log('Reloading window');
        this.killWindow();
        this.automaticallyStartNewWindowAfterRestart = true;
    }

    killWindow() {
        log('Killing window');
        if (this.proc) {
            try {
                this.proc.force_exit();
            } catch (e) {
                log('Failed to kill subprocess: ' + e.message);
            }
            log('Killed window');
        }
    }

}