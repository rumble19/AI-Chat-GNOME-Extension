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

1. **Download** the `.zip` file from the [repository](./-/tree/master) or [Releases](./-/releases).
2. **Extract** the folder:
    ```
    chatgpt-gnome-desktop@chatgpt-gnome-desktop
    ```
3. **Move** the folder into your GNOME extensions directory:
    ```bash
    mkdir -p ~/.local/share/gnome-shell/extensions/
    mv chatgpt-gnome-desktop@chatgpt-gnome-desktop ~/.local/share/gnome-shell/extensions/
    ```
4. **Restart GNOME Shell**:
   - On **X11**: Press `Alt` + `F2`, type `r`, and press Enter.
   - On **Wayland**: Log out and log back in.

5. **Enable the extension** using:
   - **GNOME Tweaks** or **Extension Manager**
   - Or via terminal:
     ```bash
     gnome-extensions enable chatgpt-gnome-desktop@chatgpt-gnome-desktop
     ```

---

## 📜 License

This project is distributed under the [MIT License](./LICENSE).

- Original author: **Rafal Mioduszewski**
- Modified and improved by: **Peter Garza**

---![Screenshot from 2025-05-21 02-05-07](https://github.com/user-attachments/assets/fefcfdc5-7495-423f-b867-bdeaa24c837f)


## 💬 Feedback

Suggestions, improvements, or bug reports are welcome.  
Feel free to open an issue or submit a merge request!
