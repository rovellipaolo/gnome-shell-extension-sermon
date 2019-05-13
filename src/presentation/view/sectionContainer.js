"use strict";

const Me = imports.misc.extensionUtils.getCurrentExtension();
const PopupMenu = imports.ui.popupMenu;

const { SectionContainerPresenter } = Me.imports.src.presentation.presenter.sectionContainer;
const { SectionView } = Me.imports.src.presentation.view.section;

/**
 * Container of one or more menu sections.
 */
/* exported SectionContainerView */
var SectionContainerView = class extends PopupMenu.PopupBaseMenuItem {
    constructor() {
        super({ style_class: "menu-section-container" });
        this.presenter = new SectionContainerPresenter(this);
    }

    addSection(section, position) {
        if (!(section instanceof SectionView)) {
            throw new TypeError("Section must be an instance of SectionView!");
        }
        this.presenter.onSectionAdded(section, position);
    }

    showSection(section, position) {
        this.actor.insert_child_at_index(section, position);
    }

    hideSection(section) {
        this.actor.remove_actor(section);
        section.destroy();
    }

    destroy() {
        this.presenter.onDestroy();
        super.destroy();
    }
}
