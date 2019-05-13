"use strict";

/* exported SectionTitlePresenter */
class SectionTitlePresenter {
    /**
     * @param {SectionTitleView} view 
     * @param {string} params.text 
     * @param {St.Icon} params.icon 
     */
    constructor(view, params) {
        this.view = view;

        this.view.showText(params.text);
        this.view.showIcon(params.icon);
    }
}
