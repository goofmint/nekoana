define( "nekoana/main",
    [
        "nekoana/lib",
        "nekoana/config",
        "nekoana/scene/top",
        "nekoana/scene/game",
        "nekoana/scene/result"
    ],
    function( lib, config, sceneTop, sceneGame, sceneResult ) {
    
        //ゲームの初期化と開始画面の呼び出し

        function initialize() {
            var game = new lib.Game( 640, 1136 );
            game.addScene( config.SCENE.TOP, sceneTop );
            game.addScene( config.SCENE.GAME, sceneGame );
            game.addScene( config.SCENE.RESULT, sceneResult );
            game.addEventListener( lib.Game.PRELOADED, preloadedHandler );
            game.preload( config.materials );
        }

        function preloadedHandler( event ) {
            event.target.removeEventListener(lib.Game.PRELOADED, preloadedHandler );
            event.target.loadScene( config.SCENE.TOP );
        }

        return initialize;

    }
);