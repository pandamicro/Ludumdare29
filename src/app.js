/**
 * Created by Huabin LING on 4/26/14.
 */

var MainScene = cc.Scene.extend({
    level : null,

    levels : [
        "res/level1.tmx",
        "res/level2.tmx"
    ],
    currentLevel : 0,

    ctor : function () {
        this._super();

        this.level = new Level(this, this.levels[this.currentLevel]);
    },

    onEnter : function () {
        this._super();

        this.addChild(this.level);
    },

    nextLevel : function () {
        if(this.currentLevel < this.levels.length-1)
            this.currentLevel ++;
        else this.currentLevel = 0;

        this.removeChild(this.level);
        this.level = new Level(this, this.levels[this.currentLevel]);
        this.addChild(this.level);
    }
});
