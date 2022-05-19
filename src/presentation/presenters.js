"use strict";

const Me = imports.misc.extensionUtils.getCurrentExtension();

const Log = Me.imports.src.util.log;

const MORE_ITEMS_ID = "#00#";
const MORE_ITEMS_LABEL_TEXT = "...";

/* exported MenuPresenter */
var MenuPresenter = class MenuPresenter {
    /**
     * @param {MenuView} view
     * @param {Factory} params.factory
     */
    constructor(view, params) {
        this.LOGTAG = "MenuPresenter";
        this.view = view;
        this.factory = params.factory;
        this.events = {};
        this.views = {};
        this.sections = this.factory.buildActiveSections();

        this.view.showIcon(this.sections);
    }

    setupEvents() {
        this.events["onClick"] = this.view.addClickEvent();
        Log.d(this.LOGTAG, `Added "onClick" event: ${this.events["onClick"]}`);
    }

    setupView() {
        Log.d(this.LOGTAG, "Rendering menu...");
        this.view.clear();

        this.view.showSectionContainer();
        this.sections.forEach((section, index) =>
            this._addSection(section, index)
        );
    }

    _addSection(section, position) {
        const sectionView = this.view.buildSectionView(section);
        Log.i(this.LOGTAG, `Add section: "${sectionView.asString}"`);

        this.views[section] = sectionView;
        this.view.showSection(sectionView, position);
    }

    onClick() {
        Log.d(this.LOGTAG, "On click menu");
        if (this.view.isOpen()) {
            Log.d(this.LOGTAG, "Refreshing menu...");
            this.sections = this.factory.buildActiveSections();
            this.setupView();
        }
    }

    onDestroy() {
        Log.i(this.LOGTAG, `Events: "${this.events}"`);
        Log.i(this.LOGTAG, `Views: "${this.views}"`);
        this._removeEvents();
        this._removeViews();
    }

    _removeEvents() {
        Object.keys(this.events).forEach((event) => {
            const id = this.events[event];
            Log.d(this.LOGTAG, `Remove "${event}" event: ${id}`);
            this.view.removeEvent(id);
        });
        this.events = {};
    }

    _removeViews() {
        Object.keys(this.views).forEach((section) => {
            const sectionView = this.views[section];
            Log.i(this.LOGTAG, `Remove section: "${sectionView.asString}"`);
            this.view.hideSection(sectionView);
        });
        this.views = {};
    }
};

/* exported SectionPresenter */
var SectionPresenter = class SectionPresenter {
    /**
     * @param {SectionView} view
     * @param {Factory} params.factory
     * @param {Pager} params.pager
     * @param {string} params.section
     * @param {string} params.icon
     */
    constructor(view, params) {
        this.LOGTAG = "SectionPresenter";
        this.view = view;
        this.factory = params.factory;
        this.pager = params.pager;
        this.section = params.section;
        this.icon = params.icon;
        this.items = [];
        this.page = this.pager.getFirstPage();

        this.setupView();
    }

    setupView() {
        this.view.showHeader(this.section, this.icon);
        this._addItems();
    }

    _addItems() {
        const getItems = this.factory.buildGetItemsAction(this.section);
        getItems()
            .then((items) => {
                const firstItemInPage = this.pager.getFistItemInPage(this.page);
                const lastItemInPage = this.pager.getLastItemInPage(this.page);
                Log.d(
                    this.LOGTAG,
                    `Showing section ${this.section} page ${this.page} (${firstItemInPage}-${lastItemInPage})`
                );

                if (!this.pager.isFirstPage(this.page)) {
                    this._addItemWithRefreshPageAction(this.page - 1);
                }

                items
                    .slice(firstItemInPage, lastItemInPage + 1)
                    .forEach((item) => this._addItem(item));

                if (!this.pager.isLastPage(this.page, items)) {
                    this._addItemWithRefreshPageAction(this.page + 1);
                }
            })
            .catch((error) => {
                Log.e(this.LOGTAG, `Error retrieving items: ${error.message}`);
                this._addErrorItem(error.message);
            });
    }

    _addItem(item) {
        const label = this.factory.buildItemLabel(this.section, item);
        const itemView = this.view.buildRunnableSectionItemView(
            this.section,
            item.id,
            label,
            item.isEnabled,
            item.isRunning,
            item.canBeEnabled
        );
        this.showItem(itemView);
    }

    _addErrorItem(error) {
        const itemView = this.view.buildSectionItemView(this.section, 0, error);
        this.showItem(itemView);
    }

    _addItemWithRefreshPageAction(nextPage) {
        const changePageAction = () => {
            this.page = nextPage;
            this.onDestroy();
            this._addItems();
        };
        const itemView = this.view.buildClickableSectionItemView(
            this.section,
            MORE_ITEMS_ID,
            MORE_ITEMS_LABEL_TEXT,
            changePageAction
        );
        this.showItem(itemView);
    }

    showItem(itemView) {
        Log.i(this.LOGTAG, `Add item: "${itemView.asString}"`);
        this.items.push(itemView);
        this.view.showItem(itemView);
    }

    onDestroy() {
        this.items.forEach((itemView) => {
            Log.i(this.LOGTAG, `Remove item: "${itemView.asString}"`);
            this.view.hideItem(itemView);
        });
        this.items = [];
    }
};

/* exported SectionItemPresenter */
var SectionItemPresenter = class SectionItemPresenter {
    /**
     * @param {SectionItemView} view
     * @param {Factory} params.factory
     * @param {string} params.section
     * @param {string} params.id
     * @param {string} params.labelText
     */
    constructor(view, params) {
        this.LOGTAG = "SectionItemPresenter";
        this.view = view;
        this.factory = params.factory;
        this.section = params.section;
        this.id = params.id;
        this.labelText = params.labelText;
        this.events = {};

        this.view.showLabel(params.labelText);
    }

    setupEvents() {
        this.events["onMouseOver"] = this.view.addMouseOverEvent();
    }

    onMouseOver() {
        Log.d(this.LOGTAG, `On mouse over: "${this.labelText}"`);
        this.view.showFullLabel();
    }

    onDestroy() {
        Object.keys(this.events).forEach((type) => {
            const id = this.events[type];
            Log.d(this.LOGTAG, `Remove "${type}" event: ${id}`);
            this.view.removeEvent(id);
        });
        this.events = {};
    }
};

/* exported ClickableSectionItemPresenter */
var ClickableSectionItemPresenter = class ClickableSectionItemPresenter extends SectionItemPresenter {
    /**
     * @param {SectionItemView} view
     * @param {Factory} params.factory
     * @param {string} params.section
     * @param {string} params.id
     * @param {string} params.labelText
     * @param {Function} params.action
     */
    constructor(view, params) {
        super(view, params);
        this.LOGTAG = "ClickableSectionItemPresenter";
    }

    setupClickableEvents(action) {
        super.setupEvents();

        this.action = action;
        this.events["onClick"] = this.view.addMouseClickEvent();
    }

    onMouseClick() {
        Log.d(this.LOGTAG, `On click: "${this.labelText}"`);
        this.action(this.id);
    }
};

/* exported RunnableSectionItemPresenter */
var RunnableSectionItemPresenter = class RunnableSectionItemPresenter extends SectionItemPresenter {
    /**
     * @param {SectionItemView} view
     * @param {Factory} params.factory
     * @param {string} params.section
     * @param {string} params.id
     * @param {string} params.labelText
     * @param {boolean} params.isEnabled
     * @param {boolean} params.isRunning
     * @param {boolean} params.canBeEnabled
     */
    constructor(view, params) {
        super(view, params);
        this.LOGTAG = "RunnableSectionItemPresenter";
        this.actions = {};
    }

    setupRunnableEvents(isEnabled, isRunning, canBeEnabled) {
        super.setupEvents();

        let actionTypes = this.factory.buildItemActionTypes(
            isEnabled,
            isRunning,
            canBeEnabled
        );
        actionTypes.forEach((type) => {
            const action = this.factory.buildItemAction(this.section, type);
            if (action !== null) {
                this.actions[type] = action;
                this.events[type] = this.view.showButton(type);
            }
        });
    }

    onButtonClicked(type) {
        Log.d(this.LOGTAG, `On "${type}" button clicked: "${this.labelText}"`);
        this.view.hideButtons();
        this.actions[type](this.id);
    }

    onDestroy() {
        super.onDestroy();
        this.actions = {};
    }
};
