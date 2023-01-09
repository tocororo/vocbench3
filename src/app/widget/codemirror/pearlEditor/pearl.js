(function (mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require('codemirror/lib/codemirror'));
  else if (typeof define == "function" && define.amd) // AMD
    define(["codemirror/lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function (CodeMirror) {
  "use strict";

  CodeMirror.defineMode("pearl", function (config) {
    var indentUnit = config.indentUnit;
    var curPunc;

    function wordRegexp(words) {
      return new RegExp("^(?:" + words.join("|") + ")$", "i");
    }
    var ops = wordRegexp(["uri", "bnode", "regex", "a", "literal", "as"]);
    var keywords = wordRegexp(["prefix", "where", "OPTIONAL", "graph", "nodes", "insert", "delete", "rule", "bindings",
      "Annotation", "annotations", "lazy", "conditions", "dependsOn", "forRegex"]);
    var operatorChars = /[*+\-<>=&|\^\/!\?]/;

    function tokenBase(stream, state) {
      var ch = stream.next();
      curPunc = null;
      if (ch == "$" || ch == "?") {
        stream.match(/^[\w\d]*/);
        return "variable-2";
      }
      //next character is % and the stream matches characters/digits and ends with % => assign variable-4 token => apply cm-variable-4 style class
      else if (ch == "%" && stream.match(/^[a-zA-Z0-9-_]+%/)) {
        stream.match(/^[^\s\u00a0>]*>?/);
        return "variable-4";
      }
      else if (ch == "<" && !stream.match(/^[\s\u00a0=]/, false)) {
        stream.match(/^[^\s\u00a0>]*>?/);
        return "atom";
      }
      else if (ch == "\"" || ch == "'") {
        state.tokenize = tokenLiteral(ch);
        return state.tokenize(stream, state);
      }
      else if (/[{}\(\),\.;\[\]]/.test(ch)) {
        curPunc = ch;
        return "bracket";
      }
      else if (ch == "/") {
        if (stream.eat("*")) {
          state.tokenize = tokenComment;
          return tokenComment(stream, state);
        } else if (stream.eat("/")) {
          stream.skipToEnd();
          return "comment";
        }
      }
      else if (operatorChars.test(ch)) {
        stream.eatWhile(operatorChars);
        return "operator";
      }
      else if (ch == ":") {
        stream.eatWhile(/[\w\d\._\-]/);
        return "atom";
      }
      else if (ch == "@") {
        stream.eatWhile(/[a-z\d\-]/i);
        return "meta";
      }
      else {
        stream.eatWhile(/[_\w\d]/);
        if (stream.eat(":")) {
          stream.eatWhile(/[\w\d_\-]/);
          return "atom";
        }
        var word = stream.current();
        if (ops.test(word))
          return "builtin";
        else if (keywords.test(word))
          return "keyword";
        else
          return "variable";
      }
    }

    function tokenComment(stream, state) {
      var maybeEnd = false, ch;
      while (ch = stream.next()) {
        if (ch == "/" && maybeEnd) {
          state.tokenize = tokenBase;
          break;
        }
        maybeEnd = (ch == "*");
      }
      return "comment";
    }

    function tokenLiteral(quote) {
      return function (stream, state) {
        var escaped = false, ch;
        while ((ch = stream.next()) != null) {
          if (ch == quote && !escaped) {
            state.tokenize = tokenBase;
            break;
          }
          escaped = !escaped && ch == "\\";
        }
        return "string";
      };
    }

    function pushContext(state, type, col) {
      state.context = { prev: state.context, indent: state.indent, col: col, type: type };
    }
    function popContext(state) {
      state.indent = state.context.indent;
      state.context = state.context.prev;
    }

    return {
      startState: function () {
        return {
          tokenize: tokenBase,
          context: null,
          indent: 0,
          col: 0
        };
      },

      token: function (stream, state) {
        if (stream.sol()) {
          if (state.context && state.context.align == null) state.context.align = false;
          state.indent = stream.indentation();
        }
        if (stream.eatSpace()) return null;
        var style = state.tokenize(stream, state);

        if (style != "comment" && state.context && state.context.align == null && state.context.type != "pattern") {
          state.context.align = true;
        }

        if (curPunc == "(") pushContext(state, ")", stream.column());
        else if (curPunc == "[") pushContext(state, "]", stream.column());
        else if (curPunc == "{") pushContext(state, "}", stream.column());
        else if (/[\]\}\)]/.test(curPunc)) {
          while (state.context && state.context.type == "pattern") popContext(state);
          if (state.context && curPunc == state.context.type) {
            popContext(state);
            if (curPunc == "}" && state.context && state.context.type == "pattern")
              popContext(state);
          }
        }
        else if (curPunc == "." && state.context && state.context.type == "pattern") popContext(state);
        else if (/atom|string|variable/.test(style) && state.context) {
          if (/[\}\]]/.test(state.context.type))
            pushContext(state, "pattern", stream.column());
          else if (state.context.type == "pattern" && !state.context.align) {
            state.context.align = true;
            state.context.col = stream.column();
          }
        }

        return style;
      },

      indent: function (state, textAfter) {
        var firstChar = textAfter && textAfter.charAt(0);
        var context = state.context;
        if (/[\]\}]/.test(firstChar))
          while (context && context.type == "pattern") context = context.prev;

        var closing = context && firstChar == context.type;
        if (!context)
          return 0;
        else if (context.type == "pattern")
          return context.col;
        else if (context.align)
          return context.col + (closing ? 0 : 1);
        else
          return context.indent + (closing ? 0 : indentUnit);
      },

      // fold: "brace", //exploits the addon for folding brace blocks (addon/fold/brace-fold.js)

      lineComment: "//"
    };
  });

});


/**
 * PREFIX declarations folding
 */
function prefixFolding(cm, start) {

  function hasPrefix(line) {
    if (line < cm.firstLine() || line > cm.lastLine()) return null;
    var start = cm.getTokenAt(CodeMirror.Pos(line, 1));
    if (!/\S/.test(start.string)) start = cm.getTokenAt(CodeMirror.Pos(line, start.end + 1));
    if (start.string.toLocaleLowerCase() != "prefix") return null;
    // Now find closing >, return its position
    for (var i = line, e = Math.min(cm.lastLine(), line + 10); i <= e; ++i) {
      var text = cm.getLine(i);
      var semi = text.indexOf(">");
      if (semi != -1) return { startCh: start.end, end: CodeMirror.Pos(i, semi) };
    }
  }

  var startLine = start.line, has = hasPrefix(startLine), prev;

  if (!has || hasPrefix(startLine - 1) || ((prev = hasPrefix(startLine - 2)) && prev.end.line == startLine - 1)) {
    return null;
  }

  for (var end = has.end; ;) {
    var next = hasPrefix(end.line + 1);
    if (next == null) break;
    end = next.end;
  }
  end.ch++;

  return { from: cm.clipPos(CodeMirror.Pos(startLine, has.startCh + 1)), to: end };
}


/**
 * brackets folding
 */
function bracketsFolding(cm, start) {

  var pairs = [["{", "}"], ["[", "]"]];
  var line = start.line, lineText = cm.getLine(line);

  function findOpening(pair) {
    var tokenType;
    for (var at = start.ch, pass = 0; ;) {
      var found = at <= 0 ? -1 : lineText.lastIndexOf(pair[0], at - 1);
      if (found == -1) {
        if (pass == 1) break;
        pass = 1;
        at = lineText.length;
        continue;
      }
      if (pass == 1 && found < start.ch) break;
      tokenType = cm.getTokenTypeAt(CodeMirror.Pos(line, found + 1));
      if (!/^(comment|string)/.test(tokenType)) return { ch: found + 1, tokenType: tokenType, pair: pair };
      at = found - 1;
    }
  }

  function findRange(found) {
    var count = 1, lastLine = cm.lastLine(), end, startCh = found.ch, endCh
    outer: for (var i = line; i <= lastLine; ++i) {
      var text = cm.getLine(i), pos = i == line ? startCh : 0;
      for (; ;) {
        var nextOpen = text.indexOf(found.pair[0], pos), nextClose = text.indexOf(found.pair[1], pos);
        if (nextOpen < 0) nextOpen = text.length;
        if (nextClose < 0) nextClose = text.length;
        pos = Math.min(nextOpen, nextClose);
        if (pos == text.length) break;
        if (cm.getTokenTypeAt(CodeMirror.Pos(i, pos + 1)) == found.tokenType) {
          if (pos == nextOpen) ++count;
          else if (!--count) { end = i; endCh = pos; break outer; }
        }
        ++pos;
      }
    }

    if (end == null || line == end) return null
    return {
      from: CodeMirror.Pos(line, startCh),
      to: CodeMirror.Pos(end, endCh)
    };
  }

  var found = []
  for (var i = 0; i < pairs.length; i++) {
    var open = findOpening(pairs[i])
    if (open) found.push(open)
  }
  found.sort(function (a, b) { return a.ch - b.ch })
  for (var i = 0; i < found.length; i++) {
    var range = findRange(found[i])
    if (range) return range
  }
  return null
}

function pearlFolding(cm, start) {
  let cur = bracketsFolding(cm, start);
  if (cur) {
    return cur;
  } else {
    return prefixFolding(cm, start);
  }
}

/**
 * Helper for all kind of foldings in pearl
 */
CodeMirror.registerHelper("fold", "pearl", function(cm, start) {
  let cur = bracketsFolding(cm, start);
  if (cur) {
    return cur;
  } else {
    return prefixFolding(cm, start);
  }
});