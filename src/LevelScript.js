/**
 * Created by Huabin LING on 4/27/14.
 */

var LevelScript = [
    null,
    null,
    null,
    function (level) {
        var trigger = cachedObjs.level4_trigger, bridge = cachedObjs.level4_bridge, goron = cachedObjs.level4_goron;
        if(trigger) {
            bridge.ox = bridge.x;
            bridge.oy = bridge.y;
            bridge.action = cc.Sequence.create(cc.DelayTime.create(2), cc.MoveTo.create(3, bridge.x + bridge.width, bridge.y));
            trigger.setTriggerFunc(function() {
                bridge.runAction(bridge.action);
            });

            var label = new cc.LabelTTF("AAA", "Symbol", 36);
            label.color = cc.color(222, 0, 0, 255);
            label.y = 256;
            label.x = 1000;
            label.visible = false;
            label.action = cc.Spawn.create(
                cc.MoveTo.create(1, 1000, 50),
                cc.ScaleTo.create(1, 0.3, 0.3)
            );
            goron.parent.addChild(label);
            goron.ox = goron.x;
            goron.oy = goron.y;
            var cryCount = 0, dead = false;
            var update = function () {
                if(dead) {
                    if (cryCount === 0) {
                        label.visible = true;
                    }
                    if (cryCount < 64) {
                        cryCount ++;
                        if(cryCount % 6 == 0)
                            label.string += "H";
                    }
                    else {
                        label.runAction(label.action);
                        goron.update = null;
                    }

                    var rx = Math.random() * 10 - 5, ry = Math.random() * 10 - 5;

                    label.x = 1000 + rx;
                    label.y = 256 + ry;
                    return;
                }

                var y = this.y, h = this.height;
                if (y + h < 200) {
                    dead = true;
                }
            };
            goron.update = update;

            label.reinit = function () {
                dead = false;
                cryCount = 0;
                this.stopAction(this.action);
                this.y = 256;
                this.x = 1000;
                this.string = "AAA";
                this.visible = false;
                this.scale = 1;

                goron.update = update;
                bridge.stopAction(bridge.action);
            };
        }
    },
    null,
    null,
    null,
    function (level) {
        level.lock = true;
    }
];