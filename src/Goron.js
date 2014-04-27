/**
 * Created by Huabin LING on 4/26/14.
 */

var Goron = cc.DrawNode.extend({
    fillColor : cc.color(100, 100, 100, 255),
    lineWidth : 2,
    strokeColor : cc.color(255, 0, 0, 128),
    phyObj : null,

    w : 0,
    h : 0,
    baseWeight : 0.05,
    weight : 10,
    maxSpeed : 200,
    friction : 0.4,

    prevPhyX : 0,
    prevPhyY : 0,
    prevCCX : 0,
    prevCCY : 0,

    ctor : function(objDesc) {
        this._super();

        var x = objDesc.x, y = objDesc.y, w = objDesc.width, h = objDesc.height;
        this.x = x + w/2;
        this.y = y + h/2;
        this.w = this.width = w;
        this.h = this.height = h;
        this.weight = w * h * this.baseWeight;

        this.drawRect(cc.p(-w/2, -h/2), cc.p(w/2, h/2), this.fillColor, this.lineWidth, this.strokeColor);
        this.phyObj = new PhysicsObject(this.weight, cc.size(w, h), this.maxSpeed, this, cc.p(x + w/2, y + h/2));
        this.phyObj.setFriction(this.friction);
        this.phyObj.shape.setCollisionType(Goron.COL_TYPE);
    },

    syncTransform : function() {
        var currPhyP = this.phyObj.body.p;
        if(this.prevPhyX != currPhyP.x || this.prevPhyY != currPhyP.y) {
            this.x = currPhyP.x;
            this.y = currPhyP.y;
            this.rotation = -cc.radiansToDegress(this.phyObj.body.a);
            this.prevPhyX = currPhyP.x;
            this.prevPhyY = currPhyP.y;
        }
    }
});

Goron.COL_TYPE = 10;

var GoronLayer = cc.Layer.extend({
    onEnter : function () {
        this._super();
        this.scheduleUpdate();
    },

    update : function () {
        var children = this.children, child;
        for (var i = 0, l = children.length; i < l; i++) {
            child = children[i];
            child.syncTransform();
        }
    }
});