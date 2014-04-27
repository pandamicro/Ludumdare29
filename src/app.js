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

    currentLevel : 0,
    restart : null,

    ctor : function () {
        this._super();

        this.level = new Level(this, this.levels[this.currentLevel]);

        // Level scripts
        if (LevelScript[this.currentLevel]) {
            LevelScript[this.currentLevel](this.level);
        }

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
                var restart = event.getCurrentTarget().restart;

                if (cc.rectContainsPoint(rect, touch.getLocation())) {
                    return true;
                }
            },

            onTouchEnded : function(touch, event) {
                var scene = event.getCurrentTarget(), restart = scene.restart;

                if (cc.rectContainsPoint(rect, touch.getLocation())) {
                    scene.restartLevel();
                    return true;
                }
            }
        }, this);
    },

    onEnter : function () {
        this._super();

        this.addChild(this.level);
        this.addChild(this.restart);
    },

    restartLevel : function () {
        this.level.reinit();
    },

    nextLevel : function () {
        if(this.currentLevel < this.levels.length-1)
            this.currentLevel ++;
        else this.currentLevel = 0;

        this.removeChild(this.level);
        // Initialization
        this.level = new Level(this, this.levels[this.currentLevel]);

        // Level scripts
        if (LevelScript[this.currentLevel]) {
            LevelScript[this.currentLevel](this.level);
        }
        this.addChild(this.level);
    }
});
