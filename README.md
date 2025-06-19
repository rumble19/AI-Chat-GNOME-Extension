# ChatGPT for GNOME Desktop (Enhanced Edition)

A community-improved version of the original [ChatGPT GNOME Extension](https://github.com/HorrorPills/ChatGPT-Gnome-Desktop-Extension) by **Rafal Mioduszewski**.

This extension lets you launch ChatGPT from your GNOME desktop as a standalone window — now with proper sizing and window controls.

---

## 🔧 Features & Fixes

- 🪟 Resizable, desktop-friendly window (no more mobile-size issue)
- 🛑 Added minimize and close buttons
- 🖥️ Updated support for GNOME Shell 41–48
- 🧹 Cleaner metadata and improved layout
- ✅ Ready for use in modern Linux distros (AnduinOS, openSUSE Tumbleweed, etc.)

---

## 🧪 Installation

### Method 1: Git Clone (Recommended)

```bash
# Clone the repository directly to your extensions directory
git clone https://github.com/rumble19/ChatGPT-GNOME-Extension.git ~/.local/share/gnome-shell/extensions/chatgpt-gnome-desktop@chatgpt-gnome-desktop

# Enable the extension
gnome-extensions enable chatgpt-gnome-desktop@chatgpt-gnome-desktop

# Restart GNOME Shell (Alt+F2, type 'r', press Enter) or log out/in
```

### Method 2: Manual Download

1. **Download the repository** as a ZIP file from GitHub or from the [Releases](../../releases) section
2. **Extract the files** to the correct location:

```bash
# Create extensions directory if it doesn't exist
mkdir -p ~/.local/share/gnome-shell/extensions/

# Extract to the correct folder name
unzip ChatGPT-GNOME-Extension-main.zip
mv ChatGPT-GNOME-Extension-main ~/.local/share/gnome-shell/extensions/chatgpt-gnome-desktop@chatgpt-gnome-desktop
```

3. **Enable the extension**:
```bash
gnome-extensions enable chatgpt-gnome-desktop@chatgpt-gnome-desktop
```

4. **Restart GNOME Shell**:
   - On Wayland: Log out and log back in
   - On X11: Press Alt+F2, type `r`, and press Enter

---

## 📜 License

This project is distributed under the [MIT License](./LICENSE).

- Original author: **Rafal Mioduszewski**
- Modified and improved by the community.




## 💬 Feedback

Suggestions, improvements, or bug reports are welcome.  
Feel free to open an issue or submit a merge request!

