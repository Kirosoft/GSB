ig.module(
	'game.entities.SpiderHub'
)
.requires(
	'impact.entity',
	'modules.dbox2d.entity'
)
.defines(function () {

    EntitySpiderHub = ig.Box2DEntity.extend({
        size: { x: 64, y: 64 },
        offset: { x: 0, y: 0 },

        type: 3, //ig.game.TYPE_ENTITY,
        checkAgainst: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!

        animSheet: new ig.AnimationSheet('media/spiderhub.png', 64, 64),
        name: 'EntitySpiderHub',
        flip: false,
        heading: 0,
        headingStep: -(Math.PI / 180.0) * 2.5,
        velocity: 0.0,
        maxHeadingStep: 8 * (Math.PI / 180.0),
        minHeadingStep: 2 * (Math.PI / 180.0),
        maxVelocity: 500,
        minVelocity: 0,
        health: 200,
        MAX_HEALTH: 200,
        MAX_MOVE: 2,
        lastTime: null,
        spiderCount: 0,
        MAX_SPIDERS:15,

        createBody: function () {
            var def = new b2.BodyDef();
            def.type = b2Body.b2_staticBody;
            def.position.Set(
    			    (this.pos.x + this.size.x / 2) * b2.SCALE,
	    		    (this.pos.y + this.size.y / 2) * b2.SCALE
		        );
            this.body = ig.world.CreateBody(def);
            this.body.userData = this;
            var shape = new b2.PolygonShape();
            points = [{ x: (this.size.x / 2) * b2.SCALE, y: (this.size.y / 2) * b2.SCALE },
                        { x: -(this.size.x / 2) * b2.SCALE, y: (this.size.y / 2) * b2.SCALE },
                        { x: 0, y: -(this.size.y / 2) * b2.SCALE}];
            shape.SetAsArray(points, points.length);

            //shape.SetAsOrientedBox(
            //(this.size.x / 2) * b2.SCALE,
            //(this.size.y / 2) * b2.SCALE,
            //new b2.Vec2(0, 0),
            //this.heading-(Math.PI/2)
            //);

            var fixtureDef = new b2.FixtureDef();
            fixtureDef.shape = shape;
            fixtureDef.density = 10;
            this.body.CreateFixture(fixtureDef);


        },
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            //this.debugDrawer = new ig.Box2DDebug(ig.world);

            // Add the animations
            this.addAnim('idle', .17, [0]);

            lastTime = new Date();


        },
        update: function () {

            var player = ig.game.getEntitiesByType(EntityPlayer)[0];

            if ((this.distanceTo(player) < 200) && (this.spiderCount < this.MAX_SPIDERS)) {

                var now = new Date();

                if (this.lastTime != null) {
                    var elapsed = now - this.lastTime;

                    if (elapsed > 30 * 60) {
                        ig.game.spawnEntity('EntitySpider', this.pos.x, this.pos.y, { flip: this.flip, angle: 0 });
                        this.lastTime = now;
                        this.spiderCount++;
                    }
                } else {
                    ig.game.spawnEntity('EntitySpider', this.pos.x, this.pos.y, { flip: this.flip, angle: 0 });
                    this.lastTime = now;
                    this.spiderCount++;
                }

            }

            this.health += 0.05;
            if (this.health > this.MAX_HEALTH)
                this.health = this.MAX_HEALTH;

            this.parent();
        },
        draw: function () {
            this.parent();

            var context = ig.system.context;
            var wp = this.pos;
            var wpx = ig.system.getDrawPos(wp.x - ig.game.screen.x); // -this.offset.x - ig.game.screen.x + this.size.x;
            var wpy = ig.system.getDrawPos(wp.y - ig.game.screen.y); // - this.offset.y - ig.game.screen.y + this.size.y;

            context.beginPath();
            context.rect(wpx, wpy, 30, 3);
            context.fillStyle = '#000000';
            context.fill();
            context.lineWidth = 1;
            context.strokeStyle = 'yellow';
            context.closePath();
            context.stroke();

            context.beginPath();
            context.rect(wpx, wpy, (this.health / this.MAX_HEALTH) * 30.0, 3);

            if (((this.health / this.MAX_HEALTH) * 100) < 25) {
                context.fillStyle = '#FF0000';
            } else {
                context.fillStyle = '#00FF00';
            }
            context.fill();
            context.lineWidth = 0;
            context.stroke();

            //this.debugDrawer.draw();
        },
        rad2vec: function (angle, m) {
            var vec = new b2.Vec2(Math.cos(angle) * m, Math.sin(angle) * m);
            return vec;
        },
        processDamage: function (ent, damage) {
            window.console && console.log("spider hub process damage");
            this.health -= damage;
            if (this.health <= 0) {
                this.currentAnim = this.anims.splat;
                var ent = this;

                setTimeout(function () { ig.game.removeMyEntity(ent); }, 200);
            }
        },
        inflictDamageOnEntity: function (ent, damage) {
            ent.processDamage(this, 30);
        }

    });



});