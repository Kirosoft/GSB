/**
 * Created by marknorman on 04/11/2016.
 */

ig.module(
    'game.client'
)
    .requires(
        'impact.game',
        'impact.font',
        'plugins.dc.dc',
        'modules.dbox2d.dbox2d',
        'game.entities.player',
        'game.entities.crate',
        'game.entities.spider',
        'game.entities.SpiderHub',
        'game.entities.ForceField',
        'game.entities.Turret',
        'game.entities.Ram',
        'impact.on-demand-background-map',
//'plugins.box2d.game',
//  'modules.box2d.debug',
        'modules.ServerLibs.GeoHash',
//    'game.levels.test',
        'game.levels.test',
        'game.levels.empty'
//'impact.debug.debug'          // turns on the debug panel display
    )
    .defines(function () {

        MyGame = ig.Box2DGame.extend({


            gravity: 100, // All entities are affected by this

            // Load a font
            font: new ig.Font('media/04b03.font.png'),
            clearColor: '#1b2026',
            paused: false,
            removeList: [],
            TYPE_WALL: 0,
            TYPE_PLAYER: 1,
            TYPE_BULLET: 2,
            TYPE_ENTITY: 3,
            backgroundMap: null,
            socket: null,
            client: true,
            player: null,
            init: function () {
                // bind keys for desktop web
                ig.input.bind(ig.KEY.SPACE, 'shoot');
                ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
                ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
                ig.input.bind(ig.KEY.DOWN_ARROW, 'jump');
                var _self = this;
                _self.entityHash = {};

                socket = io();
                socket.on('connect', function () { // TIP: you can avoid listening on `connect` and listen on events directly too!
                    console.log("Client Connected");

                    socket.emit("player-joined","ok");

                    _self.entities.forEach((ele, idx) => {
                        _self.entityHash[ele.id] = ele;
                    });

                    socket.on('entities-update', function (msg) {

                        msg.forEach((ele, idx) => {
                            let ent = _self.entityHash[ele.id];

                            if (ent) {
                                ent.pos = ele.pos;
                                ent.angle = ele.angle;
                                ent.velocity = ele.velocity;
                            }
                        });
                    });
                    socket.on('entities-kill', function (msg) {

                        msg.forEach((ele, idx) => {
                            let ent = _self.entityHash[ele.id];
                            if (ent) {
                                ent.erase();
                                delete _self.entityHash[ele.id];
                            } else {
                                console.log("ID did not exist: "+ele.id);
                            }
                        });
                    });

                    addEntity = (ent) => {
                        let newEntity = _self.spawnEntity(ent.type,ent.x,ent.y,ent.settings);
                        if (newEntity) {
                            newEntity.serverId = ent.id;
                            _self.entityHash[ent.id] = newEntity;
                        } else {
                            console.log("Failed to spawn: "+ent.type + " - serverside id: "+ent.id);
                        }
                        return newEntity;
                    };

                    socket.on('entities-spawn', addEntity);
                    socket.on('entities-initialise', function (playerId, entList) {

                        entList.forEach((ele, idx) => {
                            let entity = addEntity(ele);
                            if (entity.serverId == playerId) {
                                _self.player = entity;
                            }
                        });
                    });


                });

                this.loadLevel(LevelTest);
                // -------------------
                // begin from http://impactjs.com/forums/code/box2d-plugin
                // In your game's init() method, after the Box2d world has
                // been created (e.g. after .loadLevel())
                //this.debugDrawer = new b2.DebugDraw(ig.world);
                // end from http://impactjs.com/forums/code/box2d-plugin
                // ---------------------
                /*     var debugDraw = new b2.DebugDraw();
                 debugDraw.SetSprite(document.getElementById("_cvs").getContext("2d"));

                 debugDraw.SetDrawScale(10.0);

                 debugDraw.SetFillAlpha(0.5);

                 debugDraw.SetLineThickness(1.0);

                 debugDraw.SetFlags(b2.DebugDraw.e_shapeBit | b2.DebugDraw.e_aabbBit);

                 ig.world.SetDebugDraw(debugDraw);
                 */
                MyGame.removeList = [];
                this.debugCollisionRects = false;
                //setup debug draw
                //debugDraw.SetSprite(document.GetElementsByTagName("_cvs")[0].getContext("2d"));
                //AppMobi.webview.execute('canvasInit();');


                //ig.soundManager.format = 'MP3';
                //this.backgroundMusic = new ig.Sound('media/music/DST-Aethereal.mp3');
                //ig.Sound.use = [ig.Sound.FORMAT.MP3];

                //this.backgroundMusic.play();

                ig.music.add('media/music/DST-Aethereal.mp3');
                ig.music.volume = 0.5;
                ig.music.play();

                // var geoHash = new GeoHash();
                //var hashCode = geoHash.encodeGeoHash(0, 0);
                // window.console && console.log("Hash code: " + hashCode);

                // var newMap = new ig.OnDemandBackgroundMap(693, [[1]], 'media/stars-bg.png');
                //
                // newMap.anims = {};
                // newMap.repeat = true;
                // newMap.distance = 5;
                // newMap.foreground = false;
                // newMap.preRender = false;
                // newMap.name = 'stars';
                // ig.game.backgroundMaps.push(newMap);
                //
                //  newMap.setScreenPos(0, 0);

            },
            removeMyEntity: function (ent) {
                if (ent._killed)
                    return;
                ent._killed = true;
                ent.checkAgainst = ig.Entity.TYPE.NONE;
                ent.collides = ig.Entity.COLLIDES.NEVER;
                ig.game.removeList.push(ent);
            },
            loadLevel: function (data) {
                this.parent(data);
                for (var i = 0; i < this.backgroundMaps.length; i++) {
                    this.backgroundMaps[i].preRender = true;
                }

            },
            update: function() {
                if (this.player) {
                    this.screen.x = this.player.pos.x - ig.system.width / 2;
                    this.screen.y = this.player.pos.y - ig.system.height / 2;
                }

            },

            draw: function () {

                if (ig.input.state('left')) {
                    socket.emit('user_input','left');
                }
                if (ig.input.state('right')) {
                    socket.emit('user_input','right');
                }
                if (ig.input.state('jump')) {
                    socket.emit('user_input','jump');
                }
                if (ig.input.state('shoot')) {
                    socket.emit('user_input','shoot');
                }

                // Draw all entities and BackgroundMaps
                this.parent();
                //this.backgroundMap.draw();

                //var player = this.getEntitiesByType(EntityPlayer)[0];
                //ig.world.DrawDebugData();
                //this.font.draw('Left/Right/Jump: Arrow Keys, F to shoot', 2, 2);

                if (!ig.ua.mobile || (typeof top != "undefined" && top.location.href.match('^http://localhost:58888') != null)) {
                    //this.font.draw( 'Left/Right/Jump: Arrow Keys, F to shoot', 2, 2 );

                }


            },
            drawEntities: function() {
                let _self = this;

                Object.keys(this.entityHash).forEach((key) => {
                    _self.entityHash[key].update();
                    _self.entityHash[key].draw();
                });
            },

            pause: function () {
                if (ig.system) {
                    if (ig.game) {
                        ig.game.font.draw('Game Paused', ig.system.width / 2, ig.system.height / 2, ig.Font.ALIGN.CENTER);
                    }
                    ig.system.stopRunLoop.call(ig.system);
                }
            },

            unpause: function () {
                if (ig.system) {
                    ig.system.startRunLoop.call(ig.system);
                }
            }

        });

        // Start the Game with 60fps, scaled up by a factor of 2 or 4
        // Set height/width/scale based on device type
        if (ig.ua.iPad) {
            ig.main('#_cvs', MyGame, 60, 256, 187, 4);
        }
        else {
            ig.main('#canvas', MyGame, 60, canvas.width * 4, canvas.height * 4, 1);
        }

    });
