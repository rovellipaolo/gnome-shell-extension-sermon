"use strict";

const { Gio, Gtk } = imports.gi;
const Config = imports.misc.config;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const Settings = Me.imports.src.data.settings;

/** Triggered after the file is loaded but before the buildPrefsWidget. */
/* exported init */
const init = () => {};

/** Triggered when opening the extension preferences widget. */
/* exported buildPrefsWidget */
const buildPrefsWidget = () => {
    const builder = new Gtk.Builder();
    builder.add_from_file(`${Me.dir.get_path()}/src/presentation/prefs.ui`);
    _bindWidgetToSettings(builder);

    const widget = builder.get_object("box_main");
    if (parseFloat(Config.PACKAGE_VERSION) < 40) {
        widget.show_all();
    }
    return widget;
};

const _bindWidgetToSettings = (builder) => {
    Settings.bindMaxItemsPerSection(
        builder.get_object("field_max_items_per_section"),
        Gio.SettingsBindFlags.DEFAULT
    );
    Settings.bindSystemdSectionEnabled(
        builder.get_object("field_systemd_section_enabled"),
        Gio.SettingsBindFlags.DEFAULT
    );
    Settings.bindFilterSystemdLoadedServices(
        builder.get_object("field_systemd_section_filter_loaded_services"),
        Gio.SettingsBindFlags.DEFAULT
    );
    Settings.bindFilterSystemdUserServices(
        builder.get_object("field_systemd_section_filter_user_services"),
        Gio.SettingsBindFlags.DEFAULT
    );
    Settings.bindFilterSystemdServicesByPriorityList(
        builder.get_object("field_systemd_section_filter_priority_list"),
        Gio.SettingsBindFlags.DEFAULT
    );
    Settings.bindSystemdSectionItemsPriorityList(
        builder.get_object("field_systemd_section_items_priority_list"),
        Gio.SettingsBindFlags.DEFAULT
    );
    Settings.bindCronSectionEnabled(
        builder.get_object("field_cron_section_enabled"),
        Gio.SettingsBindFlags.DEFAULT
    );
    Settings.bindDockerSectionEnabled(
        builder.get_object("field_docker_section_enabled"),
        Gio.SettingsBindFlags.DEFAULT
    );
    Settings.bindPodmanSectionEnabled(
        builder.get_object("field_podman_section_enabled"),
        Gio.SettingsBindFlags.DEFAULT
    );
};
