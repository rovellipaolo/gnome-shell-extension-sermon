"use strict";

const Me = imports.misc.extensionUtils.getCurrentExtension();

const Log = Me.imports.src.util.log;

const MORE_ITEMS_ID = "#00#";
const MORE_ITEMS_LABEL_TEXT = "...";

/* exported MenuPresenter */
class MenuPresenter {
    /**
     * @param {MenuView} view
     * @param {Settings} settings
     * @param {SystemdRepository} systemdRepository 
     * @param {DockerRepository} dockerRepository 
     */
    constructor(view, settings, systemdRepository, dockerRepository) {
        this.LOGTAG = "MenuPresenter";
        this.view = view;
        this.settings = settings;
        this.dockerRepository = dockerRepository;
        this.systemdRepository = systemdRepository;
        this.events = {};
        this.sections = {};

        this.view.showIcon();
    }

    setupEvents() {
        this.events["onClick"] = this.view.addClickEvent();
        Log.d(this.LOGTAG, `Added "onClick" event: ${this.events["onClick"]}`);
    }

    setupView() {
        Log.d(this.LOGTAG, "Rendering menu...");
        this.view.clear();

        this.view.showSectionContainer();
        var position = 0;
        if (this.settings.isSystemdSectionEnabled()) {
            this._addSystemdSectionAtPosition(position);
            position++;
        }
        if (this.settings.isDockerSectionEnabled()) {
            this._addDockerSectionAtPosition(position);
        }

        this.view.show();
    }

    _addSystemdSectionAtPosition(position) {
        if (this.systemdRepository.isSystemdInstalled()) {
            this.sections["systemd"] = this.view.buildSystemdSectionView();
            const itemsPromise = this.systemdRepository.getServices();

            const buildItemLabelText = (item) => item.name;
            const buildItemAction = (item) => item.isRunning ?
                (actor, _) => this.systemdRepository.stopService(actor) :
                (actor, _) => this.systemdRepository.startService(actor);

            const systemdPriorityList = this.settings.getSystemdSectionItemsPriorityList();
            this._addSection(this.sections["systemd"], position, itemsPromise, systemdPriorityList, buildItemLabelText, buildItemAction);
        } else {
            Log.e(this.LOGTAG, "Systemd is not installed!");
        }
    }

    _addDockerSectionAtPosition(position) {
        if (this.dockerRepository.isDockerInstalled()) {
            this.sections["docker"] = this.view.buildDockerSectionView();
            const itemsPromise = this.dockerRepository.getContainers();

            const buildItemLabelText = (item) => item.names.length > 0 ?
                `${item.names[0]} (${item.id})` :
                `- (${item.id})`;
            const buildItemAction = (item) => item.isRunning ?
                (actor, _) => this.dockerRepository.stopContainer(actor) :
                (actor, _) => this.dockerRepository.startContainer(actor);

            const dockerPriorityList = this.settings.getDockerSectionItemsPriorityList();
            this._addSection(this.sections["docker"], position, itemsPromise, dockerPriorityList, buildItemLabelText, buildItemAction);
        } else {
            Log.e(this.LOGTAG, "Docker is not installed!");
        }
    }

    _addSection(section, position, itemsPromise, priorityItems, buildItemLabelText, buildItemAction) {
        this.view.showSection(section, position);
        this._addSectionItems(section, itemsPromise, priorityItems, buildItemLabelText, buildItemAction);
    }

    _addSectionItems(section, itemsPromise, itemsPriority, buildItemLabelText, buildItemAction = null) {
        const maxItemsPerSection = this.settings.getMaxItemsPerSection();
        itemsPromise
            .then(items => {
                items
                    .sort((item1, item2) => this._sortItemsByRunningStatus(item1, item2))
                    .sort((item1, item2) => this._sortItemsByIdsPriority(itemsPriority, item1, item2))
                    .slice(0, maxItemsPerSection - 1)
                    .forEach(item => {
                        if (buildItemAction !== null) {
                            let serviceItem = this.view.buildClickableSectionItemView(item.id, buildItemLabelText(item), item.isRunning, buildItemAction(item));
                            this.view.showSectionItem(section, serviceItem);
                        } else {
                            let serviceItem = this.view.buildSectionItemView(item.id, buildItemLabelText(item), item.isRunning, buildItemAction(item));
                            this.view.showSectionItem(section, serviceItem);
                        }
                    });

                if (items.length > maxItemsPerSection) {
                    let moreItem = this.view.buildSectionItemView(MORE_ITEMS_ID, MORE_ITEMS_LABEL_TEXT);
                    this.view.showSectionItem(section, moreItem);
                }
            })
            .catch(error => {
                Log.e(this.LOGTAG, `Error retrieving items: ${error}`);
                this.view.showErrorSectionItem(error);
            });
    }

    _sortItemsByRunningStatus(item1, item2) {
        return item1.isRunning === item2.isRunning ? 0 : item1.isRunning ? -1 : 1;
    }

    _sortItemsByIdsPriority(itemsPriority, item1, item2) {
        if (itemsPriority.length === 0) {
            return 0;
        }
        const item1IsPrioritised = itemsPriority.includes(item1.id);
        return item1IsPrioritised === itemsPriority.includes(item2.id) ? 0 : item1IsPrioritised ? -1 : 1;
    }

    onClick() {
        Log.d(this.LOGTAG, "On click menu");
        if (this.view.isOpen()) {
            Log.d(this.LOGTAG, "Refreshing menu...");
            this.setupView();
        }
    }

    onDestroy() {
        Object.keys(this.events).forEach((event) => {
            const id = this.events[event];
            Log.d(this.LOGTAG, `Remove "${event}" event: ${id}`);
            this.view.removeEvent(id);
        });
        this.events = {};
    }
}
