import Clutter from "gi://Clutter";
import Gio from "gi://Gio";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import * as Volume from "resource:///org/gnome/shell/ui/status/volume.js";

import {VolumeBooster} from "./volumeBooster.js";

const VolumeScrollerIcons = [
    "audio-volume-muted-symbolic",
    "audio-volume-low-symbolic",
    "audio-volume-medium-symbolic",
    "audio-volume-high-symbolic",
];

export default class VolumeScroller {
    constructor() {
        this.controller = Volume.getMixerControl();
        this.panel = Main.panel;

        this.enabled = false;
        this.sink = null;
        
        this.volumeBooster = null;

        this.volume_max = this.controller.get_vol_max_norm();

        this.settings = this._get_settings();
        this.volume_step =
            this.settings.get_double("volume-step") * this.volume_max;
        this.inverse_scrolling = this.settings.get_boolean("inverse-scrolling");
        this.horizontal_scrolling = this.settings.get_boolean(
            "horizontal-scrolling",
        );

        this.scroll_binding = null;
        this.sink_binding = null;
        this.settings_binding = null;
        this.direction_binding = null;
    }

    _get_settings() {
        let dir = import.meta.url.slice(7); // Remove 'file://' prefix
        dir = dir.slice(0, dir.lastIndexOf("/"));

        let source = Gio.SettingsSchemaSource.new_from_directory(
            dir + "/schemas",
            Gio.SettingsSchemaSource.get_default(),
            false,
        );

        let schema = source.lookup(
            "org.gnome.shell.extensions.volume-scroller",
            true,
        );
        return new Gio.Settings({ settings_schema: schema });
    }

    enable() {
        if (this.enabled) {
            this.disable();
        }

        this.enabled = true;
        this.sink = this.controller.get_default_sink();

        this.scroll_binding = this.panel.connect(
            "scroll-event",
            (actor, event) => this._handle_scroll(actor, event),
        );

        this.sink_binding = this.controller.connect(
            "default-sink-changed",
            (controller, id) => this._handle_sink_change(controller, id),
        );

        this.settings_binding = this.settings.connect(
            "changed::volume-step",
            () => this._handle_settings_change(),
        );

        this.direction_binding = this.settings.connect(
            "changed::inverse-scrolling",
            () => this._handle_direction_change(),
        );

        this.middle_click_binding = this.panel.connect(
            "button-press-event",
            (actor, event) => this._handle_middle_click(actor, event),
        );

        this.horizontal_change_binding = this.settings.connect(
            "changed::horizontal-scrolling",
            () => this._handle_horizontal_change(),
        );
        
        this.volumeBooster = new VolumeBooster();
        this.volumeBooster.enable();
    }

    disable() {
        if (this.enabled) {
            this.enabled = false;
            this.sink = null;

            this.panel.disconnect(this.scroll_binding);
            this.scroll_binding = null;

            this.controller.disconnect(this.sink_binding);
            this.sink_binding = null;

            this.settings.disconnect(this.settings_binding);
            this.settings_binding = null;

            if (this.direction_binding !== null) {
                this.settings.disconnect(this.direction_binding);
                this.direction_binding = null;
            }

            this.panel.disconnect(this.middle_click_binding);
            this.middle_click_binding = null;
        }
        
        
        this.volumeBooster.disable();
    }

    _handle_settings_change() {
        this.volume_step =
            this.settings.get_double("volume-step") * this.volume_max;
    }

    _handle_direction_change() {
        this.inverse_scrolling = this.settings.get_boolean("inverse-scrolling");
    }

    _handle_horizontal_change() {
        this.horizontal_scrolling = this.settings.get_boolean(
            "horizontal-scrolling",
        );
    }

    _handle_scroll(actor, event) {
        let volume = this.sink.volume;
        let direction = event.get_scroll_direction();

        if (this.inverse_scrolling) {
            if (this.horizontal_scrolling) {
                if (direction === Clutter.ScrollDirection.LEFT)
                    volume -= this.volume_step;
                else if (direction === Clutter.ScrollDirection.RIGHT)
                    volume += this.volume_step;
                else return Clutter.EVENT_PROPAGATE;
            } else {
                if (direction === Clutter.ScrollDirection.UP)
                    volume += this.volume_step;
                else if (direction === Clutter.ScrollDirection.DOWN)
                    volume -= this.volume_step;
                else return Clutter.EVENT_PROPAGATE;
            }
        } else {
            if (this.horizontal_scrolling) {
                if (direction === Clutter.ScrollDirection.LEFT)
                    volume += this.volume_step;
                else if (direction === Clutter.ScrollDirection.RIGHT)
                    volume -= this.volume_step;
                else return Clutter.EVENT_PROPAGATE;
            } else {
                if (direction === Clutter.ScrollDirection.UP)
                    volume -= this.volume_step;
                else if (direction === Clutter.ScrollDirection.DOWN)
                    volume += this.volume_step;
                else return Clutter.EVENT_PROPAGATE;
            }
        }

        volume = Math.min(volume, this.volume_max);
        volume = Math.max(volume, 0);

        this.sink.volume = volume;
        this.sink.push_volume();

        this._show_volume(volume);

        return Clutter.EVENT_STOP;
    }

    _handle_sink_change(controller, id) {
        this.sink = controller.lookup_stream_id(id);
    }

    _handle_middle_click(actor, event) {
        const button = event.get_button();
        if (button === Clutter.BUTTON_MIDDLE) {
            let isMuted = this.sink.get_is_muted();
            isMuted = !isMuted;

            this.sink.change_is_muted(isMuted);

            if (isMuted) this._show_volume(0);
            else this._show_volume(this.sink.volume);

            return Clutter.EVENT_STOP;
        }
        return Clutter.EVENT_PROPAGATE;
    }

    _show_volume(volume) {
        // log("VolumeScroller showing volume " + volume);
        const percentage = volume / this.volume_max;
        let n;

        if (volume === 0) {
            n = 0;
        } else {
            n = Math.floor(3 * percentage + 1);
            n = Math.max(1, n);
            n = Math.min(3, n);
        }

        const monitor = -1; // Display volume window on all monitors.
        const icon = Gio.Icon.new_for_string(VolumeScrollerIcons[n]);
        const label = this.sink.get_port().human_port;

        Main.osdWindowManager.show(monitor, icon, label, percentage);
    }
}

let volumeScroller = null;
// let volumeBooster = null;

export function enable() {
    volumeScroller = new VolumeScroller();
    volumeScroller.enable();

    // volumeBooster = new VolumeBooster(); 
    // volumeBooster.enable();
}

export function disable() {
    if (volumeScroller !== null) {
        volumeScroller.disable();
        volumeScroller = null;
    }
    
    // if (volumeBooster !== null) {
    //     volumeBooster.disable();
    //     volumeBooster = null;
    // }
}
