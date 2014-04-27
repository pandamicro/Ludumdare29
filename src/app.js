/**
 * Created by Huabin LING on 4/26/14.
 */

var MainScene = cc.Scene.extend({
    level : null,

    levels : [
        "res/level4.tmx",
        "res/level1.tmx",
        "res/level2.tmx",
        "res/level3.tmx"
    ],

    currentLevel : 0,

    ctor : function () {
        this._super();

        this.level = new Level(this, this.levels[this.currentLevel]);

        // Level scripts
        if (LevelScript[this.currentLevel]) {
            LevelScript[this.currentLevel](this.level);
        }
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
        // Initialization
        this.level = new Level(this, this.levels[this.currentLevel]);

        // Level scripts
        if (LevelScript[this.currentLevel]) {
            LevelScript[this.currentLevel](this.level);
        }
        this.addChild(this.level);
    }
});
