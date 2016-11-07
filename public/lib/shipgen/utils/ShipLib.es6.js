/**
 * Created by marknorman on 08/05/15.
 */

_debug = true;

ShipLib = class ShipLib {

    constructor() {

        var _self = this;
        this.hulls = null;
        this.parts = null;

        $.getJSON('/meteor/hulls', function(data) {
            _self.hulls = data.rows;
        });

        $.getJSON('/meteor/parts', function(data) {
            _self.parts = data.rows;
        });


        //this._private = new SmartVar({
        //    hulls:[],
        //    parts:[],
        //    hullCount: (parent) => {parent.registerDependency('hullCount', ['hulls']); return parent.hulls.length;},
        //    partCount: (parent) => {parent.registerDependency('partCount', ['parts']); return parent.parts.length;}
        //});

        // Make a neat list of hulls and parts if we're debugging
        //if(this._debug){
        //
        //    var hullList = 'hulls';
        //    for (let i = 0; i < self._private.hulls.length; i ++ ){
        //        hullList = hullList+', '+i+' '+this._hulls[i].name;
        //        //hullsDB.insert(this._hulls[i]);
        //    }
        //    console.log(hullList);
        //
        //    var partList = 'parts';
        //    for (let i = 0; i < this._parts.length; i ++ ){
        //        partList = partList+', '+i+' '+this._parts[i].name;
        //        //partsDB.insert(this._parts[i]);
        //    }
        //    console.log(partList);
        //}
        console.log("ShipLib ready");

    }

    HullCount() {
        return this.hulls.length;
    };

    PartCount() {
        return this.parts.length;
    };

    GetPart(type, pick) {

        console.log("GetPart: "+pick);

        if (pick < 0) {
            console.log("Invalid");
        }
        let scope = new THREE.Geometry();
        let items = type == 'part' ? this.parts : this.hulls;
        let part = items[pick];

        if (!part || !part.vertices) {
            console.log("ERROR: attempting to pick a part tgar us not defined");
        }

        scope.vertices = part.vertices.map(function(vertex) {
            return new THREE.Vector3(vertex[0],vertex[1],vertex[2]);
        });

        scope.faces = part.faces.map(function(vertex) {
            if(vertex.length === 4){
                var triFace1 = new THREE.Face3( vertex[0],vertex[1],vertex[2]);
                triFace1.materialIndex = 0;
                var triFace2 = new THREE.Face3(vertex[0],vertex[2],vertex[3]);
                triFace2.materialIndex = 0;

                return [triFace1,triFace2];
            }else{
                return new THREE.Face3(vertex[0],vertex[1],vertex[2]);
            }
        }).reduce((a,b) => a.concat(b)); //flatten

        this._assignUVs(scope);

        scope.part = {};

        scope.part.id = part.id;
        scope.part.name = part.name;
        scope.part.connectors = part.connectors;

        return scope;
    };


    //var assignUVs2 = function(geometry) {
    //
    //    geometry.faceVertexUvs[0] = [];
    //
    //    geometry.faces.forEach(function(face) {
    //
    //        var components = ['x', 'y', 'z'].sort(function(a, b) {
    //            return Math.abs(face.normal[a]) > Math.abs(face.normal[b]);
    //        });
    //
    //        var v1 = geometry.vertices[face.a];
    //        var v2 = geometry.vertices[face.b];
    //        var v3 = geometry.vertices[face.c];
    //
    //        geometry.faceVertexUvs[0].push([
    //            new THREE.Vector2(v1[components[0]], v1[components[1]]),
    //            new THREE.Vector2(v2[components[0]], v2[components[1]]),
    //            new THREE.Vector2(v3[components[0]], v3[components[1]])
    //        ]);
    //
    //    });
    //
    //    geometry.uvsNeedUpdate = true;
    //};

    _assignUVs( geometry ){

        geometry.computeBoundingBox();

        var max     = geometry.boundingBox.max;
        var min     = geometry.boundingBox.min;

        var offset  = new THREE.Vector2(0 - min.x, 0 - min.y);
        var range   = new THREE.Vector2(max.x - min.x, max.y - min.y);

        geometry.faceVertexUvs[0] = [];
        var faces = geometry.faces;

        for (let i = 0; i < geometry.faces.length ; i++) {

            var v1 = geometry.vertices[faces[i].a];
            var v2 = geometry.vertices[faces[i].b];
            var v3 = geometry.vertices[faces[i].c];

            geometry.faceVertexUvs[0].push([
                new THREE.Vector2( ( v1.x + offset.x ) / range.x , ( v1.y + offset.y ) / range.y ),
                new THREE.Vector2( ( v2.x + offset.x ) / range.x , ( v2.y + offset.y ) / range.y ),
                new THREE.Vector2( ( v3.x + offset.x ) / range.x , ( v3.y + offset.y ) / range.y )
            ]);

        }

        geometry.uvsNeedUpdate = true;

    };
};

