/**
 * Created by Huabin LING on 4/27/14.
 */

var LevelScript = [
    function (level) {
        var trigger = cachedObjs.level4_trigger, bridge = cachedObjs.level4_bridge;
        if(trigger) {
            trigger.setTriggerFunc(function() {
                bridge.runAction(cc.MoveTo.create(3, bridge.x + bridge.width, bridge.y));
            });
        }


    },
    null,
    null,
    null
]