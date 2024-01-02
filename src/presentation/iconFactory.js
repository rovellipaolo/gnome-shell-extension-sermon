import Gio from "gi://Gio";
import GLib from "gi://GLib";
import St from "gi://St";

/**
 * @param {string} name
 * @param {string} size
 */
export const buildFromName = (name, size) => {
    return new St.Icon({
        icon_name: name,
        icon_size: size,
        reactive: true,
        track_hover: true,
    });
};

/**
 * @param {string} path
 * @param {string} size
 * @param {boolean} style
 */
export const buildFromPath = (path, size, style) => {
    const basePath = GLib.path_get_dirname(import.meta.url);
    const icon = Gio.icon_new_for_string(`${basePath}/../../${path}`);
    return new St.Icon({ gicon: icon, icon_size: size, style_class: style });
};
