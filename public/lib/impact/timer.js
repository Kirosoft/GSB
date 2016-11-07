// ig.module(
// 	'impact.timer'
// )
// .defines(function(){

"use strict";

ig.Timer = class Timer {

	constructor( seconds ) {
		this.pausedAt = 0;
		this.base = ig.Timer.time;
		this.last = ig.Timer.time;
		
		this.target = seconds || 0;
	}
	
	
	set( seconds ) {
		this.target = seconds || 0;
		this.base = ig.Timer.time;
		this.pausedAt = 0;
	}
	
	
	reset() {
		this.base = ig.Timer.time;
		this.pausedAt = 0;
	}
	
	
	tick() {
		var delta = ig.Timer.time - this.last;
		this.last = ig.Timer.time;
		return (this.pausedAt ? 0 : delta);
	}
	
	
	delta() {
		return (this.pausedAt || ig.Timer.time) - this.base - this.target;
	}


	pause() {
		if( !this.pausedAt ) {
			this.pausedAt = ig.Timer.time;
		}
	}


	unpause() {
		if( this.pausedAt ) {
			this.base += ig.Timer.time - this.pausedAt;
			this.pausedAt = 0;
		}
	}
};

ig.Timer._last = 0;
ig.Timer.time = Number.MIN_VALUE;
ig.Timer.timeScale = 1;
ig.Timer.maxStep = 0.05;

ig.Timer.step = function() {
	var current = Date.now();
	var delta = (current - ig.Timer._last) / 1000;
	ig.Timer.time += Math.min(delta, ig.Timer.maxStep) * ig.Timer.timeScale;
	ig.Timer._last = current;
};
