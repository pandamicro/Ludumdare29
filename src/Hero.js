/**
 * Created by Huabin LING on 4/26/14.
 */

var Hero = cc.Sprite.extend({
    fillColor : cc.color(255, 255, 255, 255),
    lineWidth : 2,
    strokeColor : cc.color(0, 0, 255, 128),
    phyObj : null,

    weight : 8,
    maxSpeed : 200,
    friction : 0.1,

    bottomSensor : null,
    leftSensor : null,
    rightSensor : null,

    ctor : function(x, y, w, h) {
        this._super(res.hero);

        this.width = w;
        this.height = h;

        this.initPhysics(x, y, w, h);
    },

    initPhysics : function (x, y, w, h) {
        var size = cc.size(w, h);
        var origin = cc.p(x, y);

        this.phyObj = new PhysicsObject(this.weight, size, this.maxSpeed, this, origin);
        this.phyObj.setFriction(this.friction);
        var body = this.phyObj.body;
        body.setMoment(Infinity);
        this.phyObj.shape.setCollisionType(Hero.COL_TYPE);

        // Bottom sensor
        this.bottomSensor = new cp.SegmentShape(body, cp.v(w/8-w/2, -h/2), cp.v(w*7/8-w/2, -h/2), 3);
        Physics.world.addShape(this.bottomSensor);
        this.bottomSensor.setSensor(true);
        this.bottomSensor.setCollisionType(Hero.BOTTOM_COL_TYPE);
        // Left sensor
        this.leftSensor = new cp.SegmentShape(body, cp.v(-w/2, h/8-h/2), cp.v(-w/2, h*7/8-h/2), 3);
        this.leftSensor.setSensor(true);
        this.leftSensor.setCollisionType(Hero.LEFT_COL_TYPE);
        Physics.world.addShape(this.leftSensor);
        // Bottom sensor
        this.rightSensor = new cp.SegmentShape(body, cp.v(w/2, h/8-h/2), cp.v(w/2, h*7/8-h/2), 3);
        this.rightSensor.setSensor(true);
        this.rightSensor.setCollisionType(Hero.RIGHT_COL_TYPE);
        Physics.world.addShape(this.rightSensor);
    },

    cleanup : function () {
        if (this.phyObj) {
            this.phyObj.removeSelf();
            Physics.world.removeShape(this.bottomSensor);
            Physics.world.removeShape(this.leftSensor);
            Physics.world.removeShape(this.rightSensor);
        }
    }
});

Hero.COL_TYPE = 1;
Hero.BOTTOM_COL_TYPE = 2;
Hero.LEFT_COL_TYPE = 3;
Hero.RIGHT_COL_TYPE = 4;

var HeroLayer = cc.Layer.extend({
    hero : null,
    phyObj : null,
    level : null,

    w : 32,
    h : 64,

    speedSeuil : 50,
    baseXImp : 300,
    jumpVel : 1800,

    goRight : false,
    goLeft : false,
    jumping : false,
    yStopCount : 0,

    ctor : function(level) {
        this._super();

        this.level = level;
        this.width = this.w;
        this.height = this.h;

        this.hero = new Hero(this.x, this.y, this.w, this.h);
        this.phyObj = this.hero.phyObj;
        this.addChild(this.hero);

        cc.eventManager.addListener(HeroInputManager, this);

        this.initPhysics();
    },

    init : function(x, y) {
        this.x = x;
        this.y = y;
        this.phyObj.body.p.x = x;
        this.phyObj.body.p.y = y;
    },

    initPhysics : function () {
        this.hero.initPhysics(this.x, this.y, this.w, this.h);
        this.phyObj = this.hero.phyObj;
    },

    update : function() {
        var pos = this.phyObj.getPosition();
        this.x = pos.x;
        this.y = pos.y;

        if (this.goRight) {
            this.phyObj.move(0, 70);
        }
        else if (this.goLeft) {
            this.phyObj.move(180, 70);
        }

        if (this.jumping && this.phyObj.body.vy == 0) {
            this.yStopCount ++;
            if (this.yStopCount > 2) {
                this.yStopCount = 0;
                this.jumping = false;
            }
        }
    },

    jump : function() {
        if (!this.jumping) {
            //this.phyObj.move(90, 10000);
            this.phyObj.body.vy = this.jumpVel;
            this.jumping = true;
        }
    },

    stopMove : function() {
        var velx = this.phyObj.body.vx;
        if (velx < -this.speedSeuil)
            velx = -this.speedSeuil;
        else if (velx > this.speedSeuil)
            velx = this.speedSeuil;
        else return;
        this.phyObj.body.vx = velx;
    }
});