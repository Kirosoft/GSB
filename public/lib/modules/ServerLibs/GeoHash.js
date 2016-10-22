ig.module(
	'modules.ServerLibs.GeoHash'
)
.requires(
)
.defines(function () {
//    "use strict";
        
        minLat=-2000;
        maxLat=2000;
        minLon=-2000;
        maxLon=2000;

        originX= 0;
        originY= 0;
        starBase= new Object();


        // Precision per bit = 20*5 = 100 bits = 50 bits per axis  = 0.000000000003553 light years (-2000,-2000,+2000,+2000)
        precision = 20; // number of bytes for hash code. Assume 5 bits per byte (base32 encoding)

        BITS= [16, 8, 4, 2, 1];

        BASE32= "0123456789bcdefghjkmnpqrstuvwxyz";
        neighbours ={ left: { even: "bc01fg45238967deuvhjyznpkmstqrwx" },
            right: { even: "238967debc01fg45kmstqrwxuvhjyznp" },
            bottom: { even: "p0r21436x8zb9dcf5h7kjnmqesgutwvy" },
            top: { even: "14365h7k9dcfesgujnmqp0r2twvyx8zb"}
        };
        BORDERS = { left: { even: "bcfguvyz" },
            right: { even: "0145hjnp" },
            bottom: { even: "prxz" },
            top: { even: "028b"}
        };


        GeoHash = ig.Class.extend({
        init: function() {
            neighbours.bottom.odd = neighbours.left.even;
            neighbours.top.odd = neighbours.right.even;
            neighbours.left.odd = neighbours.bottom.even;
            neighbours.right.odd = neighbours.top.even;

            BORDERS.bottom.odd = BORDERS.left.even;
            BORDERS.top.odd = BORDERS.right.even;
            BORDERS.left.odd = BORDERS.bottom.even;
            BORDERS.right.odd = BORDERS.top.even;
        },
        refine_interval:function(interval, cd, mask) {
            if (cd & mask)
                interval[0] = (interval[0] + interval[1]) / 2;
            else
                interval[1] = (interval[0] + interval[1]) / 2;
        },

        calculateAdjacent:function(srcHash, dir) {
            srcHash = srcHash.toLowerCase();
            var lastChr = srcHash.charAt(srcHash.length - 1);
            var type = (srcHash.length % 2) ? 'odd' : 'even';
            var base = srcHash.substring(0, srcHash.length - 1);
            if (BORDERS[dir][type].indexOf(lastChr) != -1)
                base = calculateAdjacent(base, dir);
            return base + BASE32[neighbours[dir][type].indexOf(lastChr)];
        },

        decodeGeoHash:function (geohash) {
            var is_even = 1;
            var lat = []; var lon = [];
            lat[0] = minLat; lat[1] = maxLat;
            lon[0] = minLon; lon[1] = maxLon;
            lat_err = maxLat; lon_err = maxLon;

            for (i = 0; i < geohash.length; i++) {
                c = geohash[i];
                cd = BASE32.indexOf(c);
                for (j = 0; j < 5; j++) {
                    mask = BITS[j];
                    if (is_even) {
                        lon_err /= 2;
                        refine_interval(lon, cd, mask);
                    } else {
                        lat_err /= 2;
                        refine_interval(lat, cd, mask);
                    }
                    is_even = !is_even;
                }
            }
            lat[2] = (lat[0] + lat[1]) / 2;
            lon[2] = (lon[0] + lon[1]) / 2;

            return { latitude: lat, longitude: lon };
        },

        encodeGeoHash:function(latitude, longitude) {
            var is_even = 1;
            var i = 0;
            var lat = []; var lon = [];
            var bit = 0;
            var ch = 0;
            geohash = "";

            lat[0] = minLat; lat[1] = maxLat;
            lon[0] = minLon; lon[1] = maxLon;

            while (geohash.length < precision) {
                if (is_even) {
                    mid = (lon[0] + lon[1]) / 2;
                    if (longitude > mid) {
                        ch |= BITS[bit];
                        lon[0] = mid;
                    } else
                        lon[1] = mid;
                } else {
                    mid = (lat[0] + lat[1]) / 2;
                    if (latitude > mid) {
                        ch |= BITS[bit];
                        lat[0] = mid;
                    } else
                        lat[1] = mid;
                }

                is_even = !is_even;
                if (bit < 4)
                    bit++;
                else {
                    geohash += BASE32[ch];
                    bit = 0;
                    ch = 0;
                }
            }
            return geohash;
        },

        GeoHashBox:function(geohash) {
	        var box = decodeGeoHash(geohash);
            box.geohash = geohash;
	        box.corners = {};
	        box.corners.topleft =  {y:box.longitude[0], x:box.latitude[1]};
	        box.corners.topright = {y:box.longitude[1], x:box.latitude[1]};
	        box.corners.bottomright = {y:box.longitude[1], x:box.latitude[0]};
	        box.corners.bottomleft = {y:box.longitude[0], x:box.latitude[0]};
	        box.centerPoint = { y: (box.longitude[0] + box.longitude[1]) / 2, x: (box.latitude[0] + box.latitude[1]) / 2 };

	        box.options = {labelText : geohash};
	        var lastChr = geohash.charAt(geohash.length-1);
	        box.selfPos = BASE32.indexOf(lastChr);

            return box;
        },
        drawBox:function(ctx,hashBox,colour) {
            ctx.beginPath();
            ctx.strokeStyle = colour;
            //console.log(x,y);        
            ctx.moveTo(getScreenX(hashBox.corners.topleft.x), getScreenY(hashBox.corners.topleft.y));
            ctx.lineTo(getScreenX(hashBox.corners.topright.x), getScreenY(hashBox.corners.topright.y));
            ctx.lineTo(getScreenX(hashBox.corners.bottomright.x), getScreenY(hashBox.corners.bottomright.y));
            ctx.lineTo(getScreenX(hashBox.corners.bottomleft.x), getScreenY(hashBox.corners.bottomleft.y));
            ctx.lineTo(getScreenX(hashBox.corners.topleft.x), getScreenY(hashBox.corners.topleft.y));
            ctx.stroke();
        },

        getNeighbours:function (hash) {
            //hash = 'dqcjqc'
            var geohashPrefix = hash.substr(0, hash.length - 1);
            var neighbours = new Object();
            var neighbourList = [];
            neighbours.top = new GeoHashBox(calculateAdjacent(hash, 'top'));
            drawBox(neighbours.top,'white');
            neighbours.bottom = new GeoHashBox(calculateAdjacent(hash, 'bottom'));
            drawBox(neighbours.bottom,'lightblue');
            neighbours.right = new GeoHashBox(calculateAdjacent(hash, 'right'));
            drawBox(neighbours.right,'darkgreen');
            neighbours.left = new GeoHashBox(calculateAdjacent(hash, 'left'));
            drawBox(neighbours.left,'purple');
            neighbours.topleft = new GeoHashBox(calculateAdjacent(neighbours.left.geohash, 'top'));
            drawBox(neighbours.topleft,'red');
            neighbours.topright = new GeoHashBox(calculateAdjacent(neighbours.right.geohash, 'top'));
            drawBox(neighbours.topright,'blue');
            neighbours.bottomright = new GeoHashBox(calculateAdjacent(neighbours.right.geohash, 'bottom'));
            drawBox(neighbours.bottomright,'green');
            neighbours.bottomleft = new GeoHashBox(calculateAdjacent(neighbours.left.geohash, 'bottom'));
            drawBox(neighbours.bottomleft,'yellow');

            neighbourList.push(neighbours.top.geohash);
            neighbourList.push(neighbours.bottom.geohash);
            neighbourList.push(neighbours.right.geohash);
            neighbourList.push(neighbours.left.geohash);
            neighbourList.push(neighbours.topleft.geohash);
            neighbourList.push(neighbours.topright.geohash);
            neighbourList.push(neighbours.bottomright.geohash);
            neighbourList.push(neighbours.bottomleft.geohash);
            var extents = { xmin: neighbours.topleft.corners.topleft.x, ymax: neighbours.topleft.corners.topleft.y,
                xmax: neighbours.bottomright.corners.bottomright.x, ymin: neighbours.bottomright.corners.bottomright.y
            };
            return { neighbours: neighbours, neighbourList: neighbourList, extents: extents };
        }
    });
/*
    function getScreenX(worldX) {
        // calculate the x coord in pixels
        var screenX = centerPoint.x + (worldX * scaleX);

        return screenX;
    }
    function getWorldX(screenX) {
        var worldX = screenX / scaleX;
        return worldX;
    }

    // screen coords start top left origin 0,0  - x axis is position -> , yaxis is positive v
    // world coords start middle origin 0,0  - x axis is position ->, yaxis is positive ^
    function getScreenY(worldY) {
        var screenY = centerPoint.y - (worldY * scaleY);
        return screenY;
    }
    function getWorldY(screenY) {
        var worldY = screenY / scaleY;
        return worldY;
    }

*/
});

