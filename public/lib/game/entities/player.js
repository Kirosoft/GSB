// ig.module(
// 	'game.entities.player'
// )
// .requires(
// 	'impact.entity',
// 	'modules.dbox2d.entity'
// )
// .defines(function () {

require('../../impact/entity');
require('../../impact/animation');
require('../../modules/dbox2d/entity');

EntityPlayer = class EntityPlayer extends ig.Box2DEntity {
    constructor(x, y, settings) {
        super(x, y, settings);
        this.size = { x: 18, y: 24 };
        this.offset = { x: 0, y: 0 };
        this.name = 'EntityPlayer';
        this.type = 1; //ig.game.TYPE_PLAYER
        this.checkAgainst = ig.Entity.TYPE.NONE;
        this.collides = ig.Entity.COLLIDES.NEVER; // Collision is already handled by Box2D!

        this.animSheet = new ig.AnimationSheet('media/player.png', 16, 24);

        this.flip = false;
        this.heading = 0;
        this.headingStep = -(Math.PI / 180.0) * 2.5;
        this.velocity = 0.0;
        this.maxHeadingStep = 8 * (Math.PI / 180.0);
        this.minHeadingStep = 2 * (Math.PI / 180.0);
        this.maxVelocity = 500;
        this.minVelocity = 0;
        this.health = 200;
        //this.debugDrawer = new ig.Box2DDebug(ig.world);

        // Add the animations
        this.addAnim('idle', 1, [0]);
        this.addAnim('jump', 0.17, [1, 2]);
        this.addAnim('thrustLeft', 0.17, [5, 6]);
        this.addAnim('thrustRight', 0.17, [3, 4]);
        //this.body.SetBullet(true);
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
    handleMovementTrace(res) {
        window.console && console.debug(res);

        //this.parent(res);
    }

    left() {
        this.heading -= this.headingStep;
        //this.body.ApplyTorque(-20);

        if (this.headingStep < this.maxHeadingStep)this.headingStep += (2.0 * (Math.PI / 180.0));

    }
    right() {
        this.heading += this.headingStep;
        //this.body.ApplyTorque(20);
        if (this.headingStep < this.maxHeadingStep)
            this.headingStep += (2.0 * (Math.PI / 180.0));

    }
    jump() {
        this.velocity += 100.0;
        if (this.velocity > this.maxVelocity)
            this.velocity = this.maxVelocity;

        var vec = this.rad2vec(this.body.GetAngle() - (Math.PI / 2), this.velocity);
        this.body.ApplyForce(vec, this.body.GetPosition());
        this.currentAnim = this.anims.jump;
    }
    shoot() {
        var rate = 10.0;
        var bodyAngle = this.body.GetAngle();
        var nextAngle = bodyAngle + this.body.GetAngularVelocity() / rate;
        var angle = nextAngle - (Math.PI / 2);
        var vec = this.rad2vec(angle, 15.0);
        var bodyPos = this.body.GetPosition();
        var x = this.pos.x + (this.size.x / 2) - 4; // +vec.x;        -4 bullet width/2
        var y = this.pos.y + (this.size.y / 2) - 2; // +vec.y;
        //var x = ig.system.width / 2 ; // +vec.x;
        //var y = ig.system.height/ 2 ; // +vec.y;
        ig.game.spawnEntity('EntityProjectile', x, y, { flip: this.flip, angle: angle });
    }
    update() {

        if (typeof(serverSide) != "undefined") {

            if (ig.input.state('left') && ig.input.state('jump')) {
                var vec = this.rad2vec(((this.heading) * (Math.PI / 180.0)), 345.0);
                this.body.ApplyForce(vec, this.body.GetPosition());
                //this.flip = false;
                //this.heading += this.headingStep;
                this.currentAnim = this.anims.thrustLeft;
            }
            else if (ig.input.state('right') && ig.input.state('jump')) {
                var vec = this.rad2vec(((this.heading + 180) * (Math.PI / 180.0)), 345.0);
                this.body.ApplyForce(vec, this.body.GetPosition());
                //this.flip = false;
                //this.heading += this.headingStep;
                this.currentAnim = this.anims.thrustRight;
            }
            // move left or right
            else if (ig.input.state('left')) {
                //this.body.ApplyForce(new b2.Vec2(-20, 0), this.body.GetPosition());
                //this.flip = true;
                this.heading -= this.headingStep;
                //this.body.ApplyTorque(-20);

                if (this.headingStep < this.maxHeadingStep)
                    this.headingStep += (2.0 * (Math.PI / 180.0));
            }
            else if (ig.input.state('right')) {
                //this.body.ApplyForce(new b2.Vec2(20, 0), this.body.GetPosition());
                //this.flip = false;
                this.heading += this.headingStep;
                //this.body.ApplyTorque(20);
                if (this.headingStep < this.maxHeadingStep)
                    this.headingStep += (2.0 * (Math.PI / 180.0));
            }

            // thrust
            else if (ig.input.state('jump')) {

                this.velocity += 100.0;
                if (this.velocity > this.maxVelocity)
                    this.velocity = this.maxVelocity;

                var vec = this.rad2vec(this.body.GetAngle() - (Math.PI / 2), this.velocity);
                this.body.ApplyForce(vec, this.body.GetPosition());
                this.currentAnim = this.anims.jump;
            }
            else {
                this.currentAnim = this.anims.idle;
            }


            this.currentAnim.flip.x = this.flip;

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

            // shoot
            if (ig.input.pressed('shoot')) {
                var angle = nextAngle - (Math.PI / 2);
                var vec = this.rad2vec(angle, 15.0);
                var bodyPos = this.body.GetPosition();
                var x = this.pos.x + (this.size.x / 2) - 4; // +vec.x;        -4 bullet width/2
                var y = this.pos.y + (this.size.y / 2) - 2; // +vec.y;
                //var x = ig.system.width / 2 ; // +vec.x;
                //var y = ig.system.height/ 2 ; // +vec.y;
                ig.game.spawnEntity('EntityProjectile', x, y, { flip: this.flip, angle: angle });
            }

            // This sets the position and angle. We use the position the object
            // currently has, but always set the angle to 0 so it does not rotate
            //this.body.SetTransform(this.body.GetPosition(), 0);
            //this.body.SetTransform(this.body.GetPosition(), 0 /*(this.heading) + (Math.PI / 2)*/);
            //this.body.SetTransform(this.body.GetPosition());
            //this.angle = this.heading;
            // move!

            // decay the rate of rotation away
            this.headingStep -= (1.0 * (Math.PI / 180.0));
            if (this.headingStep < this.minHeadingStep)
                this.headingStep = this.minHeadingStep;

            this.velocity -= 10.0;
            if (this.velocity < this.minVelocity)
                this.velocity = this.minVelocity;

            this.health += .05;
            if (this.health > 200)
                this.health = 200;
        }


        super.update();
    }
    beginContact() {
        window.console && console.log("Contact");
    }
    draw() {
        super.draw();
        //this.debugDrawer.draw();

        // start - healthbar?
        // var context = ig.system.context;
        // // Create the yellow face
        // context.strokeStyle = "#ffff00";
        // context.fillStyle = "#FFFF00";
        // context.beginPath();
        // //var bodyPos = this.body.GetPosition();
        // var wp = this.pos;
        // //wp.x = wp.x - this.offset.x - ig.game.screen.x;
        // //wp.y = wp.y - this.offset.y - ig.game.screen.y;
        // var offsetx = (ig.system.width / 2) + this.size.x;
        // var offsety = (ig.system.height / 2) + this.size.y;
        // context.arc((wp.x + offsetx * 1.0) - ig.game.screen.x, (wp.y + offsety * 1.0) - ig.game.screen.y, 25, 0, Math.PI * 2, true);
        // context.lineWidth = 1;
        //
        // context.closePath();
        // context.stroke();
        //
        // context.beginPath();
        // context.rect((wp.x + offsetx * 1.0) - ig.game.screen.x + 10, (wp.y + offsety * 1.0) - ig.game.screen.y - 20, 30, 3);
        // context.fillStyle = '#000000';
        // context.fill();
        // context.lineWidth = 1;
        // context.strokeStyle = 'yellow';
        // context.closePath();
        // context.stroke();
        //
        // context.beginPath();
        // context.rect((wp.x + offsetx * 1.0) - ig.game.screen.x + 10, (wp.y + offsety * 1.0) - ig.game.screen.y - 20, (this.health / 200.0) * 30.0, 3);
        //
        // if (((this.health / 200) * 100) < 25) {
        //     context.fillStyle = '#FF0000';
        // } else {
        //     context.fillStyle = '#00FF00';
        // }
        // context.fill();
        // context.lineWidth = 0;
        // context.stroke();
        // end
        //var body = this.body.GetPosition();

        //context.fillText("test text", (wp.x + 15 + offsetx) - ig.game.screen.x, (wp.y + 15 + offsety) - ig.game.screen.y);
        //var font = new ig.Font('font1.png');
        //font.draw('Some text', ig.system.width / 2 + this.size.x / 2, ig.system.height / 2 + this.size.y / 2, ig.Font.ALIGN.RIGHT);
        //ig.game.font.draw('this.pos', ig.system.width / 2 + this.size.x / 2, ig.system.height / 2 + this.size.y / 2, ig.Font.ALIGN.CENTER);
        //ig.game.font.draw('this.body.pos', (wp.x + 15 + offsetx) - ig.game.screen.x, (wp.y + 15 + offsety) - ig.game.screen.y, ig.Font.ALIGN.CENTER);
        //ig.game.font.draw('X', ig.system.width / 2 + this.size.x / 2, ig.system.height / 2 + this.size.y / 2, ig.Font.ALIGN.CENTER);
        //context.fill();
        //console.log("This: " + this.pos.x, this.pos.y);
        ///console.log("Body: " + bodyPos.x, bodyPos.y);
        //console.log("World: " + worldPos.x, worldPos.y);
        //console.log("Screen: " + ig.game.screen.x, ig.game.screen.y);
    }
    rad2vec(angle, m) {
        var vec = new b2.Vec2(Math.cos(angle) * m, Math.sin(angle) * m);
        return vec;
    }
    processDamage(ent, damage) {
        //window.console && console.log("player process damage");
        if (this.health > 0) {
            this.health -= damage;

            if (this.health <= 0) {
                window.console && console.log("dead");
                //alert("You are dead");
                this.health = 0;
            }
        }

    }

};


EntityProjectile = class EntityProjectil extends ig.Box2DEntity {

    constructor(x, y, settings) {
        super(x, y, settings);
        this.size = { x: 8, y: 4 };
        this.angle = 0;
        this.name = 'EntityProjectile';
        this.type = 2; //ig.game.TYPE_BULLET,
        this.checkAgainst = ig.Entity.TYPE.B;
        this.collides = ig.Entity.COLLIDES.NEVER; // Collision is already handled by Box2D!
        this.animSheet = new ig.AnimationSheet('media/projectile.png', 8, 4);

        this.addAnim('idle', 1, [0]);
        this.addAnim('explode', .3, [1, 2]);
        this.currentAnim.flip.x = settings.flip;
        this.angle = settings.angle;

        var velocity = (settings.flip ? -10 : 10);
        var vec = this.rad2vec(this.angle, velocity);

        if (typeof(serverSide) != "undefined") {
            this.body.ApplyLinearImpulse(vec, this.body.GetPosition());
            this.body.SetTransform(this.body.GetPosition(), (this.angle));
            this.body.userData = this;
        }

        if (settings.hasOwnProperty("explode")) {
            this.currentAnim = this.anims.explode;
            var ent = this;
            setTimeout(function () { ent.kill(); }, 100);
        }

    }

    createBody () {
        var def = new b2.BodyDef();
        def.type = b2Body.b2_dynamicBody;
        def.position.Set(
        (this.pos.x + this.size.x / 2) * b2.SCALE,
        (this.pos.y + this.size.y / 2) * b2.SCALE
    );
        this.body = ig.world.CreateBody(def);
        var shape = new b2.PolygonShape();
        shape.SetAsBox(
        this.size.x / 2 * b2.SCALE,
        this.size.y / 2 * b2.SCALE
    );
        var fixtureDef = new b2.FixtureDef();
        fixtureDef.shape = shape;
        fixtureDef.density = 1;
        this.body.CreateFixture(fixtureDef);
    }

    rad2vec(angle, m) {
        var vec = new b2.Vec2(Math.cos(angle) * m, Math.sin(angle) * m);
        return vec;
    }
    explode() {
        //ig.game.spawnEntity(EntityProjectile, this.pos.x, this.pos.y, { flip: this.currentAnim.flip.x, angle: this.body.GetAngle(), explode: true });
    }
    kill() {
        super.kill();
        /*
        var ent = this;
        setTimeout(function () {
        ig.game.removeEntity(ent);
        }, 20);
        */
    }
    inflictDamageOnEntity(ent) {
        //window.console && console.log("player bullet process damage");
        ent.processDamage(this, 20);
    }
    processDamage(ent, damage) {


    }

};

