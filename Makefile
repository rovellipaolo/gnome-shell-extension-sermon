
build:
	zip -r sermon@rovellipaolo-gmail.com.zip metadata.json extension.js stylesheet.css images/* src/*

checkstyle:
	eslint .

install:
	unzip -o sermon@rovellipaolo-gmail.com.zip -d ~/.local/share/gnome-shell/extensions/sermon@rovellipaolo-gmail.com

show-logs:
	journalctl /usr/bin/gnome-shell -f -o cat

verify:
	gjs gjsunit.js
