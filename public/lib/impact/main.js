﻿
// -----------------------------------------------------------------------------
// The main() function creates the system, input, sound and game objects,
// creates a preloader and starts the run loop
//
// ig.module(
// 	'impact.main'
// )
// .requires(
// 	//'dom.ready',
// 	'impact.loader',
// 	'impact.system',
// 	'impact.input',
// 	'impact.sound'
// )
// .defines(function () {
"use strict";

require('./loader');
require('./system');
require('./input');
require('./sound');

ig.main = function (canvasId, gameClass, fps, width, height, scale, loaderClass) {
	ig.system = new ig.System(canvasId, fps, width, height, scale || 1);
	ig.input = new ig.Input();
	ig.soundManager = new ig.SoundManager();
	ig.music = new ig.Music();
	ig.ready = true;

	var loader = new (loaderClass || ig.Loader)(gameClass, ig.resources);
	loader.load();
};

