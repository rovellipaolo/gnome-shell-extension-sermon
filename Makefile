
build:
	gnome-extensions pack --schema=schemas/org.gnome.shell.extensions.sermon.gschema.xml --extra-source=src/ --extra-source=images/ --extra-source=prefs.xml --force

build-settings:
	glib-compile-schemas schemas/

checkstyle:
	eslint .

install:
	gnome-extensions install sermon@rovellipaolo-gmail.com.shell-extension.zip --force
	echo "Remember to restart GNOME Shell: press 'Alt'+'F2', type 'r' and press enter."

install-checkstyle:
	npm install -g eslint@5.7

disable:
	gnome-extensions disable sermon@rovellipaolo-gmail.com

enable:
	gnome-extensions enable sermon@rovellipaolo-gmail.com

show-logs:
	journalctl /usr/bin/gnome-shell -f -o cat

verify:
	gjs gjsunit.js
