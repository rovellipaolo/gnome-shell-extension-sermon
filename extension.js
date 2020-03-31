"use strict";

const Main = imports.ui.main;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const { MenuView } = Me.imports.src.presentation.views;

let _menu;

/** Triggered when the extension is initialized. */
/* exported init */
var init = () => {
    // Nothing to do...
};

/** Triggered when the extension is enabled. */
/* exported enable */
var enable = () => {
    _menu = new MenuView();
    Main.panel.addToStatusArea("sermon-menu", _menu);
};

/** Triggered when the extension is disabled. */
/* exported disable */
var disable = () => {
    _menu.destroy();
};
