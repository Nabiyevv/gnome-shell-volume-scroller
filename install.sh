#!/bin/bash

# Define paths
EXTENSION_NAME="volume_scroller@nabiyevv.com"
EXTENSION_PATH="$HOME/.local/share/gnome-shell/extensions/$EXTENSION_NAME"

# Create extensions directory if it doesn't exist
mkdir -p "$HOME/.local/share/gnome-shell/extensions"

# Remove existing extension if it exists
rm -rf "$EXTENSION_PATH"

# Copy extension files
cp -r "$EXTENSION_NAME" "$HOME/.local/share/gnome-shell/extensions/"

# Compile schemas
glib-compile-schemas "$EXTENSION_PATH/schemas/"

echo "Installation complete! Please restart GNOME Shell:"
echo "- Log out and log back in, or"
echo "- Press Alt+F2, type 'r', and press Enter (on X11)"