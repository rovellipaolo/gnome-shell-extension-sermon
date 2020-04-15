"use strict";

const Lang = imports.lang;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;

const Class = Lang.Class;

const Factory = Me.imports.src.presentation.factories;
const Pager = Me.imports.src.presentation.pager;
const MenuPresenter = Me.imports.src.presentation.presenters.MenuPresenter;
const SectionPresenter = Me.imports.src.presentation.presenters.SectionPresenter;
const SectionItemPresenter = Me.imports.src.presentation.presenters.SectionItemPresenter;
const ClickableSectionItemPresenter = Me.imports.src.presentation.presenters.ClickableSectionItemPresenter;
const RunnableSectionItemPresenter = Me.imports.src.presentation.presenters.RunnableSectionItemPresenter;

/* exported MenuView */
var MenuView = new Class({
    Name: "MenuView",
    Extends: PanelMenu.Button,

    _init: function() {
        this.parent(0.0);
        this.presenter = new MenuPresenter(this, Factory);
        this.presenter.setupEvents();
        this.presenter.setupView();
    },

    addClickEvent: function() {
        return this.actor.connect("button_press_event", Lang.bind(this, () => this.presenter.onClick()));
    },

    isOpen: function() {
        return this.menu.isOpen;
    },

    clear: function() {
        this.menu.removeAll();
    },

    /**
     * @param {string[]} sections - an array of Factory.SectionType
     */
    showIcon: function(sections) {
        const layout = new St.BoxLayout();

        sections.forEach((section, index) => {
            const isFirst = index === 0;
            const isLast = index === sections.length - 1;
            let icon = Factory.buildIcon(section, Factory.IconType.STATUS_AREA, isFirst, isLast);
            layout.add_child(icon);
        });
        
        this.actor.add_child(layout);
    },

    showSectionContainer: function() {
        this._sectionContainerView = new PopupMenu.PopupBaseMenuItem({ style_class: "sermon-section-container" });
        this.menu.addMenuItem(this._sectionContainerView);
    },

    showSection: function(sectionView, position) {
        if (!(sectionView instanceof SectionView)) {
            throw new TypeError("Section must be an instance of SectionView!");
        }
        this._sectionContainerView.actor.insert_child_at_index(sectionView, position);
    },

    hideSection: function(sectionView) {
        this._sectionContainerView.actor.remove_actor(sectionView);
        sectionView.destroy();
    },

    buildSectionView: function(section) {
        const icon = Factory.buildIcon(section, Factory.IconType.SECTION_TITLE);
        return new SectionView(section, icon);
    },

    removeEvent: function(eventId) {
        this.actor.disconnect(eventId);
    },

    destroy: function() {
        this.presenter.onDestroy();
        this.parent();
    }
});

/**
 * Single menu section.
 */
/* exported SectionView */
var SectionView = new Class({
    Name: "SectionView",
    Extends: St.BoxLayout,

    _init: function(section, icon) {
        this.parent( { vertical: true });
        this.asString = section;
        this.presenter = new SectionPresenter(this, Factory, Pager, section, icon);
    },

    showHeader: function(title, icon) {
        const titleView = new PopupMenu.PopupBaseMenuItem({ hover: false });
        const label = new St.Label({ text: title, style_class: "sermon-section-title" });
        titleView.actor.add(new St.Bin({ child: label }));
        titleView.actor.add(icon, { expand: true, x_fill: false, x_align: St.Align.END });
        this.add_actor(titleView.actor);
    },

    showHeaderSubTitle: function(subTitle) {
        const subTitleView = new PopupMenu.PopupBaseMenuItem({ hover: false });
        const label = new St.Label({ text: subTitle, style_class: "sermon-section-sub-title" });
        subTitleView.actor.add(new St.Bin({ child: label }));
        this.add_actor(subTitleView.actor);

        const separatorView = new PopupMenu.PopupSeparatorMenuItem();
        this.add_actor(separatorView.actor);
    },

    buildSectionItemView: function(section, id, labelText) {
        return new SectionItemView(Factory, section, id, labelText);
    },

    buildClickableSectionItemView: function(section, id, labelText, action) {
        return new ClickableSectionItemView(Factory, section, id, labelText, action);
    },

    buildRunnableSectionItemView: function(section, id, labelText, isRunning) {
        return new RunnableSectionItemView(Factory, section, id, labelText, isRunning);
    },

    showItem: function(itemView) {
        this.add_actor(itemView.actor);
    },

    hideItem: function(itemView) {
        this.remove_actor(itemView.actor);
    },

    destroy: function() {
        this.presenter.onDestroy();
        this.parent();
    }
});

/**
 * Item of a menu section.
 */
/* exported SectionItemView */
var SectionItemView = new Class({
    Name: "SectionItemView",
    Extends: PopupMenu.PopupBaseMenuItem,

    /**
     * @param {Factory} factory 
     * @param {string} section 
     * @param {string} id 
     * @param {string} labelText
     */
    _init: function(factory, section, id, labelText) {
        this.parent({ hover: true, style_class: "menu-section-item" });
        this.asString = labelText;
        this.setup(factory, section, id, labelText);
    },

    setup: function(factory, section, id, labelText) {
        this.presenter = new SectionItemPresenter(this, factory, section, id, labelText);
        this.presenter.setupEvents();
    },

    showLabel: function(text) {
        this._label = new St.Label({ text: text, style_class: "menu-section-item-text" });
        const labelBin = new St.Bin({ child: this._label });
        this.actor.add(labelBin, { expand: true, x_fill: false, x_align: St.Align.START });
    },

    addMouseOverEvent: function() {
        return this.connect("active-changed", Lang.bind(this, () => this.presenter.onMouseOver()));
    },

    removeEvent: function(eventId) {
        this.disconnect(eventId);
    },

    showFullLabel: function() {
        this._label.clutter_text.set_line_wrap(this.active);
    },

    destroy: function() {
        this.presenter.onDestroy();
        this.parent();
    }
});

/**
 * Clickable item of a menu section.
 */
/* exported ClickableSectionItemView */
var ClickableSectionItemView = new Class({
    Name: "ClickableSectionItemView",
    Extends: SectionItemView,

    /**
     * @param {Factory} params.factory 
     * @param {string} params.section 
     * @param {string} id 
     * @param {string} labelText 
     * @param {Function} action 
     */
    _init: function(factory, section, id, labelText, action) {
        this.parent(factory, section, id, labelText);
        this.presenter.setupClickableEvents(action);
    },

    setup: function(factory, section, id, labelText) {
        this.presenter = new ClickableSectionItemPresenter(this, factory, section, id, labelText);
    },

    addMouseClickEvent: function() {
        return this.connect("activate", Lang.bind(this, () => this.presenter.onMouseClick()));
    }
});

/**
 * Runnable item of a menu section.
 */
/* exported RunnableSectionItemView */
var RunnableSectionItemView = new Class({
    Name: "RunnableSectionItemView",
    Extends: SectionItemView,

    /**
         * @param {Factory} factory 
         * @param {string} section 
         * @param {string} id 
         * @param {string} labelText 
         * @param {boolean} isRunning 
     */
    _init: function(factory, section, id, labelText, isRunning) {
        this.parent(factory, section, id, labelText);
        this.buttons = {};
        this.presenter.setupRunnableEvents(isRunning);
    },

    setup: function(factory, section, id, labelText) {
        this.presenter = new RunnableSectionItemPresenter(this, factory, section, id, labelText);
    },

    showButton: function(type) {
        this.buttons[type] = this._buildButton(type);
        this.actor.add(this.buttons[type]);
        return this.buttons[type].connect("clicked", () => this.presenter.onButtonClicked(type));
    },

    _buildButton: function(type) {
        const icon = Factory.buildItemActionIcon(type);
        const button = new St.Button({ style_class: "sermon-section-item-button" });
        button.set_child(icon);
        return button;
    },

    hideButtons: function() {
        Object.keys(this.buttons).forEach(type => {
            const button = this.buttons[type];
            this.actor.remove_actor(button);
        });
    }
});
