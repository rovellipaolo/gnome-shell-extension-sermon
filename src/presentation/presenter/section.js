"use strict";

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.src.util.log;

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
