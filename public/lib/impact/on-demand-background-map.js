ig.module(
	'impact.on-demand-background-map'
)
.requires(
	'impact.map',
	'impact.RemoteImage'
)
.defines(function () {
    "use strict";

    ig.OnDemandBackgroundMap = ig.Map.extend({
        tiles: null,
        scroll: { x: 0, y: 0 },
        distance: 1,
        repeat: false,
        tilesetName: '',
        foreground: false,
        enabled: true,

        preRender: false,
        preRenderedChunks: null,
        chunkSize: 512,
        debugChunks: false,

        anims: {},


        init: function (tilesize, data, tileset) {
            this.parent(tilesize, data);
            this.setTileset(tileset);
        },


        setTileset: function (tileset) {
            //this.tilesetName = tileset instanceof ig.Image ? tileset.path : tileset;
            //this.tiles = new ig.Image(this.tilesetName);
            //this.preRenderedChunks = null;
        },


        setScreenPos: function (x, y) {
            this.scroll.x = x / this.distance;
            this.scroll.y = y / this.distance;
        },


        preRenderMapToChunks: function () {
            var totalWidth = this.width * this.tilesize * ig.system.scale,
			totalHeight = this.height * this.tilesize * ig.system.scale;

            var chunkCols = Math.ceil(totalWidth / this.chunkSize),
			chunkRows = Math.ceil(totalHeight / this.chunkSize);

            this.preRenderedChunks = [];
            for (var y = 0; y < chunkRows; y++) {
                this.preRenderedChunks[y] = [];

                for (var x = 0; x < chunkCols; x++) {


                    var chunkWidth = (x == chunkCols - 1)
					? totalWidth - x * this.chunkSize
					: this.chunkSize;

                    var chunkHeight = (y == chunkRows - 1)
					? totalHeight - y * this.chunkSize
					: this.chunkSize;

                    this.preRenderedChunks[y][x] = this.preRenderChunk(x, y, chunkWidth, chunkHeight);
                }
            }
        },


        preRenderChunk: function (cx, cy, w, h) {
            var tw = w / this.tilesize / ig.system.scale + 1,
			th = h / this.tilesize / ig.system.scale + 1;

            var nx = (cx * this.chunkSize / ig.system.scale) % this.tilesize,
			ny = (cy * this.chunkSize / ig.system.scale) % this.tilesize;

            var tx = Math.floor(cx * this.chunkSize / this.tilesize / ig.system.scale),
			ty = Math.floor(cy * this.chunkSize / this.tilesize / ig.system.scale);


            var chunk = ig.$new('canvas');
            chunk.width = w;
            chunk.height = h;

            var oldContext = ig.system.context;
            ig.system.context = chunk.getContext("2d");

            for (var x = 0; x < tw; x++) {
                for (var y = 0; y < th; y++) {
                    if (x + tx < this.width && y + ty < this.height) {
                        var tile = this.data[y + ty][x + tx];
                        if (tile) {
                            this.tiles.drawTile(
							x * this.tilesize - nx, y * this.tilesize - ny,
							tile - 1, this.tilesize
						);
                        }
                    }
                }
            }
            ig.system.context = oldContext;

            return chunk;
        },


        draw: function () {
            this.drawTiled();
        },


        drawTiled: function () {

            var tile = 0,
		    anim = null,
		    tileOffsetX = (this.scroll.x / this.tilesize).toInt(),
		    tileOffsetY = (this.scroll.y / this.tilesize).toInt(),
            pxOffsetX = this.scroll.x % this.tilesize,
		    pxOffsetY = this.scroll.y % this.tilesize,
		    pxMinX = -pxOffsetX - this.tilesize,
		    pxMinY = -pxOffsetY - this.tilesize,
		    pxMaxX = ig.system.width + this.tilesize - pxOffsetX,
		    pxMaxY = ig.system.height + this.tilesize - pxOffsetY;


            for (var mapY = -1, pxY = pxMinY; pxY < pxMaxY; mapY++, pxY += this.tilesize) {
                var tileY = mapY + tileOffsetY;
                var currentTileY = tileY;

                // Repeat Y?
                if (tileY >= this.height || tileY < 0) {
                    if (!this.repeat) { continue; }
                    tileY = tileY > 0
				    ? tileY % this.height
				    : ((tileY + 1) % this.height) + this.height - 1;
                }

                for (var mapX = -1, pxX = pxMinX; pxX < pxMaxX; mapX++, pxX += this.tilesize) {
                    var tileX = mapX + tileOffsetX;
                    var currentTileX = tileX;

                    // Repeat X?
                    if (tileX >= this.width || tileX < 0) {
                        if (!this.repeat) { continue; }
                        tileX = tileX > 0
					    ? tileX % this.width
					    : ((tileX + 1) % this.width) + this.width - 1;
                    }

                    // Draw!
                    //this.tiles.drawTile(pxX, pxY, tile - 1, this.tilesize);

                    var remoteImage = new ig.RemoteImage(currentTileY, currentTileX);

                    if (remoteImage && remoteImage.loaded) {
                        remoteImage.drawTile(pxX, pxY, 1, 693);
                    }
                } // end for x
            } // end for y
        }

    });

});