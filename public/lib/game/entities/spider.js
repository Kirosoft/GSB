ig.module(
	'game.entities.spider'
)
.requires(
	'impact.entity',
	'modules.dbox2d.entity'
)
.defines(function () {

    EntitySpider = ig.Box2DEntity.extend({
        size: { x: 32, y: 32 },
        offset: { x: 0, y: 0 },

        type: 3, //ig.game.TYPE_ENTITY,
        checkAgainst: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!

        animSheet: new ig.AnimationSheet('media/spider.png', 32, 32),
        name: 'EntitySpider',
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
            def.type = b2Body.b2_dynamicBody;
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
            this.addAnim('idle', .17, [0, 1, 2]);
            this.addAnim('splat', 3, [3]);


        },
        update: function () {

            var player = ig.game.getEntitiesByType(EntityPlayer)[0];

            if (typeof(serverSide) != "undefined" && player) {
                var dirVec = new b2.Vec2(0, 0);
                dirVec.SetV(this.body.GetPosition());
                // convert to spider coord system
                dirVec.Subtract(player.body.GetPosition());

                dirVec.Normalize();
                this.heading = Math.atan2(dirVec.y, dirVec.x) - (Math.PI);
                dirVec.Multiply(200);

                dirVec = dirVec.GetNegative();

                // convert back to world coords
                //dirVec.Add(this.body.GetPosition());
                // TODO: cancel gravity
                //this.dirVec.x += (mass*
                this.body.ApplyForce(dirVec, this.body.GetPosition());

                //this.moveTo(100, 100);
                var rate = 10.0;
                var bodyAngle = this.body.GetAngle();
                var nextAngle = bodyAngle + this.body.GetAngularVelocity() / rate;
                var totalRotation = this.heading - nextAngle;

                while (totalRotation < -180 * (Math.PI / 180))
                    totalRotation += 360 * (Math.PI / 180);
                while (totalRotation > 180 * (Math.PI / 180))
                    totalRotation -= 360 * (Math.PI / 180);

                var desiredAngularVelocity = totalRotation * rate;
                var torque = this.body.GetInertia() * desiredAngularVelocity / (1 / rate);
                this.body.ApplyTorque(torque);
            }




            //this.body.SetTransform(dirVec);

            this.parent();
        },
        draw: function () {
            this.parent();
            //this.debugDrawer.draw();
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

        },
        rad2vec: function (angle, m) {
            var vec = new b2.Vec2(Math.cos(angle) * m, Math.sin(angle) * m);
            return vec;
        },
        processDamage: function (ent, damage) {
            window.console && console.log("spider process damage");
            if (this.health > 0) {
                this.health -= damage;
                if (this.health <= 0) {
                    this.currentAnim = this.anims.splat;
                    var ent = this;
                    this.health = 0;
                    setTimeout(function () { ig.game.removeMyEntity(ent); }, 200);
                }
            }
        },
        inflictDamageOnEntity: function (ent, damage) {
            ent.processDamage(this, 30);
        }

    });



});