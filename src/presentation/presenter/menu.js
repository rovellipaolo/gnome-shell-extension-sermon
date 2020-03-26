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
     * @param {CronRepository} cronRepository 
     * @param {DockerRepository} dockerRepository 
     */
    constructor(view, settings, systemdRepository, cronRepository, dockerRepository) {
        this.LOGTAG = "MenuPresenter";
        this.view = view;
        this.settings = settings;
        this.systemdRepository = systemdRepository;
        this.cronRepository = cronRepository;
        this.dockerRepository = dockerRepository;
        this.events = {};
        this.sections = {};

        this.view.showIcon();
    }

    setupEvents() {
        this.events["onClick"] = this.view.addClickEvent();
        Log.d(this.LOGTAG, `Added "onClick" event: ${this.events["onClick"]}`);
    }

    setupView(maxItemsPerSection = this.settings.getMaxItemsPerSection()) {
        Log.d(this.LOGTAG, "Rendering menu...");
        this.view.clear();

        this.view.showSectionContainer();
        var position = 0;
        if (this.settings.isSystemdSectionEnabled()) {
            this._addSystemdSectionAtPosition(position, maxItemsPerSection);
            position++;
        }
        if (this.settings.isCronSectionEnabled()) {
            this._addCronSectionAtPosition(position, maxItemsPerSection);
            position++;
        }
        if (this.settings.isDockerSectionEnabled()) {
            this._addDockerSectionAtPosition(position, maxItemsPerSection);
        }

        this.view.show();
    }

    _addSystemdSectionAtPosition(position, maxItemsPerSection) {
        if (this.systemdRepository.isSystemdInstalled()) {
            this.sections["systemd"] = this.view.buildSystemdSectionView();

            const buildItemAction = (item) => item.isRunning ?
                (actor, _) => this.systemdRepository.stopService(actor) :
                (actor, _) => this.systemdRepository.startService(actor);

            this._addSection({
                section: this.sections["systemd"],
                position: position,
                getItems: () => this.systemdRepository.getServices(),
                maxItemsPerSection: maxItemsPerSection,
                buildItemLabelText: (item) => item.name,
                buildItemAction: buildItemAction
            });
        } else {
            Log.e(this.LOGTAG, "Systemd is not installed!");
        }
    }

    _addCronSectionAtPosition(position, maxItemsPerSection) {
        if (this.cronRepository.isCronInstalled()) {
            this.sections["cron"] = this.view.buildCronSectionView();

            this._addSection({
                section: this.sections["cron"],
                position: position,
                getItems: () => this.cronRepository.getJobs(),
                maxItemsPerSection: maxItemsPerSection,
                buildItemLabelText: (item) => item.id,
                buildItemAction: null
            });
        } else {
            Log.e(this.LOGTAG, "Cron is not installed!");
        }
    }

    _addDockerSectionAtPosition(position, maxItemsPerSection) {
        if (this.dockerRepository.isDockerInstalled()) {
            this.sections["docker"] = this.view.buildDockerSectionView();

            const buildItemLabelText = (item) => item.names.length > 0 ?
                `${item.names[0]} (${item.id})` :
                `- (${item.id})`;
            const buildItemAction = (item) => item.isRunning ?
                (actor, _) => this.dockerRepository.stopContainer(actor) :
                (actor, _) => this.dockerRepository.startContainer(actor);

            this._addSection({
                section: this.sections["docker"],
                position: position,
                getItems: () => this.dockerRepository.getContainers(),
                maxItemsPerSection: maxItemsPerSection,
                buildItemLabelText: buildItemLabelText,
                buildItemAction: buildItemAction
            });
        } else {
            Log.e(this.LOGTAG, "Docker is not installed!");
        }
    }

    /**
     * @param {string} params.section 
     * @param {int} params.position 
     * @param {Function} params.getItems 
     * @param {int} params.maxItemsPerSection 
     * @param {Function} params.buildItemLabelText 
     * @param {Function} params.buildItemAction 
     */
    _addSection(params) {
        this.view.showSection(params.section, params.position);
        this._addSectionItems(params);
    }

    /**
     * @param {string} params.section 
     * @param {int} params.position 
     * @param {Function} params.getItems 
     * @param {int} params.maxItemsPerSection 
     * @param {Function} params.buildItemLabelText 
     * @param {Function} params.buildItemAction 
     */
    _addSectionItems(params) {
        params.getItems()
            .then(items => {
                items
                    .slice(0, params.maxItemsPerSection)
                    .forEach(item => {
                        if (params.buildItemAction !== null) {
                            let itemView = this.view.buildRunnableSectionItemView(
                                item.id,
                                params.buildItemLabelText(item),
                                params.buildItemAction(item),
                                item.isRunning
                            );
                            this.view.showSectionItem(params.section, itemView);
                        } else {
                            let itemView = this.view.buildSectionItemView(item.id, params.buildItemLabelText(item));
                            this.view.showSectionItem(params.section, itemView);
                        }
                    });

                if (items.length > params.maxItemsPerSection) {
                    const itemsPerSection = params.maxItemsPerSection + this.settings.getMaxItemsPerSection();
                    const addMoreAction = () => this.setupView(itemsPerSection);
                    let itemView = this.view.buildClickableSectionItemView(MORE_ITEMS_ID, MORE_ITEMS_LABEL_TEXT, addMoreAction);
                    this.view.showSectionItem(params.section, itemView);
                }
            })
            .catch(error => {
                Log.e(this.LOGTAG, `Error retrieving items: ${error}`);
                this.view.showErrorSectionItem(error);
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
