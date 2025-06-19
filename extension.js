import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import Clutter from 'gi://Clutter';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import St from 'gi://St';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import { Extension, gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';

// Constants
const ICON_SIZE = 18;

const AIChatIndicator = GObject.registerClass(
class AIChatIndicator extends PanelMenu.Button {
    _init(extension) {
        super._init(0.5, _('AI Chat Indicator'), false);
        this._extension = extension;
        
        let icon;
        try {
            icon = new St.Icon({
                gicon: Gio.icon_new_for_string(`${extension.path}/icons/chatgpt_icon.png`),
                style_class: 'system-status-icon',
                icon_size: ICON_SIZE
            });
        } catch (e) {
            log('Failed to load icon, using fallback: ' + e.message);
            icon = new St.Icon({
                icon_name: 'applications-internet-symbolic',
                style_class: 'system-status-icon',
                icon_size: ICON_SIZE
            });
        }
        this.add_child(icon);
        this.accessible_name = _('AI Chat');
        this.accessible_role = 'button';
        
        // Add menu items
        let menuRestart = new PopupMenu.PopupMenuItem(_('Restart'));
        menuRestart.accessible_name = _('Restart AI Chat Window');
        let menuQuit = new PopupMenu.PopupMenuItem(_('Quit'));
        menuQuit.accessible_name = _('Quit AI Chat Window');
        
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

export default class AIChatExtension extends Extension {
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
            try {
                this.indicator.destroy();
            } catch (e) {
                log('Error destroying indicator: ' + e.message);
            }
            this.indicator = null;
        }
        this.initialized = false;
        log('Extension disabled and reset');
    }

    toggleWindow() {
        log('Toggling window');
        
        // Check if process has exited (handles X button close case)
        if (this.proc && !this.starting) {
            try {
                // Check if we can get the exit status without blocking
                // This only works if the process has already terminated
                let exitStatus = this.proc.get_exit_status();
                // If we got here without exception, process has exited
                log('Process already exited with status: ' + exitStatus);
                this.proc = null;
                this.starting = false;
            } catch (e) {
                // Exception means process is still running or we can't determine status
                // Let's try a different approach - just attempt to send a signal
                try {
                    // Send signal 0 to check if process exists (doesn't actually kill it)
                    this.proc.send_signal(0);
                    log('Process still running, will kill it');
                } catch (signalError) {
                    log('Process already dead (signal failed), cleaning up');
                    this.proc = null;
                    this.starting = false;
                }
            }
        }
        
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
            try {
                this.proc = new Gio.Subprocess({
                    argv: ['gjs', this.path + '/window.js', windowX.toString(), windowY.toString()]
                });
                this.proc.init(null);
            } catch (e) {
                log('Failed to create subprocess: ' + e.message);
                this.starting = false;
                return;
            }

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