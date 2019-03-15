
build:
	zip -r sermon@rovellipaolo-gmail.com.zip metadata.json extension.js stylesheet.css images/* schemas/* src/*

build-settings:
	glib-compile-schemas schemas/

checkstyle:
	eslint .

install:
	unzip -o sermon@rovellipaolo-gmail.com.zip -d ~/.local/share/gnome-shell/extensions/sermon@rovellipaolo-gmail.com

disable:
	 gnome-shell-extension-tool -d sermon@rovellipaolo-gmail.com

enable:
	 gnome-shell-extension-tool -e sermon@rovellipaolo-gmail.com

show-logs:
	journalctl /usr/bin/gnome-shell -f -o cat

verify:
	gjs gjsunit.js
