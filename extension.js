import GObject from "gi://GObject";
import Gio from "gi://Gio";
import GLib from "gi://GLib";
import St from "gi://St";
import Clutter from "gi://Clutter";

import {
  Extension,
  gettext as _,
} from "resource:///org/gnome/shell/extensions/extension.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";

const AIChatIndicator = GObject.registerClass(
  class AIChatIndicator extends PanelMenu.Button {
    _init(extension) {
      super._init(0.0, _("AI Chat"));

      this._extension = extension;
      this._settings = extension.getSettings();
      this._process = null;

      // Create icon
      const iconPath = `${extension.path}/icons/chatgpt_icon.png`;
      const gicon = Gio.icon_new_for_string(iconPath);

      this.add_child(
        new St.Icon({
          gicon: gicon,
          style_class: "system-status-icon",
          icon_size: 20,
        })
      );

      // Create menu items
      this._createMenu();
    }

    // Helper to check if the window process is running
    _isWindowOpen() {
        // Simple approach: check if we have a process reference
        // If the user closed the window, we'll find out when we try to interact with it
        return this._process !== null;
    }

    // Override the default event handling to control when menu shows
    vfunc_event(event) {
      if (event.type() === Clutter.EventType.BUTTON_PRESS) {
        const button = event.get_button();

        if (button === 1) {
          // Left click
          this._toggleWindow();
          return Clutter.EVENT_STOP; // Don't show menu
        } else if (button === 3) {
          // Right click
          this.menu.toggle(); // Show menu
          return Clutter.EVENT_STOP;
        }
      }

      // Let parent handle other events
      return super.vfunc_event(event);
    }

    _createMenu() {
      // Restart option
      const restartItem = new PopupMenu.PopupMenuItem(_("Restart"));
      restartItem.connect("activate", () => this._restartWindow());
      this.menu.addMenuItem(restartItem);

      // Separator
      this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

      // Preferences
      const prefsItem = new PopupMenu.PopupMenuItem(_("Preferences"));
      prefsItem.connect("activate", () => this._extension.openPreferences());
      this.menu.addMenuItem(prefsItem);
    }

    _toggleWindow() {
        console.log("AI Chat: Toggling window.");

        if (this._isWindowOpen()) {
            console.log("AI Chat: Window process exists, killing it.");
            this._killWindow();
        } else {
            console.log("AI Chat: No window process, starting one.");
            this._startWindow();
        }
    }

    _startWindow() {
        console.log("AI Chat: Starting new window");

        try {
            // Get settings
            const windowWidth = this._settings.get_int("window-width");
            const windowHeight = this._settings.get_int("window-height");
            const chatUrl = this._settings.get_string("chat-url");

            console.log(`AI Chat: Window size: ${windowWidth}x${windowHeight}, URL: ${chatUrl}`);

            // Use simple spawn approach - no complex subprocess tracking
            const launcher = new Gio.SubprocessLauncher({
                flags: Gio.SubprocessFlags.NONE,
            });

            // Create subprocess with -m flag for ES modules
            this._process = launcher.spawnv([
                "gjs",
                "-m",
                `${this._extension.path}/window.js`,
                "0", // x position (window manager will handle)
                "0", // y position (window manager will handle)
                windowWidth.toString(),
                windowHeight.toString(),
                chatUrl,
            ]);

            // Simple cleanup when process exits
            this._process.wait_async(null, () => {
                console.log("AI Chat: Window process exited");
                this._process = null;
            });

        } catch (e) {
            console.error(`AI Chat: Failed to start window: ${e.message}`);
            this._process = null;
        }
    }

    _killWindow() {
        console.log("AI Chat: Killing window process");

        if (this._process) {
            try {
                this._process.force_exit();
                console.log("AI Chat: Kill signal sent");
            } catch (e) {
                console.log(`AI Chat: Error killing process: ${e.message}`);
            }
            this._process = null;
        } else {
            console.log("AI Chat: No process to kill");
        }
    }

    _restartWindow() {
        console.log("AI Chat: Restarting window");
        this._killWindow();
        
        // Short delay before restart
        GLib.timeout_add(GLib.PRIORITY_DEFAULT, 500, () => {
            this._startWindow();
            return GLib.SOURCE_REMOVE;
        });
    }

    destroy() {
      console.log("AI Chat: Destroying indicator");
      this._killWindow();
      this._process = null;
      this._settings = null;
      this._extension = null;
      super.destroy();
    }
  }
);

export default class AIChatGnomeExtension extends Extension {
  enable() {
    console.log(`${this.metadata.name} enabled`);
    this._indicator = new AIChatIndicator(this);
    Main.panel.addToStatusArea(this.uuid, this._indicator);
  }

  disable() {
    console.log(`${this.metadata.name} disabled`);
    this._indicator?.destroy();
    this._indicator = null;
  }
}
