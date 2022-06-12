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
            highlight = operation.selection,
            afterSlice = operation.text.substring(operation.selEnd).trimStart(),
            dateStamp = new Date(),
            dateStamp2 = new Date(Date.now() +1),
            dateStamp3 = new Date(Date.now() +2),
            newTidTitleRoot = event.paramObject.title || $tw.utils.stringifyDate(dateStamp),  // default to a timestamp base title to avoid accreting too many suffixes
            splitStateTidTitle = "$:/state/can/omni/split",
            newTidsList = [];
            // currentTitle = this.getVariable("currentTiddler");
        if(editTiddler && editTiddler.fields["draft.of"]) {
            editTiddlerTitle = editTiddler.fields["draft.of"];
        }
        // Can't easily delete currentTiddler, since the editstatetid tiddler is going to write to it when we accept the changes.
        // OK, trying just deleting the state tiddler, not copying back to the orig.
        // So this deletes the current tiddler, the split button deletes the state tid (the one the edit widget is dealing with) when we're done,
        // and we don't have to delist the current from the omni-list, since eventually nonexistent tiddler titles get culled when a subtid gets
        // edited, and they don't matter much anyway
        // Would like to delete the orig tiddler, though, since we're replacing it, so next time we run this we don't try to reuse sliced tid titles
        // console.log("currenttiddler: " + this.getVariable("currentTiddler"));
        if (highlight.length == 0 && operation.selStart > 0 && operation.selStart < textEnd) { // if selection length is zero and it's in the middle somewhere, we split the tiddler in two.
            operation.cutStart = 0;
            operation.cutEnd = textEnd;
            var firsthalfTitle = this.wiki.generateNewTitle(newTidTitleRoot + "-1");
            newTidsList.push(firsthalfTitle);
            console.log("datestamp: " + dateStamp);
            this.wiki.addTiddler(new $tw.Tiddler( // first half goes in new tiddler
                this.wiki.getTiddler(this.getVariable("currentTiddler")),
                {
                    created: dateStamp,
                    modified: dateStamp,
                    title: firsthalfTitle,
                    text: beforeSlice,
                    tags: event.paramObject.tagnew === "yes" ?  [editTiddlerTitle] : []
                }
            ));
            this.wiki.deleteTiddler(this.getVariable("currentTiddler"));
            var secondhalfTitle = this.wiki.generateNewTitle(newTidTitleRoot + "-2");
            newTidsList.push(secondhalfTitle);
            this.wiki.addTiddler(new $tw.Tiddler( // second half goes in new tiddler
                {
                    created: dateStamp2,
                    modified: dateStamp2,
                    title: secondhalfTitle,
                    text: afterSlice,
                    tags: event.paramObject.tagnew === "yes" ?  [editTiddlerTitle] : []
                }
            ));
        } else if ( highlight.length > 0 && highlight.length < operation.text.length) { // if we have a selection and it's not the whole text
            operation.cutStart = 0;
            operation.cutEnd = textEnd;
            if (operation.selStart == 0) { // selection is at start YAY THIS WORKS
                var firsthalfTitle = this.wiki.generateNewTitle(newTidTitleRoot+"-1");
                newTidsList.push(firsthalfTitle);
                this.wiki.addTiddler(new $tw.Tiddler( // first half goes in 1st new tiddler
                    this.wiki.getTiddler(this.getVariable("currentTiddler")),
                    {
                        created: dateStamp,
                        modified: dateStamp,
                        title: firsthalfTitle,
                        text: highlight,
                        tags: event.paramObject.tagnew === "yes" ?  [editTiddlerTitle] : []
                    }
                ));
                this.wiki.deleteTiddler(this.getVariable("currentTiddler"));
                var secondhalfTitle = this.wiki.generateNewTitle(newTidTitleRoot+"-2");
                newTidsList.push(secondhalfTitle);
                this.wiki.addTiddler(new $tw.Tiddler( // second half goes in new tiddler
                    {
                        created: dateStamp2,
                        modified: dateStamp2,
                        title: secondhalfTitle,
                        text: afterSlice,
                        tags: event.paramObject.tagnew === "yes" ?  [editTiddlerTitle] : []
                    }
                ));
            } else if ( operation.selStart > 0 && operation.selEnd < textEnd ) { //selection's in the middle
                var beforeSliceTitle = this.wiki.generateNewTitle(newTidTitleRoot+"-1");
                newTidsList.push(beforeSliceTitle);
                this.wiki.addTiddler(new $tw.Tiddler( // first slice goes into a new tiddler
                    this.wiki.getTiddler(this.getVariable("currentTiddler")),
                    {
                        created: dateStamp,
                        modified: dateStamp,
                        title: beforeSliceTitle,
                        text: beforeSlice,
                        tags: event.paramObject.tagnew === "yes" ?  [editTiddlerTitle] : []
                    }
                ));            
                this.wiki.deleteTiddler(this.getVariable("currentTiddler"));
                var selectionTitle = this.wiki.generateNewTitle(newTidTitleRoot+"-2");
                newTidsList.push(selectionTitle);
                this.wiki.addTiddler(new $tw.Tiddler( // selection goes into a new tiddler
                    {
                        created: dateStamp2,
                        modified: dateStamp2,
                        title: selectionTitle,
                        text: highlight,
                        tags: event.paramObject.tagnew === "yes" ?  [editTiddlerTitle] : []
                    }
                ));
                var afterSliceTitle = this.wiki.generateNewTitle(newTidTitleRoot+"-3");
                newTidsList.push(afterSliceTitle);
                this.wiki.addTiddler(new $tw.Tiddler( // final slice goes in new tiddler
                    {
                        created: dateStamp3,
                        modified: dateStamp3,
                        title: afterSliceTitle,
                        text: afterSlice,
                        tags: event.paramObject.tagnew === "yes" ?  [editTiddlerTitle] : []
                    }
                ));
            } else if ( operation.selEnd == textEnd ) { //selection's at the end
                var firsthalfTitle = this.wiki.generateNewTitle(newTidTitleRoot+"-1");
                newTidsList.push(firsthalfTitle);
                this.wiki.addTiddler(new $tw.Tiddler( // before-selection stuff goes in new tiddler
                    this.wiki.getTiddler(this.getVariable("currentTiddler")),
                    {
                        created: dateStamp,
                        modified: dateStamp,
                        title: firsthalfTitle,
                        text: beforeSlice,
                        tags: event.paramObject.tagnew === "yes" ?  [editTiddlerTitle] : []
                    }
                ));
                this.wiki.deleteTiddler(this.getVariable("currentTiddler"));
                var secondhalfTitle = this.wiki.generateNewTitle(newTidTitleRoot+"-2");
                newTidsList.push(secondhalfTitle);
                this.wiki.addTiddler(new $tw.Tiddler( // selection goes in new tiddler
                    {
                        created: dateStamp2,
                        modified: dateStamp2,
                        title: secondhalfTitle,
                        text: highlight,
                        tags: event.paramObject.tagnew === "yes" ?  [editTiddlerTitle] : []
                    }
                ));
            }
        }
        $tw.rootWidget.setVariable("lalist", $tw.utils.stringifyList(newTidsList));
        this.wiki.setText(splitStateTidTitle, "text", "",  $tw.utils.stringifyList(newTidsList));
        // operation.newSelStart = 0; //operation.selStart;
        // operation.newSelEnd = 0; //operation.selStart + operation.replacement.length;
    };
    
    })();
    