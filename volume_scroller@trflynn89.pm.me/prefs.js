import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class VolumeScrollerPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        // Create a preferences page
        const page = new Adw.PreferencesPage();
        const group = new Adw.PreferencesGroup();
        page.add(group);

        // Create a row for volume step
        const row = new Adw.ActionRow({
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
        row.add_suffix(scale);
        row.set_activatable(false);

        // Add row to the group
        group.add(row);

        // Add the page to the window
        window.add(page);
    }
}