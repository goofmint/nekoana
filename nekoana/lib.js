define( "nekoana/lib", ["nekoana/config", "libs/common"], function( config ) {

    //Builtinクラスは継承出来ないのでFactoryを使用

    var ImageSpriteFactory = {
        /**
         * BitmapDataと描画用矩形を渡して生成
         * @param bmd
         * @param frames
         * @returns {Sprite}
         */
        create: function( bmd, frames ) {
            var sprite = new Sprite();
            sprite.bmd = bmd;
            console.log('bmd', bmd);
            sprite.frames = frames || [];
            sprite.frameIndex = 0;
            Util.mixin( sprite, this.methods );
            sprite.gotoFrameIndex( 0 );
            return sprite;
        },
        //付加するメソッド
        methods: {
            gotoFrameIndex: function( frameIndex ) {
                this.frameIndex = frameIndex;
                if ( typeof this.frames[frameIndex] !== "undefined" ) {
                    if ( this.frames[frameIndex] instanceof Rectangle ) {
                        this.frames[frameIndex] = new Bitmap( this.bmd, false, false, this.frames[frameIndex] );
                    }
                    else if( !this.frames[frameIndex] instanceof Bitmap ) {
                        throw new Error( "invalid." );
                    }
                } else if ( frameIndex === 0 ) {
                    this.frames[frameIndex] = new Bitmap( this.bmd );
                } else {
                    throw new RangeError( "invalid range." );
                }
                this.removeChildAt( 0 );
                this.addChild( this.frames[frameIndex] );
            },
            //使わなくなった時にいらないものを捨てる処理
            clear: function() {
                if(typeof this.enterFrameHandler === "function") {
                    this.removeEventListener( Event.ENTER_FRAME, this.enterFrameHandler, false );
                }
                this.enterFrameHandler = null;
                this.frames.length = 0;
                this.bmd = null;
                this.pon = null;
                
                Util.clearAllChildren(this);
            },
            //コマアニメ(speedは1コマの描画フレーム数)
            animate: function( speed, callback ) {
                var cnt = 0;
                var nFrame   = this.frameIndex;
                var frameMax = this.frames.length - 1;
                var waitCnt = 61 - speed;
                var self = this;

                var enterFrameHandler = function() {
                    cnt++;
                    if ( cnt % waitCnt === 0 ) {
                        nFrame++;
                        if ( nFrame > frameMax ) {//保持しているコマ数完走
                            self.removeEventListener( Event.ENTER_FRAME, enterFrameHandler, false );
                            if(typeof callback === "function") {
                                callback();
                            }
                            self = null;
                        }
                        else {//コマを進める
                            self. gotoFrameIndex(nFrame);
                        }
                    }
                };

                if(typeof this.enterFrameHandler === "function")
                    this.removeEventListener( Event.ENTER_FRAME, this.enterFrameHandler , false );
                
                this.enterFrameHandler = enterFrameHandler;
                
                this.addEventListener( Event.ENTER_FRAME, enterFrameHandler, false );
            }
        }
    };

    //スコア表示生成
    //Sprite内に桁数分の画像スプライトを保持し、数値に合わせて制御する
    var ScoreSpriteFactory = {
        create: function( bmd, width, height, length ) {
            var frames = [],
                i;
            var container = new Sprite();

            for ( i = 0; i < 10; i++ ) {
                frames.push( new Rectangle( width * i, 0, width, height ) );
            }
            
            for ( i = 0; i < length; i++ ) {
                var sprite = ImageSpriteFactory.create( bmd, frames.concat() );
                sprite.x = width * i;
                sprite.name = "index_" + String( i );
                container.addChild( sprite );
            }

            container.length = length;

            Util.mixin( container, this.methods );

            return container;

        },
        methods: {
            //数字の描画(とりあえずコレを呼べば良い)
            setNumber: function( num ) {
                var self = this;
                Util.fillZero( num, this.length ).split("").forEach( function( n, index ) {
                    self.setNumberAt( n, index );
                } );
            },
            //特定の桁数を描画
            setNumberAt: function( num, index ) {
                num = String( num ).substr( 0, 1 );
                var numberSprite = this.getChildByName( "index_" + String( index ) );
                numberSprite.gotoFrameIndex( parseInt( num ) );
            },
            clear: function() {
                Util.clearAllChildren(this);
            }
        }
    };

    //ネコの生成
    var CatSpriteFactory = function() {
        this.initialize.apply( this, arguments );
    };

    CatSpriteFactory.prototype = {
        //ネコ素材
        imageNames: [
            config.IMG.CAT1,
            config.IMG.CAT2,
            config.IMG.CAT3,
            config.IMG.NEKOTA
        ],
        //音声素材
        voiceNames: [
            config.SE.CAT1,
            config.SE.CAT2,
            config.SE.CAT3,
            config.SE.NEKOTA
        ],
        //描画領域
        frames: [
            new Rectangle( 0, 0, 187, 270 ),
            new Rectangle( 187, 0, 187, 270 )
        ],
        initialize: function( game ) {
            var bmds = {};
            var voices = {};
            this.imageNames.forEach( function( name ) {
                bmds[name] = game.loader.getBitmapData( name );
            } );
            this.voiceNames.forEach( function( name ) {
                voices["se_" + name] = game.loader.get( "se_" + name );
            } );
            this.voices = voices;
            this.bmds = bmds;
        },
        //穴の位置に合わせてランダムにネコを生成する
        create: function( hole ) {
            var n;
            var name;
            if ( Math.random() < 0.1 ) {
                n = 11;
                name = config.IMG.NEKOTA;
            } else {
                n = Math.floor( Math.random() * 3 ) + 1;
                name = "cat" + n;
            }
            var cat = ImageSpriteFactory.create( this.bmds[name], this.frames.concat() );
            Util.mixin( cat, this.methods );
            cat.voice = this.voices["se_" + name].clone();
            cat.name = name;
            cat.status = config.CAT_STATS.JUMP;
            cat.x = hole.x;
            cat.y = hole.y;

            return cat;
        },
        methods: {
            //座標によるHitTest
            hitTestGlobal: function( pointX, pointY ) {

                var bx = this.x;
                var by = this.y;
                var bw = this.width;
                var bh = this.height;

                var b_x_max = bx + bw;
                var b_y_max = by + bh;

                return !( pointX < bx || b_x_max < pointX || pointY < by || b_y_max < pointY );

            },
            clear: function(){
                ImageSpriteFactory.methods.clear.call(this);
                this.voice = null;
                this.name = null;
                this.status = null;
            }
        }
    };

    var DisplayContainerMixin = {
        getChildIndexByName: function( name ) {
            return this.getChildIndex( this.getChildByName( name ) );
        },
        insertBeforeByName: function( child, beforeName ) {
            return this.addChildAt( child, this.getChildIndexByName( beforeName ) );
        }
    };

    var Util = {
        //ucFirst: function( str ) {
        //    str += '';
        //    var f = str.charAt( 0 ).toUpperCase();
        //    return f + str.substr( 1 );
        //},
        clearAllChildren: function(target) {
            if (typeof target == 'undefined') {
                return true;
            }
            var len = target.numChildren;
            var removed;
            for(var i = 0; i < len; i++) {
                removed = target.removeChildAt(0);
                if(typeof removed.clear === "function") removed.clear();
            }
        },
        //lcFirst: function( str ) {
        //    str += '';
        //    var f = str.charAt( 0 ).toLowerCase();
        //    return f + str.substr( 1 );
        //},
        fillZero: function( value, length ) {
            if ( String( value ).length >= length )
                return String( value );
            var numbers = [];
            numbers.length = ( length + 1 ) - value.toString().split( '' ).length;
            return numbers.join( '0' ) + value;
        },
        expressions: {},
        expression: function( args, body ) {
            var key = args + body;
            if ( typeof this.expressions[key] !== "function" ) {
                this.expressions[key] = new Function( args, "return " + body + ";" );
            }
            return this.expressions[key];
        },
        mixin: function( target, imports ) {
            for ( var method in imports ) {
                target[method] = imports[method];
            }
        }
    };

    //表示オブジェクトの配置用
    var ImageSpriteArranger = {
        parseConfigValue: function( value, sprite, property, stage ) {
            switch ( typeof value ) {
                case "number":
                    sprite[property] = value;
                    break;
                case "string":
                    sprite[property] = Util.expression( "self, stage", value )( sprite, stage );
                    break;
                case "function":
                    sprite[property] = value( sprite, property );
                    break;
            }
        },
        arrange: function( config, stage, loader ) {
            //Util.expressions = {};
            for ( var name in config ) {
                var bmd = loader.getBitmapData( name );
                var sprite = ImageSpriteFactory.create( bmd );
                var props = config[name];
                if (typeof stage == 'undefined') {
                    continue;
                }
                for ( var property in props ) {
                    this.parseConfigValue( props[property], sprite, property, stage );
                }
                sprite.name = name;
                stage.addChild( sprite );
            }
        }
    };
    
    /**
     * ゲームのシーン及びstage管理
     */
    var Game = function( ) {
        this.initialize.apply( this, arguments );
    };

    Game.PRELOADED = "preloaded";
    //Game.SCENE_UNLOAD = "unload";
    //Game.SCENE_LOADED = "loaded";
    
    //通知用の仕組みを継承する
    Game.prototype = new Observer();

    /**
     * 一回きりのイベントを設定
     * @param type
     * @param listener
     * @param useCapture
     */
    Game.prototype.addEventListenerOnce = function( type, listener, useCapture ) {
        var self = this;
        var handler = function( event ) {
            self.removeEventListener( type, handler, useCapture );
            listener.call( self, event );
            self = null;
        };
        this.addEventListener( type, handler, useCapture );
    };

    /**
     * 初期化
     * @param width
     * @param height
     */
    Game.prototype.initialize = function( width, height ) {
        this.score = 0;
        this.width = width;
        this.height = height;
        this.scenes = {};
        this.isOverlay = false;
    };

    /**
     * 素材の読み込みを行い完了したらイベントを通知する
     * @param config
     */
    Game.prototype.preload = function( config ) {
        var loader = new BulkLoader( config );
        var self = this;
        loader.onload = function( ) {
            self.dispatchEvent( new Event( Game.PRELOADED ) );
        };
        this.loader = loader;
    };
    
    /**
     * Gameの画面を管理下に追加する
     * @param name
     * @param scene
     */
    Game.prototype.addScene = function( name, scene ) {
        this.scenes[name] = scene;
    };
    
    /**
     * 画面の描画を保持したまま、別の画面を呼び出す
     * @param name
     */
    Game.prototype.overlayScene = function( name ) {
        this.isOverlay = true;
        this.loadScene( name );
    };
        
    Game.prototype.layer = null;
    
    /**
     * 画面を呼び出す
     * @param name
     */
    Game.prototype.loadScene = function( name ) {

        if ( typeof this.scenes[name] === "undefined" ) {
            throw new Error( "no scene:" + name );
        }
        //Layerが無ければ初期化
        if(!this.layer) {
            var stage = new Stage( this.width, this.height );
            
            this.layer = new Layer( stage );
            this.layer.scaleMode = "noBorder";
            window.addLayer( this.layer );
            this.stage = stage;
            Util.mixin( this.stage, DisplayContainerMixin );
        }

        //this.dispatchEvent( new Event( Game.SCENE_UNLOAD ) );
        
        if ( !this.isOverlay ) {
            Util.clearAllChildren(this.stage);
        }
        
        var arrangeConfig = config.sceneArrange[name];

        //設定値から表示オブジェクトを配置する
        if ( typeof arrangeConfig !== "undefined" ) {
            ImageSpriteArranger.arrange( arrangeConfig, this.stage, this.loader );
        }
        
        this.isOverlay = false;

        //シーンの呼び出し
        this.scenes[name]( this );

        //this.dispatchEvent( new Event( Game.SCENE_LOADED ) );

    };
    
    /**
     * 現在のStageを呼び出す
     */
    Game.prototype.getCurrentStage = function( ) {
        return this.stage;
    };

    return {
        ImageSpriteFactory: ImageSpriteFactory,
        Game: Game,
        ScoreSpriteFactory: ScoreSpriteFactory,
        CatSpriteFactory: CatSpriteFactory
    };
} );
