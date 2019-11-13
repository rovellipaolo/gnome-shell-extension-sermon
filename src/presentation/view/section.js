"use strict";

const Me = imports.misc.extensionUtils.getCurrentExtension();
const { GObject, St } = imports.gi;
const PopupMenu = imports.ui.popupMenu;

const {
    SectionContainerPresenter,
    SectionPresenter,
    SectionTitlePresenter,
    SectionItemPresenter,
    ClickableSectionItemPresenter
} = Me.imports.src.presentation.presenter.section;

/**
 * Container of one or more menu sections.
 */
/* exported SectionContainerView */
var SectionContainerView = GObject.registerClass(
    class SectionContainerView extends PopupMenu.PopupBaseMenuItem {
        _init() {
            super._init({ style_class: "menu-section-container" });
            this.presenter = new SectionContainerPresenter(this);
        }

        addSection(section, position) {
            if (!(section instanceof SectionView)) {
                throw new TypeError("Section must be an instance of SectionView!");
            }
            this.presenter.onSectionAdded(section, position);
        }

        showSection(section, position) {
            this.actor.insert_child_at_index(section, position);
        }

        hideSection(section) {
            this.actor.remove_actor(section);
            section.destroy();
        }

        destroy() {
            this.presenter.onDestroy();
            super.destroy();
        }
    }
);

/**
 * Single menu section.
 */
/* exported SectionView */
var SectionView = GObject.registerClass(
    class SectionView extends St.BoxLayout {
        /**
         * @param {string} params.title 
         */
        _init(params) {
            if (!(params.title instanceof SectionTitleView)) {
                throw new TypeError("Title must be an instance of SectionTitleView!");
            }

            super._init({ vertical: true, style_class: "menu-section" });
            this.asString = params.title.asString;
            this.presenter = new SectionPresenter(this, params);
        }

        showTitle(title) {
            this.add_actor(title.actor);
            this.add_actor((new PopupMenu.PopupSeparatorMenuItem()).actor);
        }

        addItem(item) {
            if (!(item instanceof SectionItemView)) {
                throw new TypeError("Item must be an instance of SectionItemView!");
            }
            this.presenter.onItemAdded(item);
        }

        showItem(item) {
            this.add_actor(item.actor);
        }

        hideItem(item) {
            this.remove_actor(item.actor);
        }

        destroy() {
            this.presenter.onDestroy();
            super.destroy();
        }
    }
);

/**
 * Title of a menu section.
 */
/* exported SectionTitleView */
var SectionTitleView = GObject.registerClass(
    class SectionTitleView extends PopupMenu.PopupBaseMenuItem {
        /**
         * @param {string} params.text 
         * @param {St.Icon} params.icon 
         */
        _init(params) {
            super._init({ hover: false, style_class: "menu-section-title" });
            this.asString = params.text;
            this.presenter = new SectionTitlePresenter(this, params);
        }

        showText(text) {
            const label = new St.Label({ text: text, style_class: "menu-section-title-text" });
            const labelBin = new St.Bin({ child: label });
            this.actor.add(labelBin);
        }

        showIcon(icon) {
            this.actor.add(icon, { expand: true, x_fill: false, x_align: St.Align.END });
        }

        destroy() {
            super.destroy();
        }
    }
);

/**
 * Item of a menu section.
 */
/* exported SectionItemView */
var SectionItemView = GObject.registerClass(
    class SectionSectionItemViewTitleView extends PopupMenu.PopupBaseMenuItem {
        /**
         * @param {string} params.id 
         * @param {string} params.labelText
         */
        _init(params) {
            super._init({ hover: true, style_class: "menu-section-item" });
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
            this.add_actor(labelBin);
        }

        addMouseOverEvent() {
            return this.connect("notify::active", () => this.presenter.onMouseOver());
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
    }
);

/**
 * Clickable item of a menu section.
 */
/* exported ClickableSectionItemView */
var ClickableSectionItemView = GObject.registerClass(
    class ClickableSectionItemView extends SectionItemView {
        /**
         * @param {string} params.id 
         * @param {string} params.labelText 
         * @param {boolean} params.running 
         * @param {Function} params.action 
         */
        _init(params) {
            super._init(params);
            this.presenter.setupClickableEvents(params.running,
 params.action);
        }

        setup(params) {
            this.presenter = new ClickableSectionItemPresenter(this,
 params);
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

            this.add_actor(this._button, { expand: true, x_fill: false, x_align: St.Align.END });
        }

        hideButton() {
            this.remove_actor(this._button);
        }

        addButtonClickEvent() {
            return this._button.connect("clicked", () => this.presenter.onClick());
        }
    }
);
