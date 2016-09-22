// // CodeMirror, copyright (c) by Marijn Haverbeke and others
// // Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("codemirror/lib/codemirror"), require("codemirror/mode/sparql/sparql"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["codemirror/lib/codemirror", "codemirror/mode/sparql/sparql"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {

    CodeMirror.registerHelper("hint", "sparql", sparqlHint);

    var projectName;
    var serverhost;
    var nsPrefixMappings;

    function sparqlHint(cmEditor, options) {
        projectName = options.projectName;
        serverhost = options.serverhost;

        var getTokenFn = function (e, cur) { return e.getTokenAt(cur); }

        return scriptHint(cmEditor, getTokenFn, options);
    };

    function scriptHint(editor, getToken, options) {
        // Find the token at the cursor
        var cur = editor.getCursor();   //object containing line and character {"line": number, "ch": number}
        var token = getToken(editor, cur); 
        /* token:
        {
            "start": numeber, //start of the word
            "end": number, //end of the word
            "string": string, //word written at cursor or selected
            "type": null, //type of the "string" param (es variable, keyword, ...) defined by the mode
            "state": {"context": null, "indent": 0, "col": 0}
        } 
        */

        //if the user is writing a comment, return (so it doesn't suggest anything)
        if (token.type == "comment")
            return;
        
        return {
            list: startComplete(editor),
            from: CodeMirror.Pos(cur.line, token.start),
            to: CodeMirror.Pos(cur.line, token.end)
        };
    }


    function startComplete(cm) {
        if (cm.somethingSelected())
            return;

        var tkposs = getPossiblesAtCursor(cm); //possible tokens at cursor position

        var completions = getCompletions(tkposs.token, tkposs.start, tkposs.possibles);
        // console.log("completions " + JSON.stringify(completions));

        //no completion suggested
        if (!completions.length)
            return;

        // When there is only one completion, use it directly.
        if (completions.length == 1) {
            insertOrReplace(completions[0].text, tkposs, cm);
            return true;
        }

        return completions;

    }

    // Extract context info needed for autocompletion / keyword buttons based on cursor position
    function getPossiblesAtCursor(cm) {
        // We want a single cursor position.
        if (cm.somethingSelected()) {
            return;
        }
        // Find the token at the cursor
        var cur = cm.getCursor(false);
        var cur1 = {
            line: cur.line,
            ch: cur.ch
        };

        // Cursor position on the far left (ch=0) is problematic
        // - if we ask CodeMirror for token at this position, we don't get back the token at the beginning of the line
        // - hence use adjusted position cur1 to recover this token.
        if (cur1.ch == 0 && cm.lineInfo(cur1.line).text.length > 0) {
            cur1.ch = 1;
        }
        var token = cm.getTokenAt(cur1);
        console.log("token " + JSON.stringify(token));
        var charAfter;
        var possibles = null;
        var start = token.string.toLowerCase();
        var insertPos = null;
        var insertEnd = false;
        var insertStart = false;

        // if the token is whitespace, use empty string for matching and set insertPos,
        // so that selection will be inserted into space, rather than replacing it.
        if (token.type == "sp-ws") {
            console.log("case 1: token type " + token.type + " (whitespace)");
            start = "";
            // charAfter is char after cursor
            charAfter = cm.getRange(
                { line: cur.line, ch: cur.ch },
                { line: cur.line, ch: cur.ch + 1 }
            );
            insertPos = cur;
        } else {
            console.log("case 2: token type " + token.type + " (not whitespace)");
            // charAfter is char after end of token
            charAfter = cm.getRange(
                { line: cur.line, ch: token.end },
                { line: cur.line, ch: token.end + 1 }
            );
            if (token.type != "sp-invalid" && token.type != "sp-prefixed" 
                && (token.string != "<" || !memberChk("IRI_REF", token.state.possibleCurrent))) {
                // OK when "<" is start of URI
                if (token.end == cur.ch && token.end != 0) {
                    insertEnd = true;
                    start = "";
                    insertPos = cur;
                } else if (token.start == cur.ch) {
                    insertStart = true;
                    start = "";
                    insertPos = cur;
                }
            }
        }

        if (token.type === "sp-comment") {
            console.log("case 3: token type " + token.type + " (comment)");
            possibles = [];
        } else {
            console.log("case 4: token type " + token.type + " (not comment)");
            if (cur1.ch > 0 && !insertEnd) {
                possibles = token.state.possibleCurrent;
            } else {
                possibles = token.state.possibleNext;
            }
        }

        return {
            "token": token, // codemirror token object
            "possibles": possibles, // array of possibles terminals from grammar
            "insertPos": insertPos, // Position in line to insert text, or null if replacing existing text
            "insertStart": insertStart, // true if position of insert adjacent to start of a non-ws token
            "insertEnd": insertEnd, // true if ... ... end of a ...
            "charAfter": charAfter, // char found straight after cursor
            "cur": cur, // codemirror {line,ch} object giving pos of cursor
            "start": start // Start of token for autocompletion
        };
    }

    function memberChk(el, arr) {
		for ( var i = 0, e = arr.length; i < e; ++i) {
            if (arr[i] == el) {
                return (true);
            }
        }
		return false;
	}

    var keywords = /^(GROUP_CONCAT|DATATYPE|BASE|PREFIX|SELECT|CONSTRUCT|DESCRIBE|ASK|FROM|NAMED|ORDER|BY|LIMIT|ASC|DESC|OFFSET|DISTINCT|REDUCED|WHERE|GRAPH|OPTIONAL|UNION|FILTER|GROUP|HAVING|AS|VALUES|LOAD|CLEAR|DROP|CREATE|MOVE|COPY|SILENT|INSERT|DELETE|DATA|WITH|TO|USING|NAMED|MINUS|BIND|LANGMATCHES|LANG|BOUND|SAMETERM|ISIRI|ISURI|ISBLANK|ISLITERAL|REGEX|TRUE|FALSE|UNDEF|ADD|DEFAULT|ALL|SERVICE|INTO|IN|NOT|IRI|URI|BNODE|RAND|ABS|CEIL|FLOOR|ROUND|CONCAT|STRLEN|UCASE|LCASE|ENCODE_FOR_URI|CONTAINS|STRSTARTS|STRENDS|STRBEFORE|STRAFTER|YEAR|MONTH|DAY|HOURS|MINUTES|SECONDS|TIMEZONE|TZ|NOW|UUID|STRUUID|MD5|SHA1|SHA256|SHA384|SHA512|COALESCE|IF|STRLANG|STRDT|ISNUMERIC|SUBSTR|REPLACE|EXISTS|COUNT|SUM|MIN|MAX|AVG|SAMPLE|SEPARATOR|STR)$/i;
    
    var punct = /^(\*|\.|\{|\}|,|\(|\)|;|\[|\]|\|\||&&|=|!=|!|<=|>=|<|>|\+|-|\/|\^\^|\?|\||\^)$/;
    
    function getCompletions(token, start, possibles) {
        var found = [];

        var state = token.state;
        var stack = state.stack;
        var top = stack.length - 1;
        var topSymbol = stack[top];

        // Skip optional clutter
        while (/^(\*|\?).*/.test(topSymbol) && top > 0) {
            topSymbol = stack[--top];
        }

        var lastProperty = token.state.lastProperty;
        // Is a class expected in this position?
        // If the preceding property was rdf:type and an object is expected,
        // then a class is expected.
        var isClassPos = false;
        if (lastProperty.match(/^a|rdf:type|<http:\/\/www.w3.org\/1999\/02\/22-rdf-syntax-ns#type>$/)
            && ((start == "" && (topSymbol == "object" || topSymbol == "objectList" || topSymbol == "objectListPath")) 
                || (start != "" && topSymbol == "}"))) {
            isClassPos = true;
        }

        // test the case of the 1st non-space char
        var startIsLowerCase = /^ *[a-z]/.test(token.string);

        // Where case is flexible
        function maybeAdd(str) {
            var obj = str;

            if (typeof str == "string") {
                obj = {};
                obj.text = str;
                obj.displayText = str;
            }

            if (obj.text.toUpperCase().indexOf(start.toUpperCase()) == 0) {
                if (startIsLowerCase) {
                    obj.text = obj.text.toLowerCase();
                } else {
                    obj.text = obj.text.toUpperCase();
                }
                found.push(obj);
            }
        }

        // Where case is not flexible
        function maybeAddCS(str) {
            var obj = str;

            if (typeof str == "string") {
                obj = {};
                obj.text = str;
                obj.displayText = str;
            }

            if (obj.text.toUpperCase().indexOf(start.toUpperCase()) == 0) {
                found.push(obj);
            }
        }

        // Add items from the fetched sets of properties / classes
        // set is "properties" or "classes"
        // varName is "p" or "o"
        function addFromCollectedURIs(set, varName) {
            //			if (/:/.test(start)) {
            //				// Prefix has been entered - give items matching prefix
            //				var activeDataItem = editor.getSidebar().getActiveDataItem();
            //				if (activeDataItem) {
            //					for ( var k = 0; k < activeDataItem.prefixes.length; k++) {
            //						var ns = activeDataItem.prefixes[k].uri;
            //						for ( var j = 0; j < activeDataItem[set].results.bindings.length; j++) {
            //							var fragments = activeDataItem[set].results.bindings[j][varName].value
            //									.match(/(^\S*[#\/])([^#\/]*$)/);
            //							if (fragments.length == 3 && fragments[1] == ns)
            //								maybeAddCS(activeDataItem.prefixes[k].prefix + ":"
            //										+ fragments[2]);
            //						}
            //					}
            //				}
            //			} else if (/^</.test(start)) {
            //				// Looks like a URI - add matching URIs
            //				var activeDataItem = editor.getSidebar().getActiveDataItem();
            //				if (activeDataItem) {
            //					for ( var j = 0; j < activeDataItem[set].results.bindings.length; j++)
            //						maybeAddCS("<"
            //								+ activeDataItem[set].results.bindings[j][varName].value
            //								+ ">");
            //				}
            //			}
        }

        function gatherCompletions() {
            var i;
            var j;
            var activeDataItem;
            if (isClassPos)
                addFromCollectedURIs("classes", "o");
            for (i = 0; i < possibles.length; ++i) {
                if (possibles[i] == "VAR1" && state.allowVars) {
                    maybeAddCS("?");
                } else if (keywords.exec(possibles[i])) {
                    // keywords - the strings stand for themselves
                    maybeAdd(possibles[i]);
                } else if (punct.exec(possibles[i])) {
                    // punctuation - the strings stand for themselves
                    maybeAddCS(possibles[i]);
                } else if (possibles[i] == "STRING_LITERAL1") {
                    maybeAddCS('"');
                    maybeAddCS("'");
                } else if (possibles[i] == "IRI_REF") {
                    var stack = token.state.stack;

                    // The stack is inspected in order to verify if we are in a "FROM NAMED" context
                    if ((stack.length >= 1
                        && stack[stack.length - 1] == "sourceSelector")
                        || (stack.length >= 2
                            && stack[stack.length - 2] == "groupGraphPattern")) {
                        for (var j = 0; j < namedGraphs.length; j++) {
                            maybeAddCS("<" + namedGraphs[j] + ">");
                        }
                    } else if (!/^</.test(start)) {
                        maybeAddCS("<");
                    }
                } else if (possibles[i] == "BLANK_NODE_LABEL" && state.allowBnodes) {
                    maybeAddCS("_:");
                } else if (possibles[i] == "a") {
                    // Property expected here - fetch possibilities
                    maybeAddCS("a");
                    addFromCollectedURIs("properties", "p");
                } else if (possibles[i] == "PNAME_LN" && !/:$/.test(start)) {
                    // // prefixed names - offer prefixes
                    // activeDataItem = editor.getSidebar().getActiveDataItem();
                    // if (activeDataItem !== undefined
                    //     && activeDataItem.prefixes != undefined
                    //     && activeDataItem.prefixes.length) {
                    //     for (j = 0; j < activeDataItem.prefixes.length; j++) {
                    //         maybeAddCS(activeDataItem.prefixes[j].prefix + ":");
                    //     }
                    // }
                } else if (possibles[i] == "PNAME_NS") {
                    var stack = token.state.stack;

                    // The parser stack is inspected in order to verify if we are in a prefix declaration.
                    if (stack.length >= 3 && stack[stack.length - 2] == "IRI_REF" && stack[stack.length - 3] == "*prefixDecl") {
                        var prefixes = [];
                        var acc = "";

                        if (nsPrefixMappings == undefined) {
                            nsPrefixMappings = initNsPrefixMappings();
                        }

                        for (var ns in nsPrefixMappings) {
                            if (prefixes.length != 0) {
                                acc += "PREFIX ";
                            }
                            acc += ns + ": <" + nsPrefixMappings[ns] + ">\n";
                            prefixes.push({
                                text: ns + ": <" + nsPrefixMappings[ns] + ">",
                                displayText: ns + ":",
                            });
                        }

                        maybeAddCS({
                            text: acc,
                            displayText: "All prefixes",
                        });

                        for (var j = 0; j < prefixes.length; j++) {
                            maybeAddCS(prefixes[j]);
                        }
                    }
                }
            }
        }

        gatherCompletions();

        //override the default hint function (that appends/replaces the chosen hint into the code) for all the suggestion found
        //the default behaviour replace the picked suggestion to the token
        for (var i = 0; i < found.length; i++) {
            found[i].hint = (cm, self, data) => { //data: {text, displayText}
                //self: {list: all available text/displayText objects, from, to}
                var text = data.text;
                var cur = cm.getCursor(false);
                var charBefore = cm.getRange(
                    {line: cur.line, ch: cur.ch-1},
                    {line: cur.line, ch: cur.ch}
                );
                
                if (charBefore.match(/[a-z]/i)) {
                    cm.replaceRange(text, self.from, self.to); //replace text
                } else {
                    cm.replaceRange(text, self.to); //append text
                }
            }
        }

        return found;
    }

    //str is the only one string suggested
    var insertOrReplace = function (str, tkposs, cm) {
        console.log("tkposs insertOrReplace" + JSON.stringify(tkposs));

        //if ctrl-spaced at the begin of a word, or in the middle (the following char is not a whitespace)
        //and the suggested string has alphabetic character(s)
        if ((tkposs.insertStart || tkposs.charAfter != " ") && /^[A-Za-z\*]*$/.exec(str)) {
            str = str + " "; //adds a space after the suggested string (to insert)
        }
        //if ctrl-spaced at the end of a word
        if (tkposs.insertEnd) {
            str = " " + str; //adds a space before the suggester string
        }
        if (tkposs.insertPos) {
            // Insert between spaces
            cm.replaceRange(str, tkposs.insertPos);
        } else {
            // Replace existing token
            cm.replaceRange(
                str,
                { line: tkposs.cur.line, ch: tkposs.token.start },
                { line: tkposs.cur.line, ch: tkposs.token.end }
            );
        }
    }

    function initNsPrefixMappings() {
        var nsPrefixMappings = [];
        var url = "http://" + serverhost + ":1979/semanticturkey/resources/stserver/STServer?" +
            "service=metadata&request=getNSPrefixMappings&ctx_project=" + encodeURIComponent(projectName);
        console.log("GET " + url);

        var httpReq = new XMLHttpRequest();
        httpReq.open("get", url, false);
        httpReq.setRequestHeader("Accept", "application/xml");

        try {
            httpReq.send(null);
		} catch (e) {
			throw new HTTPError(httpReq.status, httpReq.statusText);
		}
        if (httpReq.status != 200) {
			throw new HTTPError(httpReq.status, httpReq.statusText);
		}

        var respXml = httpReq.responseXML;
		var type = respXml.getElementsByTagName("stresponse")[0].getAttribute("type");
        var status = respXml.getElementsByTagName("reply")[0].getAttribute("status");
        if (type == "reply" && status == "ok") {
            var mappings = respXml.getElementsByTagName("Mapping");
    		for ( var i = 0; i < mappings.length; i++) {
	    		nsPrefixMappings[mappings[i].getAttribute("prefix")] = mappings[i].getAttribute("ns");
		    }
        }
        return nsPrefixMappings;
    }

});