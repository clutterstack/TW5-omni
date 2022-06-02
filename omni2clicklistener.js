/*\
title: $:/plugins/can/omni/omni2clicklistener.js
type: application/javascript
module-type: widget

Mashup between the core keyboard widget and https://danielorodriguez.com/TW5-2click2edit/:
Allows an event to trigger actions or messages, like the keyboard widget, but for the 
dblclick event only, and like 2click2edit it doesn't enclose child content in yet another element
but instead adds a listener to its parent element.

In fact, don't enclose anything in it; it won't get rendered. Just close it:
e.g. <$omnidblclick actions="<<omni-ec-startedit-actions>>"/>

I haven't actually tested messages, so it's possible I haven't got that working properly.

\*/

(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var ClickListener = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

/*
Inherit from the base widget class
*/
ClickListener.prototype = new Widget();

/*
Render this widget into the DOM
*/
ClickListener.prototype.render = function(parent,nextSibling) {
    this.parentDomNode = parent;
    this.computeAttributes();
	this.execute();
	var self = this;
    /*Danielo says: Since the event listener have been added to the parent, the "this" property is pointing to the
    wrong object, we should call our edit function with our widget object set as the this property.*/
    parent.addEventListener("dblclick",function(event){
        var handled = self.invokeActions(self,event);
			if(self.actions) {
				self.invokeActionString(self.actions,self,event);
			}
			self.dispatchMessage(event);
			if(handled || self.actions || self.message) {
				event.preventDefault();
				event.stopPropagation();
			}
			return true;
    });
};

ClickListener.prototype.dispatchMessage = function(event) {
	this.dispatchEvent({type: this.message, param: this.param, tiddlerTitle: this.getVariable("currentTiddler")});
};

/*
Compute the internal state of the widget
*/
ClickListener.prototype.execute = function() {
    var self = this;
	// Get attributes
	this.actions = this.getAttribute("actions","");
	this.message = this.getAttribute("message","");
	this.param = this.getAttribute("param","");
};

/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
ClickListener.prototype.refresh = function(changedTiddlers) {
    if (changedTiddlers) {
        this.refreshSelf();
            return true;
    }
    return false;
};

exports.omnidblclick = ClickListener;

})();