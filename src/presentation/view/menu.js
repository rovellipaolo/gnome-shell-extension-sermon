"use strict";

const Gio = imports.gi.Gio;
const Lang = imports.lang;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const PanelMenu = imports.ui.panelMenu;
const St = imports.gi.St;

const Class = Lang.Class;

const Settings = Me.imports.src.data.settings;
const CronRepository = Me.imports.src.data.cronRepository;
const DockerRepository = Me.imports.src.data.dockerRepository;
const SystemdRepository = Me.imports.src.data.systemdRepository;
const MenuPresenter = Me.imports.src.presentation.presenter.menu.MenuPresenter;
const SectionContainerView = Me.imports.src.presentation.view.section.SectionContainerView;
const SectionView = Me.imports.src.presentation.view.section.SectionView;
const SectionTitleView = Me.imports.src.presentation.view.section.SectionTitleView;
const SectionItemView = Me.imports.src.presentation.view.section.SectionItemView;
const ClickableSectionItemView = Me.imports.src.presentation.view.section.ClickableSectionItemView;
const RunnableSectionItemView = Me.imports.src.presentation.view.section.RunnableSectionItemView;

/* exported MenuView */
const MenuView = new Class({
    Name: "Menu",
    Extends: PanelMenu.Button,

    _init: function() {
        this.parent(0.0);
        this.presenter = new MenuPresenter(this, Settings, SystemdRepository, CronRepository, DockerRepository);
        this.presenter.setupEvents();
        this.presenter.setupView();
    },

    showIcon: function() {
        const icon = new St.Icon({ icon_name: "system-run-symbolic", style_class: "system-status-icon" });
        const layout = new St.BoxLayout({ style_class: "menu-layout" });
        layout.add_child(icon);
        this.actor.add_child(layout);
    },

    addClickEvent() {
        return this.actor.connect("button_press_event", Lang.bind(this, () => this.presenter.onClick()));
    },

    isOpen: function() {
        return this.menu.isOpen;
    },

    clear: function() {
        this.menu.removeAll();
    },

    show: function() {
        this.actor.show();
    },

    showSectionContainer: function() {
        this._sectionContainer = new SectionContainerView();
        this.menu.addMenuItem(this._sectionContainer);
    },

    showSection: function(section, position) {
        this._sectionContainer.addSection(section, position);
    },

    showSectionItem(section, item) {
        section.addItem(item);
    },

    showErrorSectionItem: function(error) {
        let errorItem = new SectionItemView(0, error);
        this.menu.addMenuItem(errorItem);
    },

    buildSystemdSectionView: function() {
        const icon = Gio.icon_new_for_string(`${Me.path}/images/systemd_icon.svg`);
        const systemdIcon = new St.Icon({ gicon: icon, icon_size: "24", style_class: "menu-section-title-icon" });
        return this._buildSectionView("Systemd", systemdIcon);
    },

    buildCronSectionView: function() {
        const icon = Gio.icon_new_for_string(`${Me.path}/images/cron_icon.svg`);
        const cronIcon = new St.Icon({ gicon: icon, icon_size: "24", style_class: "menu-section-title-icon" });
        return this._buildSectionView("Cron", cronIcon);
    },

    buildDockerSectionView: function() {
        const icon = Gio.icon_new_for_string(`${Me.path}/images/docker_icon.svg`);
        const dockerIcon = new St.Icon({ gicon: icon, icon_size: "24", style_class: "menu-section-title-icon" });
        return this._buildSectionView("Docker", dockerIcon);
    },

    _buildSectionView: function(text, icon) {
        const title = new SectionTitleView(text, icon);
        return new SectionView(title);
    },

    buildSectionItemView: function(id, labelText) {
        return new SectionItemView(id, labelText);
    },

    buildClickableSectionItemView: function(id, labelText, action) {
        return new ClickableSectionItemView(id, labelText, action);
    },

    buildRunnableSectionItemView(id, labelText, action, running) {
        return new RunnableSectionItemView(id, labelText, action, running);
    },

    removeEvent: function(eventId) {
        this.actor.disconnect(eventId);
    },

    destroy: function() {
        this.presenter.onDestroy();
        this.parent();
    }
});
