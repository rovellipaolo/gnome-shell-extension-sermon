# SerMon: Service Monitor

A GNOME Shell extension for monitoring and managing systemd services, cron jobs and docker images.

You can configure it to show only the information you are interested in (e.g. only systemd services and/or docker images).

Published at: https://extensions.gnome.org/extension/1804/sermon/

**NOTE:** The master branch supports GNOME Shell _3.32_.

![SerMon screenshot](docs/images/sermon.png)

## Building and Installing

To clone the repository execute:
```shell
$ git clone https://github.com/rovellipaolo/gnome-shell-extension-sermon
$ cd gnome-shell-extension-sermon
```

To build the extension execute:
```shell
$ make build
```
**NOTE:** This will create a zip archive named `sermon@rovellipaolo-gmail.com.zip`.

To install the extension execute:
```shell
$ make install
```
**NOTE:** This will unzip the previously builded zip archive into `~/.local/share/gnome-shell/extensions/sermon@rovellipaolo-gmail.com`.

Afterwards, restart GNOME Shell: press `Alt`+`F2`, type `r` and press enter.

Finally, if not already done, enable the extension at: [https://extensions.gnome.org](https://extensions.gnome.org/local)
Or, alternatively, to enable the extension execute:
```shell
$ make enable
```
While to disable the extension execute:
```shell
$ make disable
```

## Configuring
See existing settings at: https://extensions.gnome.org/local/

![SerMon settings screenshot](docs/images/sermon_settings.png)

To change the settings go to: `org.gnome.shell.extensions.sermon.gschema.xml`
And then execute:
```shell
$ make build-settings
```

## Running Checkstyle & Tests

To run the checkstyle execute:
```shell
$ make checkstyle
```
**NOTE:** This is using [`eslint`](https://github.com/eslint/eslint) under-the-hood.

To run the tests execute:
```shell
$ make verify

...

DockerRepository.isDockerInstalled()
  ✔ when docker program is found, returns true
  ✔ when docker program is not found, returns false

DockerRepository.getContainers()
  ✔ when retrieving the containers, docker ps is executed

DockerRepository.parseContainers()
  ✔ when pasing command execution result with containers, returns a list of containers
  ✔ when pasing command execution result without containers, returns an empty list

DockerRepository.startContainer()
  ✔ when starting a container, docker start is executed

DockerRepository.stopContainer()
  ✔ when stopping a container, docker stop is executed

...

MenuPresenter()
  ✔ when initialized, there is no event in the menu
  ✔ when initialized, there is no section in the menu
  ✔ when initialized, the icon in shown in the menu

MenuPresenter.onClick()
  ✔ when clicking on the menu and this is already open, no operation is performed
  ✔ when clicking on the menu and this opens, the menu is shown

MenuPresenter.setupEvents()
  ✔ when setting up the menu events, a click event is added to the menu

MenuPresenter.setupView()
  ✔ when setting up the menu, this is cleared and shown
  ✔ when setting up the menu, the section container is shown in the menu
  ✔ when setting up the menu and systemd is not enabled, its section is not shown
  ✔ when setting up the menu and systemd is not installed, its section is not shown
  ✔ when setting up the menu and systemd is installed, its section is shown in the menu in first position
  ✔ when setting up the menu and docker is not enabled, its section is not shown
  ✔ when setting up the menu and docker is not installed, its section is not shown
  ✔ when setting up the menu and systemd is enabled and docker is installed, docker section is shown in the menu in second position
  ✔ when setting up the menu and docker is installed but systemd is disabled, docker section is shown in the menu in first position

MenuPresenter.onDestroy()
  ✔ when destroyed and without events, no operation is performed
  ✔ when destroyed and with events, all events are removed from the menu

...

✔ 201 completed
```
**NOTE:** This is using [`gjsunit`](https://github.com/philipphoffmann/gjsunit) under-the-hood.

## Debugging

To show GNOME Shell logs execute:
```shell
$ make show-logs

[SerMon] DEBUG (MenuPresenter) On click menu
[SerMon] DEBUG (MenuPresenter) Refreshing menu...
[SerMon] DEBUG (MenuPresenter) Rendering menu...
[SerMon] DEBUG (CommandLine) Executing: "systemctl list-units --type=service --all"
[SerMon] DEBUG (CommandLine) Output: ...
[SerMon] INFO (SectionContainerPresenter) Add section: "Systemd"
[SerMon] DEBUG (CommandLine) Executing: "crontab -l"
[SerMon] DEBUG (CommandLine) Output: ...
[SerMon] INFO (SectionContainerPresenter) Add section: "Cron"
[SerMon] DEBUG (CommandLine) Executing: "docker ps -a --format '{{.ID}} | {{.Status}} | {{.Names}}'"
[SerMon] DEBUG (CommandLine) Output: ...
[SerMon] INFO (SectionContainerPresenter) Add section: "Docker"
[SerMon] DEBUG (CommandLine) Executing: "docker ps -a --format '{{.ID}} | {{.Image}} | {{.Status}} | {{.Names}}'"
[SerMon] DEBUG (CommandLine) Output: ...
[SerMon] INFO (SectionPresenter) Add item: "cron"
[SerMon] INFO (SectionPresenter) Add item: "docker"
[SerMon] INFO (SectionPresenter) Add item: "memcached"
[SerMon] INFO (SectionPresenter) Add item: "mysql"
[SerMon] INFO (SectionPresenter) Add item: "..."
[SerMon] INFO (SectionPresenter) Add item: "0 * * * * /usr/local/bin/my_cron_script"
[SerMon] INFO (SectionPresenter) Add item: "0 12 * * * (cd \"/opt/my_cron_repo\"; HOME= git pull)"
[SerMon] INFO (SectionPresenter) Add item: "my_docker (123456789abc)"
[SerMon] DEBUG (ClickableSectionItemPresenter) On mouse over: "my_docker (123456789abc)"
[SerMon] DEBUG (ClickableSectionItemPresenter) On click: "my_docker (123456789abc)"
[SerMon] DEBUG (CommandLine) Executing: "docker stop 123456789abc"
[SerMon] INFO (DockerRepository) Docker container "123456789abc" stopped correctly!
[SerMon] DEBUG (MenuPresenter) Rendering menu...
```
