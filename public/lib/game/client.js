

class Game {

    constructor() {
        var _self = this;
        this.entityHash = {};


        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 1000);

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio( window.devicePixelRatio );
        document.body.appendChild(this.renderer.domElement);

        var geometry = new THREE.BoxGeometry(10,10,10);
        for ( var i = 0; i < geometry.faces.length; i += 2 ) {
            var hex = Math.random() * 0xffffff;
            geometry.faces[ i ].color.setHex( hex );
            geometry.faces[ i + 1 ].color.setHex( hex );
        }
        var material = new THREE.MeshBasicMaterial({ vertexColors: THREE.FaceColors, overdraw: 0.5 });
//var controls = new THREE.OrbitControls( camera, renderer.domElement);
        this.keyboard = new THREEx.KeyboardState();
        this.clock = new THREE.Clock();
        this.scene.add( new THREE.AmbientLight( 0xAAAAAA ) );
        this.rotating = new THREE.Object3D();
        this.movingCube = null;
        this.cameraHeight = 15;
        this.cameraBackoff = -30;
        this.galacticCentering = new THREE.Object3D();
        this.spacePlane = null;
        this.simpleSpaceShip = null;
        this.spider = null;
        this.spiderAnimation = null;
        this.starData = null;

        this.scene.add( new THREE.AmbientLight( 0xAAAAAA ) );

        this.cube = new THREE.Mesh(geometry, material);
        this.cube.position.set(0,0,0);

        this.scene.add(this.cube);
        this.movingCube = this.cube;

        var pSystem = null;
        this.camera.position.z = 25;




        var tc = THREEx.createTextureCube([
            "px.jpg", "nx.jpg",
            "py.jpg", "ny.jpg",
            "pz.jpg", "nz.jpg"
        ]);

        var  skymap = THREEx.createSkymap({
            textureCube:tc,
            cubeW: 999,
            cubeH: 999,
            cubeD: 999
        });

        this.scene.add( skymap );

        //	load all the shaders first before doing anything
        loadShaders( shaderList, function(e){
            //	we have the shaders loaded now...
            shaderList = e;
            _self.galacticCentering.add( translating );
            _self.rotating.add( _self.galacticCentering );
            _self.galacticCentering.rotateX(-Math.PI);
            _self.scene.add(_self.rotating);

            loadStarData( "data/stars.json", function(loadedData){
                _self.starData = loadedData;
                //animate();
                // pSystem = generateHipparcosStars();
                // translating.add( pSystem );

                // spacePlane = createSpacePlane();
                // translating.add( spacePlane );


                setTimeout(() => {
                    // Generate a new random ship
                    var shipFactory = new ShipFactory("this is a classic!");
                    _self.ship = shipFactory.GetShip();
                    _self.scene.add(_self.ship);
                    _self.scene.updateMatrixWorld(true);
                },500);

                var mazeFactory = new MazeFactory("another one!");
                var mazeParent = mazeFactory.getMaze(function(maze) {
                    _self.scene.add(maze);

                    // Ground
                    var loader = new THREE.TextureLoader();
                    loader.load('images/desert.jpg', function(texture) {
                        var plane = new THREE.BoxGeometry( 100, 100, 1 );
                        var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );

                        var meshPlane = new THREE.Mesh( plane, material );
                        meshPlane.rotation.x = -Math.PI / 2;
                        meshPlane.scale.x = meshPlane.scale.y = 5;
                        meshPlane.translateZ(-5);
                        meshPlane.translateX(250);
                        meshPlane.translateY(-250);
                        _self.scene.add( meshPlane );
                    });



                });
            });

        });


        var loader  = new THREEx.UniversalLoader();
        var url = "/models/collada/spaceship/Hull.dae";

        loader.load(url, (object3d) => {
            // this function will be notified when the model is loaded
            _self.simpleSpaceShip = object3d;
            //movingCube.material.side = THREE.DoubleSide
            //movingCube.scale.set(0.02,0.02,0.02);
            _self.scene.add(_self.simpleSpaceShip);

        });

//
        var url1 = "models/collada/spider/KickassSpider.dae";
        var loader3  = new THREE.ColladaLoader();
        //loader3.options.convertUpAxis = true;

        loader3.load(url1, (object3d) => {
            // this function will be notified when the model is loaded
            //movingCube.material.side = THREE.DoubleSide
            //movingCube.scale.set(0.02,0.02,0.02);
            //scene.add(spider);
            _self.spider = object3d.scene.children[0];
            //movingCube = spider;

            object3d.scene.traverse( function ( child ) {

                if ( child instanceof THREE.SkinnedMesh ) {

                    _self.spiderAnimation = new THREE.Animation( child, child.geometry.animation );
                    //spiderAnimation.play();

                }

            } );
            _self.spider.position.set(50,0,50);
            _self.spider.scale.set(2.5,2.5,2.5);
            _self.spider.rotation.z = Math.PI;
//        spider.updateMatrix();
            _self.scene.add(_self.spider);
            //spider.scale.set(50,50,50);
            //spider.rotateOnAxis( new THREE.Vector3(1,0,0), Math.PI/2);
            _self.comms();
            _self.render();

        });

    }

    comms() {
        var _self = this;
        this.socket = io();

        this.socket.on('connect', function () { // TIP: you can avoid listening on `connect` and listen on events directly too!
            console.log("Client Connected");

            _self.socket.emit("player-joined","ok");

            _self.socket.on('entities-update', function (msg) {

                msg.forEach((ele, idx) => {
                    let ent = _self.entityHash[ele.id];

                    if (ent) {
                        ent.position.set(ele.pos.x,5, ele.pos.y);
                        ent.angle = ele.angle;
                        ent.velocity = ele.velocity;
                        if (ent && _self.player && ent.id == _self.player.id) {
                            //console.log(ent.angle);
                            _self.simpleSpaceShip.rotation.set(0,ent.angle,0);
                        }
                    }
                });
            });
            _self.socket.on('entities-kill', function (msg) {

                msg.forEach((ele, idx) => {
                    let ent = _self.entityHash[ele.id];
                    if (ent) {
                        _self.scene.remove( ent );
                        delete _self.entityHash[ele.id];
                    } else {
                        console.log("ID did not exist: "+ele.id);
                    }
                });
            });

            var addEntity = (ent) => {
                let newEntity = _self.spawnEntity(ent.type,ent.pos.x,ent.pos.y,ent.settings);
                if (newEntity) {
                    newEntity.serverId = ent.id;
                    _self.entityHash[ent.id] = newEntity;
                } else {
                    console.log("Failed to spawn: "+ent.type + " - serverside id: "+ent.id);
                }
                return newEntity;
            };

            _self.socket.on('entities-spawn', addEntity);
            _self.socket.on('entities-initialise', function (playerId, entList) {

                entList.forEach((ele, idx) => {
                    let entity = addEntity(ele);
                    if (entity && entity.serverId == playerId) {
                        _self.player = entity;
                    }
                });
            });

        });

    }
    update() {
        var keyboard = this.keyboard;
        var movingCube = this.movingCube;

        var delta = this.clock.getDelta(); // seconds.
        var moveDistance = 50 * delta; // 200 pixels per second
        var rotateAngle = Math.PI / 2 * delta;   // pi/2 radians (90 degrees) per second

        THREE.AnimationHandler.update( delta );

        if ( keyboard.pressed("O") ) {
            this.socket.emit("user_input","left");
        }
        if ( keyboard.pressed("P") ) {
            this.socket.emit("user_input","right");
        }
        if ( keyboard.pressed("B") ) {
            this.socket.emit("user_input","jump");
        }
        if ( keyboard.pressed(" ") ) {
            this.socket.emit("user_input","shoot");
        }

        // local transformations
        // move forwards/backwards/left/right
        if ( keyboard.pressed("W") )
            this.movingCube.translateZ( moveDistance );
        if ( keyboard.pressed("S") )
            this.movingCube.translateZ(  -moveDistance );
        if ( keyboard.pressed("Q") )
            this.movingCube.translateX( -moveDistance );
        if ( keyboard.pressed("E") )
            this.movingCube.translateX(  moveDistance );
        // rotate left/right/up/down
        var rotation_matrix = new THREE.Matrix4().identity();
        if ( keyboard.pressed("A") )
            this.movingCube.rotateOnAxis( new THREE.Vector3(0,1,0), rotateAngle);
        if ( keyboard.pressed("D") )
            this.movingCube.rotateOnAxis( new THREE.Vector3(0,1,0), -rotateAngle);
        if ( keyboard.pressed("R") )
            movingCube.rotateOnAxis( new THREE.Vector3(1,0,0), rotateAngle);
        if ( keyboard.pressed("F") )
            this.movingCube.rotateOnAxis( new THREE.Vector3(1,0,0), -rotateAngle);

        if (keyboard.pressed("T")) {
            this.cameraHeight += 10;
        }
        if (keyboard.pressed("G")) {
            this.cameraHeight -= 10;
        }

        //if (cameraHeight > 20) {
        //    cameraBackoff = 0;
        //} else {
        //    cameraBackoff = -1500;
        //}

        if ( keyboard.pressed("Z") )
        {
            this.cameraHeight = 25;
            this.cameraBackoff = -50;
            this.movingCube.position.set(0,25.1,0);
            this.movingCube.rotation.set(0,0,0);
        }

        if ( keyboard.pressed("1")) {
            this.movingCube =this.simpleSpaceShip;
            console.log(this.movingCube.position);
        }
        if ( keyboard.pressed("2")) {
            this.movingCube =this.ship;
            console.log(this.movingCube.position);
        }

        if (keyboard.pressed("3")) {
            this.movingCube = this.spider;
            console.log(this.movingCube.position);
        }

        if (keyboard.pressed("4")) {
            this.spiderAnimation.play();
        }
        if (keyboard.pressed("5")) {
            this.movingCube.scale.set(3.5,3.5,3.5);
        }

        // Chase mode
        var relativeCameraOffset = new THREE.Vector3(0,this.cameraHeight,this.cameraBackoff);
        var cubeWorldPos = new THREE.Matrix4();
        if (movingCube) {
            cubeWorldPos.copy(movingCube.matrixWorld);
            //cubeWorldPos.makeScale(1,1,1);
            var cameraOffset = relativeCameraOffset.applyMatrix4( cubeWorldPos );

            this.camera.position.lerp(cameraOffset,0.03);
            this.camera.lookAt( this.movingCube.position );

            this.camera.markersVisible = true; //camera.position.z < markerThreshold.max && camera.position.z > markerThreshold.min;
        }


    };

    render() {
        requestAnimationFrame(this.render.bind(this));

        // cube.rotation.x += 0.01;
        // cube.rotation.y += 0.01;

        //modelParent.rotation.z += 0.01;
        //modelParent.rotation.y += 0.01;
        this.update();

        this.renderer.render(this.scene, this.camera);
    };

    getFloorMaterial () {
        var floorTextureMaterial = new THREE.MeshLambertMaterial( { map: new THREE.Texture(null, THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping) } );


        var img = new Image();
        floorTextureMaterial.map.image = img;
        img.onload = function () {
            floorTextureMaterial.map.image.loaded = 1;
            floorTextureMaterial.map.needsUpdate = true;
        };

        img.src = "/images/desert.jpg";

        return floorTextureMaterial;
    }

    spawnEntity(type, x, y, settings) {
        var height = 5;
        var _self = this;

        if (type == "EntitySpider") {
            let newSpider = _self.spider.clone();
            newSpider.position.set(x,height, y);
            this.scene.add(newSpider);
            return newSpider;
        }
        if (type == "EntityCrate") {
            let newSpider = _self.cube.clone();
            newSpider.position.set(x,height, y);
            this.scene.add(newSpider);
            return newSpider;
        }
        if (type == "EntityTurret") {
            let newSpider = _self.cube.clone();
            newSpider.position.set(x,height, y);
            this.scene.add(newSpider);
            return newSpider;
        }
        if (type == "Ram") {
            let newSpider = _self.cube.clone();
            newSpider.position.set(x,height, y);
            this.scene.add(newSpider);
            return newSpider;
        }
        if (type == "EntityProjectile") {
            let newSpider = _self.cube.clone();
            newSpider.position.set(x,height, y);
            newSpider.scale.set(0.5,0.5, 0.5);
            this.scene.add(newSpider);
            return newSpider;
        }
        if (type == "EntityPlayer") {
            return _self.simpleSpaceShip;
        }
    }
}

new Game();
