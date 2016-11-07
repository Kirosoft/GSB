// ig.module(
// 	'game.entities.Turret'
// )
// .requires(
// 	'impact.entity',
// 	'modules.dbox2d.entity'
// )
// .defines(function () {

require('../../impact/entity');
require('../../impact/animation');
require('../../modules/dbox2d/entity');

EntityTurret = class EntityTurret extends ig.Box2DEntity {

    constructor (x, y, settings) {
        super(x, y, settings);

        this.size = { x: 32, y: 32 };
        this.offset = { x: 0, y: 0 };

        this.type = 3; //ig.game.TYPE_ENTITY,
        this.checkAgainst = ig.Entity.TYPE.NONE;
        this.collides = ig.Entity.COLLIDES.NEVER; // Collision is already handled by Box2D!

        this.animSheet = new ig.AnimationSheet('media/turret.png', 32, 32);
        this.name = 'EntityTurret';
        this.flip = false;
        this.heading = 0;
        this.headingStep = -(Math.PI / 180.0) * 2.5;
        this.velocity = 0.0;
        this.maxHeadingStep = 8 * (Math.PI / 180.0);
        this.minHeadingStep = 2 * (Math.PI / 180.0);
        this.maxVelocity = 500;
        this.minVelocity = 0;
        this.health = 100;
        this.MAX_MOVE = 2;
        this.lastTime =new Date();;

        //this.debugDrawer = new ig.Box2DDebug(ig.world);

        // Add the animations
        this.addAnim('idle', .17, [0]);
        this.addAnim('splat', 3, [3]);
        this.type = 3;


    }

    createBody() {
        var def = new b2.BodyDef();
        def.type = b2Body.b2_dynamicBody;
        def.position.Set(
                (this.pos.x + this.size.x / 2) * b2.SCALE,
                (this.pos.y + this.size.y / 2) * b2.SCALE
            );
        this.body = ig.world.CreateBody(def);
        this.body.userData = this;
        var shape = new b2.PolygonShape();
        var points = [{ x: (this.size.x / 2) * b2.SCALE, y: (this.size.y / 2) * b2.SCALE },
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
    }

    update() {

        if (typeof(serverSide) != "undefined") {
            var player = ig.game.getEntitiesByType(EntityPlayer)[0];
            if (player) {
                this.heading = this.angleTo(player) + Math.PI / 2;

                /*
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
                 //this.body.ApplyForce(dirVec, this.body.GetPosition());
                 */
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

                if (totalRotation < Math.PI / 8) {
                    var now = new Date();

                    if (this.lastTime != null) {
                        var elapsed = now - this.lastTime;

                        if (elapsed > 10 * 60) {
                            var angle = nextAngle - (Math.PI / 2);
                            var vec = this.rad2vec(angle, this.size.x);
                            var bodyPos = this.body.GetPosition();
                            var x = this.pos.x + (this.size.x/2)+vec.x;        //-4 bullet width/2
                            var y = this.pos.y + (this.size.y/2) +vec.y;
                            ig.game.spawnEntity(EntityProjectile, x, y, { flip: this.flip, angle: angle });
                            this.lastTime = now;
                        }
                    } else {
                        var angle = nextAngle - (Math.PI / 2);
                        var vec = this.rad2vec(angle, 15.0);
                        var bodyPos = this.body.GetPosition();
                        var x = this.pos.x + (this.size.x / 2) - 4; // +vec.x;        -4 bullet width/2
                        var y = this.pos.y + (this.size.y / 2) - 2; // +vec.y;
                        ig.game.spawnEntity(EntityProjectile, x, y, { flip: this.flip, angle: angle });
                        this.lastTime = now;
                    }

                }
            }
        }

        //this.body.SetTransform(dirVec);

        super.update();
    }
    draw () {
        super.draw();
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

    }
    rad2vec (angle, m) {
        var vec = new b2.Vec2(Math.cos(angle) * m, Math.sin(angle) * m);
        return vec;
    }
    processDamage (ent, damage) {
        window.console && console.log("turret process damage");
        if (this.health > 0) {
            this.health -= damage;
            if (this.health <= 0) {
                this.currentAnim = this.anims.splat;
                var ent = this;
                this.health = 0;
                setTimeout(function () { ig.game.removeMyEntity(ent); }, 200);
            }
        }
    }
    inflictDamageOnEntity(ent, damage) {
        ent.processDamage(this, 30);
    }

};

