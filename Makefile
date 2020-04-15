
build:
	zip -r sermon@rovellipaolo-gmail.com.zip metadata.json extension.js stylesheet.css prefs.js prefs.xml images/* schemas/* src/*

build-settings:
	glib-compile-schemas schemas/

checkstyle:
	eslint .

install:
	unzip -o sermon@rovellipaolo-gmail.com.zip -d ~/.local/share/gnome-shell/extensions/sermon@rovellipaolo-gmail.com
	echo "Remember to restart GNOME Shell: press 'Alt'+'F2', type 'r' and press enter."

install-checkstyle:
	npm install -g eslint@5.7

disable:
	 gnome-shell-extension-tool -d sermon@rovellipaolo-gmail.com

enable:
	 gnome-shell-extension-tool -e sermon@rovellipaolo-gmail.com

show-logs:
	journalctl /usr/bin/gnome-shell -f -o cat

verify:
	gjs gjsunit.js
