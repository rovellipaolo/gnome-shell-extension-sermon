"use strict";

const Lang = imports.lang;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;

const Class = imports.lang.Class;

const SectionContainerPresenter = Me.imports.src.presentation.presenter.section.SectionContainerPresenter;
const SectionPresenter = Me.imports.src.presentation.presenter.section.SectionPresenter;
const SectionTitlePresenter = Me.imports.src.presentation.presenter.section.SectionTitlePresenter;
const SectionItemPresenter = Me.imports.src.presentation.presenter.section.SectionItemPresenter;
const ClickableSectionItemPresenter = Me.imports.src.presentation.presenter.section.ClickableSectionItemPresenter;
const RunnableSectionItemPresenter = Me.imports.src.presentation.presenter.section.RunnableSectionItemPresenter;

/**
 * Container of one or more menu sections.
 */
/* exported SectionContainerView */
const SectionContainerView = new Class({
    Name: "SectionContainer",
    Extends: PopupMenu.PopupBaseMenuItem,

    _init: function() {
        this.parent({ style_class: "menu-section-container" });
        this.presenter = new SectionContainerPresenter(this);
    },

    addSection: function(section, position) {
        if (!(section instanceof SectionView)) {
            throw new TypeError("Section must be an instance of SectionView!");
        }
        this.presenter.onSectionAdded(section, position);
    },

    showSection: function(section, position) {
        this.actor.insert_child_at_index(section, position);
    },

    hideSection: function(section) {
        this.actor.remove_actor(section);
        section.destroy();
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
const SectionView = new Class({
    Name: "Section",
    Extends: St.BoxLayout,

    _init: function(title) {
        if (!(title instanceof SectionTitleView)) {
            throw new TypeError("Title must be an instance of SectionTitleView!");
        }

        this.parent( { vertical: true, style_class: "menu-section" });
        this.asString = title.asString;
        this.presenter = new SectionPresenter(this, title);
    },

    showTitle: function(title) {
        this.add_actor(title.actor);
        this.add_actor((new PopupMenu.PopupSeparatorMenuItem()).actor);
    },

    addItem: function(item) {
        if (!(item instanceof SectionItemView)) {
            throw new TypeError("Item must be an instance of SectionItemView!");
        }
        this.presenter.onItemAdded(item);
    },

    showItem: function(item) {
        this.add_actor(item.actor);
    },

    hideItem: function(item) {
        this.remove_actor(item.actor);
    },

    destroy: function() {
        this.presenter.onDestroy();
        this.parent();
    }
});

/**
 * Title of a menu section.
 */
/* exported SectionTitleView */
const SectionTitleView = new Class({
    Name: "SectionTitle",
    Extends: PopupMenu.PopupBaseMenuItem,

    /**
     * @param {string} text 
     * @param {St.Icon} icon 
     */
    _init: function(text, icon) {
        this.parent({ hover: false, style_class: "menu-section-title" });
        this.asString = text;
        this.presenter = new SectionTitlePresenter(this, text, icon);
    },

    showText: function(text) {
        const label = new St.Label({ text: text, style_class: "menu-section-title-text" });
        const labelBin = new St.Bin({ child: label });
        this.actor.add(labelBin);
    },

    showIcon: function(icon) {
        this.actor.add(icon, { expand: true, x_fill: false, x_align: St.Align.END });
    }
});

/**
 * Item of a menu section.
 */
/* exported SectionItemView */
const SectionItemView = new Class({
    Name: "SectionItem",
    Extends: PopupMenu.PopupBaseMenuItem,

    /**
     * @param {string} id 
     * @param {string} labelText
     */
    _init: function(id, labelText) {
        this.parent({ hover: true, style_class: "menu-section-item" });
        this.asString = labelText;
        this.setup(id, labelText);
    },

    setup: function(id, labelText) {
        this.presenter = new SectionItemPresenter(this, id, labelText);
        this.presenter.setupEvents();
    },

    destroy: function() {
        this.presenter.onDestroy();
        this.parent();
    },

    showLabel: function(text) {
        this._label = new St.Label({ text: text, style_class: "menu-section-item-text" });
        const labelBin = new St.Bin({ child: this._label });
        this.actor.add(labelBin);
    },

    addMouseOverEvent: function() {
        return this.connect("active-changed", Lang.bind(this, () => this.presenter.onMouseOver()));
    },

    removeEvent: function(eventId) {
        this.disconnect(eventId);
    },

    showFullLabel: function() {
        this._label.clutter_text.set_line_wrap(this.active);
    }
});

/**
 * Clickable item of a menu section.
 */
/* exported ClickableSectionItemView */
const ClickableSectionItemView = new Class({
    Name: "ClickableSectionItem",
    Extends: SectionItemView,

    /**
     * @param {string} id 
     * @param {string} labelText 
     * @param {Function} action 
     */
    _init: function(id, labelText, action) {
        this.parent(id, labelText);
        this.presenter.setupClickableEvents(action);
    },

    setup: function(id, labelText) {
        this.presenter = new ClickableSectionItemPresenter(this, id, labelText);
    },

    addMouseClickEvent: function() {
        return this.connect("activate", Lang.bind(this, () => this.presenter.onMouseClick()));
    }
});

/**
 * Runnable item of a menu section.
 */
/* exported RunnableSectionItemView */
const RunnableSectionItemView = new Class({
    Name: "RunnableSectionItem",
    Extends: SectionItemView,

    /**
     * @param {string} id 
     * @param {string} labelText 
     * @param {boolean} running 
     * @param {Function} action 
     */
    _init: function(id, labelText, action, running = false) {
        this.parent(id, labelText);
        this.presenter.setupRunnableEvents(action, running);
    },

    setup: function(id, labelText) {
        this.presenter = new RunnableSectionItemPresenter(this, id, labelText);
    },

    showButton: function(running) {
        let iconName;
        if (running) {
            iconName = "media-playback-pause-symbolic";
        } else {
            iconName = "media-playback-start-symbolic";
        }

        const button_icon = new St.Icon({ icon_name: iconName, icon_size: 14, style_class: "system-status-icon" });
        this._button = new St.Button();
        this._button.set_child(button_icon);

        this.actor.add(this._button, { expand: true, x_fill: false, x_align: St.Align.END });
    },

    hideButton: function() {
        this.actor.remove_actor(this._button);
    },

    addButtonClickEvent: function() {
        return this._button.connect("clicked", Lang.bind(this, () => this.presenter.onButtonClick()));
    }
});
