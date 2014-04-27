cc.game.onStart = function(){
    cc.view.setDesignResolutionSize(800, 440, cc.ResolutionPolicy.SHOW_ALL);
	cc.view.resizeWithBrowserSize(true);
    //load resources
    cc.LoaderScene.preload(g_resources, function () {
        var scene = new MainScene();
        scene.init();
        cc.director.runScene(scene);
    }, this);
};
cc.game.run();