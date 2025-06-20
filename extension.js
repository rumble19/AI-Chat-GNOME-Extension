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
      this._isStarting = false;

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

      // Override default click behavior
      // We'll handle this in vfunc_event instead
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
      // Just Preferences - keep it simple
      const prefsItem = new PopupMenu.PopupMenuItem(_("Preferences"));
      prefsItem.connect("activate", () => this._extension.openPreferences());
      this.menu.addMenuItem(prefsItem);
    }

    _toggleWindow() {
      if (!this._process && !this._isStarting) {
        this._startWindow();
      } else {
        this._killWindow();
      }
    }

    _startWindow() {
      if (this._isStarting) return;

      this._isStarting = true;

      try {
        // Get button position for window placement hint
        const [x, y] = this.get_transformed_position();
        const [width, height] = this.get_size();

        // Get settings
        const windowWidth = this._settings.get_int("window-width");
        const windowHeight = this._settings.get_int("window-height");
        const chatUrl = this._settings.get_string("chat-url");

        // Calculate window position (below button)
        const windowX = x;
        const windowY = y + height;

        console.log(`Starting AI Chat window at ${windowX}, ${windowY}`);

        // Create subprocess
        this._process = new Gio.Subprocess({
          argv: [
            "gjs",
            "-m",
            `${this._extension.path}/window.js`,
            windowX.toString(),
            windowY.toString(),
            windowWidth.toString(),
            windowHeight.toString(),
            chatUrl,
          ],
        });

        this._process.init(null);

        // Handle process completion
        this._process.wait_async(null, (proc, res) => {
          try {
            this._process.wait_finish(res);
            console.log("AI Chat window closed");
          } catch (e) {
            console.error(`AI Chat window error: ${e.message}`);
          }

          this._process = null;
          this._isStarting = false;
        });
      } catch (e) {
        console.error(`Failed to start AI Chat window: ${e.message}`);
        this._isStarting = false;
      }
    }

    _killWindow() {
      if (this._process) {
        try {
          this._process.force_exit();
          console.log("AI Chat window terminated");
        } catch (e) {
          console.error(`Failed to terminate window: ${e.message}`);
        }
      }
    }

    destroy() {
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
