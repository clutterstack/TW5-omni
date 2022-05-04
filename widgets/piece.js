/*\
title: $:/plugins/can/omni/widgets/piece.js
type: application/javascript
module-type: widget

Widget that can be moved around. Needs a positioned parent container, and omnibus title (or more accurately, a sidecar tiddler title root), and a tiddler title (or more accurately a key to use to find the piece's location in the sidecar tiddler).



\*/
(function(){

    /*jslint node: true, browser: true */
    /*global $tw: false */
    "use strict";
    
    var Widget = require("$:/core/modules/widgets/widget.js").widget;
    
    var pieceWidget = function(parseTreeNode,options) {
        this.initialise(parseTreeNode,options);
    };
    
    /*
    Inherit from the base widget class
    */
    pieceWidget.prototype = new Widget();
    
    /*
    Render this widget into the DOM
    */
    pieceWidget.prototype.render = function(parent,nextSibling) {
        var self = this,
            domNode;
        // Remember parent
        this.parentDomNode = parent;
        // Compute attributes and execute state
        this.computeAttributes();
        this.execute();
        // Create element and assign classes
        domNode = this.document.createElement("div");
        this.domNode = domNode;
        this.assignDomNodeClasses();

        // Add event handlers
        $tw.utils.addEventListeners(domNode,[
            {name: "touchstart", handlerObject: this, handlerMethod: "handleTouchStartEvent"},
            {name: "mousedown", handlerObject: this, handlerMethod: "handleMouseDownEvent"}
        ]);

        this.domNode.className = "omni-piece";
        this.domNode.style.position="absolute";
        this.domNode.style.width="400px";
        this.positionStyles(this.coords[0], this.coords[1]);
       
        // Insert element
        parent.insertBefore(domNode,nextSibling);

        this.renderChildren(domNode,null);
        this.domNodes.push(domNode);

    };
    
    /*
    Compute the internal state of the widget
    */
    pieceWidget.prototype.execute = function() {
        this.pieceTitle = this.getAttribute("title");
        this.omniTitle = this.getAttribute("omnititle");
        this.depth = this.getAttribute("depth");
        this.sidecar = this.omniTitle+"-sidecar";
        this.initcoords = this.getCoords();
        // console.log(`execute: initcoords = ${this.coords}`);
        this.coords = this.initcoords;

        // Make child widgets
        this.makeChildWidgets();
    };
    

    pieceWidget.prototype.getCoords = function() {
        const defcoords = this.createCoords(this.depth, 1);
        const titlestring = this.pieceTitle;

        //console.log("omniTitle, pieceTitle: " + this.omniTitle + ", "+ this.pieceTitle)
        //console.log("sidecar tiddler title to use: "+this.sidecar)

        const testdata = this.wiki.getTiddlerData(this.sidecar);
        //console.log(`typeof(textdata): ${typeof(testdata)}`)
        if (testdata == undefined) {
           // console.log("getTiddlerData didn't find valid data in the sidecar tiddler");
            this.wiki.setText(this.sidecar, "text", titlestring, defcoords);
        }
        //next see if we can pull a coords value for the current piece
        const test2data = this.wiki.getTiddlerData(this.sidecar);
        //console.log(`test2data: ${JSON.stringify(test2data)}`)
        const extracteditem = test2data[titlestring];
        //console.log(`extracteditem: ${JSON.stringify(extracteditem)}`)
        return (extracteditem != undefined ) ? extracteditem : defcoords;
    };

    pieceWidget.prototype.createCoords = function (depth, yfactor) {
        // console.log("createCoords: depth " + depth +", yfactor " + yfactor)
        return [100*depth, 100*yfactor];
    };

    pieceWidget.prototype.assignDomNodeClasses = function() {
        var classes = this.getAttribute("class","").split(" ");
        classes.push("tc-piece");
        this.domNode.className = classes.join(" ");
    };
    
    pieceWidget.prototype.positionStyles = function() {
        self = this;
        self.domNode.style.top=self.coords[1]+"px"; 
        self.domNode.style.left=self.coords[0]+"px"; 
    }

    /*
    Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
    */
    pieceWidget.prototype.refresh = function(changedTiddlers) {
        var changedAttributes = this.computeAttributes();
        if(changedAttributes) {
            this.refreshSelf();
            return true;
        } else if(changedAttributes["class"]) {
            this.assignDomNodeClasses();
        } 
        return this.refreshChildren(changedTiddlers);
    };
    
    pieceWidget.prototype.pieceMove = function(x,y) {
        console.log(`${x},${y}`);
        this.render
    };

    pieceWidget.prototype.writeCoords = function() {
        //need to add the data this.coords to the data tiddler this.sidecar.
//exports.setTiddlerData = function(title,data,fields,options)
//exports.setText = function(title,field,index,value,options)
        this.wiki.setText(this.sidecar, undefined, this.pieceTitle, this.coords);
    };

 
    pieceWidget.prototype.handleMouseDownEvent = function(event) {
        event.preventDefault();
        event.stopPropagation();
        this.startDrag = [event.offsetX,event.offsetY];
        // console.log(`start mouse drag: this.coords is ${this.coords} and the startDrag position is ${this.startDrag}`);
        this.brushDown = true;
        this.domNode.addEventListener("mousemove", this.handleMouseMoveEvent.bind(this));
        this.domNode.addEventListener("mouseup", this.handleMouseUpEvent.bind(this));
    };
    
    pieceWidget.prototype.handleMouseMoveEvent = function(event) {
        // console.log("mousemove triggered")
        if(this.brushDown) {
            // console.log("mousemove: brush is down")
            event.preventDefault();
            // event.stopPropagation();
            const offsetfromstart = [event.offsetX - this.startDrag[0], event.offsetY - this.startDrag[1] ]
            this.coords = [this.coords[0] + offsetfromstart[0],this.coords[1] + offsetfromstart[1]];
            console.log(`mouse move: ${this.coords}`)
            this.positionStyles(this.coords[0], this.coords[1]);
        }
    };
    
    pieceWidget.prototype.handleMouseUpEvent = function(event) {
        event.preventDefault();
        // event.stopPropagation();
        // console.log(this.coords)
        this.domNode.removeEventListener("mousemove", this.handleMouseMoveEvent.bind(this));
        if(this.brushDown) {
            this.brushDown = false;
            this.writeCoords();
            console.log(`mouse drop: ${this.coords}. this.brushDown= ${this.brushDown}`);
        }
        this.domNode.removeEventListener("mouseup", this.handleMouseUpEvent.bind(this));
    };
    

    pieceWidget.prototype.handleTouchStartEvent = function(event) {
        // Not written yet
        console.log("write handlers for touch!")
        this.brushDown = true;
        console.log(event.touches[0].offsetX,event.touches[0].offsetY);
        event.preventDefault();
        event.stopPropagation();
        return false;
    };
    
    pieceWidget.prototype.handleTouchMoveEvent = function(event) {
        // Not written yet
        console.log("write handlers for touch!")
        if(this.brushDown) {
            this.coords = [event.touches[0].offsetX,event.touches[0].offsetY];
            console.log(`touchmove: this.coords: ${this.coords}`)
            this.positionStyles(this.coords[0], this.coords[1]);
        }
        event.preventDefault();
        event.stopPropagation();
        return false;
    };
    
    pieceWidget.prototype.handleTouchEndEvent = function(event) {
        // Not written yet
        console.log("write handlers for touch!")
        if(this.brushDown) {
            this.brushDown = false;
        }
        event.preventDefault();
        event.stopPropagation();
        return false;
    };

    exports.piece = pieceWidget;
    
    })();