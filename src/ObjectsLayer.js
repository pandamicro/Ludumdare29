/**
 * Created by Huabin LING on 4/27/14.
 */

var ObjectsLayer = cc.Layer.extend({

    reinit : function () {
        // Reinit children
        for (var i = 0, children = this.children, l = children.length; i < l; i++) {
            var child = children[i];
            child.reinit && child.reinit();
        }
    },

    update : function () {
        var children = this.children, child;
        for (var i = 0, l = children.length; i < l; i++) {
            child = children[i];
            child.update && child.update();
        }
    }
});