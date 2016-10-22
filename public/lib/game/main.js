ig.module(
	'game.main'
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

        clearColor: '#1b2026',
        paused: false,
        removeList: [],
        TYPE_WALL: 0,
        TYPE_PLAYER: 1,
        TYPE_BULLET: 2,
        TYPE_ENTITY: 3,
        backgroundMap: null,
        init: function () {
            // bind keys for desktop web
            //ig.input.bind(ig.KEY.SPACE, 'jump');
            //ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
            //ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
            //ig.input.bind(ig.KEY.F, 'shoot');

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


            var myListener = new b2.ContactListener();
            myListener.BeginContact = function (contact) {

                var body1 = contact.GetFixtureA().GetBody();
                var body2 = contact.GetFixtureB().GetBody();
                var contactTable = [[0, 1, 2, 0], [3, 0, 0, 3], [2, 0, 0, 1], [0, 1, 1, 0]];

                var type1 = 0;
                var type2 = 0;

                if (body1.userData != null) {
                    type1 = body1.userData.type;
                }
                if (body2.userData != null) {
                    type2 = body2.userData.type;
                }

                result = contactTable[type1][type2];

                switch (result) {
                    case 0: // do nothing
                        break;
                    case 1: // processDamage to target entity from bullet
                        {
                            if (type1 == ig.game.TYPE_BULLET) {
                                if (body2.userData._killed)
                                    return;
                                body1.userData.inflictDamageOnEntity(body2.userData);
                                ig.game.removeMyEntity(body1.userData);
                            }
                            else if (type2 == ig.game.TYPE_BULLET) {
                                if (body1.userData._killed)
                                    return;
                                body2.userData.inflictDamageOnEntity(body1.userData);
                                ig.game.removeMyEntity(body2.userData);
                            }
                            break;
                        }
                    case 2: // remove
                        {
                            if (type1 > 0) {
                                if (ig.game.removeList.indexOf(body1.userData) == -1)
                                    ig.game.removeMyEntity(body1.userData);
                            }
                            if (type2 > 0) {
                                if (ig.game.removeList.indexOf(body2.userData) == -1)
                                    ig.game.removeMyEntity(body2.userData);
                            }
                            //if (type2 > 0)
                            //    ig.game.removeList.push(body2.userData);
                            break;
                        }
                    case 3: // process damage to player
                        {
                            if (type1 == ig.game.TYPE_PLAYER) {
                                if (body2.userData) {
                                    body2.userData.inflictDamageOnEntity(body1.userData);
                                } else { // wall damage
                                    //body1.userData.processDamage(null, 0);
                                }
                            }
                            else if (type2 == ig.game.TYPE_PLAYER) {
                                if (body1.userData) {
                                    body1.userData.inflictDamageOnEntity(body2.userData);
                                } else {
                                    //body2.userData.processDamage(null, 0);
                                }

                            }
                        }

                    default:
                        break;
                }

            }

            ig.world.SetContactListener(myListener);

            //ig.soundManager.format = 'MP3';
            this.backgroundMusic = new ig.Sound('media/music/DST-Aethereal.mp3');
            //ig.Sound.use = [ig.Sound.FORMAT.MP3];

            this.backgroundMusic.play();

            //ig.music.add('media/music/DST-Aethereal.mp3');
            //ig.music.volume = 0.5;
            //ig.music.play();

            // ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
            // ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
            // ig.input.bind(ig.KEY.DOWN_ARROW, 'jump');
            // ig.input.bind(ig.KEY.Z, 'jump');
            // ig.input.bind(ig.KEY.UP_ARROW, 'shoot');
            // ig.input.bind(ig.KEY.SPACE, 'shoot');

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

        update: function () {
            // screen follows the player
            var player = this.getEntitiesByType(EntityPlayer)[0];
            if (player) {
                this.screen.x = player.pos.x - ig.system.width / 2;
                this.screen.y = player.pos.y - ig.system.height / 2;
            }


            do {
                var ent = ig.game.removeList.shift();

                if (ent != null) {
                    // bullet
                    //if (ent.type == 2) {
                    //    ent.explode();
                    //}
                    ent.kill();
                }
            } while (ig.game.removeList.length > 0);

            // Update all entities and BackgroundMaps
            this.parent();

        },

        draw: function () {


            // Draw all entities and BackgroundMaps
            this.parent();
            //this.backgroundMap.draw();

            //var player = this.getEntitiesByType(EntityPlayer)[0];
            //if (player) {
            //    this.screen.x = player.pos.x - ig.system.width / 2;
            //    this.screen.y = player.pos.y - ig.system.height / 2;
            //    this.font.draw('Player (' + this.screen.x + ',' + this.screen.y + ')', 2, 2);
            //}
            //ig.world.DrawDebugData();
            //this.font.draw('Left/Right/Jump: Arrow Keys, F to shoot', 2, 2);

            if (!ig.ua.mobile || (typeof top != "undefined" && top.location.href.match('^http://localhost:58888') != null)) {
                //this.font.draw( 'Left/Right/Jump: Arrow Keys, F to shoot', 2, 2 );

            }


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
        ig.main('#canvas', MyGame, 60, 640 * 4, 480 * 4, 1);
    }

});
