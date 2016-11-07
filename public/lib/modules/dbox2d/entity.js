// ig.module(
// 	'modules.dbox2d.entity'
// )
// .requires(
// 	'impact.entity',
// 	'modules.dbox2d.game'
// )
// .defines(function () {
require('../../impact/entity');

ig.Box2DEntity = class Box2DEntity extends ig.Entity {

	constructor (x, y, settings) {
		super(x, y, settings);
		this.body = null;
		this.angle = 0;

		// Only create a box2d body when we are not in Weltmeister
		if ((!ig.global.wm) && (typeof(serverSide) != 'undefined')) {
			this.createBody();
		}
	}

	createBody() {
		var bodyDef = new b2.BodyDef();
		bodyDef.position.Set(
			(this.pos.x + this.size.x / 2) * b2.SCALE,
			(this.pos.y + this.size.y / 2) * b2.SCALE
		);

		this.body = ig.world.CreateBody(bodyDef);

		var shape = new b2.PolygonShape();
		shape.SetAsBox(
			this.size.x / 2 * b2.SCALE,
			this.size.y / 2 * b2.SCALE
		);
		var density = 1;
		var fixture = this.body.CreateFixture2(shape, density);
	}

	update() {
		if (typeof(serverSide) != 'undefined') {
			var p = this.body.GetPosition();
			this.pos = {
				x: (p.x / b2.SCALE - this.size.x / 2),
				y: (p.y / b2.SCALE - this.size.y / 2)
			};
			this.angle = this.body.GetRoundedAngle(2);
		}

		if (this.currentAnim) {
			this.currentAnim.update();
			this.currentAnim.angle = this.angle;
		}
	}

	kill() {
		ig.world.DestroyBody(this.body);
		super.kill();
	}
};

