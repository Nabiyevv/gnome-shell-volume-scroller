import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class VolumeScrollerPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        // Create a preferences page
        const page = new Adw.PreferencesPage();
        const group = new Adw.PreferencesGroup();
        page.add(group);

        // Create a row for volume step
        const volumeRow = new Adw.ActionRow({
            title: 'Volume Change Step',
            subtitle: 'The amount to change volume when scrolling (1-20%)',
        });

        // Create the volume step adjustment
        const adjustment = new Gtk.Adjustment({
            lower: 1,  // Show as percentage (1-20 instead of 0.01-0.2)
            upper: 20,
            step_increment: 1,
        });

        const scale = new Gtk.Scale({
            adjustment,
            orientation: Gtk.Orientation.HORIZONTAL,
            width_request: 200,
            value_pos: Gtk.PositionType.RIGHT,
            digits: 0,
            draw_value: true,
        });

        // Set initial value and handle changes
        scale.set_value(settings.get_double('volume-step') * 100);
        scale.connect('value-changed', (widget) => {
            settings.set_double('volume-step', widget.get_value() / 100);
        });

        // Add scale to the row
        volumeRow.add_suffix(scale);
        volumeRow.set_activatable(false);
        group.add(volumeRow);

        // Create a row for scroll direction toggle
        const directionRow = new Adw.ActionRow({
            title: 'Inverse Scroll Direction',
            subtitle: 'When enabled, scroll up decreases volume and scroll down increases volume',
        });

        const toggle = new Gtk.Switch({
            active: settings.get_boolean('inverse-scrolling'),
            valign: Gtk.Align.CENTER,
        });

        // Bind the toggle to the settings
        settings.bind(
            'inverse-scrolling',
            toggle,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );

        // Add toggle to the row
        directionRow.add_suffix(toggle);
        directionRow.set_activatable(true);
        directionRow.set_activatable_widget(toggle);
        group.add(directionRow);
        
        
        // Create a row for horizontal scrolling toggle
        const horizontalRow = new Adw.ActionRow({
            title: 'Enable Horizontal Scrolling',
            subtitle: 'When enabled, allows horizontal scrolling to change volume',
        });

        const horizontalToggle = new Gtk.Switch({
            active: settings.get_boolean('horizontal-scrolling'),
            valign: Gtk.Align.CENTER,
        });

        // Bind the toggle to the settings
        settings.bind(
            'horizontal-scrolling',
            horizontalToggle,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );

        // Add toggle to the row
        horizontalRow.add_suffix(horizontalToggle);
        horizontalRow.set_activatable(true);
        horizontalRow.set_activatable_widget(horizontalToggle);
        group.add(horizontalRow);

        // Add the page to the window
        window.add(page);
    }
}