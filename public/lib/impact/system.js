// ig.module(
// 	'impact.system'
// )
// .requires(
// 	'impact.timer',
// 	'impact.image'
// )
// .defines(function(){ "use strict";

require('./timer');
require('./image');

ig.System = class System {

	constructor( canvasId, fps, width, height, scale ) {
		this.fps = fps || 30;
		this.scale = 1;
		this.realWidth = 320;
		this.realHeight = 240;
		this.tick = 0;
		this.animationId = 0;
		this.newGameClass = null;
		this.running = false;

		this.delegate = null;
		this.clock = null;
		this.canvas = null;
		this.context = null;

		this.clock = new ig.Timer();
		if (!global.serverSide) {
			this.canvas = ig.$(canvasId);
		} else {
			this.canvas = { width: width || 320, height: height || 240};
		}
		this.resize( width, height, scale );
		if (!global.serverSide) {
			this.context = this.canvas.getContext('2d');
		}
		this.getDrawPos = ig.System.drawMode;

		// Automatically switch to crisp scaling when using a scale
		// other than 1
		if( this.scale != 1 ) {
			ig.System.scaleMode = ig.System.SCALE.CRISP;
		}
		if (!global.serverSide) {
			ig.System.scaleMode(this.canvas, this.context);
		}
	}

	resize( width, height, scale ) {
		this.width = width;
		this.height = height;
		this.scale = scale || this.scale;
		
		this.realWidth = this.width * this.scale;
		this.realHeight = this.height * this.scale;
		this.canvas.width = this.realWidth;
		this.canvas.height = this.realHeight;
	}

	setGame( gameClass ) {
		if( this.running ) {
			this.newGameClass = gameClass;
		}
		else {
			this.setGameNow( gameClass );
		}
	}
	
	setGameNow( gameClass ) {
		ig.game = new (gameClass)();	
		ig.system.setDelegate( ig.game );
	}
	
	setDelegate( object ) {
		if( typeof(object.run) == 'function' ) {
			this.delegate = object;
			this.startRunLoop();
		} else {
			throw( 'System.setDelegate: No run() function in object' );
		}
	}
	
	stopRunLoop() {
		ig.clearAnimation( this.animationId );
		this.running = false;
	}

	startRunLoop() {
		this.stopRunLoop();
		this.animationId = ig.setAnimation( this.run.bind(this), this.canvas );
		this.running = true;
	}

	clear( color ) {
		if (!global.serverSide) {
			this.context.fillStyle = color;
			this.context.fillRect( 0, 0, this.realWidth, this.realHeight );
		}
	}
	
	run() {
		ig.Timer.step();
		this.tick = this.clock.tick();
		
		this.delegate.run();
		ig.input.clearPressed();
		
		if( this.newGameClass ) {
			this.setGameNow( this.newGameClass );
			this.newGameClass = null;
		}
	}
};

ig.System.DRAW = {
	AUTHENTIC: function( p ) { return Math.round(p) * this.scale; },
	SMOOTH: function( p ) { return Math.round(p * this.scale); },
	SUBPIXEL: function( p ) { return p * this.scale; }
};
ig.System.drawMode = ig.System.DRAW.SMOOTH;

ig.System.SCALE = {
	CRISP: function( canvas, context ) {
		ig.setVendorAttribute( context, 'imageSmoothingEnabled', false );
		canvas.style.imageRendering = '-moz-crisp-edges';
		canvas.style.imageRendering = '-o-crisp-edges';
		canvas.style.imageRendering = '-webkit-optimize-contrast';
		canvas.style.imageRendering = 'crisp-edges';
		canvas.style.msInterpolationMode = 'nearest-neighbor'; // No effect on Canvas :/
	},
	SMOOTH: function( canvas, context ) {
		ig.setVendorAttribute( context, 'imageSmoothingEnabled', true );
		canvas.style.imageRendering = '';
		canvas.style.msInterpolationMode = '';
	}
};
ig.System.scaleMode = ig.System.SCALE.SMOOTH;
