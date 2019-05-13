"use strict";

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.src.util.log;

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

    setupClickableEvents(running, action) {
        super.setupEvents();

        this.action = action;
        this.view.showButton(running);
        this.events["onClick"] = this.view.addButtonClickEvent();
    }

    onClick() {
        Log.d(this.LOGTAG, `On click: "${this.labelText}"`);
        this.view.hideButton();
        this.action(this.id);
    }
}
