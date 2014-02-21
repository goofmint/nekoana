define( "nekoana/scene/top", ["nekoana/lib", "nekoana/config"], function( lib, config ) {

    //ゲーム開始画面-----------

    //初期化
    function initializeScene( game ) {

        //スタートボタンの取得
        var btnStart = game.getCurrentStage().getChildByName( config.IMG.START_BTN );

        //ボタンイベントの設定
        btnStart.addEventListener( "touchTap", function gotoGame( event ) {
            btnStart.removeEventListener( "touchTap", gotoGame, false );
            game.loadScene( config.SCENE.GAME );
        }, false );

    }

    return initializeScene;
});