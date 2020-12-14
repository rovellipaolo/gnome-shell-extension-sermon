# Build:

.PHONY: build
build:
	zip -r sermon@rovellipaolo-gmail.com.zip metadata.json extension.js stylesheet.css prefs.js prefs.xml images/* schemas/* src/*

.PHONY: build-settings
build-settings:
	glib-compile-schemas schemas/

# Install:

.PHONY: install
install:
	unzip -o sermon@rovellipaolo-gmail.com.zip -d ~/.local/share/gnome-shell/extensions/sermon@rovellipaolo-gmail.com
	echo "Remember to restart GNOME Shell: press 'Alt'+'F2', type 'r' and press enter."

.PHONY: install-checkstyle
install-checkstyle:
	@npm install

.PHONY: enable
enable:
	 gnome-shell-extension-tool -e sermon@rovellipaolo-gmail.com

.PHONY: disable
disable:
	 gnome-shell-extension-tool -d sermon@rovellipaolo-gmail.com


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
	eslint .
