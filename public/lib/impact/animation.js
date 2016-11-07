// ig.module(
// 	'impact.animation'
// )
// .requires(
// 	'impact.timer',
// 	'impact.image'
// )
// .defines(function(){
	"use strict";

ig.AnimationSheet = class AnimationSheet {

	constructor(path, width, height) {
		this.width = width || 8;
		this.height= height || 8;
		this.image = new ig.Image( path );
	}
};



ig.Animation = class Animation {

	constructor( sheet, frameTime, sequence, stop ) {
		this.sheet = sheet;
		this.pivot = {x: sheet.width/2, y: sheet.height/2 };
		this.timer = new ig.Timer();

		this.frameTime = frameTime;
		this.sequence = sequence;
		this.stop = !!stop;
		this.tile = this.sequence[0];
		this.flip =  {x: false, y: false};
		this.frame = 0;
		this.tile = 0;
		this.loopCount = 0;
		this.alpha = 1;
		this.angle = 0;
	};
	
	
	rewind() {
		this.timer.set();
		this.loopCount = 0;
		this.frame = 0;
		this.tile = this.sequence[0];
		return this;
	}
	
	
	gotoFrame( f ) {
		// Offset the timer by one tenth of a millisecond to make sure we
		// jump to the correct frame and circumvent rounding errors
		this.timer.set( this.frameTime * -f - 0.0001 );
		this.update();
	}
	
	
	gotoRandomFrame() {
		this.gotoFrame( Math.floor(Math.random() * this.sequence.length) )
	}
	
	
	update() {
		var frameTotal = Math.floor(this.timer.delta() / this.frameTime);
		this.loopCount = Math.floor(frameTotal / this.sequence.length);
		if( this.stop && this.loopCount > 0 ) {
			this.frame = this.sequence.length - 1;
		}
		else {
			this.frame = frameTotal % this.sequence.length;
		}
		this.tile = this.sequence[ this.frame ];
	}
	
	
	draw( targetX, targetY ) {
		var bbsize = Math.max(this.sheet.width, this.sheet.height);
		
		// On screen?
		if(
		   targetX > ig.system.width || targetY > ig.system.height ||
		   targetX + bbsize < 0 || targetY + bbsize < 0
		) {
			return;
		}
		
		if( this.alpha != 1) {
			ig.system.context.globalAlpha = this.alpha;
		}
		
		if( this.angle == 0 ) {		
			this.sheet.image.drawTile(
				targetX, targetY,
				this.tile, this.sheet.width, this.sheet.height,
				this.flip.x, this.flip.y
			);
		}
		else {
			ig.system.context.save();
			ig.system.context.translate(
				ig.system.getDrawPos(targetX + this.pivot.x),
				ig.system.getDrawPos(targetY + this.pivot.y)
			);
			ig.system.context.rotate( this.angle );
			this.sheet.image.drawTile(
				-this.pivot.x, -this.pivot.y,
				this.tile, this.sheet.width, this.sheet.height,
				this.flip.x, this.flip.y
			);
			ig.system.context.restore();
		}
		
		if( this.alpha != 1) {
			ig.system.context.globalAlpha = 1;
		}
	}
};
