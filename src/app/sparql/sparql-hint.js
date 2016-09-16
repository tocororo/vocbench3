// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("codemirror/lib/codemirror"), require("codemirror/mode/sparql/sparql"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["codemirror/lib/codemirror", "codemirror/mode/sparql/sparql"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {

    CodeMirror.registerHelper("hint", "sparql", sparqlHint);

    var sparqlKeywords = ("GROUP_CONCAT|DATATYPE|BASE|PREFIX|SELECT|CONSTRUCT|DESCRIBE|ASK|FROM|NAMED|ORDER|BY|LIMIT|ASC|DESC|OFFSET|DISTINCT|REDUCED|WHERE|GRAPH|OPTIONAL|UNION|FILTER|GROUP|HAVING|AS|VALUES|LOAD|CLEAR|DROP|CREATE|MOVE|COPY|SILENT|INSERT|DELETE|DATA|WITH|TO|USING|NAMED|MINUS|BIND|LANGMATCHES|LANG|BOUND|SAMETERM|ISIRI|ISURI|ISBLANK|ISLITERAL|REGEX|TRUE|FALSE|UNDEF|ADD|DEFAULT|ALL|SERVICE|INTO|IN|NOT|IRI|URI|BNODE|RAND|ABS|CEIL|FLOOR|ROUND|CONCAT|STRLEN|UCASE|LCASE|ENCODE_FOR_URI|CONTAINS|STRSTARTS|STRENDS|STRBEFORE|STRAFTER|YEAR|MONTH|DAY|HOURS|MINUTES|SECONDS|TIMEZONE|TZ|NOW|UUID|STRUUID|MD5|SHA1|SHA256|SHA384|SHA512|COALESCE|IF|STRLANG|STRDT|ISNUMERIC|SUBSTR|REPLACE|EXISTS|COUNT|SUM|MIN|MAX|AVG|SAMPLE|SEPARATOR|STR").split("|");

    function sparqlHint(cmEditor, options) {
        return scriptHint(cmEditor, sparqlKeywords,
            function (e, cur) { return e.getTokenAt(cur); }, //getToken function
            options);
    };

    function scriptHint(editor, keywords, getToken, options) {
        // Find the token at the cursor
        var cur = editor.getCursor();   //object containing line and character {"line": number, "ch": number}
        var token = getToken(editor, cur); 
        console.log("token " + JSON.stringify(token));
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
            list: getCompletions(token, keywords),
            from: CodeMirror.Pos(cur.line, token.start),
            to: CodeMirror.Pos(cur.line, token.end)
        };
    }

    function forEach(arr, f) {
        for (var i = 0, e = arr.length; i < e; ++i) f(arr[i]);
    }

    function getCompletions(token, keywords) {
        var found = [];
        var start = token.string

        function arrayContains(arr, item) {
            if (!Array.prototype.indexOf) {
                var i = arr.length;
                while (i--) {
                    if (arr[i] === item) {
                        return true;
                    }
                }
                return false;
            }
            return arr.indexOf(item) != -1;
        }

        function maybeAdd(str) {
            if (str.lastIndexOf(start, 0) == 0 && !arrayContains(found, str)) found.push(str);
        }
        
        forEach(keywords, maybeAdd);
        
        return found;
    }

});
