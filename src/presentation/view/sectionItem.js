"use strict";

const Me = imports.misc.extensionUtils.getCurrentExtension();
const { St } = imports.gi;
const PopupMenu = imports.ui.popupMenu;

const SectionItemPresenter = Me.imports.src.presentation.presenter.sectionItem.SectionItemPresenter;
const ClickableSectionItemPresenter = Me.imports.src.presentation.presenter.sectionItem.ClickableSectionItemPresenter;

/**
 * Item of a menu section.
 */
/* exported SectionItemView */
var SectionItemView = class extends PopupMenu.PopupBaseMenuItem {
    /**
     * @param {string} params.id 
     * @param {string} params.labelText
     */
    constructor(params) {
        super({ hover: true, style_class: "menu-section-item" });
        this.asString = params.labelText;
        this.setup(params);
    }

    setup(params) {
        this.presenter = new SectionItemPresenter(this, params);
        this.presenter.setupEvents();
    }

    showLabel(text) {
        this._label = new St.Label({ text: text, style_class: "menu-section-item-text" });
        const labelBin = new St.Bin({ child: this._label });
        this.actor.add(labelBin);
    }

    addMouseOverEvent() {
        return this.connect("active-changed", () => this.presenter.onMouseOver());
    }

    removeEvent(eventId) {
        this.disconnect(eventId);
    }

    showFullLabel() {
        this._label.clutter_text.set_line_wrap(this.active);
    }

    destroy() {
        this.presenter.onDestroy();
        super.destroy();
    }
};

/**
 * Clickable item of a menu section.
 */
/* exported ClickableSectionItemView */
var ClickableSectionItemView = class extends SectionItemView {
    /**
     * @param {string} params.id 
     * @param {string} params.labelText 
     * @param {boolean} params.running 
     * @param {Function} params.action 
     */
    constructor(params) {
        super(params);
        this.presenter.setupClickableEvents(params.running, params.action);
    }

    setup(params) {
        this.presenter = new ClickableSectionItemPresenter(this, params);
    }

    showButton(running) {
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
    }

    hideButton() {
        this.actor.remove_actor(this._button);
    }

    addButtonClickEvent() {
        return this._button.connect("clicked", () => this.presenter.onClick());
    }
};
