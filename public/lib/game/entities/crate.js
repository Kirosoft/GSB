ig.module(
	'game.entities.crate'
)
.requires(
	'modules.dbox2d.entity'
)
.defines(function(){

EntityCrate = ig.Box2DEntity.extend({
	size: {x: 8, y: 8},
	name: 'EntityCrate',
	type: 3,
	checkAgainst: ig.Entity.TYPE.NONE,
	collides: ig.Entity.COLLIDES.NEVER,
	
	animSheet: new ig.AnimationSheet( 'media/crate.png', 8, 8 ),
	
	createBody: function() {        
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
	},

	init: function( x, y, settings ) {
		this.addAnim( 'idle', 1, [0] );
		this.parent( x, y, settings );
	},
    inflictDamageOnEntity:function(ent) {

    },
    processDamage:function(ent,damage) {
    }

});


});