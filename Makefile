# Build:

.PHONY: build
build:
	gnome-extensions pack --schema=schemas/org.gnome.shell.extensions.sermon.gschema.xml --extra-source=src/ --extra-source=images/ --extra-source=prefs.xml --force

.PHONY: build-settings
build-settings:
	glib-compile-schemas schemas/


# Install:

.PHONY: install
install:
	gnome-extensions install sermon@rovellipaolo-gmail.com.shell-extension.zip --force
	echo "Remember to restart GNOME Shell: press 'Alt'+'F2', type 'r' and press enter."

.PHONY: install-checkstyle
install-checkstyle:
	npm install -g eslint@7.14
	npm install -g prettier@2.2

.PHONY: install-githooks
install-githooks:
	@pip3 install pre-commit
	pre-commit install

.PHONY: uninstall-githooks
uninstall-githooks:
	pre-commit uninstall

.PHONY: enable
enable:
	gnome-extensions enable sermon@rovellipaolo-gmail.com

.PHONY: disable
disable:
	gnome-extensions disable sermon@rovellipaolo-gmail.com


# Debug:

.PHONY: show-logs
show-logs:
	journalctl /usr/bin/gnome-shell -f -o cat


# Test:

.PHONY: test
test:
	gjs gjsunit.js

.PHONY: checkstyle
checkstyle:
	npx prettier --write .
	eslint .
