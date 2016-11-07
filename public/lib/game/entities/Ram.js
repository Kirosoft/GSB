// ig.module(
// 	'game.entities.Ram'
// )
// .requires(
// 	'impact.entity',
// 	'modules.dbox2d.entity'
// )
// .defines(function () {

require('../../impact/entity');
require('../../impact/animation');
require('../../modules/dbox2d/entity');

EntityRam = class EntityRam  extends ig.Box2DEntity {
    constructor (x, y, settings) {
        super(x, y, settings);
        this.size = { x: 32, y: 100 };
        this.offset =  { x: 0, y: 0 };

        this.type = 3; //ig.game.TYPE_ENTITY,
        this.checkAgainst = ig.Entity.TYPE.NONE;
        this.collides = ig.Entity.COLLIDES.NEVER; // Collision is already handled by Box2D!

        this.animSheet = new ig.AnimationSheet('media/Ram.png', 32, 100);
        this.name = 'EntityRam';
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

        //this.debugDrawer = new ig.Box2DDebug(ig.world);

        // Add the animations
        this.addAnim('idle', .17, [0, 1, 2, 3, 4, 5, 6]);
        this.addAnim('splat', 3, [3]);
    }

    createBody() {
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

    }

   update() {

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

        super.update();
    }


    rad2vec(angle, m) {
        var vec = new b2.Vec2(Math.cos(angle) * m, Math.sin(angle) * m);
        return vec;
    }
    processDamage (ent, damage) {
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
    }

    inflictDamageOnEntity (ent, damage) {
        ent.processDamage(this, 30);
    }

};
