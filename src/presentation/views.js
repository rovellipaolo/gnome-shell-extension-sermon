import GObject from "gi://GObject";
import St from "gi://St";

import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";

import * as Factory from "./factories.js";
import * as Pager from "./pager.js";
import {
    MenuPresenter,
    SectionPresenter,
    SectionItemPresenter,
    ClickableSectionItemPresenter,
    RunnableSectionItemPresenter,
} from "./presenters.js";

export const MenuView = GObject.registerClass(
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
            return this.connect("button_press_event", () =>
                that.presenter.onClick(),
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
                    isLast,
                );
                layout.add_child(icon);
            });
            this.add_child(layout);
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
                    "Section must be an instance of SectionView!",
                );
            }
            this._sectionContainerView.actor.insert_child_at_index(
                sectionView,
                position,
            );
        }

        hideSection(sectionView) {
            this._sectionContainerView.actor.remove_child(sectionView);
            sectionView.destroy();
        }

        buildSectionView(section) {
            const icon = Factory.buildIcon(
                section,
                Factory.IconType.SECTION_TITLE,
            );
            return new SectionView({ section: section, icon: icon });
        }

        removeEvent(eventId) {
            this.disconnect(eventId);
        }

        destroy() {
            this.presenter.onDestroy();
            super.destroy();
        }
    },
);

/**
 * Single menu section.
 */
export const SectionView = GObject.registerClass(
    class SectionView extends St.BoxLayout {
        /**
         * @param {string} params.section
         * @param {St.Icon} params.icon
         */
        _init(params) {
            super._init({
                style_class: "sermon-section",
                vertical: true,
                x_expand: false,
                y_expand: true,
            });
            this.asString = params.section;
            this.presenter = new SectionPresenter(this, {
                factory: Factory,
                pager: Pager,
                section: params.section,
                icon: params.icon,
            });
            this.presenter.setupView();
        }

        showHeader(title, icon) {
            const titleView = new PopupMenu.PopupBaseMenuItem({
                style_class: "sermon-section-header-container",
                hover: false,
            });
            const label = new St.Label({
                style_class: "sermon-section-header-text",
                text: title,
            });
            titleView.add_child(
                new St.Bin({
                    child: label,
                    x_expand: true,
                    y_expand: true,
                }),
            );
            titleView.actor.add_child(icon);
            this.add_child(titleView);

            const separatorView = new PopupMenu.PopupSeparatorMenuItem();
            this.add_child(separatorView);
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
            canBeEnabled,
            isUser = false,
        ) {
            return new RunnableSectionItemView({
                factory: Factory,
                section: section,
                id: id,
                labelText: labelText,
                isEnabled: isEnabled,
                isRunning: isRunning,
                canBeEnabled: canBeEnabled,
                isUser: isUser,
            });
        }

        showItem(itemView) {
            this.add_child(itemView.actor);
        }

        hideItem(itemView) {
            this.remove_child(itemView.actor);
        }

        destroy() {
            this.presenter.onDestroy();
            super.destroy();
        }
    },
);

/**
 * Item of a menu section.
 */
export const SectionItemView = GObject.registerClass(
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
                style_class: "sermon-section-item-text",
                text: text,
            });
            const labelBin = new St.Bin({ child: this._label });
            this.add_child(labelBin);
        }

        addMouseOverEvent() {
            return this.connect("notify::active", () =>
                this.presenter.onMouseOver(),
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
    },
);

/**
 * Clickable item of a menu section.
 */
export const ClickableSectionItemView = GObject.registerClass(
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
                this.presenter.onMouseClick(),
            );
        }
    },
);

/**
 * Runnable item of a menu section.
 */
export const RunnableSectionItemView = GObject.registerClass(
    class RunnableSectionItemView extends SectionItemView {
        /**
         * @param {Factory} params.factory
         * @param {string} params.section
         * @param {string} params.id
         * @param {string} params.labelText
         * @param {boolean} params.isEnabled
         * @param {boolean} params.isRunning
         * @param {boolean} params.canBeEnabled
         * @param {boolean} params.isUser
         */
        _init(params) {
            super._init(params);
            this.buttons = {};
            this.presenter.setupRunnableEvents(
                params.isEnabled,
                params.isRunning,
                params.canBeEnabled,
                params.isUser,
            );
        }

        setup(params) {
            this.presenter = new RunnableSectionItemPresenter(this, params);
        }

        showButton(type) {
            this.buttons[type] = this._buildButton(type);
            this.add_child(this.buttons[type]);
            return this.buttons[type].connect("clicked", () =>
                this.presenter.onButtonClicked(type),
            );
        }

        _buildButton(type) {
            const icon = Factory.buildItemActionIcon(type);
            icon.connect("notify::hover", (widget) =>
                widget.set_opacity(widget.hover ? 80 : 255),
            );
            const button = new St.Button({
                style_class: "sermon-section-item-button",
            });
            button.set_child(icon);
            return button;
        }

        hideButtons() {
            Object.keys(this.buttons).forEach((type) => {
                const button = this.buttons[type];
                this.remove_child(button);
            });
        }
    },
);
