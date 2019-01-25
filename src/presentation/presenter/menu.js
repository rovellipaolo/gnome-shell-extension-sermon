"use strict";

const Me = imports.misc.extensionUtils.getCurrentExtension();

const Log = Me.imports.src.util.log;

/* exported MenuPresenter */
class MenuPresenter {
    constructor(view, dockerRepository) {
        this.LOGTAG = "MenuPresenter";
        this.view = view;
        this.dockerRepository = dockerRepository;
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
        this._addDockerSection();

        this.view.show();
    }

    _addDockerSection() {
        this.sections["docker"] = this.view.buildDockerSectionView();
        this.view.showSection(this.sections["docker"], 0);

        if (this.dockerRepository.isDockerInstalled()) {
            this._addDockerSectionItems();
        } else {
            Log.e(this.LOGTAG, "Docker not installed!");
            this.view.showErrorSectionItem("Docker not installed!");
        }
    }

    _addDockerSectionItems() {
        this.dockerRepository.getContainers()
            .then(containers => {
                containers
                    .sort((con1, con2) => this._sortRunningContainersFirst(con1, con2))
                    .forEach(container => {
                        let displayLabel = this._buildMenuItemLabel(container);
                        var action = this._buildMenuItemAction(container.isRunning);

                        let containerItem = this.view.buildDockerSectionItemView(container.id, displayLabel, container.isRunning, action);
                        this.view.showSectionItem(this.sections["docker"], containerItem);
                    });
            })
            .catch(error => {
                Log.e(this.LOGTAG, `Error retrieving docker containers: ${error}`);
                this.view.showErrorSectionItem(error);
            });
    }

    _sortRunningContainersFirst(con1, con2) {
        return con1.isRunning === con2.isRunning ? 0 : con1.isRunning ? -1 : 1;
    }

    _buildMenuItemLabel(container) {
        return container.names.length > 0 ?
            `${container.names[0]} (${container.id})` :
            `- (${container.id})`;
    }

    _buildMenuItemAction(isRunning) {
        return isRunning ?
            (actor, _) => this.dockerRepository.stopContainer(actor) :
            (actor, _) => this.dockerRepository.startContainer(actor);
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
