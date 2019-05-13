"use strict";

const Main = imports.ui.main;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const { MenuView } = Me.imports.src.presentation.view.menu;

let _menu;

/** Triggered when the extension is initialized. */
/* exported init */
const init = () => {
    // Nothing to do...
};

/** Triggered when the extension is enabled. */
/* exported enable */
const enable = () => {
    _menu = new MenuView();
    Main.panel.addToStatusArea("sermon-menu", _menu);
};

/** Triggered when the extension is disabled. */
/* exported disable */
const disable = () => {
    _menu.destroy();
};
