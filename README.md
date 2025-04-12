# ARCHIVED

This project is archived as I no longer use GNOME myself.

# Volume Scroller for GNOME Shell

Use the mouse wheel on the GNOME Top Bar to increase or decrease volume. Features include:
- Scroll up/down to adjust volume
- Customizable volume step (1-20%)
- Option to inverse scroll direction
- Visual feedback with volume level indicator

Available for download on [GNOME Shell Extensions](https://extensions.gnome.org/extension/4109/volume-scroller/).

## Installation

### Automatic Installation
Clone this repository and run the install script:

```bash
git clone https://github.com/Nabiyevv/gnome-shell-volume-scroller.git
cd gnome-shell-volume-scroller
./install.sh
```

### Manual Installation

Download the [latest release](https://github.com/Nabiyevv/gnome-shell-volume-scroller/releases)
and extract the downloaded archive to the GNOME Shell Extensions path:

```bash
unzip volume_scroller@nabiyevv.com.[version].shell-extension.zip -d volume_scroller@nabiyevv.com
mv volume_scroller@nabiyevv.com ~/.local/share/gnome-shell/extensions
```

After installation by either method, restart GNOME Shell:
- On X11: Press Alt+F2, type 'r', and press Enter
- On Wayland: Log out and log back in
