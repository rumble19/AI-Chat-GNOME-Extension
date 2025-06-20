import Gio from "gi://Gio";
import Adw from "gi://Adw";
import Gtk from "gi://Gtk?version=4.0";

import {
  ExtensionPreferences,
  gettext as _,
} from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

export default class AIChatPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    // Create a preferences page
    const page = new Adw.PreferencesPage({
      title: _("General"),
      icon_name: "dialog-information-symbolic",
    });
    window.add(page);

    // Window Settings Group
    const windowGroup = new Adw.PreferencesGroup({
      title: _("Window Settings"),
      description: _("Configure the AI chat window appearance and behavior"),
    });
    page.add(windowGroup);

    // Window Width
    const widthRow = new Adw.SpinRow({
      title: _("Window Width"),
      subtitle: _("Default width for the AI chat window"),
      adjustment: new Gtk.Adjustment({
        lower: 400,
        upper: 2000,
        step_increment: 50,
        page_increment: 100,
      }),
    });
    windowGroup.add(widthRow);

    // Window Height
    const heightRow = new Adw.SpinRow({
      title: _("Window Height"),
      subtitle: _("Default height for the AI chat window"),
      adjustment: new Gtk.Adjustment({
        lower: 300,
        upper: 1500,
        step_increment: 50,
        page_increment: 100,
      }),
    });
    windowGroup.add(heightRow);

    // Chat Service Group
    const serviceGroup = new Adw.PreferencesGroup({
      title: _("Chat Service"),
      description: _("Configure which AI chat service to use"),
    });
    page.add(serviceGroup);

    // Chat URL
    const urlRow = new Adw.EntryRow({
      title: _("Chat Service URL"),
      text: "https://chat.openai.com/chat",
    });
    serviceGroup.add(urlRow);

    // Behavior Settings Group
    const behaviorGroup = new Adw.PreferencesGroup({
      title: _("Behavior"),
      description: _("Configure extension behavior"),
    });
    page.add(behaviorGroup);

    // Auto-restart toggle
    const autoRestartRow = new Adw.SwitchRow({
      title: _("Auto-restart after reload"),
      subtitle: _("Automatically open a new window after restarting the extension"),
    });
    behaviorGroup.add(autoRestartRow);

    // Position memory toggle
    const positionMemoryRow = new Adw.SwitchRow({
      title: _("Remember window position"),
      subtitle: _("Remember the last window position (limited support on Wayland)"),
    });
    behaviorGroup.add(positionMemoryRow);

    // About Group
    const aboutGroup = new Adw.PreferencesGroup({
      title: _("About"),
    });
    page.add(aboutGroup);

    // Version info - use version-name as recommended by GNOME docs
    const version = this.metadata["version-name"] || this.metadata.version || "Unknown";
    const versionRow = new Adw.ActionRow({
      title: _("Version"),
      subtitle: version.toString(),
    });
    aboutGroup.add(versionRow);

    // GitHub link
    const githubRow = new Adw.ActionRow({
      title: _("Source Code"),
      subtitle: _("View on GitHub"),
      activatable: true,
    });

    githubRow.add_suffix(
      new Gtk.Image({
        icon_name: "adw-external-link-symbolic",
      })
    );

    githubRow.connect("activated", () => {
      try {
        const url =
          this.metadata.url || "https://github.com/rumble19/AI-Chat-GNOME-Extension";
        Gtk.show_uri(window, url, 0);
      } catch (e) {
        console.error("Failed to open URL:", e);
      }
    });

    aboutGroup.add(githubRow);

    // Get settings and bind properties
    window._settings = this.getSettings();

    // Bind settings to UI elements
    window._settings.bind(
      "window-width",
      widthRow,
      "value",
      Gio.SettingsBindFlags.DEFAULT
    );

    window._settings.bind(
      "window-height",
      heightRow,
      "value",
      Gio.SettingsBindFlags.DEFAULT
    );

    window._settings.bind("chat-url", urlRow, "text", Gio.SettingsBindFlags.DEFAULT);

    window._settings.bind(
      "auto-start-after-restart",
      autoRestartRow,
      "active",
      Gio.SettingsBindFlags.DEFAULT
    );

    window._settings.bind(
      "enable-position-memory",
      positionMemoryRow,
      "active",
      Gio.SettingsBindFlags.DEFAULT
    );
  }
}
