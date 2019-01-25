"use strict";

const Gio = imports.gi.Gio;
const Lang = imports.lang;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const PanelMenu = imports.ui.panelMenu;
const St = imports.gi.St;

const Class = Lang.Class;

const DockerRepository = Me.imports.src.data.dockerRepository;
const MenuPresenter = Me.imports.src.presentation.presenter.menu.MenuPresenter;
const SectionContainerView = Me.imports.src.presentation.view.sectionContainer.SectionContainerView;
const SectionView = Me.imports.src.presentation.view.section.SectionView;
const SectionTitleView = Me.imports.src.presentation.view.sectionTitle.SectionTitleView;
const ClickableSectionItemView = Me.imports.src.presentation.view.sectionItem.ClickableSectionItemView;
const SectionItemView = Me.imports.src.presentation.view.sectionItem.SectionItemView;

/* exported MenuView */
const MenuView = new Class({
    Name: "Menu",
    Extends: PanelMenu.Button,

    _init: function() {
        this.parent(0.0);
        this.presenter = new MenuPresenter(this, DockerRepository);
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

    buildDockerSectionView: function() {
        const icon = Gio.icon_new_for_string(`${Me.path}/images/docker_icon.svg`);
        const dockerIcon = new St.Icon({ gicon: icon, icon_size: "24", style_class: "menu-section-title-icon" });

        const title = new SectionTitleView("Docker", dockerIcon);
        return new SectionView(title);
    },
    
    buildDockerSectionItemView: function(id, labelText, running, action) {
        return new ClickableSectionItemView(id, labelText, running, action);
    },

    destroy: function() {
        this.presenter.onDestroy();
        this.parent();
    }
});