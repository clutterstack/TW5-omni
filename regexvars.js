/*\
title: $:/plugins/can/omni/macros/regexvars.js
type: application/javascript
module-type: macro
Macro to take wikified text and return a teaser made from the first chars characters of its first maxelements html elements. Deals with possible nested elements.
\*/

(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

/*
Macro to take wikified text and return a teaser made from the first chars characters of its first maxelements html elements. Deals with possible nested elements.
*/

exports.name = "getopenvars";

exports.params = [
	{name: "txt"}
];

const openCloseVars = /\<(?<tag>[^\/\>]*)( ?.*?)\>(.*?)\<\/\k<tag>\>/gms;


const openClosePattern = /\<(?<tag>[^\/\>]*)( ?.*?)\>(.*?)\<\/\k<tag>\>/gms;
const emptyTagPairPattern = /\<(?<tag>[^\/\> ]*) ?[^\/\>]*?\>\<\/\k<tag>\>/gm;
// const openClosePattern = /\<(?<tag>[^\/ ]*?) .*?\>(.*?)\<\/\k<tag>\>/gms;
const openClosePatternG = /(\<(?<tag>[^\/]*?).*?\>(.*?)\<\/\k<tag>\>)/gm;
const tagsAtEndsPattern = /^\<(?<tag>[^\/]*?).*?\>(.*?)\<\/\k<tag>\>$/m;
const betweenEndTagsPattern = /(?<=\<(?<tag>[^\/]*?).*?\>)(.*?)(?=\<\/\k<tag>\>)/gm; //only gets rid of one outer set of tags

/*
Run the macro
*/
exports.run = function(txt) {
    console.log("txt: ", txt);
    if (txt.trim().length == 0) { 
        return ""; 
    }
    const splitArr = splitText(txt);
    console.log("splitArr: ", splitArr );
    return splitArr;
};

function getFirstElements(txt) {
    //console.log("getFirstElements matches:", inString.match(openClosePattern));
    //console.log("want first ", maxelements, " matches.");
    var outArray = [];
    var match = inString.match(openClosePattern);
    if (match !== null) {
        for (let i = 0; i < maxelements; i++) {
            //console.log("now adding match at index ",i);
            if (match[i] !== null) {
                outArray.push(match[i]);
            }
        }
    }
    //console.log("getFirstElements: ", outArray.join(""));
    return outArray.join("");
};

function splitText(inStr) {
    const rawsplit = inStr.split(/(\<\$vars.*?\>)/);
    const result = rawsplit; //.filter(word => word.length > 0);
    return result;
};

function isTag(inStr) {
    //returns true or false
    const reg = /^\<.*?\>$/;
    return reg.test(inStr); //should test for svg and perhaps other things that have renderable content inside opening tag
};

function getLastIndex(inArray, maxchars) {
    var tot = 0;
    var index = 0;
    var lastIndex = 0;
    var outArray = []; //inArray; //WATCH OUT -- ASSIGN BY REFERENCE!!
    for (const element of inArray) {
        const check = isTag(element);
        //console.log("check ", element, " : ",check);
        if (check == false) {
            if (tot > maxchars) {
                //console.log("total maxchars ", tot, " has exceeded limit of ", maxchars, " at index ",index);
                outArray[index] = "";
            } else {
                if (element.trim().length == 0 ) { //only whitespace
                    outArray[index] = "";
                    lastIndex = index;
                } else {
                    outArray[index] = element;
                    //console.log("adding ", element.length, " chars to total (previously ", tot,") at index ", index);
                    lastIndex = index;
                    tot += element.length;
                }
            }
        } else if (element == "<br>") {
            if (tot > maxchars) {
            //console.log("found a <br> after the last needed text");
            outArray[index] = "";
            } else {
                outArray[index] = element;
            }
        }
        index += 1;
    }
    //console.log("tot: ", tot, "; maxchars: ", maxchars);
    return [tot, lastIndex, outArray];
};

function trimLast(inArray, index, diff) {
    var outArray = inArray; //This assignment by reference, deliberately. Pass in something that can be changed.
    var lastEl = outArray[index];
    //console.log("diff: ", diff);
    //console.log("last text element is ", lastEl);
    var lastElTrim = lastEl.substring(0,lastEl.length - diff ) + " (...)";
    //console.log("trimming element to length ", lastElTrim.length," from ", lastEl.length);
    //console.log("last text element is now ", lastElTrim);
    outArray[index] = lastElTrim;
    return outArray;
};

function deleteTrailingTags(inString) {
    // Delete empty tag pairs until none remain
    const reg = emptyTagPairPattern;
    var reduced = inString;
    if (reg.test(reduced) == true) {
        //console.log("test is true: reduced is ", reduced);
        reduced = reduced.replace(reg,"");
        reduced = deleteTrailingTags(reduced);
    } else if (reg.test(reduced) == false) {
        //console.log("test is false: reduced is ", reduced);
    }
    return reduced;
    };

})();