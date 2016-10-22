ig.module(
	'game.entities.Ram'
)
.requires(
	'impact.entity',
	'modules.dbox2d.entity'
)
.defines(function () {

    EntityRam = ig.Box2DEntity.extend({
        size: { x: 32, y: 100 },
        offset: { x: 0, y: 0 },

        type: 3, //ig.game.TYPE_ENTITY,
        checkAgainst: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!

        animSheet: new ig.AnimationSheet('media/Ram.png', 32, 100),
        name: 'EntityRam',
        flip: false,
        heading: 0,
        headingStep: -(Math.PI / 180.0) * 2.5,
        velocity: 0.0,
        maxHeadingStep: 8 * (Math.PI / 180.0),
        minHeadingStep: 2 * (Math.PI / 180.0),
        maxVelocity: 500,
        minVelocity: 0,
        health: 100,
        MAX_MOVE: 2,

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
            //points = [{ x: (this.size.x / 2) * b2.SCALE, y: (this.size.y / 2) * b2.SCALE },
            //            { x: -(this.size.x / 2) * b2.SCALE, y: (this.size.y / 2) * b2.SCALE },
            //            { x: 0, y: -(this.size.y / 2) * b2.SCALE}];
            //shape.SetAsArray(points, points.length);

            shape.SetAsBox(
                (this.size.x / 2) * b2.SCALE,
                (this.size.y / 2) * b2.SCALE);

            var fixtureDef = new b2.FixtureDef();
            fixtureDef.shape = shape;
            fixtureDef.density = 10;
            this.body.CreateFixture(fixtureDef);

        },
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            //this.debugDrawer = new ig.Box2DDebug(ig.world);

            // Add the animations
            this.addAnim('idle', .17, [0, 1, 2, 3, 4, 5, 6]);
            this.addAnim('splat', 3, [3]);


        },
        update: function () {

            //this.body.SetTransform(dirVec);
            //var shape = new b2.PolygonShape();
            //points = [{ x: (this.size.x / 2) * b2.SCALE, y: (this.size.y / 2) * b2.SCALE },
            //            { x: -(this.size.x / 2) * b2.SCALE, y: (this.size.y / 2) * b2.SCALE },
            //            { x: 0, y: -(this.size.y / 2) * b2.SCALE}];
            //shape.SetAsArray(points, points.length);
            //this.body.DestroyFixture();

            //shape.SetAsBox(
            //    (this.size.x / 2) * b2.SCALE,
            //    ((this.size.y - (this.anims.idle.frame * 14)) / 2) * b2.SCALE);

            //var fixtureDef = new b2.FixtureDef();
            //fixtureDef.shape = shape;
            //fixtureDef.density = 10;  
            //this.body.CreateFixture(fixtureDef);

            this.parent();
        },
        draw: function () {
            this.parent();
            //this.debugDrawer.draw();

            /*
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
            context.rect(wpx, wpy, (this.health / 100.0) * 30.0, 3);

            if (((this.health / 100) * 100) < 25) {
            context.fillStyle = '#FF0000';
            } else {
            context.fillStyle = '#00FF00';
            }
            context.fill();
            context.lineWidth = 0;
            context.stroke();
            */
        },
        rad2vec: function (angle, m) {
            var vec = new b2.Vec2(Math.cos(angle) * m, Math.sin(angle) * m);
            return vec;
        },
        processDamage: function (ent, damage) {
            window.console && console.log("Force field process damage");
            if (this.health > 0) {
                this.health -= damage;
                if (this.health <= 0) {
                    this.currentAnim = this.anims.splat;
                    var ent = this;
                    this.health = 0;
                    //setTimeout(function () { ig.game.removeMyEntity(ent); }, 200);
                }
            }
        },
        inflictDamageOnEntity: function (ent, damage) {
            ent.processDamage(this, 30);
        }

    });



});