"use strict";

const Me = imports.misc.extensionUtils.getCurrentExtension();

const Log = Me.imports.src.util.log;

const MORE_ITEMS_ID = "#00#";
const MORE_ITEMS_LABEL_TEXT = "...";

/* exported MenuPresenter */
class MenuPresenter {
    /**
     * @param {MenuView} view
     * @param {Settings} params.settings
     * @param {SystemdRepository} params.systemdRepository 
     * @param {CronRepository} params.cronRepository 
     * @param {DockerRepository} params.dockerRepository 
     */
    constructor(view, params) {
        this.LOGTAG = "MenuPresenter";
        this.view = view;
        this.settings = params.settings;
        this.systemdRepository = params.systemdRepository;
        this.cronRepository = params.cronRepository;
        this.dockerRepository = params.dockerRepository;
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
        if (this.settings.isCronSectionEnabled()) {
            this._addCronSectionAtPosition(position);
            position++;
        }
        if (this.settings.isDockerSectionEnabled()) {
            this._addDockerSectionAtPosition(position);
        }
    }

    _addSystemdSectionAtPosition(position) {
        if (this.systemdRepository.isSystemdInstalled()) {
            this.sections["systemd"] = this.view.buildSystemdSectionView();
            const itemsPromise = this.systemdRepository.getServices();

            const buildItemLabelText = (item) => item.name;
            const buildItemAction = (item) => item.isRunning ?
                (actor, _) => this.systemdRepository.stopService(actor) :
                (actor, _) => this.systemdRepository.startService(actor);

            this._addSection(this.sections["systemd"], position, itemsPromise, buildItemLabelText, buildItemAction);
        } else {
            Log.e(this.LOGTAG, "Systemd is not installed!");
        }
    }

    _addCronSectionAtPosition(position) {
        if (this.cronRepository.isCronInstalled()) {
            this.sections["cron"] = this.view.buildCronSectionView();
            const itemsPromise = this.cronRepository.getJobs();

            const buildItemLabelText = (item) => item.id;

            this._addSection(this.sections["cron"], position, itemsPromise, buildItemLabelText);
        } else {
            Log.e(this.LOGTAG, "Cron is not installed!");
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

            this._addSection(this.sections["docker"], position, itemsPromise, buildItemLabelText, buildItemAction);
        } else {
            Log.e(this.LOGTAG, "Docker is not installed!");
        }
    }

    _addSection(section, position, itemsPromise, buildItemLabelText, buildItemAction = null) {
        this.view.showSection(section, position);
        this._addSectionItems(section, itemsPromise, buildItemLabelText, buildItemAction);
    }

    _addSectionItems(section, itemsPromise, buildItemLabelText, buildItemAction = null) {
        const maxItemsPerSection = this.settings.getMaxItemsPerSection();
        itemsPromise
            .then(items => {
                items
                    .slice(0, maxItemsPerSection)
                    .forEach(item => {
                        if (buildItemAction !== null) {
                            let serviceItem = this.view.buildClickableSectionItemView(item.id, buildItemLabelText(item), item.isRunning, buildItemAction(item));
                            this.view.showSectionItem(section, serviceItem);
                        } else {
                            let serviceItem = this.view.buildSectionItemView(item.id, buildItemLabelText(item));
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
                this.view.showErrorSectionItem(section, error);
            });
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
