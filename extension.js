import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";

import Settings from "./src/data/settings.js";
import { MenuView } from "./src/presentation/views.js";

export default class SerMonExtension extends Extension {
    constructor(metadata) {
        super(metadata);
    }

    enable() {
        this._settings = new Settings(this);
        this._menu = new MenuView();
        Main.panel.addToStatusArea("sermon-menu", this._menu);
    }

    disable() {
        this._menu.destroy();
        this._menu = null;
        this._settings.destroy();
        this._settings = null;
    }
}
