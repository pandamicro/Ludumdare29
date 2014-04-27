/**
 * Created by Huabin LING on 4/26/14.
 */

var Wall = cc.DrawNode.extend({
    fillColor : cc.color(51, 34, 30, 255),
    lineWidth : 0,
    phyObj : null,
    o : cc.p(),
    friction : 0.3,

    ctor : function(objDesc) {
        this._super();

        var x = objDesc.x, y = objDesc.y;
        this.x = x;
        this.y = y;
        this.w = objDesc.width;
        this.h = objDesc.height;

        if (objDesc.polygonPoints) {
            var polygon = objDesc.polygonPoints, pt;
            for (var i = 0, l = polygon.length; i < l; i++) {
                pt = polygon[i];
                pt.x = x + parseInt(pt.x);
                pt.y = y - parseInt(pt.y);
            }
            this.drawPoly(polygon, this.fillColor, this.lineWidth);
        }
        else {
            this.drawRect(this.o, cc.p(this.w, this.h), this.fillColor, this.lineWidth);
            this.phyObj = new StaticObject(x, y, this.w, this.h, this);
            this.phyObj.setFriction(this.friction);
            this.phyObj.top.setCollisionType(Wall.TOP_COL_TYPE);
        }
    }
});

Wall.TOP_COL_TYPE = 100;