define("nekoana/scene/game", ["nekoana/lib", "nekoana/config"], function (lib, config) {

    //ゲーム画面-----------

    //game
    function initializeScene(game) {
        
        //初期化する
        //現在の描画Stage
        var stage = game.getCurrentStage();
        //スコアボードの生成
        var score = lib.ScoreSpriteFactory.create(game.loader.getBitmapData(config.IMG.SCORE), 32, 32, 6);
        //時間を示すバーの生成
        var timeBar = stage.getChildByName(config.IMG.TIMEBAR);
        
        var pastTime = timeBar.width / ( config.TIME_LIMIT * 60 ) * 0.01;
        //ねこ保持用配列
        var cats = [];
        //ねこ生成用係数
        var crateRate = 0.1;
        //ねこ生成機
        var catFactory = new lib.CatSpriteFactory(game);
        
        //スコアとスコアボードの初期化
        game.score = 0;
        score.setNumber(game.score);
        score.x = 440;
        score.y = 195;
        stage.addChild(score);
        
        //イベントの設定
        stage.addEventListener(Event.ENTER_FRAME, enterFrameHandler, false);
        stage.addEventListener("touchBegin", touchBeginHandler, false);
        stage.addEventListener("touchEnd", touchEndHandler, false);
        
        //毎フレームネコの動きをコントロールする
        function enterFrameHandler() {

            //ネコの生成
            if (Math.random() < crateRate) {
                
                var hole = config.HOLE_POINTS[Math.floor(Math.random() * 8)];
                var cat = catFactory.create(hole);
                
                //飛ぶ高さ
                cat.pointY = Math.floor(Math.random() * 100) + 200;
                
                //該当する穴の背面に挿入
                stage.insertBeforeByName(cat, hole.ground);
                cats.push(cat);
                
                //出現エフェクト
                var ponFrames = [//スプライトの描画エリア
                    new Rectangle(0, 0, 174, 188),
                    new Rectangle(174, 0, 174, 188)
                ];
                var pon = lib.ImageSpriteFactory.create(game.loader.getBitmapData(config.IMG.PON), ponFrames);
                //ポンと出て終わったら削除
                pon.animate( 57 , function(){
                    stage.removeChild(pon);
                    pon.clear();
                    cat.pon = null;
                });
                pon.x = cat.x + 20;
                pon.y = cat.y - 120;
                
                cat.pon = pon;
                
                //表示する
                stage.addChild(pon);
            }
            var removes = [];
            //ネコの動き
            cats.forEach(function(cat, i){
                
                if (cat.status === config.CAT_STATS.JUMP) {//飛び上がるとき

                    cat.y += ( cat.pointY - cat.y ) * 0.15;
                    var distance = Math.abs(cat.pointY - cat.y);
                    if (distance < 10) {
                        cat.status = config.CAT_STATS.JUMP_DOWN;
                    }
                    
                    if (distance < cat.pointY * 0.3) {
                        stage.removeChild(cat.pon);
                    }
                    
                } else if (cat.status === config.CAT_STATS.JUMP_DOWN) {//落ちるとき
                    cat.y += ( cat.y - cat.pointY ) * 0.15;
                    if (cat.y > game.height) {
                        stage.removeChild(cat);
                        cats.splice(i, 1);
                    }
                } else if (cat.status === config.CAT_STATS.CAUGHT) {//捕まえられた後
                    cat.x += cat.speed.x;
                    cat.y += cat.speed.y;
                    if (cat.x < 0 || cat.x > game.width) {
                        stage.removeChild(cat);
                        removes.push(i);
                    }
                }
            });
            
            //削除したやつの後処理
            removes.reverse().forEach(function(index, i){
                cats[index].clear();
                cats.splice(index, 1);
            });
            
            //スコアの更新
            score.setNumber(game.score);
            
            //タイムリミットの確認
            if(isTimeup()) {
                showResult();
            }
        }

        //捕まったときの処理
        function onCatch(cat) {
            
            //鳴き声
            cat.voice.play();
            
            stage.removeChild(cat.pon);
            
            if (cat.status !== config.CAT_STATS.CAUGHT) {//捕まったあとのものは無視する

                if (cat.name === config.IMG.NEKOTA) {//ネコ田さんは捕まえてはいけない
                    catchMiss();
                }
                else {//ネコの場合
                    catchSuccess();
                }
                
                //飛んでいる画像にする
                cat.gotoFrameIndex(1);
                
                //ねこのスピードを計算
                var p = new Point(touchVector.x, touchVector.y);
                if (p.x === 0 && p.y === 0 || isNaN(p.x) || isNaN(p.y)) {
                    p.x = Math.random() - 0.5;
                    p.y = -Math.random();
                }

                if (p.y > 0) {
                    p.y = -Math.random();
                }

                p.normalize(20);

                cat.speed = {
                    x: p.x,
                    y: p.y
                };

                //飛ぶ方向に応じて向きの調整
                if (p.x < 0) {
                    if (cat.name !== config.IMG.NEKOTA) {
                        cat.scaleX = -1;
                    }
                    cat.x += cat.width;
                }
                
                //最前面に出す
                stage.setChildIndex(cat, stage.numChildren - 1);
                //状態変更
                cat.status = config.CAT_STATS.CAUGHT;
            }
        }

        //成功時は得点を加算
        function catchSuccess() {
            game.score += 300;
        }

        function catchMiss() {//ミスキャッチは時間が減少

            timeBar.scaleX -= pastTime * 40;
            timeBar.addEventListener(Event.ENTER_FRAME, missAction, false);

            var cnt = 0;

            function missAction() {//ステータスバーの色変化

                var colorTranceForm = new ColorTransform(0.2, 0.2, 0.2, 1, 200, 0, 0, 0);
                timeBar.transform.colorTransform = colorTranceForm;
                cnt++;
                //15フレーム待って元に戻す
                if (cnt > 15) {
                    timeBar.removeEventListener(Event.ENTER_FRAME, missAction, false);
                    colorTranceForm = new ColorTransform(1, 1, 1, 1, 0, 0, 0, 0);
                    timeBar.transform.colorTransform = colorTranceForm;
                }
            }
        }

        
        //タッチポイントから方向を算出する起点
        var touchVector = {
            x: 0,
            y: 0
        };

        var touchPrev = null;
        
        // touch events
        function touchBeginHandler (e) {
            touchPrev = {
                x: e.stageX,
                y: e.stageY
            };
            //ねこを捕まえたか
            catTouchTest(e.stageX, e.stageY);
            
            stage.addEventListener("touchMove", touchMoveHandler, false);
        }

        function touchMoveHandler (e) {
        
            //touchMoveはベクトル計算をする
            var touchNow = {
                x: e.stageX,
                y: e.stageY
            };
            if (touchPrev === null) return;
            touchVector = {
                x: touchNow.x - touchPrev.x,
                y: touchNow.y - touchPrev.y
            };
            touchPrev = touchNow;
            
            //ねこを捕まえたか
            catTouchTest(e.stageX, e.stageY);
        }
        
        //touchMoveの終了
        function touchEndHandler( event ) {
            touchVector = {
                x: 0,
                y: 0
            };
            stage.removeEventListener("touchMove", touchMoveHandler, false);
        }
        
        //ねこを捕まえたか
        function catTouchTest(sx, sy) {
            for (var i = 0; i < cats.length; i++) {
                var cat = cats[i];
                //タッチされた領域がネコに当たっているか
                if (cat.hitTestGlobal(sx, sy)) {
                    onCatch(cat);
                }
            }
        }
        
        //制限時間を超えているか
        function isTimeup() {
            timeBar.scaleX -= pastTime;
            return timeBar.scaleX < 0;
        }
        
        //結果を返す
        function showResult() {
            timeBar.scaleX = 0;
            stage.removeEventListener("touchMove",  touchMoveHandler, false);
            stage.removeEventListener("touchEnd",   touchEndHandler, false);
            stage.removeEventListener("touchBegin", touchBeginHandler, false);
            stage.removeEventListener(Event.ENTER_FRAME, enterFrameHandler, false);
            cats.forEach(function(cat){
                cat.clear();
            });
            game.overlayScene(config.SCENE.RESULT);
        }

    }

    return initializeScene;
});