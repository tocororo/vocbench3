//https://github.com/codemirror/CodeMirror/blob/master/demo/mustache.html

(function (mod) {
    if (typeof exports == "object" && typeof module == "object") // CommonJS
        mod(require('codemirror/lib/codemirror'));
    else if (typeof define == "function" && define.amd) // AMD
        define(["codemirror/lib/codemirror"], mod);
    else // Plain browser env
        mod(CodeMirror);
})(function (CodeMirror) {
    "use strict";

    CodeMirror.defineMode("mustache", function (config, parserConfig) {
        var mustacheOverlay = {
            token: function (stream, state) {
                var ch;
                if (stream.match("{{")) {
                    while ((ch = stream.next()) != null)
                        if (ch == "}" && stream.next() == "}") {
                            stream.eat("}");
                            return "mustache";
                        }
                }
                while (stream.next() != null && !stream.match("{{", false)) { }
                return null;
            }
        };
        return CodeMirror.overlayMode(CodeMirror.getMode(config, parserConfig.backdrop || "text/html"), mustacheOverlay);
    });

});