/*\
title: $:/plugins/can/omni/editor/operations/text/omnisplit.js
type: application/javascript
module-type: texteditoroperation

Text editor operation to split a tiddler into two or three (depending on whether there's something highlighted or not).

FramedEngine.prototype.createTextOperation() in framed.js gives us the following to use:

FramedEngine.prototype.createTextOperation = function() {
	var operation = {
		text: this.domNode.value,
		selStart: this.domNode.selectionStart,
		selEnd: this.domNode.selectionEnd,
		cutStart: null,
		cutEnd: null,
		replacement: null,
		newSelStart: null,
		newSelEnd: null
	};
	operation.selection = operation.text.substring(operation.selStart,operation.selEnd);
	return operation;
};

\*/
(function(){

    /*jslint node: true, browser: true */
    /*global $tw: false */
    "use strict";
    
    exports["omnisplit"] = function(event,operation) {
        var editTiddler = this.wiki.getTiddler(this.editTitle),
            editTiddlerTitle = this.editTitle,
            textEnd = operation.text.length,
            beforeSlice = operation.text.substring(0, operation.selStart).trimEnd(),
            afterSlice = operation.text.substring(operation.selEnd).trimEnd(),
            newTidTitleRoot = event.paramObject.title || this.getVariable("currentTiddler");
            // currentTitle = this.getVariable("currentTiddler");
        if(editTiddler && editTiddler.fields["draft.of"]) {
            editTiddlerTitle = editTiddler.fields["draft.of"];
        }
        if (operation.selection.length == 0 && operation.selStart > 0 && operation.selStart < textEnd) { // if selection length is zero and it's in the middle somewhere, we split the tiddler in two.
            operation.cutStart = 0;
            operation.cutEnd = textEnd;
            operation.replacement = beforeSlice; // first half goes in orig tiddler
            var secondhalfTitle = this.wiki.generateNewTitle(newTidTitleRoot + "-2");
            this.wiki.addTiddler(new $tw.Tiddler( // second half goes in new tiddler
                this.wiki.getCreationFields(),
                this.wiki.getModificationFields(),
                {
                    title: secondhalfTitle,
                    text: afterSlice,
                    tags: event.paramObject.tagnew === "yes" ?  [editTiddlerTitle] : []
                }
            ));
        } else if ( operation.selection.length > 0 && operation.selection.length < operation.text.length) { // if we have a selection and it's not the whole text
            operation.cutStart = 0;
            operation.cutEnd = textEnd;
            if (operation.selStart == 0) { // selection is at start YAY THIS WORKS
                operation.replacement = operation.selection.trimEnd(); // selection will go back into original tiddler
                var secondhalfTitle = this.wiki.generateNewTitle(newTidTitleRoot+"-2");
                this.wiki.addTiddler(new $tw.Tiddler( // second half goes in new tiddler
                    this.wiki.getCreationFields(),
                    this.wiki.getModificationFields(),
                    {
                        title: secondhalfTitle,
                        text: afterSlice,
                        tags: event.paramObject.tagnew === "yes" ?  [editTiddlerTitle] : []
                    }
                ));
            } else if ( operation.selStart > 0 && operation.selEnd < textEnd ) { //selection's in the middle
                operation.replacement = beforeSlice; //first slice goes back into orig tiddler
                var selectionTitle = this.wiki.generateNewTitle(newTidTitleRoot+"-2");
                this.wiki.addTiddler(new $tw.Tiddler( // selection goes into a new tiddler
                    this.wiki.getCreationFields(),
                    this.wiki.getModificationFields(),
                    {
                        title: selectionTitle,
                        text: operation.selection.trimEnd,
                        tags: event.paramObject.tagnew === "yes" ?  [editTiddlerTitle] : []
                    }
                ));
                var afterSliceTitle = this.wiki.generateNewTitle(newTidTitleRoot+"-3");
                this.wiki.addTiddler(new $tw.Tiddler( // final slice goes in new tiddler
                    this.wiki.getCreationFields(),
                    this.wiki.getModificationFields(),
                    {
                        title: afterSliceTitle,
                        text: afterSlice,
                        tags: event.paramObject.tagnew === "yes" ?  [editTiddlerTitle] : []
                    }
                ));
            } else if ( operation.selEnd == textEnd ) { //selection's at the end
                operation.replacement = beforeSlice; //first slice goes back into orig tiddler
                var secondhalfTitle = this.wiki.generateNewTitle(newTidTitleRoot+"-2");
                this.wiki.addTiddler(new $tw.Tiddler( // selection goes in new tiddler
                    this.wiki.getCreationFields(),
                    this.wiki.getModificationFields(),
                    {
                        title: secondhalfTitle,
                        text: operation.selection.trimEnd,
                        tags: event.paramObject.tagnew === "yes" ?  [editTiddlerTitle] : []
                    }
                ));
            }
        }
        // operation.newSelStart = 0; //operation.selStart;
        // operation.newSelEnd = 0; //operation.selStart + operation.replacement.length;
    };
    
    })();
    