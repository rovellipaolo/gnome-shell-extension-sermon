"use strict";

const Me = imports.misc.extensionUtils.getCurrentExtension();
const { St } = imports.gi;
const PopupMenu = imports.ui.popupMenu;

const { SectionTitlePresenter } = Me.imports.src.presentation.presenter.sectionTitle;

/**
 * Title of a menu section.
 */
/* exported SectionTitleView */
var SectionTitleView = class extends PopupMenu.PopupBaseMenuItem {
    /**
     * @param {string} params.text 
     * @param {St.Icon} params.icon 
     */
    constructor(params) {
        super({ hover: false, style_class: "menu-section-title" });
        this.asString = params.text;
        this.presenter = new SectionTitlePresenter(this, params);
    }

    showText(text) {
        const label = new St.Label({ text: text, style_class: "menu-section-title-text" });
        const labelBin = new St.Bin({ child: label });
        this.actor.add(labelBin);
    }

    showIcon(icon) {
        this.actor.add(icon, { expand: true, x_fill: false, x_align: St.Align.END });
    }

    destroy() {
        super.destroy();
    }
};
