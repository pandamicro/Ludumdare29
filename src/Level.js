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
    lock : false,

    ctor : function(scene, tmxFile) {
        this._super();

        this.scene = scene;

        Physics.init(scene);

        var reader = new TMXReader();
        var info = reader.read(tmxFile);

        this.width = info.mapW;
        this.height = info.mapH;
        this.heroX = info.heroX;
        this.heroY = info.heroY;
        this.left = info.left === undefined ? 0 : info.left;
        this.right = info.right === undefined ? this.width : info.right;

        if(info.background) {
            var background = new cc.Layer();
            var img = res[info.background];
            if(img) {
                cc.textureCache.addImage(img);
                var texture = cc.textureCache.textureForKey(img);
                var bgImg = new cc.Sprite(texture, cc.rect(0, 0, texture.pixelsWidth, texture.pixelsHeight));
                //bgImg.anchorX = 0;
                //bgImg.anchorY = 0;
                background.addChild(bgImg);
                this.addChild(background, 0, cc.p(0.2, 0.2), cc.p(450, 350));
            }
        }

        this.heroLayer = new HeroLayer(this);
        this.heroLayer.init(this.heroX, this.heroY);

        this.tmxLayers = info.layers;

        var debugLayer = new cc.Layer();
        var debugNode = cc.PhysicsDebugNode.create( Physics.world );
        debugNode.setVisible( true );
        debugLayer.addChild(debugNode);

        for (var i = 0, l = info.layers.length; i < l; i++) {
            this.addChild(info.layers[i], i+2, cc.p(1,1), cc.p(0,0));
        }
        this.addChild(this.heroLayer, i+2, cc.p(1,1), this.heroLayer.getPosition());
        var pArr = this.getParallaxArray();
        this.heroPoint = pArr[pArr.length-1];
        //this.addChild(debugLayer, i+3, cc.p(1,1), cc.p(0,0));

        // Collision handlers
        var self = this;
        // Collision handler for hero and goron
        Physics.world.addCollisionHandler(Hero.RIGHT_COL_TYPE, Goron.COL_TYPE, null, function(a){
            a.getB().body.vx = 90;
            return true;
        }, null, null);
        Physics.world.addCollisionHandler(Hero.LEFT_COL_TYPE, Goron.COL_TYPE, null, function(a){
            a.getB().body.vx = -90;
            return true;
        }, null, null);
        Physics.world.addCollisionHandler(Hero.BOTTOM_COL_TYPE, Goron.COL_TYPE, function(a) {
            self.heroLayer.jumpEnd();
            return true;
        }, null, null, null);
        Physics.world.addCollisionHandler(Hero.COL_TYPE, PhysicWall.TOP_COL_TYPE, function(a) {
            self.heroLayer.jumpEnd();
            return true;
        }, null, null, null);
        Physics.world.addCollisionHandler(Hero.BOTTOM_COL_TYPE, MovableWall.COL_TYPE, function(a) {
            self.heroLayer.jumpEnd();
            return true;
        }, null, null, null);

        this.scheduleUpdate();
    },

    reinit : function () {
        this.heroLayer.init(this.heroX, this.heroY);
        for (var i = 0, children = this.children, l = children.length; i < l; i++) {
            var child = children[i];
            child.reinit && child.reinit();
        }
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
        for (var i = 0, children = this.children, l = children.length; i < l; i++) {
            var child = children[i];
            child.update && child.update();
        }

        var hx = this.heroLayer.x, hy = this.heroLayer.y, lw = this.width, lh = this.height;
        this.heroPoint.setOffset(cc.p(hx, hy));

        var dx = cc.winSize.width/4 - hx, dy = cc.winSize.height/2 - hy;

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
        if (!this.lock && hx > this.right) {
            this.scene.nextLevel();
        }
    },

    restart : function () {
        this.reinit();
    }
});

Level.sharedHeroLayer = null;
Level.sharedDebugLayer = null;