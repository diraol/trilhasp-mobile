# TrilhaSP
This is a WIP (Working in Progress) cross-platform mobile app.
This app uses [Ionic Framework][2] as bootstrap for Native/Hybrid app using HTML,
CSS and Javascript on top of [Cordova][4] e [Angularjs][6].

## Dependencies
General

	Node.js
	Android SDK
	Apache Ant

Gulp

	bower
	gulp-util
	gulp-concat
	gulp-sass
	gulp-minify-css
	gulp-rename
	shelljs

Cordova/Ionic

	com.ionic.keyboard 1.0.3 "Keyboard"
	org.apache.cordova.camera 0.3.3 "Camera"
	org.apache.cordova.device 0.2.12 "Device"
	https://github.com/wildabeast/BarcodeScanner.git "BarcodeScanner"
	de.appplant.cordova.plugin.background-mode 0.6.0-dev "BackgroundMode"
	org.apache.cordova.console 0.2.11 "Console"
	org.apache.cordova.geolocation 0.3.10 "Geolocation"


## Install
Install [Node.js][1]

Install [Cordova][4] e [Ionic][2] using npm command:
`npm install -g cordova ionic`

On the root folder of this project, run: `npm install` this will install all dependecies from `package.json` what include some dependecies for gulp's tasks.

After that, you'll need to add the targets platforms: `ionic platform add android` or `ionic platform add ios`
For iOS, you'll need a OSX with XCode

Install plugins:

	`cordova plugin add com.ionic.keyboard org.apache.cordova.camera org.apache.cordova.device https://github.com/wildabeast/BarcodeScanner.git org.apache.cordova.console org.apache.cordova.geolocation`

	`cordova plugin add https://github.com/katzer/cordova-plugin-background-mode.git`

## TODO
Automatize installation, platform and plugin addition.

	#!/bin/bash
	# Node dependencies
	`npm install`

	# Add Android as a development platform
	`ionic platform add android`

	#Plugin install
	`cordova plugin add com.ionic.keyboard org.apache.cordova.camera org.apache.cordova.device https://github.com/wildabeast/BarcodeScanner.git org.apache.cordova.console org.apache.cordova.geolocation`
	`cordova plugin add https://github.com/katzer/cordova-plugin-background-mode.git`

	# Build
	`cordova build android`

## Bugs
Background Mode only works if you install from git:

    `cordova plugin add https://github.com/katzer/cordova-plugin-background-mode.git`

Custom properties on Background-mode plugins just works on first build run.
After that, fallbacks to default text.

Just use:

	`cordova plugin remove de.appplant.cordova.plugin.background-mode`

and add it back:

	`cordova plugin add https://github.com/katzer/cordova-plugin-background-mode.git`

build it again:

	`cordova build android` or `cordova run android`

## Resources
[Ionic Framework][2] [Docs][3]

[Cordova][4] [Docs][5]

[Angularjs][6] [Tutorial][7] & [Docs][8]

## License
TBD

[1]: http://nodejs.org/
[2]: http://ionicframework.com/
[3]: http://ionicframework.com/docs/
[4]: http://cordova.apache.org/
[5]: http://cordova.apache.org/docs/en/4.0.0/
[6]: https://angularjs.org/
[7]: https://docs.angularjs.org/tutorial
[8]: https://docs.angularjs.org/guide
