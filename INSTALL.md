# Installation Instructions for AI Chat GNOME Extension

## Prerequisites

- GNOME Shell 45+ (for ES modules support)
- `glib-compile-schemas` (usually included with GNOME)

## Installation Steps

### 1. Clone and Install Extension

```bash
# Clone the repository to your extensions directory
git clone https://github.com/rumble19/AI-Chat-GNOME-Extension.git ~/.local/share/gnome-shell/extensions/ai-chat-gnome@ai-chat-gnome

cd ~/.local/share/gnome-shell/extensions/ai-chat-gnome@ai-chat-gnome
```

### 2. Compile GSettings Schema

This step is **crucial** for the extension to work properly:

```bash
# Compile the settings schema
glib-compile-schemas ~/.local/share/gnome-shell/extensions/ai-chat-gnome@ai-chat-gnome/schemas/
```

### 3. Enable the Extension

```bash
# Enable the extension
gnome-extensions enable ai-chat-gnome@ai-chat-gnome
```

### 4. Restart GNOME Shell

- On **X11**: Press `Alt+F2`, type `r`, and press Enter
- On **Wayland**: Log out and log back in

## Verification

After installation, you should see:

1. A ChatGPT icon in your top panel
2. The extension listed in GNOME Extensions app
3. Preferences accessible via right-click menu or Extensions app

## Troubleshooting

### Extension Not Loading
```bash
# Check for errors in the logs
journalctl -f -o cat /usr/bin/gnome-shell
```

### Settings Not Working
```bash
# Verify schema compilation
ls ~/.local/share/gnome-shell/extensions/ai-chat-gnome@ai-chat-gnome/schemas/gschemas.compiled

# If missing, recompile:
glib-compile-schemas ~/.local/share/gnome-shell/extensions/ai-chat-gnome@ai-chat-gnome/schemas/
```

### Window Won't Open
- Check if `gjs` is installed: `which gjs`
- Verify all files are present in the extension directory
- Check GNOME Shell version compatibility

## Development

For development, you can monitor extension activity:

```bash
# Watch for extension-related logs
journalctl -f -o cat | grep -i "ai.*chat"
```

## Uninstalling

```bash
# Disable the extension
gnome-extensions disable ai-chat-gnome@ai-chat-gnome

# Remove extension files
rm -rf ~/.local/share/gnome-shell/extensions/ai-chat-gnome@ai-chat-gnome
```