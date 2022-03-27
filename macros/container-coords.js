/*\
title: $:/plugins/can/omni/macros/container-coords.js
type: application/javascript
module-type: macro

Macro to return the midpoint of the left and right edges of a tiddler's class="omni-item-container" div. These divs have a data attribute data-omnitid which is the tiddler's title.

\*/
(function(){

    /*jslint node: true, browser: true */
    /*global $tw: false */
    "use strict";
    
    /*
    Information about this macro
    */
    
    // Don't use this before the element's been rendered!

    exports.name = "container-coords";
    
    exports.params = [
        {name: "mode"},
        {name: "bend", default: 10},
        {name: "title"},
        {name: "parenttid"},
        {name: "childtid"},
        {name: "streamsize", default: "[1000, 2000]"}
    ];
    

/*
Mode can be "right", "left", or "curve". 

"right" and "left" return the right and left midpoints of the 
first element found with data-omnitid attribute "title". 

** I have not yet made it impossible to have two of these rendered at once (e.g. two omnis open that contain the same tiddler) -- could put the query selector on the omni tiddler instead of document **

If mode is "curve", parenttid and childtid parameters must have the titles of two tiddlers with visible elements having their titles in the data-omnitid attribute.

*/


    /*
    Run the macro
    */
    exports.run = function(mode, bend, title, parenttid, childtid, streamsize) {
        console.log("c-coords: streamsize " + streamsize);
        switch (mode) {
            case "right":
                // return right midpoint
                return rightmidpoint(title);
            case "left":
                // return left midpoint
                return leftmidpoint(title);
            case "curve":
                // return all the points needed to make a cubic
                // curve with the cubicsvg macro
                return composesvg(parenttid, childtid, bend, streamsize);
            default:
                return "Invalid mode specified"

        }
    }
    

    /*
    Helper functions
    */

    let findthediv = title => {
        const selectorstring = "div[data-omnitid=\'"+title+"\']";
        // console.log("selectorstring: " +selectorstring);
        return document.querySelector(selectorstring);
    }

    let rightmidpoint = title => {
        const thediv = findthediv(title);
        if(thediv) {
        return [thediv.offsetLeft + thediv.offsetWidth, thediv.offsetTop + Math.round(thediv.offsetHeight*0.5)];
        } else {return "Error: container-coords: couldn't find the element with data-omnitid= " + title}
    }

    let leftmidpoint = title => {
        const thediv = findthediv(title);
        if(thediv) {
            return [thediv.offsetLeft, thediv.offsetTop + Math.round(thediv.offsetHeight*0.5)];
        } else {return "Error: container-coords: couldn't find the element with data-omnitid= " + title}
    }

    let svgpath = (parenttid, childtid, bend) => {
        const startpoint = rightmidpoint(parenttid);
        const endpoint = leftmidpoint(childtid);
        console.log("start " + startpoint + "; end " + endpoint + "; bend: " + bend);
        const handle1 = [startpoint[0] + parseInt(bend), startpoint[1]];
        const handle2 = [endpoint[0] - bend, endpoint[1]];
        if (handle1 && handle2) {
            console.log([].concat(startpoint, handle1, handle2, endpoint));
            return `<path d=\"M ${startpoint[0]} ${startpoint[1]} C ${handle1[0]} ${handle1[1]} ${handle2[0]} ${handle2[1]} ${endpoint[0]} ${endpoint[1]}\" stroke=\"black\" \/>` 
        } else {
            return "container-coords: leftmidpoint: " + leftmidpoint + " rightmidpoint: " + rightmidpoint 
        }
    }

    let composesvg = (parenttid, childtid, bend, streamsize) => {
        console.log(`composesvg: params are ${parenttid} ${childtid} ${bend} ${streamsize}`)
        const pathdef = svgpath(parenttid, childtid, bend);
        const size = streamsize;
        const svgdef = `
        <svg width="${size[0]}" height="${size[1]}" viewBox="0 0 ${size[0]} ${size[1]}" xmlns="http://www.w3.org/2000/svg">
        ${pathdef}
        </svg>
        `;
        // console.log("svgdef: " + svgdef)
        return svgdef
    }

    let containersize = (tiddler) => {
        // Need to find the size of the enclosing element 
        // (class .can-omni-stream.map) to set the svg size to match.
        // Not efficient to do this every time this macro's called,
        // but can factor this out later
        console.log("tiddler: " + tiddler);
        var streamdiv = findthediv(tiddler).closest(".can-omni-stream");
        // console.log("anydiv.parentElement.parentElement.textContent: " + anydiv.parentElement.parentElement.textContent);
        console.log("tiddler: " + tiddler);
        console.log("parent element size: " + streamdiv.clientWidth + " " + streamdiv.clientHeight)
        console.log("parent element class: " + streamdiv.className)
        return [streamdiv.offsetWidth, streamdiv.offsetHeight];
    }

})();
    