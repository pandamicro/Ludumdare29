/**
 * Created by Huabin LING on 4/26/14.
 */

var Goron = cc.DrawNode.extend({
    fillColor : cc.color(80, 94, 94, 255),
    lineWidth : 2,
    strokeColor : cc.color(60, 72, 72, 255),
    phyObj : null,

    ox : 0,
    oy : 0,
    w : 0,
    h : 0,
    baseWeight : 0.05,
    weight : 10,
    maxSpeed : 200,
    friction : 0.35,

    prevPhyX : 0,
    prevPhyY : 0,
    prevCCX : 0,
    prevCCY : 0,

    ctor : function(objDesc) {
        this._super();

        var x = objDesc.x, y = objDesc.y, w = objDesc.width, h = objDesc.height;
        this.ox = this.x = x + w/2;
        this.oy = this.y = y + h/2;
        this.w = this.width = w;
        this.h = this.height = h;
        this.weight = w * h * this.baseWeight;

        this.drawRect(cc.p(-w/2, -h/2), cc.p(w/2, h/2), this.fillColor, this.lineWidth, this.strokeColor);
        this.phyObj = new PhysicsObject(this.weight, cc.size(w, h), this.maxSpeed, this, cc.p(x + w/2, y + h/2));
        this.phyObj.setFriction(this.friction);
        this.phyObj.shape.setCollisionType(Goron.COL_TYPE);
    },

    reinit : function () {
        this.x = this.ox;
        this.y = this.oy;
        this.phyObj.body.setPos(cp.v(this.x, this.y));
        this.phyObj.body.a = 0;
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

    reinit : function () {
        // Reinit children
        for (var i = 0, children = this.children, l = children.length; i < l; i++) {
            var child = children[i];
            child.reinit && child.reinit();
        }
    },

    update : function () {
        var children = this.children, child;
        for (var i = 0, l = children.length; i < l; i++) {
            child = children[i];
            child.syncTransform && child.syncTransform();
            child.update && child.update();
        }
    }
});