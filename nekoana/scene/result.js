define( "nekoana/scene/result", ["nekoana/lib", "nekoana/config"], function( lib, config ) {

    //結果画面-----------

    var STORAGE_ITEM = "bestScore";

    //result
    function initializeScene( game ) {
        //Stageの取得
        var stage = game.getCurrentStage();
        //開始ボタンの取得
        var btnStart = stage.getChildByName( config.IMG.START_BTN );
        //ボタンイベントの設定
        btnStart.addEventListener( "touchTap", function gotoGame(event){
            btnStart.removeEventListener( "touchTap",  gotoGame, false);
            game.loadScene( config.SCENE.GAME );
        }, false);
        //スコアの表示
        showBestScore(game);
    }

    //過去のベストスコアの取得と保持
    function getBestScore(game) {
        var storage = window.localStorage;
        var bestScore = storage.getItem( STORAGE_ITEM );
        if ( game.score > bestScore || bestScore === null ) {
            storage.setItem( STORAGE_ITEM, game.score.toString() );
            bestScore = game.score;
        }
        return bestScore;
    }

    //スコアの表示
    function showBestScore(game) {
        var scoreBmd = game.loader.getBitmapData( config.IMG.SCORE );
        var score = lib.ScoreSpriteFactory.create( scoreBmd, 32, 32, 6 );
        game.getCurrentStage().addChild(score);
        score.setNumber(getBestScore(game));
        score.x = 240;
        score.y = 860;
    }

    return initializeScene;
});