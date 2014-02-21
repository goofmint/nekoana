
var BASE_URL = ".";

( function( ) {
    "use strict";

    var loader = new Script( BASE_URL + "/libs/require.min.js" );
    
    loader.onload = function() {
        
        require.config( {
            baseUrl: BASE_URL,
            paths: {
                nekoana: "nekoana",
                libs: "libs"
            }
        } );
        
        require( ["nekoana/main"], function(main){
            main();
        } );
        
    };
	
} )();


