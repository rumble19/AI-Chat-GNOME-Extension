#!/bin/bash

# AI Chat GNOME Extension Release Script
# This script creates a proper zip file for GNOME extension releases

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Read version from metadata.json
VERSION=$(grep '"version-name"' "$PROJECT_DIR/metadata.json" | sed 's/.*"version-name": "\([^"]*\)".*/\1/')
UUID=$(grep '"uuid"' "$PROJECT_DIR/metadata.json" | sed 's/.*"uuid": "\([^"]*\)".*/\1/')

echo "Creating release for version: $VERSION"
echo "Extension UUID: $UUID"

# Create temporary directory for release
TEMP_DIR=$(mktemp -d)
RELEASE_DIR="$TEMP_DIR/$UUID"
mkdir -p "$RELEASE_DIR"

echo "Copying extension files..."

# Copy main extension files
cp "$PROJECT_DIR"/*.js "$RELEASE_DIR/"
cp "$PROJECT_DIR/metadata.json" "$RELEASE_DIR/"

# Copy icons
if [ -d "$PROJECT_DIR/icons" ]; then
    cp -r "$PROJECT_DIR/icons" "$RELEASE_DIR/"
fi

# Copy localization files
if [ -d "$PROJECT_DIR/po" ]; then
    cp -r "$PROJECT_DIR/po" "$RELEASE_DIR/"
fi

# Copy and compile schemas
if [ -d "$PROJECT_DIR/schemas" ]; then
    cp -r "$PROJECT_DIR/schemas" "$RELEASE_DIR/"
    # Compile schemas
    if command -v glib-compile-schemas >/dev/null 2>&1; then
        echo "Compiling GSettings schemas..."
        glib-compile-schemas "$RELEASE_DIR/schemas/"
    else
        echo "Warning: glib-compile-schemas not found. Schemas may need manual compilation."
    fi
fi

# Create release directory if it doesn't exist
RELEASES_DIR="$PROJECT_DIR/releases"
mkdir -p "$RELEASES_DIR"

# Create zip file
ZIP_NAME="$UUID-v$VERSION.zip"
ZIP_PATH="$RELEASES_DIR/$ZIP_NAME"

echo "Creating zip file: $ZIP_NAME"
cd "$TEMP_DIR"
zip -r "$ZIP_PATH" "$UUID"

# Clean up
rm -rf "$TEMP_DIR"

echo "Release created successfully!"
echo "File: $ZIP_PATH"
echo ""
echo "To test the release:"
echo "1. unzip '$ZIP_PATH' -d ~/.local/share/gnome-shell/extensions/"
echo "2. gnome-extensions enable $UUID"
echo ""
echo "Upload this zip file to your GitHub release."
