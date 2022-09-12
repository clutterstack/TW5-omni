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
        // Assign handlers to vars so I can remove them:
        this.handleMouseDown = this.handleMouseDownEvent.bind(this);
        this.handleMouseMove = this.handleMouseMoveEvent.bind(this);
        this.handleMouseUp = this.handleMouseUpEvent.bind(this);
        // Add event handlers
        $tw.utils.addEventListeners(domNode,[
            {name: "mousedown", handlerObject: this, handlerMethod: "handleMouseDown"}
        ]);
        this.domNode.className = this.streamClass;
        
        // Insert element
        parent.insertBefore(domNode,nextSibling);
        this.renderChildren(domNode,null);
        this.domNodes.push(domNode);
        // get tiddler titles for all omni-item-container nodes
        this.pieceTitles = [];
        this.pieceNodes = this.domNode.querySelectorAll(".omni-item-container");
        for (const pieceNode of this.pieceNodes) {
            this.pieceTitles.push(pieceNode.getAttribute("data-omnitid"));
        }
        //console.log("pieceTitles: " + this.pieceTitles);
        // Ensure sidecar tiddler has coords for all subtids
        this.initCoords();
        // Put nodes in the positions specified in the sidecar
        this.placePieces();
    };
    
    /*
    Compute the internal state of the widget
    */
    pieceWidget.prototype.execute = function() {
        this.streamClass = this.getAttribute("class");
        this.omniTitle = this.getAttribute("omnititle");
        this.isEditing = false;
        this.sidecar = this.omniTitle+"-sidecar";
        this.freshPosn = [10,10];
        // Make child widgets
        this.makeChildWidgets();

    };
    
    pieceWidget.prototype.initCoords = function() {
        // get all the divs with class omni-item-container
        //console.log("initCoords")
        // check for sidecar
        let sidecarData = this.wiki.getTiddlerData(this.sidecar);
        //console.log(`typeof(sidecarData): ${typeof(sidecarData)}`)
        // If there's sidecar data, try to get coords for each tiddler from it.
        // Fill in any missing ones and write back to the sidecar
        if (sidecarData != undefined) {
        // for each container, get its position from that data.
            for (const pieceTitle of this.pieceTitles) {
                //console.log("pieceTitle: " + pieceTitle);
                // see if we can pull a coords value for the current piece
                const extracteditem = sidecarData[pieceTitle];
                // console.log(`extracteditem: ${JSON.stringify(extracteditem)}`)
                if (extracteditem == undefined ) {
                    this.wiki.setText(this.sidecar, undefined, pieceTitle, this.freshPosn);
                    this.freshPosn = [this.freshPosn[0] + 20, this.freshPosn[1] + 20];
                }
            }
        } else {
            //get all the positions from the screen and write them to the sidecar
            for (const pieceNode of this.pieceNodes) {
                pieceNode.classList.remove("omni-absolute");
                pieceNode.classList.add("omni-relative");
                const pieceTitle = pieceNode.getAttribute("data-omnitid");
                const currentPosn = [pieceNode.offsetLeft, pieceNode.offsetTop];
                this.wiki.setText(this.sidecar, undefined, pieceTitle, currentPosn);
            }
        }
        // Now the sidecar should have entries for everything.
    }

    pieceWidget.prototype.placePieces = function () {
       // console.log("placePieces invoked")
        this.positions = this.wiki.getTiddlerData(this.sidecar);
        for (const pieceNode of this.pieceNodes) {
            const pieceTitle = pieceNode.getAttribute("data-omnitid");
            pieceNode.classList.remove("omni-relative");
            pieceNode.classList.add("omni-absolute");
            console.log(pieceTitle)
            //console.log(this.positions[pieceTitle][0],this.positions[pieceTitle][1])
            pieceNode.style.left=this.positions[pieceTitle][0]+"px";
            pieceNode.style.top=this.positions[pieceTitle][1]+"px";
            pieceNode.style.width="400px";
        }
    };

    pieceWidget.prototype.positionStyles = function() {
        self = this;
        self.pieceNode.style.top=self.coords[1]+"px"; 
        self.pieceNode.style.left=self.coords[0]+"px"; 
        //console.log(`css position styles: left ${self.pieceNode.style.left}, top ${self.pieceNode.style.top}`)
    }

    /*
    Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
    */
    pieceWidget.prototype.refresh = function(changedTiddlers) {
        // To log changes in attributes:
        // self=this;
        // $tw.utils.each(self.parseTreeNode.attributes,function(attribute,name) {
        //     var value = self.computeAttribute(attribute);
        //     console.log("attribute " + name + ": old" + " = " + value + "; new = " + self.attributes[name]);
        // });
         var changedAttributes = this.computeAttributes();
         console.log("in prototype.refresh")
        
         if(changedAttributes==true) {
            console.log("have changed attrs; going to refreshSelf");
            console.log(this.parseTreeNode.attributes);
             this.refreshSelf();
            return true;
         } 
         if(changedTiddlers) { // not sure if need this condition; was troubleshooting a "changedtiddlers is undefined" message in annot testing
            console.log("have changedTiddlers; going to refresh children");
            return this.refreshChildren(changedTiddlers);
        }
    };

    pieceWidget.prototype.handleMouseDownEvent = function(event) {
        console.log("mousedown event")
        //event.preventDefault();
       // event.stopPropagation();
        // need to get the data-omnitid value from the event target
        if (event.target.classList.contains("omni-pinhandle")) {
            this.pieceNode = event.target.closest(".omni-item-container");
            this.pieceTitle = this.pieceNode.getAttribute("data-omnitid");
            //console.log("data-omnitid: " + this.pieceTitle);
            //now the initial position of the target
            this.coords = [this.pieceNode.offsetLeft, this.pieceNode.offsetTop];
            //console.log("mousedown: offsetLeft = " + this.coords[0] + "offsetTop = " + this.coords[1])
            this.startDrag = [event.clientX,event.clientY];
            // console.log("mousedown, startDrag: " + this.startDrag)
            this.waitingforframe = null;
            // console.log("mousedown: this.coords = "+ this.coords)
            // console.log(`start mouse drag: this.coords is ${this.coords} and the startDrag position is ${this.startDrag}`);
            this.domNode.removeEventListener("mousedown", this.handleMouseDown);
            this.domNode.addEventListener("mousemove", this.handleMouseMove);
            this.domNode.addEventListener("mouseup", this.handleMouseUp);
            this.domNode.addEventListener("mouseleave", this.handleMouseUp);
        }
    };

    pieceWidget.prototype.handleMouseMoveEvent = function(event) {
        // event.preventDefault();
        // event.stopPropagation();
        // console.log("mousemove triggered")
        if(!this.waitingforframe) { // if we're not still in the middle of a draw
            this.waitingforframe = true;
            this.delta = [event.clientX - this.startDrag[0], event.clientY - this.startDrag[1] ]
            this.startDrag = [event.clientX, event.clientY];
            //console.log("mousemove: delta = " + this.delta);
            window.requestAnimationFrame(this.movePiece.bind(this));
        }
    };
    
    pieceWidget.prototype.movePiece = function() {
        this.coords = [this.coords[0] + this.delta[0],this.coords[1] + this.delta[1]];
        //console.log(`mouse move: coords = ${this.coords}`)
        this.positionStyles();
        this.waitingforframe = null;
    };

    pieceWidget.prototype.handleMouseUpEvent = function(event) {
        //event.preventDefault();
        //event.stopPropagation();
        //console.log("mouseup triggered on node "+ event.target.className)
        this.domNode.removeEventListener("mousemove", this.handleMouseMove);
        this.wiki.setText(this.sidecar, undefined, this.pieceTitle, JSON.stringify(this.coords));
             console.log(`mouse drop: ${this.coords}.`);
        this.domNode.removeEventListener("mouseup", this.handleMouseUp);
        this.domNode.removeEventListener("mouseleave", this.handleMouseUp);
        this.domNode.addEventListener("mousedown", this.handleMouseDown);
        };
    
    exports.piece = pieceWidget;
    
    })();