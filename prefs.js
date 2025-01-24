import Adw from "gi://Adw";
import Gio from "gi://Gio";
import Gtk from "gi://Gtk";

import { ExtensionPreferences } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

import Settings from "./src/data/settings.js";

export default class SerMonPreferences extends ExtensionPreferences {
    constructor(metadata) {
        super(metadata);
    }

    fillPreferencesWindow(window) {
        if (!this._settings) {
            this._settings = new Settings(this);
        }
        window.connect("close-request", () => {
            if (this._settings) {
                this._settings.destroy();
                this._settings = null;
            }
        });

        const page = new Adw.PreferencesPage();
        page.add(this._buildGeneralPreferencesGroup());
        page.add(this._buildSystemdPreferencesGroup());
        page.add(this._buildCronPreferencesGroup());
        page.add(this._buildDockerPreferencesGroup());
        page.add(this._buildPodmanPreferencesGroup());
        window.add(page);
    }

    _buildGeneralPreferencesGroup() {
        const group = this._buildPreferencesGroup("General");

        const itemsWidget = new Gtk.Adjustment({
            lower: 1,
            upper: 100,
            step_increment: 1,
        });
        const itemsRow = this._buildRow(
            itemsWidget,
            (widget) =>
                Settings.bindMaxItemsPerSection(
                    widget,
                    Gio.SettingsBindFlags.DEFAULT,
                ),
            () => Settings.describeMaxItemsPerSection(),
        );
        group.add(itemsRow);

        return group;
    }

    _buildSystemdPreferencesGroup() {
        const group = this._buildPreferencesGroup("Systemd");

        const enableRow = this._buildRow(
            this._buildSwitchWidget(),
            (widget) =>
                Settings.bindSystemdSectionEnabled(
                    widget,
                    Gio.SettingsBindFlags.DEFAULT,
                ),
            () => Settings.describeSystemdSectionEnabled(),
        );
        group.add(enableRow);

        const showLoadedServicesRow = this._buildRow(
            this._buildSwitchWidget(),
            (widget) =>
                Settings.bindShowOnlySystemdLoadedServices(
                    widget,
                    Gio.SettingsBindFlags.DEFAULT,
                ),
            () => Settings.describeShowOnlySystemdLoadedServices(),
        );
        group.add(showLoadedServicesRow);

        const showSystemServicesRow = this._buildRow(
            this._buildSwitchWidget(),
            (widget) =>
                Settings.bindShowSystemdSystemServices(
                    widget,
                    Gio.SettingsBindFlags.DEFAULT,
                ),
            () => Settings.describeShowSystemdSystemServices(),
        );
        group.add(showSystemServicesRow);

        const showUserServicesRow = this._buildRow(
            this._buildSwitchWidget(),
            (widget) =>
                Settings.bindShowSystemdUserServices(
                    widget,
                    Gio.SettingsBindFlags.DEFAULT,
                ),
            () => Settings.describeShowSystemdUserServices(),
        );
        group.add(showUserServicesRow);

        const filterByPriorityListRow = this._buildRow(
            this._buildSwitchWidget(),
            (widget) =>
                Settings.bindFilterSystemdServicesByPriorityList(
                    widget,
                    Gio.SettingsBindFlags.DEFAULT,
                ),
            () => Settings.describeFilterSystemdServicesByPriorityList(),
        );
        group.add(filterByPriorityListRow);

        const priorityListWidget = new Gtk.Entry({
            valign: Gtk.Align.CENTER,
            hexpand: true,
            width_chars: 20,
        });
        const priorityListRow = this._buildRow(
            priorityListWidget,
            (widget) =>
                Settings.bindSystemdServicesPriorityList(
                    widget,
                    Gio.SettingsBindFlags.DEFAULT,
                ),
            () => Settings.describeSystemdServicesPriorityList(),
        );
        group.add(priorityListRow);

        return group;
    }

    _buildCronPreferencesGroup() {
        const group = this._buildPreferencesGroup("Cron");

        const enableRow = this._buildRow(
            this._buildSwitchWidget(),
            (widget) =>
                Settings.bindCronSectionEnabled(
                    widget,
                    Gio.SettingsBindFlags.DEFAULT,
                ),
            () => Settings.describeCronSectionEnabled(),
        );
        group.add(enableRow);

        return group;
    }

    _buildDockerPreferencesGroup() {
        const group = this._buildPreferencesGroup("Docker");

        const enableRow = this._buildRow(
            this._buildSwitchWidget(),
            (widget) =>
                Settings.bindDockerSectionEnabled(
                    widget,
                    Gio.SettingsBindFlags.DEFAULT,
                ),
            () => Settings.describeDockerSectionEnabled(),
        );
        group.add(enableRow);

        const showImagesRow = this._buildRow(
            this._buildSwitchWidget(),
            (widget) =>
                Settings.bindShowDockerImages(
                    widget,
                    Gio.SettingsBindFlags.DEFAULT,
                ),
            () => Settings.describeShowDockerImages(),
        );
        group.add(showImagesRow);

        return group;
    }

    _buildPodmanPreferencesGroup() {
        const group = this._buildPreferencesGroup("Podman");

        const enableRow = this._buildRow(
            this._buildSwitchWidget(),
            (widget) =>
                Settings.bindPodmanSectionEnabled(
                    widget,
                    Gio.SettingsBindFlags.DEFAULT,
                ),
            () => Settings.describePodmanSectionEnabled(),
        );
        group.add(enableRow);

        const showImagesRow = this._buildRow(
            this._buildSwitchWidget(),
            (widget) =>
                Settings.bindShowPodmanImages(
                    widget,
                    Gio.SettingsBindFlags.DEFAULT,
                ),
            () => Settings.describeShowPodmanImages(),
        );
        group.add(showImagesRow);

        return group;
    }

    _buildPreferencesGroup(title) {
        return new Adw.PreferencesGroup({
            title: title,
        });
    }

    _buildRow(widget, bindWidget, getPreferenceSchema) {
        bindWidget(widget);
        const schema = getPreferenceSchema();
        let row;
        if (widget instanceof Gtk.Switch || widget instanceof Gtk.Entry) {
            row = new Adw.ActionRow({
                title: schema.get_summary(),
                subtitle: schema.get_description(),
            });
            row.add_suffix(widget);
            row.set_activatable_widget(widget);
        } else if (widget instanceof Gtk.Adjustment) {
            row = new Adw.SpinRow({
                title: schema.get_summary(),
                subtitle: schema.get_description(),
                adjustment: widget,
            });
        }
        return row;
    }

    _buildSwitchWidget() {
        return new Gtk.Switch({
            valign: Gtk.Align.CENTER,
        });
    }
}
