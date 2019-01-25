"use strict";

const Lang = imports.lang;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;

const Class = imports.lang.Class;

const SectionItemPresenter = Me.imports.src.presentation.presenter.sectionItem.SectionItemPresenter;
const ClickableSectionItemPresenter = Me.imports.src.presentation.presenter.sectionItem.ClickableSectionItemPresenter;

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
     * @param {boolean} running 
     * @param {Function} action 
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
     * @param {boolean} running 
     * @param {Function} action 
     */
    _init: function(id, labelText, running = false, action) {
        this.parent(id, labelText, running);
        this.presenter.setupClickableEvents(running, action);
    },

    setup: function(id, labelText) {
        this.presenter = new ClickableSectionItemPresenter(this, id, labelText);
    },

    showButton: function(running) {
        let iconName;
        let iconClass;
        if (running) {
            iconName = "media-playback-pause-symbolic";
            iconClass = "menu-section-item-icon-stop";
        } else {
            iconName = "media-playback-start-symbolic";
            iconClass = "menu-section-item-icon-start";
        }

        const button_icon = new St.Icon({ icon_name: iconName, icon_size: 14, style_class: `system-status-icon menu-section-item-icon ${iconClass}` });
        this._button = new St.Button();
        this._button.set_child(button_icon);

        this.actor.add(this._button, { expand: true, x_fill: false, x_align: St.Align.END });
    },

    hideButton: function() {
        this.actor.remove_actor(this._button);
    },

    addButtonClickEvent: function() {
        return this._button.connect("clicked", Lang.bind(this, () => this.presenter.onClick()));
    }
});
