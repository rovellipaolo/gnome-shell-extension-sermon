"use strict";

const Me = imports.misc.extensionUtils.getCurrentExtension();

const Log = Me.imports.src.util.log;

const MORE_ITEMS_ID = "#00#";
const MORE_ITEMS_LABEL_TEXT = "...";

/* exported MenuPresenter */
class MenuPresenter {
    /**
     * @param {MenuView} view
     * @param {Factory} factory 
     * @param {Pager} pager 
     */
    constructor(view, factory, pager) {
        this.LOGTAG = "MenuPresenter";
        this.view = view;
        this.factory = factory;
        this.pager = pager;
        this.events = {};
        this.views = {};
        this.sections = this.factory.buildActiveSections();

        this.pages = {};
        this.sections.forEach(section => {
            this.pages[section] = this.pager.getFirstPage();
        });

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
        this.sections.forEach((section, index) => {
            this._addSection(section, index);
        });
    }

    _addSection(section, position) {
       this.views[section] = this.view.buildSectionView(section);
       this.view.showSection(this.views[section], position);
       this._addSectionItems(section);
     }

    _addSectionItems(section) {
        const getItems = this.factory.buildGetItemsAction(section)
        getItems()
            .then(items => {
                const page = this.pages[section];
                const firstItemInPage = this.pager.getFistItemInPage(page);
                const lastItemInPage = this.pager.getLastItemInPage(page);
                Log.d(this.LOGTAG, `Showing section ${section} page ${page} (${firstItemInPage}-${lastItemInPage})`);

                if (!this.pager.isFirstPage(page)) {
                    this._addItemWithRefreshPageAction(section, page - 1);
                }

                items
                    .slice(firstItemInPage, lastItemInPage + 1)
                    .forEach(item => this._addItem(section, item));

                if (!this.pager.isLastPage(page, items)) {
                    this._addItemWithRefreshPageAction(section, page + 1);
                }
            })
            .catch(error => this._addErrorItem(section, error));
    }

    _addItem(section, item) {
        const label = this.factory.buildItemLabel(section, item);
        const action = this.factory.buildItemAction(section, item);
        const itemView = (action !== null) ?
            this.view.buildRunnableSectionItemView(item.id, label, action, item.isRunning) :
            this.view.buildSectionItemView(item.id, label);

        this.view.showSectionItem(this.views[section], itemView);
    }

    _addErrorItem(section, error) {
        Log.e(this.LOGTAG, `Error retrieving items: ${error}`);
        this.view.showErrorSectionItem(this.views[section], error);
    }

    _addItemWithRefreshPageAction(section, nextPage) {
        const changePageAction = () => {
            this.pages[section] = nextPage;
            this.setupView();
        }
        let itemView = this.view.buildClickableSectionItemView(MORE_ITEMS_ID, MORE_ITEMS_LABEL_TEXT, changePageAction);
        this.view.showSectionItem(this.views[section], itemView);
    }

    onClick() {
        Log.d(this.LOGTAG, "On click menu");
        if (this.view.isOpen()) {
            Log.d(this.LOGTAG, "Refreshing menu...");
            this.setupView();
        }
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

/* exported SectionContainerPresenter */
class SectionContainerPresenter {
    /**
     * @param {SectionContainerView} view 
     */
    constructor(view) {
        this.LOGTAG = "SectionContainerPresenter";
        this.view = view;
        this.sections = [];
    }

    onSectionAdded(section, position) {
        Log.i(this.LOGTAG, `Add section: "${section.asString}"`);
        this.sections.push(section);
        this.view.showSection(section, position);
    }

    onDestroy() {
        this.sections.forEach(section => {
            Log.i(this.LOGTAG, `Remove section: "${section.asString}"`);
            this.view.hideSection(section);
        });
        this.sections = [];
    }
}

/* exported SectionPresenter */
class SectionPresenter {
    /**
     * @param {SectionView} view 
     * @param {string} title 
     */
    constructor(view, title) {
        this.LOGTAG = "SectionPresenter";
        this.view = view;
        this.items = [];

        this.view.showTitle(title);
    }

    onItemAdded(item) {
        Log.i(this.LOGTAG, `Add item: "${item.asString}"`);
        this.items.push(item);
        this.view.showItem(item);
    }

    onDestroy() {
        this.items.forEach(item => {
            this.view.hideItem(item);
        });
        this.items = [];
    }
}

/* exported SectionTitlePresenter */
class SectionTitlePresenter {
    /**
     * @param {SectionTitleView} view 
     * @param {string} text 
     * @param {St.Icon} icon 
     */
    constructor(view, text, icon) {
        this.view = view;

        this.view.showText(text);
        this.view.showIcon(icon);
    }
}

/* exported SectionItemPresenter */
class SectionItemPresenter {
    /**
     * @param {SectionItemView} view 
     * @param {string} id 
     * @param {string} labelText 
     */
    constructor(view, id, labelText) {
        this.LOGTAG = "SectionItemPresenter";
        this.view = view;
        this.id = id;
        this.labelText = labelText;
        this.events = {};

        this.view.showLabel(labelText);
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
     * @param {string} id 
     * @param {string} labelText 
     */
    constructor(view, id, labelText) {
        super(view, id, labelText);
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
     * @param {string} id 
     * @param {string} labelText 
     */
    constructor(view, id, labelText) {
        super(view, id, labelText);
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
