/**
 * Created by Huabin LING on 4/26/14.
 */

TMXReader = cc.Class.extend({
    layerClass : {
        "GoronLayer" : GoronLayer
    },

    nodeClass : {
        "GoronLayer" : Goron
    },

    read : function(tmxfile) {
        var map = cc.TMXTiledMap.create(tmxfile);
        var mapW = map.mapWidth * map.tileWidth, mapH = map.mapHeight * map.tileHeight;
        var heroX = parseInt(map.getProperty("heroX")) * map.tileWidth,
            heroY = mapH - parseInt(map.getProperty("heroY")) * map.tileHeight,
            left = parseInt(map.getProperty("left")) * map.tileWidth,
            right = parseInt(map.getProperty("right")) * map.tileWidth;

        var groups = map.getObjectGroups(), group, gname, layerClass, nodeClass, objs, obj, i, j, l, n, layers = [], layer, node;
        for (i = 0, l = groups.length; i < l; i++) {
            group = groups[i];
            gname = group.getGroupName();
            layerClass = group.propertyNamed("className");
            if(layerClass) {
                nodeClass = this.nodeClass[layerClass];
                layerClass = this.layerClass[layerClass];
            }
            else layerClass = cc.Layer;

            layer = new layerClass();
            layers.push(layer);

            objs = group.getObjects();
            for (j = 0, n = objs.length; j < n; j++) {
                obj = objs[j];

                if (nodeClass) {
                    node = new nodeClass(obj);
                }
                else {
                    switch(obj.type) {
                        case "":
                            node = new Wall(obj);
                            break;

                        case "Goron":
                            node = new Goron(obj);
                            break;
                    }
                }

                node && layer.addChild(node);
                node = null;
            }
        }

        return {
            "mapW" : mapW,
            "mapH" : mapH,
            "heroX" : isNaN(heroX) ? 400 : heroX,
            "heroY" : isNaN(heroY) ? 512 : heroY,
            "left" : isNaN(left) ? 0 : left,
            "right" : isNaN(right) ? mapW : right,
            "layers" : layers
        };
    }
});