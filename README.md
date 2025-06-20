# AI Chat for GNOME Desktop

A community-improved version of the original [ChatGPT GNOME Extension](https://github.com/HorrorPills/ChatGPT-Gnome-Desktop-Extension) by **Rafal Mioduszewski**.

This extension lets you launch AI Chat services from your GNOME desktop as a standalone window — now with proper sizing, and window controls.

---

## 🔧 Features & Fixes

- 🪟 Resizable, desktop-friendly window (no more mobile-size issue)
- 🛑 Added minimize and close buttons
- 🖥️ Updated support for GNOME Shell 45–48
- 🧹 Cleaner metadata and improved layout
- 🔄 Reliable window toggle functionality
- 🍪 Persistent cookie storage for login sessions
- ⚙️ Configurable window size and chat URL
- ✅ Ready for use in modern Linux distros

---

## 📦 Installation

### Method 1: Download Release (Recommended)

1. **Download the latest release**
   - Go to the [Releases page](https://github.com/rumble19/AI-Chat-GNOME-Extension/releases)
   - Download the `.zip` file from the latest release

2. **Install the extension**
   ```bash
   # Extract to extensions directory
   unzip ai-chat-gnome@rumble19.gmail.com-v*.zip -d ~/.local/share/gnome-shell/extensions/
   
   # Restart GNOME Shell
   # On X11: Alt+F2, type 'r', press Enter
   # On Wayland: Log out and back in
   
   # Enable the extension
   gnome-extensions enable ai-chat-gnome@rumble19.gmail.com
   ```

### Method 2: Development Install (Git Clone)

```bash
# Clone the repository directly to your extensions directory
git clone https://github.com/rumble19/AI-Chat-GNOME-Extension.git ~/.local/share/gnome-shell/extensions/ai-chat-gnome@rumble19.gmail.com

# Compile schemas
cd ~/.local/share/gnome-shell/extensions/ai-chat-gnome@rumble19.gmail.com/schemas
glib-compile-schemas .

# Enable the extension
gnome-extensions enable ai-chat-gnome@rumble19.gmail.com

# Restart GNOME Shell (Alt+F2, type 'r', press Enter) or log out/in if on Wayland
```

---

## ⚙️ Configuration

Access extension preferences through:
- GNOME Extensions app
- Command line: `gnome-extensions prefs ai-chat-gnome@rumble19.gmail.com`

### Settings
- **Chat URL**: Configure which AI service to use (default: ChatGPT)
- **Window Size**: Set preferred window dimensions
- **Cookie Storage**: Automatic persistent login sessions

---

## 🚀 Usage

- **Left click** the panel icon to toggle the chat window
- **Right click** the panel icon for options menu

---

## 🛠️ Development

### Creating Releases

```bash
# Run the release script
./scripts/create-release.sh

# Or manually create a release by pushing a tag
git tag v0.2.1
git push origin v0.2.1
```

The GitHub Actions workflow will automatically create a release with the properly packaged zip file.

---

## 📜 License

This project is distributed under the [MIT License](./LICENSE).

- Original author: **Rafal Mioduszewski**
- Modified and improved by the community.


## 💬 Feedback

Suggestions, improvements, or bug reports are welcome.  
Feel free to open an issue or submit a merge request!

