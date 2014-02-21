define( "nekoana/config", [], function() {
    
    //Base Url
    var Url = "./nekoana/";
    
    //Androidの制限があるので
    //音声ファイルは一時ファイルディレクトリを使う
	var SoundBaseUrl = "./nekoana/";
	
    //シーン名
    var SCENE = {
        TOP: "top",
        GAME: "game",
        RESULT: "result"
    };

    //画像リソースの定義
    var IMG = {
        GROUND: "ground",
        NORMAL_SKY: "normal_sky",
        TIMEBAR_BG01: "timebar_bg01",
        TIMEBAR_BG02: "timebar_bg02",
        TIMEBAR: "timebar",
        CAT1: "cat1",
        CAT2: "cat2",
        CAT3: "cat3",
        NEKOTA: "cat11",
        GROUND_01: "ground_01",
        GROUND_02: "ground_02",
        GROUND_03: "ground_03",
        GROUND_04: "ground_04",
        GROUND_CITY: "ground_city",
        TIMEUP_CAT: "timeup_cat",
        PON: "pon",
        TIMEUP: "timeup",
        SCORE: "score",
        SCORE_TITLE: "score_title",
        START_BTN: "start_btn",
        TOP_BG: "top_bg",
        BLACK: "black"
    };

    //音声リソースの定義
    var SE = {
        CAT1:"cat1",
        CAT2:"cat2",
        CAT3:"cat3",
        NEKOTA:"cat11"
    };

    //ネコの状態定義
    var CAT_STATS = {
        JUMP: "jump",
        JUMP_DOWN: "jump_down",
        CAUGHT: "caught"
    };
    
    //読み込む素材
    var materials = {}, key, name;
    for(key in IMG) {
        name = IMG[key];
        materials[name] = {type: "image",url: Url + "images/game_%s.png".replace("%s", name)};
    }
    for(key in SE) {
        name = SE[key];
        materials["se_" + name] = {type: "se",url: SoundBaseUrl + "sounds/%s.wav".replace("%s", name)};
    }
    
    //穴の位置
    var HolePoints = [
        {
            x: 40,
            y: 685,
            ground: "ground_02"
        },
        {
            x: 230,
            y: 685,
            ground: "ground_02"
        },
        {
            x: 420,
            y: 685,
            ground: "ground_02"
        },
        {
            x: 135,
            y: 765,
            ground: "ground_03"
        },
        {
            x: 325,
            y: 765,
            ground: "ground_03"
        },
        {
            x: 25,
            y: 850,
            ground: "ground_04"
        },
        {
            x: 230,
            y: 850,
            ground: "ground_04"
        },
        {
            x: 440,
            y: 850,
            ground: "ground_04"
        }
    ];

    //配置用定数
    var Arrange = {
        CENTER_X: "(stage.stageWidth - self.width) / 2",
        CENTER_Y: "(stage.stageHeight - self.height) / 2",
        STAGE_WIDTH: "stage.stageWidth",
        STAGE_HEIGHT: "stage.stageHeight"
    };

    var SceneArrange = {};

    //Topのオブジェクト配置
    SceneArrange[SCENE.TOP] = {
        top_bg: {},
        start_btn: {
            x: Arrange.CENTER_X,
            y: 700
        }
    };

    //Gameのオブジェクト配置
    SceneArrange[SCENE.GAME] = {
        normal_sky: {
            x: 0,
            y: 0
        },
        timebar_bg02: {
            x: Arrange.CENTER_X,
            y: 130
        },
        timebar: {
            x: Arrange.CENTER_X,
            y: 140
        },
        timebar_bg01: {
            x: Arrange.CENTER_X,
            y: 130
        },
        ground_city: {
            y: 495
        },
        ground_01: {
            y: 495
        },
        ground_02: {
            y: "stage.stageHeight - 424"
        },
        ground_03: {
            y: "stage.stageHeight - 350"
        },
        ground_04: {
            y: "stage.stageHeight - 262"
        },
        score_title: {
            x: 355,
            y: 200
        }
    };

    //Resultのオブジェクト配置
    SceneArrange[SCENE.RESULT] = {
        black: {
            width: Arrange.STAGE_WIDTH,
            height: Arrange.STAGE_HEIGHT,
            alpha: 0.5
        },
        timeup: {
            x: Arrange.CENTER_X,
            y: 240
        },
        timeup_cat: {
            x: Arrange.CENTER_X,
            y: 460
        },
        start_btn: {
            x: Arrange.CENTER_X,
            y: 920
        }
    };

    return {
        baseUrl: Url,
        materials: materials,
        sceneArrange: SceneArrange,
        TIME_LIMIT: 120,
        HOLE_POINTS: HolePoints,
        SCENE: SCENE,
        IMG: IMG,
        SE: SE,
        CAT_STATS: CAT_STATS
    };

} );