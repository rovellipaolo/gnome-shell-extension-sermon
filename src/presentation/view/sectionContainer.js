"use strict";

const Class = imports.lang.Class;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const PopupMenu = imports.ui.popupMenu;

const SectionView = Me.imports.src.presentation.view.section.SectionView;
const SectionContainerPresenter = Me.imports.src.presentation.presenter.sectionContainer.SectionContainerPresenter;

/**
 * Container of one or more menu sections.
 */
/* exported SectionContainerView */
const SectionContainerView = new Class({
    Name: "SectionContainer",
    Extends: PopupMenu.PopupBaseMenuItem,

    _init: function() {
        this.parent({ style_class: "menu-section-container" });
        this.presenter = new SectionContainerPresenter(this);
    },

    addSection: function(section, position) {
        if (!(section instanceof SectionView)) {
            throw new TypeError("Section must be an instance of SectionView!");
        }
        this.presenter.onSectionAdded(section, position);
    },

    showSection: function(section, position) {
        this.actor.insert_child_at_index(section, position);
    },

    hideSection: function(section) {
        this.actor.remove_actor(section);
        section.destroy();
    },

    destroy: function() {
        this.presenter.onDestroy();
        this.parent();
    }
});
