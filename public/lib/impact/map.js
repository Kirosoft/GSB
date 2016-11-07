// ig.module(
// 	'impact.map'
// )
// .defines(function(){
//
//
"use strict";

ig.Map = class Map {

	
	constructor( tilesize, data ) {
		this.name = null;
		this.tilesize = tilesize;
		this.data = data;
		this.height = data.length;
		this.width = data[0].length;

		this.pxWidth = this.width * this.tilesize;
		this.pxHeight = this.height * this.tilesize;
	}
	
	
	getTile( x, y ) {
		var tx = Math.floor( x / this.tilesize );
		var ty = Math.floor( y / this.tilesize );
		if( 
			(tx >= 0 && tx <  this.width) &&
			(ty >= 0 && ty < this.height)
		) {
			return this.data[ty][tx];
		} 
		else {
			return 0;
		}
	}
	
	
	setTile( x, y, tile ) {
		var tx = Math.floor( x / this.tilesize );
		var ty = Math.floor( y / this.tilesize );
		if( 
			(tx >= 0 && tx < this.width) &&
			(ty >= 0 && ty < this.height)
		) {
			this.data[ty][tx] = tile;
		}
	}
};
