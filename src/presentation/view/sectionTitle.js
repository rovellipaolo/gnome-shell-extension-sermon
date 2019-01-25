"use strict";

const Class = imports.lang.Class;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;

const SectionTitlePresenter = Me.imports.src.presentation.presenter.sectionTitle.SectionTitlePresenter;

/**
 * Title of a menu section.
 */
/* exported SectionTitleView */
const SectionTitleView = new Class({
    Name: "SectionTitle",
    Extends: PopupMenu.PopupBaseMenuItem,

    /**
     * @param {string} text 
     * @param {St.Icon} icon 
     */
    _init: function(text, icon) {
        this.parent({ hover: false, style_class: "menu-section-title" });
        this.asString = text;
        this.presenter = new SectionTitlePresenter(this, text, icon);
    },

    showText: function(text) {
        const label = new St.Label({ text: text, style_class: "menu-section-title-text" });
        const labelBin = new St.Bin({ child: label });
        this.actor.add(labelBin);
    },

    showIcon: function(icon) {
        this.actor.add(icon, { expand: true, x_fill: false, x_align: St.Align.END });
    }
});
