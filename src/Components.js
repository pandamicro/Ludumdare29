/**
 * Created by Huabin LING on 4/26/14.
 */

var FLUID_DENSITY = 0.05;
var FLUID_DRAG = 2.0;

var Pool = cc.LayerColor.extend({
    waterColor : cc.color(14, 36, 222, 100),
    waterSensor : null,

    ctor : function (objDesc) {
        this._super(this.waterColor, objDesc.width, objDesc.height);
        this.x = objDesc.x;
        this.y = objDesc.y;

        // Add the sensor for the water.
        var bb = new cp.BB(objDesc.x, objDesc.y, objDesc.x + objDesc.width, objDesc.y + objDesc.height);
        this.waterSensor = Physics.world.addShape( new cp.BoxShape2(Physics.world.staticBody, bb) );
        this.waterSensor.setSensor(true);
        this.waterSensor.setCollisionType(Pool.COL_TYPE);

        Physics.world.addCollisionHandler( Pool.COL_TYPE, Goron.COL_TYPE, function (a) {
            var poly = a.getB();
            poly.setFriction(0.8);
            var body = poly.getBody();
            var goron = poly.obj.view;
            var mass = body.m * 2;
            var moment = cp.momentForBox(mass, goron.width, goron.height);
            body.setMass(mass);
            body.setMoment(moment);
            body.setVel(cp.v(0, -100));
            body.setAngVel(1);

            var action = cc.Sequence.create(cc.DelayTime.create(6+Math.floor(Math.random()*3)), cc.CallFunc.create(function() {
                this.setMass(this.m / 1.5);
                this.setMoment(cp.momentForBox(mass, goron.width, goron.height));
            }, body));
            goron.runAction(action);

            return true;
        }, this.waterPreSolve, null, null);
    },

    waterPreSolve : function(arb, space, ptr) {

        var shapes = arb.getShapes();
        var water = shapes[0];
        var poly = shapes[1];

        var body = poly.getBody();

        // Get the top of the water sensor bounding box to use as the water level.
        var level = water.getBB().t;

        // Clip the polygon against the water level
        var count = poly.getNumVerts();

        var clipped = [];

        var j=count-1;
        for(var i=0; i<count; i++) {
            var a = body.local2World( poly.getVert(j));
            var b = body.local2World( poly.getVert(i));

            if(a.y < level){
                clipped.push( a.x );
                clipped.push( a.y );
            }

            var a_level = a.y - level;
            var b_level = b.y - level;

            if(a_level*b_level < 0.0){
                var t = Math.abs(a_level)/(Math.abs(a_level) + Math.abs(b_level));

                var v = cp.v.lerp(a, b, t);
                clipped.push(v.x);
                clipped.push(v.y);
            }
            j=i;
        }

        // Calculate buoyancy from the clipped polygon area
        var clippedArea = cp.areaForPoly(clipped);

        var displacedMass = clippedArea*FLUID_DENSITY;
        var centroid = cp.centroidForPoly(clipped);
        var r = cp.v.sub(centroid, body.getPos());

        var dt = space.getCurrentTimeStep();
        var g = space.gravity;

        // Apply the buoyancy force as an impulse.
        body.applyImpulse( cp.v.mult(g, -displacedMass*dt*2), r);

        // Apply linear damping for the fluid drag.
        var v_centroid = cp.v.add(body.getVel(), cp.v.mult(cp.v.perp(r), body.w));
        var k = 1; //k_scalar_body(body, r, cp.v.normalize_safe(v_centroid));
        var damping = clippedArea*FLUID_DRAG*FLUID_DENSITY;
        var v_coef = Math.exp(-damping*dt*k); // linear drag
    //	var v_coef = 1.0/(1.0 + damping*dt*cp.v.len(v_centroid)*k); // quadratic drag
        body.applyImpulse( cp.v.mult(cp.v.sub(cp.v.mult(v_centroid, v_coef), v_centroid), 1.0/k), r);

        // Apply angular damping for the fluid drag.
        var w_damping = cp.momentForPoly(FLUID_DRAG*FLUID_DENSITY*clippedArea, clipped, cp.v.neg(body.p));
        body.w *= Math.exp(-w_damping*dt* (1/body.i));

        return true;
    }
});

Pool.COL_TYPE = 50;


var Trigger = cc.Sprite.extend({

    w : 58,
    h : 32,
    sensorOffx : 22,
    sensorW : 14,
    onFr : null,
    offFr : null,

    phyObj : null,
    on : false,

    triggerFn : null,
    triggerTarget : null,

    ctor : function (objDesc) {
        var rect = cc.rect(0, 0, this.w, this.h);
        this.onFr = new cc.SpriteFrame(res.triggerOn, rect);
        this.offFr = new cc.SpriteFrame(res.triggerOff, rect);

        this._super(this.offFr);

        this.anchorX = 0;
        this.anchorY = 0;
        this.x = objDesc.x;
        this.y = objDesc.y;

        this.phyObj = new StaticSensor(objDesc.x+this.sensorOffx, objDesc.y, this.sensorW, this.h, this);
        this.phyObj.shape.setCollisionType(Trigger.COL_TYPE);
        var self = this;
        Physics.world.addCollisionHandler( Trigger.COL_TYPE, Hero.COL_TYPE, function (a) {
            self.turnOn();
        }, null, null, null);
    },

    setTriggerFunc : function (fn, target) {
        this.triggerFn = fn;
        this.triggerTarget = target;
    },

    turnOn : function () {
        if(this.on) return;

        if(this.triggerFn) {
            this.triggerFn.call(this.triggerTarget);
        }

        this.setSpriteFrame(this.onFr);
        this.on = true;
    },

    turnOff : function () {
        this.setSpriteFrame(this.offFr);
        this.on = false;
    },

    reinit : function () {
        this.turnOff();
    }
});

Trigger.COL_TYPE = 51;


var MovableWall = cc.DrawNode.extend({
    fillColor : cc.color(51, 34, 30, 255),
    lineWidth : 0,
    phyObj : null,
    friction : 0.3,
    objDesc : null,

    ctor : function(objDesc) {
        this._super();

        this.objDesc = objDesc;

        var x = objDesc.x, y = objDesc.y, w = objDesc.width, h = objDesc.height;
        this.x = x + w/2;
        this.y = y + h/2;
        this.width = w;
        this.height = h;

        this.drawRect(cc.p(-w/2, -h/2), cc.p(w/2, h/2), this.fillColor, this.lineWidth);
        this.phyObj = new PhysicsObject(10000, cc.size(w, h), 0, this, cc.p(x + w/2, y + h/2));
        this.phyObj.setFriction(this.friction);
        var body = this.phyObj.body;
        body.setMoment(Infinity);
        this.phyObj.shape.setCollisionType(MovableWall.COL_TYPE);
    },

    setPosition : function(x, y) {
        this._super(x, y);
        this.phyObj.body.setPos(cp.v(x, y));
    },

    reinit : function () {
        var x = this.objDesc.x + this.objDesc.width/2, y = this.objDesc.y + this.objDesc.height/2;
        this.x = x;
        this.y = y;
        this.phyObj.body.setPos(cp.v(x, y));
    }
});

MovableWall.COL_TYPE = 52;


var Blood = cc.Sprite.extend({
    texRect: cc.rect(0, 0, 95, 20),
    bleeding: false,
    currentH: 20,

    ctor : function (x, y, w) {
        this._super(res.blood, this.texRect);
        this.x = x;
        this.y = y+10;
        this.scale = w / 95;
        this.anchorY = 1;
        this.opacity = 0;

        this.runAction(cc.Spawn.create(
            cc.FadeIn.create(0.1),
            cc.CallFunc.create(function() {
                this.bleeding = true;
            }, this)
        ));
    },

    update : function () {
        if (this.bleeding) {
            if (this.currentH < 118) {
                this.currentH += 2;
                this.texRect.height = this.currentH;
                this.setTextureRect(this.texRect);
            }
        }
    }
});

var Stab = cc.Layer.extend({
    phyObj : null,
    objDesc : null,
    wall : null,
    stab : null,
    onTop : true,
    stabH : 36,
    texRect : cc.rect(0, 0, 128, 36),

    ctor : function(objDesc, onTop) {
        this._super();
        if (onTop === false) this.onTop = false;
        this.objDesc = objDesc;
        this.x = objDesc.x;
        this.y = objDesc.y;
        this.width = objDesc.width;
        this.height = objDesc.height;

        this.stab = new cc.Sprite(res.stab, this.texRect);
        this.stab.scaleX = objDesc.width / 128;
        this.stab.x = objDesc.width/2;
        if (this.onTop) {
            this.stab.y = objDesc.height + this.stabH/2;
        }
        else {
            this.stab.y = -this.stabH/2;
            this.stab.rotation = 180;
        }
        this.addChild(this.stab);

        this.wall = new PhysicWall(objDesc);
        this.wall.x = 0;
        this.wall.y = 0;
        this.addChild(this.wall);

        this.phyObj = new DynamicSensor(objDesc.x + objDesc.width/2, objDesc.y + this.stab.y - this.stabH/2, this.stab.width, 2, this);
        this.phyObj.shape.setCollisionType(Stab.COL_TYPE);
        var self = this;
        Physics.world.addCollisionHandler( Stab.COL_TYPE, Hero.COL_TYPE, function (a) {
            var hero = a.getB().obj.view;
            hero.parent.dead();
        }, null, null, null);
        Physics.world.addCollisionHandler( Stab.COL_TYPE, Goron.COL_TYPE, function (a) {
            var goron = a.getB().obj.view, p = a.getPoint(0);
            if(goron.blood) return false;
            goron.runAction(cc.Sequence.create(cc.DelayTime.create(1), cc.CallFunc.create(function() {
                var blood;
                if (Math.abs(goron.rotation) < cc.degreesToRadians(30)) {
                    if (p.y <= goron.y)
                        blood = new Blood(0, -goron.height/2, goron.width);
                    else if (p.y > goron.y) {
                        blood = new Blood(0, goron.height-20, goron.width);
                    }
                }
                goron.addChild(blood);
                goron.blood = blood;
                goron.update = function () {
                    goron.blood.update();
                };
                goron.reinit = function () {
                    this.x = this.ox;
                    this.y = this.oy;
                    this.phyObj.body.setPos(cp.v(this.x, this.y));
                    this.phyObj.body.a = 0;
                    goron.removeChild(goron.blood);
                    goron.blood = null;
                };
            })));
        }, null, null, null);
    },

    setPosition : function(x, y) {
        this._super(x, y);
        this.phyObj.body.setPos(cp.v(x + this.objDesc.width/2, y + this.stab.y - this.stabH/2));
    }
});

Stab.COL_TYPE = 53;

var DropStab = cc.Layer.extend({
    phyObj : null,
    objDesc : null,
    wall : null,
    stab : null,
    stabH : 36,
    texRect : cc.rect(0, 0, 128, 36),

    destY : 320+36,
    downAction : null,
    upAction : null,

    ctor : function (objDesc) {
        this._super(objDesc);

        this.objDesc = objDesc;
        this.x = objDesc.x;
        this.y = objDesc.y;
        this.width = objDesc.width;
        this.height = objDesc.height;

        this.stab = new cc.Sprite(res.stab, this.texRect);
        this.stab.scaleX = objDesc.width / 128;
        this.stab.x = objDesc.width/2;

        this.stab.y = -this.stabH/2;
        this.stab.rotation = 180;

        this.addChild(this.stab);

        this.wall = new PhysicWall(objDesc);
        this.wall.x = 0;
        this.wall.y = 0;
        this.addChild(this.wall);

        this.phyObj = new DynamicSensor(objDesc.x + objDesc.width/2, objDesc.y + this.stab.y - this.stabH/2, objDesc.width*3/4, 2, this);
        this.phyObj.shape.setCollisionType(DropStab.COL_TYPE);

        this.downAction = cc.Sequence.create(
            cc.DelayTime.create(Math.ceil(4*Math.random())/10),
            cc.EaseSineIn.create(cc.MoveTo.create(2, this.x, this.destY)),
            cc.CallFunc.create(this.goUp, this)
        );
        this.upAction = cc.Sequence.create(
            cc.EaseSineOut.create(cc.MoveTo.create(2, this.x, this.objDesc.y)),
            cc.CallFunc.create(this.goDown, this)
        );

        Physics.world.addCollisionHandler( DropStab.COL_TYPE, Hero.COL_TYPE, function (a) {
            var hero = a.getB().obj.view;
            hero.parent.dead();
        }, null, null, null);
        Physics.world.addCollisionHandler( DropStab.COL_TYPE, Wall.TOP_COL_TYPE, function (a) {
            var stab = a.getA().obj.view;
            stab.goUp();
        }, null, null, null);
        Physics.world.addCollisionHandler( DropStab.COL_TYPE, Goron.COL_TYPE, function (a) {
            var goron = a.getB().obj.view, stab = a.getA().obj.view;
            stab.goUp();
            if(goron.blood) return false;
            goron.runAction(cc.CallFunc.create(function() {
                var blood;
                blood = new Blood(0, goron.height/2-6, goron.width);
                goron.addChild(blood);
                goron.blood = blood;
                goron.update = function () {
                    goron.blood && goron.blood.update();
                };
                goron.reinit = function () {
                    this.x = this.ox;
                    this.y = this.oy;
                    this.phyObj.body.setPos(cp.v(this.x, this.y));
                    this.phyObj.body.a = 0;
                    goron.blood && goron.removeChild(goron.blood);
                    goron.blood = null;
                };
            }));
        }, null, null, null);

        this.goDown();
    },

    setPosition : function(x, y) {
        this._super(x, y);
        this.phyObj.body.setPos(cp.v(x + this.objDesc.width/2, y + this.stab.y - this.stabH/2));
    },

    goDown : function () {
        this.runAction(this.downAction);
    },

    goUp : function () {
        this.stopAction(this.downAction);
        this.runAction(this.upAction);
    }
});

DropStab.COL_TYPE = 54;


var Treasure = cc.Sprite.extend({

    w : 72,
    h : 72,
    sensorOff : 30,
    sensorSize : 12,

    phyObj : null,

    ctor : function (objDesc) {
        var rect = cc.rect(0, 0, this.w, this.h);
        var fr1 = new cc.SpriteFrame(res.treasure1, rect), fr2 = new cc.SpriteFrame(res.treasure2, rect);

        this._super(fr1);

        var action = cc.RepeatForever.create(cc.Animate.create(cc.Animation.create([fr1, fr2], 0.4)));
        this.runAction(action);

        this.x = objDesc.x;
        this.y = objDesc.y;
        this.width = this.w;
        this.height = this.h;

        this.phyObj = new StaticSensor(objDesc.x-this.w/2+this.sensorOff, objDesc.y-this.h/2+this.sensorOff/2, this.sensorSize, this.sensorSize, this);
        this.phyObj.shape.setCollisionType(Treasure.COL_TYPE);

        Physics.world.addCollisionHandler( Treasure.COL_TYPE, Hero.COL_TYPE, function (a) {
            var hero = a.getB().obj.view;
            hero.upgrade();
            var treasure = a.getA().obj.view;
            treasure.scheduleOnce(treasure.remove, 0.1);
        }, null, null, null);
    },

    remove : function () {
        this.phyObj.removeSelf();
        this.removeFromParent();
    }
});

Treasure.COL_TYPE = 55;


var LittleGoron = cc.Sprite.extend({
    phyObj : null,

    weight : 12,
    maxSpeed : 200,
    friction : 0.8,

    objDesc : null,
    jumpAction : null,

    follow : null,

    ctor : function(objDesc) {
        this._super(res.littleGoron);

        this.objDesc = objDesc;
        var x = objDesc.x, y = objDesc.y, w = 32, h = 32;
        this.x = x + w/2;
        this.y = y + h/2;
        this.width = w;
        this.height = h;

        this.phyObj = new DynamicSensor(x+w/2, y+h/2, 32, 32, this);
        this.phyObj.shape.setCollisionType(LittleGoron.COL_TYPE);

        this.jumpAction = cc.RepeatForever.create(cc.Sequence.create(
            cc.Spawn.create(
                cc.ScaleTo.create(0.1, 0.8, 1.2),
                cc.MoveTo.create(0.1, x, y + h)
            ),
            cc.Spawn.create(
                cc.ScaleTo.create(0.2, 1, 1),
                cc.MoveTo.create(0.2, x, y + 2*h)
            ),
            cc.Spawn.create(
                cc.MoveTo.create(0.5, x, y)
            ),
            cc.Spawn.create(
                cc.ScaleTo.create(0.1, 1.2, 0.8),
                cc.MoveTo.create(0.1, x, y-0.1*h)
            ),
            cc.Spawn.create(
                cc.ScaleTo.create(0.2, 1, 1),
                cc.MoveTo.create(0.2, x, y)
            )
        ));

        this.runAction(this.jumpAction);

        Physics.world.addCollisionHandler( LittleGoron.COL_TYPE, Hero.COL_TYPE, function (a) {
            var goron = a.getA().obj.view;
            if(goron.follow) return false;
            var hero = a.getB().obj.view.parent;
            goron.stopAction(goron.jumpAction);
            goron.setPosition(hero.x, hero.y + hero.height/2 + goron.height/2);
            goron.scale = 1;
            goron.follow = hero;

            cc.director.getRunningScene().level.lock = false;
        }, null, null, null);
    },

    setPosition : function(x, y) {
        this._super(x, y);
        this.phyObj.body.setPos(cp.v(x, y));
    },

    update : function () {
        if(this.follow) {
            this.setPosition(this.follow.x, this.follow.y + this.follow.height/2 + this.height/2);
        }
    }
});

LittleGoron.COL_TYPE = 56;