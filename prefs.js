"use strict";

const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const Convenience = Me.imports.src.util.convenience;

/** Triggered after the file is loaded but before the buildPrefsWidget. */
/* exported init */
const init = () => {
}

/** Triggered when opening the extension preferences widget. */
/* exported buildPrefsWidget */
const buildPrefsWidget = () => {
    const builder = _getWidgetBuilder();
    _bindWidgetToSettings(builder);

    const widget = _buildWidget(builder);
    widget.show_all();

    return widget;
};

const _getWidgetBuilder = () => {
    const builder = new Gtk.Builder();
    builder.add_from_file(`${Me.dir.get_path()}/prefs.xml`);
    return builder;
}

const _bindWidgetToSettings = (builder) => {
    const settings = Convenience.getSettings();
    settings.bind("max-items-per-section", builder.get_object("field_max_items_per_section"), "value", Gio.SettingsBindFlags.DEFAULT);
    settings.bind("systemd-section-enabled", builder.get_object("field_systemd_section_enabled"), "active", Gio.SettingsBindFlags.DEFAULT);
    settings.bind("systemd-section-filter-user-services", builder.get_object("field_systemd_section_filter_user_services"), "active", Gio.SettingsBindFlags.DEFAULT);
    settings.bind("systemd-section-filter-priority-list", builder.get_object("field_systemd_section_filter_priority_list"), "active", Gio.SettingsBindFlags.DEFAULT);
    settings.bind("systemd-section-items-priority-list", builder.get_object("field_systemd_section_items_priority_list"), "text", Gio.SettingsBindFlags.DEFAULT);
    settings.bind("cron-section-enabled", builder.get_object("field_cron_section_enabled"), "active", Gio.SettingsBindFlags.DEFAULT);
    settings.bind("docker-section-enabled", builder.get_object("field_docker_section_enabled"), "active", Gio.SettingsBindFlags.DEFAULT);
}

const _buildWidget = (builder) => {
    return builder.get_object("vbox_built");
}

