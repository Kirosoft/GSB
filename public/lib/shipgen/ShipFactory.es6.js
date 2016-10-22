/**
 * Created by marknorman on 08/05/15.
 */

let shipLib = new ShipLib();

ShipFactory = class {
    _partRand = null;
    _partVar = 4;
    _partLimit = 0;
    _connectors = [];
    _blue = 0x03106D;
    _white = 0xFFFFFF;
    _debug = true;
    _cachedShip = null;
    _axis_rotation = (Math.PI * 0.5);

    constructor(name) {
        this._partRand = new Rc4Random(name);
        this._partLimit = 6 + Math.round(this._partRand.getRandomNumber() * this._partVar)+1;
    }

    GetShip(scaleFactor) {
        scaleFactor = scaleFactor || 0.1;

        var modelParent = new THREE.Object3D();

        var shipParent = new THREE.Object3D();
        shipParent.scale.x = scaleFactor;
        shipParent.scale.y = scaleFactor;
        shipParent.scale.z = scaleFactor;
        shipParent.rotation.x = this._axis_rotation;
        shipParent.rotation.z = Math.PI;

        if (!this._cachedShip) {
            this._cachedShip = this._addModel(shipParent);
        }
        modelParent.add(shipParent);

        return modelParent;
    };

    // Add the 3d model
    _addModel(modelParent){

        var spaceshipTexture = THREE.ImageUtils.loadTexture('images/SpaceShip-texture.jpg');

        var facemat = new THREE.MeshLambertMaterial( { color: this._white, opacity: 0.0, shading: THREE.FlatShading, map: spaceshipTexture } );
        var wiremat = new THREE.MeshLambertMaterial( { color: this._blue, opacity: 1.0, wireframe: true, wireframeLinewidth: 3.0 } );

        shipMaterial = [facemat,wiremat];
        shipMaterial[0].needsUpdate = true;
        shipMaterial[1].needsUpdate = true;

        var shipGeo =shipLib.GetPart('hull', Math.round(this._partRand.getRandomNumber() * (shipLib.HullCount() - 1)));
        shipGeo.materials = shipMaterial;

        var basePart = new THREE.Mesh( shipGeo,  new THREE.MeshFaceMaterial(shipMaterial));

        modelParent.add(basePart);

        this._addConnections(basePart);

        while ((this._connectors.length > 0) && (modelParent.children.length < this._partLimit)) {
            if(this._debug){ console.log('adding part', modelParent.children.length); }
            this._addPart(modelParent, 0);

        }
        basePart.buffersNeedUpdate = true;
        basePart.geomuvsNeedUpdate = true;

        return modelParent;
    };

    _addPart(modelParent, depth, cPick, pPick){

        depth += 1;

        // Pick a connection
        if(cPick === undefined){
            cPick = Math.round(this._partRand.getRandomNumber() * (this._connectors.length - 1));
            if (this._debug){ console.log('picking random connection ',cPick); }
        } else {
            if (this._debug){ console.log('picking connection ',cPick); }
        }

        //cPick = 0;
        var connection = this._connectors[cPick];
        var part = null;

        // Make a part
        if(pPick === undefined){

            part = new THREE.Mesh( shipLib.GetPart('part',Math.round(this._partRand.getRandomNumber() * (shipLib.PartCount()-1))),  new THREE.MeshFaceMaterial(shipMaterial));
            pPick = part.geometry.part.id;
        }else{
            part = new THREE.Mesh( shipLib.GetPart('part', pPick),  new THREE.MeshFaceMaterial(shipMaterial));
        }
        part.buffersNeedUpdate = true;
        part.geomuvsNeedUpdate = true;

        modelParent.add(part);

        // Add the female connectors to the Connectors list!
        if(this._debug){ console.log(modelParent.children.length,'connecting',part.geometry.part.name,'to', connection.name); }

        var d = new THREE.Quaternion();
        d.copy(connection.quaternion);

        part.quaternion.copy(d);
        part.position.copy(connection.position);

        // twist the new part into the same orientation as the connection
        part.offset = new THREE.Vector3(0.0,0.0,1.0);
        part.offset.applyQuaternion(d);
        part.offset.setLength(0);   //gap
        part.position.add(part.offset);
        part.needsUpdate = true;
        part.updateMatrix();

        // Remove the connection that just got attached
        this._connectors.splice(cPick,1);

        // Add the new connections from this part
        this._addConnections(part);

        // See if there's another connector mirroring this one
        var cLen = this._connectors.length;
        if(cLen){
            var cV = new THREE.Vector3();
            cV.copy(connection.position);
            var cC = new THREE.Vector3();

            for (var g = 0; g < cLen; g++ ){
                var c = this._connectors[g];
                cC.copy(c.position);
                cC.x = -cC.x;
                var dist = cC.distanceTo(cV);

                if(dist < 0.5){
                    console.log("Mirrored connection found: "+g);
                    if (depth <2) {
                        this._addPart(modelParent, depth,g, pPick);
                    }
                    break;
                }
            }
        }
    };

    _addConnections(part){

        var con = part.geometry.part.connectors || [];
        var partMatrix = part.matrix;

        for (var g = 0; g < con.length; g++){

            var c = con[g];

            var n = new THREE.Object3D();
            n.name = c.name;
            n.position.copy(new THREE.Vector3(c.position[0],c.position[1],c.position[2]));
            n.quaternion.copy(new THREE.Quaternion(c.quaternion[0],c.quaternion[1],c.quaternion[2],c.quaternion[3]));

            n.needsUpdate = true;
            n.updateMatrix();

            // Translate the part position by the connector matric
            var m = new THREE.Matrix4();
            m.multiplyMatrices(partMatrix,n.matrix);

            n.position.setFromMatrixPosition( m );
            n.quaternion.setFromRotationMatrix(m);

            this._connectors.push(n);
        }
    };

    // generate the texture
    //var texture       = new THREE.Texture( generateTexture() );
    //texture.anisotropy = renderer.getMaxAnisotropy();
    //texture.needsUpdate    = true;

    //var generateTexture = function() {
    //    // build a small canvas 32x64 and paint it in white
    //    var canvas = document.createElement('canvas');
    //    canvas.width = 32;
    //    canvas.height = 64;
    //    var context = canvas.getContext('2d');
    //    // plain it in white
    //    context.fillStyle = '#ffffff';
    //    context.fillRect(0, 0, 32, 64);
    //    // draw the window rows - with a small noise to simulate light variations in each room
    //    for (var y = 2; y < 64; y += 2) {
    //        for (var x = 0; x < 32; x += 2) {
    //            var value = Math.floor(Math.random() * 64);
    //            context.fillStyle = 'rgb(' + [value, value, value].join(',') + ')';
    //            context.fillRect(x, y, 2, 1);
    //        }
    //    }
    //    // build a bigger canvas and copy the small one in it
    //    // This is a trick to upscale the texture without filtering
    //    var canvas2 = document.createElement( 'canvas' );
    //    canvas2.width    = 512;
    //    canvas2.height   = 1024;
    //    var context = canvas2.getContext( '2d' );
    //    // disable smoothing
    //    context.imageSmoothingEnabled        = false;
    //    context.webkitImageSmoothingEnabled  = false;
    //    context.mozImageSmoothingEnabled = false;
    //    // then draw the image
    //    context.drawImage( canvas, 0, 0, canvas2.width, canvas2.height );
    //    // return the just built canvas2
    //    return canvas2;
    //}

};

