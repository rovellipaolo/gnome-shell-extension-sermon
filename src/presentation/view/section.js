"use strict";

const Me = imports.misc.extensionUtils.getCurrentExtension();
const { GObject, St } = imports.gi;
const PopupMenu = imports.ui.popupMenu;

const { SectionPresenter } = Me.imports.src.presentation.presenter.section;
const { SectionTitleView } = Me.imports.src.presentation.view.sectionTitle;
const { SectionItemView } = Me.imports.src.presentation.view.sectionItem;

/**
 * Single menu section.
 */
/* exported SectionView */
var SectionView = GObject.registerClass(
    class SectionView extends St.BoxLayout {
        /**
         * @param {string} params.title 
         */
        _init(params) {
            if (!(params.title instanceof SectionTitleView)) {
                throw new TypeError("Title must be an instance of SectionTitleView!");
            }

            super._init({ vertical: true, style_class: "menu-section" });
            this.asString = params.title.asString;
            this.presenter = new SectionPresenter(this, params);
        }

        showTitle(title) {
            this.add_actor(title.actor);
            this.add_actor((new PopupMenu.PopupSeparatorMenuItem()).actor);
        }

        addItem(item) {
            if (!(item instanceof SectionItemView)) {
                throw new TypeError("Item must be an instance of SectionItemView!");
            }
            this.presenter.onItemAdded(item);
        }

        showItem(item) {
            this.add_actor(item.actor);
        }

        hideItem(item) {
            this.remove_actor(item.actor);
        }

        destroy() {
            this.presenter.onDestroy();
            super.destroy();
        }
    }
);
