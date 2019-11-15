"use strict";

const Me = imports.misc.extensionUtils.getCurrentExtension();
const { Gio, GObject, St } = imports.gi;
const PanelMenu = imports.ui.panelMenu;

const Settings = Me.imports.src.data.settings;
const CronRepository = Me.imports.src.data.cronRepository;
const DockerRepository = Me.imports.src.data.dockerRepository;
const SystemdRepository = Me.imports.src.data.systemdRepository;
const { MenuPresenter } = Me.imports.src.presentation.presenter.menu;
const {
    SectionContainerView,
    SectionView,
    SectionTitleView,
    ClickableSectionItemView,
    SectionItemView
} = Me.imports.src.presentation.view.section;

/* exported MenuView */
var MenuView = GObject.registerClass(
    class MenuView extends PanelMenu.Button {
        _init() {
            super._init(0.0);
            this.presenter = new MenuPresenter(this, {
                settings: Settings,
                systemdRepository: SystemdRepository,
                cronRepository: CronRepository,
                dockerRepository: DockerRepository
            });
            this.presenter.setupEvents();
            this.presenter.setupView();
        }

        showIcon() {
            const icon = new St.Icon({ icon_name: "system-run-symbolic", style_class: "system-status-icon" });
            const layout = new St.BoxLayout({ style_class: "menu-layout" });
            layout.add_child(icon);
            this.actor.add_child(layout);
        }

        addClickEvent() {
            let that = this;
            return this.actor.connect("button_press_event", () => that.presenter.onClick());
        }

        isOpen() {
            return this.menu.isOpen;
        }

        clear() {
            this.menu.removeAll();
        }

        showSectionContainer() {
            this._sectionContainer = new SectionContainerView();
            this.menu.addMenuItem(this._sectionContainer);
        }

        showSection(section, position) {
            this._sectionContainer.addSection(section, position);
        }

        showSectionItem(section, item) {
            section.addItem(item);
        }

        showErrorSectionItem(section, error) {
            let errorItem = new SectionItemView({ id: 0, labelText: error });
            section.addItem(errorItem);
        }

        buildSystemdSectionView() {
            const icon = Gio.icon_new_for_string(`${Me.path}/images/systemd_icon.svg`);
            const systemdIcon = new St.Icon({ gicon: icon, icon_size: "24", style_class: "menu-section-title-icon" });
            return this._buildSectionView("Systemd", systemdIcon);
        }

        buildCronSectionView() {
            const icon = Gio.icon_new_for_string(`${Me.path}/images/cron_icon.svg`);
            const cronIcon = new St.Icon({ gicon: icon, icon_size: "24", style_class: "menu-section-title-icon" });
            return this._buildSectionView("Cron", cronIcon);
        }

        buildDockerSectionView() {
            const icon = Gio.icon_new_for_string(`${Me.path}/images/docker_icon.svg`);
            const dockerIcon = new St.Icon({ gicon: icon, icon_size: "24", style_class: "menu-section-title-icon" });
            return this._buildSectionView("Docker", dockerIcon);
        }

        _buildSectionView(text, icon) {
            const title = new SectionTitleView({ text: text, icon: icon });
            return new SectionView({ title: title });
        }
        
        buildSectionItemView(id, labelText) {
            return new SectionItemView({
                id: id,
                labelText: labelText
            });
        }
        
        buildClickableSectionItemView(id, labelText, running, action) {
            return new ClickableSectionItemView({
                id: id,
                labelText: labelText,
                running: running,
                action: action
            });
        }

        removeEvent(eventId) {
            this.actor.disconnect(eventId);
        }

        destroy() {
            this.presenter.onDestroy();
            super.destroy();
        }
    }
);
