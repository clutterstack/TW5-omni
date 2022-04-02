/*\
title: $:/plugins/can/omni/widgets/linkcurves.js
type: application/javascript
module-type: widget

Get the size of an omni tiddler's 

\*/
(function(){

    /*jslint node: true, browser: true */
    /*global $tw: false */
    "use strict";
    
    var Widget = require("$:/core/modules/widgets/widget.js").widget;
    
    var LinkcurvesWidget = function(parseTreeNode,options) {
        this.initialise(parseTreeNode,options);
    };
    
    /*
    Inherit from the base widget class
    */
    LinkcurvesWidget.prototype = new Widget();

    /* 
    Helper functions
    */

    LinkcurvesWidget.prototype.getnode = function(title) {
        return this.streamdiv.querySelector("div[data-omnitid=\'"+title+"\']");
    }

    LinkcurvesWidget.prototype.leftmidpoint = function(node) {
        return [node.offsetLeft, node.offsetTop + Math.round(node.offsetHeight/2)];
    }

    LinkcurvesWidget.prototype.rightmidpoint = function(node) {
        return [node.offsetLeft + node.offsetWidth, node.offsetTop + Math.round(node.offsetHeight/2)];
    }

    LinkcurvesWidget.prototype.svgpath = function(startpoint, endpoint) {
        //first handle position
        const handle1 = [startpoint[0] + this.bend, startpoint[1]];
        const handle2 = [endpoint[0] - this.bend, endpoint[1]];
        if (handle1 && handle2) {
            console.log([].concat(startpoint, handle1, handle2, endpoint));
            return `<path d=\"M ${startpoint[0]} ${startpoint[1]} C ${handle1[0]} ${handle1[1]} ${handle2[0]} ${handle2[1]} ${endpoint[0]} ${endpoint[1]}\" stroke=\"black\" \/>` 
        } else {
            return "svgpath: startpoint: " + startpoint + " endpoint: " + endpoint 
        }
    }

    LinkcurvesWidget.prototype.composesvg = function(streamsize, svgpaths) {
        return `<svg width="${streamsize[0]}" height="${streamsize[1]}" viewBox="0 0 ${streamsize[0]} ${streamsize[1]}" xmlns="http://www.w3.org/2000/svg">
        ${svgpaths}
        </svg>
        `;
    }

    
    /*
    Render this widget into the DOM
    */
    LinkcurvesWidget.prototype.render = function(parent,nextSibling) {
        this.parentDomNode = parent;
        this.computeAttributes();
        this.execute();
        // Find the baseomni's omni-stream element
        this.streamdiv = document.querySelector("div[data-tiddler-title=\'"+this.baseomni+"\']");
        var curvestrings = "";
        // Get the omni-stream element's dimensions
        const streamsize = [this.streamdiv.offsetWidth, this.streamdiv.offsetHeight]
        console.log("streamsize: " + streamsize)
        // Have a title. Get the tiddler
        const omnititle = this.parenttitle;
        const omnitid = $tw.wiki.getTiddler(omnititle);
        const omnilist = this.wiki.getTiddlerList(omnititle,"omni-list");
        console.log("omnitid: " + omnitid + "; omnilist: " + omnilist);
        //get right midpoint of parent
        const startpoint = this.rightmidpoint(this.getnode(omnititle));
        for (let title of omnilist) {
            console.log("title: " + title)
            const endpoint = this.leftmidpoint(this.getnode(title));
            curvestrings = `${curvestrings}
            ${this.svgpath(startpoint, endpoint)}
            `;
        }
        const thesvg = this.composesvg(streamsize, curvestrings);
        console.log("thesvg: " + thesvg);
        // create the container for the svg
        this.containerDiv = this.document.createElement("div");
        this.containerDiv.className = "omni-absolute-svgdiv";
        this.containerDiv.style.position="absolute";
        this.containerDiv.style.positionTop="0";
        this.containerDiv.style.positionLeft="0";
        this.containerDiv.style.width=streamsize[0];
        this.containerDiv.style.height=streamsize[1];
        // put the svg into it
        this.containerDiv.innerHTML = thesvg;
        parent.insertBefore(this.containerDiv,nextSibling);
        this.renderChildren(this.containerDiv,null);
        this.domNodes.push(this.containerDiv);
    };


    /*
    Compute the internal state of the widget
    */
    LinkcurvesWidget.prototype.execute = function() {
    // Get the parameters from the attributes
	this.baseomni = this.getAttribute("baseomni");
    this.parenttitle = this.getAttribute("omni",this.getVariable("currentTiddler"));
    this.bend = this.getAttribute("bend", 20);
    console.log("the omni attribute is " + this.parenttitle);
    console.log(this.getVariable("currentTiddler"));
};
    
    /*
    Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
    */
    LinkcurvesWidget.prototype.refresh = function(changedTiddlers) {
    var changedAttributes = this.computeAttributes();
	if($tw.utils.count(changedAttributes) > 0) {
		this.refreshSelf();
		return true;
	}
	return this.refreshChildren(changedTiddlers);
    };
    

    exports.linkcurves = LinkcurvesWidget;
    
    })();
    