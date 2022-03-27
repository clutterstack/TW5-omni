/*\
title: $:/plugins/can/omni/macros/omni-stream-size.js
type: application/javascript
module-type: macro

Macro to return the dimensions of an omnibus tiddler's .can-omni-stream element .
Don't use this before the final version of the element's been rendered!

\*/
(function(){

    /*jslint node: true, browser: true */
    /*global $tw: false */
    "use strict";
    
    /*
    Information about this macro
    */
    
    exports.name = "omni-stream-size";
    
    exports.params = [
        {name: "baseomni"}
    ];

    /*
    Run the macro
    */
    exports.run = function(baseomni) {
        console.log("Someone called omni-stream-size")
        const streamdiv = findthediv(baseomni).querySelector(".can-omni-stream");
        console.log(`and it returned ${streamdiv.offsetWidth} ${streamdiv.offsetHeight}` )
        return `${streamdiv.offsetWidth} ${streamdiv.offsetHeight}`
    }

    let findthediv = title => {
        const selectorstring = "div[data-tiddler-title=\'"+title+"\']";
        // console.log("selectorstring: " +selectorstring);
        return document.querySelector(selectorstring);
    }

})();
    