"use strict";

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
