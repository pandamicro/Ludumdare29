/**
 * Created by Huabin LING on 4/26/14.
 */

var HeroInputManager = cc.EventListener.create({
    event: cc.EventListener.TOUCH_ALL_AT_ONCE,
    swallowTouches: true,
    cumulatedDeltaY: 0,
    cumulateSeuil: 50,
    onTouchesBegan: function (touches, event) {
        var touch = touches[0];
        var hero = event.getCurrentTarget();

        var x = touch.getLocationX(), lx = cc.winSize.width/3, rx = lx*2;
        if (x > rx) {
            hero.goRight = true;
        }
        else if (x < lx) {
            hero.goLeft = true;
        }
        this.cumulatedDeltaY = 0;
    },

    onTouchesMoved: function (touches, event) {
        var touch = touches[0];
        var hero = event.getCurrentTarget();

        var x = touch.getLocationX(), lx = cc.winSize.width/3, rx = lx*2;
        if (x > rx) {
            hero.goRight = true;
        }
        else if (x < lx) {
            hero.goLeft = true;
        }
        else {
            hero.goRight = false;
            hero.goLeft = false;
            hero.stopMove();
        }

        var deltaY = touch.getDelta().y;
        if (deltaY > 0 && this.cumulatedDeltaY >= 0) {
            this.cumulatedDeltaY += deltaY;
        }
        else this.cumulatedDeltaY = 0;
        if (this.cumulatedDeltaY > this.cumulateSeuil) {
            hero.jump();
        }
    },

    onTouchesEnded: function (touches, event) {
        var hero = event.getCurrentTarget();

        hero.goRight = false;
        hero.goLeft = false;
        hero.stopMove();
    }
});

var HeroKeyboardManager = cc.EventListener.create({
    event: cc.EventListener.KEYBOARD,

    onKeyPressed : function (keyCode, event) {
        var hero = event.getCurrentTarget();

        if (keyCode == 39) {
            hero.goRight = true;
        }
        else if (keyCode == 37) {
            hero.goLeft = true;
        }
        else if (keyCode == 32 || keyCode == 38) {
            hero.jump();
        }
    },
    onKeyReleased : function (keyCode, event) {
        var hero = event.getCurrentTarget();

        if (hero.goRight && keyCode == 39) {
            hero.goRight = false;
            hero.goLeft = false;
            hero.stopMove();
        }
        else if (hero.goLeft && keyCode == 37) {
            hero.goRight = false;
            hero.goLeft = false;
            hero.stopMove();
        }
    }
});