import GObject from "gi://GObject";
import Gio from "gi://Gio";
import * as Main from "resource:///org/gnome/shell/ui/main.js";

// import {
//   gettext as _,
// } from "resource:///org/gnome/shell/extensions/extension.js";
import {
  QuickToggle,
  SystemIndicator,
} from "resource:///org/gnome/shell/ui/quickSettings.js";

const VolumeBoostToggle = GObject.registerClass(
  class VolumeBoostToggle extends QuickToggle {
    constructor() {
      super({
        title: "Boost Volume",
        iconName: "org.gnome.Settings-sound-symbolic",
        toggleMode: true,
      });
      this._soundSettings = new Gio.Settings({
        schema_id: "org.gnome.desktop.sound",
      });
      this._soundSettings.bind(
          
        "allow-volume-above-100-percent",
        this,
        "checked",
        Gio.SettingsBindFlags.DEFAULT
      );
    }
  }
);

const Indicator = GObject.registerClass(
  class Indicator extends SystemIndicator {
    constructor() {
      super();
      const toggle = new VolumeBoostToggle();
      this.quickSettingsItems.push(toggle);
    }
  }
);

export class VolumeBooster {
    constructor() {
        this._indicator = null;
    }
  
    enable() {
      this._indicator = new Indicator();
      Main.panel.statusArea.quickSettings.addExternalIndicator(this._indicator);
    }
  
    disable() {
      if(this._indicator) {
        const soundSettings = new Gio.Settings({
          schema_id: "org.gnome.desktop.sound",
        });
        soundSettings.set_boolean('allow-volume-above-100-percent', false);
        this._indicator.quickSettingsItems.forEach((item) => item.destroy());
        this._indicator.destroy();
        this._indicator = null;
      }
    }
}