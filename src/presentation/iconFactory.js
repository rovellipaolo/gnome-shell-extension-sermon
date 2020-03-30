"use strict";

const { Gio, St } = imports.gi;

/**
 * @param {string} path 
 * @param {string} size 
 * @param {boolean} style 
 */
/* exported build */
var build = (path, size, style) => {
    const icon = Gio.icon_new_for_string(path);
    return new St.Icon({ gicon: icon, icon_size: size, style_class: style });
};
