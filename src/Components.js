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