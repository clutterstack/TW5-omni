/*\
title: $:/plugins/can/omni/widgets/piece.js
type: application/javascript
module-type: widget

Widget that can be moved around

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
        console.log
        // Create element and assign classes
        domNode = this.document.createElement("div");
        this.domNode = domNode;
        this.assignDomNodeClasses();
        // Add event handlers
        $tw.utils.addEventListeners(domNode,[
            {name: "touchstart", handlerObject: this, handlerMethod: "handleTouchStartEvent"},
            {name: "touchmove", handlerObject: this, handlerMethod: "handleTouchMoveEvent"},
            {name: "touchend", handlerObject: this, handlerMethod: "handleTouchEndEvent"},
            {name: "mousedown", handlerObject: this, handlerMethod: "handleMouseDownEvent"},
            {name: "mousemove", handlerObject: this, handlerMethod: "handleMouseMoveEvent"},
            {name: "mouseup", handlerObject: this, handlerMethod: "handleMouseUpEvent"}
        ]);

        // Get coordinates


        this.domNode.className = "omni-piece";
        this.domNode.style.position="absolute";
        this.domNode.style.top=0; //this.streamdiv.scrollTop;
        this.domNode.style.left=0; //this.streamdiv.scrollLeft;
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
        this.coords = this.getCoords();
       
        // need to write the new posnListText to the sidecar tiddler:
        this.wiki.setText(this.sidecar, "text", undefined, this.coords);

        // Make child widgets
        this.makeChildWidgets();
    };
    



    pieceWidget.prototype.getCoords = function() {
        if (!this.wiki.tiddlerExists(this.sidecar)) {
            const fields = {
                title: this.omniTitle+"-sidecar",
                type: "application/json"
            }
            this.wiki.addTiddler(new $tw.Tiddler(fields));
        }
        //console.log(this.omniTitle + ", "+ this.pieceTitle)
        console.log("sidecar: "+this.sidecar)

        try {
            const posnList = JSON.parse(this.wiki.getTiddlerText(this.sidecar));
            console.log("there was a sidecar list")
            const checkforentry = posnList.find(i => i.title === this.pieceTitle);
        (checkforentry != undefined) ? this.coords=checkforentry.coords : this.coords = this.createCoords(this.depth,1);
        console.log("now coords are: " + JSON.stringify(this.coords))
        posnList.push({
            "title": this.pieceTitle,
            "coords": this.coords
          });
        const posnListText = JSON.stringify(posnList);
        // console.log("posnListText in try: " + posnListText);
        } 
        catch {
            console.log("that sidecar text wasn't a JSON string!")
            this.coords = this.createCoords(this.depth, 1);
            console.log("now coords are: " + JSON.stringify(this.coords))
            return `[
    {
        "title": "${this.pieceTitle}",
        "coords": ${this.coords}
    }
]`
            // console.log("posnListText in catch: " + posnListText);
        }  
    }

    pieceWidget.prototype.createCoords = function (depth, yfactor) {
        console.log("createCoords: depth " + depth +", yfactor " + yfactor)
        return [100*depth, 100*yfactor];
        ;
    }

    pieceWidget.prototype.assignDomNodeClasses = function() {
        var classes = this.getAttribute("class","").split(" ");
        classes.push("tc-piece");
        this.domNode.className = classes.join(" ");
    };
    
    /*
    Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
    */
    pieceWidget.prototype.refresh = function(changedTiddlers) {
        var changedAttributes = this.computeAttributes();
        if(changedAttributes.tag || changedAttributes.enable || changedAttributes.disabledClass || changedAttributes.actions || changedAttributes.effect) {
            this.refreshSelf();
            return true;
        } else if(changedAttributes["class"]) {
            this.assignDomNodeClasses();
        }
        return this.refreshChildren(changedTiddlers);
    };
    


    pieceWidget.prototype.handleTouchStartEvent = function(event) {
        this.brushDown = true;
        this.strokeStart(event.touches[0].clientX,event.touches[0].clientY);
        event.preventDefault();
        event.stopPropagation();
        return false;
    };
    
    pieceWidget.prototype.handleTouchMoveEvent = function(event) {
        if(this.brushDown) {
            this.strokeMove(event.touches[0].clientX,event.touches[0].clientY);
        }
        event.preventDefault();
        event.stopPropagation();
        return false;
    };
    
    pieceWidget.prototype.handleTouchEndEvent = function(event) {
        if(this.brushDown) {
            this.brushDown = false;
            this.strokeEnd();
        }
        event.preventDefault();
        event.stopPropagation();
        return false;
    };
    
    pieceWidget.prototype.handleMouseDownEvent = function(event) {
        this.strokeStart(event.clientX,event.clientY);
        this.brushDown = true;
        event.preventDefault();
        event.stopPropagation();
        return false;
    };
    
    pieceWidget.prototype.handleMouseMoveEvent = function(event) {
        if(this.brushDown) {
            this.strokeMove(event.clientX,event.clientY);
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
        return true;
    };
    
    pieceWidget.prototype.handleMouseUpEvent = function(event) {
        if(this.brushDown) {
            this.brushDown = false;
            this.strokeEnd();
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
        return true;
    };
    

    exports.piece = pieceWidget;
    
    })();