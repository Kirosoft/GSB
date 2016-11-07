
require('../../impact/entity');
require('../../impact/animation');
require('../../modules/dbox2d/entity');

EntityCrate = class EntityCrate extends ig.Box2DEntity {

	constructor( x, y, settings ) {
		super(x, y, settings);
		this.size = {x: 8, y: 8};
		this.name = 'EntityCrate';
		this.type = 3;
		this.checkAgainst = ig.Entity.TYPE.NONE;
		this.collides = ig.Entity.COLLIDES.NEVER;
		this.animSheet = new ig.AnimationSheet( 'media/crate.png', 8, 8 );
		this.addAnim( 'idle', 1, [0] );
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
		shape.SetAsBox(
			this.size.x / 2 * b2.SCALE,
			this.size.y / 2 * b2.SCALE
		);
		var fixtureDef = new b2.FixtureDef();
		fixtureDef.shape = shape;
		fixtureDef.density = 1;
		this.body.CreateFixture(fixtureDef);
	}

    inflictDamageOnEntity(ent) {

    }
    processDamage(ent,damage) {
    }

};
