ig.module(
	'impact.RemoteImage'
)
.defines(function () {
    "use strict";

    ig.RemoteImage = ig.Class.extend({
        data: null,
        width: 0,
        height: 0,
        loaded: false,
        failed: false,
        loadCallback: null,
        requestInProgress: false,
        path: '',
        tileY: 0,
        tileX: 0,

        staticInstantiate: function (tileY, tileX) {
            return ig.RemoteImage.remoteImageCache['' + tileY + tileX] || null;
        },


        init: function (tileY, tileX) {
            this.tileX = tileX;
            this.tileY = tileY;
            this.path = '' + tileY + tileX;
            this.requestInProgress = false;
            ig.RemoteImage.remoteImageCache[this.path] = this;
            this.load(tileY, tileX);
        },


        load: function (tileY, tileX, loadCallback) {
            this.path = '' + tileY + tileX;
            this.tileY = tileY;
            this.tileX = tileX;

            if (this.loaded) {
                if (loadCallback) {
                    loadCallback(this.path, true);
                }
                return;
            }
            else if (!this.loaded && ig.ready) {
                this.loadCallback = loadCallback || null;
                var pThis = this;

                if (!this.requestInProgress) {
                    this.requestInProgress = true;

                    $.ajax({ type: "GET",
                        url: 'http://127.0.0.1:3000/getMapData?x=' + this.tileX + '&y=' + this.tileY,
                        dataType: 'jsonp',
                        jsonp: 'callback'
                    })
                    .done(function (data) {
                        //window.console && console.debug(data.data);
                        //this.tiles.drawTile(pxX, pxY, tile - 1, this.tilesize);

                        pThis.data = new Image();
                        pThis.buildImageFromData(JSON.parse(data.data), pThis.tileX, pThis.tileY);
                        pThis.data.onload = pThis.onload.bind(pThis);
                        pThis.data.onerror = pThis.onerror.bind(pThis);
                        //this.data.src = ig.prefix + this.path + ig.nocache;
                        //pThis.data.src = data.data;
                        //ig.game.backgroundMaps[0].remoteImageCache['' + tileOffsetY + tileOffsetX] = data.data;
                        ig.RemoteImage.remoteImageCache[pThis.path] = pThis;
                    }).fail(function (res) {
                        window.console && console.log("fail: " + res);
                        pThis.requestInProgress = false;
                    });

                } else {
                }

            }
            else {
                ig.addResource(this);
            }

        },
        buildImageFromData: function (data, x, y) {
            var width = 693;
            var height = 693;
            var margin = 10;

            var orig = ig.$new('canvas');
            orig.width = 693;
            orig.height = 693;
            var ctx = orig.getContext("2d");
            ctx.strokeStyle = 'rgba(255,255,255,1)';
            ctx.fillStyle = "rgba(255, 255, 255, 1)";
            ctx.fillText("{" + x + "," + y + "}", width / 2, height / 2);
            ctx.beginPath();
            ctx.moveTo(margin, margin);
            ctx.lineTo(width - margin, margin);
            ctx.lineTo(width - margin, height - margin);
            ctx.lineTo(margin, height - margin);
            ctx.lineTo(margin, margin);
            ctx.stroke();
            if (data && data.rows) {
                ctx.beginPath();
                for (var i = 0; i < data.rows.length; i++) {

                    var sx = data.rows[i].doc.X;
                    var sy = data.rows[i].doc.Y;
                    var x1 = (width * 0.5) + ((data.rows[i].doc.X - x) * (width * .5));
                    var y1 = (height * 0.5) + ((data.rows[i].doc.Y - y) * (height * .5));
                    var name = data.rows[i].doc.StarID;
                    ctx.fillText("{" + name + "}", width/2, height/2);
                    console.log("x1: " + x1 + " ,y1: " + y1);
                    console.log("x: " + x + " ,y: " + y);
                    console.log("sx: " + sx + " ,sy: " + sy);
                    console.log("name: " + name);
                    console.log("i: " + i);
                    ctx.arc(x1, y1, 10, 0, Math.PI * 2, false);
                }
                ctx.fillStyle = 'yellow';
                ctx.fill();
                ctx.lineWidth = 5;
                ctx.strokeStyle = '#003300';
                ctx.stroke();
            }

            this.data.src = orig.toDataURL('image/png');


        },
        reload: function () {
            this.loaded = false;
            this.data = new Image();
            this.data.onload = this.onload.bind(this);
            this.data.src = this.path + '?' + Date.now();
        },


        onload: function (event) {
            this.width = this.data.width;
            this.height = this.data.height;
            this.loaded = true;
            this.requestInProgress = false;

            if (ig.system.scale != 1) {
                this.resize(ig.system.scale);
            }

            if (this.loadCallback) {
                this.loadCallback(this.path, true);
            }
        },


        onerror: function (event) {
            this.failed = true;

            if (this.loadCallback) {
                this.loadCallback(this.path, false);
            }
        },


        resize: function (scale) {
            // Nearest-Neighbor scaling

            // The original image is drawn into an offscreen canvas of the same size
            // and copied into another offscreen canvas with the new size. 
            // The scaled offscreen canvas becomes the image (data) of this object.

            var widthScaled = this.width * scale;
            var heightScaled = this.height * scale;

            var orig = ig.$new('canvas');
            orig.width = this.width;
            orig.height = this.height;
            var origCtx = orig.getContext('2d');
            origCtx.drawImage(this.data, 0, 0, this.width, this.height, 0, 0, this.width, this.height);
            var origPixels = origCtx.getImageData(0, 0, this.width, this.height);

            var scaled = ig.$new('canvas');
            scaled.width = widthScaled;
            scaled.height = heightScaled;
            var scaledCtx = scaled.getContext('2d');
            var scaledPixels = scaledCtx.getImageData(0, 0, widthScaled, heightScaled);

            for (var y = 0; y < heightScaled; y++) {
                for (var x = 0; x < widthScaled; x++) {
                    var index = (Math.floor(y / scale) * this.width + Math.floor(x / scale)) * 4;
                    var indexScaled = (y * widthScaled + x) * 4;
                    scaledPixels.data[indexScaled] = origPixels.data[index];
                    scaledPixels.data[indexScaled + 1] = origPixels.data[index + 1];
                    scaledPixels.data[indexScaled + 2] = origPixels.data[index + 2];
                    scaledPixels.data[indexScaled + 3] = origPixels.data[index + 3];
                }
            }
            scaledCtx.putImageData(scaledPixels, 0, 0);
            this.data = scaled;
        },


        draw: function (targetX, targetY, sourceX, sourceY, width, height) {
            if (!this.loaded) { return; }

            var scale = ig.system.scale;
            sourceX = sourceX ? sourceX * scale : 0;
            sourceY = sourceY ? sourceY * scale : 0;
            width = (width ? width : this.width) * scale;
            height = (height ? height : this.height) * scale;

            ig.system.context.drawImage(
			    this.data, sourceX, sourceY, width, height,
			    ig.system.getDrawPos(targetX),
			    ig.system.getDrawPos(targetY),
			    width, height
		    );

            ig.Image.drawCount++;
        },


        drawTile: function (targetX, targetY, tile, tileWidth, tileHeight, flipX, flipY) {
            tileHeight = tileHeight ? tileHeight : tileWidth;

            if (!this.loaded || tileWidth > this.width || tileHeight > this.height) { return; }

            var scale = ig.system.scale;
            var tileWidthScaled = Math.floor(tileWidth * scale);
            var tileHeightScaled = Math.floor(tileHeight * scale);

            var scaleX = flipX ? -1 : 1;
            var scaleY = flipY ? -1 : 1;

            if (flipX || flipY) {
                ig.system.context.save();
                ig.system.context.scale(scaleX, scaleY);
            }
            var x = ig.system.getDrawPos(targetX) * scaleX - (flipX ? tileWidthScaled : 0);
            var y = ig.system.getDrawPos(targetY) * scaleY - (flipY ? tileHeightScaled : 0);
            ig.system.context.drawImage(
            this.data,
            (Math.floor(tile * tileWidth) % this.width) * scale,
            (Math.floor(tile * tileWidth / this.width) * tileHeight) * scale,
            tileWidthScaled,
            tileHeightScaled,
            x,
            y,
            tileWidthScaled,
            tileHeightScaled
            );

            //x = 0;
            //y = 0;
            ig.system.context.drawImage(
			    this.data,
			    x,
			    y,
			    tileWidthScaled,
			    tileHeightScaled
		    );
            if (flipX || flipY) {
                ig.system.context.restore();
            }

            ig.Image.drawCount++;
        }
    });

    ig.RemoteImage.drawCount = 0;
    ig.RemoteImage.remoteImageCache = {};
    ig.RemoteImage.reloadCache = function () {
        for (var path in ig.RemoteImage.remoteImagecache) {
            ig.RemoteImage.remoteImageCache[path].reload();
        }
    };

});