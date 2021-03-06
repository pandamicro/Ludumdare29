/**
 * Created by Huabin LING on 4/26/14.
 */

var MainScene = cc.Scene.extend({
    level : null,

    levels : [
        "res/level1.tmx",
        "res/level2.tmx",
        "res/level3.tmx",
        "res/level4.tmx",
        "res/level5.tmx",
        "res/level6.tmx",
        "res/level7.tmx",
        "res/level8.tmx"
    ],

    currentLevel : -1,
    restart : null,
    finished : false,
    inTitle : true,
    title : null,

    ctor : function () {
        this._super();

        this.restart = new cc.Sprite(res.restart);
        this.restart.x = cc.winSize.width - 48;
        this.restart.y = cc.winSize.height - 48;
        this.restart.scale = 0.8;

        var rect = cc.rect(this.restart.x, this.restart.y, this.restart.width, this.restart.height);
        rect.x -= rect.width/2;
        rect.y -= rect.height/2;

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,

            onTouchBegan : function(touch, event) {
                var restart = event.getCurrentTarget();

                if (cc.rectContainsPoint(rect, touch.getLocation())) {
                    return true;
                }
            },

            onTouchEnded : function(touch, event) {
                var scene = event.getCurrentTarget().parent, restart = scene.restart;

                if (cc.rectContainsPoint(rect, touch.getLocation())) {
                    scene.restartLevel();
                    return true;
                }
            }
        }, this.restart);

        this.title = new cc.Layer();
        var sp = new cc.Sprite(res.title);
        sp.scale = cc.winSize.width / 1200;
        sp.anchorX = 0;
        sp.anchorY = 0;
        this.title.addChild(sp);

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ALL_AT_ONCE,

            onTouchesEnded : function(touches, event) {
                var touch = touches[0];
                var scene = event.getCurrentTarget();

                var rect = cc.rect(260, 75, 280, 70);
                if (cc.rectContainsPoint(rect, touch.getLocation())) {
                    scene.showHelp();
                    return true;
                }
            }
        }, this);
    },

    showHelp : function () {
        var help = new cc.Layer();
        var img = new cc.Sprite(res.help);
        img.scale = cc.winSize.width / 800;
        img.anchorX = 0;
        img.anchorY = 0;
        help.addChild(img);
        this.removeChild(this.title);
        this.addChild(help);
        cc.eventManager.removeListeners(this);

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ALL_AT_ONCE,

            onTouchesEnded : function(touches, event) {
                var scene = event.getCurrentTarget();
                cc.eventManager.removeListeners(scene);
                scene.inTitle = false;
                scene.addChild(scene.restart, 10);
                scene.nextLevel();
            }
        }, this);
    },

    onEnter : function () {
        this._super();

        if (this.inTitle) {
            this.addChild(this.title);
        }
        else {
            this.addChild(this.level, 1);
        }
    },

    restartLevel : function () {
        if (this.finished) {
            this.currentLevel = -1;
            this.finished = false;
            this.nextLevel();
        }
        else
            this.level.reinit();
    },

    nextLevel : function () {
        this.removeChild(this.level);

        if(this.currentLevel < this.levels.length-1) {
            this.currentLevel ++;

            // Initialization
            this.level = new Level(this, this.levels[this.currentLevel]);

            // Level scripts
            if (LevelScript[this.currentLevel]) {
                LevelScript[this.currentLevel](this.level);
            }
            this.addChild(this.level, 1);
        }
        else {
            this.level = new Ending();
            this.addChild(this.level, 1);
            this.finished = true;
        }


    }
});
