"use strict";

const Me = imports.misc.extensionUtils.getCurrentExtension();
const { Gio, GObject, St } = imports.gi;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const Factory = Me.imports.src.presentation.factories;
const Pager = Me.imports.src.presentation.pager;
const {
    MenuPresenter,
    SectionContainerPresenter,
    SectionPresenter,
    SectionTitlePresenter,
    SectionItemPresenter,
    ClickableSectionItemPresenter,
    RunnableSectionItemPresenter
} = Me.imports.src.presentation.presenters;

/* exported MenuView */
var MenuView = GObject.registerClass(
    class MenuView extends PanelMenu.Button {
        _init() {
            super._init(0.0);
            this.presenter = new MenuPresenter(this, {
                factory: Factory,
                pager: Pager
            });
            this.presenter.setupEvents();
            this.presenter.setupView();
        }

        /**
         * @param {string[]} sections - an array of Factory.SectionType
         */
        showIcon(sections) {
            const layout = new St.BoxLayout({ style_class: "menu-layout" });

            sections.forEach((section, index) => {
                const isFirst = index === 0;
                const isLast = index === sections.length - 1;
                let icon = Factory.buildIcon(section, Factory.IconType.STATUS_AREA, isFirst, isLast);
                layout.add_child(icon);
            });
            
            this.actor.add_child(layout);
        }

        addClickEvent() {
            let that = this;
            return this.actor.connect("button_press_event", () => that.presenter.onClick());
        }

        isOpen() {
            return this.menu.isOpen;
        }

        clear() {
            this.menu.removeAll();
        }

        showSectionContainer() {
            this._sectionContainerView = new SectionContainerView();
            this.menu.addMenuItem(this._sectionContainerView);
        }

        showSection(sectionView, position) {
            this._sectionContainerView.addSection(sectionView, position);
        }

        showSectionItem(sectionView, itemView) {
            sectionView.addItem(itemView);
        }

        showErrorSectionItem(sectionView, error) {
            let itemView = new SectionItemView({ id: 0, labelText: error });
            sectionView.addItem(itemView);
        }

        buildSectionView(section) {
            const icon = Factory.buildIcon(section, Factory.IconType.SECTION_TITLE);
            const title = new SectionTitleView({ text: section, icon: icon });
            return new SectionView({ title: title });
        }
        
        buildSectionItemView(id, labelText) {
            return new SectionItemView({
                id: id,
                labelText: labelText
            });
        }

        buildClickableSectionItemView(id, labelText, action) {
            return new ClickableSectionItemView({
                id: id,
                labelText: labelText,
                action: action
            });
        }

        buildRunnableSectionItemView(id, labelText, action, running) {
            return new RunnableSectionItemView({
                id: id,
                labelText: labelText,
                action: action,
                running: running,
            });
        }

        removeEvent(eventId) {
            this.actor.disconnect(eventId);
        }

        destroy() {
            this.presenter.onDestroy();
            super.destroy();
        }
    }
);

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
         * @param {Function} params.action 
         */
        _init(params) {
            super._init(params);
            this.presenter.setupClickableEvents(params.action);
        }

        setup(params) {
            this.presenter = new ClickableSectionItemPresenter(this, params);
        }

        addMouseClickEvent() {
            return this.connect('activate', () => this.presenter.onMouseClick());
        }
    }
);

/**
 * Runnable item of a menu section.
 */
/* exported RunnableSectionItemView */
var RunnableSectionItemView = GObject.registerClass(
    class RunnableSectionItemView extends SectionItemView {
        /**
         * @param {string} params.id 
         * @param {string} params.labelText 
         * @param {Function} params.action 
         * @param {boolean} params.running 
         */
        _init(params) {
            super._init(params);
            this.presenter.setupRunnableEvents(params.action, params.running);
        }

        setup(params) {
            this.presenter = new RunnableSectionItemPresenter(this, params);
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

            this.add_actor(this._button);
        }

        hideButton() {
            this.remove_actor(this._button);
        }

        addButtonClickEvent() {
            return this._button.connect("clicked", () => this.presenter.onButtonClick());
        }
    }
);
