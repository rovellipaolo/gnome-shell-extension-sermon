"use strict";

const Me = imports.misc.extensionUtils.getCurrentExtension();
const { Gio, GObject, St } = imports.gi;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const Factory = Me.imports.src.presentation.factories;
const Pager = Me.imports.src.presentation.pager;
const {
    MenuPresenter,
    SectionPresenter,
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
                factory: Factory
            });
            this.presenter.setupEvents();
            this.presenter.setupView();
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

        /**
         * @param {string[]} sections - an array of Factory.SectionType
         */
        showIcon(sections) {
            const layout = new St.BoxLayout();
            sections.forEach((section, index) => {
                const isFirst = index === 0;
                const isLast = index === sections.length - 1;
                let icon = Factory.buildIcon(section, Factory.IconType.STATUS_AREA, isFirst, isLast);
                layout.add_child(icon);
            });
            this.actor.add_child(layout);
        }

        showSectionContainer() {
            this._sectionContainerView = new PopupMenu.PopupBaseMenuItem({ style_class: "sermon-section-container" });
            this.menu.addMenuItem(this._sectionContainerView);
        }

        showSection(sectionView, position) {
            if (!(sectionView instanceof SectionView)) {
                throw new TypeError("Section must be an instance of SectionView!");
            }
            this._sectionContainerView.actor.insert_child_at_index(sectionView, position);
        }

        hideSection(sectionView) {
            this._sectionContainerView.actor.remove_actor(sectionView);
            sectionView.destroy();
        }

        buildSectionView(section) {
            const icon = Factory.buildIcon(section, Factory.IconType.SECTION_TITLE);
            return new SectionView({ title: section, icon: icon });
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
 * Single menu section.
 */
/* exported SectionView */
var SectionView = GObject.registerClass(
    class SectionView extends St.BoxLayout {
        /**
         * @param {string} params.title 
         * @param {St.Icon} params.icon 
         */
        _init(params) {
            super._init({ vertical: true });
            this.asString = params.title;
            this.presenter = new SectionPresenter(this, {
                factory: Factory,
                pager: Pager,
                title: params.title,
                icon: params.icon
            });
        }

        showHeader(title, icon) {
            const titleView = new PopupMenu.PopupBaseMenuItem({ hover: false });
            const label = new St.Label({ text: title, style_class: "sermon-section-title" });
            titleView.add_actor(new St.Bin({ child: label }));
            titleView.actor.add(icon, { expand: true, x_fill: false, x_align: St.Align.END });
            this.actor.insert_child_at_index(titleView, 0);

            const separatorView = new PopupMenu.PopupSeparatorMenuItem();
            this.actor.insert_child_at_index(separatorView, 2);
        }

        showHeaderSubTitle(subTitle) {
            const subTitleView = new PopupMenu.PopupBaseMenuItem({ hover: false });
            const label = new St.Label({ text: subTitle, style_class: "sermon-section-sub-title" });
            subTitleView.add_actor(new St.Bin({ child: label }));
            this.actor.insert_child_at_index(subTitleView, 1);
        }
        
        buildSectionItemView(id, labelText) {
            return new SectionItemView({
                id: id,
                labelText: labelText
            });
        }

        buildErrorSectionItem(error) {
            return new SectionItemView({ id: 0, labelText: error });
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

        showItem(itemView) {
            this.add_actor(itemView.actor);
        }

        hideItem(itemView) {
            this.remove_actor(itemView.actor);
        }

        destroy() {
            this.presenter.onDestroy();
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
            super._init({ hover: true });
            this.asString = params.labelText;
            this.setup(params);
        }

        setup(params) {
            this.presenter = new SectionItemPresenter(this, params);
            this.presenter.setupEvents();
        }

        showLabel(text) {
            this._label = new St.Label({ text: text, style_class: "sermon-section-item-text" });
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

            const button_icon = new St.Icon({ icon_name: iconName, icon_size: 14 });
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
