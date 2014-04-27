/**
 * Created by Huabin LING on 4/27/14.
 */

var Level = cc.ParallaxNode.extend({
    tmxLayers: null,
    heroLayer: null,
    heroPoint: null,
    scene : null,

    heroX : 0,
    heroY : 0,
    left : 0,
    right : 0,

    end : false,

    ctor : function(scene, tmxFile) {
        this._super();

        this.scene = scene;

        Physics.init(scene);

        var reader = new TMXReader();
        var res = reader.read(tmxFile);

        this.width = res.mapW;
        this.height = res.mapH;
        this.heroX = res.heroX;
        this.heroY = res.heroY;
        this.left = res.left === undefined ? 0 : res.left;
        this.right = res.right === undefined ? this.width : res.right;

        this.heroLayer = new HeroLayer(this);

        var debugLayer = new cc.Layer();
        var debugNode = cc.PhysicsDebugNode.create( Physics.world );
        debugNode.setVisible( true );
        debugLayer.addChild(debugNode);

        for (var i = 0, l = res.layers.length; i < l; i++) {
            this.addChild(res.layers[i], i+2, cc.p(1,1), cc.p(0,0));
        }
        this.addChild(this.heroLayer, i+2, cc.p(1,1), this.heroLayer.getPosition());
        var pArr = this.getParallaxArray();
        this.heroPoint = pArr[pArr.length-1];
        //this.addChild(debugLayer, i+3, cc.p(1,1), cc.p(0,0));

        // Collision handlers
        var self = this;
        // Collision handler for hero and goron
        Physics.world.addCollisionHandler(Hero.RIGHT_COL_TYPE, Goron.COL_TYPE, null, function(a){
            a.getB().body.vx = 100;
            return true;
        }, null, null);
        Physics.world.addCollisionHandler(Hero.LEFT_COL_TYPE, Goron.COL_TYPE, null, function(a){
            a.getB().body.vx = -100;
            return true;
        }, null, null);
        Physics.world.addCollisionHandler(Hero.BOTTOM_COL_TYPE, Goron.COL_TYPE, function(a) {
            self.heroLayer.jumping = false;
            return true;
        }, null, null, null);

        this.init();

        this.scheduleUpdate();
    },

    init : function () {
        this.heroLayer.init(this.heroX, this.heroY);
    },

    getHeroLayer : function () {
        if (!Level.sharedHeroLayer)
            Level.sharedHeroLayer = new HeroLayer(this);
        if (Level.sharedHeroLayer.parent)
            Level.sharedHeroLayer.removeFromParent(false);
        return Level.sharedHeroLayer;
    },
    getDebugLayer : function () {
        if (!Level.sharedDebugLayer) {
            Level.sharedDebugLayer = new cc.Layer();
            var debugNode = cc.PhysicsDebugNode.create( Physics.world );
            debugNode.setVisible( true );
            Level.sharedDebugLayer.addChild(debugNode);
        }
        if (Level.sharedDebugLayer.parent)
            Level.sharedDebugLayer.removeFromParent(false);
        return Level.sharedDebugLayer;
    },

    update : function () {
        if (this.end) return;

        Physics.update();
        this.heroLayer.update();
        var hx = this.heroLayer.x, hy = this.heroLayer.y, lw = this.width, lh = this.height;
        this.heroPoint.setOffset(cc.p(hx, hy));

        //cc.log(hx + ", " + hy);
        var dx = cc.winSize.width/2 - hx, dy = cc.winSize.height/2 - hy;

        // Adjust position
        dx > this.left && (dx = this.left);
        dx < cc.winSize.width-this.right && (dx = cc.winSize.width-this.right);
        dy > 0 && (dy = 0);
        dy < cc.winSize.height-lh && (dy = cc.winSize.height-lh);

        this.x = dx;
        this.y = dy;

        // Dead check
        if (hy < 0) {
            this.restart();
        }

        // Win check
        if (hx > this.right) {
            this.scene.nextLevel();
        }
    },

    restart : function () {
        this.init();
    }
});

Level.sharedHeroLayer = null;
Level.sharedDebugLayer = null;