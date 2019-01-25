"use strict";

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.src.util.log;

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
