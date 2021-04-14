"use strict";

const Me = imports.misc.extensionUtils.getCurrentExtension();
const { GObject, St } = imports.gi;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const Factory = Me.imports.src.presentation.factories;
const Pager = Me.imports.src.presentation.pager;
const {
    MenuPresenter,
    SectionPresenter,
    SectionItemPresenter,
    ClickableSectionItemPresenter,
    RunnableSectionItemPresenter,
} = Me.imports.src.presentation.presenters;

/* exported MenuView */
var MenuView = GObject.registerClass(
    class MenuView extends PanelMenu.Button {
        _init() {
            super._init(0.0);
            this.presenter = new MenuPresenter(this, {
                factory: Factory,
            });
            this.presenter.setupEvents();
            this.presenter.setupView();
        }

        addClickEvent() {
            let that = this;
            return this.actor.connect("button_press_event", () =>
                that.presenter.onClick()
            );
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
                let icon = Factory.buildIcon(
                    section,
                    Factory.IconType.STATUS_AREA,
                    isFirst,
                    isLast
                );
                layout.add_child(icon);
            });
            this.actor.add_child(layout);
        }

        showSectionContainer() {
            this._sectionContainerView = new PopupMenu.PopupBaseMenuItem({
                style_class: "sermon-section-container",
            });
            this.menu.addMenuItem(this._sectionContainerView);
        }

        showSection(sectionView, position) {
            if (!(sectionView instanceof SectionView)) {
                throw new TypeError(
                    "Section must be an instance of SectionView!"
                );
            }
            this._sectionContainerView.actor.insert_child_at_index(
                sectionView,
                position
            );
        }

        hideSection(sectionView) {
            this._sectionContainerView.actor.remove_actor(sectionView);
            sectionView.destroy();
        }

        buildSectionView(section) {
            const icon = Factory.buildIcon(
                section,
                Factory.IconType.SECTION_TITLE
            );
            return new SectionView({ section: section, icon: icon });
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
         * @param {string} params.section
         * @param {St.Icon} params.icon
         */
        _init(params) {
            super._init({
                vertical: true,
                x_expand: false,
                y_expand: true,
                style_class: "sermon-section",
            });
            this.asString = params.section;
            this.presenter = new SectionPresenter(this, {
                factory: Factory,
                pager: Pager,
                section: params.section,
                icon: params.icon,
            });
        }

        showHeader(title, icon) {
            const titleView = new PopupMenu.PopupBaseMenuItem({ hover: false });
            const label = new St.Label({
                text: title,
                style_class: "sermon-section-title",
            });
            titleView.add_actor(
                new St.Bin({
                    child: label,
                    x_expand: true,
                    y_expand: true,
                    x_align: St.Align.END,
                    y_align: St.Align.START,
                })
            );
            titleView.actor.add(icon);
            this.add_actor(titleView);

            const separatorView = new PopupMenu.PopupSeparatorMenuItem();
            this.add_actor(separatorView);
        }

        buildSectionItemView(section, id, labelText) {
            return new SectionItemView({
                factory: Factory,
                section: section,
                id: id,
                labelText: labelText,
            });
        }

        buildClickableSectionItemView(section, id, labelText, action) {
            return new ClickableSectionItemView({
                factory: Factory,
                section: section,
                id: id,
                labelText: labelText,
                action: action,
            });
        }

        buildRunnableSectionItemView(
            section,
            id,
            labelText,
            isEnabled,
            isRunning,
            canBeEnabled
        ) {
            return new RunnableSectionItemView({
                factory: Factory,
                section: section,
                id: id,
                labelText: labelText,
                isEnabled: isEnabled,
                isRunning: isRunning,
                canBeEnabled: canBeEnabled,
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
    class SectionItemView extends PopupMenu.PopupBaseMenuItem {
        /**
         * @param {Factory} params.factory
         * @param {string} params.section
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
            this._label = new St.Label({
                text: text,
                style_class: "sermon-section-item-text",
            });
            const labelBin = new St.Bin({ child: this._label });
            this.add_actor(labelBin);
        }

        addMouseOverEvent() {
            return this.connect("notify::active", () =>
                this.presenter.onMouseOver()
            );
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
         * @param {Factory} params.factory
         * @param {string} params.section
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
            return this.connect("activate", () =>
                this.presenter.onMouseClick()
            );
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
         * @param {Factory} params.factory
         * @param {string} params.section
         * @param {string} params.id
         * @param {string} params.labelText
         * @param {boolean} params.isEnabled
         * @param {boolean} params.isRunning
         * @param {boolean} params.canBeEnabled
         */
        _init(params) {
            super._init(params);
            this.buttons = {};
            this.presenter.setupRunnableEvents(
                params.isEnabled,
                params.isRunning,
                params.canBeEnabled
            );
        }

        setup(params) {
            this.presenter = new RunnableSectionItemPresenter(this, params);
        }

        showButton(type) {
            this.buttons[type] = this._buildButton(type);
            this.add_actor(this.buttons[type]);
            return this.buttons[type].connect("clicked", () =>
                this.presenter.onButtonClicked(type)
            );
        }

        _buildButton(type) {
            const icon = Factory.buildItemActionIcon(type);
            const button = new St.Button({
                style_class: "sermon-section-item-button",
            });
            button.set_child(icon);
            return button;
        }

        hideButtons() {
            Object.keys(this.buttons).forEach((type) => {
                const button = this.buttons[type];
                this.remove_actor(button);
            });
        }
    }
);
