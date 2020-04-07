"use strict";

const Me = imports.misc.extensionUtils.getCurrentExtension();

const Log = Me.imports.src.util.log;

const MORE_ITEMS_ID = "#00#";
const MORE_ITEMS_LABEL_TEXT = "...";

/* exported MenuPresenter */
class MenuPresenter {
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
        this.sections.forEach((section, index) => this._addSection(section, index));
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
        Object.keys(this.events).forEach(event => {
            const id = this.events[event];
            Log.d(this.LOGTAG, `Remove "${event}" event: ${id}`);
            this.view.removeEvent(id);
        });
        this.events = {};
    }

    _removeViews() {
        Object.keys(this.views).forEach(section => {
            const sectionView = this.views[section];
            Log.i(this.LOGTAG, `Remove section: "${sectionView.asString}"`);
            this.view.hideSection(sectionView);
        });
        this.views = {};
    }
}

/* exported SectionPresenter */
class SectionPresenter {
    /**
     * @param {SectionView} view 
     * @param {Factory} params.factory 
     * @param {Pager} params.pager 
     * @param {string} params.title 
     * @param {string} params.icon 
     */
    constructor(view, params) {
        this.LOGTAG = "SectionPresenter";
        this.view = view;
        this.factory = params.factory;
        this.pager = params.pager;
        this.title = params.title;
        this.icon = params.icon;
        this.items = [];
        this.page = this.pager.getFirstPage();

        this.setupView();
    }

    setupView() {
        this.view.showHeader(this.title, this.icon);
        this.factory.buildVersion(this.title)
            .then(version => this.view.showHeaderSubTitle(version))
            .catch(error => Log.d(this.LOGTAG, `Error retrieving ${this.title} version: ${error}`));
        this._addItems();
    }

    _addItems() {
        const getItems = this.factory.buildGetItemsAction(this.title);
        getItems()
            .then(items => {
                const firstItemInPage = this.pager.getFistItemInPage(this.page);
                const lastItemInPage = this.pager.getLastItemInPage(this.page);
                Log.d(this.LOGTAG, `Showing section ${this.title} page ${this.page} (${firstItemInPage}-${lastItemInPage})`);

                if (!this.pager.isFirstPage(this.page)) {
                    this._addItemWithRefreshPageAction(this.page - 1);
                }

                items
                    .slice(firstItemInPage, lastItemInPage + 1)
                    .forEach(item => this._addItem(item));

                if (!this.pager.isLastPage(this.page, items)) {
                    this._addItemWithRefreshPageAction(this.page + 1);
                }
            })
            .catch(error => {
                Log.e(this.LOGTAG, `Error retrieving items: ${error}`);
                this._addErrorItem(error);
            });
    }

    _addItem(item) {
        const label = this.factory.buildItemLabel(this.title, item);
        const action = this.factory.buildItemAction(this.title, item);
        const itemView = (action !== null) ?
            this.view.buildRunnableSectionItemView(item.id, label, action, item.isRunning) :
            this.view.buildSectionItemView(item.id, label);
        this.onItemAdded(itemView);
    }

    _addErrorItem(error) {
        const itemView = this.view.buildErrorSectionItem(error);
        this.onItemAdded(itemView);
    }

    _addItemWithRefreshPageAction(nextPage) {
        const changePageAction = () => {
            this.page = nextPage;
            this.onDestroy();
            this._addItems();
        }
        const itemView = this.view.buildClickableSectionItemView(MORE_ITEMS_ID, MORE_ITEMS_LABEL_TEXT, changePageAction);
        this.onItemAdded(itemView);
    }

    onItemAdded(itemView) {
        Log.i(this.LOGTAG, `Add item: "${itemView.asString}"`);
        this.items.push(itemView);
        this.view.showItem(itemView);
    }

    onDestroy() {
        this.items.forEach(item => {
            this.view.hideItem(item);
        });
        this.items = [];
    }
}

/* exported SectionItemPresenter */
class SectionItemPresenter {
    /**
     * @param {SectionItemView} view 
     * @param {string} params.id 
     * @param {string} params.labelText 
     */
    constructor(view, params) {
        this.LOGTAG = "SectionItemPresenter";
        this.view = view;
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
        Object.keys(this.events).forEach((event) => {
            const id = this.events[event];
            Log.d(this.LOGTAG, `Remove "${event}" event: ${id}`);
            this.view.removeEvent(id);
        });
        this.events = {};
    }
}

/* exported ClickableSectionItemPresenter */
class ClickableSectionItemPresenter extends SectionItemPresenter {
    /**
     * @param {SectionItemView} view 
     * @param {string} params.id 
     * @param {string} params.labelText 
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
}

/* exported RunnableSectionItemPresenter */
class RunnableSectionItemPresenter extends SectionItemPresenter {
    /**
     * @param {SectionItemView} view 
     * @param {string} params.id 
     * @param {string} params.labelText 
     */
    constructor(view, params) {
        super(view, params);
        this.LOGTAG = "RunnableSectionItemPresenter";
    }

    setupRunnableEvents(action, running) {
        super.setupEvents();

        this.action = action;
        this.view.showButton(running);
        this.events["onClick"] = this.view.addButtonClickEvent();
    }

    onButtonClick() {
        Log.d(this.LOGTAG, `On click: "${this.labelText}"`);
        this.view.hideButton();
        this.action(this.id);
    }
}
