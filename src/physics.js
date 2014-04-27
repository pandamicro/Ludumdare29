
var CPSTEP = 1/60;
var Physics = {
    world:null,
    scene:null,

    calculVector: function(a) {
        /*var s = a.a, d = a.b;
         var cs = cc.p((s.bb_b+s.bb_t)/2, (s.bb_l+s.bb_r)/2);
         var cd = cc.p((d.bb_b+d.bb_t)/2, (d.bb_l+d.bb_r)/2);
         */
        var n = a.getNormal(0);
        var v = cc.p(n.x, -n.y);
        return v;
    },
    calculAngle: function(a) {
        return cc.pToAngle( this.calculVector(a) );
    },

    init:function(scene){
        this.scene = scene;
        this.world = null;
        var space = this.world = new cp.Space();
        space.iterations = 60;
        space.sleepTimeThreshold = 0.5;
        //space.damping = 1;
        // Gravity:
        space.gravity = cp.v(0,-1200);//重力
        space.collisionSlop = 0.5;

        var emptyFunction = function(){return true};
    },
    update:function(){
        this.world.step(CPSTEP);
    }
};
var StaticObject = cc.Class.extend({
    view: null,
    top: null,
    bottom: null,
    left: null,
    right: null,
    width: 0,
    height: 0,

    ctor:function(x, y, width, height, view){
        this.width = width;
        this.height = height;
        this.top = new cp.SegmentShape(Physics.world.staticBody, cp.v(x, y+height), cp.v(x+width, y+height), 1);
        Physics.world.addShape(this.top);
        this.top.obj = this;
        this.left = new cp.SegmentShape(Physics.world.staticBody, cp.v(x, y), cp.v(x, y+height), 1);
        Physics.world.addShape(this.left);
        this.left.obj = this;
        this.right = new cp.SegmentShape(Physics.world.staticBody, cp.v(x+width, y), cp.v(x+width, y+height), 1);
        Physics.world.addShape(this.right);
        this.right.obj = this;
        this.view = view;
    },

    setFriction: function(u) {
        this.top.setFriction(u);
        //this.left.setFriction(u);
        //this.right.setFriction(u);
    },

    removeSelf: function () {
        Physics.world.removeStaticShape(this.top);
        Physics.world.removeStaticShape(this.left);
        Physics.world.removeStaticShape(this.right);
    }
});
var StaticSensor = cc.Class.extend({
    view: null,
    shape: null,

    ctor:function(x, y, width, height, view){
        this.shape = new cp.SegmentShape(Physics.world.staticBody, cp.v(x, y+height), cp.v(x+width, y+height), 5);
        this.shape.setSensor(true);
        Physics.world.addShape(this.shape);
        this.shape.obj = this;
        this.view = view;
    },

    removeSelf: function () {
        Physics.world.removeStaticShape(this.shape);
    }
});
var PhysicsObject = cc.Class.extend({
    body:null,
    shape:null,
    type:null,
    view:null,

    ctor:function(weight, size, maxSpeed, view, pos){
        this.body = new cp.Body(weight, cp.momentForBox(weight, size.width, size.height));//
        this.shape = new cp.BoxShape(this.body, size.width, size.height);
        Physics.world.addShape(this.shape);
        Physics.world.addBody(this.body);
        this.setMaxSpeed(maxSpeed);
        this.setView(view);
        if(pos)
        {
            this.setPosition(pos);
        }
        this.shape.obj = this;
    },
    setPosition:function(pos){
        this.body.setPos(pos);
    },
    //move towards a direction
    move:function(direction, force)
    {
        var v = cc.p(force,0);
        var impulse = cc.pRotateByAngle(v, cc.p(0,0), cc.degreesToRadians(direction));
        this.body.applyImpulse(impulse, cp.v(0, 0));
    },
    //move towards a point, regardless of where i am
    targetMove:function(point, force){
        var v = cc.p(force,0);
        var angle = cc.pToAngle(cc.pSub(point, this.body.p));
        var impulse = cc.pRotateByAngle(v, cc.p(0,0), angle);
        this.body.applyImpulse(impulse, cp.v(0,0));
    },
    setMaxSpeed:function(maxSpeed){
        this.body.v_limit = maxSpeed;
    },
    getPosition:function(){
        return this.body.p;
    },
    //so shape can find its parent object
    setView:function(v){
        this.view = v;
    },

    setFriction: function(u) {
        this.shape.setFriction(u);
    },

    removeSelf: function () {
        Physics.world.removeShape(this.shape);
        Physics.world.removeBody(this.body);
    }
});