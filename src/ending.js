/**
 * Created by Huabin LING on 4/28/14.
 */

var Ending = cc.Layer.extend({

    info : [
        "Ludum Dare 29",
        "I'm guilty...",
        "Game Design  : Huabin LING",
        "Story             : Huabin LING",
        "Developer      : Huabin LING",
        "Art works      : Huabin LING",
        "",
        "Github            : @pandamicro",
        "Powered by Cocos2d-JS"
    ],

    ctor : function () {
        this._super();

        var bgImg = new cc.Sprite(res.background2);
        bgImg.attr({
            x : cc.winSize.width/2,
            y : cc.winSize.height/2,
            scale : cc.winSize.width/1200
        });
        this.addChild(bgImg);

        var x = 180, y = 200, w, h = 64;
        var heroLayer = new HeroLayer(this);
        heroLayer.init(x, y);
        this.addChild(heroLayer);
        heroLayer.phyObj.removeSelf();

        var jumpAction = cc.RepeatForever.create(cc.Sequence.create(
            cc.Spawn.create(
                cc.ScaleTo.create(0.1, 0.8, 1.2),
                cc.MoveTo.create(0.1, 0, h)
            ),
            cc.Spawn.create(
                cc.ScaleTo.create(0.2, 1, 1),
                cc.MoveTo.create(0.2, 0, 2*h)
            ),
            cc.Spawn.create(
                cc.MoveTo.create(0.5, 0, 0)
            ),
            cc.Spawn.create(
                cc.ScaleTo.create(0.1, 1.2, 0.8),
                cc.MoveTo.create(0.1, 0, -0.1*h)
            ),
            cc.Spawn.create(
                cc.ScaleTo.create(0.2, 1, 1),
                cc.MoveTo.create(0.2, 0, 0)
            )
        ));
        heroLayer.hero.runAction(jumpAction);

        x = 250, y = 200, w = 32, h = 32;
        var goron = new LittleGoron({
            x : x,
            y : y,
            width : w,
            height : h
        });
        this.addChild(goron);

        var label = new cc.LabelTTF("Thank you for playing", "Comic Sans MS", 20);
        label.x = 220;
        label.y = 140;
        this.addChild(label);

        var str, left = 500, top = 320, lineHeight = 28, line;
        for (var i = 0, l = this.info.length; i < l; i++) {
            str = this.info[i];
            if(str == "") continue;
            line = new cc.LabelTTF(str, "Comic Sans MS", 20);
            line.x = left;
            line.y = top - i * lineHeight;
            //line.color = cc.color(173, 184, 178, 255);
            line.anchorX = line.anchorY = 0;
            this.addChild(line);
        }
    }
});