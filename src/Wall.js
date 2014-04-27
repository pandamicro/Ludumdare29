/**
 * Created by Huabin LING on 4/26/14.
 */

var Wall = cc.Sprite.extend({
    texRect : cc.rect(0, 0, 512, 512),
    ctor : function (objDesc) {
        this._super(res.bigWall, this.texRect);

        this.anchorX = 0;
        this.anchorY = 0;
        this.x = objDesc.x;
        this.y = objDesc.y;
        this.width = objDesc.width;
        this.height = objDesc.height;

        this.scaleX = objDesc.width/512;
        this.scaleY = objDesc.height/512;
    }
});

var PhysicWall = Wall.extend({
    phyObj : null,
    o : cc.p(),
    friction : 0.3,

    ctor : function(objDesc) {
        this._super(objDesc);

        var x = objDesc.x, y = objDesc.y, w = objDesc.width, h = objDesc.height;

//        if (objDesc.polygonPoints) {
//            var polygon = objDesc.polygonPoints, pt;
//            for (var i = 0, l = polygon.length; i < l; i++) {
//                pt = polygon[i];
//                pt.x = x + parseInt(pt.x);
//                pt.y = y - parseInt(pt.y);
//            }
//            this.drawPoly(polygon, this.fillColor, this.lineWidth);
//        }
//        else {
        this.phyObj = new StaticObject(x, y, w, h, this);
        this.phyObj.setFriction(this.friction);
        this.phyObj.top.setCollisionType(PhysicWall.TOP_COL_TYPE);
//        }
    }
});

PhysicWall.TOP_COL_TYPE = 100;