"use strict";

const Class = imports.lang.Class;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;

const SectionItemView = Me.imports.src.presentation.view.sectionItem.SectionItemView;
const SectionTitleView = Me.imports.src.presentation.view.sectionTitle.SectionTitleView;
const SectionPresenter = Me.imports.src.presentation.presenter.section.SectionPresenter;

/**
 * Single menu section.
 */
/* exported SectionView */
const SectionView = new Class({
    Name: "Section",
    Extends: St.BoxLayout,

    _init: function(title) {
        if (!(title instanceof SectionTitleView)) {
            throw new TypeError("Title must be an instance of SectionTitleView!");
        }

        this.parent( { vertical: true, style_class: "menu-section" });
        this.asString = title.asString;
        this.presenter = new SectionPresenter(this, title);
    },

    showTitle: function(title) {
        this.add_actor(title.actor);
        this.add_actor((new PopupMenu.PopupSeparatorMenuItem()).actor);
    },

    addItem: function(item) {
        if (!(item instanceof SectionItemView)) {
            throw new TypeError("Item must be an instance of SectionItemView!");
        }
        this.presenter.onItemAdded(item);
    },

    showItem: function(item) {
        this.add_actor(item.actor);
    },

    hideItem: function(item) {
        this.remove_actor(item.actor);
    },

    destroy: function() {
        this.presenter.onDestroy();
        this.parent();
    }
});
