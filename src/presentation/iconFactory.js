"use strict";

const { Gio, St } = imports.gi;

/**
 * @param {string} name
 * @param {string} size
 */
/* exported buildFromName */
var buildFromName = (name, size) => {
    return new St.Icon({ icon_name: name, icon_size: size });
};

/**
 * @param {string} path
 * @param {string} size
 * @param {boolean} style
 */
/* exported buildFromPath */
var buildFromPath = (path, size, style) => {
    const icon = Gio.icon_new_for_string(path);
    return new St.Icon({ gicon: icon, icon_size: size, style_class: style });
};
