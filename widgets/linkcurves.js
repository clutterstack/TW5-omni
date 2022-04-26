/*\
title: $:/plugins/can/omni/widgets/linkcurves.js
type: application/javascript
module-type: widget

Draw svg curves between tiddlers in map mode

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



    LinkcurvesWidget.prototype.resizeRefresh = function(event) {
        // "debounce" window resize refreshing
        var timeoutID
        self = this;
        clearTimeout(timeoutID);
        timeoutID = setTimeout( function() {
            self.theSVG = self.doSVG();
            // self.refreshSelf();
            return true;
        }, 40);
    }

    LinkcurvesWidget.prototype.doSVG = function() {
        // Get the omni-stream element's dimensions
        const streamsize = [this.streamdiv.scrollWidth, this.streamdiv.scrollHeight];
        // console.log("streamsize: " + streamsize)
        var curvestrings = "";
        // for every tiddler in the baseomni's omni-list, add a bunch of curves to curvestrings
        const omnilist = this.wiki.getTiddlerList(this.baseomni,"omni-list");
        for (let title of omnilist) {
            if (this.getnode(title)) {
                console.log("doSVG: "+title);
            curvestrings = `${curvestrings}
            ${this.curveset(title)}`;
            }
        }
        this.containerDiv.className = "omni-absolute-svgdiv";
        this.containerDiv.style.position="absolute";
        this.containerDiv.style.top=0; //this.streamdiv.scrollTop;
        this.containerDiv.style.left=0; //this.streamdiv.scrollLeft;
        this.containerDiv.style.width = streamsize[0]+"px";
        this.containerDiv.style.height = streamsize[1]+"px";
        // console.log(curvestrings);
        // create the svg string to put in the container div
        this.containerDiv.innerHTML = this.composesvg(streamsize, curvestrings);
    }

    LinkcurvesWidget.prototype.composesvg = function(streamsize, svgpaths) {
        return `<svg width="${streamsize[0]}" height="${streamsize[1]}" viewBox="0 0 ${streamsize[0]} ${streamsize[1]}" xmlns="http://www.w3.org/2000/svg">
        ${svgpaths}
        </svg>
        `;
    }

    LinkcurvesWidget.prototype.curveset = function(omnititle) {
        const omnilist = this.wiki.getTiddlerList(omnititle,"omni-list");
        const startpoint = this.rightmidpoint(this.getnode(omnititle));
        // start with a straight line, whether the omni is unfolded or not
        if (omnilist) {
        var curves = `<line x1=${startpoint[0]} y1=${startpoint[1]} x2=${startpoint[0] + this.stublength} y2=${startpoint[1]} stroke=\"black\" fill=\"none\"/>`;} else {
        var curves = ""; }
        const curvestart = [startpoint[0] + this.stublength, startpoint[1]];
        // console.log("this.stublength: "+this.stublength);
        for (let title of omnilist) {
            if (this.getnode(title)) {
                const endpoint = this.leftmidpoint(this.getnode(title));
                curves = `${curves}
                ${this.svgpath(curvestart, endpoint)}
                ${this.curveset(title)}
                `;
            }
        }
        return curves;
    }

    LinkcurvesWidget.prototype.getnode = function(title) {
        return this.streamdiv.querySelector("div[data-omnitid=\'"+title+"\']");
    }

    LinkcurvesWidget.prototype.leftmidpoint = function(node) {
        return [node.offsetLeft, node.offsetTop + 25];
    }

    LinkcurvesWidget.prototype.rightmidpoint = function(node) {
        return [node.offsetLeft + node.offsetWidth, node.offsetTop + 25]; //Math.round(node.offsetHeight/2)
    }

    LinkcurvesWidget.prototype.svgpath = function(startpoint, endpoint) {
        //first handle position
        const handle1 = [startpoint[0] + this.bend, startpoint[1]];
        const handle2 = [endpoint[0] - this.bend, endpoint[1]];
        if (handle1 && handle2) {
            // console.log([].concat(startpoint, handle1, handle2, endpoint));
            return `<path d=\"M ${startpoint[0]} ${startpoint[1]} C ${handle1[0]} ${handle1[1]} ${handle2[0]} ${handle2[1]} ${endpoint[0]} ${endpoint[1]}\" stroke=\"black\" fill=\"none\"/>` 
        } else {
            return "svgpath: startpoint: " + startpoint + " endpoint: " + endpoint 
        }
    }
    
    /*
    Render this widget into the DOM
    */
    LinkcurvesWidget.prototype.render = function(parent,nextSibling) { 
        this.parentDomNode = parent;
        this.computeAttributes();
        this.execute();
        // Find the baseomni's omni-stream element
        const tiddlerdiv = document.querySelector("div[data-tiddler-title=\'"+this.baseomni+"\']");
        this.streamdiv = tiddlerdiv.querySelector(".can-omni-stream");
        // console.log("streamdiv: "+this.streamdiv)
        // create the container for the svg
        this.containerDiv = this.document.createElement("div");
        $tw.utils.addEventListeners(window,[
            {name: "resize", handlerObject: this, handlerMethod: "resizeRefresh"}
        ]);
        this.doSVG();
        // console.log("thesvg: " + thesvg);
        // put the svg into it
        // this.streamdiv.appendChild(this.containerDiv);
        parent.insertBefore(this.containerDiv,nextSibling);
        this.domNodes.push(this.containerDiv);
        // this.renderChildren(this.containerDiv,null);
    };

    /*
    Compute the internal state of the widget
    */
    LinkcurvesWidget.prototype.execute = function() {
    // Get the parameters from the attributes
	this.baseomni = this.getAttribute("baseomni", this.getVariable("currentTiddler"));
    this.bend = this.getAttribute("bend", 20);
    this.stublength = this.getAttribute("stublength", 10);
    };

    /*
    Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
    */
   // Refresh of svgs with window resize is handled with a listener set in this.render()
    LinkcurvesWidget.prototype.refresh = function(changedTiddlers) {
        if (changedTiddlers) {
            this.refreshSelf();
                return true;
        }
    };
    
    exports.linkcurves = LinkcurvesWidget;
    
    })();
    