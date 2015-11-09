(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"C:\\ksana2015\\node_modules\\codemirror\\addon\\dialog\\dialog.js":[function(require,module,exports){
// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

// Open simple dialogs on top of an editor. Relies on dialog.css.

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  function dialogDiv(cm, template, bottom) {
    var wrap = cm.getWrapperElement();
    var dialog;
    dialog = wrap.appendChild(document.createElement("div"));
    if (bottom)
      dialog.className = "CodeMirror-dialog CodeMirror-dialog-bottom";
    else
      dialog.className = "CodeMirror-dialog CodeMirror-dialog-top";

    if (typeof template == "string") {
      dialog.innerHTML = template;
    } else { // Assuming it's a detached DOM element.
      dialog.appendChild(template);
    }
    return dialog;
  }

  function closeNotification(cm, newVal) {
    if (cm.state.currentNotificationClose)
      cm.state.currentNotificationClose();
    cm.state.currentNotificationClose = newVal;
  }

  CodeMirror.defineExtension("openDialog", function(template, callback, options) {
    if (!options) options = {};

    closeNotification(this, null);

    var dialog = dialogDiv(this, template, options.bottom);
    var closed = false, me = this;
    function close(newVal) {
      if (typeof newVal == 'string') {
        inp.value = newVal;
      } else {
        if (closed) return;
        closed = true;
        dialog.parentNode.removeChild(dialog);
        me.focus();

        if (options.onClose) options.onClose(dialog);
      }
    }

    var inp = dialog.getElementsByTagName("input")[0], button;
    if (inp) {
      if (options.value) {
        inp.value = options.value;
        if (options.selectValueOnOpen !== false) {
          inp.select();
        }
      }

      if (options.onInput)
        CodeMirror.on(inp, "input", function(e) { options.onInput(e, inp.value, close);});
      if (options.onKeyUp)
        CodeMirror.on(inp, "keyup", function(e) {options.onKeyUp(e, inp.value, close);});

      CodeMirror.on(inp, "keydown", function(e) {
        if (options && options.onKeyDown && options.onKeyDown(e, inp.value, close)) { return; }
        if (e.keyCode == 27 || (options.closeOnEnter !== false && e.keyCode == 13)) {
          inp.blur();
          CodeMirror.e_stop(e);
          close();
        }
        if (e.keyCode == 13) callback(inp.value, e);
      });

      if (options.closeOnBlur !== false) CodeMirror.on(inp, "blur", close);

      inp.focus();
    } else if (button = dialog.getElementsByTagName("button")[0]) {
      CodeMirror.on(button, "click", function() {
        close();
        me.focus();
      });

      if (options.closeOnBlur !== false) CodeMirror.on(button, "blur", close);

      button.focus();
    }
    return close;
  });

  CodeMirror.defineExtension("openConfirm", function(template, callbacks, options) {
    closeNotification(this, null);
    var dialog = dialogDiv(this, template, options && options.bottom);
    var buttons = dialog.getElementsByTagName("button");
    var closed = false, me = this, blurring = 1;
    function close() {
      if (closed) return;
      closed = true;
      dialog.parentNode.removeChild(dialog);
      me.focus();
    }
    buttons[0].focus();
    for (var i = 0; i < buttons.length; ++i) {
      var b = buttons[i];
      (function(callback) {
        CodeMirror.on(b, "click", function(e) {
          CodeMirror.e_preventDefault(e);
          close();
          if (callback) callback(me);
        });
      })(callbacks[i]);
      CodeMirror.on(b, "blur", function() {
        --blurring;
        setTimeout(function() { if (blurring <= 0) close(); }, 200);
      });
      CodeMirror.on(b, "focus", function() { ++blurring; });
    }
  });

  /*
   * openNotification
   * Opens a notification, that can be closed with an optional timer
   * (default 5000ms timer) and always closes on click.
   *
   * If a notification is opened while another is opened, it will close the
   * currently opened one and open the new one immediately.
   */
  CodeMirror.defineExtension("openNotification", function(template, options) {
    closeNotification(this, close);
    var dialog = dialogDiv(this, template, options && options.bottom);
    var closed = false, doneTimer;
    var duration = options && typeof options.duration !== "undefined" ? options.duration : 5000;

    function close() {
      if (closed) return;
      closed = true;
      clearTimeout(doneTimer);
      dialog.parentNode.removeChild(dialog);
    }

    CodeMirror.on(dialog, 'click', function(e) {
      CodeMirror.e_preventDefault(e);
      close();
    });

    if (duration)
      doneTimer = setTimeout(close, duration);

    return close;
  });
});

},{"../../lib/codemirror":"C:\\ksana2015\\node_modules\\codemirror\\lib\\codemirror.js"}],"C:\\ksana2015\\node_modules\\codemirror\\addon\\display\\panel.js":[function(require,module,exports){
// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  CodeMirror.defineExtension("addPanel", function(node, options) {
    options = options || {};

    if (!this.state.panels) initPanels(this);

    var info = this.state.panels;
    var wrapper = info.wrapper;
    var cmWrapper = this.getWrapperElement();

    if (options.after instanceof Panel && !options.after.cleared) {
      wrapper.insertBefore(node, options.before.node.nextSibling);
    } else if (options.before instanceof Panel && !options.before.cleared) {
      wrapper.insertBefore(node, options.before.node);
    } else if (options.replace instanceof Panel && !options.replace.cleared) {
      wrapper.insertBefore(node, options.replace.node);
      options.replace.clear();
    } else if (options.position == "bottom") {
      wrapper.appendChild(node);
    } else if (options.position == "before-bottom") {
      wrapper.insertBefore(node, cmWrapper.nextSibling);
    } else if (options.position == "after-top") {
      wrapper.insertBefore(node, cmWrapper);
    } else {
      wrapper.insertBefore(node, wrapper.firstChild);
    }

    var height = (options && options.height) || node.offsetHeight;
    this._setSize(null, info.heightLeft -= height);
    info.panels++;
    return new Panel(this, node, options, height);
  });

  function Panel(cm, node, options, height) {
    this.cm = cm;
    this.node = node;
    this.options = options;
    this.height = height;
    this.cleared = false;
  }

  Panel.prototype.clear = function() {
    if (this.cleared) return;
    this.cleared = true;
    var info = this.cm.state.panels;
    this.cm._setSize(null, info.heightLeft += this.height);
    info.wrapper.removeChild(this.node);
    if (--info.panels == 0) removePanels(this.cm);
  };

  Panel.prototype.changed = function(height) {
    var newHeight = height == null ? this.node.offsetHeight : height;
    var info = this.cm.state.panels;
    this.cm._setSize(null, info.height += (newHeight - this.height));
    this.height = newHeight;
  };

  function initPanels(cm) {
    var wrap = cm.getWrapperElement();
    var style = window.getComputedStyle ? window.getComputedStyle(wrap) : wrap.currentStyle;
    var height = parseInt(style.height);
    var info = cm.state.panels = {
      setHeight: wrap.style.height,
      heightLeft: height,
      panels: 0,
      wrapper: document.createElement("div")
    };
    wrap.parentNode.insertBefore(info.wrapper, wrap);
    var hasFocus = cm.hasFocus();
    info.wrapper.appendChild(wrap);
    if (hasFocus) cm.focus();

    cm._setSize = cm.setSize;
    if (height != null) cm.setSize = function(width, newHeight) {
      if (newHeight == null) return this._setSize(width, newHeight);
      info.setHeight = newHeight;
      if (typeof newHeight != "number") {
        var px = /^(\d+\.?\d*)px$/.exec(newHeight);
        if (px) {
          newHeight = Number(px[1]);
        } else {
          info.wrapper.style.height = newHeight;
          newHeight = info.wrapper.offsetHeight;
          info.wrapper.style.height = "";
        }
      }
      cm._setSize(width, info.heightLeft += (newHeight - height));
      height = newHeight;
    };
  }

  function removePanels(cm) {
    var info = cm.state.panels;
    cm.state.panels = null;

    var wrap = cm.getWrapperElement();
    info.wrapper.parentNode.replaceChild(wrap, info.wrapper);
    wrap.style.height = info.setHeight;
    cm.setSize = cm._setSize;
    cm.setSize();
  }
});

},{"../../lib/codemirror":"C:\\ksana2015\\node_modules\\codemirror\\lib\\codemirror.js"}],"C:\\ksana2015\\node_modules\\codemirror\\addon\\hint\\show-hint.js":[function(require,module,exports){
// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  var HINT_ELEMENT_CLASS        = "CodeMirror-hint";
  var ACTIVE_HINT_ELEMENT_CLASS = "CodeMirror-hint-active";

  // This is the old interface, kept around for now to stay
  // backwards-compatible.
  CodeMirror.showHint = function(cm, getHints, options) {
    if (!getHints) return cm.showHint(options);
    if (options && options.async) getHints.async = true;
    var newOpts = {hint: getHints};
    if (options) for (var prop in options) newOpts[prop] = options[prop];
    return cm.showHint(newOpts);
  };

  CodeMirror.defineExtension("showHint", function(options) {
    // We want a single cursor position.
    if (this.listSelections().length > 1 || this.somethingSelected()) return;

    if (this.state.completionActive) this.state.completionActive.close();
    var completion = this.state.completionActive = new Completion(this, options);
    if (!completion.options.hint) return;

    CodeMirror.signal(this, "startCompletion", this);
    completion.update(true);
  });

  function Completion(cm, options) {
    this.cm = cm;
    this.options = this.buildOptions(options);
    this.widget = null;
    this.debounce = 0;
    this.tick = 0;
    this.startPos = this.cm.getCursor();
    this.startLen = this.cm.getLine(this.startPos.line).length;

    var self = this;
    cm.on("cursorActivity", this.activityFunc = function() { self.cursorActivity(); });
  }

  var requestAnimationFrame = window.requestAnimationFrame || function(fn) {
    return setTimeout(fn, 1000/60);
  };
  var cancelAnimationFrame = window.cancelAnimationFrame || clearTimeout;

  Completion.prototype = {
    close: function() {
      if (!this.active()) return;
      this.cm.state.completionActive = null;
      this.tick = null;
      this.cm.off("cursorActivity", this.activityFunc);

      if (this.widget && this.data) CodeMirror.signal(this.data, "close");
      if (this.widget) this.widget.close();
      CodeMirror.signal(this.cm, "endCompletion", this.cm);
    },

    active: function() {
      return this.cm.state.completionActive == this;
    },

    pick: function(data, i) {
      var completion = data.list[i];
      if (completion.hint) completion.hint(this.cm, data, completion);
      else this.cm.replaceRange(getText(completion), completion.from || data.from,
                                completion.to || data.to, "complete");
      CodeMirror.signal(data, "pick", completion);
      this.close();
    },

    cursorActivity: function() {
      if (this.debounce) {
        cancelAnimationFrame(this.debounce);
        this.debounce = 0;
      }

      var pos = this.cm.getCursor(), line = this.cm.getLine(pos.line);
      if (pos.line != this.startPos.line || line.length - pos.ch != this.startLen - this.startPos.ch ||
          pos.ch < this.startPos.ch || this.cm.somethingSelected() ||
          (pos.ch && this.options.closeCharacters.test(line.charAt(pos.ch - 1)))) {
        this.close();
      } else {
        var self = this;
        this.debounce = requestAnimationFrame(function() {self.update();});
        if (this.widget) this.widget.disable();
      }
    },

    update: function(first) {
      if (this.tick == null) return;
      if (!this.options.hint.async) {
        this.finishUpdate(this.options.hint(this.cm, this.options), first);
      } else {
        var myTick = ++this.tick, self = this;
        this.options.hint(this.cm, function(data) {
          if (self.tick == myTick) self.finishUpdate(data, first);
        }, this.options);
      }
    },

    finishUpdate: function(data, first) {
      if (this.data) CodeMirror.signal(this.data, "update");
      if (data && this.data && CodeMirror.cmpPos(data.from, this.data.from)) data = null;
      this.data = data;

      var picked = (this.widget && this.widget.picked) || (first && this.options.completeSingle);
      if (this.widget) this.widget.close();
      if (data && data.list.length) {
        if (picked && data.list.length == 1) {
          this.pick(data, 0);
        } else {
          this.widget = new Widget(this, data);
          CodeMirror.signal(data, "shown");
        }
      }
    },

    buildOptions: function(options) {
      var editor = this.cm.options.hintOptions;
      var out = {};
      for (var prop in defaultOptions) out[prop] = defaultOptions[prop];
      if (editor) for (var prop in editor)
        if (editor[prop] !== undefined) out[prop] = editor[prop];
      if (options) for (var prop in options)
        if (options[prop] !== undefined) out[prop] = options[prop];
      return out;
    }
  };

  function getText(completion) {
    if (typeof completion == "string") return completion;
    else return completion.text;
  }

  function buildKeyMap(completion, handle) {
    var baseMap = {
      Up: function() {handle.moveFocus(-1);},
      Down: function() {handle.moveFocus(1);},
      PageUp: function() {handle.moveFocus(-handle.menuSize() + 1, true);},
      PageDown: function() {handle.moveFocus(handle.menuSize() - 1, true);},
      Home: function() {handle.setFocus(0);},
      End: function() {handle.setFocus(handle.length - 1);},
      Enter: handle.pick,
      Tab: handle.pick,
      Esc: handle.close
    };
    var custom = completion.options.customKeys;
    var ourMap = custom ? {} : baseMap;
    function addBinding(key, val) {
      var bound;
      if (typeof val != "string")
        bound = function(cm) { return val(cm, handle); };
      // This mechanism is deprecated
      else if (baseMap.hasOwnProperty(val))
        bound = baseMap[val];
      else
        bound = val;
      ourMap[key] = bound;
    }
    if (custom)
      for (var key in custom) if (custom.hasOwnProperty(key))
        addBinding(key, custom[key]);
    var extra = completion.options.extraKeys;
    if (extra)
      for (var key in extra) if (extra.hasOwnProperty(key))
        addBinding(key, extra[key]);
    return ourMap;
  }

  function getHintElement(hintsElement, el) {
    while (el && el != hintsElement) {
      if (el.nodeName.toUpperCase() === "LI" && el.parentNode == hintsElement) return el;
      el = el.parentNode;
    }
  }

  function Widget(completion, data) {
    this.completion = completion;
    this.data = data;
    this.picked = false;
    var widget = this, cm = completion.cm;

    var hints = this.hints = document.createElement("ul");
    hints.className = "CodeMirror-hints";
    this.selectedHint = data.selectedHint || 0;

    var completions = data.list;
    for (var i = 0; i < completions.length; ++i) {
      var elt = hints.appendChild(document.createElement("li")), cur = completions[i];
      var className = HINT_ELEMENT_CLASS + (i != this.selectedHint ? "" : " " + ACTIVE_HINT_ELEMENT_CLASS);
      if (cur.className != null) className = cur.className + " " + className;
      elt.className = className;
      if (cur.render) cur.render(elt, data, cur);
      else elt.appendChild(document.createTextNode(cur.displayText || getText(cur)));
      elt.hintId = i;
    }

    var pos = cm.cursorCoords(completion.options.alignWithWord ? data.from : null);
    var left = pos.left, top = pos.bottom, below = true;
    hints.style.left = left + "px";
    hints.style.top = top + "px";
    // If we're at the edge of the screen, then we want the menu to appear on the left of the cursor.
    var winW = window.innerWidth || Math.max(document.body.offsetWidth, document.documentElement.offsetWidth);
    var winH = window.innerHeight || Math.max(document.body.offsetHeight, document.documentElement.offsetHeight);
    (completion.options.container || document.body).appendChild(hints);
    var box = hints.getBoundingClientRect(), overlapY = box.bottom - winH;
    if (overlapY > 0) {
      var height = box.bottom - box.top, curTop = pos.top - (pos.bottom - box.top);
      if (curTop - height > 0) { // Fits above cursor
        hints.style.top = (top = pos.top - height) + "px";
        below = false;
      } else if (height > winH) {
        hints.style.height = (winH - 5) + "px";
        hints.style.top = (top = pos.bottom - box.top) + "px";
        var cursor = cm.getCursor();
        if (data.from.ch != cursor.ch) {
          pos = cm.cursorCoords(cursor);
          hints.style.left = (left = pos.left) + "px";
          box = hints.getBoundingClientRect();
        }
      }
    }
    var overlapX = box.right - winW;
    if (overlapX > 0) {
      if (box.right - box.left > winW) {
        hints.style.width = (winW - 5) + "px";
        overlapX -= (box.right - box.left) - winW;
      }
      hints.style.left = (left = pos.left - overlapX) + "px";
    }

    cm.addKeyMap(this.keyMap = buildKeyMap(completion, {
      moveFocus: function(n, avoidWrap) { widget.changeActive(widget.selectedHint + n, avoidWrap); },
      setFocus: function(n) { widget.changeActive(n); },
      menuSize: function() { return widget.screenAmount(); },
      length: completions.length,
      close: function() { completion.close(); },
      pick: function() { widget.pick(); },
      data: data
    }));

    if (completion.options.closeOnUnfocus) {
      var closingOnBlur;
      cm.on("blur", this.onBlur = function() { closingOnBlur = setTimeout(function() { completion.close(); }, 100); });
      cm.on("focus", this.onFocus = function() { clearTimeout(closingOnBlur); });
    }

    var startScroll = cm.getScrollInfo();
    cm.on("scroll", this.onScroll = function() {
      var curScroll = cm.getScrollInfo(), editor = cm.getWrapperElement().getBoundingClientRect();
      var newTop = top + startScroll.top - curScroll.top;
      var point = newTop - (window.pageYOffset || (document.documentElement || document.body).scrollTop);
      if (!below) point += hints.offsetHeight;
      if (point <= editor.top || point >= editor.bottom) return completion.close();
      hints.style.top = newTop + "px";
      hints.style.left = (left + startScroll.left - curScroll.left) + "px";
    });

    CodeMirror.on(hints, "dblclick", function(e) {
      var t = getHintElement(hints, e.target || e.srcElement);
      if (t && t.hintId != null) {widget.changeActive(t.hintId); widget.pick();}
    });

    CodeMirror.on(hints, "click", function(e) {
      var t = getHintElement(hints, e.target || e.srcElement);
      if (t && t.hintId != null) {
        widget.changeActive(t.hintId);
        if (completion.options.completeOnSingleClick) widget.pick();
      }
    });

    CodeMirror.on(hints, "mousedown", function() {
      setTimeout(function(){cm.focus();}, 20);
    });

    CodeMirror.signal(data, "select", completions[0], hints.firstChild);
    return true;
  }

  Widget.prototype = {
    close: function() {
      if (this.completion.widget != this) return;
      this.completion.widget = null;
      this.hints.parentNode.removeChild(this.hints);
      this.completion.cm.removeKeyMap(this.keyMap);

      var cm = this.completion.cm;
      if (this.completion.options.closeOnUnfocus) {
        cm.off("blur", this.onBlur);
        cm.off("focus", this.onFocus);
      }
      cm.off("scroll", this.onScroll);
    },

    disable: function() {
      this.completion.cm.removeKeyMap(this.keyMap);
      var widget = this;
      this.keyMap = {Enter: function() { widget.picked = true; }};
      this.completion.cm.addKeyMap(this.keyMap);
    },

    pick: function() {
      this.completion.pick(this.data, this.selectedHint);
    },

    changeActive: function(i, avoidWrap) {
      if (i >= this.data.list.length)
        i = avoidWrap ? this.data.list.length - 1 : 0;
      else if (i < 0)
        i = avoidWrap ? 0  : this.data.list.length - 1;
      if (this.selectedHint == i) return;
      var node = this.hints.childNodes[this.selectedHint];
      node.className = node.className.replace(" " + ACTIVE_HINT_ELEMENT_CLASS, "");
      node = this.hints.childNodes[this.selectedHint = i];
      node.className += " " + ACTIVE_HINT_ELEMENT_CLASS;
      if (node.offsetTop < this.hints.scrollTop)
        this.hints.scrollTop = node.offsetTop - 3;
      else if (node.offsetTop + node.offsetHeight > this.hints.scrollTop + this.hints.clientHeight)
        this.hints.scrollTop = node.offsetTop + node.offsetHeight - this.hints.clientHeight + 3;
      CodeMirror.signal(this.data, "select", this.data.list[this.selectedHint], node);
    },

    screenAmount: function() {
      return Math.floor(this.hints.clientHeight / this.hints.firstChild.offsetHeight) || 1;
    }
  };

  CodeMirror.registerHelper("hint", "auto", function(cm, options) {
    var helpers = cm.getHelpers(cm.getCursor(), "hint"), words;
    if (helpers.length) {
      for (var i = 0; i < helpers.length; i++) {
        var cur = helpers[i](cm, options);
        if (cur && cur.list.length) return cur;
      }
    } else if (words = cm.getHelper(cm.getCursor(), "hintWords")) {
      if (words) return CodeMirror.hint.fromList(cm, {words: words});
    } else if (CodeMirror.hint.anyword) {
      return CodeMirror.hint.anyword(cm, options);
    }
  });

  CodeMirror.registerHelper("hint", "fromList", function(cm, options) {
    var cur = cm.getCursor(), token = cm.getTokenAt(cur);
    var to = CodeMirror.Pos(cur.line, token.end);
    if (token.string && /\w/.test(token.string[token.string.length - 1])) {
      var term = token.string, from = CodeMirror.Pos(cur.line, token.start);
    } else {
      var term = "", from = to;
    }
    var found = [];
    for (var i = 0; i < options.words.length; i++) {
      var word = options.words[i];
      if (word.slice(0, term.length) == term)
        found.push(word);
    }

    if (found.length) return {list: found, from: from, to: to};
  });

  CodeMirror.commands.autocomplete = CodeMirror.showHint;

  var defaultOptions = {
    hint: CodeMirror.hint.auto,
    completeSingle: true,
    alignWithWord: true,
    closeCharacters: /[\s()\[\]{};:>,]/,
    closeOnUnfocus: true,
    completeOnSingleClick: false,
    container: null,
    customKeys: null,
    extraKeys: null
  };

  CodeMirror.defineOption("hintOptions", null);
});

},{"../../lib/codemirror":"C:\\ksana2015\\node_modules\\codemirror\\lib\\codemirror.js"}],"C:\\ksana2015\\node_modules\\codemirror\\addon\\search\\search.js":[function(require,module,exports){
// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

// Define search commands. Depends on dialog.js or another
// implementation of the openDialog method.

// Replace works a little oddly -- it will do the replace on the next
// Ctrl-G (or whatever is bound to findNext) press. You prevent a
// replace by making sure the match is no longer selected when hitting
// Ctrl-G.

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"), require("./searchcursor"), require("../dialog/dialog"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror", "./searchcursor", "../dialog/dialog"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  function searchOverlay(query, caseInsensitive) {
    if (typeof query == "string")
      query = new RegExp(query.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), caseInsensitive ? "gi" : "g");
    else if (!query.global)
      query = new RegExp(query.source, query.ignoreCase ? "gi" : "g");

    return {token: function(stream) {
      query.lastIndex = stream.pos;
      var match = query.exec(stream.string);
      if (match && match.index == stream.pos) {
        stream.pos += match[0].length;
        return "searching";
      } else if (match) {
        stream.pos = match.index;
      } else {
        stream.skipToEnd();
      }
    }};
  }

  function SearchState() {
    this.posFrom = this.posTo = this.lastQuery = this.query = null;
    this.overlay = null;
  }

  function getSearchState(cm) {
    return cm.state.search || (cm.state.search = new SearchState());
  }

  function queryCaseInsensitive(query) {
    return typeof query == "string" && query == query.toLowerCase();
  }

  function getSearchCursor(cm, query, pos) {
    // Heuristic: if the query string is all lowercase, do a case insensitive search.
    return cm.getSearchCursor(query, pos, queryCaseInsensitive(query));
  }

  function persistentDialog(cm, text, deflt, f) {
    cm.openDialog(text, f, {
      value: deflt,
      selectValueOnOpen: true,
      closeOnEnter: false,
      onClose: function() { clearSearch(cm); }
    });
  }

  function dialog(cm, text, shortText, deflt, f) {
    if (cm.openDialog) cm.openDialog(text, f, {value: deflt, selectValueOnOpen: true});
    else f(prompt(shortText, deflt));
  }

  function confirmDialog(cm, text, shortText, fs) {
    if (cm.openConfirm) cm.openConfirm(text, fs);
    else if (confirm(shortText)) fs[0]();
  }

  function parseString(string) {
    return string.replace(/\\(.)/g, function(_, ch) {
      if (ch == "n") return "\n"
      if (ch == "r") return "\r"
      return ch
    })
  }

  function parseQuery(query) {
    var isRE = query.match(/^\/(.*)\/([a-z]*)$/);
    if (isRE) {
      try { query = new RegExp(isRE[1], isRE[2].indexOf("i") == -1 ? "" : "i"); }
      catch(e) {} // Not a regular expression after all, do a string search
    } else {
      query = parseString(query)
    }
    if (typeof query == "string" ? query == "" : query.test(""))
      query = /x^/;
    return query;
  }

  var queryDialog =
    'Search: <input type="text" style="width: 10em" class="CodeMirror-search-field"/> <span style="color: #888" class="CodeMirror-search-hint">(Use /re/ syntax for regexp search)</span>';

  function startSearch(cm, state, query) {
    state.queryText = query;
    state.query = parseQuery(query);
    cm.removeOverlay(state.overlay, queryCaseInsensitive(state.query));
    state.overlay = searchOverlay(state.query, queryCaseInsensitive(state.query));
    cm.addOverlay(state.overlay);
    if (cm.showMatchesOnScrollbar) {
      if (state.annotate) { state.annotate.clear(); state.annotate = null; }
      state.annotate = cm.showMatchesOnScrollbar(state.query, queryCaseInsensitive(state.query));
    }
  }

  function doSearch(cm, rev, persistent) {
    var state = getSearchState(cm);
    if (state.query) return findNext(cm, rev);
    var q = cm.getSelection() || state.lastQuery;
    if (persistent && cm.openDialog) {
      var hiding = null
      persistentDialog(cm, queryDialog, q, function(query, event) {
        CodeMirror.e_stop(event);
        if (!query) return;
        if (query != state.queryText) startSearch(cm, state, query);
        if (hiding) hiding.style.opacity = 1
        findNext(cm, event.shiftKey, function(_, to) {
          var dialog
          if (to.line < 3 && document.querySelector &&
              (dialog = cm.display.wrapper.querySelector(".CodeMirror-dialog")) &&
              dialog.getBoundingClientRect().bottom - 4 > cm.cursorCoords(to, "window").top)
            (hiding = dialog).style.opacity = .4
        })
      });
    } else {
      dialog(cm, queryDialog, "Search for:", q, function(query) {
        if (query && !state.query) cm.operation(function() {
          startSearch(cm, state, query);
          state.posFrom = state.posTo = cm.getCursor();
          findNext(cm, rev);
        });
      });
    }
  }

  function findNext(cm, rev, callback) {cm.operation(function() {
    var state = getSearchState(cm);
    var cursor = getSearchCursor(cm, state.query, rev ? state.posFrom : state.posTo);
    if (!cursor.find(rev)) {
      cursor = getSearchCursor(cm, state.query, rev ? CodeMirror.Pos(cm.lastLine()) : CodeMirror.Pos(cm.firstLine(), 0));
      if (!cursor.find(rev)) return;
    }
    cm.setSelection(cursor.from(), cursor.to());
    cm.scrollIntoView({from: cursor.from(), to: cursor.to()}, 20);
    state.posFrom = cursor.from(); state.posTo = cursor.to();
    if (callback) callback(cursor.from(), cursor.to())
  });}

  function clearSearch(cm) {cm.operation(function() {
    var state = getSearchState(cm);
    state.lastQuery = state.query;
    if (!state.query) return;
    state.query = state.queryText = null;
    cm.removeOverlay(state.overlay);
    if (state.annotate) { state.annotate.clear(); state.annotate = null; }
  });}

  var replaceQueryDialog =
    ' <input type="text" style="width: 10em" class="CodeMirror-search-field"/> <span style="color: #888" class="CodeMirror-search-hint">(Use /re/ syntax for regexp search)</span>';
  var replacementQueryDialog = 'With: <input type="text" style="width: 10em" class="CodeMirror-search-field"/>';
  var doReplaceConfirm = "Replace? <button>Yes</button> <button>No</button> <button>All</button> <button>Stop</button>";

  function replaceAll(cm, query, text) {
    cm.operation(function() {
      for (var cursor = getSearchCursor(cm, query); cursor.findNext();) {
        if (typeof query != "string") {
          var match = cm.getRange(cursor.from(), cursor.to()).match(query);
          cursor.replace(text.replace(/\$(\d)/g, function(_, i) {return match[i];}));
        } else cursor.replace(text);
      }
    });
  }

  function replace(cm, all) {
    if (cm.getOption("readOnly")) return;
    var query = cm.getSelection() || getSearchState(cm).lastQuery;
    var dialogText = all ? "Replace all:" : "Replace:"
    dialog(cm, dialogText + replaceQueryDialog, dialogText, query, function(query) {
      if (!query) return;
      query = parseQuery(query);
      dialog(cm, replacementQueryDialog, "Replace with:", "", function(text) {
        text = parseString(text)
        if (all) {
          replaceAll(cm, query, text)
        } else {
          clearSearch(cm);
          var cursor = getSearchCursor(cm, query, cm.getCursor());
          var advance = function() {
            var start = cursor.from(), match;
            if (!(match = cursor.findNext())) {
              cursor = getSearchCursor(cm, query);
              if (!(match = cursor.findNext()) ||
                  (start && cursor.from().line == start.line && cursor.from().ch == start.ch)) return;
            }
            cm.setSelection(cursor.from(), cursor.to());
            cm.scrollIntoView({from: cursor.from(), to: cursor.to()});
            confirmDialog(cm, doReplaceConfirm, "Replace?",
                          [function() {doReplace(match);}, advance,
                           function() {replaceAll(cm, query, text)}]);
          };
          var doReplace = function(match) {
            cursor.replace(typeof query == "string" ? text :
                           text.replace(/\$(\d)/g, function(_, i) {return match[i];}));
            advance();
          };
          advance();
        }
      });
    });
  }

  CodeMirror.commands.find = function(cm) {clearSearch(cm); doSearch(cm);};
  CodeMirror.commands.findPersistent = function(cm) {clearSearch(cm); doSearch(cm, false, true);};
  CodeMirror.commands.findNext = doSearch;
  CodeMirror.commands.findPrev = function(cm) {doSearch(cm, true);};
  CodeMirror.commands.clearSearch = clearSearch;
  CodeMirror.commands.replace = replace;
  CodeMirror.commands.replaceAll = function(cm) {replace(cm, true);};
});

},{"../../lib/codemirror":"C:\\ksana2015\\node_modules\\codemirror\\lib\\codemirror.js","../dialog/dialog":"C:\\ksana2015\\node_modules\\codemirror\\addon\\dialog\\dialog.js","./searchcursor":"C:\\ksana2015\\node_modules\\codemirror\\addon\\search\\searchcursor.js"}],"C:\\ksana2015\\node_modules\\codemirror\\addon\\search\\searchcursor.js":[function(require,module,exports){
// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";
  var Pos = CodeMirror.Pos;

  function SearchCursor(doc, query, pos, caseFold) {
    this.atOccurrence = false; this.doc = doc;
    if (caseFold == null && typeof query == "string") caseFold = false;

    pos = pos ? doc.clipPos(pos) : Pos(0, 0);
    this.pos = {from: pos, to: pos};

    // The matches method is filled in based on the type of query.
    // It takes a position and a direction, and returns an object
    // describing the next occurrence of the query, or null if no
    // more matches were found.
    if (typeof query != "string") { // Regexp match
      if (!query.global) query = new RegExp(query.source, query.ignoreCase ? "ig" : "g");
      this.matches = function(reverse, pos) {
        if (reverse) {
          query.lastIndex = 0;
          var line = doc.getLine(pos.line).slice(0, pos.ch), cutOff = 0, match, start;
          for (;;) {
            query.lastIndex = cutOff;
            var newMatch = query.exec(line);
            if (!newMatch) break;
            match = newMatch;
            start = match.index;
            cutOff = match.index + (match[0].length || 1);
            if (cutOff == line.length) break;
          }
          var matchLen = (match && match[0].length) || 0;
          if (!matchLen) {
            if (start == 0 && line.length == 0) {match = undefined;}
            else if (start != doc.getLine(pos.line).length) {
              matchLen++;
            }
          }
        } else {
          query.lastIndex = pos.ch;
          var line = doc.getLine(pos.line), match = query.exec(line);
          var matchLen = (match && match[0].length) || 0;
          var start = match && match.index;
          if (start + matchLen != line.length && !matchLen) matchLen = 1;
        }
        if (match && matchLen)
          return {from: Pos(pos.line, start),
                  to: Pos(pos.line, start + matchLen),
                  match: match};
      };
    } else { // String query
      var origQuery = query;
      if (caseFold) query = query.toLowerCase();
      var fold = caseFold ? function(str){return str.toLowerCase();} : function(str){return str;};
      var target = query.split("\n");
      // Different methods for single-line and multi-line queries
      if (target.length == 1) {
        if (!query.length) {
          // Empty string would match anything and never progress, so
          // we define it to match nothing instead.
          this.matches = function() {};
        } else {
          this.matches = function(reverse, pos) {
            if (reverse) {
              var orig = doc.getLine(pos.line).slice(0, pos.ch), line = fold(orig);
              var match = line.lastIndexOf(query);
              if (match > -1) {
                match = adjustPos(orig, line, match);
                return {from: Pos(pos.line, match), to: Pos(pos.line, match + origQuery.length)};
              }
             } else {
               var orig = doc.getLine(pos.line).slice(pos.ch), line = fold(orig);
               var match = line.indexOf(query);
               if (match > -1) {
                 match = adjustPos(orig, line, match) + pos.ch;
                 return {from: Pos(pos.line, match), to: Pos(pos.line, match + origQuery.length)};
               }
            }
          };
        }
      } else {
        var origTarget = origQuery.split("\n");
        this.matches = function(reverse, pos) {
          var last = target.length - 1;
          if (reverse) {
            if (pos.line - (target.length - 1) < doc.firstLine()) return;
            if (fold(doc.getLine(pos.line).slice(0, origTarget[last].length)) != target[target.length - 1]) return;
            var to = Pos(pos.line, origTarget[last].length);
            for (var ln = pos.line - 1, i = last - 1; i >= 1; --i, --ln)
              if (target[i] != fold(doc.getLine(ln))) return;
            var line = doc.getLine(ln), cut = line.length - origTarget[0].length;
            if (fold(line.slice(cut)) != target[0]) return;
            return {from: Pos(ln, cut), to: to};
          } else {
            if (pos.line + (target.length - 1) > doc.lastLine()) return;
            var line = doc.getLine(pos.line), cut = line.length - origTarget[0].length;
            if (fold(line.slice(cut)) != target[0]) return;
            var from = Pos(pos.line, cut);
            for (var ln = pos.line + 1, i = 1; i < last; ++i, ++ln)
              if (target[i] != fold(doc.getLine(ln))) return;
            if (fold(doc.getLine(ln).slice(0, origTarget[last].length)) != target[last]) return;
            return {from: from, to: Pos(ln, origTarget[last].length)};
          }
        };
      }
    }
  }

  SearchCursor.prototype = {
    findNext: function() {return this.find(false);},
    findPrevious: function() {return this.find(true);},

    find: function(reverse) {
      var self = this, pos = this.doc.clipPos(reverse ? this.pos.from : this.pos.to);
      function savePosAndFail(line) {
        var pos = Pos(line, 0);
        self.pos = {from: pos, to: pos};
        self.atOccurrence = false;
        return false;
      }

      for (;;) {
        if (this.pos = this.matches(reverse, pos)) {
          this.atOccurrence = true;
          return this.pos.match || true;
        }
        if (reverse) {
          if (!pos.line) return savePosAndFail(0);
          pos = Pos(pos.line-1, this.doc.getLine(pos.line-1).length);
        }
        else {
          var maxLine = this.doc.lineCount();
          if (pos.line == maxLine - 1) return savePosAndFail(maxLine);
          pos = Pos(pos.line + 1, 0);
        }
      }
    },

    from: function() {if (this.atOccurrence) return this.pos.from;},
    to: function() {if (this.atOccurrence) return this.pos.to;},

    replace: function(newText, origin) {
      if (!this.atOccurrence) return;
      var lines = CodeMirror.splitLines(newText);
      this.doc.replaceRange(lines, this.pos.from, this.pos.to, origin);
      this.pos.to = Pos(this.pos.from.line + lines.length - 1,
                        lines[lines.length - 1].length + (lines.length == 1 ? this.pos.from.ch : 0));
    }
  };

  // Maps a position in a case-folded line back to a position in the original line
  // (compensating for codepoints increasing in number during folding)
  function adjustPos(orig, folded, pos) {
    if (orig.length == folded.length) return pos;
    for (var pos1 = Math.min(pos, orig.length);;) {
      var len1 = orig.slice(0, pos1).toLowerCase().length;
      if (len1 < pos) ++pos1;
      else if (len1 > pos) --pos1;
      else return pos1;
    }
  }

  CodeMirror.defineExtension("getSearchCursor", function(query, pos, caseFold) {
    return new SearchCursor(this.doc, query, pos, caseFold);
  });
  CodeMirror.defineDocExtension("getSearchCursor", function(query, pos, caseFold) {
    return new SearchCursor(this, query, pos, caseFold);
  });

  CodeMirror.defineExtension("selectMatches", function(query, caseFold) {
    var ranges = [];
    var cur = this.getSearchCursor(query, this.getCursor("from"), caseFold);
    while (cur.findNext()) {
      if (CodeMirror.cmpPos(cur.to(), this.getCursor("to")) > 0) break;
      ranges.push({anchor: cur.from(), head: cur.to()});
    }
    if (ranges.length)
      this.setSelections(ranges, 0);
  });
});

},{"../../lib/codemirror":"C:\\ksana2015\\node_modules\\codemirror\\lib\\codemirror.js"}],"C:\\ksana2015\\node_modules\\codemirror\\addon\\selection\\active-line.js":[function(require,module,exports){
// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

// Because sometimes you need to style the cursor's line.
//
// Adds an option 'styleActiveLine' which, when enabled, gives the
// active line's wrapping <div> the CSS class "CodeMirror-activeline",
// and gives its background <div> the class "CodeMirror-activeline-background".

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";
  var WRAP_CLASS = "CodeMirror-activeline";
  var BACK_CLASS = "CodeMirror-activeline-background";

  CodeMirror.defineOption("styleActiveLine", false, function(cm, val, old) {
    var prev = old && old != CodeMirror.Init;
    if (val && !prev) {
      cm.state.activeLines = [];
      updateActiveLines(cm, cm.listSelections());
      cm.on("beforeSelectionChange", selectionChange);
    } else if (!val && prev) {
      cm.off("beforeSelectionChange", selectionChange);
      clearActiveLines(cm);
      delete cm.state.activeLines;
    }
  });

  function clearActiveLines(cm) {
    for (var i = 0; i < cm.state.activeLines.length; i++) {
      cm.removeLineClass(cm.state.activeLines[i], "wrap", WRAP_CLASS);
      cm.removeLineClass(cm.state.activeLines[i], "background", BACK_CLASS);
    }
  }

  function sameArray(a, b) {
    if (a.length != b.length) return false;
    for (var i = 0; i < a.length; i++)
      if (a[i] != b[i]) return false;
    return true;
  }

  function updateActiveLines(cm, ranges) {
    var active = [];
    for (var i = 0; i < ranges.length; i++) {
      var range = ranges[i];
      if (!range.empty()) continue;
      var line = cm.getLineHandleVisualStart(range.head.line);
      if (active[active.length - 1] != line) active.push(line);
    }
    if (sameArray(cm.state.activeLines, active)) return;
    cm.operation(function() {
      clearActiveLines(cm);
      for (var i = 0; i < active.length; i++) {
        cm.addLineClass(active[i], "wrap", WRAP_CLASS);
        cm.addLineClass(active[i], "background", BACK_CLASS);
      }
      cm.state.activeLines = active;
    });
  }

  function selectionChange(cm, sel) {
    updateActiveLines(cm, sel.ranges);
  }
});

},{"../../lib/codemirror":"C:\\ksana2015\\node_modules\\codemirror\\lib\\codemirror.js"}],"C:\\ksana2015\\node_modules\\codemirror\\lib\\codemirror.js":[function(require,module,exports){
// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

// This is CodeMirror (http://codemirror.net), a code editor
// implemented in JavaScript on top of the browser's DOM.
//
// You can find some technical background for some of the code below
// at http://marijnhaverbeke.nl/blog/#cm-internals .

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    module.exports = mod();
  else if (typeof define == "function" && define.amd) // AMD
    return define([], mod);
  else // Plain browser env
    this.CodeMirror = mod();
})(function() {
  "use strict";

  // BROWSER SNIFFING

  // Kludges for bugs and behavior differences that can't be feature
  // detected are enabled based on userAgent etc sniffing.

  var gecko = /gecko\/\d/i.test(navigator.userAgent);
  var ie_upto10 = /MSIE \d/.test(navigator.userAgent);
  var ie_11up = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
  var ie = ie_upto10 || ie_11up;
  var ie_version = ie && (ie_upto10 ? document.documentMode || 6 : ie_11up[1]);
  var webkit = /WebKit\//.test(navigator.userAgent);
  var qtwebkit = webkit && /Qt\/\d+\.\d+/.test(navigator.userAgent);
  var chrome = /Chrome\//.test(navigator.userAgent);
  var presto = /Opera\//.test(navigator.userAgent);
  var safari = /Apple Computer/.test(navigator.vendor);
  var mac_geMountainLion = /Mac OS X 1\d\D([8-9]|\d\d)\D/.test(navigator.userAgent);
  var phantom = /PhantomJS/.test(navigator.userAgent);

  var ios = /AppleWebKit/.test(navigator.userAgent) && /Mobile\/\w+/.test(navigator.userAgent);
  // This is woefully incomplete. Suggestions for alternative methods welcome.
  var mobile = ios || /Android|webOS|BlackBerry|Opera Mini|Opera Mobi|IEMobile/i.test(navigator.userAgent);
  var mac = ios || /Mac/.test(navigator.platform);
  var windows = /win/i.test(navigator.platform);

  var presto_version = presto && navigator.userAgent.match(/Version\/(\d*\.\d*)/);
  if (presto_version) presto_version = Number(presto_version[1]);
  if (presto_version && presto_version >= 15) { presto = false; webkit = true; }
  // Some browsers use the wrong event properties to signal cmd/ctrl on OS X
  var flipCtrlCmd = mac && (qtwebkit || presto && (presto_version == null || presto_version < 12.11));
  var captureRightClick = gecko || (ie && ie_version >= 9);

  // Optimize some code when these features are not used.
  var sawReadOnlySpans = false, sawCollapsedSpans = false;

  // EDITOR CONSTRUCTOR

  // A CodeMirror instance represents an editor. This is the object
  // that user code is usually dealing with.

  function CodeMirror(place, options) {
    if (!(this instanceof CodeMirror)) return new CodeMirror(place, options);

    this.options = options = options ? copyObj(options) : {};
    // Determine effective options based on given values and defaults.
    copyObj(defaults, options, false);
    setGuttersForLineNumbers(options);

    var doc = options.value;
    if (typeof doc == "string") doc = new Doc(doc, options.mode, null, options.lineSeparator);
    this.doc = doc;

    var input = new CodeMirror.inputStyles[options.inputStyle](this);
    var display = this.display = new Display(place, doc, input);
    display.wrapper.CodeMirror = this;
    updateGutters(this);
    themeChanged(this);
    if (options.lineWrapping)
      this.display.wrapper.className += " CodeMirror-wrap";
    if (options.autofocus && !mobile) display.input.focus();
    initScrollbars(this);

    this.state = {
      keyMaps: [],  // stores maps added by addKeyMap
      overlays: [], // highlighting overlays, as added by addOverlay
      modeGen: 0,   // bumped when mode/overlay changes, used to invalidate highlighting info
      overwrite: false,
      delayingBlurEvent: false,
      focused: false,
      suppressEdits: false, // used to disable editing during key handlers when in readOnly mode
      pasteIncoming: false, cutIncoming: false, // help recognize paste/cut edits in input.poll
      selectingText: false,
      draggingText: false,
      highlight: new Delayed(), // stores highlight worker timeout
      keySeq: null,  // Unfinished key sequence
      specialChars: null
    };

    var cm = this;

    // Override magic textarea content restore that IE sometimes does
    // on our hidden textarea on reload
    if (ie && ie_version < 11) setTimeout(function() { cm.display.input.reset(true); }, 20);

    registerEventHandlers(this);
    ensureGlobalHandlers();

    startOperation(this);
    this.curOp.forceUpdate = true;
    attachDoc(this, doc);

    if ((options.autofocus && !mobile) || cm.hasFocus())
      setTimeout(bind(onFocus, this), 20);
    else
      onBlur(this);

    for (var opt in optionHandlers) if (optionHandlers.hasOwnProperty(opt))
      optionHandlers[opt](this, options[opt], Init);
    maybeUpdateLineNumberWidth(this);
    if (options.finishInit) options.finishInit(this);
    for (var i = 0; i < initHooks.length; ++i) initHooks[i](this);
    endOperation(this);
    // Suppress optimizelegibility in Webkit, since it breaks text
    // measuring on line wrapping boundaries.
    if (webkit && options.lineWrapping &&
        getComputedStyle(display.lineDiv).textRendering == "optimizelegibility")
      display.lineDiv.style.textRendering = "auto";
  }

  // DISPLAY CONSTRUCTOR

  // The display handles the DOM integration, both for input reading
  // and content drawing. It holds references to DOM nodes and
  // display-related state.

  function Display(place, doc, input) {
    var d = this;
    this.input = input;

    // Covers bottom-right square when both scrollbars are present.
    d.scrollbarFiller = elt("div", null, "CodeMirror-scrollbar-filler");
    d.scrollbarFiller.setAttribute("cm-not-content", "true");
    // Covers bottom of gutter when coverGutterNextToScrollbar is on
    // and h scrollbar is present.
    d.gutterFiller = elt("div", null, "CodeMirror-gutter-filler");
    d.gutterFiller.setAttribute("cm-not-content", "true");
    // Will contain the actual code, positioned to cover the viewport.
    d.lineDiv = elt("div", null, "CodeMirror-code");
    // Elements are added to these to represent selection and cursors.
    d.selectionDiv = elt("div", null, null, "position: relative; z-index: 1");
    d.cursorDiv = elt("div", null, "CodeMirror-cursors");
    // A visibility: hidden element used to find the size of things.
    d.measure = elt("div", null, "CodeMirror-measure");
    // When lines outside of the viewport are measured, they are drawn in this.
    d.lineMeasure = elt("div", null, "CodeMirror-measure");
    // Wraps everything that needs to exist inside the vertically-padded coordinate system
    d.lineSpace = elt("div", [d.measure, d.lineMeasure, d.selectionDiv, d.cursorDiv, d.lineDiv],
                      null, "position: relative; outline: none");
    // Moved around its parent to cover visible view.
    d.mover = elt("div", [elt("div", [d.lineSpace], "CodeMirror-lines")], null, "position: relative");
    // Set to the height of the document, allowing scrolling.
    d.sizer = elt("div", [d.mover], "CodeMirror-sizer");
    d.sizerWidth = null;
    // Behavior of elts with overflow: auto and padding is
    // inconsistent across browsers. This is used to ensure the
    // scrollable area is big enough.
    d.heightForcer = elt("div", null, null, "position: absolute; height: " + scrollerGap + "px; width: 1px;");
    // Will contain the gutters, if any.
    d.gutters = elt("div", null, "CodeMirror-gutters");
    d.lineGutter = null;
    // Actual scrollable element.
    d.scroller = elt("div", [d.sizer, d.heightForcer, d.gutters], "CodeMirror-scroll");
    d.scroller.setAttribute("tabIndex", "-1");
    // The element in which the editor lives.
    d.wrapper = elt("div", [d.scrollbarFiller, d.gutterFiller, d.scroller], "CodeMirror");

    // Work around IE7 z-index bug (not perfect, hence IE7 not really being supported)
    if (ie && ie_version < 8) { d.gutters.style.zIndex = -1; d.scroller.style.paddingRight = 0; }
    if (!webkit && !(gecko && mobile)) d.scroller.draggable = true;

    if (place) {
      if (place.appendChild) place.appendChild(d.wrapper);
      else place(d.wrapper);
    }

    // Current rendered range (may be bigger than the view window).
    d.viewFrom = d.viewTo = doc.first;
    d.reportedViewFrom = d.reportedViewTo = doc.first;
    // Information about the rendered lines.
    d.view = [];
    d.renderedView = null;
    // Holds info about a single rendered line when it was rendered
    // for measurement, while not in view.
    d.externalMeasured = null;
    // Empty space (in pixels) above the view
    d.viewOffset = 0;
    d.lastWrapHeight = d.lastWrapWidth = 0;
    d.updateLineNumbers = null;

    d.nativeBarWidth = d.barHeight = d.barWidth = 0;
    d.scrollbarsClipped = false;

    // Used to only resize the line number gutter when necessary (when
    // the amount of lines crosses a boundary that makes its width change)
    d.lineNumWidth = d.lineNumInnerWidth = d.lineNumChars = null;
    // Set to true when a non-horizontal-scrolling line widget is
    // added. As an optimization, line widget aligning is skipped when
    // this is false.
    d.alignWidgets = false;

    d.cachedCharWidth = d.cachedTextHeight = d.cachedPaddingH = null;

    // Tracks the maximum line length so that the horizontal scrollbar
    // can be kept static when scrolling.
    d.maxLine = null;
    d.maxLineLength = 0;
    d.maxLineChanged = false;

    // Used for measuring wheel scrolling granularity
    d.wheelDX = d.wheelDY = d.wheelStartX = d.wheelStartY = null;

    // True when shift is held down.
    d.shift = false;

    // Used to track whether anything happened since the context menu
    // was opened.
    d.selForContextMenu = null;

    d.activeTouch = null;

    input.init(d);
  }

  // STATE UPDATES

  // Used to get the editor into a consistent state again when options change.

  function loadMode(cm) {
    cm.doc.mode = CodeMirror.getMode(cm.options, cm.doc.modeOption);
    resetModeState(cm);
  }

  function resetModeState(cm) {
    cm.doc.iter(function(line) {
      if (line.stateAfter) line.stateAfter = null;
      if (line.styles) line.styles = null;
    });
    cm.doc.frontier = cm.doc.first;
    startWorker(cm, 100);
    cm.state.modeGen++;
    if (cm.curOp) regChange(cm);
  }

  function wrappingChanged(cm) {
    if (cm.options.lineWrapping) {
      addClass(cm.display.wrapper, "CodeMirror-wrap");
      cm.display.sizer.style.minWidth = "";
      cm.display.sizerWidth = null;
    } else {
      rmClass(cm.display.wrapper, "CodeMirror-wrap");
      findMaxLine(cm);
    }
    estimateLineHeights(cm);
    regChange(cm);
    clearCaches(cm);
    setTimeout(function(){updateScrollbars(cm);}, 100);
  }

  // Returns a function that estimates the height of a line, to use as
  // first approximation until the line becomes visible (and is thus
  // properly measurable).
  function estimateHeight(cm) {
    var th = textHeight(cm.display), wrapping = cm.options.lineWrapping;
    var perLine = wrapping && Math.max(5, cm.display.scroller.clientWidth / charWidth(cm.display) - 3);
    return function(line) {
      if (lineIsHidden(cm.doc, line)) return 0;

      var widgetsHeight = 0;
      if (line.widgets) for (var i = 0; i < line.widgets.length; i++) {
        if (line.widgets[i].height) widgetsHeight += line.widgets[i].height;
      }

      if (wrapping)
        return widgetsHeight + (Math.ceil(line.text.length / perLine) || 1) * th;
      else
        return widgetsHeight + th;
    };
  }

  function estimateLineHeights(cm) {
    var doc = cm.doc, est = estimateHeight(cm);
    doc.iter(function(line) {
      var estHeight = est(line);
      if (estHeight != line.height) updateLineHeight(line, estHeight);
    });
  }

  function themeChanged(cm) {
    cm.display.wrapper.className = cm.display.wrapper.className.replace(/\s*cm-s-\S+/g, "") +
      cm.options.theme.replace(/(^|\s)\s*/g, " cm-s-");
    clearCaches(cm);
  }

  function guttersChanged(cm) {
    updateGutters(cm);
    regChange(cm);
    setTimeout(function(){alignHorizontally(cm);}, 20);
  }

  // Rebuild the gutter elements, ensure the margin to the left of the
  // code matches their width.
  function updateGutters(cm) {
    var gutters = cm.display.gutters, specs = cm.options.gutters;
    removeChildren(gutters);
    for (var i = 0; i < specs.length; ++i) {
      var gutterClass = specs[i];
      var gElt = gutters.appendChild(elt("div", null, "CodeMirror-gutter " + gutterClass));
      if (gutterClass == "CodeMirror-linenumbers") {
        cm.display.lineGutter = gElt;
        gElt.style.width = (cm.display.lineNumWidth || 1) + "px";
      }
    }
    gutters.style.display = i ? "" : "none";
    updateGutterSpace(cm);
  }

  function updateGutterSpace(cm) {
    var width = cm.display.gutters.offsetWidth;
    cm.display.sizer.style.marginLeft = width + "px";
  }

  // Compute the character length of a line, taking into account
  // collapsed ranges (see markText) that might hide parts, and join
  // other lines onto it.
  function lineLength(line) {
    if (line.height == 0) return 0;
    var len = line.text.length, merged, cur = line;
    while (merged = collapsedSpanAtStart(cur)) {
      var found = merged.find(0, true);
      cur = found.from.line;
      len += found.from.ch - found.to.ch;
    }
    cur = line;
    while (merged = collapsedSpanAtEnd(cur)) {
      var found = merged.find(0, true);
      len -= cur.text.length - found.from.ch;
      cur = found.to.line;
      len += cur.text.length - found.to.ch;
    }
    return len;
  }

  // Find the longest line in the document.
  function findMaxLine(cm) {
    var d = cm.display, doc = cm.doc;
    d.maxLine = getLine(doc, doc.first);
    d.maxLineLength = lineLength(d.maxLine);
    d.maxLineChanged = true;
    doc.iter(function(line) {
      var len = lineLength(line);
      if (len > d.maxLineLength) {
        d.maxLineLength = len;
        d.maxLine = line;
      }
    });
  }

  // Make sure the gutters options contains the element
  // "CodeMirror-linenumbers" when the lineNumbers option is true.
  function setGuttersForLineNumbers(options) {
    var found = indexOf(options.gutters, "CodeMirror-linenumbers");
    if (found == -1 && options.lineNumbers) {
      options.gutters = options.gutters.concat(["CodeMirror-linenumbers"]);
    } else if (found > -1 && !options.lineNumbers) {
      options.gutters = options.gutters.slice(0);
      options.gutters.splice(found, 1);
    }
  }

  // SCROLLBARS

  // Prepare DOM reads needed to update the scrollbars. Done in one
  // shot to minimize update/measure roundtrips.
  function measureForScrollbars(cm) {
    var d = cm.display, gutterW = d.gutters.offsetWidth;
    var docH = Math.round(cm.doc.height + paddingVert(cm.display));
    return {
      clientHeight: d.scroller.clientHeight,
      viewHeight: d.wrapper.clientHeight,
      scrollWidth: d.scroller.scrollWidth, clientWidth: d.scroller.clientWidth,
      viewWidth: d.wrapper.clientWidth,
      barLeft: cm.options.fixedGutter ? gutterW : 0,
      docHeight: docH,
      scrollHeight: docH + scrollGap(cm) + d.barHeight,
      nativeBarWidth: d.nativeBarWidth,
      gutterWidth: gutterW
    };
  }

  function NativeScrollbars(place, scroll, cm) {
    this.cm = cm;
    var vert = this.vert = elt("div", [elt("div", null, null, "min-width: 1px")], "CodeMirror-vscrollbar");
    var horiz = this.horiz = elt("div", [elt("div", null, null, "height: 100%; min-height: 1px")], "CodeMirror-hscrollbar");
    place(vert); place(horiz);

    on(vert, "scroll", function() {
      if (vert.clientHeight) scroll(vert.scrollTop, "vertical");
    });
    on(horiz, "scroll", function() {
      if (horiz.clientWidth) scroll(horiz.scrollLeft, "horizontal");
    });

    this.checkedOverlay = false;
    // Need to set a minimum width to see the scrollbar on IE7 (but must not set it on IE8).
    if (ie && ie_version < 8) this.horiz.style.minHeight = this.vert.style.minWidth = "18px";
  }

  NativeScrollbars.prototype = copyObj({
    update: function(measure) {
      var needsH = measure.scrollWidth > measure.clientWidth + 1;
      var needsV = measure.scrollHeight > measure.clientHeight + 1;
      var sWidth = measure.nativeBarWidth;

      if (needsV) {
        this.vert.style.display = "block";
        this.vert.style.bottom = needsH ? sWidth + "px" : "0";
        var totalHeight = measure.viewHeight - (needsH ? sWidth : 0);
        // A bug in IE8 can cause this value to be negative, so guard it.
        this.vert.firstChild.style.height =
          Math.max(0, measure.scrollHeight - measure.clientHeight + totalHeight) + "px";
      } else {
        this.vert.style.display = "";
        this.vert.firstChild.style.height = "0";
      }

      if (needsH) {
        this.horiz.style.display = "block";
        this.horiz.style.right = needsV ? sWidth + "px" : "0";
        this.horiz.style.left = measure.barLeft + "px";
        var totalWidth = measure.viewWidth - measure.barLeft - (needsV ? sWidth : 0);
        this.horiz.firstChild.style.width =
          (measure.scrollWidth - measure.clientWidth + totalWidth) + "px";
      } else {
        this.horiz.style.display = "";
        this.horiz.firstChild.style.width = "0";
      }

      if (!this.checkedOverlay && measure.clientHeight > 0) {
        if (sWidth == 0) this.overlayHack();
        this.checkedOverlay = true;
      }

      return {right: needsV ? sWidth : 0, bottom: needsH ? sWidth : 0};
    },
    setScrollLeft: function(pos) {
      if (this.horiz.scrollLeft != pos) this.horiz.scrollLeft = pos;
    },
    setScrollTop: function(pos) {
      if (this.vert.scrollTop != pos) this.vert.scrollTop = pos;
    },
    overlayHack: function() {
      var w = mac && !mac_geMountainLion ? "12px" : "18px";
      this.horiz.style.minHeight = this.vert.style.minWidth = w;
      var self = this;
      var barMouseDown = function(e) {
        if (e_target(e) != self.vert && e_target(e) != self.horiz)
          operation(self.cm, onMouseDown)(e);
      };
      on(this.vert, "mousedown", barMouseDown);
      on(this.horiz, "mousedown", barMouseDown);
    },
    clear: function() {
      var parent = this.horiz.parentNode;
      parent.removeChild(this.horiz);
      parent.removeChild(this.vert);
    }
  }, NativeScrollbars.prototype);

  function NullScrollbars() {}

  NullScrollbars.prototype = copyObj({
    update: function() { return {bottom: 0, right: 0}; },
    setScrollLeft: function() {},
    setScrollTop: function() {},
    clear: function() {}
  }, NullScrollbars.prototype);

  CodeMirror.scrollbarModel = {"native": NativeScrollbars, "null": NullScrollbars};

  function initScrollbars(cm) {
    if (cm.display.scrollbars) {
      cm.display.scrollbars.clear();
      if (cm.display.scrollbars.addClass)
        rmClass(cm.display.wrapper, cm.display.scrollbars.addClass);
    }

    cm.display.scrollbars = new CodeMirror.scrollbarModel[cm.options.scrollbarStyle](function(node) {
      cm.display.wrapper.insertBefore(node, cm.display.scrollbarFiller);
      // Prevent clicks in the scrollbars from killing focus
      on(node, "mousedown", function() {
        if (cm.state.focused) setTimeout(function() { cm.display.input.focus(); }, 0);
      });
      node.setAttribute("cm-not-content", "true");
    }, function(pos, axis) {
      if (axis == "horizontal") setScrollLeft(cm, pos);
      else setScrollTop(cm, pos);
    }, cm);
    if (cm.display.scrollbars.addClass)
      addClass(cm.display.wrapper, cm.display.scrollbars.addClass);
  }

  function updateScrollbars(cm, measure) {
    if (!measure) measure = measureForScrollbars(cm);
    var startWidth = cm.display.barWidth, startHeight = cm.display.barHeight;
    updateScrollbarsInner(cm, measure);
    for (var i = 0; i < 4 && startWidth != cm.display.barWidth || startHeight != cm.display.barHeight; i++) {
      if (startWidth != cm.display.barWidth && cm.options.lineWrapping)
        updateHeightsInViewport(cm);
      updateScrollbarsInner(cm, measureForScrollbars(cm));
      startWidth = cm.display.barWidth; startHeight = cm.display.barHeight;
    }
  }

  // Re-synchronize the fake scrollbars with the actual size of the
  // content.
  function updateScrollbarsInner(cm, measure) {
    var d = cm.display;
    var sizes = d.scrollbars.update(measure);

    d.sizer.style.paddingRight = (d.barWidth = sizes.right) + "px";
    d.sizer.style.paddingBottom = (d.barHeight = sizes.bottom) + "px";

    if (sizes.right && sizes.bottom) {
      d.scrollbarFiller.style.display = "block";
      d.scrollbarFiller.style.height = sizes.bottom + "px";
      d.scrollbarFiller.style.width = sizes.right + "px";
    } else d.scrollbarFiller.style.display = "";
    if (sizes.bottom && cm.options.coverGutterNextToScrollbar && cm.options.fixedGutter) {
      d.gutterFiller.style.display = "block";
      d.gutterFiller.style.height = sizes.bottom + "px";
      d.gutterFiller.style.width = measure.gutterWidth + "px";
    } else d.gutterFiller.style.display = "";
  }

  // Compute the lines that are visible in a given viewport (defaults
  // the the current scroll position). viewport may contain top,
  // height, and ensure (see op.scrollToPos) properties.
  function visibleLines(display, doc, viewport) {
    var top = viewport && viewport.top != null ? Math.max(0, viewport.top) : display.scroller.scrollTop;
    top = Math.floor(top - paddingTop(display));
    var bottom = viewport && viewport.bottom != null ? viewport.bottom : top + display.wrapper.clientHeight;

    var from = lineAtHeight(doc, top), to = lineAtHeight(doc, bottom);
    // Ensure is a {from: {line, ch}, to: {line, ch}} object, and
    // forces those lines into the viewport (if possible).
    if (viewport && viewport.ensure) {
      var ensureFrom = viewport.ensure.from.line, ensureTo = viewport.ensure.to.line;
      if (ensureFrom < from) {
        from = ensureFrom;
        to = lineAtHeight(doc, heightAtLine(getLine(doc, ensureFrom)) + display.wrapper.clientHeight);
      } else if (Math.min(ensureTo, doc.lastLine()) >= to) {
        from = lineAtHeight(doc, heightAtLine(getLine(doc, ensureTo)) - display.wrapper.clientHeight);
        to = ensureTo;
      }
    }
    return {from: from, to: Math.max(to, from + 1)};
  }

  // LINE NUMBERS

  // Re-align line numbers and gutter marks to compensate for
  // horizontal scrolling.
  function alignHorizontally(cm) {
    var display = cm.display, view = display.view;
    if (!display.alignWidgets && (!display.gutters.firstChild || !cm.options.fixedGutter)) return;
    var comp = compensateForHScroll(display) - display.scroller.scrollLeft + cm.doc.scrollLeft;
    var gutterW = display.gutters.offsetWidth, left = comp + "px";
    for (var i = 0; i < view.length; i++) if (!view[i].hidden) {
      if (cm.options.fixedGutter && view[i].gutter)
        view[i].gutter.style.left = left;
      var align = view[i].alignable;
      if (align) for (var j = 0; j < align.length; j++)
        align[j].style.left = left;
    }
    if (cm.options.fixedGutter)
      display.gutters.style.left = (comp + gutterW) + "px";
  }

  // Used to ensure that the line number gutter is still the right
  // size for the current document size. Returns true when an update
  // is needed.
  function maybeUpdateLineNumberWidth(cm) {
    if (!cm.options.lineNumbers) return false;
    var doc = cm.doc, last = lineNumberFor(cm.options, doc.first + doc.size - 1), display = cm.display;
    if (last.length != display.lineNumChars) {
      var test = display.measure.appendChild(elt("div", [elt("div", last)],
                                                 "CodeMirror-linenumber CodeMirror-gutter-elt"));
      var innerW = test.firstChild.offsetWidth, padding = test.offsetWidth - innerW;
      display.lineGutter.style.width = "";
      display.lineNumInnerWidth = Math.max(innerW, display.lineGutter.offsetWidth - padding) + 1;
      display.lineNumWidth = display.lineNumInnerWidth + padding;
      display.lineNumChars = display.lineNumInnerWidth ? last.length : -1;
      display.lineGutter.style.width = display.lineNumWidth + "px";
      updateGutterSpace(cm);
      return true;
    }
    return false;
  }

  function lineNumberFor(options, i) {
    return String(options.lineNumberFormatter(i + options.firstLineNumber));
  }

  // Computes display.scroller.scrollLeft + display.gutters.offsetWidth,
  // but using getBoundingClientRect to get a sub-pixel-accurate
  // result.
  function compensateForHScroll(display) {
    return display.scroller.getBoundingClientRect().left - display.sizer.getBoundingClientRect().left;
  }

  // DISPLAY DRAWING

  function DisplayUpdate(cm, viewport, force) {
    var display = cm.display;

    this.viewport = viewport;
    // Store some values that we'll need later (but don't want to force a relayout for)
    this.visible = visibleLines(display, cm.doc, viewport);
    this.editorIsHidden = !display.wrapper.offsetWidth;
    this.wrapperHeight = display.wrapper.clientHeight;
    this.wrapperWidth = display.wrapper.clientWidth;
    this.oldDisplayWidth = displayWidth(cm);
    this.force = force;
    this.dims = getDimensions(cm);
    this.events = [];
  }

  DisplayUpdate.prototype.signal = function(emitter, type) {
    if (hasHandler(emitter, type))
      this.events.push(arguments);
  };
  DisplayUpdate.prototype.finish = function() {
    for (var i = 0; i < this.events.length; i++)
      signal.apply(null, this.events[i]);
  };

  function maybeClipScrollbars(cm) {
    var display = cm.display;
    if (!display.scrollbarsClipped && display.scroller.offsetWidth) {
      display.nativeBarWidth = display.scroller.offsetWidth - display.scroller.clientWidth;
      display.heightForcer.style.height = scrollGap(cm) + "px";
      display.sizer.style.marginBottom = -display.nativeBarWidth + "px";
      display.sizer.style.borderRightWidth = scrollGap(cm) + "px";
      display.scrollbarsClipped = true;
    }
  }

  // Does the actual updating of the line display. Bails out
  // (returning false) when there is nothing to be done and forced is
  // false.
  function updateDisplayIfNeeded(cm, update) {
    var display = cm.display, doc = cm.doc;

    if (update.editorIsHidden) {
      resetView(cm);
      return false;
    }

    // Bail out if the visible area is already rendered and nothing changed.
    if (!update.force &&
        update.visible.from >= display.viewFrom && update.visible.to <= display.viewTo &&
        (display.updateLineNumbers == null || display.updateLineNumbers >= display.viewTo) &&
        display.renderedView == display.view && countDirtyView(cm) == 0)
      return false;

    if (maybeUpdateLineNumberWidth(cm)) {
      resetView(cm);
      update.dims = getDimensions(cm);
    }

    // Compute a suitable new viewport (from & to)
    var end = doc.first + doc.size;
    var from = Math.max(update.visible.from - cm.options.viewportMargin, doc.first);
    var to = Math.min(end, update.visible.to + cm.options.viewportMargin);
    if (display.viewFrom < from && from - display.viewFrom < 20) from = Math.max(doc.first, display.viewFrom);
    if (display.viewTo > to && display.viewTo - to < 20) to = Math.min(end, display.viewTo);
    if (sawCollapsedSpans) {
      from = visualLineNo(cm.doc, from);
      to = visualLineEndNo(cm.doc, to);
    }

    var different = from != display.viewFrom || to != display.viewTo ||
      display.lastWrapHeight != update.wrapperHeight || display.lastWrapWidth != update.wrapperWidth;
    adjustView(cm, from, to);

    display.viewOffset = heightAtLine(getLine(cm.doc, display.viewFrom));
    // Position the mover div to align with the current scroll position
    cm.display.mover.style.top = display.viewOffset + "px";

    var toUpdate = countDirtyView(cm);
    if (!different && toUpdate == 0 && !update.force && display.renderedView == display.view &&
        (display.updateLineNumbers == null || display.updateLineNumbers >= display.viewTo))
      return false;

    // For big changes, we hide the enclosing element during the
    // update, since that speeds up the operations on most browsers.
    var focused = activeElt();
    if (toUpdate > 4) display.lineDiv.style.display = "none";
    patchDisplay(cm, display.updateLineNumbers, update.dims);
    if (toUpdate > 4) display.lineDiv.style.display = "";
    display.renderedView = display.view;
    // There might have been a widget with a focused element that got
    // hidden or updated, if so re-focus it.
    if (focused && activeElt() != focused && focused.offsetHeight) focused.focus();

    // Prevent selection and cursors from interfering with the scroll
    // width and height.
    removeChildren(display.cursorDiv);
    removeChildren(display.selectionDiv);
    display.gutters.style.height = display.sizer.style.minHeight = 0;

    if (different) {
      display.lastWrapHeight = update.wrapperHeight;
      display.lastWrapWidth = update.wrapperWidth;
      startWorker(cm, 400);
    }

    display.updateLineNumbers = null;

    return true;
  }

  function postUpdateDisplay(cm, update) {
    var viewport = update.viewport;
    for (var first = true;; first = false) {
      if (!first || !cm.options.lineWrapping || update.oldDisplayWidth == displayWidth(cm)) {
        // Clip forced viewport to actual scrollable area.
        if (viewport && viewport.top != null)
          viewport = {top: Math.min(cm.doc.height + paddingVert(cm.display) - displayHeight(cm), viewport.top)};
        // Updated line heights might result in the drawn area not
        // actually covering the viewport. Keep looping until it does.
        update.visible = visibleLines(cm.display, cm.doc, viewport);
        if (update.visible.from >= cm.display.viewFrom && update.visible.to <= cm.display.viewTo)
          break;
      }
      if (!updateDisplayIfNeeded(cm, update)) break;
      updateHeightsInViewport(cm);
      var barMeasure = measureForScrollbars(cm);
      updateSelection(cm);
      setDocumentHeight(cm, barMeasure);
      updateScrollbars(cm, barMeasure);
    }

    update.signal(cm, "update", cm);
    if (cm.display.viewFrom != cm.display.reportedViewFrom || cm.display.viewTo != cm.display.reportedViewTo) {
      update.signal(cm, "viewportChange", cm, cm.display.viewFrom, cm.display.viewTo);
      cm.display.reportedViewFrom = cm.display.viewFrom; cm.display.reportedViewTo = cm.display.viewTo;
    }
  }

  function updateDisplaySimple(cm, viewport) {
    var update = new DisplayUpdate(cm, viewport);
    if (updateDisplayIfNeeded(cm, update)) {
      updateHeightsInViewport(cm);
      postUpdateDisplay(cm, update);
      var barMeasure = measureForScrollbars(cm);
      updateSelection(cm);
      setDocumentHeight(cm, barMeasure);
      updateScrollbars(cm, barMeasure);
      update.finish();
    }
  }

  function setDocumentHeight(cm, measure) {
    cm.display.sizer.style.minHeight = measure.docHeight + "px";
    var total = measure.docHeight + cm.display.barHeight;
    cm.display.heightForcer.style.top = total + "px";
    cm.display.gutters.style.height = Math.max(total + scrollGap(cm), measure.clientHeight) + "px";
  }

  // Read the actual heights of the rendered lines, and update their
  // stored heights to match.
  function updateHeightsInViewport(cm) {
    var display = cm.display;
    var prevBottom = display.lineDiv.offsetTop;
    for (var i = 0; i < display.view.length; i++) {
      var cur = display.view[i], height;
      if (cur.hidden) continue;
      if (ie && ie_version < 8) {
        var bot = cur.node.offsetTop + cur.node.offsetHeight;
        height = bot - prevBottom;
        prevBottom = bot;
      } else {
        var box = cur.node.getBoundingClientRect();
        height = box.bottom - box.top;
      }
      var diff = cur.line.height - height;
      if (height < 2) height = textHeight(display);
      if (diff > .001 || diff < -.001) {
        updateLineHeight(cur.line, height);
        updateWidgetHeight(cur.line);
        if (cur.rest) for (var j = 0; j < cur.rest.length; j++)
          updateWidgetHeight(cur.rest[j]);
      }
    }
  }

  // Read and store the height of line widgets associated with the
  // given line.
  function updateWidgetHeight(line) {
    if (line.widgets) for (var i = 0; i < line.widgets.length; ++i)
      line.widgets[i].height = line.widgets[i].node.offsetHeight;
  }

  // Do a bulk-read of the DOM positions and sizes needed to draw the
  // view, so that we don't interleave reading and writing to the DOM.
  function getDimensions(cm) {
    var d = cm.display, left = {}, width = {};
    var gutterLeft = d.gutters.clientLeft;
    for (var n = d.gutters.firstChild, i = 0; n; n = n.nextSibling, ++i) {
      left[cm.options.gutters[i]] = n.offsetLeft + n.clientLeft + gutterLeft;
      width[cm.options.gutters[i]] = n.clientWidth;
    }
    return {fixedPos: compensateForHScroll(d),
            gutterTotalWidth: d.gutters.offsetWidth,
            gutterLeft: left,
            gutterWidth: width,
            wrapperWidth: d.wrapper.clientWidth};
  }

  // Sync the actual display DOM structure with display.view, removing
  // nodes for lines that are no longer in view, and creating the ones
  // that are not there yet, and updating the ones that are out of
  // date.
  function patchDisplay(cm, updateNumbersFrom, dims) {
    var display = cm.display, lineNumbers = cm.options.lineNumbers;
    var container = display.lineDiv, cur = container.firstChild;

    function rm(node) {
      var next = node.nextSibling;
      // Works around a throw-scroll bug in OS X Webkit
      if (webkit && mac && cm.display.currentWheelTarget == node)
        node.style.display = "none";
      else
        node.parentNode.removeChild(node);
      return next;
    }

    var view = display.view, lineN = display.viewFrom;
    // Loop over the elements in the view, syncing cur (the DOM nodes
    // in display.lineDiv) with the view as we go.
    for (var i = 0; i < view.length; i++) {
      var lineView = view[i];
      if (lineView.hidden) {
      } else if (!lineView.node || lineView.node.parentNode != container) { // Not drawn yet
        var node = buildLineElement(cm, lineView, lineN, dims);
        container.insertBefore(node, cur);
      } else { // Already drawn
        while (cur != lineView.node) cur = rm(cur);
        var updateNumber = lineNumbers && updateNumbersFrom != null &&
          updateNumbersFrom <= lineN && lineView.lineNumber;
        if (lineView.changes) {
          if (indexOf(lineView.changes, "gutter") > -1) updateNumber = false;
          updateLineForChanges(cm, lineView, lineN, dims);
        }
        if (updateNumber) {
          removeChildren(lineView.lineNumber);
          lineView.lineNumber.appendChild(document.createTextNode(lineNumberFor(cm.options, lineN)));
        }
        cur = lineView.node.nextSibling;
      }
      lineN += lineView.size;
    }
    while (cur) cur = rm(cur);
  }

  // When an aspect of a line changes, a string is added to
  // lineView.changes. This updates the relevant part of the line's
  // DOM structure.
  function updateLineForChanges(cm, lineView, lineN, dims) {
    for (var j = 0; j < lineView.changes.length; j++) {
      var type = lineView.changes[j];
      if (type == "text") updateLineText(cm, lineView);
      else if (type == "gutter") updateLineGutter(cm, lineView, lineN, dims);
      else if (type == "class") updateLineClasses(lineView);
      else if (type == "widget") updateLineWidgets(cm, lineView, dims);
    }
    lineView.changes = null;
  }

  // Lines with gutter elements, widgets or a background class need to
  // be wrapped, and have the extra elements added to the wrapper div
  function ensureLineWrapped(lineView) {
    if (lineView.node == lineView.text) {
      lineView.node = elt("div", null, null, "position: relative");
      if (lineView.text.parentNode)
        lineView.text.parentNode.replaceChild(lineView.node, lineView.text);
      lineView.node.appendChild(lineView.text);
      if (ie && ie_version < 8) lineView.node.style.zIndex = 2;
    }
    return lineView.node;
  }

  function updateLineBackground(lineView) {
    var cls = lineView.bgClass ? lineView.bgClass + " " + (lineView.line.bgClass || "") : lineView.line.bgClass;
    if (cls) cls += " CodeMirror-linebackground";
    if (lineView.background) {
      if (cls) lineView.background.className = cls;
      else { lineView.background.parentNode.removeChild(lineView.background); lineView.background = null; }
    } else if (cls) {
      var wrap = ensureLineWrapped(lineView);
      lineView.background = wrap.insertBefore(elt("div", null, cls), wrap.firstChild);
    }
  }

  // Wrapper around buildLineContent which will reuse the structure
  // in display.externalMeasured when possible.
  function getLineContent(cm, lineView) {
    var ext = cm.display.externalMeasured;
    if (ext && ext.line == lineView.line) {
      cm.display.externalMeasured = null;
      lineView.measure = ext.measure;
      return ext.built;
    }
    return buildLineContent(cm, lineView);
  }

  // Redraw the line's text. Interacts with the background and text
  // classes because the mode may output tokens that influence these
  // classes.
  function updateLineText(cm, lineView) {
    var cls = lineView.text.className;
    var built = getLineContent(cm, lineView);
    if (lineView.text == lineView.node) lineView.node = built.pre;
    lineView.text.parentNode.replaceChild(built.pre, lineView.text);
    lineView.text = built.pre;
    if (built.bgClass != lineView.bgClass || built.textClass != lineView.textClass) {
      lineView.bgClass = built.bgClass;
      lineView.textClass = built.textClass;
      updateLineClasses(lineView);
    } else if (cls) {
      lineView.text.className = cls;
    }
  }

  function updateLineClasses(lineView) {
    updateLineBackground(lineView);
    if (lineView.line.wrapClass)
      ensureLineWrapped(lineView).className = lineView.line.wrapClass;
    else if (lineView.node != lineView.text)
      lineView.node.className = "";
    var textClass = lineView.textClass ? lineView.textClass + " " + (lineView.line.textClass || "") : lineView.line.textClass;
    lineView.text.className = textClass || "";
  }

  function updateLineGutter(cm, lineView, lineN, dims) {
    if (lineView.gutter) {
      lineView.node.removeChild(lineView.gutter);
      lineView.gutter = null;
    }
    if (lineView.gutterBackground) {
      lineView.node.removeChild(lineView.gutterBackground);
      lineView.gutterBackground = null;
    }
    if (lineView.line.gutterClass) {
      var wrap = ensureLineWrapped(lineView);
      lineView.gutterBackground = elt("div", null, "CodeMirror-gutter-background " + lineView.line.gutterClass,
                                      "left: " + (cm.options.fixedGutter ? dims.fixedPos : -dims.gutterTotalWidth) +
                                      "px; width: " + dims.gutterTotalWidth + "px");
      wrap.insertBefore(lineView.gutterBackground, lineView.text);
    }
    var markers = lineView.line.gutterMarkers;
    if (cm.options.lineNumbers || markers) {
      var wrap = ensureLineWrapped(lineView);
      var gutterWrap = lineView.gutter = elt("div", null, "CodeMirror-gutter-wrapper", "left: " +
                                             (cm.options.fixedGutter ? dims.fixedPos : -dims.gutterTotalWidth) + "px");
      cm.display.input.setUneditable(gutterWrap);
      wrap.insertBefore(gutterWrap, lineView.text);
      if (lineView.line.gutterClass)
        gutterWrap.className += " " + lineView.line.gutterClass;
      if (cm.options.lineNumbers && (!markers || !markers["CodeMirror-linenumbers"]))
        lineView.lineNumber = gutterWrap.appendChild(
          elt("div", lineNumberFor(cm.options, lineN),
              "CodeMirror-linenumber CodeMirror-gutter-elt",
              "left: " + dims.gutterLeft["CodeMirror-linenumbers"] + "px; width: "
              + cm.display.lineNumInnerWidth + "px"));
      if (markers) for (var k = 0; k < cm.options.gutters.length; ++k) {
        var id = cm.options.gutters[k], found = markers.hasOwnProperty(id) && markers[id];
        if (found)
          gutterWrap.appendChild(elt("div", [found], "CodeMirror-gutter-elt", "left: " +
                                     dims.gutterLeft[id] + "px; width: " + dims.gutterWidth[id] + "px"));
      }
    }
  }

  function updateLineWidgets(cm, lineView, dims) {
    if (lineView.alignable) lineView.alignable = null;
    for (var node = lineView.node.firstChild, next; node; node = next) {
      var next = node.nextSibling;
      if (node.className == "CodeMirror-linewidget")
        lineView.node.removeChild(node);
    }
    insertLineWidgets(cm, lineView, dims);
  }

  // Build a line's DOM representation from scratch
  function buildLineElement(cm, lineView, lineN, dims) {
    var built = getLineContent(cm, lineView);
    lineView.text = lineView.node = built.pre;
    if (built.bgClass) lineView.bgClass = built.bgClass;
    if (built.textClass) lineView.textClass = built.textClass;

    updateLineClasses(lineView);
    updateLineGutter(cm, lineView, lineN, dims);
    insertLineWidgets(cm, lineView, dims);
    return lineView.node;
  }

  // A lineView may contain multiple logical lines (when merged by
  // collapsed spans). The widgets for all of them need to be drawn.
  function insertLineWidgets(cm, lineView, dims) {
    insertLineWidgetsFor(cm, lineView.line, lineView, dims, true);
    if (lineView.rest) for (var i = 0; i < lineView.rest.length; i++)
      insertLineWidgetsFor(cm, lineView.rest[i], lineView, dims, false);
  }

  function insertLineWidgetsFor(cm, line, lineView, dims, allowAbove) {
    if (!line.widgets) return;
    var wrap = ensureLineWrapped(lineView);
    for (var i = 0, ws = line.widgets; i < ws.length; ++i) {
      var widget = ws[i], node = elt("div", [widget.node], "CodeMirror-linewidget");
      if (!widget.handleMouseEvents) node.setAttribute("cm-ignore-events", "true");
      positionLineWidget(widget, node, lineView, dims);
      cm.display.input.setUneditable(node);
      if (allowAbove && widget.above)
        wrap.insertBefore(node, lineView.gutter || lineView.text);
      else
        wrap.appendChild(node);
      signalLater(widget, "redraw");
    }
  }

  function positionLineWidget(widget, node, lineView, dims) {
    if (widget.noHScroll) {
      (lineView.alignable || (lineView.alignable = [])).push(node);
      var width = dims.wrapperWidth;
      node.style.left = dims.fixedPos + "px";
      if (!widget.coverGutter) {
        width -= dims.gutterTotalWidth;
        node.style.paddingLeft = dims.gutterTotalWidth + "px";
      }
      node.style.width = width + "px";
    }
    if (widget.coverGutter) {
      node.style.zIndex = 5;
      node.style.position = "relative";
      if (!widget.noHScroll) node.style.marginLeft = -dims.gutterTotalWidth + "px";
    }
  }

  // POSITION OBJECT

  // A Pos instance represents a position within the text.
  var Pos = CodeMirror.Pos = function(line, ch) {
    if (!(this instanceof Pos)) return new Pos(line, ch);
    this.line = line; this.ch = ch;
  };

  // Compare two positions, return 0 if they are the same, a negative
  // number when a is less, and a positive number otherwise.
  var cmp = CodeMirror.cmpPos = function(a, b) { return a.line - b.line || a.ch - b.ch; };

  function copyPos(x) {return Pos(x.line, x.ch);}
  function maxPos(a, b) { return cmp(a, b) < 0 ? b : a; }
  function minPos(a, b) { return cmp(a, b) < 0 ? a : b; }

  // INPUT HANDLING

  function ensureFocus(cm) {
    if (!cm.state.focused) { cm.display.input.focus(); onFocus(cm); }
  }

  function isReadOnly(cm) {
    return cm.options.readOnly || cm.doc.cantEdit;
  }

  // This will be set to an array of strings when copying, so that,
  // when pasting, we know what kind of selections the copied text
  // was made out of.
  var lastCopied = null;

  function applyTextInput(cm, inserted, deleted, sel, origin) {
    var doc = cm.doc;
    cm.display.shift = false;
    if (!sel) sel = doc.sel;

    var paste = cm.state.pasteIncoming || origin == "paste";
    var textLines = doc.splitLines(inserted), multiPaste = null;
    // When pasing N lines into N selections, insert one line per selection
    if (paste && sel.ranges.length > 1) {
      if (lastCopied && lastCopied.join("\n") == inserted) {
        if (sel.ranges.length % lastCopied.length == 0) {
          multiPaste = [];
          for (var i = 0; i < lastCopied.length; i++)
            multiPaste.push(doc.splitLines(lastCopied[i]));
        }
      } else if (textLines.length == sel.ranges.length) {
        multiPaste = map(textLines, function(l) { return [l]; });
      }
    }

    // Normal behavior is to insert the new text into every selection
    for (var i = sel.ranges.length - 1; i >= 0; i--) {
      var range = sel.ranges[i];
      var from = range.from(), to = range.to();
      if (range.empty()) {
        if (deleted && deleted > 0) // Handle deletion
          from = Pos(from.line, from.ch - deleted);
        else if (cm.state.overwrite && !paste) // Handle overwrite
          to = Pos(to.line, Math.min(getLine(doc, to.line).text.length, to.ch + lst(textLines).length));
      }
      var updateInput = cm.curOp.updateInput;
      var changeEvent = {from: from, to: to, text: multiPaste ? multiPaste[i % multiPaste.length] : textLines,
                         origin: origin || (paste ? "paste" : cm.state.cutIncoming ? "cut" : "+input")};
      makeChange(cm.doc, changeEvent);
      signalLater(cm, "inputRead", cm, changeEvent);
    }
    if (inserted && !paste)
      triggerElectric(cm, inserted);

    ensureCursorVisible(cm);
    cm.curOp.updateInput = updateInput;
    cm.curOp.typing = true;
    cm.state.pasteIncoming = cm.state.cutIncoming = false;
  }

  function handlePaste(e, cm) {
    var pasted = e.clipboardData && e.clipboardData.getData("text/plain");
    if (pasted) {
      e.preventDefault();
      if (!isReadOnly(cm) && !cm.options.disableInput)
        runInOp(cm, function() { applyTextInput(cm, pasted, 0, null, "paste"); });
      return true;
    }
  }

  function triggerElectric(cm, inserted) {
    // When an 'electric' character is inserted, immediately trigger a reindent
    if (!cm.options.electricChars || !cm.options.smartIndent) return;
    var sel = cm.doc.sel;

    for (var i = sel.ranges.length - 1; i >= 0; i--) {
      var range = sel.ranges[i];
      if (range.head.ch > 100 || (i && sel.ranges[i - 1].head.line == range.head.line)) continue;
      var mode = cm.getModeAt(range.head);
      var indented = false;
      if (mode.electricChars) {
        for (var j = 0; j < mode.electricChars.length; j++)
          if (inserted.indexOf(mode.electricChars.charAt(j)) > -1) {
            indented = indentLine(cm, range.head.line, "smart");
            break;
          }
      } else if (mode.electricInput) {
        if (mode.electricInput.test(getLine(cm.doc, range.head.line).text.slice(0, range.head.ch)))
          indented = indentLine(cm, range.head.line, "smart");
      }
      if (indented) signalLater(cm, "electricInput", cm, range.head.line);
    }
  }

  function copyableRanges(cm) {
    var text = [], ranges = [];
    for (var i = 0; i < cm.doc.sel.ranges.length; i++) {
      var line = cm.doc.sel.ranges[i].head.line;
      var lineRange = {anchor: Pos(line, 0), head: Pos(line + 1, 0)};
      ranges.push(lineRange);
      text.push(cm.getRange(lineRange.anchor, lineRange.head));
    }
    return {text: text, ranges: ranges};
  }

  function disableBrowserMagic(field) {
    field.setAttribute("autocorrect", "off");
    field.setAttribute("autocapitalize", "off");
    field.setAttribute("spellcheck", "false");
  }

  // TEXTAREA INPUT STYLE

  function TextareaInput(cm) {
    this.cm = cm;
    // See input.poll and input.reset
    this.prevInput = "";

    // Flag that indicates whether we expect input to appear real soon
    // now (after some event like 'keypress' or 'input') and are
    // polling intensively.
    this.pollingFast = false;
    // Self-resetting timeout for the poller
    this.polling = new Delayed();
    // Tracks when input.reset has punted to just putting a short
    // string into the textarea instead of the full selection.
    this.inaccurateSelection = false;
    // Used to work around IE issue with selection being forgotten when focus moves away from textarea
    this.hasSelection = false;
    this.composing = null;
  };

  function hiddenTextarea() {
    var te = elt("textarea", null, null, "position: absolute; padding: 0; width: 1px; height: 1em; outline: none");
    var div = elt("div", [te], null, "overflow: hidden; position: relative; width: 3px; height: 0px;");
    // The textarea is kept positioned near the cursor to prevent the
    // fact that it'll be scrolled into view on input from scrolling
    // our fake cursor out of view. On webkit, when wrap=off, paste is
    // very slow. So make the area wide instead.
    if (webkit) te.style.width = "1000px";
    else te.setAttribute("wrap", "off");
    // If border: 0; -- iOS fails to open keyboard (issue #1287)
    if (ios) te.style.border = "1px solid black";
    disableBrowserMagic(te);
    return div;
  }

  TextareaInput.prototype = copyObj({
    init: function(display) {
      var input = this, cm = this.cm;

      // Wraps and hides input textarea
      var div = this.wrapper = hiddenTextarea();
      // The semihidden textarea that is focused when the editor is
      // focused, and receives input.
      var te = this.textarea = div.firstChild;
      display.wrapper.insertBefore(div, display.wrapper.firstChild);

      // Needed to hide big blue blinking cursor on Mobile Safari (doesn't seem to work in iOS 8 anymore)
      if (ios) te.style.width = "0px";

      on(te, "input", function() {
        if (ie && ie_version >= 9 && input.hasSelection) input.hasSelection = null;
        input.poll();
      });

      on(te, "paste", function(e) {
        if (handlePaste(e, cm)) return true;

        cm.state.pasteIncoming = true;
        input.fastPoll();
      });

      function prepareCopyCut(e) {
        if (cm.somethingSelected()) {
          lastCopied = cm.getSelections();
          if (input.inaccurateSelection) {
            input.prevInput = "";
            input.inaccurateSelection = false;
            te.value = lastCopied.join("\n");
            selectInput(te);
          }
        } else if (!cm.options.lineWiseCopyCut) {
          return;
        } else {
          var ranges = copyableRanges(cm);
          lastCopied = ranges.text;
          if (e.type == "cut") {
            cm.setSelections(ranges.ranges, null, sel_dontScroll);
          } else {
            input.prevInput = "";
            te.value = ranges.text.join("\n");
            selectInput(te);
          }
        }
        if (e.type == "cut") cm.state.cutIncoming = true;
      }
      on(te, "cut", prepareCopyCut);
      on(te, "copy", prepareCopyCut);

      on(display.scroller, "paste", function(e) {
        if (eventInWidget(display, e)) return;
        cm.state.pasteIncoming = true;
        input.focus();
      });

      // Prevent normal selection in the editor (we handle our own)
      on(display.lineSpace, "selectstart", function(e) {
        if (!eventInWidget(display, e)) e_preventDefault(e);
      });

      on(te, "compositionstart", function() {
        var start = cm.getCursor("from");
        if (input.composing) input.composing.range.clear()
        input.composing = {
          start: start,
          range: cm.markText(start, cm.getCursor("to"), {className: "CodeMirror-composing"})
        };
      });
      on(te, "compositionend", function() {
        if (input.composing) {
          input.poll();
          input.composing.range.clear();
          input.composing = null;
        }
      });
    },

    prepareSelection: function() {
      // Redraw the selection and/or cursor
      var cm = this.cm, display = cm.display, doc = cm.doc;
      var result = prepareSelection(cm);

      // Move the hidden textarea near the cursor to prevent scrolling artifacts
      if (cm.options.moveInputWithCursor) {
        var headPos = cursorCoords(cm, doc.sel.primary().head, "div");
        var wrapOff = display.wrapper.getBoundingClientRect(), lineOff = display.lineDiv.getBoundingClientRect();
        result.teTop = Math.max(0, Math.min(display.wrapper.clientHeight - 10,
                                            headPos.top + lineOff.top - wrapOff.top));
        result.teLeft = Math.max(0, Math.min(display.wrapper.clientWidth - 10,
                                             headPos.left + lineOff.left - wrapOff.left));
      }

      return result;
    },

    showSelection: function(drawn) {
      var cm = this.cm, display = cm.display;
      removeChildrenAndAdd(display.cursorDiv, drawn.cursors);
      removeChildrenAndAdd(display.selectionDiv, drawn.selection);
      if (drawn.teTop != null) {
        this.wrapper.style.top = drawn.teTop + "px";
        this.wrapper.style.left = drawn.teLeft + "px";
      }
    },

    // Reset the input to correspond to the selection (or to be empty,
    // when not typing and nothing is selected)
    reset: function(typing) {
      if (this.contextMenuPending) return;
      var minimal, selected, cm = this.cm, doc = cm.doc;
      if (cm.somethingSelected()) {
        this.prevInput = "";
        var range = doc.sel.primary();
        minimal = hasCopyEvent &&
          (range.to().line - range.from().line > 100 || (selected = cm.getSelection()).length > 1000);
        var content = minimal ? "-" : selected || cm.getSelection();
        this.textarea.value = content;
        if (cm.state.focused) selectInput(this.textarea);
        if (ie && ie_version >= 9) this.hasSelection = content;
      } else if (!typing) {
        this.prevInput = this.textarea.value = "";
        if (ie && ie_version >= 9) this.hasSelection = null;
      }
      this.inaccurateSelection = minimal;
    },

    getField: function() { return this.textarea; },

    supportsTouch: function() { return false; },

    focus: function() {
      if (this.cm.options.readOnly != "nocursor" && (!mobile || activeElt() != this.textarea)) {
        try { this.textarea.focus(); }
        catch (e) {} // IE8 will throw if the textarea is display: none or not in DOM
      }
    },

    blur: function() { this.textarea.blur(); },

    resetPosition: function() {
      this.wrapper.style.top = this.wrapper.style.left = 0;
    },

    receivedFocus: function() { this.slowPoll(); },

    // Poll for input changes, using the normal rate of polling. This
    // runs as long as the editor is focused.
    slowPoll: function() {
      var input = this;
      if (input.pollingFast) return;
      input.polling.set(this.cm.options.pollInterval, function() {
        input.poll();
        if (input.cm.state.focused) input.slowPoll();
      });
    },

    // When an event has just come in that is likely to add or change
    // something in the input textarea, we poll faster, to ensure that
    // the change appears on the screen quickly.
    fastPoll: function() {
      var missed = false, input = this;
      input.pollingFast = true;
      function p() {
        var changed = input.poll();
        if (!changed && !missed) {missed = true; input.polling.set(60, p);}
        else {input.pollingFast = false; input.slowPoll();}
      }
      input.polling.set(20, p);
    },

    // Read input from the textarea, and update the document to match.
    // When something is selected, it is present in the textarea, and
    // selected (unless it is huge, in which case a placeholder is
    // used). When nothing is selected, the cursor sits after previously
    // seen text (can be empty), which is stored in prevInput (we must
    // not reset the textarea when typing, because that breaks IME).
    poll: function() {
      var cm = this.cm, input = this.textarea, prevInput = this.prevInput;
      // Since this is called a *lot*, try to bail out as cheaply as
      // possible when it is clear that nothing happened. hasSelection
      // will be the case when there is a lot of text in the textarea,
      // in which case reading its value would be expensive.
      if (this.contextMenuPending || !cm.state.focused ||
          (hasSelection(input) && !prevInput && !this.composing) ||
          isReadOnly(cm) || cm.options.disableInput || cm.state.keySeq)
        return false;

      var text = input.value;
      // If nothing changed, bail.
      if (text == prevInput && !cm.somethingSelected()) return false;
      // Work around nonsensical selection resetting in IE9/10, and
      // inexplicable appearance of private area unicode characters on
      // some key combos in Mac (#2689).
      if (ie && ie_version >= 9 && this.hasSelection === text ||
          mac && /[\uf700-\uf7ff]/.test(text)) {
        cm.display.input.reset();
        return false;
      }

      if (cm.doc.sel == cm.display.selForContextMenu) {
        var first = text.charCodeAt(0);
        if (first == 0x200b && !prevInput) prevInput = "\u200b";
        if (first == 0x21da) { this.reset(); return this.cm.execCommand("undo"); }
      }
      // Find the part of the input that is actually new
      var same = 0, l = Math.min(prevInput.length, text.length);
      while (same < l && prevInput.charCodeAt(same) == text.charCodeAt(same)) ++same;

      var self = this;
      runInOp(cm, function() {
        applyTextInput(cm, text.slice(same), prevInput.length - same,
                       null, self.composing ? "*compose" : null);

        // Don't leave long text in the textarea, since it makes further polling slow
        if (text.length > 1000 || text.indexOf("\n") > -1) input.value = self.prevInput = "";
        else self.prevInput = text;

        if (self.composing) {
          self.composing.range.clear();
          self.composing.range = cm.markText(self.composing.start, cm.getCursor("to"),
                                             {className: "CodeMirror-composing"});
        }
      });
      return true;
    },

    ensurePolled: function() {
      if (this.pollingFast && this.poll()) this.pollingFast = false;
    },

    onKeyPress: function() {
      if (ie && ie_version >= 9) this.hasSelection = null;
      this.fastPoll();
    },

    onContextMenu: function(e) {
      var input = this, cm = input.cm, display = cm.display, te = input.textarea;
      var pos = posFromMouse(cm, e), scrollPos = display.scroller.scrollTop;
      if (!pos || presto) return; // Opera is difficult.

      // Reset the current text selection only if the click is done outside of the selection
      // and 'resetSelectionOnContextMenu' option is true.
      var reset = cm.options.resetSelectionOnContextMenu;
      if (reset && cm.doc.sel.contains(pos) == -1)
        operation(cm, setSelection)(cm.doc, simpleSelection(pos), sel_dontScroll);

      var oldCSS = te.style.cssText;
      input.wrapper.style.position = "absolute";
      te.style.cssText = "position: fixed; width: 30px; height: 30px; top: " + (e.clientY - 5) +
        "px; left: " + (e.clientX - 5) + "px; z-index: 1000; background: " +
        (ie ? "rgba(255, 255, 255, .05)" : "transparent") +
        "; outline: none; border-width: 0; outline: none; overflow: hidden; opacity: .05; filter: alpha(opacity=5);";
      if (webkit) var oldScrollY = window.scrollY; // Work around Chrome issue (#2712)
      display.input.focus();
      if (webkit) window.scrollTo(null, oldScrollY);
      display.input.reset();
      // Adds "Select all" to context menu in FF
      if (!cm.somethingSelected()) te.value = input.prevInput = " ";
      input.contextMenuPending = true;
      display.selForContextMenu = cm.doc.sel;
      clearTimeout(display.detectingSelectAll);

      // Select-all will be greyed out if there's nothing to select, so
      // this adds a zero-width space so that we can later check whether
      // it got selected.
      function prepareSelectAllHack() {
        if (te.selectionStart != null) {
          var selected = cm.somethingSelected();
          var extval = "\u200b" + (selected ? te.value : "");
          te.value = "\u21da"; // Used to catch context-menu undo
          te.value = extval;
          input.prevInput = selected ? "" : "\u200b";
          te.selectionStart = 1; te.selectionEnd = extval.length;
          // Re-set this, in case some other handler touched the
          // selection in the meantime.
          display.selForContextMenu = cm.doc.sel;
        }
      }
      function rehide() {
        input.contextMenuPending = false;
        input.wrapper.style.position = "relative";
        te.style.cssText = oldCSS;
        if (ie && ie_version < 9) display.scrollbars.setScrollTop(display.scroller.scrollTop = scrollPos);

        // Try to detect the user choosing select-all
        if (te.selectionStart != null) {
          if (!ie || (ie && ie_version < 9)) prepareSelectAllHack();
          var i = 0, poll = function() {
            if (display.selForContextMenu == cm.doc.sel && te.selectionStart == 0 &&
                te.selectionEnd > 0 && input.prevInput == "\u200b")
              operation(cm, commands.selectAll)(cm);
            else if (i++ < 10) display.detectingSelectAll = setTimeout(poll, 500);
            else display.input.reset();
          };
          display.detectingSelectAll = setTimeout(poll, 200);
        }
      }

      if (ie && ie_version >= 9) prepareSelectAllHack();
      if (captureRightClick) {
        e_stop(e);
        var mouseup = function() {
          off(window, "mouseup", mouseup);
          setTimeout(rehide, 20);
        };
        on(window, "mouseup", mouseup);
      } else {
        setTimeout(rehide, 50);
      }
    },

    setUneditable: nothing,

    needsContentAttribute: false
  }, TextareaInput.prototype);

  // CONTENTEDITABLE INPUT STYLE

  function ContentEditableInput(cm) {
    this.cm = cm;
    this.lastAnchorNode = this.lastAnchorOffset = this.lastFocusNode = this.lastFocusOffset = null;
    this.polling = new Delayed();
    this.gracePeriod = false;
  }

  ContentEditableInput.prototype = copyObj({
    init: function(display) {
      var input = this, cm = input.cm;
      var div = input.div = display.lineDiv;
      div.contentEditable = "true";
      disableBrowserMagic(div);

      on(div, "paste", function(e) { handlePaste(e, cm); })

      on(div, "compositionstart", function(e) {
        var data = e.data;
        input.composing = {sel: cm.doc.sel, data: data, startData: data};
        if (!data) return;
        var prim = cm.doc.sel.primary();
        var line = cm.getLine(prim.head.line);
        var found = line.indexOf(data, Math.max(0, prim.head.ch - data.length));
        if (found > -1 && found <= prim.head.ch)
          input.composing.sel = simpleSelection(Pos(prim.head.line, found),
                                                Pos(prim.head.line, found + data.length));
      });
      on(div, "compositionupdate", function(e) {
        input.composing.data = e.data;
      });
      on(div, "compositionend", function(e) {
        var ours = input.composing;
        if (!ours) return;
        if (e.data != ours.startData && !/\u200b/.test(e.data))
          ours.data = e.data;
        // Need a small delay to prevent other code (input event,
        // selection polling) from doing damage when fired right after
        // compositionend.
        setTimeout(function() {
          if (!ours.handled)
            input.applyComposition(ours);
          if (input.composing == ours)
            input.composing = null;
        }, 50);
      });

      on(div, "touchstart", function() {
        input.forceCompositionEnd();
      });

      on(div, "input", function() {
        if (input.composing) return;
        if (!input.pollContent())
          runInOp(input.cm, function() {regChange(cm);});
      });

      function onCopyCut(e) {
        if (cm.somethingSelected()) {
          lastCopied = cm.getSelections();
          if (e.type == "cut") cm.replaceSelection("", null, "cut");
        } else if (!cm.options.lineWiseCopyCut) {
          return;
        } else {
          var ranges = copyableRanges(cm);
          lastCopied = ranges.text;
          if (e.type == "cut") {
            cm.operation(function() {
              cm.setSelections(ranges.ranges, 0, sel_dontScroll);
              cm.replaceSelection("", null, "cut");
            });
          }
        }
        // iOS exposes the clipboard API, but seems to discard content inserted into it
        if (e.clipboardData && !ios) {
          e.preventDefault();
          e.clipboardData.clearData();
          var toclipboard=lastCopied.join("\n");
          if (cm._handlers&& cm._handlers.beforeCopyToClipboard) {
            cm._handlers.beforeCopyToClipboard.forEach(function(handler){
              toclipboard=handler(toclipboard,cm);
            })
          }
          e.clipboardData.setData("text/plain", toclipboard);
        } else {
          // Old-fashioned briefly-focus-a-textarea hack
          var kludge = hiddenTextarea(), te = kludge.firstChild;
          cm.display.lineSpace.insertBefore(kludge, cm.display.lineSpace.firstChild);
          te.value = lastCopied.join("\n");
          var hadFocus = document.activeElement;
          selectInput(te);
          setTimeout(function() {
            cm.display.lineSpace.removeChild(kludge);
            hadFocus.focus();
          }, 50);
        }
      }
      on(div, "copy", onCopyCut);
      on(div, "cut", onCopyCut);
    },

    prepareSelection: function() {
      var result = prepareSelection(this.cm, false);
      result.focus = this.cm.state.focused;
      return result;
    },

    showSelection: function(info) {
      if (!info || !this.cm.display.view.length) return;
      if (info.focus) this.showPrimarySelection();
      this.showMultipleSelections(info);
    },

    showPrimarySelection: function() {
      var sel = window.getSelection(), prim = this.cm.doc.sel.primary();
      var curAnchor = domToPos(this.cm, sel.anchorNode, sel.anchorOffset);
      var curFocus = domToPos(this.cm, sel.focusNode, sel.focusOffset);
      if (curAnchor && !curAnchor.bad && curFocus && !curFocus.bad &&
          cmp(minPos(curAnchor, curFocus), prim.from()) == 0 &&
          cmp(maxPos(curAnchor, curFocus), prim.to()) == 0)
        return;

      var start = posToDOM(this.cm, prim.from());
      var end = posToDOM(this.cm, prim.to());
      if (!start && !end) return;

      var view = this.cm.display.view;
      var old = sel.rangeCount && sel.getRangeAt(0);
      if (!start) {
        start = {node: view[0].measure.map[2], offset: 0};
      } else if (!end) { // FIXME dangerously hacky
        var measure = view[view.length - 1].measure;
        var map = measure.maps ? measure.maps[measure.maps.length - 1] : measure.map;
        end = {node: map[map.length - 1], offset: map[map.length - 2] - map[map.length - 3]};
      }

      try { var rng = range(start.node, start.offset, end.offset, end.node); }
      catch(e) {} // Our model of the DOM might be outdated, in which case the range we try to set can be impossible
      if (rng) {
        sel.removeAllRanges();
        sel.addRange(rng);
        if (old && sel.anchorNode == null) sel.addRange(old);
        else if (gecko) this.startGracePeriod();
      }
      this.rememberSelection();
    },

    startGracePeriod: function() {
      var input = this;
      clearTimeout(this.gracePeriod);
      this.gracePeriod = setTimeout(function() {
        input.gracePeriod = false;
        if (input.selectionChanged())
          input.cm.operation(function() { input.cm.curOp.selectionChanged = true; });
      }, 20);
    },

    showMultipleSelections: function(info) {
      removeChildrenAndAdd(this.cm.display.cursorDiv, info.cursors);
      removeChildrenAndAdd(this.cm.display.selectionDiv, info.selection);
    },

    rememberSelection: function() {
      var sel = window.getSelection();
      this.lastAnchorNode = sel.anchorNode; this.lastAnchorOffset = sel.anchorOffset;
      this.lastFocusNode = sel.focusNode; this.lastFocusOffset = sel.focusOffset;
    },

    selectionInEditor: function() {
      var sel = window.getSelection();
      if (!sel.rangeCount) return false;
      var node = sel.getRangeAt(0).commonAncestorContainer;
      return contains(this.div, node);
    },

    focus: function() {
      if (this.cm.options.readOnly != "nocursor") this.div.focus();
    },
    blur: function() { this.div.blur(); },
    getField: function() { return this.div; },

    supportsTouch: function() { return true; },

    receivedFocus: function() {
      var input = this;
      if (this.selectionInEditor())
        this.pollSelection();
      else
        runInOp(this.cm, function() { input.cm.curOp.selectionChanged = true; });

      function poll() {
        if (input.cm.state.focused) {
          input.pollSelection();
          input.polling.set(input.cm.options.pollInterval, poll);
        }
      }
      this.polling.set(this.cm.options.pollInterval, poll);
    },

    selectionChanged: function() {
      var sel = window.getSelection();
      return sel.anchorNode != this.lastAnchorNode || sel.anchorOffset != this.lastAnchorOffset ||
        sel.focusNode != this.lastFocusNode || sel.focusOffset != this.lastFocusOffset;
    },

    pollSelection: function() {
      if (!this.composing && !this.gracePeriod && this.selectionChanged()) {
        var sel = window.getSelection(), cm = this.cm;
        this.rememberSelection();
        var anchor = domToPos(cm, sel.anchorNode, sel.anchorOffset);
        var head = domToPos(cm, sel.focusNode, sel.focusOffset);
        if (anchor && head) runInOp(cm, function() {
          setSelection(cm.doc, simpleSelection(anchor, head), sel_dontScroll);
          if (anchor.bad || head.bad) cm.curOp.selectionChanged = true;
        });
      }
    },

    pollContent: function() {
      var cm = this.cm, display = cm.display, sel = cm.doc.sel.primary();
      var from = sel.from(), to = sel.to();
      if (from.line < display.viewFrom || to.line > display.viewTo - 1) return false;

      var fromIndex;
      if (from.line == display.viewFrom || (fromIndex = findViewIndex(cm, from.line)) == 0) {
        var fromLine = lineNo(display.view[0].line);
        var fromNode = display.view[0].node;
      } else {
        var fromLine = lineNo(display.view[fromIndex].line);
        var fromNode = display.view[fromIndex - 1].node.nextSibling;
      }
      var toIndex = findViewIndex(cm, to.line);
      if (toIndex == display.view.length - 1) {
        var toLine = display.viewTo - 1;
        var toNode = display.lineDiv.lastChild;
      } else {
        var toLine = lineNo(display.view[toIndex + 1].line) - 1;
        var toNode = display.view[toIndex + 1].node.previousSibling;
      }

      var newText = cm.doc.splitLines(domTextBetween(cm, fromNode, toNode, fromLine, toLine));
      var oldText = getBetween(cm.doc, Pos(fromLine, 0), Pos(toLine, getLine(cm.doc, toLine).text.length));
      while (newText.length > 1 && oldText.length > 1) {
        if (lst(newText) == lst(oldText)) { newText.pop(); oldText.pop(); toLine--; }
        else if (newText[0] == oldText[0]) { newText.shift(); oldText.shift(); fromLine++; }
        else break;
      }

      var cutFront = 0, cutEnd = 0;
      var newTop = newText[0], oldTop = oldText[0], maxCutFront = Math.min(newTop.length, oldTop.length);
      while (cutFront < maxCutFront && newTop.charCodeAt(cutFront) == oldTop.charCodeAt(cutFront))
        ++cutFront;
      var newBot = lst(newText), oldBot = lst(oldText);
      var maxCutEnd = Math.min(newBot.length - (newText.length == 1 ? cutFront : 0),
                               oldBot.length - (oldText.length == 1 ? cutFront : 0));
      while (cutEnd < maxCutEnd &&
             newBot.charCodeAt(newBot.length - cutEnd - 1) == oldBot.charCodeAt(oldBot.length - cutEnd - 1))
        ++cutEnd;

      newText[newText.length - 1] = newBot.slice(0, newBot.length - cutEnd);
      newText[0] = newText[0].slice(cutFront);

      var chFrom = Pos(fromLine, cutFront);
      var chTo = Pos(toLine, oldText.length ? lst(oldText).length - cutEnd : 0);
      if (newText.length > 1 || newText[0] || cmp(chFrom, chTo)) {
        replaceRange(cm.doc, newText, chFrom, chTo, "+input");
        return true;
      }
    },

    ensurePolled: function() {
      this.forceCompositionEnd();
    },
    reset: function() {
      this.forceCompositionEnd();
    },
    forceCompositionEnd: function() {
      if (!this.composing || this.composing.handled) return;
      this.applyComposition(this.composing);
      this.composing.handled = true;
      this.div.blur();
      this.div.focus();
    },
    applyComposition: function(composing) {
      if (composing.data && composing.data != composing.startData)
        operation(this.cm, applyTextInput)(this.cm, composing.data, 0, composing.sel);
    },

    setUneditable: function(node) {
      node.setAttribute("contenteditable", "false");
    },

    onKeyPress: function(e) {
      e.preventDefault();
      operation(this.cm, applyTextInput)(this.cm, String.fromCharCode(e.charCode == null ? e.keyCode : e.charCode), 0);
    },

    onContextMenu: nothing,
    resetPosition: nothing,

    needsContentAttribute: true
  }, ContentEditableInput.prototype);

  function posToDOM(cm, pos) {
    var view = findViewForLine(cm, pos.line);
    if (!view || view.hidden) return null;
    var line = getLine(cm.doc, pos.line);
    var info = mapFromLineView(view, line, pos.line);

    var order = getOrder(line), side = "left";
    if (order) {
      var partPos = getBidiPartAt(order, pos.ch);
      side = partPos % 2 ? "right" : "left";
    }
    var result = nodeAndOffsetInLineMap(info.map, pos.ch, side);
    result.offset = result.collapse == "right" ? result.end : result.start;
    return result;
  }

  function badPos(pos, bad) { if (bad) pos.bad = true; return pos; }

  function domToPos(cm, node, offset) {
    var lineNode;
    if (node == cm.display.lineDiv) {
      lineNode = cm.display.lineDiv.childNodes[offset];
      if (!lineNode) return badPos(cm.clipPos(Pos(cm.display.viewTo - 1)), true);
      node = null; offset = 0;
    } else {
      for (lineNode = node;; lineNode = lineNode.parentNode) {
        if (!lineNode || lineNode == cm.display.lineDiv) return null;
        if (lineNode.parentNode && lineNode.parentNode == cm.display.lineDiv) break;
      }
    }
    for (var i = 0; i < cm.display.view.length; i++) {
      var lineView = cm.display.view[i];
      if (lineView.node == lineNode)
        return locateNodeInLineView(lineView, node, offset);
    }
  }

  function locateNodeInLineView(lineView, node, offset) {
    var wrapper = lineView.text.firstChild, bad = false;
    if (!node || !contains(wrapper, node)) return badPos(Pos(lineNo(lineView.line), 0), true);
    if (node == wrapper) {
      bad = true;
      node = wrapper.childNodes[offset];
      offset = 0;
      if (!node) {
        var line = lineView.rest ? lst(lineView.rest) : lineView.line;
        return badPos(Pos(lineNo(line), line.text.length), bad);
      }
    }

    var textNode = node.nodeType == 3 ? node : null, topNode = node;
    if (!textNode && node.childNodes.length == 1 && node.firstChild.nodeType == 3) {
      textNode = node.firstChild;
      if (offset) offset = textNode.nodeValue.length;
    }
    while (topNode.parentNode != wrapper) topNode = topNode.parentNode;
    var measure = lineView.measure, maps = measure.maps;

    function find(textNode, topNode, offset) {
      for (var i = -1; i < (maps ? maps.length : 0); i++) {
        var map = i < 0 ? measure.map : maps[i];
        for (var j = 0; j < map.length; j += 3) {
          var curNode = map[j + 2];
          if (curNode == textNode || curNode == topNode) {
            var line = lineNo(i < 0 ? lineView.line : lineView.rest[i]);
            var ch = map[j] + offset;
            if (offset < 0 || curNode != textNode) ch = map[j + (offset ? 1 : 0)];
            return Pos(line, ch);
          }
        }
      }
    }
    var found = find(textNode, topNode, offset);
    if (found) return badPos(found, bad);

    // FIXME this is all really shaky. might handle the few cases it needs to handle, but likely to cause problems
    for (var after = topNode.nextSibling, dist = textNode ? textNode.nodeValue.length - offset : 0; after; after = after.nextSibling) {
      found = find(after, after.firstChild, 0);
      if (found)
        return badPos(Pos(found.line, found.ch - dist), bad);
      else
        dist += after.textContent.length;
    }
    for (var before = topNode.previousSibling, dist = offset; before; before = before.previousSibling) {
      found = find(before, before.firstChild, -1);
      if (found)
        return badPos(Pos(found.line, found.ch + dist), bad);
      else
        dist += after.textContent.length;
    }
  }

  function domTextBetween(cm, from, to, fromLine, toLine) {
    var text = "", closing = false, lineSep = cm.doc.lineSeparator();
    function recognizeMarker(id) { return function(marker) { return marker.id == id; }; }
    function walk(node) {
      if (node.nodeType == 1) {
        var cmText = node.getAttribute("cm-text");
        if (cmText != null) {
          if (cmText == "") cmText = node.textContent.replace(/\u200b/g, "");
          text += cmText;
          return;
        }
        var markerID = node.getAttribute("cm-marker"), range;
        if (markerID) {
          var found = cm.findMarks(Pos(fromLine, 0), Pos(toLine + 1, 0), recognizeMarker(+markerID));
          if (found.length && (range = found[0].find()))
            text += getBetween(cm.doc, range.from, range.to).join(lineSep);
          return;
        }
        if (node.getAttribute("contenteditable") == "false") return;
        for (var i = 0; i < node.childNodes.length; i++)
          walk(node.childNodes[i]);
        if (/^(pre|div|p)$/i.test(node.nodeName))
          closing = true;
      } else if (node.nodeType == 3) {
        var val = node.nodeValue;
        if (!val) return;
        if (closing) {
          text += lineSep;
          closing = false;
        }
        text += val;
      }
    }
    for (;;) {
      walk(from);
      if (from == to) break;
      from = from.nextSibling;
    }
    return text;
  }

  CodeMirror.inputStyles = {"textarea": TextareaInput, "contenteditable": ContentEditableInput};

  // SELECTION / CURSOR

  // Selection objects are immutable. A new one is created every time
  // the selection changes. A selection is one or more non-overlapping
  // (and non-touching) ranges, sorted, and an integer that indicates
  // which one is the primary selection (the one that's scrolled into
  // view, that getCursor returns, etc).
  function Selection(ranges, primIndex) {
    this.ranges = ranges;
    this.primIndex = primIndex;
  }

  Selection.prototype = {
    primary: function() { return this.ranges[this.primIndex]; },
    equals: function(other) {
      if (other == this) return true;
      if (other.primIndex != this.primIndex || other.ranges.length != this.ranges.length) return false;
      for (var i = 0; i < this.ranges.length; i++) {
        var here = this.ranges[i], there = other.ranges[i];
        if (cmp(here.anchor, there.anchor) != 0 || cmp(here.head, there.head) != 0) return false;
      }
      return true;
    },
    deepCopy: function() {
      for (var out = [], i = 0; i < this.ranges.length; i++)
        out[i] = new Range(copyPos(this.ranges[i].anchor), copyPos(this.ranges[i].head));
      return new Selection(out, this.primIndex);
    },
    somethingSelected: function() {
      for (var i = 0; i < this.ranges.length; i++)
        if (!this.ranges[i].empty()) return true;
      return false;
    },
    contains: function(pos, end) {
      if (!end) end = pos;
      for (var i = 0; i < this.ranges.length; i++) {
        var range = this.ranges[i];
        if (cmp(end, range.from()) >= 0 && cmp(pos, range.to()) <= 0)
          return i;
      }
      return -1;
    }
  };

  function Range(anchor, head) {
    this.anchor = anchor; this.head = head;
  }

  Range.prototype = {
    from: function() { return minPos(this.anchor, this.head); },
    to: function() { return maxPos(this.anchor, this.head); },
    empty: function() {
      return this.head.line == this.anchor.line && this.head.ch == this.anchor.ch;
    }
  };

  // Take an unsorted, potentially overlapping set of ranges, and
  // build a selection out of it. 'Consumes' ranges array (modifying
  // it).
  function normalizeSelection(ranges, primIndex) {
    var prim = ranges[primIndex];
    ranges.sort(function(a, b) { return cmp(a.from(), b.from()); });
    primIndex = indexOf(ranges, prim);
    for (var i = 1; i < ranges.length; i++) {
      var cur = ranges[i], prev = ranges[i - 1];
      if (cmp(prev.to(), cur.from()) >= 0) {
        var from = minPos(prev.from(), cur.from()), to = maxPos(prev.to(), cur.to());
        var inv = prev.empty() ? cur.from() == cur.head : prev.from() == prev.head;
        if (i <= primIndex) --primIndex;
        ranges.splice(--i, 2, new Range(inv ? to : from, inv ? from : to));
      }
    }
    return new Selection(ranges, primIndex);
  }

  function simpleSelection(anchor, head) {
    return new Selection([new Range(anchor, head || anchor)], 0);
  }

  // Most of the external API clips given positions to make sure they
  // actually exist within the document.
  function clipLine(doc, n) {return Math.max(doc.first, Math.min(n, doc.first + doc.size - 1));}
  function clipPos(doc, pos) {
    if (pos.line < doc.first) return Pos(doc.first, 0);
    var last = doc.first + doc.size - 1;
    if (pos.line > last) return Pos(last, getLine(doc, last).text.length);
    return clipToLen(pos, getLine(doc, pos.line).text.length);
  }
  function clipToLen(pos, linelen) {
    var ch = pos.ch;
    if (ch == null || ch > linelen) return Pos(pos.line, linelen);
    else if (ch < 0) return Pos(pos.line, 0);
    else return pos;
  }
  function isLine(doc, l) {return l >= doc.first && l < doc.first + doc.size;}
  function clipPosArray(doc, array) {
    for (var out = [], i = 0; i < array.length; i++) out[i] = clipPos(doc, array[i]);
    return out;
  }

  // SELECTION UPDATES

  // The 'scroll' parameter given to many of these indicated whether
  // the new cursor position should be scrolled into view after
  // modifying the selection.

  // If shift is held or the extend flag is set, extends a range to
  // include a given position (and optionally a second position).
  // Otherwise, simply returns the range between the given positions.
  // Used for cursor motion and such.
  function extendRange(doc, range, head, other) {
    if (doc.cm && doc.cm.display.shift || doc.extend) {
      var anchor = range.anchor;
      if (other) {
        var posBefore = cmp(head, anchor) < 0;
        if (posBefore != (cmp(other, anchor) < 0)) {
          anchor = head;
          head = other;
        } else if (posBefore != (cmp(head, other) < 0)) {
          head = other;
        }
      }
      return new Range(anchor, head);
    } else {
      return new Range(other || head, head);
    }
  }

  // Extend the primary selection range, discard the rest.
  function extendSelection(doc, head, other, options) {
    setSelection(doc, new Selection([extendRange(doc, doc.sel.primary(), head, other)], 0), options);
  }

  // Extend all selections (pos is an array of selections with length
  // equal the number of selections)
  function extendSelections(doc, heads, options) {
    for (var out = [], i = 0; i < doc.sel.ranges.length; i++)
      out[i] = extendRange(doc, doc.sel.ranges[i], heads[i], null);
    var newSel = normalizeSelection(out, doc.sel.primIndex);
    setSelection(doc, newSel, options);
  }

  // Updates a single range in the selection.
  function replaceOneSelection(doc, i, range, options) {
    var ranges = doc.sel.ranges.slice(0);
    ranges[i] = range;
    setSelection(doc, normalizeSelection(ranges, doc.sel.primIndex), options);
  }

  // Reset the selection to a single range.
  function setSimpleSelection(doc, anchor, head, options) {
    setSelection(doc, simpleSelection(anchor, head), options);
  }

  // Give beforeSelectionChange handlers a change to influence a
  // selection update.
  function filterSelectionChange(doc, sel) {
    var obj = {
      ranges: sel.ranges,
      update: function(ranges) {
        this.ranges = [];
        for (var i = 0; i < ranges.length; i++)
          this.ranges[i] = new Range(clipPos(doc, ranges[i].anchor),
                                     clipPos(doc, ranges[i].head));
      }
    };
    signal(doc, "beforeSelectionChange", doc, obj);
    if (doc.cm) signal(doc.cm, "beforeSelectionChange", doc.cm, obj);
    if (obj.ranges != sel.ranges) return normalizeSelection(obj.ranges, obj.ranges.length - 1);
    else return sel;
  }

  function setSelectionReplaceHistory(doc, sel, options) {
    var done = doc.history.done, last = lst(done);
    if (last && last.ranges) {
      done[done.length - 1] = sel;
      setSelectionNoUndo(doc, sel, options);
    } else {
      setSelection(doc, sel, options);
    }
  }

  // Set a new selection.
  function setSelection(doc, sel, options) {
    setSelectionNoUndo(doc, sel, options);
    addSelectionToHistory(doc, doc.sel, doc.cm ? doc.cm.curOp.id : NaN, options);
  }

  function setSelectionNoUndo(doc, sel, options) {
    if (hasHandler(doc, "beforeSelectionChange") || doc.cm && hasHandler(doc.cm, "beforeSelectionChange"))
      sel = filterSelectionChange(doc, sel);

    var bias = options && options.bias ||
      (cmp(sel.primary().head, doc.sel.primary().head) < 0 ? -1 : 1);
    setSelectionInner(doc, skipAtomicInSelection(doc, sel, bias, true));

    if (!(options && options.scroll === false) && doc.cm)
      ensureCursorVisible(doc.cm);
  }

  function setSelectionInner(doc, sel) {
    if (sel.equals(doc.sel)) return;

    doc.sel = sel;

    if (doc.cm) {
      doc.cm.curOp.updateInput = doc.cm.curOp.selectionChanged = true;
      signalCursorActivity(doc.cm);
    }
    signalLater(doc, "cursorActivity", doc);
  }

  // Verify that the selection does not partially select any atomic
  // marked ranges.
  function reCheckSelection(doc) {
    setSelectionInner(doc, skipAtomicInSelection(doc, doc.sel, null, false), sel_dontScroll);
  }

  // Return a selection that does not partially select any atomic
  // ranges.
  function skipAtomicInSelection(doc, sel, bias, mayClear) {
    var out;
    for (var i = 0; i < sel.ranges.length; i++) {
      var range = sel.ranges[i];
      var newAnchor = skipAtomic(doc, range.anchor, bias, mayClear);
      var newHead = skipAtomic(doc, range.head, bias, mayClear);
      if (out || newAnchor != range.anchor || newHead != range.head) {
        if (!out) out = sel.ranges.slice(0, i);
        out[i] = new Range(newAnchor, newHead);
      }
    }
    return out ? normalizeSelection(out, sel.primIndex) : sel;
  }

  // Ensure a given position is not inside an atomic range.
  function skipAtomic(doc, pos, bias, mayClear) {
    var flipped = false, curPos = pos;
    var dir = bias || 1;
    doc.cantEdit = false;
    search: for (;;) {
      var line = getLine(doc, curPos.line);
      if (line.markedSpans) {
        for (var i = 0; i < line.markedSpans.length; ++i) {
          var sp = line.markedSpans[i], m = sp.marker;
          if ((sp.from == null || (m.inclusiveLeft ? sp.from <= curPos.ch : sp.from < curPos.ch)) &&
              (sp.to == null || (m.inclusiveRight ? sp.to >= curPos.ch : sp.to > curPos.ch))) {
            if (mayClear) {
              signal(m, "beforeCursorEnter");
              if (m.explicitlyCleared) {
                if (!line.markedSpans) break;
                else {--i; continue;}
              }
            }
            if (!m.atomic) continue;
            var newPos = m.find(dir < 0 ? -1 : 1);
            if (cmp(newPos, curPos) == 0) {
              newPos.ch += dir;
              if (newPos.ch < 0) {
                if (newPos.line > doc.first) newPos = clipPos(doc, Pos(newPos.line - 1));
                else newPos = null;
              } else if (newPos.ch > line.text.length) {
                if (newPos.line < doc.first + doc.size - 1) newPos = Pos(newPos.line + 1, 0);
                else newPos = null;
              }
              if (!newPos) {
                if (flipped) {
                  // Driven in a corner -- no valid cursor position found at all
                  // -- try again *with* clearing, if we didn't already
                  if (!mayClear) return skipAtomic(doc, pos, bias, true);
                  // Otherwise, turn off editing until further notice, and return the start of the doc
                  doc.cantEdit = true;
                  return Pos(doc.first, 0);
                }
                flipped = true; newPos = pos; dir = -dir;
              }
            }
            curPos = newPos;
            continue search;
          }
        }
      }
      return curPos;
    }
  }

  // SELECTION DRAWING

  function updateSelection(cm) {
    cm.display.input.showSelection(cm.display.input.prepareSelection());
  }

  function prepareSelection(cm, primary) {
    var doc = cm.doc, result = {};
    var curFragment = result.cursors = document.createDocumentFragment();
    var selFragment = result.selection = document.createDocumentFragment();

    for (var i = 0; i < doc.sel.ranges.length; i++) {
      if (primary === false && i == doc.sel.primIndex) continue;
      var range = doc.sel.ranges[i];
      var collapsed = range.empty();
      if (collapsed || cm.options.showCursorWhenSelecting)
        drawSelectionCursor(cm, range.head, curFragment);
      if (!collapsed)
        drawSelectionRange(cm, range, selFragment);
    }
    return result;
  }

  // Draws a cursor for the given range
  function drawSelectionCursor(cm, head, output) {
    var pos = cursorCoords(cm, head, "div", null, null, !cm.options.singleCursorHeightPerLine);

    var cursor = output.appendChild(elt("div", "\u00a0", "CodeMirror-cursor"));
    cursor.style.left = pos.left + "px";
    cursor.style.top = pos.top + "px";
    cursor.style.height = Math.max(0, pos.bottom - pos.top) * cm.options.cursorHeight + "px";

    if (pos.other) {
      // Secondary cursor, shown when on a 'jump' in bi-directional text
      var otherCursor = output.appendChild(elt("div", "\u00a0", "CodeMirror-cursor CodeMirror-secondarycursor"));
      otherCursor.style.display = "";
      otherCursor.style.left = pos.other.left + "px";
      otherCursor.style.top = pos.other.top + "px";
      otherCursor.style.height = (pos.other.bottom - pos.other.top) * .85 + "px";
    }
  }

  // Draws the given range as a highlighted selection
  function drawSelectionRange(cm, range, output) {
    var display = cm.display, doc = cm.doc;
    var fragment = document.createDocumentFragment();
    var padding = paddingH(cm.display), leftSide = padding.left;
    var rightSide = Math.max(display.sizerWidth, displayWidth(cm) - display.sizer.offsetLeft) - padding.right;

    function add(left, top, width, bottom) {
      if (top < 0) top = 0;
      top = Math.round(top);
      bottom = Math.round(bottom);
      fragment.appendChild(elt("div", null, "CodeMirror-selected", "position: absolute; left: " + left +
                               "px; top: " + top + "px; width: " + (width == null ? rightSide - left : width) +
                               "px; height: " + (bottom - top) + "px"));
    }

    function drawForLine(line, fromArg, toArg) {
      var lineObj = getLine(doc, line);
      var lineLen = lineObj.text.length;
      var start, end;
      function coords(ch, bias) {
        return charCoords(cm, Pos(line, ch), "div", lineObj, bias);
      }

      iterateBidiSections(getOrder(lineObj), fromArg || 0, toArg == null ? lineLen : toArg, function(from, to, dir) {
        var leftPos = coords(from, "left"), rightPos, left, right;
        if (from == to) {
          rightPos = leftPos;
          left = right = leftPos.left;
        } else {
          rightPos = coords(to - 1, "right");
          if (dir == "rtl") { var tmp = leftPos; leftPos = rightPos; rightPos = tmp; }
          left = leftPos.left;
          right = rightPos.right;
        }
        if (fromArg == null && from == 0) left = leftSide;
        if (rightPos.top - leftPos.top > 3) { // Different lines, draw top part
          add(left, leftPos.top, null, leftPos.bottom);
          left = leftSide;
          if (leftPos.bottom < rightPos.top) add(left, leftPos.bottom, null, rightPos.top);
        }
        if (toArg == null && to == lineLen) right = rightSide;
        if (!start || leftPos.top < start.top || leftPos.top == start.top && leftPos.left < start.left)
          start = leftPos;
        if (!end || rightPos.bottom > end.bottom || rightPos.bottom == end.bottom && rightPos.right > end.right)
          end = rightPos;
        if (left < leftSide + 1) left = leftSide;
        add(left, rightPos.top, right - left, rightPos.bottom);
      });
      return {start: start, end: end};
    }

    var sFrom = range.from(), sTo = range.to();
    if (sFrom.line == sTo.line) {
      drawForLine(sFrom.line, sFrom.ch, sTo.ch);
    } else {
      var fromLine = getLine(doc, sFrom.line), toLine = getLine(doc, sTo.line);
      var singleVLine = visualLine(fromLine) == visualLine(toLine);
      var leftEnd = drawForLine(sFrom.line, sFrom.ch, singleVLine ? fromLine.text.length + 1 : null).end;
      var rightStart = drawForLine(sTo.line, singleVLine ? 0 : null, sTo.ch).start;
      if (singleVLine) {
        if (leftEnd.top < rightStart.top - 2) {
          add(leftEnd.right, leftEnd.top, null, leftEnd.bottom);
          add(leftSide, rightStart.top, rightStart.left, rightStart.bottom);
        } else {
          add(leftEnd.right, leftEnd.top, rightStart.left - leftEnd.right, leftEnd.bottom);
        }
      }
      if (leftEnd.bottom < rightStart.top)
        add(leftSide, leftEnd.bottom, null, rightStart.top);
    }

    output.appendChild(fragment);
  }

  // Cursor-blinking
  function restartBlink(cm) {
    if (!cm.state.focused) return;
    var display = cm.display;
    clearInterval(display.blinker);
    var on = true;
    display.cursorDiv.style.visibility = "";
    if (cm.options.cursorBlinkRate > 0)
      display.blinker = setInterval(function() {
        display.cursorDiv.style.visibility = (on = !on) ? "" : "hidden";
      }, cm.options.cursorBlinkRate);
    else if (cm.options.cursorBlinkRate < 0)
      display.cursorDiv.style.visibility = "hidden";
  }

  // HIGHLIGHT WORKER

  function startWorker(cm, time) {
    if (cm.doc.mode.startState && cm.doc.frontier < cm.display.viewTo)
      cm.state.highlight.set(time, bind(highlightWorker, cm));
  }

  function highlightWorker(cm) {
    var doc = cm.doc;
    if (doc.frontier < doc.first) doc.frontier = doc.first;
    if (doc.frontier >= cm.display.viewTo) return;
    var end = +new Date + cm.options.workTime;
    var state = copyState(doc.mode, getStateBefore(cm, doc.frontier));
    var changedLines = [];

    doc.iter(doc.frontier, Math.min(doc.first + doc.size, cm.display.viewTo + 500), function(line) {
      if (doc.frontier >= cm.display.viewFrom) { // Visible
        var oldStyles = line.styles, tooLong = line.text.length > cm.options.maxHighlightLength;
        var highlighted = highlightLine(cm, line, tooLong ? copyState(doc.mode, state) : state, true);
        line.styles = highlighted.styles;
        var oldCls = line.styleClasses, newCls = highlighted.classes;
        if (newCls) line.styleClasses = newCls;
        else if (oldCls) line.styleClasses = null;
        var ischange = !oldStyles || oldStyles.length != line.styles.length ||
          oldCls != newCls && (!oldCls || !newCls || oldCls.bgClass != newCls.bgClass || oldCls.textClass != newCls.textClass);
        for (var i = 0; !ischange && i < oldStyles.length; ++i) ischange = oldStyles[i] != line.styles[i];
        if (ischange) changedLines.push(doc.frontier);
        line.stateAfter = tooLong ? state : copyState(doc.mode, state);
      } else {
        if (line.text.length <= cm.options.maxHighlightLength)
          processLine(cm, line.text, state);
        line.stateAfter = doc.frontier % 5 == 0 ? copyState(doc.mode, state) : null;
      }
      ++doc.frontier;
      if (+new Date > end) {
        startWorker(cm, cm.options.workDelay);
        return true;
      }
    });
    if (changedLines.length) runInOp(cm, function() {
      for (var i = 0; i < changedLines.length; i++)
        regLineChange(cm, changedLines[i], "text");
    });
  }

  // Finds the line to start with when starting a parse. Tries to
  // find a line with a stateAfter, so that it can start with a
  // valid state. If that fails, it returns the line with the
  // smallest indentation, which tends to need the least context to
  // parse correctly.
  function findStartLine(cm, n, precise) {
    var minindent, minline, doc = cm.doc;
    var lim = precise ? -1 : n - (cm.doc.mode.innerMode ? 1000 : 100);
    for (var search = n; search > lim; --search) {
      if (search <= doc.first) return doc.first;
      var line = getLine(doc, search - 1);
      if (line.stateAfter && (!precise || search <= doc.frontier)) return search;
      var indented = countColumn(line.text, null, cm.options.tabSize);
      if (minline == null || minindent > indented) {
        minline = search - 1;
        minindent = indented;
      }
    }
    return minline;
  }

  function getStateBefore(cm, n, precise) {
    var doc = cm.doc, display = cm.display;
    if (!doc.mode.startState) return true;
    var pos = findStartLine(cm, n, precise), state = pos > doc.first && getLine(doc, pos-1).stateAfter;
    if (!state) state = startState(doc.mode);
    else state = copyState(doc.mode, state);
    doc.iter(pos, n, function(line) {
      processLine(cm, line.text, state);
      var save = pos == n - 1 || pos % 5 == 0 || pos >= display.viewFrom && pos < display.viewTo;
      line.stateAfter = save ? copyState(doc.mode, state) : null;
      ++pos;
    });
    if (precise) doc.frontier = pos;
    return state;
  }

  // POSITION MEASUREMENT

  function paddingTop(display) {return display.lineSpace.offsetTop;}
  function paddingVert(display) {return display.mover.offsetHeight - display.lineSpace.offsetHeight;}
  function paddingH(display) {
    if (display.cachedPaddingH) return display.cachedPaddingH;
    var e = removeChildrenAndAdd(display.measure, elt("pre", "x"));
    var style = window.getComputedStyle ? window.getComputedStyle(e) : e.currentStyle;
    var data = {left: parseInt(style.paddingLeft), right: parseInt(style.paddingRight)};
    if (!isNaN(data.left) && !isNaN(data.right)) display.cachedPaddingH = data;
    return data;
  }

  function scrollGap(cm) { return scrollerGap - cm.display.nativeBarWidth; }
  function displayWidth(cm) {
    return cm.display.scroller.clientWidth - scrollGap(cm) - cm.display.barWidth;
  }
  function displayHeight(cm) {
    return cm.display.scroller.clientHeight - scrollGap(cm) - cm.display.barHeight;
  }

  // Ensure the lineView.wrapping.heights array is populated. This is
  // an array of bottom offsets for the lines that make up a drawn
  // line. When lineWrapping is on, there might be more than one
  // height.
  function ensureLineHeights(cm, lineView, rect) {
    var wrapping = cm.options.lineWrapping;
    var curWidth = wrapping && displayWidth(cm);
    if (!lineView.measure.heights || wrapping && lineView.measure.width != curWidth) {
      var heights = lineView.measure.heights = [];
      if (wrapping) {
        lineView.measure.width = curWidth;
        var rects = lineView.text.firstChild.getClientRects();
        for (var i = 0; i < rects.length - 1; i++) {
          var cur = rects[i], next = rects[i + 1];
          if (Math.abs(cur.bottom - next.bottom) > 2)
            heights.push((cur.bottom + next.top) / 2 - rect.top);
        }
      }
      heights.push(rect.bottom - rect.top);
    }
  }

  // Find a line map (mapping character offsets to text nodes) and a
  // measurement cache for the given line number. (A line view might
  // contain multiple lines when collapsed ranges are present.)
  function mapFromLineView(lineView, line, lineN) {
    if (lineView.line == line)
      return {map: lineView.measure.map, cache: lineView.measure.cache};
    for (var i = 0; i < lineView.rest.length; i++)
      if (lineView.rest[i] == line)
        return {map: lineView.measure.maps[i], cache: lineView.measure.caches[i]};
    for (var i = 0; i < lineView.rest.length; i++)
      if (lineNo(lineView.rest[i]) > lineN)
        return {map: lineView.measure.maps[i], cache: lineView.measure.caches[i], before: true};
  }

  // Render a line into the hidden node display.externalMeasured. Used
  // when measurement is needed for a line that's not in the viewport.
  function updateExternalMeasurement(cm, line) {
    line = visualLine(line);
    var lineN = lineNo(line);
    var view = cm.display.externalMeasured = new LineView(cm.doc, line, lineN);
    view.lineN = lineN;
    var built = view.built = buildLineContent(cm, view);
    view.text = built.pre;
    removeChildrenAndAdd(cm.display.lineMeasure, built.pre);
    return view;
  }

  // Get a {top, bottom, left, right} box (in line-local coordinates)
  // for a given character.
  function measureChar(cm, line, ch, bias) {
    return measureCharPrepared(cm, prepareMeasureForLine(cm, line), ch, bias);
  }

  // Find a line view that corresponds to the given line number.
  function findViewForLine(cm, lineN) {
    if (lineN >= cm.display.viewFrom && lineN < cm.display.viewTo)
      return cm.display.view[findViewIndex(cm, lineN)];
    var ext = cm.display.externalMeasured;
    if (ext && lineN >= ext.lineN && lineN < ext.lineN + ext.size)
      return ext;
  }

  // Measurement can be split in two steps, the set-up work that
  // applies to the whole line, and the measurement of the actual
  // character. Functions like coordsChar, that need to do a lot of
  // measurements in a row, can thus ensure that the set-up work is
  // only done once.
  function prepareMeasureForLine(cm, line) {
    var lineN = lineNo(line);
    var view = findViewForLine(cm, lineN);
    if (view && !view.text) {
      view = null;
    } else if (view && view.changes) {
      updateLineForChanges(cm, view, lineN, getDimensions(cm));
      cm.curOp.forceUpdate = true;
    }
    if (!view)
      view = updateExternalMeasurement(cm, line);

    var info = mapFromLineView(view, line, lineN);
    return {
      line: line, view: view, rect: null,
      map: info.map, cache: info.cache, before: info.before,
      hasHeights: false
    };
  }

  // Given a prepared measurement object, measures the position of an
  // actual character (or fetches it from the cache).
  function measureCharPrepared(cm, prepared, ch, bias, varHeight) {
    if (prepared.before) ch = -1;
    var key = ch + (bias || ""), found;
    if (prepared.cache.hasOwnProperty(key)) {
      found = prepared.cache[key];
    } else {
      if (!prepared.rect)
        prepared.rect = prepared.view.text.getBoundingClientRect();
      if (!prepared.hasHeights) {
        ensureLineHeights(cm, prepared.view, prepared.rect);
        prepared.hasHeights = true;
      }
      found = measureCharInner(cm, prepared, ch, bias);
      if (!found.bogus) prepared.cache[key] = found;
    }
    return {left: found.left, right: found.right,
            top: varHeight ? found.rtop : found.top,
            bottom: varHeight ? found.rbottom : found.bottom};
  }

  var nullRect = {left: 0, right: 0, top: 0, bottom: 0};

  function nodeAndOffsetInLineMap(map, ch, bias) {
    var node, start, end, collapse;
    // First, search the line map for the text node corresponding to,
    // or closest to, the target character.
    for (var i = 0; i < map.length; i += 3) {
      var mStart = map[i], mEnd = map[i + 1];
      if (ch < mStart) {
        start = 0; end = 1;
        collapse = "left";
      } else if (ch < mEnd) {
        start = ch - mStart;
        end = start + 1;
      } else if (i == map.length - 3 || ch == mEnd && map[i + 3] > ch) {
        end = mEnd - mStart;
        start = end - 1;
        if (ch >= mEnd) collapse = "right";
      }
      if (start != null) {
        node = map[i + 2];
        if (mStart == mEnd && bias == (node.insertLeft ? "left" : "right"))
          collapse = bias;
        if (bias == "left" && start == 0)
          while (i && map[i - 2] == map[i - 3] && map[i - 1].insertLeft) {
            node = map[(i -= 3) + 2];
            collapse = "left";
          }
        if (bias == "right" && start == mEnd - mStart)
          while (i < map.length - 3 && map[i + 3] == map[i + 4] && !map[i + 5].insertLeft) {
            node = map[(i += 3) + 2];
            collapse = "right";
          }
        break;
      }
    }
    return {node: node, start: start, end: end, collapse: collapse, coverStart: mStart, coverEnd: mEnd};
  }

  function measureCharInner(cm, prepared, ch, bias) {
    var place = nodeAndOffsetInLineMap(prepared.map, ch, bias);
    var node = place.node, start = place.start, end = place.end, collapse = place.collapse;

    var rect;
    if (node.nodeType == 3) { // If it is a text node, use a range to retrieve the coordinates.
      for (var i = 0; i < 4; i++) { // Retry a maximum of 4 times when nonsense rectangles are returned
        while (start && isExtendingChar(prepared.line.text.charAt(place.coverStart + start))) --start;
        while (place.coverStart + end < place.coverEnd && isExtendingChar(prepared.line.text.charAt(place.coverStart + end))) ++end;
        if (ie && ie_version < 9 && start == 0 && end == place.coverEnd - place.coverStart) {
          rect = node.parentNode.getBoundingClientRect();
        } else if (ie && cm.options.lineWrapping) {
          var rects = range(node, start, end).getClientRects();
          if (rects.length)
            rect = rects[bias == "right" ? rects.length - 1 : 0];
          else
            rect = nullRect;
        } else {
          rect = range(node, start, end).getBoundingClientRect() || nullRect;
        }
        if (rect.left || rect.right || start == 0) break;
        end = start;
        start = start - 1;
        collapse = "right";
      }
      if (ie && ie_version < 11) rect = maybeUpdateRectForZooming(cm.display.measure, rect);
    } else { // If it is a widget, simply get the box for the whole widget.
      if (start > 0) collapse = bias = "right";
      var rects;
      if (cm.options.lineWrapping && (rects = node.getClientRects()).length > 1)
        rect = rects[bias == "right" ? rects.length - 1 : 0];
      else
        rect = node.getBoundingClientRect();
    }
    if (ie && ie_version < 9 && !start && (!rect || !rect.left && !rect.right)) {
      var rSpan = node.parentNode.getClientRects()[0];
      if (rSpan)
        rect = {left: rSpan.left, right: rSpan.left + charWidth(cm.display), top: rSpan.top, bottom: rSpan.bottom};
      else
        rect = nullRect;
    }

    var rtop = rect.top - prepared.rect.top, rbot = rect.bottom - prepared.rect.top;
    var mid = (rtop + rbot) / 2;
    var heights = prepared.view.measure.heights;
    for (var i = 0; i < heights.length - 1; i++)
      if (mid < heights[i]) break;
    var top = i ? heights[i - 1] : 0, bot = heights[i];
    var result = {left: (collapse == "right" ? rect.right : rect.left) - prepared.rect.left,
                  right: (collapse == "left" ? rect.left : rect.right) - prepared.rect.left,
                  top: top, bottom: bot};
    if (!rect.left && !rect.right) result.bogus = true;
    if (!cm.options.singleCursorHeightPerLine) { result.rtop = rtop; result.rbottom = rbot; }

    return result;
  }

  // Work around problem with bounding client rects on ranges being
  // returned incorrectly when zoomed on IE10 and below.
  function maybeUpdateRectForZooming(measure, rect) {
    if (!window.screen || screen.logicalXDPI == null ||
        screen.logicalXDPI == screen.deviceXDPI || !hasBadZoomedRects(measure))
      return rect;
    var scaleX = screen.logicalXDPI / screen.deviceXDPI;
    var scaleY = screen.logicalYDPI / screen.deviceYDPI;
    return {left: rect.left * scaleX, right: rect.right * scaleX,
            top: rect.top * scaleY, bottom: rect.bottom * scaleY};
  }

  function clearLineMeasurementCacheFor(lineView) {
    if (lineView.measure) {
      lineView.measure.cache = {};
      lineView.measure.heights = null;
      if (lineView.rest) for (var i = 0; i < lineView.rest.length; i++)
        lineView.measure.caches[i] = {};
    }
  }

  function clearLineMeasurementCache(cm) {
    cm.display.externalMeasure = null;
    removeChildren(cm.display.lineMeasure);
    for (var i = 0; i < cm.display.view.length; i++)
      clearLineMeasurementCacheFor(cm.display.view[i]);
  }

  function clearCaches(cm) {
    clearLineMeasurementCache(cm);
    cm.display.cachedCharWidth = cm.display.cachedTextHeight = cm.display.cachedPaddingH = null;
    if (!cm.options.lineWrapping) cm.display.maxLineChanged = true;
    cm.display.lineNumChars = null;
  }

  function pageScrollX() { return window.pageXOffset || (document.documentElement || document.body).scrollLeft; }
  function pageScrollY() { return window.pageYOffset || (document.documentElement || document.body).scrollTop; }

  // Converts a {top, bottom, left, right} box from line-local
  // coordinates into another coordinate system. Context may be one of
  // "line", "div" (display.lineDiv), "local"/null (editor), "window",
  // or "page".
  function intoCoordSystem(cm, lineObj, rect, context) {
    if (lineObj.widgets) for (var i = 0; i < lineObj.widgets.length; ++i) if (lineObj.widgets[i].above) {
      var size = widgetHeight(lineObj.widgets[i]);
      rect.top += size; rect.bottom += size;
    }
    if (context == "line") return rect;
    if (!context) context = "local";
    var yOff = heightAtLine(lineObj);
    if (context == "local") yOff += paddingTop(cm.display);
    else yOff -= cm.display.viewOffset;
    if (context == "page" || context == "window") {
      var lOff = cm.display.lineSpace.getBoundingClientRect();
      yOff += lOff.top + (context == "window" ? 0 : pageScrollY());
      var xOff = lOff.left + (context == "window" ? 0 : pageScrollX());
      rect.left += xOff; rect.right += xOff;
    }
    rect.top += yOff; rect.bottom += yOff;
    return rect;
  }

  // Coverts a box from "div" coords to another coordinate system.
  // Context may be "window", "page", "div", or "local"/null.
  function fromCoordSystem(cm, coords, context) {
    if (context == "div") return coords;
    var left = coords.left, top = coords.top;
    // First move into "page" coordinate system
    if (context == "page") {
      left -= pageScrollX();
      top -= pageScrollY();
    } else if (context == "local" || !context) {
      var localBox = cm.display.sizer.getBoundingClientRect();
      left += localBox.left;
      top += localBox.top;
    }

    var lineSpaceBox = cm.display.lineSpace.getBoundingClientRect();
    return {left: left - lineSpaceBox.left, top: top - lineSpaceBox.top};
  }

  function charCoords(cm, pos, context, lineObj, bias) {
    if (!lineObj) lineObj = getLine(cm.doc, pos.line);
    return intoCoordSystem(cm, lineObj, measureChar(cm, lineObj, pos.ch, bias), context);
  }

  // Returns a box for a given cursor position, which may have an
  // 'other' property containing the position of the secondary cursor
  // on a bidi boundary.
  function cursorCoords(cm, pos, context, lineObj, preparedMeasure, varHeight) {
    lineObj = lineObj || getLine(cm.doc, pos.line);
    if (!preparedMeasure) preparedMeasure = prepareMeasureForLine(cm, lineObj);
    function get(ch, right) {
      var m = measureCharPrepared(cm, preparedMeasure, ch, right ? "right" : "left", varHeight);
      if (right) m.left = m.right; else m.right = m.left;
      return intoCoordSystem(cm, lineObj, m, context);
    }
    function getBidi(ch, partPos) {
      var part = order[partPos], right = part.level % 2;
      if (ch == bidiLeft(part) && partPos && part.level < order[partPos - 1].level) {
        part = order[--partPos];
        ch = bidiRight(part) - (part.level % 2 ? 0 : 1);
        right = true;
      } else if (ch == bidiRight(part) && partPos < order.length - 1 && part.level < order[partPos + 1].level) {
        part = order[++partPos];
        ch = bidiLeft(part) - part.level % 2;
        right = false;
      }
      if (right && ch == part.to && ch > part.from) return get(ch - 1);
      return get(ch, right);
    }
    var order = getOrder(lineObj), ch = pos.ch;
    if (!order) return get(ch);
    var partPos = getBidiPartAt(order, ch);
    var val = getBidi(ch, partPos);
    if (bidiOther != null) val.other = getBidi(ch, bidiOther);
    return val;
  }

  // Used to cheaply estimate the coordinates for a position. Used for
  // intermediate scroll updates.
  function estimateCoords(cm, pos) {
    var left = 0, pos = clipPos(cm.doc, pos);
    if (!cm.options.lineWrapping) left = charWidth(cm.display) * pos.ch;
    var lineObj = getLine(cm.doc, pos.line);
    var top = heightAtLine(lineObj) + paddingTop(cm.display);
    return {left: left, right: left, top: top, bottom: top + lineObj.height};
  }

  // Positions returned by coordsChar contain some extra information.
  // xRel is the relative x position of the input coordinates compared
  // to the found position (so xRel > 0 means the coordinates are to
  // the right of the character position, for example). When outside
  // is true, that means the coordinates lie outside the line's
  // vertical range.
  function PosWithInfo(line, ch, outside, xRel) {
    var pos = Pos(line, ch);
    pos.xRel = xRel;
    if (outside) pos.outside = true;
    return pos;
  }

  // Compute the character position closest to the given coordinates.
  // Input must be lineSpace-local ("div" coordinate system).
  function coordsChar(cm, x, y) {
    var doc = cm.doc;
    y += cm.display.viewOffset;
    if (y < 0) return PosWithInfo(doc.first, 0, true, -1);
    var lineN = lineAtHeight(doc, y), last = doc.first + doc.size - 1;
    if (lineN > last)
      return PosWithInfo(doc.first + doc.size - 1, getLine(doc, last).text.length, true, 1);
    if (x < 0) x = 0;

    var lineObj = getLine(doc, lineN);
    for (;;) {
      var found = coordsCharInner(cm, lineObj, lineN, x, y);
      var merged = collapsedSpanAtEnd(lineObj);
      var mergedPos = merged && merged.find(0, true);
      if (merged && (found.ch > mergedPos.from.ch || found.ch == mergedPos.from.ch && found.xRel > 0))
        lineN = lineNo(lineObj = mergedPos.to.line);
      else
        return found;
    }
  }

  function coordsCharInner(cm, lineObj, lineNo, x, y) {
    var innerOff = y - heightAtLine(lineObj);
    var wrongLine = false, adjust = 2 * cm.display.wrapper.clientWidth;
    var preparedMeasure = prepareMeasureForLine(cm, lineObj);

    function getX(ch) {
      var sp = cursorCoords(cm, Pos(lineNo, ch), "line", lineObj, preparedMeasure);
      wrongLine = true;
      if (innerOff > sp.bottom) return sp.left - adjust;
      else if (innerOff < sp.top) return sp.left + adjust;
      else wrongLine = false;
      return sp.left;
    }

    var bidi = getOrder(lineObj), dist = lineObj.text.length;
    var from = lineLeft(lineObj), to = lineRight(lineObj);
    var fromX = getX(from), fromOutside = wrongLine, toX = getX(to), toOutside = wrongLine;

    if (x > toX) return PosWithInfo(lineNo, to, toOutside, 1);
    // Do a binary search between these bounds.
    for (;;) {
      if (bidi ? to == from || to == moveVisually(lineObj, from, 1) : to - from <= 1) {
        var ch = x < fromX || x - fromX <= toX - x ? from : to;
        var xDiff = x - (ch == from ? fromX : toX);
        while (isExtendingChar(lineObj.text.charAt(ch))) ++ch;
        var pos = PosWithInfo(lineNo, ch, ch == from ? fromOutside : toOutside,
                              xDiff < -1 ? -1 : xDiff > 1 ? 1 : 0);
        return pos;
      }
      var step = Math.ceil(dist / 2), middle = from + step;
      if (bidi) {
        middle = from;
        for (var i = 0; i < step; ++i) middle = moveVisually(lineObj, middle, 1);
      }
      var middleX = getX(middle);
      if (middleX > x) {to = middle; toX = middleX; if (toOutside = wrongLine) toX += 1000; dist = step;}
      else {from = middle; fromX = middleX; fromOutside = wrongLine; dist -= step;}
    }
  }

  var measureText;
  // Compute the default text height.
  function textHeight(display) {
    if (display.cachedTextHeight != null) return display.cachedTextHeight;
    if (measureText == null) {
      measureText = elt("pre");
      // Measure a bunch of lines, for browsers that compute
      // fractional heights.
      for (var i = 0; i < 49; ++i) {
        measureText.appendChild(document.createTextNode("x"));
        measureText.appendChild(elt("br"));
      }
      measureText.appendChild(document.createTextNode("x"));
    }
    removeChildrenAndAdd(display.measure, measureText);
    var height = measureText.offsetHeight / 50;
    if (height > 3) display.cachedTextHeight = height;
    removeChildren(display.measure);
    return height || 1;
  }

  // Compute the default character width.
  function charWidth(display) {
    if (display.cachedCharWidth != null) return display.cachedCharWidth;
    var anchor = elt("span", "xxxxxxxxxx");
    var pre = elt("pre", [anchor]);
    removeChildrenAndAdd(display.measure, pre);
    var rect = anchor.getBoundingClientRect(), width = (rect.right - rect.left) / 10;
    if (width > 2) display.cachedCharWidth = width;
    return width || 10;
  }

  // OPERATIONS

  // Operations are used to wrap a series of changes to the editor
  // state in such a way that each change won't have to update the
  // cursor and display (which would be awkward, slow, and
  // error-prone). Instead, display updates are batched and then all
  // combined and executed at once.

  var operationGroup = null;

  var nextOpId = 0;
  // Start a new operation.
  function startOperation(cm) {
    cm.curOp = {
      cm: cm,
      viewChanged: false,      // Flag that indicates that lines might need to be redrawn
      startHeight: cm.doc.height, // Used to detect need to update scrollbar
      forceUpdate: false,      // Used to force a redraw
      updateInput: null,       // Whether to reset the input textarea
      typing: false,           // Whether this reset should be careful to leave existing text (for compositing)
      changeObjs: null,        // Accumulated changes, for firing change events
      cursorActivityHandlers: null, // Set of handlers to fire cursorActivity on
      cursorActivityCalled: 0, // Tracks which cursorActivity handlers have been called already
      selectionChanged: false, // Whether the selection needs to be redrawn
      updateMaxLine: false,    // Set when the widest line needs to be determined anew
      scrollLeft: null, scrollTop: null, // Intermediate scroll position, not pushed to DOM yet
      scrollToPos: null,       // Used to scroll to a specific position
      focus: false,
      id: ++nextOpId           // Unique ID
    };
    if (operationGroup) {
      operationGroup.ops.push(cm.curOp);
    } else {
      cm.curOp.ownsGroup = operationGroup = {
        ops: [cm.curOp],
        delayedCallbacks: []
      };
    }
  }

  function fireCallbacksForOps(group) {
    // Calls delayed callbacks and cursorActivity handlers until no
    // new ones appear
    var callbacks = group.delayedCallbacks, i = 0;
    do {
      for (; i < callbacks.length; i++)
        callbacks[i].call(null);
      for (var j = 0; j < group.ops.length; j++) {
        var op = group.ops[j];
        if (op.cursorActivityHandlers)
          while (op.cursorActivityCalled < op.cursorActivityHandlers.length)
            op.cursorActivityHandlers[op.cursorActivityCalled++].call(null, op.cm);
      }
    } while (i < callbacks.length);
  }

  // Finish an operation, updating the display and signalling delayed events
  function endOperation(cm) {
    var op = cm.curOp, group = op.ownsGroup;
    if (!group) return;

    try { fireCallbacksForOps(group); }
    finally {
      operationGroup = null;
      for (var i = 0; i < group.ops.length; i++)
        group.ops[i].cm.curOp = null;
      endOperations(group);
    }
  }

  // The DOM updates done when an operation finishes are batched so
  // that the minimum number of relayouts are required.
  function endOperations(group) {
    var ops = group.ops;
    for (var i = 0; i < ops.length; i++) // Read DOM
      endOperation_R1(ops[i]);
    for (var i = 0; i < ops.length; i++) // Write DOM (maybe)
      endOperation_W1(ops[i]);
    for (var i = 0; i < ops.length; i++) // Read DOM
      endOperation_R2(ops[i]);
    for (var i = 0; i < ops.length; i++) // Write DOM (maybe)
      endOperation_W2(ops[i]);
    for (var i = 0; i < ops.length; i++) // Read DOM
      endOperation_finish(ops[i]);
  }

  function endOperation_R1(op) {
    var cm = op.cm, display = cm.display;
    maybeClipScrollbars(cm);
    if (op.updateMaxLine) findMaxLine(cm);

    op.mustUpdate = op.viewChanged || op.forceUpdate || op.scrollTop != null ||
      op.scrollToPos && (op.scrollToPos.from.line < display.viewFrom ||
                         op.scrollToPos.to.line >= display.viewTo) ||
      display.maxLineChanged && cm.options.lineWrapping;
    op.update = op.mustUpdate &&
      new DisplayUpdate(cm, op.mustUpdate && {top: op.scrollTop, ensure: op.scrollToPos}, op.forceUpdate);
  }

  function endOperation_W1(op) {
    op.updatedDisplay = op.mustUpdate && updateDisplayIfNeeded(op.cm, op.update);
  }

  function endOperation_R2(op) {
    var cm = op.cm, display = cm.display;
    if (op.updatedDisplay) updateHeightsInViewport(cm);

    op.barMeasure = measureForScrollbars(cm);

    // If the max line changed since it was last measured, measure it,
    // and ensure the document's width matches it.
    // updateDisplay_W2 will use these properties to do the actual resizing
    if (display.maxLineChanged && !cm.options.lineWrapping) {
      op.adjustWidthTo = measureChar(cm, display.maxLine, display.maxLine.text.length).left + 3;
      cm.display.sizerWidth = op.adjustWidthTo;
      op.barMeasure.scrollWidth =
        Math.max(display.scroller.clientWidth, display.sizer.offsetLeft + op.adjustWidthTo + scrollGap(cm) + cm.display.barWidth);
      op.maxScrollLeft = Math.max(0, display.sizer.offsetLeft + op.adjustWidthTo - displayWidth(cm));
    }

    if (op.updatedDisplay || op.selectionChanged)
      op.preparedSelection = display.input.prepareSelection();
  }

  function endOperation_W2(op) {
    var cm = op.cm;

    if (op.adjustWidthTo != null) {
      cm.display.sizer.style.minWidth = op.adjustWidthTo + "px";
      if (op.maxScrollLeft < cm.doc.scrollLeft)
        setScrollLeft(cm, Math.min(cm.display.scroller.scrollLeft, op.maxScrollLeft), true);
      cm.display.maxLineChanged = false;
    }

    if (op.preparedSelection)
      cm.display.input.showSelection(op.preparedSelection);
    if (op.updatedDisplay)
      setDocumentHeight(cm, op.barMeasure);
    if (op.updatedDisplay || op.startHeight != cm.doc.height)
      updateScrollbars(cm, op.barMeasure);

    if (op.selectionChanged) restartBlink(cm);

    if (cm.state.focused && op.updateInput)
      cm.display.input.reset(op.typing);
    if (op.focus && op.focus == activeElt()) ensureFocus(op.cm);
  }

  function endOperation_finish(op) {
    var cm = op.cm, display = cm.display, doc = cm.doc;

    if (op.updatedDisplay) postUpdateDisplay(cm, op.update);

    // Abort mouse wheel delta measurement, when scrolling explicitly
    if (display.wheelStartX != null && (op.scrollTop != null || op.scrollLeft != null || op.scrollToPos))
      display.wheelStartX = display.wheelStartY = null;

    // Propagate the scroll position to the actual DOM scroller
    if (op.scrollTop != null && (display.scroller.scrollTop != op.scrollTop || op.forceScroll)) {
      doc.scrollTop = Math.max(0, Math.min(display.scroller.scrollHeight - display.scroller.clientHeight, op.scrollTop));
      display.scrollbars.setScrollTop(doc.scrollTop);
      display.scroller.scrollTop = doc.scrollTop;
    }
    if (op.scrollLeft != null && (display.scroller.scrollLeft != op.scrollLeft || op.forceScroll)) {
      doc.scrollLeft = Math.max(0, Math.min(display.scroller.scrollWidth - displayWidth(cm), op.scrollLeft));
      display.scrollbars.setScrollLeft(doc.scrollLeft);
      display.scroller.scrollLeft = doc.scrollLeft;
      alignHorizontally(cm);
    }
    // If we need to scroll a specific position into view, do so.
    if (op.scrollToPos) {
      var coords = scrollPosIntoView(cm, clipPos(doc, op.scrollToPos.from),
                                     clipPos(doc, op.scrollToPos.to), op.scrollToPos.margin);
      if (op.scrollToPos.isCursor && cm.state.focused) maybeScrollWindow(cm, coords);
    }

    // Fire events for markers that are hidden/unidden by editing or
    // undoing
    var hidden = op.maybeHiddenMarkers, unhidden = op.maybeUnhiddenMarkers;
    if (hidden) for (var i = 0; i < hidden.length; ++i)
      if (!hidden[i].lines.length) signal(hidden[i], "hide");
    if (unhidden) for (var i = 0; i < unhidden.length; ++i)
      if (unhidden[i].lines.length) signal(unhidden[i], "unhide");

    if (display.wrapper.offsetHeight)
      doc.scrollTop = cm.display.scroller.scrollTop;

    // Fire change events, and delayed event handlers
    if (op.changeObjs)
      signal(cm, "changes", cm, op.changeObjs);
    if (op.update)
      op.update.finish();
  }

  // Run the given function in an operation
  function runInOp(cm, f) {
    if (cm.curOp) return f();
    startOperation(cm);
    try { return f(); }
    finally { endOperation(cm); }
  }
  // Wraps a function in an operation. Returns the wrapped function.
  function operation(cm, f) {
    return function() {
      if (cm.curOp) return f.apply(cm, arguments);
      startOperation(cm);
      try { return f.apply(cm, arguments); }
      finally { endOperation(cm); }
    };
  }
  // Used to add methods to editor and doc instances, wrapping them in
  // operations.
  function methodOp(f) {
    return function() {
      if (this.curOp) return f.apply(this, arguments);
      startOperation(this);
      try { return f.apply(this, arguments); }
      finally { endOperation(this); }
    };
  }
  function docMethodOp(f) {
    return function() {
      var cm = this.cm;
      if (!cm || cm.curOp) return f.apply(this, arguments);
      startOperation(cm);
      try { return f.apply(this, arguments); }
      finally { endOperation(cm); }
    };
  }

  // VIEW TRACKING

  // These objects are used to represent the visible (currently drawn)
  // part of the document. A LineView may correspond to multiple
  // logical lines, if those are connected by collapsed ranges.
  function LineView(doc, line, lineN) {
    // The starting line
    this.line = line;
    // Continuing lines, if any
    this.rest = visualLineContinued(line);
    // Number of logical lines in this visual line
    this.size = this.rest ? lineNo(lst(this.rest)) - lineN + 1 : 1;
    this.node = this.text = null;
    this.hidden = lineIsHidden(doc, line);
  }

  // Create a range of LineView objects for the given lines.
  function buildViewArray(cm, from, to) {
    var array = [], nextPos;
    for (var pos = from; pos < to; pos = nextPos) {
      var view = new LineView(cm.doc, getLine(cm.doc, pos), pos);
      nextPos = pos + view.size;
      array.push(view);
    }
    return array;
  }

  // Updates the display.view data structure for a given change to the
  // document. From and to are in pre-change coordinates. Lendiff is
  // the amount of lines added or subtracted by the change. This is
  // used for changes that span multiple lines, or change the way
  // lines are divided into visual lines. regLineChange (below)
  // registers single-line changes.
  function regChange(cm, from, to, lendiff) {
    if (from == null) from = cm.doc.first;
    if (to == null) to = cm.doc.first + cm.doc.size;
    if (!lendiff) lendiff = 0;

    var display = cm.display;
    if (lendiff && to < display.viewTo &&
        (display.updateLineNumbers == null || display.updateLineNumbers > from))
      display.updateLineNumbers = from;

    cm.curOp.viewChanged = true;

    if (from >= display.viewTo) { // Change after
      if (sawCollapsedSpans && visualLineNo(cm.doc, from) < display.viewTo)
        resetView(cm);
    } else if (to <= display.viewFrom) { // Change before
      if (sawCollapsedSpans && visualLineEndNo(cm.doc, to + lendiff) > display.viewFrom) {
        resetView(cm);
      } else {
        display.viewFrom += lendiff;
        display.viewTo += lendiff;
      }
    } else if (from <= display.viewFrom && to >= display.viewTo) { // Full overlap
      resetView(cm);
    } else if (from <= display.viewFrom) { // Top overlap
      var cut = viewCuttingPoint(cm, to, to + lendiff, 1);
      if (cut) {
        display.view = display.view.slice(cut.index);
        display.viewFrom = cut.lineN;
        display.viewTo += lendiff;
      } else {
        resetView(cm);
      }
    } else if (to >= display.viewTo) { // Bottom overlap
      var cut = viewCuttingPoint(cm, from, from, -1);
      if (cut) {
        display.view = display.view.slice(0, cut.index);
        display.viewTo = cut.lineN;
      } else {
        resetView(cm);
      }
    } else { // Gap in the middle
      var cutTop = viewCuttingPoint(cm, from, from, -1);
      var cutBot = viewCuttingPoint(cm, to, to + lendiff, 1);
      if (cutTop && cutBot) {
        display.view = display.view.slice(0, cutTop.index)
          .concat(buildViewArray(cm, cutTop.lineN, cutBot.lineN))
          .concat(display.view.slice(cutBot.index));
        display.viewTo += lendiff;
      } else {
        resetView(cm);
      }
    }

    var ext = display.externalMeasured;
    if (ext) {
      if (to < ext.lineN)
        ext.lineN += lendiff;
      else if (from < ext.lineN + ext.size)
        display.externalMeasured = null;
    }
  }

  // Register a change to a single line. Type must be one of "text",
  // "gutter", "class", "widget"
  function regLineChange(cm, line, type) {
    cm.curOp.viewChanged = true;
    var display = cm.display, ext = cm.display.externalMeasured;
    if (ext && line >= ext.lineN && line < ext.lineN + ext.size)
      display.externalMeasured = null;

    if (line < display.viewFrom || line >= display.viewTo) return;
    var lineView = display.view[findViewIndex(cm, line)];
    if (lineView.node == null) return;
    var arr = lineView.changes || (lineView.changes = []);
    if (indexOf(arr, type) == -1) arr.push(type);
  }

  // Clear the view.
  function resetView(cm) {
    cm.display.viewFrom = cm.display.viewTo = cm.doc.first;
    cm.display.view = [];
    cm.display.viewOffset = 0;
  }

  // Find the view element corresponding to a given line. Return null
  // when the line isn't visible.
  function findViewIndex(cm, n) {
    if (n >= cm.display.viewTo) return null;
    n -= cm.display.viewFrom;
    if (n < 0) return null;
    var view = cm.display.view;
    for (var i = 0; i < view.length; i++) {
      n -= view[i].size;
      if (n < 0) return i;
    }
  }

  function viewCuttingPoint(cm, oldN, newN, dir) {
    var index = findViewIndex(cm, oldN), diff, view = cm.display.view;
    if (!sawCollapsedSpans || newN == cm.doc.first + cm.doc.size)
      return {index: index, lineN: newN};
    for (var i = 0, n = cm.display.viewFrom; i < index; i++)
      n += view[i].size;
    if (n != oldN) {
      if (dir > 0) {
        if (index == view.length - 1) return null;
        diff = (n + view[index].size) - oldN;
        index++;
      } else {
        diff = n - oldN;
      }
      oldN += diff; newN += diff;
    }
    while (visualLineNo(cm.doc, newN) != newN) {
      if (index == (dir < 0 ? 0 : view.length - 1)) return null;
      newN += dir * view[index - (dir < 0 ? 1 : 0)].size;
      index += dir;
    }
    return {index: index, lineN: newN};
  }

  // Force the view to cover a given range, adding empty view element
  // or clipping off existing ones as needed.
  function adjustView(cm, from, to) {
    var display = cm.display, view = display.view;
    if (view.length == 0 || from >= display.viewTo || to <= display.viewFrom) {
      display.view = buildViewArray(cm, from, to);
      display.viewFrom = from;
    } else {
      if (display.viewFrom > from)
        display.view = buildViewArray(cm, from, display.viewFrom).concat(display.view);
      else if (display.viewFrom < from)
        display.view = display.view.slice(findViewIndex(cm, from));
      display.viewFrom = from;
      if (display.viewTo < to)
        display.view = display.view.concat(buildViewArray(cm, display.viewTo, to));
      else if (display.viewTo > to)
        display.view = display.view.slice(0, findViewIndex(cm, to));
    }
    display.viewTo = to;
  }

  // Count the number of lines in the view whose DOM representation is
  // out of date (or nonexistent).
  function countDirtyView(cm) {
    var view = cm.display.view, dirty = 0;
    for (var i = 0; i < view.length; i++) {
      var lineView = view[i];
      if (!lineView.hidden && (!lineView.node || lineView.changes)) ++dirty;
    }
    return dirty;
  }

  // EVENT HANDLERS

  // Attach the necessary event handlers when initializing the editor
  function registerEventHandlers(cm) {
    var d = cm.display;
    on(d.scroller, "mousedown", operation(cm, onMouseDown));
    // Older IE's will not fire a second mousedown for a double click
    if (ie && ie_version < 11)
      on(d.scroller, "dblclick", operation(cm, function(e) {
        if (signalDOMEvent(cm, e)) return;
        var pos = posFromMouse(cm, e);
        if (!pos || clickInGutter(cm, e) || eventInWidget(cm.display, e)) return;
        e_preventDefault(e);
        var word = cm.findWordAt(pos);
        extendSelection(cm.doc, word.anchor, word.head);
      }));
    else
      on(d.scroller, "dblclick", function(e) { signalDOMEvent(cm, e) || e_preventDefault(e); });
    // Some browsers fire contextmenu *after* opening the menu, at
    // which point we can't mess with it anymore. Context menu is
    // handled in onMouseDown for these browsers.
    if (!captureRightClick) on(d.scroller, "contextmenu", function(e) {onContextMenu(cm, e);});

    // Used to suppress mouse event handling when a touch happens
    var touchFinished, prevTouch = {end: 0};
    function finishTouch() {
      if (d.activeTouch) {
        touchFinished = setTimeout(function() {d.activeTouch = null;}, 1000);
        prevTouch = d.activeTouch;
        prevTouch.end = +new Date;
      }
    };
    function isMouseLikeTouchEvent(e) {
      if (e.touches.length != 1) return false;
      var touch = e.touches[0];
      return touch.radiusX <= 1 && touch.radiusY <= 1;
    }
    function farAway(touch, other) {
      if (other.left == null) return true;
      var dx = other.left - touch.left, dy = other.top - touch.top;
      return dx * dx + dy * dy > 20 * 20;
    }
    on(d.scroller, "touchstart", function(e) {
      if (!isMouseLikeTouchEvent(e)) {
        clearTimeout(touchFinished);
        var now = +new Date;
        d.activeTouch = {start: now, moved: false,
                         prev: now - prevTouch.end <= 300 ? prevTouch : null};
        if (e.touches.length == 1) {
          d.activeTouch.left = e.touches[0].pageX;
          d.activeTouch.top = e.touches[0].pageY;
        }
      }
    });
    on(d.scroller, "touchmove", function() {
      if (d.activeTouch) d.activeTouch.moved = true;
    });
    on(d.scroller, "touchend", function(e) {
      var touch = d.activeTouch;
      if (touch && !eventInWidget(d, e) && touch.left != null &&
          !touch.moved && new Date - touch.start < 300) {
        var pos = cm.coordsChar(d.activeTouch, "page"), range;
        if (!touch.prev || farAway(touch, touch.prev)) // Single tap
          range = new Range(pos, pos);
        else if (!touch.prev.prev || farAway(touch, touch.prev.prev)) // Double tap
          range = cm.findWordAt(pos);
        else // Triple tap
          range = new Range(Pos(pos.line, 0), clipPos(cm.doc, Pos(pos.line + 1, 0)));
        cm.setSelection(range.anchor, range.head);
        cm.focus();
        e_preventDefault(e);
      }
      finishTouch();
    });
    on(d.scroller, "touchcancel", finishTouch);

    // Sync scrolling between fake scrollbars and real scrollable
    // area, ensure viewport is updated when scrolling.
    on(d.scroller, "scroll", function() {
      if (d.scroller.clientHeight) {
        setScrollTop(cm, d.scroller.scrollTop);
        setScrollLeft(cm, d.scroller.scrollLeft, true);
        signal(cm, "scroll", cm);
      }
    });

    // Listen to wheel events in order to try and update the viewport on time.
    on(d.scroller, "mousewheel", function(e){onScrollWheel(cm, e);});
    on(d.scroller, "DOMMouseScroll", function(e){onScrollWheel(cm, e);});

    // Prevent wrapper from ever scrolling
    on(d.wrapper, "scroll", function() { d.wrapper.scrollTop = d.wrapper.scrollLeft = 0; });

    d.dragFunctions = {
      enter: function(e) {if (!signalDOMEvent(cm, e)) e_stop(e);},
      over: function(e) {if (!signalDOMEvent(cm, e)) { onDragOver(cm, e); e_stop(e); }},
      start: function(e){onDragStart(cm, e);},
      drop: operation(cm, onDrop),
      leave: function() {clearDragCursor(cm);}
    };

    var inp = d.input.getField();
    on(inp, "keyup", function(e) { onKeyUp.call(cm, e); });
    on(inp, "keydown", operation(cm, onKeyDown));
    on(inp, "keypress", operation(cm, onKeyPress));
    on(inp, "focus", bind(onFocus, cm));
    on(inp, "blur", bind(onBlur, cm));
  }

  function dragDropChanged(cm, value, old) {
    var wasOn = old && old != CodeMirror.Init;
    if (!value != !wasOn) {
      var funcs = cm.display.dragFunctions;
      var toggle = value ? on : off;
      toggle(cm.display.scroller, "dragstart", funcs.start);
      toggle(cm.display.scroller, "dragenter", funcs.enter);
      toggle(cm.display.scroller, "dragover", funcs.over);
      toggle(cm.display.scroller, "dragleave", funcs.leave);
      toggle(cm.display.scroller, "drop", funcs.drop);
    }
  }

  // Called when the window resizes
  function onResize(cm) {
    var d = cm.display;
    if (d.lastWrapHeight == d.wrapper.clientHeight && d.lastWrapWidth == d.wrapper.clientWidth)
      return;
    // Might be a text scaling operation, clear size caches.
    d.cachedCharWidth = d.cachedTextHeight = d.cachedPaddingH = null;
    d.scrollbarsClipped = false;
    cm.setSize();
  }

  // MOUSE EVENTS

  // Return true when the given mouse event happened in a widget
  function eventInWidget(display, e) {
    for (var n = e_target(e); n != display.wrapper; n = n.parentNode) {
      if (!n || (n.nodeType == 1 && n.getAttribute("cm-ignore-events") == "true") ||
          (n.parentNode == display.sizer && n != display.mover))
        return true;
    }
  }

  // Given a mouse event, find the corresponding position. If liberal
  // is false, it checks whether a gutter or scrollbar was clicked,
  // and returns null if it was. forRect is used by rectangular
  // selections, and tries to estimate a character position even for
  // coordinates beyond the right of the text.
  function posFromMouse(cm, e, liberal, forRect) {
    var display = cm.display;
    if (!liberal && e_target(e).getAttribute("cm-not-content") == "true") return null;

    var x, y, space = display.lineSpace.getBoundingClientRect();
    // Fails unpredictably on IE[67] when mouse is dragged around quickly.
    try { x = e.clientX - space.left; y = e.clientY - space.top; }
    catch (e) { return null; }
    var coords = coordsChar(cm, x, y), line;
    if (forRect && coords.xRel == 1 && (line = getLine(cm.doc, coords.line).text).length == coords.ch) {
      var colDiff = countColumn(line, line.length, cm.options.tabSize) - line.length;
      coords = Pos(coords.line, Math.max(0, Math.round((x - paddingH(cm.display).left) / charWidth(cm.display)) - colDiff));
    }
    return coords;
  }

  // A mouse down can be a single click, double click, triple click,
  // start of selection drag, start of text drag, new cursor
  // (ctrl-click), rectangle drag (alt-drag), or xwin
  // middle-click-paste. Or it might be a click on something we should
  // not interfere with, such as a scrollbar or widget.
  function onMouseDown(e) {
    var cm = this, display = cm.display;
    if (display.activeTouch && display.input.supportsTouch() || signalDOMEvent(cm, e)) return;
    display.shift = e.shiftKey;

    if (eventInWidget(display, e)) {
      if (!webkit) {
        // Briefly turn off draggability, to allow widgets to do
        // normal dragging things.
        display.scroller.draggable = false;
        setTimeout(function(){display.scroller.draggable = true;}, 100);
      }
      return;
    }
    if (clickInGutter(cm, e)) return;
    var start = posFromMouse(cm, e);
    window.focus();

    switch (e_button(e)) {
    case 1:
      // #3261: make sure, that we're not starting a second selection
      if (cm.state.selectingText)
        cm.state.selectingText(e);
      else if (start)
        leftButtonDown(cm, e, start);
      else if (e_target(e) == display.scroller)
        e_preventDefault(e);
      break;
    case 2:
      if (webkit) cm.state.lastMiddleDown = +new Date;
      if (start) extendSelection(cm.doc, start);
      setTimeout(function() {display.input.focus();}, 20);
      e_preventDefault(e);
      break;
    case 3:
      if (captureRightClick) onContextMenu(cm, e);
      else delayBlurEvent(cm);
      break;
    }
  }

  var lastClick, lastDoubleClick;
  function leftButtonDown(cm, e, start) {
    if (ie) setTimeout(bind(ensureFocus, cm), 0);
    else cm.curOp.focus = activeElt();

    var now = +new Date, type;
    if (lastDoubleClick && lastDoubleClick.time > now - 400 && cmp(lastDoubleClick.pos, start) == 0) {
      type = "triple";
    } else if (lastClick && lastClick.time > now - 400 && cmp(lastClick.pos, start) == 0) {
      type = "double";
      lastDoubleClick = {time: now, pos: start};
    } else {
      type = "single";
      lastClick = {time: now, pos: start};
    }

    var sel = cm.doc.sel, modifier = mac ? e.metaKey : e.ctrlKey, contained;
    if (cm.options.dragDrop && dragAndDrop && !isReadOnly(cm) &&
        type == "single" && (contained = sel.contains(start)) > -1 &&
        (cmp((contained = sel.ranges[contained]).from(), start) < 0 || start.xRel > 0) &&
        (cmp(contained.to(), start) > 0 || start.xRel < 0))
      leftButtonStartDrag(cm, e, start, modifier);
    else
      leftButtonSelect(cm, e, start, type, modifier);
  }

  // Start a text drag. When it ends, see if any dragging actually
  // happen, and treat as a click if it didn't.
  function leftButtonStartDrag(cm, e, start, modifier) {
    var display = cm.display, startTime = +new Date;
    var dragEnd = operation(cm, function(e2) {
      if (webkit) display.scroller.draggable = false;
      cm.state.draggingText = false;
      off(document, "mouseup", dragEnd);
      off(display.scroller, "drop", dragEnd);
      if (Math.abs(e.clientX - e2.clientX) + Math.abs(e.clientY - e2.clientY) < 10) {
        e_preventDefault(e2);
        if (!modifier && +new Date - 200 < startTime)
          extendSelection(cm.doc, start);
        // Work around unexplainable focus problem in IE9 (#2127) and Chrome (#3081)
        if (webkit || ie && ie_version == 9)
          setTimeout(function() {document.body.focus(); display.input.focus();}, 20);
        else
          display.input.focus();
      }
    });
    // Let the drag handler handle this.
    if (webkit) display.scroller.draggable = true;
    cm.state.draggingText = dragEnd;
    // IE's approach to draggable
    if (display.scroller.dragDrop) display.scroller.dragDrop();
    on(document, "mouseup", dragEnd);
    on(display.scroller, "drop", dragEnd);
  }

  // Normal selection, as opposed to text dragging.
  function leftButtonSelect(cm, e, start, type, addNew) {
    var display = cm.display, doc = cm.doc;
    e_preventDefault(e);

    var ourRange, ourIndex, startSel = doc.sel, ranges = startSel.ranges;
    if (addNew && !e.shiftKey) {
      ourIndex = doc.sel.contains(start);
      if (ourIndex > -1)
        ourRange = ranges[ourIndex];
      else
        ourRange = new Range(start, start);
    } else {
      ourRange = doc.sel.primary();
      ourIndex = doc.sel.primIndex;
    }

    if (e.altKey) {
      type = "rect";
      if (!addNew) ourRange = new Range(start, start);
      start = posFromMouse(cm, e, true, true);
      ourIndex = -1;
    } else if (type == "double") {
      var word = cm.findWordAt(start);
      if (cm.display.shift || doc.extend)
        ourRange = extendRange(doc, ourRange, word.anchor, word.head);
      else
        ourRange = word;
    } else if (type == "triple") {
      var line = new Range(Pos(start.line, 0), clipPos(doc, Pos(start.line + 1, 0)));
      if (cm.display.shift || doc.extend)
        ourRange = extendRange(doc, ourRange, line.anchor, line.head);
      else
        ourRange = line;
    } else {
      ourRange = extendRange(doc, ourRange, start);
    }

    if (!addNew) {
      ourIndex = 0;
      setSelection(doc, new Selection([ourRange], 0), sel_mouse);
      startSel = doc.sel;
    } else if (ourIndex == -1) {
      ourIndex = ranges.length;
      setSelection(doc, normalizeSelection(ranges.concat([ourRange]), ourIndex),
                   {scroll: false, origin: "*mouse"});
    } else if (ranges.length > 1 && ranges[ourIndex].empty() && type == "single" && !e.shiftKey) {
      setSelection(doc, normalizeSelection(ranges.slice(0, ourIndex).concat(ranges.slice(ourIndex + 1)), 0),
                   {scroll: false, origin: "*mouse"});
      startSel = doc.sel;
    } else {
      replaceOneSelection(doc, ourIndex, ourRange, sel_mouse);
    }

    var lastPos = start;
    function extendTo(pos) {
      if (cmp(lastPos, pos) == 0) return;
      lastPos = pos;

      if (type == "rect") {
        var ranges = [], tabSize = cm.options.tabSize;
        var startCol = countColumn(getLine(doc, start.line).text, start.ch, tabSize);
        var posCol = countColumn(getLine(doc, pos.line).text, pos.ch, tabSize);
        var left = Math.min(startCol, posCol), right = Math.max(startCol, posCol);
        for (var line = Math.min(start.line, pos.line), end = Math.min(cm.lastLine(), Math.max(start.line, pos.line));
             line <= end; line++) {
          var text = getLine(doc, line).text, leftPos = findColumn(text, left, tabSize);
          if (left == right)
            ranges.push(new Range(Pos(line, leftPos), Pos(line, leftPos)));
          else if (text.length > leftPos)
            ranges.push(new Range(Pos(line, leftPos), Pos(line, findColumn(text, right, tabSize))));
        }
        if (!ranges.length) ranges.push(new Range(start, start));
        setSelection(doc, normalizeSelection(startSel.ranges.slice(0, ourIndex).concat(ranges), ourIndex),
                     {origin: "*mouse", scroll: false});
        cm.scrollIntoView(pos);
      } else {
        var oldRange = ourRange;
        var anchor = oldRange.anchor, head = pos;
        if (type != "single") {
          if (type == "double")
            var range = cm.findWordAt(pos);
          else
            var range = new Range(Pos(pos.line, 0), clipPos(doc, Pos(pos.line + 1, 0)));
          if (cmp(range.anchor, anchor) > 0) {
            head = range.head;
            anchor = minPos(oldRange.from(), range.anchor);
          } else {
            head = range.anchor;
            anchor = maxPos(oldRange.to(), range.head);
          }
        }
        var ranges = startSel.ranges.slice(0);
        ranges[ourIndex] = new Range(clipPos(doc, anchor), head);
        setSelection(doc, normalizeSelection(ranges, ourIndex), sel_mouse);
      }
    }

    var editorSize = display.wrapper.getBoundingClientRect();
    // Used to ensure timeout re-tries don't fire when another extend
    // happened in the meantime (clearTimeout isn't reliable -- at
    // least on Chrome, the timeouts still happen even when cleared,
    // if the clear happens after their scheduled firing time).
    var counter = 0;

    function extend(e) {
      var curCount = ++counter;
      var cur = posFromMouse(cm, e, true, type == "rect");
      if (!cur) return;
      if (cmp(cur, lastPos) != 0) {
        cm.curOp.focus = activeElt();
        extendTo(cur);
        var visible = visibleLines(display, doc);
        if (cur.line >= visible.to || cur.line < visible.from)
          setTimeout(operation(cm, function(){if (counter == curCount) extend(e);}), 150);
      } else {
        var outside = e.clientY < editorSize.top ? -20 : e.clientY > editorSize.bottom ? 20 : 0;
        if (outside) setTimeout(operation(cm, function() {
          if (counter != curCount) return;
          display.scroller.scrollTop += outside;
          extend(e);
        }), 50);
      }
    }

    function done(e) {
      cm.state.selectingText = false;
      counter = Infinity;
      e_preventDefault(e);
      display.input.focus();
      off(document, "mousemove", move);
      off(document, "mouseup", up);
      doc.history.lastSelOrigin = null;
    }

    var move = operation(cm, function(e) {
      if (!e_button(e)) done(e);
      else extend(e);
    });
    var up = operation(cm, done);
    cm.state.selectingText = up;
    on(document, "mousemove", move);
    on(document, "mouseup", up);
  }

  // Determines whether an event happened in the gutter, and fires the
  // handlers for the corresponding event.
  function gutterEvent(cm, e, type, prevent, signalfn) {
    try { var mX = e.clientX, mY = e.clientY; }
    catch(e) { return false; }
    if (mX >= Math.floor(cm.display.gutters.getBoundingClientRect().right)) return false;
    if (prevent) e_preventDefault(e);

    var display = cm.display;
    var lineBox = display.lineDiv.getBoundingClientRect();

    if (mY > lineBox.bottom || !hasHandler(cm, type)) return e_defaultPrevented(e);
    mY -= lineBox.top - display.viewOffset;

    for (var i = 0; i < cm.options.gutters.length; ++i) {
      var g = display.gutters.childNodes[i];
      if (g && g.getBoundingClientRect().right >= mX) {
        var line = lineAtHeight(cm.doc, mY);
        var gutter = cm.options.gutters[i];
        signalfn(cm, type, cm, line, gutter, e);
        return e_defaultPrevented(e);
      }
    }
  }

  function clickInGutter(cm, e) {
    return gutterEvent(cm, e, "gutterClick", true, signalLater);
  }

  // Kludge to work around strange IE behavior where it'll sometimes
  // re-fire a series of drag-related events right after the drop (#1551)
  var lastDrop = 0;

  function onDrop(e) {
    var cm = this;
    clearDragCursor(cm);
    if (signalDOMEvent(cm, e) || eventInWidget(cm.display, e))
      return;
    e_preventDefault(e);
    if (ie) lastDrop = +new Date;
    var pos = posFromMouse(cm, e, true), files = e.dataTransfer.files;
    if (!pos || isReadOnly(cm)) return;
    // Might be a file drop, in which case we simply extract the text
    // and insert it.
    if (files && files.length && window.FileReader && window.File) {
      var n = files.length, text = Array(n), read = 0;
      var loadFile = function(file, i) {
        var reader = new FileReader;
        reader.onload = operation(cm, function() {
          text[i] = reader.result;
          if (++read == n) {
            pos = clipPos(cm.doc, pos);
            var change = {from: pos, to: pos,
                          text: cm.doc.splitLines(text.join(cm.doc.lineSeparator())),
                          origin: "paste"};
            makeChange(cm.doc, change);
            setSelectionReplaceHistory(cm.doc, simpleSelection(pos, changeEnd(change)));
          }
        });
        reader.readAsText(file);
      };
      for (var i = 0; i < n; ++i) loadFile(files[i], i);
    } else { // Normal drop
      // Don't do a replace if the drop happened inside of the selected text.
      if (cm.state.draggingText && cm.doc.sel.contains(pos) > -1) {
        cm.state.draggingText(e);
        // Ensure the editor is re-focused
        setTimeout(function() {cm.display.input.focus();}, 20);
        return;
      }
      try {
        var text = e.dataTransfer.getData("Text");
        if (text) {
          if (cm.state.draggingText && !(mac ? e.altKey : e.ctrlKey))
            var selected = cm.listSelections();
          setSelectionNoUndo(cm.doc, simpleSelection(pos, pos));
          if (selected) for (var i = 0; i < selected.length; ++i)
            replaceRange(cm.doc, "", selected[i].anchor, selected[i].head, "drag");
          cm.replaceSelection(text, "around", "paste");
          cm.display.input.focus();
        }
      }
      catch(e){}
    }
  }

  function onDragStart(cm, e) {
    if (ie && (!cm.state.draggingText || +new Date - lastDrop < 100)) { e_stop(e); return; }
    if (signalDOMEvent(cm, e) || eventInWidget(cm.display, e)) return;

    e.dataTransfer.setData("Text", cm.getSelection());

    // Use dummy image instead of default browsers image.
    // Recent Safari (~6.0.2) have a tendency to segfault when this happens, so we don't do it there.
    if (e.dataTransfer.setDragImage && !safari) {
      var img = elt("img", null, null, "position: fixed; left: 0; top: 0;");
      img.src = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
      if (presto) {
        img.width = img.height = 1;
        cm.display.wrapper.appendChild(img);
        // Force a relayout, or Opera won't use our image for some obscure reason
        img._top = img.offsetTop;
      }
      e.dataTransfer.setDragImage(img, 0, 0);
      if (presto) img.parentNode.removeChild(img);
    }
  }

  function onDragOver(cm, e) {
    var pos = posFromMouse(cm, e);
    if (!pos) return;
    var frag = document.createDocumentFragment();
    drawSelectionCursor(cm, pos, frag);
    if (!cm.display.dragCursor) {
      cm.display.dragCursor = elt("div", null, "CodeMirror-cursors CodeMirror-dragcursors");
      cm.display.lineSpace.insertBefore(cm.display.dragCursor, cm.display.cursorDiv);
    }
    removeChildrenAndAdd(cm.display.dragCursor, frag);
  }

  function clearDragCursor(cm) {
    if (cm.display.dragCursor) {
      cm.display.lineSpace.removeChild(cm.display.dragCursor);
      cm.display.dragCursor = null;
    }
  }

  // SCROLL EVENTS

  // Sync the scrollable area and scrollbars, ensure the viewport
  // covers the visible area.
  function setScrollTop(cm, val) {
    if (Math.abs(cm.doc.scrollTop - val) < 2) return;
    cm.doc.scrollTop = val;
    if (!gecko) updateDisplaySimple(cm, {top: val});
    if (cm.display.scroller.scrollTop != val) cm.display.scroller.scrollTop = val;
    cm.display.scrollbars.setScrollTop(val);
    if (gecko) updateDisplaySimple(cm);
    startWorker(cm, 100);
  }
  // Sync scroller and scrollbar, ensure the gutter elements are
  // aligned.
  function setScrollLeft(cm, val, isScroller) {
    if (isScroller ? val == cm.doc.scrollLeft : Math.abs(cm.doc.scrollLeft - val) < 2) return;
    val = Math.min(val, cm.display.scroller.scrollWidth - cm.display.scroller.clientWidth);
    cm.doc.scrollLeft = val;
    alignHorizontally(cm);
    if (cm.display.scroller.scrollLeft != val) cm.display.scroller.scrollLeft = val;
    cm.display.scrollbars.setScrollLeft(val);
  }

  // Since the delta values reported on mouse wheel events are
  // unstandardized between browsers and even browser versions, and
  // generally horribly unpredictable, this code starts by measuring
  // the scroll effect that the first few mouse wheel events have,
  // and, from that, detects the way it can convert deltas to pixel
  // offsets afterwards.
  //
  // The reason we want to know the amount a wheel event will scroll
  // is that it gives us a chance to update the display before the
  // actual scrolling happens, reducing flickering.

  var wheelSamples = 0, wheelPixelsPerUnit = null;
  // Fill in a browser-detected starting value on browsers where we
  // know one. These don't have to be accurate -- the result of them
  // being wrong would just be a slight flicker on the first wheel
  // scroll (if it is large enough).
  if (ie) wheelPixelsPerUnit = -.53;
  else if (gecko) wheelPixelsPerUnit = 15;
  else if (chrome) wheelPixelsPerUnit = -.7;
  else if (safari) wheelPixelsPerUnit = -1/3;

  var wheelEventDelta = function(e) {
    var dx = e.wheelDeltaX, dy = e.wheelDeltaY;
    if (dx == null && e.detail && e.axis == e.HORIZONTAL_AXIS) dx = e.detail;
    if (dy == null && e.detail && e.axis == e.VERTICAL_AXIS) dy = e.detail;
    else if (dy == null) dy = e.wheelDelta;
    return {x: dx, y: dy};
  };
  CodeMirror.wheelEventPixels = function(e) {
    var delta = wheelEventDelta(e);
    delta.x *= wheelPixelsPerUnit;
    delta.y *= wheelPixelsPerUnit;
    return delta;
  };

  function onScrollWheel(cm, e) {
    var delta = wheelEventDelta(e), dx = delta.x, dy = delta.y;

    var display = cm.display, scroll = display.scroller;
    // Quit if there's nothing to scroll here
    if (!(dx && scroll.scrollWidth > scroll.clientWidth ||
          dy && scroll.scrollHeight > scroll.clientHeight)) return;

    // Webkit browsers on OS X abort momentum scrolls when the target
    // of the scroll event is removed from the scrollable element.
    // This hack (see related code in patchDisplay) makes sure the
    // element is kept around.
    if (dy && mac && webkit) {
      outer: for (var cur = e.target, view = display.view; cur != scroll; cur = cur.parentNode) {
        for (var i = 0; i < view.length; i++) {
          if (view[i].node == cur) {
            cm.display.currentWheelTarget = cur;
            break outer;
          }
        }
      }
    }

    // On some browsers, horizontal scrolling will cause redraws to
    // happen before the gutter has been realigned, causing it to
    // wriggle around in a most unseemly way. When we have an
    // estimated pixels/delta value, we just handle horizontal
    // scrolling entirely here. It'll be slightly off from native, but
    // better than glitching out.
    if (dx && !gecko && !presto && wheelPixelsPerUnit != null) {
      if (dy)
        setScrollTop(cm, Math.max(0, Math.min(scroll.scrollTop + dy * wheelPixelsPerUnit, scroll.scrollHeight - scroll.clientHeight)));
      setScrollLeft(cm, Math.max(0, Math.min(scroll.scrollLeft + dx * wheelPixelsPerUnit, scroll.scrollWidth - scroll.clientWidth)));
      e_preventDefault(e);
      display.wheelStartX = null; // Abort measurement, if in progress
      return;
    }

    // 'Project' the visible viewport to cover the area that is being
    // scrolled into view (if we know enough to estimate it).
    if (dy && wheelPixelsPerUnit != null) {
      var pixels = dy * wheelPixelsPerUnit;
      var top = cm.doc.scrollTop, bot = top + display.wrapper.clientHeight;
      if (pixels < 0) top = Math.max(0, top + pixels - 50);
      else bot = Math.min(cm.doc.height, bot + pixels + 50);
      updateDisplaySimple(cm, {top: top, bottom: bot});
    }

    if (wheelSamples < 20) {
      if (display.wheelStartX == null) {
        display.wheelStartX = scroll.scrollLeft; display.wheelStartY = scroll.scrollTop;
        display.wheelDX = dx; display.wheelDY = dy;
        setTimeout(function() {
          if (display.wheelStartX == null) return;
          var movedX = scroll.scrollLeft - display.wheelStartX;
          var movedY = scroll.scrollTop - display.wheelStartY;
          var sample = (movedY && display.wheelDY && movedY / display.wheelDY) ||
            (movedX && display.wheelDX && movedX / display.wheelDX);
          display.wheelStartX = display.wheelStartY = null;
          if (!sample) return;
          wheelPixelsPerUnit = (wheelPixelsPerUnit * wheelSamples + sample) / (wheelSamples + 1);
          ++wheelSamples;
        }, 200);
      } else {
        display.wheelDX += dx; display.wheelDY += dy;
      }
    }
  }

  // KEY EVENTS

  // Run a handler that was bound to a key.
  function doHandleBinding(cm, bound, dropShift) {
    if (typeof bound == "string") {
      bound = commands[bound];
      if (!bound) return false;
    }
    // Ensure previous input has been read, so that the handler sees a
    // consistent view of the document
    cm.display.input.ensurePolled();
    var prevShift = cm.display.shift, done = false;
    try {
      if (isReadOnly(cm)) cm.state.suppressEdits = true;
      if (dropShift) cm.display.shift = false;
      done = bound(cm) != Pass;
    } finally {
      cm.display.shift = prevShift;
      cm.state.suppressEdits = false;
    }
    return done;
  }

  function lookupKeyForEditor(cm, name, handle) {
    for (var i = 0; i < cm.state.keyMaps.length; i++) {
      var result = lookupKey(name, cm.state.keyMaps[i], handle, cm);
      if (result) return result;
    }
    return (cm.options.extraKeys && lookupKey(name, cm.options.extraKeys, handle, cm))
      || lookupKey(name, cm.options.keyMap, handle, cm);
  }

  var stopSeq = new Delayed;
  function dispatchKey(cm, name, e, handle) {
    var seq = cm.state.keySeq;
    if (seq) {
      if (isModifierKey(name)) return "handled";
      stopSeq.set(50, function() {
        if (cm.state.keySeq == seq) {
          cm.state.keySeq = null;
          cm.display.input.reset();
        }
      });
      name = seq + " " + name;
    }
    var result = lookupKeyForEditor(cm, name, handle);

    if (result == "multi")
      cm.state.keySeq = name;
    if (result == "handled")
      signalLater(cm, "keyHandled", cm, name, e);

    if (result == "handled" || result == "multi") {
      e_preventDefault(e);
      restartBlink(cm);
    }

    if (seq && !result && /\'$/.test(name)) {
      e_preventDefault(e);
      return true;
    }
    return !!result;
  }

  // Handle a key from the keydown event.
  function handleKeyBinding(cm, e) {
    var name = keyName(e, true);
    if (!name) return false;

    if (e.shiftKey && !cm.state.keySeq) {
      // First try to resolve full name (including 'Shift-'). Failing
      // that, see if there is a cursor-motion command (starting with
      // 'go') bound to the keyname without 'Shift-'.
      return dispatchKey(cm, "Shift-" + name, e, function(b) {return doHandleBinding(cm, b, true);})
          || dispatchKey(cm, name, e, function(b) {
               if (typeof b == "string" ? /^go[A-Z]/.test(b) : b.motion)
                 return doHandleBinding(cm, b);
             });
    } else {
      return dispatchKey(cm, name, e, function(b) { return doHandleBinding(cm, b); });
    }
  }

  // Handle a key from the keypress event
  function handleCharBinding(cm, e, ch) {
    return dispatchKey(cm, "'" + ch + "'", e,
                       function(b) { return doHandleBinding(cm, b, true); });
  }

  var lastStoppedKey = null;
  function onKeyDown(e) {
    var cm = this;
    cm.curOp.focus = activeElt();
    if (signalDOMEvent(cm, e)) return;
    // IE does strange things with escape.
    if (ie && ie_version < 11 && e.keyCode == 27) e.returnValue = false;
    var code = e.keyCode;
    cm.display.shift = code == 16 || e.shiftKey;
    var handled = handleKeyBinding(cm, e);
    if (presto) {
      lastStoppedKey = handled ? code : null;
      // Opera has no cut event... we try to at least catch the key combo
      if (!handled && code == 88 && !hasCopyEvent && (mac ? e.metaKey : e.ctrlKey))
        cm.replaceSelection("", null, "cut");
    }

    // Turn mouse into crosshair when Alt is held on Mac.
    if (code == 18 && !/\bCodeMirror-crosshair\b/.test(cm.display.lineDiv.className))
      showCrossHair(cm);
  }

  function showCrossHair(cm) {
    var lineDiv = cm.display.lineDiv;
    addClass(lineDiv, "CodeMirror-crosshair");

    function up(e) {
      if (e.keyCode == 18 || !e.altKey) {
        rmClass(lineDiv, "CodeMirror-crosshair");
        off(document, "keyup", up);
        off(document, "mouseover", up);
      }
    }
    on(document, "keyup", up);
    on(document, "mouseover", up);
  }

  function onKeyUp(e) {
    if (e.keyCode == 16) this.doc.sel.shift = false;
    signalDOMEvent(this, e);
  }

  function onKeyPress(e) {
    var cm = this;
    if (eventInWidget(cm.display, e) || signalDOMEvent(cm, e) || e.ctrlKey && !e.altKey || mac && e.metaKey) return;
    var keyCode = e.keyCode, charCode = e.charCode;
    if (presto && keyCode == lastStoppedKey) {lastStoppedKey = null; e_preventDefault(e); return;}
    if ((presto && (!e.which || e.which < 10)) && handleKeyBinding(cm, e)) return;
    var ch = String.fromCharCode(charCode == null ? keyCode : charCode);
    if (handleCharBinding(cm, e, ch)) return;
    cm.display.input.onKeyPress(e);
  }

  // FOCUS/BLUR EVENTS

  function delayBlurEvent(cm) {
    cm.state.delayingBlurEvent = true;
    setTimeout(function() {
      if (cm.state.delayingBlurEvent) {
        cm.state.delayingBlurEvent = false;
        onBlur(cm);
      }
    }, 100);
  }

  function onFocus(cm) {
    if (cm.state.delayingBlurEvent) cm.state.delayingBlurEvent = false;

    if (cm.options.readOnly == "nocursor") return;
    if (!cm.state.focused) {
      signal(cm, "focus", cm);
      cm.state.focused = true;
      addClass(cm.display.wrapper, "CodeMirror-focused");
      // This test prevents this from firing when a context
      // menu is closed (since the input reset would kill the
      // select-all detection hack)
      if (!cm.curOp && cm.display.selForContextMenu != cm.doc.sel) {
        cm.display.input.reset();
        if (webkit) setTimeout(function() { cm.display.input.reset(true); }, 20); // Issue #1730
      }
      cm.display.input.receivedFocus();
    }
    restartBlink(cm);
  }
  function onBlur(cm) {
    if (cm.state.delayingBlurEvent) return;

    if (cm.state.focused) {
      signal(cm, "blur", cm);
      cm.state.focused = false;
      rmClass(cm.display.wrapper, "CodeMirror-focused");
    }
    clearInterval(cm.display.blinker);
    setTimeout(function() {if (!cm.state.focused) cm.display.shift = false;}, 150);
  }

  // CONTEXT MENU HANDLING

  // To make the context menu work, we need to briefly unhide the
  // textarea (making it as unobtrusive as possible) to let the
  // right-click take effect on it.
  function onContextMenu(cm, e) {
    if (eventInWidget(cm.display, e) || contextMenuInGutter(cm, e)) return;
    cm.display.input.onContextMenu(e);
  }

  function contextMenuInGutter(cm, e) {
    if (!hasHandler(cm, "gutterContextMenu")) return false;
    return gutterEvent(cm, e, "gutterContextMenu", false, signal);
  }

  // UPDATING

  // Compute the position of the end of a change (its 'to' property
  // refers to the pre-change end).
  var changeEnd = CodeMirror.changeEnd = function(change) {
    if (!change.text) return change.to;
    return Pos(change.from.line + change.text.length - 1,
               lst(change.text).length + (change.text.length == 1 ? change.from.ch : 0));
  };

  // Adjust a position to refer to the post-change position of the
  // same text, or the end of the change if the change covers it.
  function adjustForChange(pos, change) {
    if (cmp(pos, change.from) < 0) return pos;
    if (cmp(pos, change.to) <= 0) return changeEnd(change);

    var line = pos.line + change.text.length - (change.to.line - change.from.line) - 1, ch = pos.ch;
    if (pos.line == change.to.line) ch += changeEnd(change).ch - change.to.ch;
    return Pos(line, ch);
  }

  function computeSelAfterChange(doc, change) {
    var out = [];
    for (var i = 0; i < doc.sel.ranges.length; i++) {
      var range = doc.sel.ranges[i];
      out.push(new Range(adjustForChange(range.anchor, change),
                         adjustForChange(range.head, change)));
    }
    return normalizeSelection(out, doc.sel.primIndex);
  }

  function offsetPos(pos, old, nw) {
    if (pos.line == old.line)
      return Pos(nw.line, pos.ch - old.ch + nw.ch);
    else
      return Pos(nw.line + (pos.line - old.line), pos.ch);
  }

  // Used by replaceSelections to allow moving the selection to the
  // start or around the replaced test. Hint may be "start" or "around".
  function computeReplacedSel(doc, changes, hint) {
    var out = [];
    var oldPrev = Pos(doc.first, 0), newPrev = oldPrev;
    for (var i = 0; i < changes.length; i++) {
      var change = changes[i];
      var from = offsetPos(change.from, oldPrev, newPrev);
      var to = offsetPos(changeEnd(change), oldPrev, newPrev);
      oldPrev = change.to;
      newPrev = to;
      if (hint == "around") {
        var range = doc.sel.ranges[i], inv = cmp(range.head, range.anchor) < 0;
        out[i] = new Range(inv ? to : from, inv ? from : to);
      } else {
        out[i] = new Range(from, from);
      }
    }
    return new Selection(out, doc.sel.primIndex);
  }

  // Allow "beforeChange" event handlers to influence a change
  function filterChange(doc, change, update) {
    var obj = {
      canceled: false,
      from: change.from,
      to: change.to,
      text: change.text,
      origin: change.origin,
      cancel: function() { this.canceled = true; }
    };
    if (update) obj.update = function(from, to, text, origin) {
      if (from) this.from = clipPos(doc, from);
      if (to) this.to = clipPos(doc, to);
      if (text) this.text = text;
      if (origin !== undefined) this.origin = origin;
    };
    signal(doc, "beforeChange", doc, obj);
    if (doc.cm) signal(doc.cm, "beforeChange", doc.cm, obj);

    if (obj.canceled) return null;
    return {from: obj.from, to: obj.to, text: obj.text, origin: obj.origin};
  }

  // Apply a change to a document, and add it to the document's
  // history, and propagating it to all linked documents.
  function makeChange(doc, change, ignoreReadOnly) {
    if (doc.cm) {
      if (!doc.cm.curOp) return operation(doc.cm, makeChange)(doc, change, ignoreReadOnly);
      if (doc.cm.state.suppressEdits) return;
    }

    if (hasHandler(doc, "beforeChange") || doc.cm && hasHandler(doc.cm, "beforeChange")) {
      change = filterChange(doc, change, true);
      if (!change) return;
    }

    // Possibly split or suppress the update based on the presence
    // of read-only spans in its range.
    var split = sawReadOnlySpans && !ignoreReadOnly && removeReadOnlyRanges(doc, change.from, change.to);
    if (split) {
      for (var i = split.length - 1; i >= 0; --i)
        makeChangeInner(doc, {from: split[i].from, to: split[i].to, text: i ? [""] : change.text});
    } else {
      makeChangeInner(doc, change);
    }
  }

  function makeChangeInner(doc, change) {
    if (change.text.length == 1 && change.text[0] == "" && cmp(change.from, change.to) == 0) return;
    var selAfter = computeSelAfterChange(doc, change);
    addChangeToHistory(doc, change, selAfter, doc.cm ? doc.cm.curOp.id : NaN);

    makeChangeSingleDoc(doc, change, selAfter, stretchSpansOverChange(doc, change));
    var rebased = [];

    linkedDocs(doc, function(doc, sharedHist) {
      if (!sharedHist && indexOf(rebased, doc.history) == -1) {
        rebaseHist(doc.history, change);
        rebased.push(doc.history);
      }
      makeChangeSingleDoc(doc, change, null, stretchSpansOverChange(doc, change));
    });
  }

  // Revert a change stored in a document's history.
  function makeChangeFromHistory(doc, type, allowSelectionOnly) {
    if (doc.cm && doc.cm.state.suppressEdits) return;

    var hist = doc.history, event, selAfter = doc.sel;
    var source = type == "undo" ? hist.done : hist.undone, dest = type == "undo" ? hist.undone : hist.done;

    // Verify that there is a useable event (so that ctrl-z won't
    // needlessly clear selection events)
    for (var i = 0; i < source.length; i++) {
      event = source[i];
      if (allowSelectionOnly ? event.ranges && !event.equals(doc.sel) : !event.ranges)
        break;
    }
    if (i == source.length) return;
    hist.lastOrigin = hist.lastSelOrigin = null;

    for (;;) {
      event = source.pop();
      if (event.ranges) {
        pushSelectionToHistory(event, dest);
        if (allowSelectionOnly && !event.equals(doc.sel)) {
          setSelection(doc, event, {clearRedo: false});
          return;
        }
        selAfter = event;
      }
      else break;
    }

    // Build up a reverse change object to add to the opposite history
    // stack (redo when undoing, and vice versa).
    var antiChanges = [];
    pushSelectionToHistory(selAfter, dest);
    dest.push({changes: antiChanges, generation: hist.generation});
    hist.generation = event.generation || ++hist.maxGeneration;

    var filter = hasHandler(doc, "beforeChange") || doc.cm && hasHandler(doc.cm, "beforeChange");

    for (var i = event.changes.length - 1; i >= 0; --i) {
      var change = event.changes[i];
      change.origin = type;
      if (filter && !filterChange(doc, change, false)) {
        source.length = 0;
        return;
      }

      antiChanges.push(historyChangeFromChange(doc, change));

      var after = i ? computeSelAfterChange(doc, change) : lst(source);
      makeChangeSingleDoc(doc, change, after, mergeOldSpans(doc, change));
      if (!i && doc.cm) doc.cm.scrollIntoView({from: change.from, to: changeEnd(change)});
      var rebased = [];

      // Propagate to the linked documents
      linkedDocs(doc, function(doc, sharedHist) {
        if (!sharedHist && indexOf(rebased, doc.history) == -1) {
          rebaseHist(doc.history, change);
          rebased.push(doc.history);
        }
        makeChangeSingleDoc(doc, change, null, mergeOldSpans(doc, change));
      });
    }
  }

  // Sub-views need their line numbers shifted when text is added
  // above or below them in the parent document.
  function shiftDoc(doc, distance) {
    if (distance == 0) return;
    doc.first += distance;
    doc.sel = new Selection(map(doc.sel.ranges, function(range) {
      return new Range(Pos(range.anchor.line + distance, range.anchor.ch),
                       Pos(range.head.line + distance, range.head.ch));
    }), doc.sel.primIndex);
    if (doc.cm) {
      regChange(doc.cm, doc.first, doc.first - distance, distance);
      for (var d = doc.cm.display, l = d.viewFrom; l < d.viewTo; l++)
        regLineChange(doc.cm, l, "gutter");
    }
  }

  // More lower-level change function, handling only a single document
  // (not linked ones).
  function makeChangeSingleDoc(doc, change, selAfter, spans) {
    if (doc.cm && !doc.cm.curOp)
      return operation(doc.cm, makeChangeSingleDoc)(doc, change, selAfter, spans);

    if (change.to.line < doc.first) {
      shiftDoc(doc, change.text.length - 1 - (change.to.line - change.from.line));
      return;
    }
    if (change.from.line > doc.lastLine()) return;

    // Clip the change to the size of this doc
    if (change.from.line < doc.first) {
      var shift = change.text.length - 1 - (doc.first - change.from.line);
      shiftDoc(doc, shift);
      change = {from: Pos(doc.first, 0), to: Pos(change.to.line + shift, change.to.ch),
                text: [lst(change.text)], origin: change.origin};
    }
    var last = doc.lastLine();
    if (change.to.line > last) {
      change = {from: change.from, to: Pos(last, getLine(doc, last).text.length),
                text: [change.text[0]], origin: change.origin};
    }

    change.removed = getBetween(doc, change.from, change.to);

    if (!selAfter) selAfter = computeSelAfterChange(doc, change);
    if (doc.cm) makeChangeSingleDocInEditor(doc.cm, change, spans);
    else updateDoc(doc, change, spans);
    setSelectionNoUndo(doc, selAfter, sel_dontScroll);
  }

  // Handle the interaction of a change to a document with the editor
  // that this document is part of.
  function makeChangeSingleDocInEditor(cm, change, spans) {
    var doc = cm.doc, display = cm.display, from = change.from, to = change.to;

    var recomputeMaxLength = false, checkWidthStart = from.line;
    if (!cm.options.lineWrapping) {
      checkWidthStart = lineNo(visualLine(getLine(doc, from.line)));
      doc.iter(checkWidthStart, to.line + 1, function(line) {
        if (line == display.maxLine) {
          recomputeMaxLength = true;
          return true;
        }
      });
    }

    if (doc.sel.contains(change.from, change.to) > -1)
      signalCursorActivity(cm);

    updateDoc(doc, change, spans, estimateHeight(cm));

    if (!cm.options.lineWrapping) {
      doc.iter(checkWidthStart, from.line + change.text.length, function(line) {
        var len = lineLength(line);
        if (len > display.maxLineLength) {
          display.maxLine = line;
          display.maxLineLength = len;
          display.maxLineChanged = true;
          recomputeMaxLength = false;
        }
      });
      if (recomputeMaxLength) cm.curOp.updateMaxLine = true;
    }

    // Adjust frontier, schedule worker
    doc.frontier = Math.min(doc.frontier, from.line);
    startWorker(cm, 400);

    var lendiff = change.text.length - (to.line - from.line) - 1;
    // Remember that these lines changed, for updating the display
    if (change.full)
      regChange(cm);
    else if (from.line == to.line && change.text.length == 1 && !isWholeLineUpdate(cm.doc, change))
      regLineChange(cm, from.line, "text");
    else
      regChange(cm, from.line, to.line + 1, lendiff);

    var changesHandler = hasHandler(cm, "changes"), changeHandler = hasHandler(cm, "change");
    if (changeHandler || changesHandler) {
      var obj = {
        from: from, to: to,
        text: change.text,
        removed: change.removed,
        origin: change.origin
      };
      if (changeHandler) signalLater(cm, "change", cm, obj);
      if (changesHandler) (cm.curOp.changeObjs || (cm.curOp.changeObjs = [])).push(obj);
    }
    cm.display.selForContextMenu = null;
  }

  function replaceRange(doc, code, from, to, origin) {
    if (!to) to = from;
    if (cmp(to, from) < 0) { var tmp = to; to = from; from = tmp; }
    if (typeof code == "string") code = doc.splitLines(code);
    makeChange(doc, {from: from, to: to, text: code, origin: origin});
  }

  // SCROLLING THINGS INTO VIEW

  // If an editor sits on the top or bottom of the window, partially
  // scrolled out of view, this ensures that the cursor is visible.
  function maybeScrollWindow(cm, coords) {
    if (signalDOMEvent(cm, "scrollCursorIntoView")) return;

    var display = cm.display, box = display.sizer.getBoundingClientRect(), doScroll = null;
    if (coords.top + box.top < 0) doScroll = true;
    else if (coords.bottom + box.top > (window.innerHeight || document.documentElement.clientHeight)) doScroll = false;
    if (doScroll != null && !phantom) {
      var scrollNode = elt("div", "\u200b", null, "position: absolute; top: " +
                           (coords.top - display.viewOffset - paddingTop(cm.display)) + "px; height: " +
                           (coords.bottom - coords.top + scrollGap(cm) + display.barHeight) + "px; left: " +
                           coords.left + "px; width: 2px;");
      cm.display.lineSpace.appendChild(scrollNode);
      scrollNode.scrollIntoView(doScroll);
      cm.display.lineSpace.removeChild(scrollNode);
    }
  }

  // Scroll a given position into view (immediately), verifying that
  // it actually became visible (as line heights are accurately
  // measured, the position of something may 'drift' during drawing).
  function scrollPosIntoView(cm, pos, end, margin) {
    if (margin == null) margin = 0;
    for (var limit = 0; limit < 5; limit++) {
      var changed = false, coords = cursorCoords(cm, pos);
      var endCoords = !end || end == pos ? coords : cursorCoords(cm, end);
      var scrollPos = calculateScrollPos(cm, Math.min(coords.left, endCoords.left),
                                         Math.min(coords.top, endCoords.top) - margin,
                                         Math.max(coords.left, endCoords.left),
                                         Math.max(coords.bottom, endCoords.bottom) + margin);
      var startTop = cm.doc.scrollTop, startLeft = cm.doc.scrollLeft;
      if (scrollPos.scrollTop != null) {
        setScrollTop(cm, scrollPos.scrollTop);
        if (Math.abs(cm.doc.scrollTop - startTop) > 1) changed = true;
      }
      if (scrollPos.scrollLeft != null) {
        setScrollLeft(cm, scrollPos.scrollLeft);
        if (Math.abs(cm.doc.scrollLeft - startLeft) > 1) changed = true;
      }
      if (!changed) break;
    }
    return coords;
  }

  // Scroll a given set of coordinates into view (immediately).
  function scrollIntoView(cm, x1, y1, x2, y2) {
    var scrollPos = calculateScrollPos(cm, x1, y1, x2, y2);
    if (scrollPos.scrollTop != null) setScrollTop(cm, scrollPos.scrollTop);
    if (scrollPos.scrollLeft != null) setScrollLeft(cm, scrollPos.scrollLeft);
  }

  // Calculate a new scroll position needed to scroll the given
  // rectangle into view. Returns an object with scrollTop and
  // scrollLeft properties. When these are undefined, the
  // vertical/horizontal position does not need to be adjusted.
  function calculateScrollPos(cm, x1, y1, x2, y2) {
    var display = cm.display, snapMargin = textHeight(cm.display);
    if (y1 < 0) y1 = 0;
    var screentop = cm.curOp && cm.curOp.scrollTop != null ? cm.curOp.scrollTop : display.scroller.scrollTop;
    var screen = displayHeight(cm), result = {};
    if (y2 - y1 > screen) y2 = y1 + screen;
    var docBottom = cm.doc.height + paddingVert(display);
    var atTop = y1 < snapMargin, atBottom = y2 > docBottom - snapMargin;
    if (y1 < screentop) {
      result.scrollTop = atTop ? 0 : y1;
    } else if (y2 > screentop + screen) {
      var newTop = Math.min(y1, (atBottom ? docBottom : y2) - screen);
      if (newTop != screentop) result.scrollTop = newTop;
    }

    var screenleft = cm.curOp && cm.curOp.scrollLeft != null ? cm.curOp.scrollLeft : display.scroller.scrollLeft;
    var screenw = displayWidth(cm) - (cm.options.fixedGutter ? display.gutters.offsetWidth : 0);
    var tooWide = x2 - x1 > screenw;
    if (tooWide) x2 = x1 + screenw;
    if (x1 < 10)
      result.scrollLeft = 0;
    else if (x1 < screenleft)
      result.scrollLeft = Math.max(0, x1 - (tooWide ? 0 : 10));
    else if (x2 > screenw + screenleft - 3)
      result.scrollLeft = x2 + (tooWide ? 0 : 10) - screenw;
    return result;
  }

  // Store a relative adjustment to the scroll position in the current
  // operation (to be applied when the operation finishes).
  function addToScrollPos(cm, left, top) {
    if (left != null || top != null) resolveScrollToPos(cm);
    if (left != null)
      cm.curOp.scrollLeft = (cm.curOp.scrollLeft == null ? cm.doc.scrollLeft : cm.curOp.scrollLeft) + left;
    if (top != null)
      cm.curOp.scrollTop = (cm.curOp.scrollTop == null ? cm.doc.scrollTop : cm.curOp.scrollTop) + top;
  }

  // Make sure that at the end of the operation the current cursor is
  // shown.
  function ensureCursorVisible(cm) {
    resolveScrollToPos(cm);
    var cur = cm.getCursor(), from = cur, to = cur;
    if (!cm.options.lineWrapping) {
      from = cur.ch ? Pos(cur.line, cur.ch - 1) : cur;
      to = Pos(cur.line, cur.ch + 1);
    }
    cm.curOp.scrollToPos = {from: from, to: to, margin: cm.options.cursorScrollMargin, isCursor: true};
  }

  // When an operation has its scrollToPos property set, and another
  // scroll action is applied before the end of the operation, this
  // 'simulates' scrolling that position into view in a cheap way, so
  // that the effect of intermediate scroll commands is not ignored.
  function resolveScrollToPos(cm) {
    var range = cm.curOp.scrollToPos;
    if (range) {
      cm.curOp.scrollToPos = null;
      var from = estimateCoords(cm, range.from), to = estimateCoords(cm, range.to);
      var sPos = calculateScrollPos(cm, Math.min(from.left, to.left),
                                    Math.min(from.top, to.top) - range.margin,
                                    Math.max(from.right, to.right),
                                    Math.max(from.bottom, to.bottom) + range.margin);
      cm.scrollTo(sPos.scrollLeft, sPos.scrollTop);
    }
  }

  // API UTILITIES

  // Indent the given line. The how parameter can be "smart",
  // "add"/null, "subtract", or "prev". When aggressive is false
  // (typically set to true for forced single-line indents), empty
  // lines are not indented, and places where the mode returns Pass
  // are left alone.
  function indentLine(cm, n, how, aggressive) {
    var doc = cm.doc, state;
    if (how == null) how = "add";
    if (how == "smart") {
      // Fall back to "prev" when the mode doesn't have an indentation
      // method.
      if (!doc.mode.indent) how = "prev";
      else state = getStateBefore(cm, n);
    }

    var tabSize = cm.options.tabSize;
    var line = getLine(doc, n), curSpace = countColumn(line.text, null, tabSize);
    if (line.stateAfter) line.stateAfter = null;
    var curSpaceString = line.text.match(/^\s*/)[0], indentation;
    if (!aggressive && !/\S/.test(line.text)) {
      indentation = 0;
      how = "not";
    } else if (how == "smart") {
      indentation = doc.mode.indent(state, line.text.slice(curSpaceString.length), line.text);
      if (indentation == Pass || indentation > 150) {
        if (!aggressive) return;
        how = "prev";
      }
    }
    if (how == "prev") {
      if (n > doc.first) indentation = countColumn(getLine(doc, n-1).text, null, tabSize);
      else indentation = 0;
    } else if (how == "add") {
      indentation = curSpace + cm.options.indentUnit;
    } else if (how == "subtract") {
      indentation = curSpace - cm.options.indentUnit;
    } else if (typeof how == "number") {
      indentation = curSpace + how;
    }
    indentation = Math.max(0, indentation);

    var indentString = "", pos = 0;
    if (cm.options.indentWithTabs)
      for (var i = Math.floor(indentation / tabSize); i; --i) {pos += tabSize; indentString += "\t";}
    if (pos < indentation) indentString += spaceStr(indentation - pos);

    if (indentString != curSpaceString) {
      replaceRange(doc, indentString, Pos(n, 0), Pos(n, curSpaceString.length), "+input");
      line.stateAfter = null;
      return true;
    } else {
      // Ensure that, if the cursor was in the whitespace at the start
      // of the line, it is moved to the end of that space.
      for (var i = 0; i < doc.sel.ranges.length; i++) {
        var range = doc.sel.ranges[i];
        if (range.head.line == n && range.head.ch < curSpaceString.length) {
          var pos = Pos(n, curSpaceString.length);
          replaceOneSelection(doc, i, new Range(pos, pos));
          break;
        }
      }
    }
  }

  // Utility for applying a change to a line by handle or number,
  // returning the number and optionally registering the line as
  // changed.
  function changeLine(doc, handle, changeType, op) {
    var no = handle, line = handle;
    if (typeof handle == "number") line = getLine(doc, clipLine(doc, handle));
    else no = lineNo(handle);
    if (no == null) return null;
    if (op(line, no) && doc.cm) regLineChange(doc.cm, no, changeType);
    return line;
  }

  // Helper for deleting text near the selection(s), used to implement
  // backspace, delete, and similar functionality.
  function deleteNearSelection(cm, compute) {
    var ranges = cm.doc.sel.ranges, kill = [];
    // Build up a set of ranges to kill first, merging overlapping
    // ranges.
    for (var i = 0; i < ranges.length; i++) {
      var toKill = compute(ranges[i]);
      while (kill.length && cmp(toKill.from, lst(kill).to) <= 0) {
        var replaced = kill.pop();
        if (cmp(replaced.from, toKill.from) < 0) {
          toKill.from = replaced.from;
          break;
        }
      }
      kill.push(toKill);
    }
    // Next, remove those actual ranges.
    runInOp(cm, function() {
      for (var i = kill.length - 1; i >= 0; i--)
        replaceRange(cm.doc, "", kill[i].from, kill[i].to, "+delete");
      ensureCursorVisible(cm);
    });
  }

  // Used for horizontal relative motion. Dir is -1 or 1 (left or
  // right), unit can be "char", "column" (like char, but doesn't
  // cross line boundaries), "word" (across next word), or "group" (to
  // the start of next group of word or non-word-non-whitespace
  // chars). The visually param controls whether, in right-to-left
  // text, direction 1 means to move towards the next index in the
  // string, or towards the character to the right of the current
  // position. The resulting position will have a hitSide=true
  // property if it reached the end of the document.
  function findPosH(doc, pos, dir, unit, visually) {
    var line = pos.line, ch = pos.ch, origDir = dir;
    var lineObj = getLine(doc, line);
    var possible = true;
    function findNextLine() {
      var l = line + dir;
      if (l < doc.first || l >= doc.first + doc.size) return (possible = false);
      line = l;
      return lineObj = getLine(doc, l);
    }
    function moveOnce(boundToLine) {
      var next = (visually ? moveVisually : moveLogically)(lineObj, ch, dir, true);
      if (next == null) {
        if (!boundToLine && findNextLine()) {
          if (visually) ch = (dir < 0 ? lineRight : lineLeft)(lineObj);
          else ch = dir < 0 ? lineObj.text.length : 0;
        } else return (possible = false);
      } else ch = next;
      return true;
    }

    if (unit == "char") moveOnce();
    else if (unit == "column") moveOnce(true);
    else if (unit == "word" || unit == "group") {
      var sawType = null, group = unit == "group";
      var helper = doc.cm && doc.cm.getHelper(pos, "wordChars");
      for (var first = true;; first = false) {
        if (dir < 0 && !moveOnce(!first)) break;
        var cur = lineObj.text.charAt(ch) || "\n";
        var type = isWordChar(cur, helper) ? "w"
          : group && cur == "\n" ? "n"
          : !group || /\s/.test(cur) ? null
          : "p";
        if (group && !first && !type) type = "s";
        if (sawType && sawType != type) {
          if (dir < 0) {dir = 1; moveOnce();}
          break;
        }

        if (type) sawType = type;
        if (dir > 0 && !moveOnce(!first)) break;
      }
    }
    var result = skipAtomic(doc, Pos(line, ch), origDir, true);
    if (!possible) result.hitSide = true;
    return result;
  }

  // For relative vertical movement. Dir may be -1 or 1. Unit can be
  // "page" or "line". The resulting position will have a hitSide=true
  // property if it reached the end of the document.
  function findPosV(cm, pos, dir, unit) {
    var doc = cm.doc, x = pos.left, y;
    if (unit == "page") {
      var pageSize = Math.min(cm.display.wrapper.clientHeight, window.innerHeight || document.documentElement.clientHeight);
      y = pos.top + dir * (pageSize - (dir < 0 ? 1.5 : .5) * textHeight(cm.display));
    } else if (unit == "line") {
      y = dir > 0 ? pos.bottom + 3 : pos.top - 3;
    }
    for (;;) {
      var target = coordsChar(cm, x, y);
      if (!target.outside) break;
      if (dir < 0 ? y <= 0 : y >= doc.height) { target.hitSide = true; break; }
      y += dir * 5;
    }
    return target;
  }

  // EDITOR METHODS

  // The publicly visible API. Note that methodOp(f) means
  // 'wrap f in an operation, performed on its `this` parameter'.

  // This is not the complete set of editor methods. Most of the
  // methods defined on the Doc type are also injected into
  // CodeMirror.prototype, for backwards compatibility and
  // convenience.

  CodeMirror.prototype = {
    constructor: CodeMirror,
    focus: function(){window.focus(); this.display.input.focus();},

    setOption: function(option, value) {
      var options = this.options, old = options[option];
      if (options[option] == value && option != "mode") return;
      options[option] = value;
      if (optionHandlers.hasOwnProperty(option))
        operation(this, optionHandlers[option])(this, value, old);
    },

    getOption: function(option) {return this.options[option];},
    getDoc: function() {return this.doc;},

    addKeyMap: function(map, bottom) {
      this.state.keyMaps[bottom ? "push" : "unshift"](getKeyMap(map));
    },
    removeKeyMap: function(map) {
      var maps = this.state.keyMaps;
      for (var i = 0; i < maps.length; ++i)
        if (maps[i] == map || maps[i].name == map) {
          maps.splice(i, 1);
          return true;
        }
    },

    addOverlay: methodOp(function(spec, options) {
      var mode = spec.token ? spec : CodeMirror.getMode(this.options, spec);
      if (mode.startState) throw new Error("Overlays may not be stateful.");
      this.state.overlays.push({mode: mode, modeSpec: spec, opaque: options && options.opaque});
      this.state.modeGen++;
      regChange(this);
    }),
    removeOverlay: methodOp(function(spec) {
      var overlays = this.state.overlays;
      for (var i = 0; i < overlays.length; ++i) {
        var cur = overlays[i].modeSpec;
        if (cur == spec || typeof spec == "string" && cur.name == spec) {
          overlays.splice(i, 1);
          this.state.modeGen++;
          regChange(this);
          return;
        }
      }
    }),

    indentLine: methodOp(function(n, dir, aggressive) {
      if (typeof dir != "string" && typeof dir != "number") {
        if (dir == null) dir = this.options.smartIndent ? "smart" : "prev";
        else dir = dir ? "add" : "subtract";
      }
      if (isLine(this.doc, n)) indentLine(this, n, dir, aggressive);
    }),
    indentSelection: methodOp(function(how) {
      var ranges = this.doc.sel.ranges, end = -1;
      for (var i = 0; i < ranges.length; i++) {
        var range = ranges[i];
        if (!range.empty()) {
          var from = range.from(), to = range.to();
          var start = Math.max(end, from.line);
          end = Math.min(this.lastLine(), to.line - (to.ch ? 0 : 1)) + 1;
          for (var j = start; j < end; ++j)
            indentLine(this, j, how);
          var newRanges = this.doc.sel.ranges;
          if (from.ch == 0 && ranges.length == newRanges.length && newRanges[i].from().ch > 0)
            replaceOneSelection(this.doc, i, new Range(from, newRanges[i].to()), sel_dontScroll);
        } else if (range.head.line > end) {
          indentLine(this, range.head.line, how, true);
          end = range.head.line;
          if (i == this.doc.sel.primIndex) ensureCursorVisible(this);
        }
      }
    }),

    // Fetch the parser token for a given character. Useful for hacks
    // that want to inspect the mode state (say, for completion).
    getTokenAt: function(pos, precise) {
      return takeToken(this, pos, precise);
    },

    getLineTokens: function(line, precise) {
      return takeToken(this, Pos(line), precise, true);
    },

    getTokenTypeAt: function(pos) {
      pos = clipPos(this.doc, pos);
      var styles = getLineStyles(this, getLine(this.doc, pos.line));
      var before = 0, after = (styles.length - 1) / 2, ch = pos.ch;
      var type;
      if (ch == 0) type = styles[2];
      else for (;;) {
        var mid = (before + after) >> 1;
        if ((mid ? styles[mid * 2 - 1] : 0) >= ch) after = mid;
        else if (styles[mid * 2 + 1] < ch) before = mid + 1;
        else { type = styles[mid * 2 + 2]; break; }
      }
      var cut = type ? type.indexOf("cm-overlay ") : -1;
      return cut < 0 ? type : cut == 0 ? null : type.slice(0, cut - 1);
    },

    getModeAt: function(pos) {
      var mode = this.doc.mode;
      if (!mode.innerMode) return mode;
      return CodeMirror.innerMode(mode, this.getTokenAt(pos).state).mode;
    },

    getHelper: function(pos, type) {
      return this.getHelpers(pos, type)[0];
    },

    getHelpers: function(pos, type) {
      var found = [];
      if (!helpers.hasOwnProperty(type)) return found;
      var help = helpers[type], mode = this.getModeAt(pos);
      if (typeof mode[type] == "string") {
        if (help[mode[type]]) found.push(help[mode[type]]);
      } else if (mode[type]) {
        for (var i = 0; i < mode[type].length; i++) {
          var val = help[mode[type][i]];
          if (val) found.push(val);
        }
      } else if (mode.helperType && help[mode.helperType]) {
        found.push(help[mode.helperType]);
      } else if (help[mode.name]) {
        found.push(help[mode.name]);
      }
      for (var i = 0; i < help._global.length; i++) {
        var cur = help._global[i];
        if (cur.pred(mode, this) && indexOf(found, cur.val) == -1)
          found.push(cur.val);
      }
      return found;
    },

    getStateAfter: function(line, precise) {
      var doc = this.doc;
      line = clipLine(doc, line == null ? doc.first + doc.size - 1: line);
      return getStateBefore(this, line + 1, precise);
    },

    cursorCoords: function(start, mode) {
      var pos, range = this.doc.sel.primary();
      if (start == null) pos = range.head;
      else if (typeof start == "object") pos = clipPos(this.doc, start);
      else pos = start ? range.from() : range.to();
      return cursorCoords(this, pos, mode || "page");
    },

    charCoords: function(pos, mode) {
      return charCoords(this, clipPos(this.doc, pos), mode || "page");
    },

    coordsChar: function(coords, mode) {
      coords = fromCoordSystem(this, coords, mode || "page");
      return coordsChar(this, coords.left, coords.top);
    },

    lineAtHeight: function(height, mode) {
      height = fromCoordSystem(this, {top: height, left: 0}, mode || "page").top;
      return lineAtHeight(this.doc, height + this.display.viewOffset);
    },
    heightAtLine: function(line, mode) {
      var end = false, lineObj;
      if (typeof line == "number") {
        var last = this.doc.first + this.doc.size - 1;
        if (line < this.doc.first) line = this.doc.first;
        else if (line > last) { line = last; end = true; }
        lineObj = getLine(this.doc, line);
      } else {
        lineObj = line;
      }
      return intoCoordSystem(this, lineObj, {top: 0, left: 0}, mode || "page").top +
        (end ? this.doc.height - heightAtLine(lineObj) : 0);
    },

    defaultTextHeight: function() { return textHeight(this.display); },
    defaultCharWidth: function() { return charWidth(this.display); },

    setGutterMarker: methodOp(function(line, gutterID, value) {
      return changeLine(this.doc, line, "gutter", function(line) {
        var markers = line.gutterMarkers || (line.gutterMarkers = {});
        markers[gutterID] = value;
        if (!value && isEmpty(markers)) line.gutterMarkers = null;
        return true;
      });
    }),

    clearGutter: methodOp(function(gutterID) {
      var cm = this, doc = cm.doc, i = doc.first;
      doc.iter(function(line) {
        if (line.gutterMarkers && line.gutterMarkers[gutterID]) {
          line.gutterMarkers[gutterID] = null;
          regLineChange(cm, i, "gutter");
          if (isEmpty(line.gutterMarkers)) line.gutterMarkers = null;
        }
        ++i;
      });
    }),

    lineInfo: function(line) {
      if (typeof line == "number") {
        if (!isLine(this.doc, line)) return null;
        var n = line;
        line = getLine(this.doc, line);
        if (!line) return null;
      } else {
        var n = lineNo(line);
        if (n == null) return null;
      }
      return {line: n, handle: line, text: line.text, gutterMarkers: line.gutterMarkers,
              textClass: line.textClass, bgClass: line.bgClass, wrapClass: line.wrapClass,
              widgets: line.widgets};
    },

    getViewport: function() { return {from: this.display.viewFrom, to: this.display.viewTo};},

    addWidget: function(pos, node, scroll, vert, horiz) {
      var display = this.display;
      pos = cursorCoords(this, clipPos(this.doc, pos));
      var top = pos.bottom, left = pos.left;
      node.style.position = "absolute";
      node.setAttribute("cm-ignore-events", "true");
      this.display.input.setUneditable(node);
      display.sizer.appendChild(node);
      if (vert == "over") {
        top = pos.top;
      } else if (vert == "above" || vert == "near") {
        var vspace = Math.max(display.wrapper.clientHeight, this.doc.height),
        hspace = Math.max(display.sizer.clientWidth, display.lineSpace.clientWidth);
        // Default to positioning above (if specified and possible); otherwise default to positioning below
        if ((vert == 'above' || pos.bottom + node.offsetHeight > vspace) && pos.top > node.offsetHeight)
          top = pos.top - node.offsetHeight;
        else if (pos.bottom + node.offsetHeight <= vspace)
          top = pos.bottom;
        if (left + node.offsetWidth > hspace)
          left = hspace - node.offsetWidth;
      }
      node.style.top = top + "px";
      node.style.left = node.style.right = "";
      if (horiz == "right") {
        left = display.sizer.clientWidth - node.offsetWidth;
        node.style.right = "0px";
      } else {
        if (horiz == "left") left = 0;
        else if (horiz == "middle") left = (display.sizer.clientWidth - node.offsetWidth) / 2;
        node.style.left = left + "px";
      }
      if (scroll)
        scrollIntoView(this, left, top, left + node.offsetWidth, top + node.offsetHeight);
    },

    triggerOnKeyDown: methodOp(onKeyDown),
    triggerOnKeyPress: methodOp(onKeyPress),
    triggerOnKeyUp: onKeyUp,

    execCommand: function(cmd) {
      if (commands.hasOwnProperty(cmd))
        return commands[cmd].call(null, this);
    },

    triggerElectric: methodOp(function(text) { triggerElectric(this, text); }),

    findPosH: function(from, amount, unit, visually) {
      var dir = 1;
      if (amount < 0) { dir = -1; amount = -amount; }
      for (var i = 0, cur = clipPos(this.doc, from); i < amount; ++i) {
        cur = findPosH(this.doc, cur, dir, unit, visually);
        if (cur.hitSide) break;
      }
      return cur;
    },

    moveH: methodOp(function(dir, unit) {
      var cm = this;
      cm.extendSelectionsBy(function(range) {
        if (cm.display.shift || cm.doc.extend || range.empty())
          return findPosH(cm.doc, range.head, dir, unit, cm.options.rtlMoveVisually);
        else
          return dir < 0 ? range.from() : range.to();
      }, sel_move);
    }),

    deleteH: methodOp(function(dir, unit) {
      var sel = this.doc.sel, doc = this.doc;
      if (sel.somethingSelected())
        doc.replaceSelection("", null, "+delete");
      else
        deleteNearSelection(this, function(range) {
          var other = findPosH(doc, range.head, dir, unit, false);
          return dir < 0 ? {from: other, to: range.head} : {from: range.head, to: other};
        });
    }),

    findPosV: function(from, amount, unit, goalColumn) {
      var dir = 1, x = goalColumn;
      if (amount < 0) { dir = -1; amount = -amount; }
      for (var i = 0, cur = clipPos(this.doc, from); i < amount; ++i) {
        var coords = cursorCoords(this, cur, "div");
        if (x == null) x = coords.left;
        else coords.left = x;
        cur = findPosV(this, coords, dir, unit);
        if (cur.hitSide) break;
      }
      return cur;
    },

    moveV: methodOp(function(dir, unit) {
      var cm = this, doc = this.doc, goals = [];
      var collapse = !cm.display.shift && !doc.extend && doc.sel.somethingSelected();
      doc.extendSelectionsBy(function(range) {
        if (collapse)
          return dir < 0 ? range.from() : range.to();
        var headPos = cursorCoords(cm, range.head, "div");
        if (range.goalColumn != null) headPos.left = range.goalColumn;
        goals.push(headPos.left);
        var pos = findPosV(cm, headPos, dir, unit);
        if (unit == "page" && range == doc.sel.primary())
          addToScrollPos(cm, null, charCoords(cm, pos, "div").top - headPos.top);
        return pos;
      }, sel_move);
      if (goals.length) for (var i = 0; i < doc.sel.ranges.length; i++)
        doc.sel.ranges[i].goalColumn = goals[i];
    }),

    // Find the word at the given position (as returned by coordsChar).
    findWordAt: function(pos) {
      var doc = this.doc, line = getLine(doc, pos.line).text;
      var start = pos.ch, end = pos.ch;
      if (line) {
        var helper = this.getHelper(pos, "wordChars");
        if ((pos.xRel < 0 || end == line.length) && start) --start; else ++end;
        var startChar = line.charAt(start);
        var check = isWordChar(startChar, helper)
          ? function(ch) { return isWordChar(ch, helper); }
          : /\s/.test(startChar) ? function(ch) {return /\s/.test(ch);}
          : function(ch) {return !/\s/.test(ch) && !isWordChar(ch);};
        while (start > 0 && check(line.charAt(start - 1))) --start;
        while (end < line.length && check(line.charAt(end))) ++end;
      }
      return new Range(Pos(pos.line, start), Pos(pos.line, end));
    },

    toggleOverwrite: function(value) {
      if (value != null && value == this.state.overwrite) return;
      if (this.state.overwrite = !this.state.overwrite)
        addClass(this.display.cursorDiv, "CodeMirror-overwrite");
      else
        rmClass(this.display.cursorDiv, "CodeMirror-overwrite");

      signal(this, "overwriteToggle", this, this.state.overwrite);
    },
    hasFocus: function() { return this.display.input.getField() == activeElt(); },

    scrollTo: methodOp(function(x, y) {
      if (x != null || y != null) resolveScrollToPos(this);
      if (x != null) this.curOp.scrollLeft = x;
      if (y != null) this.curOp.scrollTop = y;
    }),
    getScrollInfo: function() {
      var scroller = this.display.scroller;
      return {left: scroller.scrollLeft, top: scroller.scrollTop,
              height: scroller.scrollHeight - scrollGap(this) - this.display.barHeight,
              width: scroller.scrollWidth - scrollGap(this) - this.display.barWidth,
              clientHeight: displayHeight(this), clientWidth: displayWidth(this)};
    },

    scrollIntoView: methodOp(function(range, margin) {
      if (range == null) {
        range = {from: this.doc.sel.primary().head, to: null};
        if (margin == null) margin = this.options.cursorScrollMargin;
      } else if (typeof range == "number") {
        range = {from: Pos(range, 0), to: null};
      } else if (range.from == null) {
        range = {from: range, to: null};
      }
      if (!range.to) range.to = range.from;
      range.margin = margin || 0;

      if (range.from.line != null) {
        resolveScrollToPos(this);
        this.curOp.scrollToPos = range;
      } else {
        var sPos = calculateScrollPos(this, Math.min(range.from.left, range.to.left),
                                      Math.min(range.from.top, range.to.top) - range.margin,
                                      Math.max(range.from.right, range.to.right),
                                      Math.max(range.from.bottom, range.to.bottom) + range.margin);
        this.scrollTo(sPos.scrollLeft, sPos.scrollTop);
      }
    }),

    setSize: methodOp(function(width, height) {
      var cm = this;
      function interpret(val) {
        return typeof val == "number" || /^\d+$/.test(String(val)) ? val + "px" : val;
      }
      if (width != null) cm.display.wrapper.style.width = interpret(width);
      if (height != null) cm.display.wrapper.style.height = interpret(height);
      if (cm.options.lineWrapping) clearLineMeasurementCache(this);
      var lineNo = cm.display.viewFrom;
      cm.doc.iter(lineNo, cm.display.viewTo, function(line) {
        if (line.widgets) for (var i = 0; i < line.widgets.length; i++)
          if (line.widgets[i].noHScroll) { regLineChange(cm, lineNo, "widget"); break; }
        ++lineNo;
      });
      cm.curOp.forceUpdate = true;
      signal(cm, "refresh", this);
    }),

    operation: function(f){return runInOp(this, f);},

    refresh: methodOp(function() {
      var oldHeight = this.display.cachedTextHeight;
      regChange(this);
      this.curOp.forceUpdate = true;
      clearCaches(this);
      this.scrollTo(this.doc.scrollLeft, this.doc.scrollTop);
      updateGutterSpace(this);
      if (oldHeight == null || Math.abs(oldHeight - textHeight(this.display)) > .5)
        estimateLineHeights(this);
      signal(this, "refresh", this);
    }),

    swapDoc: methodOp(function(doc) {
      var old = this.doc;
      old.cm = null;
      attachDoc(this, doc);
      clearCaches(this);
      this.display.input.reset();
      this.scrollTo(doc.scrollLeft, doc.scrollTop);
      this.curOp.forceScroll = true;
      signalLater(this, "swapDoc", this, old);
      return old;
    }),

    getInputField: function(){return this.display.input.getField();},
    getWrapperElement: function(){return this.display.wrapper;},
    getScrollerElement: function(){return this.display.scroller;},
    getGutterElement: function(){return this.display.gutters;}
  };
  eventMixin(CodeMirror);

  // OPTION DEFAULTS

  // The default configuration options.
  var defaults = CodeMirror.defaults = {};
  // Functions to run when options are changed.
  var optionHandlers = CodeMirror.optionHandlers = {};

  function option(name, deflt, handle, notOnInit) {
    CodeMirror.defaults[name] = deflt;
    if (handle) optionHandlers[name] =
      notOnInit ? function(cm, val, old) {if (old != Init) handle(cm, val, old);} : handle;
  }

  // Passed to option handlers when there is no old value.
  var Init = CodeMirror.Init = {toString: function(){return "CodeMirror.Init";}};

  // These two are, on init, called from the constructor because they
  // have to be initialized before the editor can start at all.
  option("value", "", function(cm, val) {
    cm.setValue(val);
  }, true);
  option("mode", null, function(cm, val) {
    cm.doc.modeOption = val;
    loadMode(cm);
  }, true);

  option("indentUnit", 2, loadMode, true);
  option("indentWithTabs", false);
  option("smartIndent", true);
  option("tabSize", 4, function(cm) {
    resetModeState(cm);
    clearCaches(cm);
    regChange(cm);
  }, true);
  option("lineSeparator", null, function(cm, val) {
    cm.doc.lineSep = val;
    if (!val) return;
    var newBreaks = [], lineNo = cm.doc.first;
    cm.doc.iter(function(line) {
      for (var pos = 0;;) {
        var found = line.text.indexOf(val, pos);
        if (found == -1) break;
        pos = found + val.length;
        newBreaks.push(Pos(lineNo, found));
      }
      lineNo++;
    });
    for (var i = newBreaks.length - 1; i >= 0; i--)
      replaceRange(cm.doc, val, newBreaks[i], Pos(newBreaks[i].line, newBreaks[i].ch + val.length))
  });
  option("specialChars", /[\t\u0000-\u0019\u00ad\u200b-\u200f\u2028\u2029\ufeff]/g, function(cm, val, old) {
    cm.state.specialChars = new RegExp(val.source + (val.test("\t") ? "" : "|\t"), "g");
    if (old != CodeMirror.Init) cm.refresh();
  });
  option("specialCharPlaceholder", defaultSpecialCharPlaceholder, function(cm) {cm.refresh();}, true);
  option("electricChars", true);
  option("inputStyle", mobile ? "contenteditable" : "textarea", function() {
    throw new Error("inputStyle can not (yet) be changed in a running editor"); // FIXME
  }, true);
  option("rtlMoveVisually", !windows);
  option("wholeLineUpdateBefore", true);

  option("theme", "default", function(cm) {
    themeChanged(cm);
    guttersChanged(cm);
  }, true);
  option("keyMap", "default", function(cm, val, old) {
    var next = getKeyMap(val);
    var prev = old != CodeMirror.Init && getKeyMap(old);
    if (prev && prev.detach) prev.detach(cm, next);
    if (next.attach) next.attach(cm, prev || null);
  });
  option("extraKeys", null);

  option("lineWrapping", false, wrappingChanged, true);
  option("gutters", [], function(cm) {
    setGuttersForLineNumbers(cm.options);
    guttersChanged(cm);
  }, true);
  option("fixedGutter", true, function(cm, val) {
    cm.display.gutters.style.left = val ? compensateForHScroll(cm.display) + "px" : "0";
    cm.refresh();
  }, true);
  option("coverGutterNextToScrollbar", false, function(cm) {updateScrollbars(cm);}, true);
  option("scrollbarStyle", "native", function(cm) {
    initScrollbars(cm);
    updateScrollbars(cm);
    cm.display.scrollbars.setScrollTop(cm.doc.scrollTop);
    cm.display.scrollbars.setScrollLeft(cm.doc.scrollLeft);
  }, true);
  option("lineNumbers", false, function(cm) {
    setGuttersForLineNumbers(cm.options);
    guttersChanged(cm);
  }, true);
  option("firstLineNumber", 1, guttersChanged, true);
  option("lineNumberFormatter", function(integer) {return integer;}, guttersChanged, true);
  option("showCursorWhenSelecting", false, updateSelection, true);

  option("resetSelectionOnContextMenu", true);
  option("lineWiseCopyCut", true);

  option("readOnly", false, function(cm, val) {
    if (val == "nocursor") {
      onBlur(cm);
      cm.display.input.blur();
      cm.display.disabled = true;
    } else {
      cm.display.disabled = false;
      if (!val) cm.display.input.reset();
    }
  });
  option("disableInput", false, function(cm, val) {if (!val) cm.display.input.reset();}, true);
  option("dragDrop", true, dragDropChanged);

  option("cursorBlinkRate", 530);
  option("cursorScrollMargin", 0);
  option("cursorHeight", 1, updateSelection, true);
  option("singleCursorHeightPerLine", true, updateSelection, true);
  option("workTime", 100);
  option("workDelay", 100);
  option("flattenSpans", true, resetModeState, true);
  option("addModeClass", false, resetModeState, true);
  option("pollInterval", 100);
  option("undoDepth", 200, function(cm, val){cm.doc.history.undoDepth = val;});
  option("historyEventDelay", 1250);
  option("viewportMargin", 10, function(cm){cm.refresh();}, true);
  option("maxHighlightLength", 10000, resetModeState, true);
  option("moveInputWithCursor", true, function(cm, val) {
    if (!val) cm.display.input.resetPosition();
  });

  option("tabindex", null, function(cm, val) {
    cm.display.input.getField().tabIndex = val || "";
  });
  option("autofocus", null);

  // MODE DEFINITION AND QUERYING

  // Known modes, by name and by MIME
  var modes = CodeMirror.modes = {}, mimeModes = CodeMirror.mimeModes = {};

  // Extra arguments are stored as the mode's dependencies, which is
  // used by (legacy) mechanisms like loadmode.js to automatically
  // load a mode. (Preferred mechanism is the require/define calls.)
  CodeMirror.defineMode = function(name, mode) {
    if (!CodeMirror.defaults.mode && name != "null") CodeMirror.defaults.mode = name;
    if (arguments.length > 2)
      mode.dependencies = Array.prototype.slice.call(arguments, 2);
    modes[name] = mode;
  };

  CodeMirror.defineMIME = function(mime, spec) {
    mimeModes[mime] = spec;
  };

  // Given a MIME type, a {name, ...options} config object, or a name
  // string, return a mode config object.
  CodeMirror.resolveMode = function(spec) {
    if (typeof spec == "string" && mimeModes.hasOwnProperty(spec)) {
      spec = mimeModes[spec];
    } else if (spec && typeof spec.name == "string" && mimeModes.hasOwnProperty(spec.name)) {
      var found = mimeModes[spec.name];
      if (typeof found == "string") found = {name: found};
      spec = createObj(found, spec);
      spec.name = found.name;
    } else if (typeof spec == "string" && /^[\w\-]+\/[\w\-]+\+xml$/.test(spec)) {
      return CodeMirror.resolveMode("application/xml");
    }
    if (typeof spec == "string") return {name: spec};
    else return spec || {name: "null"};
  };

  // Given a mode spec (anything that resolveMode accepts), find and
  // initialize an actual mode object.
  CodeMirror.getMode = function(options, spec) {
    var spec = CodeMirror.resolveMode(spec);
    var mfactory = modes[spec.name];
    if (!mfactory) return CodeMirror.getMode(options, "text/plain");
    var modeObj = mfactory(options, spec);
    if (modeExtensions.hasOwnProperty(spec.name)) {
      var exts = modeExtensions[spec.name];
      for (var prop in exts) {
        if (!exts.hasOwnProperty(prop)) continue;
        if (modeObj.hasOwnProperty(prop)) modeObj["_" + prop] = modeObj[prop];
        modeObj[prop] = exts[prop];
      }
    }
    modeObj.name = spec.name;
    if (spec.helperType) modeObj.helperType = spec.helperType;
    if (spec.modeProps) for (var prop in spec.modeProps)
      modeObj[prop] = spec.modeProps[prop];

    return modeObj;
  };

  // Minimal default mode.
  CodeMirror.defineMode("null", function() {
    return {token: function(stream) {stream.skipToEnd();}};
  });
  CodeMirror.defineMIME("text/plain", "null");

  // This can be used to attach properties to mode objects from
  // outside the actual mode definition.
  var modeExtensions = CodeMirror.modeExtensions = {};
  CodeMirror.extendMode = function(mode, properties) {
    var exts = modeExtensions.hasOwnProperty(mode) ? modeExtensions[mode] : (modeExtensions[mode] = {});
    copyObj(properties, exts);
  };

  // EXTENSIONS

  CodeMirror.defineExtension = function(name, func) {
    CodeMirror.prototype[name] = func;
  };
  CodeMirror.defineDocExtension = function(name, func) {
    Doc.prototype[name] = func;
  };
  CodeMirror.defineOption = option;

  var initHooks = [];
  CodeMirror.defineInitHook = function(f) {initHooks.push(f);};

  var helpers = CodeMirror.helpers = {};
  CodeMirror.registerHelper = function(type, name, value) {
    if (!helpers.hasOwnProperty(type)) helpers[type] = CodeMirror[type] = {_global: []};
    helpers[type][name] = value;
  };
  CodeMirror.registerGlobalHelper = function(type, name, predicate, value) {
    CodeMirror.registerHelper(type, name, value);
    helpers[type]._global.push({pred: predicate, val: value});
  };

  // MODE STATE HANDLING

  // Utility functions for working with state. Exported because nested
  // modes need to do this for their inner modes.

  var copyState = CodeMirror.copyState = function(mode, state) {
    if (state === true) return state;
    if (mode.copyState) return mode.copyState(state);
    var nstate = {};
    for (var n in state) {
      var val = state[n];
      if (val instanceof Array) val = val.concat([]);
      nstate[n] = val;
    }
    return nstate;
  };

  var startState = CodeMirror.startState = function(mode, a1, a2) {
    return mode.startState ? mode.startState(a1, a2) : true;
  };

  // Given a mode and a state (for that mode), find the inner mode and
  // state at the position that the state refers to.
  CodeMirror.innerMode = function(mode, state) {
    while (mode.innerMode) {
      var info = mode.innerMode(state);
      if (!info || info.mode == mode) break;
      state = info.state;
      mode = info.mode;
    }
    return info || {mode: mode, state: state};
  };

  // STANDARD COMMANDS

  // Commands are parameter-less actions that can be performed on an
  // editor, mostly used for keybindings.
  var commands = CodeMirror.commands = {
    selectAll: function(cm) {cm.setSelection(Pos(cm.firstLine(), 0), Pos(cm.lastLine()), sel_dontScroll);},
    singleSelection: function(cm) {
      cm.setSelection(cm.getCursor("anchor"), cm.getCursor("head"), sel_dontScroll);
    },
    killLine: function(cm) {
      deleteNearSelection(cm, function(range) {
        if (range.empty()) {
          var len = getLine(cm.doc, range.head.line).text.length;
          if (range.head.ch == len && range.head.line < cm.lastLine())
            return {from: range.head, to: Pos(range.head.line + 1, 0)};
          else
            return {from: range.head, to: Pos(range.head.line, len)};
        } else {
          return {from: range.from(), to: range.to()};
        }
      });
    },
    deleteLine: function(cm) {
      deleteNearSelection(cm, function(range) {
        return {from: Pos(range.from().line, 0),
                to: clipPos(cm.doc, Pos(range.to().line + 1, 0))};
      });
    },
    delLineLeft: function(cm) {
      deleteNearSelection(cm, function(range) {
        return {from: Pos(range.from().line, 0), to: range.from()};
      });
    },
    delWrappedLineLeft: function(cm) {
      deleteNearSelection(cm, function(range) {
        var top = cm.charCoords(range.head, "div").top + 5;
        var leftPos = cm.coordsChar({left: 0, top: top}, "div");
        return {from: leftPos, to: range.from()};
      });
    },
    delWrappedLineRight: function(cm) {
      deleteNearSelection(cm, function(range) {
        var top = cm.charCoords(range.head, "div").top + 5;
        var rightPos = cm.coordsChar({left: cm.display.lineDiv.offsetWidth + 100, top: top}, "div");
        return {from: range.from(), to: rightPos };
      });
    },
    undo: function(cm) {cm.undo();},
    redo: function(cm) {cm.redo();},
    undoSelection: function(cm) {cm.undoSelection();},
    redoSelection: function(cm) {cm.redoSelection();},
    goDocStart: function(cm) {cm.extendSelection(Pos(cm.firstLine(), 0));},
    goDocEnd: function(cm) {cm.extendSelection(Pos(cm.lastLine()));},
    goLineStart: function(cm) {
      cm.extendSelectionsBy(function(range) { return lineStart(cm, range.head.line); },
                            {origin: "+move", bias: 1});
    },
    goLineStartSmart: function(cm) {
      cm.extendSelectionsBy(function(range) {
        return lineStartSmart(cm, range.head);
      }, {origin: "+move", bias: 1});
    },
    goLineEnd: function(cm) {
      cm.extendSelectionsBy(function(range) { return lineEnd(cm, range.head.line); },
                            {origin: "+move", bias: -1});
    },
    goLineRight: function(cm) {
      cm.extendSelectionsBy(function(range) {
        var top = cm.charCoords(range.head, "div").top + 5;
        return cm.coordsChar({left: cm.display.lineDiv.offsetWidth + 100, top: top}, "div");
      }, sel_move);
    },
    goLineLeft: function(cm) {
      cm.extendSelectionsBy(function(range) {
        var top = cm.charCoords(range.head, "div").top + 5;
        return cm.coordsChar({left: 0, top: top}, "div");
      }, sel_move);
    },
    goLineLeftSmart: function(cm) {
      cm.extendSelectionsBy(function(range) {
        var top = cm.charCoords(range.head, "div").top + 5;
        var pos = cm.coordsChar({left: 0, top: top}, "div");
        if (pos.ch < cm.getLine(pos.line).search(/\S/)) return lineStartSmart(cm, range.head);
        return pos;
      }, sel_move);
    },
    goLineUp: function(cm) {cm.moveV(-1, "line");},
    goLineDown: function(cm) {cm.moveV(1, "line");},
    goPageUp: function(cm) {cm.moveV(-1, "page");},
    goPageDown: function(cm) {cm.moveV(1, "page");},
    goCharLeft: function(cm) {cm.moveH(-1, "char");},
    goCharRight: function(cm) {cm.moveH(1, "char");},
    goColumnLeft: function(cm) {cm.moveH(-1, "column");},
    goColumnRight: function(cm) {cm.moveH(1, "column");},
    goWordLeft: function(cm) {cm.moveH(-1, "word");},
    goGroupRight: function(cm) {cm.moveH(1, "group");},
    goGroupLeft: function(cm) {cm.moveH(-1, "group");},
    goWordRight: function(cm) {cm.moveH(1, "word");},
    delCharBefore: function(cm) {cm.deleteH(-1, "char");},
    delCharAfter: function(cm) {cm.deleteH(1, "char");},
    delWordBefore: function(cm) {cm.deleteH(-1, "word");},
    delWordAfter: function(cm) {cm.deleteH(1, "word");},
    delGroupBefore: function(cm) {cm.deleteH(-1, "group");},
    delGroupAfter: function(cm) {cm.deleteH(1, "group");},
    indentAuto: function(cm) {cm.indentSelection("smart");},
    indentMore: function(cm) {cm.indentSelection("add");},
    indentLess: function(cm) {cm.indentSelection("subtract");},
    insertTab: function(cm) {cm.replaceSelection("\t");},
    insertSoftTab: function(cm) {
      var spaces = [], ranges = cm.listSelections(), tabSize = cm.options.tabSize;
      for (var i = 0; i < ranges.length; i++) {
        var pos = ranges[i].from();
        var col = countColumn(cm.getLine(pos.line), pos.ch, tabSize);
        spaces.push(new Array(tabSize - col % tabSize + 1).join(" "));
      }
      cm.replaceSelections(spaces);
    },
    defaultTab: function(cm) {
      if (cm.somethingSelected()) cm.indentSelection("add");
      else cm.execCommand("insertTab");
    },
    transposeChars: function(cm) {
      runInOp(cm, function() {
        var ranges = cm.listSelections(), newSel = [];
        for (var i = 0; i < ranges.length; i++) {
          var cur = ranges[i].head, line = getLine(cm.doc, cur.line).text;
          if (line) {
            if (cur.ch == line.length) cur = new Pos(cur.line, cur.ch - 1);
            if (cur.ch > 0) {
              cur = new Pos(cur.line, cur.ch + 1);
              cm.replaceRange(line.charAt(cur.ch - 1) + line.charAt(cur.ch - 2),
                              Pos(cur.line, cur.ch - 2), cur, "+transpose");
            } else if (cur.line > cm.doc.first) {
              var prev = getLine(cm.doc, cur.line - 1).text;
              if (prev)
                cm.replaceRange(line.charAt(0) + cm.doc.lineSeparator() +
                                prev.charAt(prev.length - 1),
                                Pos(cur.line - 1, prev.length - 1), Pos(cur.line, 1), "+transpose");
            }
          }
          newSel.push(new Range(cur, cur));
        }
        cm.setSelections(newSel);
      });
    },
    newlineAndIndent: function(cm) {
      runInOp(cm, function() {
        var len = cm.listSelections().length;
        for (var i = 0; i < len; i++) {
          var range = cm.listSelections()[i];
          cm.replaceRange(cm.doc.lineSeparator(), range.anchor, range.head, "+input");
          cm.indentLine(range.from().line + 1, null, true);
          ensureCursorVisible(cm);
        }
      });
    },
    toggleOverwrite: function(cm) {cm.toggleOverwrite();}
  };


  // STANDARD KEYMAPS

  var keyMap = CodeMirror.keyMap = {};

  keyMap.basic = {
    "Left": "goCharLeft", "Right": "goCharRight", "Up": "goLineUp", "Down": "goLineDown",
    "End": "goLineEnd", "Home": "goLineStartSmart", "PageUp": "goPageUp", "PageDown": "goPageDown",
    "Delete": "delCharAfter", "Backspace": "delCharBefore", "Shift-Backspace": "delCharBefore",
    "Tab": "defaultTab", "Shift-Tab": "indentAuto",
    "Enter": "newlineAndIndent", "Insert": "toggleOverwrite",
    "Esc": "singleSelection"
  };
  // Note that the save and find-related commands aren't defined by
  // default. User code or addons can define them. Unknown commands
  // are simply ignored.
  keyMap.pcDefault = {
    "Ctrl-A": "selectAll", "Ctrl-D": "deleteLine", "Ctrl-Z": "undo", "Shift-Ctrl-Z": "redo", "Ctrl-Y": "redo",
    "Ctrl-Home": "goDocStart", "Ctrl-End": "goDocEnd", "Ctrl-Up": "goLineUp", "Ctrl-Down": "goLineDown",
    "Ctrl-Left": "goGroupLeft", "Ctrl-Right": "goGroupRight", "Alt-Left": "goLineStart", "Alt-Right": "goLineEnd",
    "Ctrl-Backspace": "delGroupBefore", "Ctrl-Delete": "delGroupAfter", "Ctrl-S": "save", "Ctrl-F": "find",
    "Ctrl-G": "findNext", "Shift-Ctrl-G": "findPrev", "Shift-Ctrl-F": "replace", "Shift-Ctrl-R": "replaceAll",
    "Ctrl-[": "indentLess", "Ctrl-]": "indentMore",
    "Ctrl-U": "undoSelection", "Shift-Ctrl-U": "redoSelection", "Alt-U": "redoSelection",
    fallthrough: "basic"
  };
  // Very basic readline/emacs-style bindings, which are standard on Mac.
  keyMap.emacsy = {
    "Ctrl-F": "goCharRight", "Ctrl-B": "goCharLeft", "Ctrl-P": "goLineUp", "Ctrl-N": "goLineDown",
    "Alt-F": "goWordRight", "Alt-B": "goWordLeft", "Ctrl-A": "goLineStart", "Ctrl-E": "goLineEnd",
    "Ctrl-V": "goPageDown", "Shift-Ctrl-V": "goPageUp", "Ctrl-D": "delCharAfter", "Ctrl-H": "delCharBefore",
    "Alt-D": "delWordAfter", "Alt-Backspace": "delWordBefore", "Ctrl-K": "killLine", "Ctrl-T": "transposeChars"
  };
  keyMap.macDefault = {
    "Cmd-A": "selectAll", "Cmd-D": "deleteLine", "Cmd-Z": "undo", "Shift-Cmd-Z": "redo", "Cmd-Y": "redo",
    "Cmd-Home": "goDocStart", "Cmd-Up": "goDocStart", "Cmd-End": "goDocEnd", "Cmd-Down": "goDocEnd", "Alt-Left": "goGroupLeft",
    "Alt-Right": "goGroupRight", "Cmd-Left": "goLineLeft", "Cmd-Right": "goLineRight", "Alt-Backspace": "delGroupBefore",
    "Ctrl-Alt-Backspace": "delGroupAfter", "Alt-Delete": "delGroupAfter", "Cmd-S": "save", "Cmd-F": "find",
    "Cmd-G": "findNext", "Shift-Cmd-G": "findPrev", "Cmd-Alt-F": "replace", "Shift-Cmd-Alt-F": "replaceAll",
    "Cmd-[": "indentLess", "Cmd-]": "indentMore", "Cmd-Backspace": "delWrappedLineLeft", "Cmd-Delete": "delWrappedLineRight",
    "Cmd-U": "undoSelection", "Shift-Cmd-U": "redoSelection", "Ctrl-Up": "goDocStart", "Ctrl-Down": "goDocEnd",
    fallthrough: ["basic", "emacsy"]
  };
  keyMap["default"] = mac ? keyMap.macDefault : keyMap.pcDefault;

  // KEYMAP DISPATCH

  function normalizeKeyName(name) {
    var parts = name.split(/-(?!$)/), name = parts[parts.length - 1];
    var alt, ctrl, shift, cmd;
    for (var i = 0; i < parts.length - 1; i++) {
      var mod = parts[i];
      if (/^(cmd|meta|m)$/i.test(mod)) cmd = true;
      else if (/^a(lt)?$/i.test(mod)) alt = true;
      else if (/^(c|ctrl|control)$/i.test(mod)) ctrl = true;
      else if (/^s(hift)$/i.test(mod)) shift = true;
      else throw new Error("Unrecognized modifier name: " + mod);
    }
    if (alt) name = "Alt-" + name;
    if (ctrl) name = "Ctrl-" + name;
    if (cmd) name = "Cmd-" + name;
    if (shift) name = "Shift-" + name;
    return name;
  }

  // This is a kludge to keep keymaps mostly working as raw objects
  // (backwards compatibility) while at the same time support features
  // like normalization and multi-stroke key bindings. It compiles a
  // new normalized keymap, and then updates the old object to reflect
  // this.
  CodeMirror.normalizeKeyMap = function(keymap) {
    var copy = {};
    for (var keyname in keymap) if (keymap.hasOwnProperty(keyname)) {
      var value = keymap[keyname];
      if (/^(name|fallthrough|(de|at)tach)$/.test(keyname)) continue;
      if (value == "...") { delete keymap[keyname]; continue; }

      var keys = map(keyname.split(" "), normalizeKeyName);
      for (var i = 0; i < keys.length; i++) {
        var val, name;
        if (i == keys.length - 1) {
          name = keys.join(" ");
          val = value;
        } else {
          name = keys.slice(0, i + 1).join(" ");
          val = "...";
        }
        var prev = copy[name];
        if (!prev) copy[name] = val;
        else if (prev != val) throw new Error("Inconsistent bindings for " + name);
      }
      delete keymap[keyname];
    }
    for (var prop in copy) keymap[prop] = copy[prop];
    return keymap;
  };

  var lookupKey = CodeMirror.lookupKey = function(key, map, handle, context) {
    map = getKeyMap(map);
    var found = map.call ? map.call(key, context) : map[key];
    if (found === false) return "nothing";
    if (found === "...") return "multi";
    if (found != null && handle(found)) return "handled";

    if (map.fallthrough) {
      if (Object.prototype.toString.call(map.fallthrough) != "[object Array]")
        return lookupKey(key, map.fallthrough, handle, context);
      for (var i = 0; i < map.fallthrough.length; i++) {
        var result = lookupKey(key, map.fallthrough[i], handle, context);
        if (result) return result;
      }
    }
  };

  // Modifier key presses don't count as 'real' key presses for the
  // purpose of keymap fallthrough.
  var isModifierKey = CodeMirror.isModifierKey = function(value) {
    var name = typeof value == "string" ? value : keyNames[value.keyCode];
    return name == "Ctrl" || name == "Alt" || name == "Shift" || name == "Mod";
  };

  // Look up the name of a key as indicated by an event object.
  var keyName = CodeMirror.keyName = function(event, noShift) {
    if (presto && event.keyCode == 34 && event["char"]) return false;
    var base = keyNames[event.keyCode], name = base;
    if (name == null || event.altGraphKey) return false;
    if (event.altKey && base != "Alt") name = "Alt-" + name;
    if ((flipCtrlCmd ? event.metaKey : event.ctrlKey) && base != "Ctrl") name = "Ctrl-" + name;
    if ((flipCtrlCmd ? event.ctrlKey : event.metaKey) && base != "Cmd") name = "Cmd-" + name;
    if (!noShift && event.shiftKey && base != "Shift") name = "Shift-" + name;
    return name;
  };

  function getKeyMap(val) {
    return typeof val == "string" ? keyMap[val] : val;
  }

  // FROMTEXTAREA

  CodeMirror.fromTextArea = function(textarea, options) {
    options = options ? copyObj(options) : {};
    options.value = textarea.value;
    if (!options.tabindex && textarea.tabIndex)
      options.tabindex = textarea.tabIndex;
    if (!options.placeholder && textarea.placeholder)
      options.placeholder = textarea.placeholder;
    // Set autofocus to true if this textarea is focused, or if it has
    // autofocus and no other element is focused.
    if (options.autofocus == null) {
      var hasFocus = activeElt();
      options.autofocus = hasFocus == textarea ||
        textarea.getAttribute("autofocus") != null && hasFocus == document.body;
    }

    function save() {textarea.value = cm.getValue();}
    if (textarea.form) {
      on(textarea.form, "submit", save);
      // Deplorable hack to make the submit method do the right thing.
      if (!options.leaveSubmitMethodAlone) {
        var form = textarea.form, realSubmit = form.submit;
        try {
          var wrappedSubmit = form.submit = function() {
            save();
            form.submit = realSubmit;
            form.submit();
            form.submit = wrappedSubmit;
          };
        } catch(e) {}
      }
    }

    options.finishInit = function(cm) {
      cm.save = save;
      cm.getTextArea = function() { return textarea; };
      cm.toTextArea = function() {
        cm.toTextArea = isNaN; // Prevent this from being ran twice
        save();
        textarea.parentNode.removeChild(cm.getWrapperElement());
        textarea.style.display = "";
        if (textarea.form) {
          off(textarea.form, "submit", save);
          if (typeof textarea.form.submit == "function")
            textarea.form.submit = realSubmit;
        }
      };
    };

    textarea.style.display = "none";
    var cm = CodeMirror(function(node) {
      textarea.parentNode.insertBefore(node, textarea.nextSibling);
    }, options);
    return cm;
  };

  // STRING STREAM

  // Fed to the mode parsers, provides helper functions to make
  // parsers more succinct.

  var StringStream = CodeMirror.StringStream = function(string, tabSize) {
    this.pos = this.start = 0;
    this.string = string;
    this.tabSize = tabSize || 8;
    this.lastColumnPos = this.lastColumnValue = 0;
    this.lineStart = 0;
  };

  StringStream.prototype = {
    eol: function() {return this.pos >= this.string.length;},
    sol: function() {return this.pos == this.lineStart;},
    peek: function() {return this.string.charAt(this.pos) || undefined;},
    next: function() {
      if (this.pos < this.string.length)
        return this.string.charAt(this.pos++);
    },
    eat: function(match) {
      var ch = this.string.charAt(this.pos);
      if (typeof match == "string") var ok = ch == match;
      else var ok = ch && (match.test ? match.test(ch) : match(ch));
      if (ok) {++this.pos; return ch;}
    },
    eatWhile: function(match) {
      var start = this.pos;
      while (this.eat(match)){}
      return this.pos > start;
    },
    eatSpace: function() {
      var start = this.pos;
      while (/[\s\u00a0]/.test(this.string.charAt(this.pos))) ++this.pos;
      return this.pos > start;
    },
    skipToEnd: function() {this.pos = this.string.length;},
    skipTo: function(ch) {
      var found = this.string.indexOf(ch, this.pos);
      if (found > -1) {this.pos = found; return true;}
    },
    backUp: function(n) {this.pos -= n;},
    column: function() {
      if (this.lastColumnPos < this.start) {
        this.lastColumnValue = countColumn(this.string, this.start, this.tabSize, this.lastColumnPos, this.lastColumnValue);
        this.lastColumnPos = this.start;
      }
      return this.lastColumnValue - (this.lineStart ? countColumn(this.string, this.lineStart, this.tabSize) : 0);
    },
    indentation: function() {
      return countColumn(this.string, null, this.tabSize) -
        (this.lineStart ? countColumn(this.string, this.lineStart, this.tabSize) : 0);
    },
    match: function(pattern, consume, caseInsensitive) {
      if (typeof pattern == "string") {
        var cased = function(str) {return caseInsensitive ? str.toLowerCase() : str;};
        var substr = this.string.substr(this.pos, pattern.length);
        if (cased(substr) == cased(pattern)) {
          if (consume !== false) this.pos += pattern.length;
          return true;
        }
      } else {
        var match = this.string.slice(this.pos).match(pattern);
        if (match && match.index > 0) return null;
        if (match && consume !== false) this.pos += match[0].length;
        return match;
      }
    },
    current: function(){return this.string.slice(this.start, this.pos);},
    hideFirstChars: function(n, inner) {
      this.lineStart += n;
      try { return inner(); }
      finally { this.lineStart -= n; }
    }
  };

  // TEXTMARKERS

  // Created with markText and setBookmark methods. A TextMarker is a
  // handle that can be used to clear or find a marked position in the
  // document. Line objects hold arrays (markedSpans) containing
  // {from, to, marker} object pointing to such marker objects, and
  // indicating that such a marker is present on that line. Multiple
  // lines may point to the same marker when it spans across lines.
  // The spans will have null for their from/to properties when the
  // marker continues beyond the start/end of the line. Markers have
  // links back to the lines they currently touch.

  var nextMarkerId = 0;

  var TextMarker = CodeMirror.TextMarker = function(doc, type) {
    this.lines = [];
    this.type = type;
    this.doc = doc;
    this.id = ++nextMarkerId;
  };
  eventMixin(TextMarker);

  // Clear the marker.
  TextMarker.prototype.clear = function() {
    if (this.explicitlyCleared) return;
    var cm = this.doc.cm, withOp = cm && !cm.curOp;
    if (withOp) startOperation(cm);
    if (hasHandler(this, "clear")) {
      var found = this.find();
      if (found) signalLater(this, "clear", found.from, found.to);
    }
    var min = null, max = null;
    for (var i = 0; i < this.lines.length; ++i) {
      var line = this.lines[i];
      var span = getMarkedSpanFor(line.markedSpans, this);
      if (cm && !this.collapsed) regLineChange(cm, lineNo(line), "text");
      else if (cm) {
        if (span.to != null) max = lineNo(line);
        if (span.from != null) min = lineNo(line);
      }
      line.markedSpans = removeMarkedSpan(line.markedSpans, span);
      if (span.from == null && this.collapsed && !lineIsHidden(this.doc, line) && cm)
        updateLineHeight(line, textHeight(cm.display));
    }
    if (cm && this.collapsed && !cm.options.lineWrapping) for (var i = 0; i < this.lines.length; ++i) {
      var visual = visualLine(this.lines[i]), len = lineLength(visual);
      if (len > cm.display.maxLineLength) {
        cm.display.maxLine = visual;
        cm.display.maxLineLength = len;
        cm.display.maxLineChanged = true;
      }
    }

    if (min != null && cm && this.collapsed) regChange(cm, min, max + 1);
    this.lines.length = 0;
    this.explicitlyCleared = true;
    if (this.atomic && this.doc.cantEdit) {
      this.doc.cantEdit = false;
      if (cm) reCheckSelection(cm.doc);
    }
    if (cm) signalLater(cm, "markerCleared", cm, this);
    if (withOp) endOperation(cm);
    if (this.parent) this.parent.clear();
  };

  // Find the position of the marker in the document. Returns a {from,
  // to} object by default. Side can be passed to get a specific side
  // -- 0 (both), -1 (left), or 1 (right). When lineObj is true, the
  // Pos objects returned contain a line object, rather than a line
  // number (used to prevent looking up the same line twice).
  TextMarker.prototype.find = function(side, lineObj) {
    if (side == null && this.type == "bookmark") side = 1;
    var from, to;
    for (var i = 0; i < this.lines.length; ++i) {
      var line = this.lines[i];
      var span = getMarkedSpanFor(line.markedSpans, this);
      if (span.from != null) {
        from = Pos(lineObj ? line : lineNo(line), span.from);
        if (side == -1) return from;
      }
      if (span.to != null) {
        to = Pos(lineObj ? line : lineNo(line), span.to);
        if (side == 1) return to;
      }
    }
    return from && {from: from, to: to};
  };

  // Signals that the marker's widget changed, and surrounding layout
  // should be recomputed.
  TextMarker.prototype.changed = function() {
    var pos = this.find(-1, true), widget = this, cm = this.doc.cm;
    if (!pos || !cm) return;
    runInOp(cm, function() {
      var line = pos.line, lineN = lineNo(pos.line);
      var view = findViewForLine(cm, lineN);
      if (view) {
        clearLineMeasurementCacheFor(view);
        cm.curOp.selectionChanged = cm.curOp.forceUpdate = true;
      }
      cm.curOp.updateMaxLine = true;
      if (!lineIsHidden(widget.doc, line) && widget.height != null) {
        var oldHeight = widget.height;
        widget.height = null;
        var dHeight = widgetHeight(widget) - oldHeight;
        if (dHeight)
          updateLineHeight(line, line.height + dHeight);
      }
    });
  };

  TextMarker.prototype.attachLine = function(line) {
    if (!this.lines.length && this.doc.cm) {
      var op = this.doc.cm.curOp;
      if (!op.maybeHiddenMarkers || indexOf(op.maybeHiddenMarkers, this) == -1)
        (op.maybeUnhiddenMarkers || (op.maybeUnhiddenMarkers = [])).push(this);
    }
    this.lines.push(line);
  };
  TextMarker.prototype.detachLine = function(line) {
    this.lines.splice(indexOf(this.lines, line), 1);
    if (!this.lines.length && this.doc.cm) {
      var op = this.doc.cm.curOp;
      (op.maybeHiddenMarkers || (op.maybeHiddenMarkers = [])).push(this);
    }
  };

  // Collapsed markers have unique ids, in order to be able to order
  // them, which is needed for uniquely determining an outer marker
  // when they overlap (they may nest, but not partially overlap).
  var nextMarkerId = 0;

  // Create a marker, wire it up to the right lines, and
  function markText(doc, from, to, options, type) {
    // Shared markers (across linked documents) are handled separately
    // (markTextShared will call out to this again, once per
    // document).
    if (options && options.shared) return markTextShared(doc, from, to, options, type);
    // Ensure we are in an operation.
    if (doc.cm && !doc.cm.curOp) return operation(doc.cm, markText)(doc, from, to, options, type);

    var marker = new TextMarker(doc, type), diff = cmp(from, to);
    if (options) copyObj(options, marker, false);
    // Don't connect empty markers unless clearWhenEmpty is false
    if (diff > 0 || diff == 0 && marker.clearWhenEmpty !== false)
      return marker;
    if (marker.replacedWith) {
      // Showing up as a widget implies collapsed (widget replaces text)
      marker.collapsed = true;
      marker.widgetNode = elt("span", [marker.replacedWith], "CodeMirror-widget");
      if (!options.handleMouseEvents) marker.widgetNode.setAttribute("cm-ignore-events", "true");
      if (options.insertLeft) marker.widgetNode.insertLeft = true;
    }
    if (marker.collapsed) {
      if (conflictingCollapsedRange(doc, from.line, from, to, marker) ||
          from.line != to.line && conflictingCollapsedRange(doc, to.line, from, to, marker))
        throw new Error("Inserting collapsed marker partially overlapping an existing one");
      sawCollapsedSpans = true;
    }

    if (marker.addToHistory)
      addChangeToHistory(doc, {from: from, to: to, origin: "markText"}, doc.sel, NaN);

    var curLine = from.line, cm = doc.cm, updateMaxLine;
    doc.iter(curLine, to.line + 1, function(line) {
      if (cm && marker.collapsed && !cm.options.lineWrapping && visualLine(line) == cm.display.maxLine)
        updateMaxLine = true;
      if (marker.collapsed && curLine != from.line) updateLineHeight(line, 0);
      addMarkedSpan(line, new MarkedSpan(marker,
                                         curLine == from.line ? from.ch : null,
                                         curLine == to.line ? to.ch : null));
      ++curLine;
    });
    // lineIsHidden depends on the presence of the spans, so needs a second pass
    if (marker.collapsed) doc.iter(from.line, to.line + 1, function(line) {
      if (lineIsHidden(doc, line)) updateLineHeight(line, 0);
    });

    if (marker.clearOnEnter) on(marker, "beforeCursorEnter", function() { marker.clear(); });

    if (marker.readOnly) {
      sawReadOnlySpans = true;
      if (doc.history.done.length || doc.history.undone.length)
        doc.clearHistory();
    }
    if (marker.collapsed) {
      marker.id = ++nextMarkerId;
      marker.atomic = true;
    }
    if (cm) {
      // Sync editor state
      if (updateMaxLine) cm.curOp.updateMaxLine = true;
      if (marker.collapsed)
        regChange(cm, from.line, to.line + 1);
      else if (marker.className || marker.title || marker.startStyle || marker.endStyle || marker.css)
        for (var i = from.line; i <= to.line; i++) regLineChange(cm, i, "text");
      if (marker.atomic) reCheckSelection(cm.doc);
      signalLater(cm, "markerAdded", cm, marker);
    }
    return marker;
  }

  // SHARED TEXTMARKERS

  // A shared marker spans multiple linked documents. It is
  // implemented as a meta-marker-object controlling multiple normal
  // markers.
  var SharedTextMarker = CodeMirror.SharedTextMarker = function(markers, primary) {
    this.markers = markers;
    this.primary = primary;
    for (var i = 0; i < markers.length; ++i)
      markers[i].parent = this;
  };
  eventMixin(SharedTextMarker);

  SharedTextMarker.prototype.clear = function() {
    if (this.explicitlyCleared) return;
    this.explicitlyCleared = true;
    for (var i = 0; i < this.markers.length; ++i)
      this.markers[i].clear();
    signalLater(this, "clear");
  };
  SharedTextMarker.prototype.find = function(side, lineObj) {
    return this.primary.find(side, lineObj);
  };

  function markTextShared(doc, from, to, options, type) {
    options = copyObj(options);
    options.shared = false;
    var markers = [markText(doc, from, to, options, type)], primary = markers[0];
    var widget = options.widgetNode;
    linkedDocs(doc, function(doc) {
      if (widget) options.widgetNode = widget.cloneNode(true);
      markers.push(markText(doc, clipPos(doc, from), clipPos(doc, to), options, type));
      for (var i = 0; i < doc.linked.length; ++i)
        if (doc.linked[i].isParent) return;
      primary = lst(markers);
    });
    return new SharedTextMarker(markers, primary);
  }

  function findSharedMarkers(doc) {
    return doc.findMarks(Pos(doc.first, 0), doc.clipPos(Pos(doc.lastLine())),
                         function(m) { return m.parent; });
  }

  function copySharedMarkers(doc, markers) {
    for (var i = 0; i < markers.length; i++) {
      var marker = markers[i], pos = marker.find();
      var mFrom = doc.clipPos(pos.from), mTo = doc.clipPos(pos.to);
      if (cmp(mFrom, mTo)) {
        var subMark = markText(doc, mFrom, mTo, marker.primary, marker.primary.type);
        marker.markers.push(subMark);
        subMark.parent = marker;
      }
    }
  }

  function detachSharedMarkers(markers) {
    for (var i = 0; i < markers.length; i++) {
      var marker = markers[i], linked = [marker.primary.doc];;
      linkedDocs(marker.primary.doc, function(d) { linked.push(d); });
      for (var j = 0; j < marker.markers.length; j++) {
        var subMarker = marker.markers[j];
        if (indexOf(linked, subMarker.doc) == -1) {
          subMarker.parent = null;
          marker.markers.splice(j--, 1);
        }
      }
    }
  }

  // TEXTMARKER SPANS

  function MarkedSpan(marker, from, to) {
    this.marker = marker;
    this.from = from; this.to = to;
  }

  // Search an array of spans for a span matching the given marker.
  function getMarkedSpanFor(spans, marker) {
    if (spans) for (var i = 0; i < spans.length; ++i) {
      var span = spans[i];
      if (span.marker == marker) return span;
    }
  }
  // Remove a span from an array, returning undefined if no spans are
  // left (we don't store arrays for lines without spans).
  function removeMarkedSpan(spans, span) {
    for (var r, i = 0; i < spans.length; ++i)
      if (spans[i] != span) (r || (r = [])).push(spans[i]);
    return r;
  }
  // Add a span to a line.
  function addMarkedSpan(line, span) {
    line.markedSpans = line.markedSpans ? line.markedSpans.concat([span]) : [span];
    span.marker.attachLine(line);
  }

  // Used for the algorithm that adjusts markers for a change in the
  // document. These functions cut an array of spans at a given
  // character position, returning an array of remaining chunks (or
  // undefined if nothing remains).
  function markedSpansBefore(old, startCh, isInsert) {
    if (old) for (var i = 0, nw; i < old.length; ++i) {
      var span = old[i], marker = span.marker;
      var startsBefore = span.from == null || (marker.inclusiveLeft ? span.from <= startCh : span.from < startCh);
      if (startsBefore || span.from == startCh && marker.type == "bookmark" && (!isInsert || !span.marker.insertLeft)) {
        var endsAfter = span.to == null || (marker.inclusiveRight ? span.to >= startCh : span.to > startCh);
        (nw || (nw = [])).push(new MarkedSpan(marker, span.from, endsAfter ? null : span.to));
      }
    }
    return nw;
  }
  function markedSpansAfter(old, endCh, isInsert) {
    if (old) for (var i = 0, nw; i < old.length; ++i) {
      var span = old[i], marker = span.marker;
      var endsAfter = span.to == null || (marker.inclusiveRight ? span.to >= endCh : span.to > endCh);
      if (endsAfter || span.from == endCh && marker.type == "bookmark" && (!isInsert || span.marker.insertLeft)) {
        var startsBefore = span.from == null || (marker.inclusiveLeft ? span.from <= endCh : span.from < endCh);
        (nw || (nw = [])).push(new MarkedSpan(marker, startsBefore ? null : span.from - endCh,
                                              span.to == null ? null : span.to - endCh));
      }
    }
    return nw;
  }

  // Given a change object, compute the new set of marker spans that
  // cover the line in which the change took place. Removes spans
  // entirely within the change, reconnects spans belonging to the
  // same marker that appear on both sides of the change, and cuts off
  // spans partially within the change. Returns an array of span
  // arrays with one element for each line in (after) the change.
  function stretchSpansOverChange(doc, change) {
    if (change.full) return null;
    var oldFirst = isLine(doc, change.from.line) && getLine(doc, change.from.line).markedSpans;
    var oldLast = isLine(doc, change.to.line) && getLine(doc, change.to.line).markedSpans;
    if (!oldFirst && !oldLast) return null;

    var startCh = change.from.ch, endCh = change.to.ch, isInsert = cmp(change.from, change.to) == 0;
    // Get the spans that 'stick out' on both sides
    var first = markedSpansBefore(oldFirst, startCh, isInsert);
    var last = markedSpansAfter(oldLast, endCh, isInsert);

    // Next, merge those two ends
    var sameLine = change.text.length == 1, offset = lst(change.text).length + (sameLine ? startCh : 0);
    if (first) {
      // Fix up .to properties of first
      for (var i = 0; i < first.length; ++i) {
        var span = first[i];
        if (span.to == null) {
          var found = getMarkedSpanFor(last, span.marker);
          if (!found) span.to = startCh;
          else if (sameLine) span.to = found.to == null ? null : found.to + offset;
        }
      }
    }
    if (last) {
      // Fix up .from in last (or move them into first in case of sameLine)
      for (var i = 0; i < last.length; ++i) {
        var span = last[i];
        if (span.to != null) span.to += offset;
        if (span.from == null) {
          var found = getMarkedSpanFor(first, span.marker);
          if (!found) {
            span.from = offset;
            if (sameLine) (first || (first = [])).push(span);
          }
        } else {
          span.from += offset;
          if (sameLine) (first || (first = [])).push(span);
        }
      }
    }
    // Make sure we didn't create any zero-length spans
    if (first) first = clearEmptySpans(first);
    if (last && last != first) last = clearEmptySpans(last);

    var newMarkers = [first];
    if (!sameLine) {
      // Fill gap with whole-line-spans
      var gap = change.text.length - 2, gapMarkers;
      if (gap > 0 && first)
        for (var i = 0; i < first.length; ++i)
          if (first[i].to == null)
            (gapMarkers || (gapMarkers = [])).push(new MarkedSpan(first[i].marker, null, null));
      for (var i = 0; i < gap; ++i)
        newMarkers.push(gapMarkers);
      newMarkers.push(last);
    }
    return newMarkers;
  }

  // Remove spans that are empty and don't have a clearWhenEmpty
  // option of false.
  function clearEmptySpans(spans) {
    for (var i = 0; i < spans.length; ++i) {
      var span = spans[i];
      if (span.from != null && span.from == span.to && span.marker.clearWhenEmpty !== false)
        spans.splice(i--, 1);
    }
    if (!spans.length) return null;
    return spans;
  }

  // Used for un/re-doing changes from the history. Combines the
  // result of computing the existing spans with the set of spans that
  // existed in the history (so that deleting around a span and then
  // undoing brings back the span).
  function mergeOldSpans(doc, change) {
    var old = getOldSpans(doc, change);
    var stretched = stretchSpansOverChange(doc, change);
    if (!old) return stretched;
    if (!stretched) return old;

    for (var i = 0; i < old.length; ++i) {
      var oldCur = old[i], stretchCur = stretched[i];
      if (oldCur && stretchCur) {
        spans: for (var j = 0; j < stretchCur.length; ++j) {
          var span = stretchCur[j];
          for (var k = 0; k < oldCur.length; ++k)
            if (oldCur[k].marker == span.marker) continue spans;
          oldCur.push(span);
        }
      } else if (stretchCur) {
        old[i] = stretchCur;
      }
    }
    return old;
  }

  // Used to 'clip' out readOnly ranges when making a change.
  function removeReadOnlyRanges(doc, from, to) {
    var markers = null;
    doc.iter(from.line, to.line + 1, function(line) {
      if (line.markedSpans) for (var i = 0; i < line.markedSpans.length; ++i) {
        var mark = line.markedSpans[i].marker;
        if (mark.readOnly && (!markers || indexOf(markers, mark) == -1))
          (markers || (markers = [])).push(mark);
      }
    });
    if (!markers) return null;
    var parts = [{from: from, to: to}];
    for (var i = 0; i < markers.length; ++i) {
      var mk = markers[i], m = mk.find(0);
      for (var j = 0; j < parts.length; ++j) {
        var p = parts[j];
        if (cmp(p.to, m.from) < 0 || cmp(p.from, m.to) > 0) continue;
        var newParts = [j, 1], dfrom = cmp(p.from, m.from), dto = cmp(p.to, m.to);
        if (dfrom < 0 || !mk.inclusiveLeft && !dfrom)
          newParts.push({from: p.from, to: m.from});
        if (dto > 0 || !mk.inclusiveRight && !dto)
          newParts.push({from: m.to, to: p.to});
        parts.splice.apply(parts, newParts);
        j += newParts.length - 1;
      }
    }
    return parts;
  }

  // Connect or disconnect spans from a line.
  function detachMarkedSpans(line) {
    var spans = line.markedSpans;
    if (!spans) return;
    for (var i = 0; i < spans.length; ++i)
      spans[i].marker.detachLine(line);
    line.markedSpans = null;
  }
  function attachMarkedSpans(line, spans) {
    if (!spans) return;
    for (var i = 0; i < spans.length; ++i)
      spans[i].marker.attachLine(line);
    line.markedSpans = spans;
  }

  // Helpers used when computing which overlapping collapsed span
  // counts as the larger one.
  function extraLeft(marker) { return marker.inclusiveLeft ? -1 : 0; }
  function extraRight(marker) { return marker.inclusiveRight ? 1 : 0; }

  // Returns a number indicating which of two overlapping collapsed
  // spans is larger (and thus includes the other). Falls back to
  // comparing ids when the spans cover exactly the same range.
  function compareCollapsedMarkers(a, b) {
    var lenDiff = a.lines.length - b.lines.length;
    if (lenDiff != 0) return lenDiff;
    var aPos = a.find(), bPos = b.find();
    var fromCmp = cmp(aPos.from, bPos.from) || extraLeft(a) - extraLeft(b);
    if (fromCmp) return -fromCmp;
    var toCmp = cmp(aPos.to, bPos.to) || extraRight(a) - extraRight(b);
    if (toCmp) return toCmp;
    return b.id - a.id;
  }

  // Find out whether a line ends or starts in a collapsed span. If
  // so, return the marker for that span.
  function collapsedSpanAtSide(line, start) {
    var sps = sawCollapsedSpans && line.markedSpans, found;
    if (sps) for (var sp, i = 0; i < sps.length; ++i) {
      sp = sps[i];
      if (sp.marker.collapsed && (start ? sp.from : sp.to) == null &&
          (!found || compareCollapsedMarkers(found, sp.marker) < 0))
        found = sp.marker;
    }
    return found;
  }
  function collapsedSpanAtStart(line) { return collapsedSpanAtSide(line, true); }
  function collapsedSpanAtEnd(line) { return collapsedSpanAtSide(line, false); }

  // Test whether there exists a collapsed span that partially
  // overlaps (covers the start or end, but not both) of a new span.
  // Such overlap is not allowed.
  function conflictingCollapsedRange(doc, lineNo, from, to, marker) {
    var line = getLine(doc, lineNo);
    var sps = sawCollapsedSpans && line.markedSpans;
    if (sps) for (var i = 0; i < sps.length; ++i) {
      var sp = sps[i];
      if (!sp.marker.collapsed) continue;
      var found = sp.marker.find(0);
      var fromCmp = cmp(found.from, from) || extraLeft(sp.marker) - extraLeft(marker);
      var toCmp = cmp(found.to, to) || extraRight(sp.marker) - extraRight(marker);
      if (fromCmp >= 0 && toCmp <= 0 || fromCmp <= 0 && toCmp >= 0) continue;
      if (fromCmp <= 0 && (cmp(found.to, from) > 0 || (sp.marker.inclusiveRight && marker.inclusiveLeft)) ||
          fromCmp >= 0 && (cmp(found.from, to) < 0 || (sp.marker.inclusiveLeft && marker.inclusiveRight)))
        return true;
    }
  }

  // A visual line is a line as drawn on the screen. Folding, for
  // example, can cause multiple logical lines to appear on the same
  // visual line. This finds the start of the visual line that the
  // given line is part of (usually that is the line itself).
  function visualLine(line) {
    var merged;
    while (merged = collapsedSpanAtStart(line))
      line = merged.find(-1, true).line;
    return line;
  }

  // Returns an array of logical lines that continue the visual line
  // started by the argument, or undefined if there are no such lines.
  function visualLineContinued(line) {
    var merged, lines;
    while (merged = collapsedSpanAtEnd(line)) {
      line = merged.find(1, true).line;
      (lines || (lines = [])).push(line);
    }
    return lines;
  }

  // Get the line number of the start of the visual line that the
  // given line number is part of.
  function visualLineNo(doc, lineN) {
    var line = getLine(doc, lineN), vis = visualLine(line);
    if (line == vis) return lineN;
    return lineNo(vis);
  }
  // Get the line number of the start of the next visual line after
  // the given line.
  function visualLineEndNo(doc, lineN) {
    if (lineN > doc.lastLine()) return lineN;
    var line = getLine(doc, lineN), merged;
    if (!lineIsHidden(doc, line)) return lineN;
    while (merged = collapsedSpanAtEnd(line))
      line = merged.find(1, true).line;
    return lineNo(line) + 1;
  }

  // Compute whether a line is hidden. Lines count as hidden when they
  // are part of a visual line that starts with another line, or when
  // they are entirely covered by collapsed, non-widget span.
  function lineIsHidden(doc, line) {
    var sps = sawCollapsedSpans && line.markedSpans;
    if (sps) for (var sp, i = 0; i < sps.length; ++i) {
      sp = sps[i];
      if (!sp.marker.collapsed) continue;
      if (sp.from == null) return true;
      if (sp.marker.widgetNode) continue;
      if (sp.from == 0 && sp.marker.inclusiveLeft && lineIsHiddenInner(doc, line, sp))
        return true;
    }
  }
  function lineIsHiddenInner(doc, line, span) {
    if (span.to == null) {
      var end = span.marker.find(1, true);
      return lineIsHiddenInner(doc, end.line, getMarkedSpanFor(end.line.markedSpans, span.marker));
    }
    if (span.marker.inclusiveRight && span.to == line.text.length)
      return true;
    for (var sp, i = 0; i < line.markedSpans.length; ++i) {
      sp = line.markedSpans[i];
      if (sp.marker.collapsed && !sp.marker.widgetNode && sp.from == span.to &&
          (sp.to == null || sp.to != span.from) &&
          (sp.marker.inclusiveLeft || span.marker.inclusiveRight) &&
          lineIsHiddenInner(doc, line, sp)) return true;
    }
  }

  // LINE WIDGETS

  // Line widgets are block elements displayed above or below a line.

  var LineWidget = CodeMirror.LineWidget = function(doc, node, options) {
    if (options) for (var opt in options) if (options.hasOwnProperty(opt))
      this[opt] = options[opt];
    this.doc = doc;
    this.node = node;
  };
  eventMixin(LineWidget);

  function adjustScrollWhenAboveVisible(cm, line, diff) {
    if (heightAtLine(line) < ((cm.curOp && cm.curOp.scrollTop) || cm.doc.scrollTop))
      addToScrollPos(cm, null, diff);
  }

  LineWidget.prototype.clear = function() {
    var cm = this.doc.cm, ws = this.line.widgets, line = this.line, no = lineNo(line);
    if (no == null || !ws) return;
    for (var i = 0; i < ws.length; ++i) if (ws[i] == this) ws.splice(i--, 1);
    if (!ws.length) line.widgets = null;
    var height = widgetHeight(this);
    updateLineHeight(line, Math.max(0, line.height - height));
    if (cm) runInOp(cm, function() {
      adjustScrollWhenAboveVisible(cm, line, -height);
      regLineChange(cm, no, "widget");
    });
  };
  LineWidget.prototype.changed = function() {
    var oldH = this.height, cm = this.doc.cm, line = this.line;
    this.height = null;
    var diff = widgetHeight(this) - oldH;
    if (!diff) return;
    updateLineHeight(line, line.height + diff);
    if (cm) runInOp(cm, function() {
      cm.curOp.forceUpdate = true;
      adjustScrollWhenAboveVisible(cm, line, diff);
    });
  };

  function widgetHeight(widget) {
    if (widget.height != null) return widget.height;
    var cm = widget.doc.cm;
    if (!cm) return 0;
    if (!contains(document.body, widget.node)) {
      var parentStyle = "position: relative;";
      if (widget.coverGutter)
        parentStyle += "margin-left: -" + cm.display.gutters.offsetWidth + "px;";
      if (widget.noHScroll)
        parentStyle += "width: " + cm.display.wrapper.clientWidth + "px;";
      removeChildrenAndAdd(cm.display.measure, elt("div", [widget.node], null, parentStyle));
    }
    return widget.height = widget.node.offsetHeight;
  }

  function addLineWidget(doc, handle, node, options) {
    var widget = new LineWidget(doc, node, options);
    var cm = doc.cm;
    if (cm && widget.noHScroll) cm.display.alignWidgets = true;
    changeLine(doc, handle, "widget", function(line) {
      var widgets = line.widgets || (line.widgets = []);
      if (widget.insertAt == null) widgets.push(widget);
      else widgets.splice(Math.min(widgets.length - 1, Math.max(0, widget.insertAt)), 0, widget);
      widget.line = line;
      if (cm && !lineIsHidden(doc, line)) {
        var aboveVisible = heightAtLine(line) < doc.scrollTop;
        updateLineHeight(line, line.height + widgetHeight(widget));
        if (aboveVisible) addToScrollPos(cm, null, widget.height);
        cm.curOp.forceUpdate = true;
      }
      return true;
    });
    return widget;
  }

  // LINE DATA STRUCTURE

  // Line objects. These hold state related to a line, including
  // highlighting info (the styles array).
  var Line = CodeMirror.Line = function(text, markedSpans, estimateHeight) {
    this.text = text;
    attachMarkedSpans(this, markedSpans);
    this.height = estimateHeight ? estimateHeight(this) : 1;
  };
  eventMixin(Line);
  Line.prototype.lineNo = function() { return lineNo(this); };

  // Change the content (text, markers) of a line. Automatically
  // invalidates cached information and tries to re-estimate the
  // line's height.
  function updateLine(line, text, markedSpans, estimateHeight) {
    line.text = text;
    if (line.stateAfter) line.stateAfter = null;
    if (line.styles) line.styles = null;
    if (line.order != null) line.order = null;
    detachMarkedSpans(line);
    attachMarkedSpans(line, markedSpans);
    var estHeight = estimateHeight ? estimateHeight(line) : 1;
    if (estHeight != line.height) updateLineHeight(line, estHeight);
  }

  // Detach a line from the document tree and its markers.
  function cleanUpLine(line) {
    line.parent = null;
    detachMarkedSpans(line);
  }

  function extractLineClasses(type, output) {
    if (type) for (;;) {
      var lineClass = type.match(/(?:^|\s+)line-(background-)?(\S+)/);
      if (!lineClass) break;
      type = type.slice(0, lineClass.index) + type.slice(lineClass.index + lineClass[0].length);
      var prop = lineClass[1] ? "bgClass" : "textClass";
      if (output[prop] == null)
        output[prop] = lineClass[2];
      else if (!(new RegExp("(?:^|\s)" + lineClass[2] + "(?:$|\s)")).test(output[prop]))
        output[prop] += " " + lineClass[2];
    }
    return type;
  }

  function callBlankLine(mode, state) {
    if (mode.blankLine) return mode.blankLine(state);
    if (!mode.innerMode) return;
    var inner = CodeMirror.innerMode(mode, state);
    if (inner.mode.blankLine) return inner.mode.blankLine(inner.state);
  }

  function readToken(mode, stream, state, inner) {
    for (var i = 0; i < 10; i++) {
      if (inner) inner[0] = CodeMirror.innerMode(mode, state).mode;
      var style = mode.token(stream, state);
      if (stream.pos > stream.start) return style;
    }
    throw new Error("Mode " + mode.name + " failed to advance stream.");
  }

  // Utility for getTokenAt and getLineTokens
  function takeToken(cm, pos, precise, asArray) {
    function getObj(copy) {
      return {start: stream.start, end: stream.pos,
              string: stream.current(),
              type: style || null,
              state: copy ? copyState(doc.mode, state) : state};
    }

    var doc = cm.doc, mode = doc.mode, style;
    pos = clipPos(doc, pos);
    var line = getLine(doc, pos.line), state = getStateBefore(cm, pos.line, precise);
    var stream = new StringStream(line.text, cm.options.tabSize), tokens;
    if (asArray) tokens = [];
    while ((asArray || stream.pos < pos.ch) && !stream.eol()) {
      stream.start = stream.pos;
      style = readToken(mode, stream, state);
      if (asArray) tokens.push(getObj(true));
    }
    return asArray ? tokens : getObj();
  }

  // Run the given mode's parser over a line, calling f for each token.
  function runMode(cm, text, mode, state, f, lineClasses, forceToEnd) {
    var flattenSpans = mode.flattenSpans;
    if (flattenSpans == null) flattenSpans = cm.options.flattenSpans;
    var curStart = 0, curStyle = null;
    var stream = new StringStream(text, cm.options.tabSize), style;
    var inner = cm.options.addModeClass && [null];
    if (text == "") extractLineClasses(callBlankLine(mode, state), lineClasses);
    while (!stream.eol()) {
      if (stream.pos > cm.options.maxHighlightLength) {
        flattenSpans = false;
        if (forceToEnd) processLine(cm, text, state, stream.pos);
        stream.pos = text.length;
        style = null;
      } else {
        style = extractLineClasses(readToken(mode, stream, state, inner), lineClasses);
      }
      if (inner) {
        var mName = inner[0].name;
        if (mName) style = "m-" + (style ? mName + " " + style : mName);
      }
      if (!flattenSpans || curStyle != style) {
        while (curStart < stream.start) {
          curStart = Math.min(stream.start, curStart + 50000);
          f(curStart, curStyle);
        }
        curStyle = style;
      }
      stream.start = stream.pos;
    }
    while (curStart < stream.pos) {
      // Webkit seems to refuse to render text nodes longer than 57444 characters
      var pos = Math.min(stream.pos, curStart + 50000);
      f(pos, curStyle);
      curStart = pos;
    }
  }

  // Compute a style array (an array starting with a mode generation
  // -- for invalidation -- followed by pairs of end positions and
  // style strings), which is used to highlight the tokens on the
  // line.
  function highlightLine(cm, line, state, forceToEnd) {
    // A styles array always starts with a number identifying the
    // mode/overlays that it is based on (for easy invalidation).
    var st = [cm.state.modeGen], lineClasses = {};
    // Compute the base array of styles
    runMode(cm, line.text, cm.doc.mode, state, function(end, style) {
      st.push(end, style);
    }, lineClasses, forceToEnd);

    // Run overlays, adjust style array.
    for (var o = 0; o < cm.state.overlays.length; ++o) {
      var overlay = cm.state.overlays[o], i = 1, at = 0;
      runMode(cm, line.text, overlay.mode, true, function(end, style) {
        var start = i;
        // Ensure there's a token end at the current position, and that i points at it
        while (at < end) {
          var i_end = st[i];
          if (i_end > end)
            st.splice(i, 1, end, st[i+1], i_end);
          i += 2;
          at = Math.min(end, i_end);
        }
        if (!style) return;
        if (overlay.opaque) {
          st.splice(start, i - start, end, "cm-overlay " + style);
          i = start + 2;
        } else {
          for (; start < i; start += 2) {
            var cur = st[start+1];
            st[start+1] = (cur ? cur + " " : "") + "cm-overlay " + style;
          }
        }
      }, lineClasses);
    }

    return {styles: st, classes: lineClasses.bgClass || lineClasses.textClass ? lineClasses : null};
  }

  function getLineStyles(cm, line, updateFrontier) {
    if (!line.styles || line.styles[0] != cm.state.modeGen) {
      var state = getStateBefore(cm, lineNo(line));
      var result = highlightLine(cm, line, line.text.length > cm.options.maxHighlightLength ? copyState(cm.doc.mode, state) : state);
      line.stateAfter = state;
      line.styles = result.styles;
      if (result.classes) line.styleClasses = result.classes;
      else if (line.styleClasses) line.styleClasses = null;
      if (updateFrontier === cm.doc.frontier) cm.doc.frontier++;
    }
    return line.styles;
  }

  // Lightweight form of highlight -- proceed over this line and
  // update state, but don't save a style array. Used for lines that
  // aren't currently visible.
  function processLine(cm, text, state, startAt) {
    var mode = cm.doc.mode;
    var stream = new StringStream(text, cm.options.tabSize);
    stream.start = stream.pos = startAt || 0;
    if (text == "") callBlankLine(mode, state);
    while (!stream.eol()) {
      readToken(mode, stream, state);
      stream.start = stream.pos;
    }
  }

  // Convert a style as returned by a mode (either null, or a string
  // containing one or more styles) to a CSS style. This is cached,
  // and also looks for line-wide styles.
  var styleToClassCache = {}, styleToClassCacheWithMode = {};
  function interpretTokenStyle(style, options) {
    if (!style || /^\s*$/.test(style)) return null;
    var cache = options.addModeClass ? styleToClassCacheWithMode : styleToClassCache;
    return cache[style] ||
      (cache[style] = style.replace(/\S+/g, "cm-$&"));
  }

  // Render the DOM representation of the text of a line. Also builds
  // up a 'line map', which points at the DOM nodes that represent
  // specific stretches of text, and is used by the measuring code.
  // The returned object contains the DOM node, this map, and
  // information about line-wide styles that were set by the mode.
  function buildLineContent(cm, lineView) {
    // The padding-right forces the element to have a 'border', which
    // is needed on Webkit to be able to get line-level bounding
    // rectangles for it (in measureChar).
    var content = elt("span", null, null, webkit ? "padding-right: .1px" : null);
    var builder = {pre: elt("pre", [content], "CodeMirror-line"), content: content,
                   col: 0, pos: 0, cm: cm,
                   splitSpaces: (ie || webkit) && cm.getOption("lineWrapping")};
    lineView.measure = {};

    // Iterate over the logical lines that make up this visual line.
    for (var i = 0; i <= (lineView.rest ? lineView.rest.length : 0); i++) {
      var line = i ? lineView.rest[i - 1] : lineView.line, order;
      builder.pos = 0;
      builder.addToken = buildToken;
      // Optionally wire in some hacks into the token-rendering
      // algorithm, to deal with browser quirks.
      if (hasBadBidiRects(cm.display.measure) && (order = getOrder(line)))
        builder.addToken = buildTokenBadBidi(builder.addToken, order);
      builder.map = [];
      var allowFrontierUpdate = lineView != cm.display.externalMeasured && lineNo(line);
      insertLineContent(line, builder, getLineStyles(cm, line, allowFrontierUpdate));
      if (line.styleClasses) {
        if (line.styleClasses.bgClass)
          builder.bgClass = joinClasses(line.styleClasses.bgClass, builder.bgClass || "");
        if (line.styleClasses.textClass)
          builder.textClass = joinClasses(line.styleClasses.textClass, builder.textClass || "");
      }

      // Ensure at least a single node is present, for measuring.
      if (builder.map.length == 0)
        builder.map.push(0, 0, builder.content.appendChild(zeroWidthElement(cm.display.measure)));

      // Store the map and a cache object for the current logical line
      if (i == 0) {
        lineView.measure.map = builder.map;
        lineView.measure.cache = {};
      } else {
        (lineView.measure.maps || (lineView.measure.maps = [])).push(builder.map);
        (lineView.measure.caches || (lineView.measure.caches = [])).push({});
      }
    }

    // See issue #2901
    if (webkit && /\bcm-tab\b/.test(builder.content.lastChild.className))
      builder.content.className = "cm-tab-wrap-hack";

    signal(cm, "renderLine", cm, lineView.line, builder.pre);
    if (builder.pre.className)
      builder.textClass = joinClasses(builder.pre.className, builder.textClass || "");

    return builder;
  }

  function defaultSpecialCharPlaceholder(ch) {
    var token = elt("span", "\u2022", "cm-invalidchar");
    token.title = "\\u" + ch.charCodeAt(0).toString(16);
    token.setAttribute("aria-label", token.title);
    return token;
  }

  // Build up the DOM representation for a single token, and add it to
  // the line map. Takes care to render special characters separately.
  function buildToken(builder, text, style, startStyle, endStyle, title, css) {
    if (!text) return;
    var displayText = builder.splitSpaces ? text.replace(/ {3,}/g, splitSpaces) : text;
    var special = builder.cm.state.specialChars, mustWrap = false;
    if (!special.test(text)) {
      builder.col += text.length;
      var content = document.createTextNode(displayText);
      builder.map.push(builder.pos, builder.pos + text.length, content);
      if (ie && ie_version < 9) mustWrap = true;
      builder.pos += text.length;
    } else {
      var content = document.createDocumentFragment(), pos = 0;
      while (true) {
        special.lastIndex = pos;
        var m = special.exec(text);
        var skipped = m ? m.index - pos : text.length - pos;
        if (skipped) {
          var txt = document.createTextNode(displayText.slice(pos, pos + skipped));
          if (ie && ie_version < 9) content.appendChild(elt("span", [txt]));
          else content.appendChild(txt);
          builder.map.push(builder.pos, builder.pos + skipped, txt);
          builder.col += skipped;
          builder.pos += skipped;
        }
        if (!m) break;
        pos += skipped + 1;
        if (m[0] == "\t") {
          var tabSize = builder.cm.options.tabSize, tabWidth = tabSize - builder.col % tabSize;
          var txt = content.appendChild(elt("span", spaceStr(tabWidth), "cm-tab"));
          txt.setAttribute("role", "presentation");
          txt.setAttribute("cm-text", "\t");
          builder.col += tabWidth;
        } else if (m[0] == "\r" || m[0] == "\n") {
          var txt = content.appendChild(elt("span", m[0] == "\r" ? "\u240d" : "\u2424", "cm-invalidchar"));
          txt.setAttribute("cm-text", m[0]);
          builder.col += 1;
        } else {
          var txt = builder.cm.options.specialCharPlaceholder(m[0]);
          txt.setAttribute("cm-text", m[0]);
          if (ie && ie_version < 9) content.appendChild(elt("span", [txt]));
          else content.appendChild(txt);
          builder.col += 1;
        }
        builder.map.push(builder.pos, builder.pos + 1, txt);
        builder.pos++;
      }
    }
    if (style || startStyle || endStyle || mustWrap || css) {
      var fullStyle = style || "";
      if (startStyle) fullStyle += startStyle;
      if (endStyle) fullStyle += endStyle;
      var token = elt("span", [content], fullStyle, css);
      if (title) token.title = title;
      return builder.content.appendChild(token);
    }
    builder.content.appendChild(content);
  }

  function splitSpaces(old) {
    var out = " ";
    for (var i = 0; i < old.length - 2; ++i) out += i % 2 ? " " : "\u00a0";
    out += " ";
    return out;
  }

  // Work around nonsense dimensions being reported for stretches of
  // right-to-left text.
  function buildTokenBadBidi(inner, order) {
    return function(builder, text, style, startStyle, endStyle, title, css) {
      style = style ? style + " cm-force-border" : "cm-force-border";
      var start = builder.pos, end = start + text.length;
      for (;;) {
        // Find the part that overlaps with the start of this text
        for (var i = 0; i < order.length; i++) {
          var part = order[i];
          if (part.to > start && part.from <= start) break;
        }
        if (part.to >= end) return inner(builder, text, style, startStyle, endStyle, title, css);
        inner(builder, text.slice(0, part.to - start), style, startStyle, null, title, css);
        startStyle = null;
        text = text.slice(part.to - start);
        start = part.to;
      }
    };
  }

  function buildCollapsedSpan(builder, size, marker, ignoreWidget) {
    var widget = !ignoreWidget && marker.widgetNode;
    if (widget) builder.map.push(builder.pos, builder.pos + size, widget);
    if (!ignoreWidget && builder.cm.display.input.needsContentAttribute) {
      if (!widget)
        widget = builder.content.appendChild(document.createElement("span"));
      widget.setAttribute("cm-marker", marker.id);
    }
    if (widget) {
      builder.cm.display.input.setUneditable(widget);
      builder.content.appendChild(widget);
    }
    builder.pos += size;
  }

  // Outputs a number of spans to make up a line, taking highlighting
  // and marked text into account.
  function insertLineContent(line, builder, styles) {
    var spans = line.markedSpans, allText = line.text, at = 0;
    if (!spans) {
      for (var i = 1; i < styles.length; i+=2)
        builder.addToken(builder, allText.slice(at, at = styles[i]), interpretTokenStyle(styles[i+1], builder.cm.options));
      return;
    }

    var len = allText.length, pos = 0, i = 1, text = "", style, css;
    var nextChange = 0, spanStyle, spanEndStyle, spanStartStyle, title, collapsed;
    for (;;) {
      if (nextChange == pos) { // Update current marker set
        spanStyle = spanEndStyle = spanStartStyle = title = css = "";
        collapsed = null; nextChange = Infinity;
        var foundBookmarks = [];
        for (var j = 0; j < spans.length; ++j) {
          var sp = spans[j], m = sp.marker;
          if (m.type == "bookmark" && sp.from == pos && m.widgetNode) {
            foundBookmarks.push(m);
          } else if (sp.from <= pos && (sp.to == null || sp.to > pos || m.collapsed && sp.to == pos && sp.from == pos)) {
            if (sp.to != null && sp.to != pos && nextChange > sp.to) {
              nextChange = sp.to;
              spanEndStyle = "";
            }
            if (m.className) spanStyle += " " + m.className;
            if (m.css) css = m.css;
            if (m.startStyle && sp.from == pos) spanStartStyle += " " + m.startStyle;
            if (m.endStyle && sp.to == nextChange) spanEndStyle += " " + m.endStyle;
            if (m.title && !title) title = m.title;
            if (m.collapsed && (!collapsed || compareCollapsedMarkers(collapsed.marker, m) < 0))
              collapsed = sp;
          } else if (sp.from > pos && nextChange > sp.from) {
            nextChange = sp.from;
          }
        }
        if (collapsed && (collapsed.from || 0) == pos) {
          buildCollapsedSpan(builder, (collapsed.to == null ? len + 1 : collapsed.to) - pos,
                             collapsed.marker, collapsed.from == null);
          if (collapsed.to == null) return;
          if (collapsed.to == pos) collapsed = false;
        }
        if (!collapsed && foundBookmarks.length) for (var j = 0; j < foundBookmarks.length; ++j)
          buildCollapsedSpan(builder, 0, foundBookmarks[j]);
      }
      if (pos >= len) break;

      var upto = Math.min(len, nextChange);
      while (true) {
        if (text) {
          var end = pos + text.length;
          if (!collapsed) {
            var tokenText = end > upto ? text.slice(0, upto - pos) : text;
            builder.addToken(builder, tokenText, style ? style + spanStyle : spanStyle,
                             spanStartStyle, pos + tokenText.length == nextChange ? spanEndStyle : "", title, css);
          }
          if (end >= upto) {text = text.slice(upto - pos); pos = upto; break;}
          pos = end;
          spanStartStyle = "";
        }
        text = allText.slice(at, at = styles[i++]);
        style = interpretTokenStyle(styles[i++], builder.cm.options);
      }
    }
  }

  // DOCUMENT DATA STRUCTURE

  // By default, updates that start and end at the beginning of a line
  // are treated specially, in order to make the association of line
  // widgets and marker elements with the text behave more intuitive.
  function isWholeLineUpdate(doc, change) {
    return change.from.ch == 0 && change.to.ch == 0 && lst(change.text) == "" &&
      (!doc.cm || doc.cm.options.wholeLineUpdateBefore);
  }

  // Perform a change on the document data structure.
  function updateDoc(doc, change, markedSpans, estimateHeight) {
    function spansFor(n) {return markedSpans ? markedSpans[n] : null;}
    function update(line, text, spans) {
      updateLine(line, text, spans, estimateHeight);
      signalLater(line, "change", line, change);
    }
    function linesFor(start, end) {
      for (var i = start, result = []; i < end; ++i)
        result.push(new Line(text[i], spansFor(i), estimateHeight));
      return result;
    }

    var from = change.from, to = change.to, text = change.text;
    var firstLine = getLine(doc, from.line), lastLine = getLine(doc, to.line);
    var lastText = lst(text), lastSpans = spansFor(text.length - 1), nlines = to.line - from.line;

    // Adjust the line structure
    if (change.full) {
      doc.insert(0, linesFor(0, text.length));
      doc.remove(text.length, doc.size - text.length);
    } else if (isWholeLineUpdate(doc, change)) {
      // This is a whole-line replace. Treated specially to make
      // sure line objects move the way they are supposed to.
      var added = linesFor(0, text.length - 1);
      update(lastLine, lastLine.text, lastSpans);
      if (nlines) doc.remove(from.line, nlines);
      if (added.length) doc.insert(from.line, added);
    } else if (firstLine == lastLine) {
      if (text.length == 1) {
        update(firstLine, firstLine.text.slice(0, from.ch) + lastText + firstLine.text.slice(to.ch), lastSpans);
      } else {
        var added = linesFor(1, text.length - 1);
        added.push(new Line(lastText + firstLine.text.slice(to.ch), lastSpans, estimateHeight));
        update(firstLine, firstLine.text.slice(0, from.ch) + text[0], spansFor(0));
        doc.insert(from.line + 1, added);
      }
    } else if (text.length == 1) {
      update(firstLine, firstLine.text.slice(0, from.ch) + text[0] + lastLine.text.slice(to.ch), spansFor(0));
      doc.remove(from.line + 1, nlines);
    } else {
      update(firstLine, firstLine.text.slice(0, from.ch) + text[0], spansFor(0));
      update(lastLine, lastText + lastLine.text.slice(to.ch), lastSpans);
      var added = linesFor(1, text.length - 1);
      if (nlines > 1) doc.remove(from.line + 1, nlines - 1);
      doc.insert(from.line + 1, added);
    }

    signalLater(doc, "change", doc, change);
  }

  // The document is represented as a BTree consisting of leaves, with
  // chunk of lines in them, and branches, with up to ten leaves or
  // other branch nodes below them. The top node is always a branch
  // node, and is the document object itself (meaning it has
  // additional methods and properties).
  //
  // All nodes have parent links. The tree is used both to go from
  // line numbers to line objects, and to go from objects to numbers.
  // It also indexes by height, and is used to convert between height
  // and line object, and to find the total height of the document.
  //
  // See also http://marijnhaverbeke.nl/blog/codemirror-line-tree.html

  function LeafChunk(lines) {
    this.lines = lines;
    this.parent = null;
    for (var i = 0, height = 0; i < lines.length; ++i) {
      lines[i].parent = this;
      height += lines[i].height;
    }
    this.height = height;
  }

  LeafChunk.prototype = {
    chunkSize: function() { return this.lines.length; },
    // Remove the n lines at offset 'at'.
    removeInner: function(at, n) {
      for (var i = at, e = at + n; i < e; ++i) {
        var line = this.lines[i];
        this.height -= line.height;
        cleanUpLine(line);
        signalLater(line, "delete");
      }
      this.lines.splice(at, n);
    },
    // Helper used to collapse a small branch into a single leaf.
    collapse: function(lines) {
      lines.push.apply(lines, this.lines);
    },
    // Insert the given array of lines at offset 'at', count them as
    // having the given height.
    insertInner: function(at, lines, height) {
      this.height += height;
      this.lines = this.lines.slice(0, at).concat(lines).concat(this.lines.slice(at));
      for (var i = 0; i < lines.length; ++i) lines[i].parent = this;
    },
    // Used to iterate over a part of the tree.
    iterN: function(at, n, op) {
      for (var e = at + n; at < e; ++at)
        if (op(this.lines[at])) return true;
    }
  };

  function BranchChunk(children) {
    this.children = children;
    var size = 0, height = 0;
    for (var i = 0; i < children.length; ++i) {
      var ch = children[i];
      size += ch.chunkSize(); height += ch.height;
      ch.parent = this;
    }
    this.size = size;
    this.height = height;
    this.parent = null;
  }

  BranchChunk.prototype = {
    chunkSize: function() { return this.size; },
    removeInner: function(at, n) {
      this.size -= n;
      for (var i = 0; i < this.children.length; ++i) {
        var child = this.children[i], sz = child.chunkSize();
        if (at < sz) {
          var rm = Math.min(n, sz - at), oldHeight = child.height;
          child.removeInner(at, rm);
          this.height -= oldHeight - child.height;
          if (sz == rm) { this.children.splice(i--, 1); child.parent = null; }
          if ((n -= rm) == 0) break;
          at = 0;
        } else at -= sz;
      }
      // If the result is smaller than 25 lines, ensure that it is a
      // single leaf node.
      if (this.size - n < 25 &&
          (this.children.length > 1 || !(this.children[0] instanceof LeafChunk))) {
        var lines = [];
        this.collapse(lines);
        this.children = [new LeafChunk(lines)];
        this.children[0].parent = this;
      }
    },
    collapse: function(lines) {
      for (var i = 0; i < this.children.length; ++i) this.children[i].collapse(lines);
    },
    insertInner: function(at, lines, height) {
      this.size += lines.length;
      this.height += height;
      for (var i = 0; i < this.children.length; ++i) {
        var child = this.children[i], sz = child.chunkSize();
        if (at <= sz) {
          child.insertInner(at, lines, height);
          if (child.lines && child.lines.length > 50) {
            while (child.lines.length > 50) {
              var spilled = child.lines.splice(child.lines.length - 25, 25);
              var newleaf = new LeafChunk(spilled);
              child.height -= newleaf.height;
              this.children.splice(i + 1, 0, newleaf);
              newleaf.parent = this;
            }
            this.maybeSpill();
          }
          break;
        }
        at -= sz;
      }
    },
    // When a node has grown, check whether it should be split.
    maybeSpill: function() {
      if (this.children.length <= 10) return;
      var me = this;
      do {
        var spilled = me.children.splice(me.children.length - 5, 5);
        var sibling = new BranchChunk(spilled);
        if (!me.parent) { // Become the parent node
          var copy = new BranchChunk(me.children);
          copy.parent = me;
          me.children = [copy, sibling];
          me = copy;
        } else {
          me.size -= sibling.size;
          me.height -= sibling.height;
          var myIndex = indexOf(me.parent.children, me);
          me.parent.children.splice(myIndex + 1, 0, sibling);
        }
        sibling.parent = me.parent;
      } while (me.children.length > 10);
      me.parent.maybeSpill();
    },
    iterN: function(at, n, op) {
      for (var i = 0; i < this.children.length; ++i) {
        var child = this.children[i], sz = child.chunkSize();
        if (at < sz) {
          var used = Math.min(n, sz - at);
          if (child.iterN(at, used, op)) return true;
          if ((n -= used) == 0) break;
          at = 0;
        } else at -= sz;
      }
    }
  };

  var nextDocId = 0;
  var Doc = CodeMirror.Doc = function(text, mode, firstLine, lineSep) {
    if (!(this instanceof Doc)) return new Doc(text, mode, firstLine, lineSep);
    if (firstLine == null) firstLine = 0;

    BranchChunk.call(this, [new LeafChunk([new Line("", null)])]);
    this.first = firstLine;
    this.scrollTop = this.scrollLeft = 0;
    this.cantEdit = false;
    this.cleanGeneration = 1;
    this.frontier = firstLine;
    var start = Pos(firstLine, 0);
    this.sel = simpleSelection(start);
    this.history = new History(null);
    this.id = ++nextDocId;
    this.modeOption = mode;
    this.lineSep = lineSep;

    if (typeof text == "string") text = this.splitLines(text);
    updateDoc(this, {from: start, to: start, text: text});
    setSelection(this, simpleSelection(start), sel_dontScroll);
  };

  Doc.prototype = createObj(BranchChunk.prototype, {
    constructor: Doc,
    // Iterate over the document. Supports two forms -- with only one
    // argument, it calls that for each line in the document. With
    // three, it iterates over the range given by the first two (with
    // the second being non-inclusive).
    iter: function(from, to, op) {
      if (op) this.iterN(from - this.first, to - from, op);
      else this.iterN(this.first, this.first + this.size, from);
    },

    // Non-public interface for adding and removing lines.
    insert: function(at, lines) {
      var height = 0;
      for (var i = 0; i < lines.length; ++i) height += lines[i].height;
      this.insertInner(at - this.first, lines, height);
    },
    remove: function(at, n) { this.removeInner(at - this.first, n); },

    // From here, the methods are part of the public interface. Most
    // are also available from CodeMirror (editor) instances.

    getValue: function(lineSep) {
      var lines = getLines(this, this.first, this.first + this.size);
      if (lineSep === false) return lines;
      return lines.join(lineSep || this.lineSeparator());
    },
    setValue: docMethodOp(function(code) {
      var top = Pos(this.first, 0), last = this.first + this.size - 1;
      makeChange(this, {from: top, to: Pos(last, getLine(this, last).text.length),
                        text: this.splitLines(code), origin: "setValue", full: true}, true);
      setSelection(this, simpleSelection(top));
    }),
    replaceRange: function(code, from, to, origin) {
      from = clipPos(this, from);
      to = to ? clipPos(this, to) : from;
      replaceRange(this, code, from, to, origin);
    },
    getRange: function(from, to, lineSep) {
      var lines = getBetween(this, clipPos(this, from), clipPos(this, to));
      if (lineSep === false) return lines;
      return lines.join(lineSep || this.lineSeparator());
    },

    getLine: function(line) {var l = this.getLineHandle(line); return l && l.text;},

    getLineHandle: function(line) {if (isLine(this, line)) return getLine(this, line);},
    getLineNumber: function(line) {return lineNo(line);},

    getLineHandleVisualStart: function(line) {
      if (typeof line == "number") line = getLine(this, line);
      return visualLine(line);
    },

    lineCount: function() {return this.size;},
    firstLine: function() {return this.first;},
    lastLine: function() {return this.first + this.size - 1;},

    clipPos: function(pos) {return clipPos(this, pos);},

    getCursor: function(start) {
      var range = this.sel.primary(), pos;
      if (start == null || start == "head") pos = range.head;
      else if (start == "anchor") pos = range.anchor;
      else if (start == "end" || start == "to" || start === false) pos = range.to();
      else pos = range.from();
      return pos;
    },
    listSelections: function() { return this.sel.ranges; },
    somethingSelected: function() {return this.sel.somethingSelected();},

    setCursor: docMethodOp(function(line, ch, options) {
      setSimpleSelection(this, clipPos(this, typeof line == "number" ? Pos(line, ch || 0) : line), null, options);
    }),
    setSelection: docMethodOp(function(anchor, head, options) {
      setSimpleSelection(this, clipPos(this, anchor), clipPos(this, head || anchor), options);
    }),
    extendSelection: docMethodOp(function(head, other, options) {
      extendSelection(this, clipPos(this, head), other && clipPos(this, other), options);
    }),
    extendSelections: docMethodOp(function(heads, options) {
      extendSelections(this, clipPosArray(this, heads, options));
    }),
    extendSelectionsBy: docMethodOp(function(f, options) {
      extendSelections(this, map(this.sel.ranges, f), options);
    }),
    setSelections: docMethodOp(function(ranges, primary, options) {
      if (!ranges.length) return;
      for (var i = 0, out = []; i < ranges.length; i++)
        out[i] = new Range(clipPos(this, ranges[i].anchor),
                           clipPos(this, ranges[i].head));
      if (primary == null) primary = Math.min(ranges.length - 1, this.sel.primIndex);
      setSelection(this, normalizeSelection(out, primary), options);
    }),
    addSelection: docMethodOp(function(anchor, head, options) {
      var ranges = this.sel.ranges.slice(0);
      ranges.push(new Range(clipPos(this, anchor), clipPos(this, head || anchor)));
      setSelection(this, normalizeSelection(ranges, ranges.length - 1), options);
    }),

    getSelection: function(lineSep) {
      var ranges = this.sel.ranges, lines;
      for (var i = 0; i < ranges.length; i++) {
        var sel = getBetween(this, ranges[i].from(), ranges[i].to());
        lines = lines ? lines.concat(sel) : sel;
      }
      if (lineSep === false) return lines;
      else return lines.join(lineSep || this.lineSeparator());
    },
    getSelections: function(lineSep) {
      var parts = [], ranges = this.sel.ranges;
      for (var i = 0; i < ranges.length; i++) {
        var sel = getBetween(this, ranges[i].from(), ranges[i].to());
        if (lineSep !== false) sel = sel.join(lineSep || this.lineSeparator());
        parts[i] = sel;
      }
      return parts;
    },
    replaceSelection: function(code, collapse, origin) {
      var dup = [];
      for (var i = 0; i < this.sel.ranges.length; i++)
        dup[i] = code;
      this.replaceSelections(dup, collapse, origin || "+input");
    },
    replaceSelections: docMethodOp(function(code, collapse, origin) {
      var changes = [], sel = this.sel;
      for (var i = 0; i < sel.ranges.length; i++) {
        var range = sel.ranges[i];
        changes[i] = {from: range.from(), to: range.to(), text: this.splitLines(code[i]), origin: origin};
      }
      var newSel = collapse && collapse != "end" && computeReplacedSel(this, changes, collapse);
      for (var i = changes.length - 1; i >= 0; i--)
        makeChange(this, changes[i]);
      if (newSel) setSelectionReplaceHistory(this, newSel);
      else if (this.cm) ensureCursorVisible(this.cm);
    }),
    undo: docMethodOp(function() {makeChangeFromHistory(this, "undo");}),
    redo: docMethodOp(function() {makeChangeFromHistory(this, "redo");}),
    undoSelection: docMethodOp(function() {makeChangeFromHistory(this, "undo", true);}),
    redoSelection: docMethodOp(function() {makeChangeFromHistory(this, "redo", true);}),

    setExtending: function(val) {this.extend = val;},
    getExtending: function() {return this.extend;},

    historySize: function() {
      var hist = this.history, done = 0, undone = 0;
      for (var i = 0; i < hist.done.length; i++) if (!hist.done[i].ranges) ++done;
      for (var i = 0; i < hist.undone.length; i++) if (!hist.undone[i].ranges) ++undone;
      return {undo: done, redo: undone};
    },
    clearHistory: function() {this.history = new History(this.history.maxGeneration);},

    markClean: function() {
      this.cleanGeneration = this.changeGeneration(true);
    },
    changeGeneration: function(forceSplit) {
      if (forceSplit)
        this.history.lastOp = this.history.lastSelOp = this.history.lastOrigin = null;
      return this.history.generation;
    },
    isClean: function (gen) {
      return this.history.generation == (gen || this.cleanGeneration);
    },

    getHistory: function() {
      return {done: copyHistoryArray(this.history.done),
              undone: copyHistoryArray(this.history.undone)};
    },
    setHistory: function(histData) {
      var hist = this.history = new History(this.history.maxGeneration);
      hist.done = copyHistoryArray(histData.done.slice(0), null, true);
      hist.undone = copyHistoryArray(histData.undone.slice(0), null, true);
    },

    addLineClass: docMethodOp(function(handle, where, cls) {
      return changeLine(this, handle, where == "gutter" ? "gutter" : "class", function(line) {
        var prop = where == "text" ? "textClass"
                 : where == "background" ? "bgClass"
                 : where == "gutter" ? "gutterClass" : "wrapClass";
        if (!line[prop]) line[prop] = cls;
        else if (classTest(cls).test(line[prop])) return false;
        else line[prop] += " " + cls;
        return true;
      });
    }),
    removeLineClass: docMethodOp(function(handle, where, cls) {
      return changeLine(this, handle, where == "gutter" ? "gutter" : "class", function(line) {
        var prop = where == "text" ? "textClass"
                 : where == "background" ? "bgClass"
                 : where == "gutter" ? "gutterClass" : "wrapClass";
        var cur = line[prop];
        if (!cur) return false;
        else if (cls == null) line[prop] = null;
        else {
          var found = cur.match(classTest(cls));
          if (!found) return false;
          var end = found.index + found[0].length;
          line[prop] = cur.slice(0, found.index) + (!found.index || end == cur.length ? "" : " ") + cur.slice(end) || null;
        }
        return true;
      });
    }),

    addLineWidget: docMethodOp(function(handle, node, options) {
      return addLineWidget(this, handle, node, options);
    }),
    removeLineWidget: function(widget) { widget.clear(); },

    markText: function(from, to, options, type) {
      return markText(this, clipPos(this, from), clipPos(this, to), options, type||"range");
    },
    setBookmark: function(pos, options) {
      var realOpts = {replacedWith: options && (options.nodeType == null ? options.widget : options),
                      insertLeft: options && options.insertLeft,
                      clearWhenEmpty: false, shared: options && options.shared,
                      handleMouseEvents: options && options.handleMouseEvents};
      pos = clipPos(this, pos);
      return markText(this, pos, pos, realOpts, "bookmark");
    },
    findMarksAt: function(pos) {
      pos = clipPos(this, pos);
      var markers = [], spans = getLine(this, pos.line).markedSpans;
      if (spans) for (var i = 0; i < spans.length; ++i) {
        var span = spans[i];
        if ((span.from == null || span.from <= pos.ch) &&
            (span.to == null || span.to >= pos.ch))
          markers.push(span.marker.parent || span.marker);
      }
      return markers;
    },
    findMarks: function(from, to, filter) {
      from = clipPos(this, from); to = clipPos(this, to);
      var found = [], lineNo = from.line;
      this.iter(from.line, to.line + 1, function(line) {
        var spans = line.markedSpans;
        if (spans) for (var i = 0; i < spans.length; i++) {
          var span = spans[i];
          if (!(lineNo == from.line && from.ch > span.to ||
                span.from == null && lineNo != from.line||
                lineNo == to.line && span.from > to.ch) &&
              (!filter || filter(span.marker)))
            found.push(span.marker.parent || span.marker);
        }
        ++lineNo;
      });
      return found;
    },
    getAllMarks: function() {
      var markers = [];
      this.iter(function(line) {
        var sps = line.markedSpans;
        if (sps) for (var i = 0; i < sps.length; ++i)
          if (sps[i].from != null) markers.push(sps[i].marker);
      });
      return markers;
    },

    posFromIndex: function(off) {
      var ch, lineNo = this.first;
      this.iter(function(line) {
        var sz = line.text.length + 1;
        if (sz > off) { ch = off; return true; }
        off -= sz;
        ++lineNo;
      });
      return clipPos(this, Pos(lineNo, ch));
    },
    indexFromPos: function (coords) {
      coords = clipPos(this, coords);
      var index = coords.ch;
      if (coords.line < this.first || coords.ch < 0) return 0;
      this.iter(this.first, coords.line, function (line) {
        index += line.text.length + 1;
      });
      return index;
    },

    copy: function(copyHistory) {
      var doc = new Doc(getLines(this, this.first, this.first + this.size),
                        this.modeOption, this.first, this.lineSep);
      doc.scrollTop = this.scrollTop; doc.scrollLeft = this.scrollLeft;
      doc.sel = this.sel;
      doc.extend = false;
      if (copyHistory) {
        doc.history.undoDepth = this.history.undoDepth;
        doc.setHistory(this.getHistory());
      }
      return doc;
    },

    linkedDoc: function(options) {
      if (!options) options = {};
      var from = this.first, to = this.first + this.size;
      if (options.from != null && options.from > from) from = options.from;
      if (options.to != null && options.to < to) to = options.to;
      var copy = new Doc(getLines(this, from, to), options.mode || this.modeOption, from, this.lineSep);
      if (options.sharedHist) copy.history = this.history;
      (this.linked || (this.linked = [])).push({doc: copy, sharedHist: options.sharedHist});
      copy.linked = [{doc: this, isParent: true, sharedHist: options.sharedHist}];
      copySharedMarkers(copy, findSharedMarkers(this));
      return copy;
    },
    unlinkDoc: function(other) {
      if (other instanceof CodeMirror) other = other.doc;
      if (this.linked) for (var i = 0; i < this.linked.length; ++i) {
        var link = this.linked[i];
        if (link.doc != other) continue;
        this.linked.splice(i, 1);
        other.unlinkDoc(this);
        detachSharedMarkers(findSharedMarkers(this));
        break;
      }
      // If the histories were shared, split them again
      if (other.history == this.history) {
        var splitIds = [other.id];
        linkedDocs(other, function(doc) {splitIds.push(doc.id);}, true);
        other.history = new History(null);
        other.history.done = copyHistoryArray(this.history.done, splitIds);
        other.history.undone = copyHistoryArray(this.history.undone, splitIds);
      }
    },
    iterLinkedDocs: function(f) {linkedDocs(this, f);},

    getMode: function() {return this.mode;},
    getEditor: function() {return this.cm;},

    splitLines: function(str) {
      if (this.lineSep) return str.split(this.lineSep);
      return splitLinesAuto(str);
    },
    lineSeparator: function() { return this.lineSep || "\n"; }
  });

  // Public alias.
  Doc.prototype.eachLine = Doc.prototype.iter;

  // Set up methods on CodeMirror's prototype to redirect to the editor's document.
  var dontDelegate = "iter insert remove copy getEditor constructor".split(" ");
  for (var prop in Doc.prototype) if (Doc.prototype.hasOwnProperty(prop) && indexOf(dontDelegate, prop) < 0)
    CodeMirror.prototype[prop] = (function(method) {
      return function() {return method.apply(this.doc, arguments);};
    })(Doc.prototype[prop]);

  eventMixin(Doc);

  // Call f for all linked documents.
  function linkedDocs(doc, f, sharedHistOnly) {
    function propagate(doc, skip, sharedHist) {
      if (doc.linked) for (var i = 0; i < doc.linked.length; ++i) {
        var rel = doc.linked[i];
        if (rel.doc == skip) continue;
        var shared = sharedHist && rel.sharedHist;
        if (sharedHistOnly && !shared) continue;
        f(rel.doc, shared);
        propagate(rel.doc, doc, shared);
      }
    }
    propagate(doc, null, true);
  }

  // Attach a document to an editor.
  function attachDoc(cm, doc) {
    if (doc.cm) throw new Error("This document is already in use.");
    cm.doc = doc;
    doc.cm = cm;
    estimateLineHeights(cm);
    loadMode(cm);
    if (!cm.options.lineWrapping) findMaxLine(cm);
    cm.options.mode = doc.modeOption;
    regChange(cm);
  }

  // LINE UTILITIES

  // Find the line object corresponding to the given line number.
  function getLine(doc, n) {
    n -= doc.first;
    if (n < 0 || n >= doc.size) throw new Error("There is no line " + (n + doc.first) + " in the document.");
    for (var chunk = doc; !chunk.lines;) {
      for (var i = 0;; ++i) {
        var child = chunk.children[i], sz = child.chunkSize();
        if (n < sz) { chunk = child; break; }
        n -= sz;
      }
    }
    return chunk.lines[n];
  }

  // Get the part of a document between two positions, as an array of
  // strings.
  function getBetween(doc, start, end) {
    var out = [], n = start.line;
    doc.iter(start.line, end.line + 1, function(line) {
      var text = line.text;
      if (n == end.line) text = text.slice(0, end.ch);
      if (n == start.line) text = text.slice(start.ch);
      out.push(text);
      ++n;
    });
    return out;
  }
  // Get the lines between from and to, as array of strings.
  function getLines(doc, from, to) {
    var out = [];
    doc.iter(from, to, function(line) { out.push(line.text); });
    return out;
  }

  // Update the height of a line, propagating the height change
  // upwards to parent nodes.
  function updateLineHeight(line, height) {
    var diff = height - line.height;
    if (diff) for (var n = line; n; n = n.parent) n.height += diff;
  }

  // Given a line object, find its line number by walking up through
  // its parent links.
  function lineNo(line) {
    if (line.parent == null) return null;
    var cur = line.parent, no = indexOf(cur.lines, line);
    for (var chunk = cur.parent; chunk; cur = chunk, chunk = chunk.parent) {
      for (var i = 0;; ++i) {
        if (chunk.children[i] == cur) break;
        no += chunk.children[i].chunkSize();
      }
    }
    return no + cur.first;
  }

  // Find the line at the given vertical position, using the height
  // information in the document tree.
  function lineAtHeight(chunk, h) {
    var n = chunk.first;
    outer: do {
      for (var i = 0; i < chunk.children.length; ++i) {
        var child = chunk.children[i], ch = child.height;
        if (h < ch) { chunk = child; continue outer; }
        h -= ch;
        n += child.chunkSize();
      }
      return n;
    } while (!chunk.lines);
    for (var i = 0; i < chunk.lines.length; ++i) {
      var line = chunk.lines[i], lh = line.height;
      if (h < lh) break;
      h -= lh;
    }
    return n + i;
  }


  // Find the height above the given line.
  function heightAtLine(lineObj) {
    lineObj = visualLine(lineObj);

    var h = 0, chunk = lineObj.parent;
    for (var i = 0; i < chunk.lines.length; ++i) {
      var line = chunk.lines[i];
      if (line == lineObj) break;
      else h += line.height;
    }
    for (var p = chunk.parent; p; chunk = p, p = chunk.parent) {
      for (var i = 0; i < p.children.length; ++i) {
        var cur = p.children[i];
        if (cur == chunk) break;
        else h += cur.height;
      }
    }
    return h;
  }

  // Get the bidi ordering for the given line (and cache it). Returns
  // false for lines that are fully left-to-right, and an array of
  // BidiSpan objects otherwise.
  function getOrder(line) {
    var order = line.order;
    if (order == null) order = line.order = bidiOrdering(line.text);
    return order;
  }

  // HISTORY

  function History(startGen) {
    // Arrays of change events and selections. Doing something adds an
    // event to done and clears undo. Undoing moves events from done
    // to undone, redoing moves them in the other direction.
    this.done = []; this.undone = [];
    this.undoDepth = Infinity;
    // Used to track when changes can be merged into a single undo
    // event
    this.lastModTime = this.lastSelTime = 0;
    this.lastOp = this.lastSelOp = null;
    this.lastOrigin = this.lastSelOrigin = null;
    // Used by the isClean() method
    this.generation = this.maxGeneration = startGen || 1;
  }

  // Create a history change event from an updateDoc-style change
  // object.
  function historyChangeFromChange(doc, change) {
    var histChange = {from: copyPos(change.from), to: changeEnd(change), text: getBetween(doc, change.from, change.to)};
    attachLocalSpans(doc, histChange, change.from.line, change.to.line + 1);
    linkedDocs(doc, function(doc) {attachLocalSpans(doc, histChange, change.from.line, change.to.line + 1);}, true);
    return histChange;
  }

  // Pop all selection events off the end of a history array. Stop at
  // a change event.
  function clearSelectionEvents(array) {
    while (array.length) {
      var last = lst(array);
      if (last.ranges) array.pop();
      else break;
    }
  }

  // Find the top change event in the history. Pop off selection
  // events that are in the way.
  function lastChangeEvent(hist, force) {
    if (force) {
      clearSelectionEvents(hist.done);
      return lst(hist.done);
    } else if (hist.done.length && !lst(hist.done).ranges) {
      return lst(hist.done);
    } else if (hist.done.length > 1 && !hist.done[hist.done.length - 2].ranges) {
      hist.done.pop();
      return lst(hist.done);
    }
  }

  // Register a change in the history. Merges changes that are within
  // a single operation, ore are close together with an origin that
  // allows merging (starting with "+") into a single event.
  function addChangeToHistory(doc, change, selAfter, opId) {
    var hist = doc.history;
    hist.undone.length = 0;
    var time = +new Date, cur;

    if ((hist.lastOp == opId ||
         hist.lastOrigin == change.origin && change.origin &&
         ((change.origin.charAt(0) == "+" && doc.cm && hist.lastModTime > time - doc.cm.options.historyEventDelay) ||
          change.origin.charAt(0) == "*")) &&
        (cur = lastChangeEvent(hist, hist.lastOp == opId))) {
      // Merge this change into the last event
      var last = lst(cur.changes);
      if (cmp(change.from, change.to) == 0 && cmp(change.from, last.to) == 0) {
        // Optimized case for simple insertion -- don't want to add
        // new changesets for every character typed
        last.to = changeEnd(change);
      } else {
        // Add new sub-event
        cur.changes.push(historyChangeFromChange(doc, change));
      }
    } else {
      // Can not be merged, start a new event.
      var before = lst(hist.done);
      if (!before || !before.ranges)
        pushSelectionToHistory(doc.sel, hist.done);
      cur = {changes: [historyChangeFromChange(doc, change)],
             generation: hist.generation};
      hist.done.push(cur);
      while (hist.done.length > hist.undoDepth) {
        hist.done.shift();
        if (!hist.done[0].ranges) hist.done.shift();
      }
    }
    hist.done.push(selAfter);
    hist.generation = ++hist.maxGeneration;
    hist.lastModTime = hist.lastSelTime = time;
    hist.lastOp = hist.lastSelOp = opId;
    hist.lastOrigin = hist.lastSelOrigin = change.origin;

    if (!last) signal(doc, "historyAdded");
  }

  function selectionEventCanBeMerged(doc, origin, prev, sel) {
    var ch = origin.charAt(0);
    return ch == "*" ||
      ch == "+" &&
      prev.ranges.length == sel.ranges.length &&
      prev.somethingSelected() == sel.somethingSelected() &&
      new Date - doc.history.lastSelTime <= (doc.cm ? doc.cm.options.historyEventDelay : 500);
  }

  // Called whenever the selection changes, sets the new selection as
  // the pending selection in the history, and pushes the old pending
  // selection into the 'done' array when it was significantly
  // different (in number of selected ranges, emptiness, or time).
  function addSelectionToHistory(doc, sel, opId, options) {
    var hist = doc.history, origin = options && options.origin;

    // A new event is started when the previous origin does not match
    // the current, or the origins don't allow matching. Origins
    // starting with * are always merged, those starting with + are
    // merged when similar and close together in time.
    if (opId == hist.lastSelOp ||
        (origin && hist.lastSelOrigin == origin &&
         (hist.lastModTime == hist.lastSelTime && hist.lastOrigin == origin ||
          selectionEventCanBeMerged(doc, origin, lst(hist.done), sel))))
      hist.done[hist.done.length - 1] = sel;
    else
      pushSelectionToHistory(sel, hist.done);

    hist.lastSelTime = +new Date;
    hist.lastSelOrigin = origin;
    hist.lastSelOp = opId;
    if (options && options.clearRedo !== false)
      clearSelectionEvents(hist.undone);
  }

  function pushSelectionToHistory(sel, dest) {
    var top = lst(dest);
    if (!(top && top.ranges && top.equals(sel)))
      dest.push(sel);
  }

  // Used to store marked span information in the history.
  function attachLocalSpans(doc, change, from, to) {
    var existing = change["spans_" + doc.id], n = 0;
    doc.iter(Math.max(doc.first, from), Math.min(doc.first + doc.size, to), function(line) {
      if (line.markedSpans)
        (existing || (existing = change["spans_" + doc.id] = {}))[n] = line.markedSpans;
      ++n;
    });
  }

  // When un/re-doing restores text containing marked spans, those
  // that have been explicitly cleared should not be restored.
  function removeClearedSpans(spans) {
    if (!spans) return null;
    for (var i = 0, out; i < spans.length; ++i) {
      if (spans[i].marker.explicitlyCleared) { if (!out) out = spans.slice(0, i); }
      else if (out) out.push(spans[i]);
    }
    return !out ? spans : out.length ? out : null;
  }

  // Retrieve and filter the old marked spans stored in a change event.
  function getOldSpans(doc, change) {
    var found = change["spans_" + doc.id];
    if (!found) return null;
    for (var i = 0, nw = []; i < change.text.length; ++i)
      nw.push(removeClearedSpans(found[i]));
    return nw;
  }

  // Used both to provide a JSON-safe object in .getHistory, and, when
  // detaching a document, to split the history in two
  function copyHistoryArray(events, newGroup, instantiateSel) {
    for (var i = 0, copy = []; i < events.length; ++i) {
      var event = events[i];
      if (event.ranges) {
        copy.push(instantiateSel ? Selection.prototype.deepCopy.call(event) : event);
        continue;
      }
      var changes = event.changes, newChanges = [];
      copy.push({changes: newChanges});
      for (var j = 0; j < changes.length; ++j) {
        var change = changes[j], m;
        newChanges.push({from: change.from, to: change.to, text: change.text});
        if (newGroup) for (var prop in change) if (m = prop.match(/^spans_(\d+)$/)) {
          if (indexOf(newGroup, Number(m[1])) > -1) {
            lst(newChanges)[prop] = change[prop];
            delete change[prop];
          }
        }
      }
    }
    return copy;
  }

  // Rebasing/resetting history to deal with externally-sourced changes

  function rebaseHistSelSingle(pos, from, to, diff) {
    if (to < pos.line) {
      pos.line += diff;
    } else if (from < pos.line) {
      pos.line = from;
      pos.ch = 0;
    }
  }

  // Tries to rebase an array of history events given a change in the
  // document. If the change touches the same lines as the event, the
  // event, and everything 'behind' it, is discarded. If the change is
  // before the event, the event's positions are updated. Uses a
  // copy-on-write scheme for the positions, to avoid having to
  // reallocate them all on every rebase, but also avoid problems with
  // shared position objects being unsafely updated.
  function rebaseHistArray(array, from, to, diff) {
    for (var i = 0; i < array.length; ++i) {
      var sub = array[i], ok = true;
      if (sub.ranges) {
        if (!sub.copied) { sub = array[i] = sub.deepCopy(); sub.copied = true; }
        for (var j = 0; j < sub.ranges.length; j++) {
          rebaseHistSelSingle(sub.ranges[j].anchor, from, to, diff);
          rebaseHistSelSingle(sub.ranges[j].head, from, to, diff);
        }
        continue;
      }
      for (var j = 0; j < sub.changes.length; ++j) {
        var cur = sub.changes[j];
        if (to < cur.from.line) {
          cur.from = Pos(cur.from.line + diff, cur.from.ch);
          cur.to = Pos(cur.to.line + diff, cur.to.ch);
        } else if (from <= cur.to.line) {
          ok = false;
          break;
        }
      }
      if (!ok) {
        array.splice(0, i + 1);
        i = 0;
      }
    }
  }

  function rebaseHist(hist, change) {
    var from = change.from.line, to = change.to.line, diff = change.text.length - (to - from) - 1;
    rebaseHistArray(hist.done, from, to, diff);
    rebaseHistArray(hist.undone, from, to, diff);
  }

  // EVENT UTILITIES

  // Due to the fact that we still support jurassic IE versions, some
  // compatibility wrappers are needed.

  var e_preventDefault = CodeMirror.e_preventDefault = function(e) {
    if (e.preventDefault) e.preventDefault();
    else e.returnValue = false;
  };
  var e_stopPropagation = CodeMirror.e_stopPropagation = function(e) {
    if (e.stopPropagation) e.stopPropagation();
    else e.cancelBubble = true;
  };
  function e_defaultPrevented(e) {
    return e.defaultPrevented != null ? e.defaultPrevented : e.returnValue == false;
  }
  var e_stop = CodeMirror.e_stop = function(e) {e_preventDefault(e); e_stopPropagation(e);};

  function e_target(e) {return e.target || e.srcElement;}
  function e_button(e) {
    var b = e.which;
    if (b == null) {
      if (e.button & 1) b = 1;
      else if (e.button & 2) b = 3;
      else if (e.button & 4) b = 2;
    }
    if (mac && e.ctrlKey && b == 1) b = 3;
    return b;
  }

  // EVENT HANDLING

  // Lightweight event framework. on/off also work on DOM nodes,
  // registering native DOM handlers.

  var on = CodeMirror.on = function(emitter, type, f) {
    if (emitter.addEventListener)
      emitter.addEventListener(type, f, false);
    else if (emitter.attachEvent)
      emitter.attachEvent("on" + type, f);
    else {
      var map = emitter._handlers || (emitter._handlers = {});
      var arr = map[type] || (map[type] = []);
      arr.push(f);
    }
  };

  var off = CodeMirror.off = function(emitter, type, f) {
    if (emitter.removeEventListener)
      emitter.removeEventListener(type, f, false);
    else if (emitter.detachEvent)
      emitter.detachEvent("on" + type, f);
    else {
      var arr = emitter._handlers && emitter._handlers[type];
      if (!arr) return;
      for (var i = 0; i < arr.length; ++i)
        if (arr[i] == f) { arr.splice(i, 1); break; }
    }
  };

  var signal = CodeMirror.signal = function(emitter, type /*, values...*/) {
    var arr = emitter._handlers && emitter._handlers[type];
    if (!arr) return;
    var args = Array.prototype.slice.call(arguments, 2);
    for (var i = 0; i < arr.length; ++i) arr[i].apply(null, args);
  };

  var orphanDelayedCallbacks = null;

  // Often, we want to signal events at a point where we are in the
  // middle of some work, but don't want the handler to start calling
  // other methods on the editor, which might be in an inconsistent
  // state or simply not expect any other events to happen.
  // signalLater looks whether there are any handlers, and schedules
  // them to be executed when the last operation ends, or, if no
  // operation is active, when a timeout fires.
  function signalLater(emitter, type /*, values...*/) {
    var arr = emitter._handlers && emitter._handlers[type];
    if (!arr) return;
    var args = Array.prototype.slice.call(arguments, 2), list;
    if (operationGroup) {
      list = operationGroup.delayedCallbacks;
    } else if (orphanDelayedCallbacks) {
      list = orphanDelayedCallbacks;
    } else {
      list = orphanDelayedCallbacks = [];
      setTimeout(fireOrphanDelayed, 0);
    }
    function bnd(f) {return function(){f.apply(null, args);};};
    for (var i = 0; i < arr.length; ++i)
      list.push(bnd(arr[i]));
  }

  function fireOrphanDelayed() {
    var delayed = orphanDelayedCallbacks;
    orphanDelayedCallbacks = null;
    for (var i = 0; i < delayed.length; ++i) delayed[i]();
  }

  // The DOM events that CodeMirror handles can be overridden by
  // registering a (non-DOM) handler on the editor for the event name,
  // and preventDefault-ing the event in that handler.
  function signalDOMEvent(cm, e, override) {
    if (typeof e == "string")
      e = {type: e, preventDefault: function() { this.defaultPrevented = true; }};
    signal(cm, override || e.type, cm, e);
    return e_defaultPrevented(e) || e.codemirrorIgnore;
  }

  function signalCursorActivity(cm) {
    var arr = cm._handlers && cm._handlers.cursorActivity;
    if (!arr) return;
    var set = cm.curOp.cursorActivityHandlers || (cm.curOp.cursorActivityHandlers = []);
    for (var i = 0; i < arr.length; ++i) if (indexOf(set, arr[i]) == -1)
      set.push(arr[i]);
  }

  function hasHandler(emitter, type) {
    var arr = emitter._handlers && emitter._handlers[type];
    return arr && arr.length > 0;
  }

  // Add on and off methods to a constructor's prototype, to make
  // registering events on such objects more convenient.
  function eventMixin(ctor) {
    ctor.prototype.on = function(type, f) {on(this, type, f);};
    ctor.prototype.off = function(type, f) {off(this, type, f);};
  }

  // MISC UTILITIES

  // Number of pixels added to scroller and sizer to hide scrollbar
  var scrollerGap = 30;

  // Returned or thrown by various protocols to signal 'I'm not
  // handling this'.
  var Pass = CodeMirror.Pass = {toString: function(){return "CodeMirror.Pass";}};

  // Reused option objects for setSelection & friends
  var sel_dontScroll = {scroll: false}, sel_mouse = {origin: "*mouse"}, sel_move = {origin: "+move"};

  function Delayed() {this.id = null;}
  Delayed.prototype.set = function(ms, f) {
    clearTimeout(this.id);
    this.id = setTimeout(f, ms);
  };

  // Counts the column offset in a string, taking tabs into account.
  // Used mostly to find indentation.
  var countColumn = CodeMirror.countColumn = function(string, end, tabSize, startIndex, startValue) {
    if (end == null) {
      end = string.search(/[^\s\u00a0]/);
      if (end == -1) end = string.length;
    }
    for (var i = startIndex || 0, n = startValue || 0;;) {
      var nextTab = string.indexOf("\t", i);
      if (nextTab < 0 || nextTab >= end)
        return n + (end - i);
      n += nextTab - i;
      n += tabSize - (n % tabSize);
      i = nextTab + 1;
    }
  };

  // The inverse of countColumn -- find the offset that corresponds to
  // a particular column.
  var findColumn = CodeMirror.findColumn = function(string, goal, tabSize) {
    for (var pos = 0, col = 0;;) {
      var nextTab = string.indexOf("\t", pos);
      if (nextTab == -1) nextTab = string.length;
      var skipped = nextTab - pos;
      if (nextTab == string.length || col + skipped >= goal)
        return pos + Math.min(skipped, goal - col);
      col += nextTab - pos;
      col += tabSize - (col % tabSize);
      pos = nextTab + 1;
      if (col >= goal) return pos;
    }
  }

  var spaceStrs = [""];
  function spaceStr(n) {
    while (spaceStrs.length <= n)
      spaceStrs.push(lst(spaceStrs) + " ");
    return spaceStrs[n];
  }

  function lst(arr) { return arr[arr.length-1]; }

  var selectInput = function(node) { node.select(); };
  if (ios) // Mobile Safari apparently has a bug where select() is broken.
    selectInput = function(node) { node.selectionStart = 0; node.selectionEnd = node.value.length; };
  else if (ie) // Suppress mysterious IE10 errors
    selectInput = function(node) { try { node.select(); } catch(_e) {} };

  function indexOf(array, elt) {
    for (var i = 0; i < array.length; ++i)
      if (array[i] == elt) return i;
    return -1;
  }
  function map(array, f) {
    var out = [];
    for (var i = 0; i < array.length; i++) out[i] = f(array[i], i);
    return out;
  }

  function nothing() {}

  function createObj(base, props) {
    var inst;
    if (Object.create) {
      inst = Object.create(base);
    } else {
      nothing.prototype = base;
      inst = new nothing();
    }
    if (props) copyObj(props, inst);
    return inst;
  };

  function copyObj(obj, target, overwrite) {
    if (!target) target = {};
    for (var prop in obj)
      if (obj.hasOwnProperty(prop) && (overwrite !== false || !target.hasOwnProperty(prop)))
        target[prop] = obj[prop];
    return target;
  }

  function bind(f) {
    var args = Array.prototype.slice.call(arguments, 1);
    return function(){return f.apply(null, args);};
  }

  var nonASCIISingleCaseWordChar = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;
  var isWordCharBasic = CodeMirror.isWordChar = function(ch) {
    return /\w/.test(ch) || ch > "\x80" &&
      (ch.toUpperCase() != ch.toLowerCase() || nonASCIISingleCaseWordChar.test(ch));
  };
  function isWordChar(ch, helper) {
    if (!helper) return isWordCharBasic(ch);
    if (helper.source.indexOf("\\w") > -1 && isWordCharBasic(ch)) return true;
    return helper.test(ch);
  }

  function isEmpty(obj) {
    for (var n in obj) if (obj.hasOwnProperty(n) && obj[n]) return false;
    return true;
  }

  // Extending unicode characters. A series of a non-extending char +
  // any number of extending chars is treated as a single unit as far
  // as editing and measuring is concerned. This is not fully correct,
  // since some scripts/fonts/browsers also treat other configurations
  // of code points as a group.
  var extendingChars = /[\u0300-\u036f\u0483-\u0489\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u065e\u0670\u06d6-\u06dc\u06de-\u06e4\u06e7\u06e8\u06ea-\u06ed\u0711\u0730-\u074a\u07a6-\u07b0\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0900-\u0902\u093c\u0941-\u0948\u094d\u0951-\u0955\u0962\u0963\u0981\u09bc\u09be\u09c1-\u09c4\u09cd\u09d7\u09e2\u09e3\u0a01\u0a02\u0a3c\u0a41\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a70\u0a71\u0a75\u0a81\u0a82\u0abc\u0ac1-\u0ac5\u0ac7\u0ac8\u0acd\u0ae2\u0ae3\u0b01\u0b3c\u0b3e\u0b3f\u0b41-\u0b44\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b82\u0bbe\u0bc0\u0bcd\u0bd7\u0c3e-\u0c40\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0cbc\u0cbf\u0cc2\u0cc6\u0ccc\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0d3e\u0d41-\u0d44\u0d4d\u0d57\u0d62\u0d63\u0dca\u0dcf\u0dd2-\u0dd4\u0dd6\u0ddf\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0f18\u0f19\u0f35\u0f37\u0f39\u0f71-\u0f7e\u0f80-\u0f84\u0f86\u0f87\u0f90-\u0f97\u0f99-\u0fbc\u0fc6\u102d-\u1030\u1032-\u1037\u1039\u103a\u103d\u103e\u1058\u1059\u105e-\u1060\u1071-\u1074\u1082\u1085\u1086\u108d\u109d\u135f\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b7-\u17bd\u17c6\u17c9-\u17d3\u17dd\u180b-\u180d\u18a9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193b\u1a17\u1a18\u1a56\u1a58-\u1a5e\u1a60\u1a62\u1a65-\u1a6c\u1a73-\u1a7c\u1a7f\u1b00-\u1b03\u1b34\u1b36-\u1b3a\u1b3c\u1b42\u1b6b-\u1b73\u1b80\u1b81\u1ba2-\u1ba5\u1ba8\u1ba9\u1c2c-\u1c33\u1c36\u1c37\u1cd0-\u1cd2\u1cd4-\u1ce0\u1ce2-\u1ce8\u1ced\u1dc0-\u1de6\u1dfd-\u1dff\u200c\u200d\u20d0-\u20f0\u2cef-\u2cf1\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua66f-\ua672\ua67c\ua67d\ua6f0\ua6f1\ua802\ua806\ua80b\ua825\ua826\ua8c4\ua8e0-\ua8f1\ua926-\ua92d\ua947-\ua951\ua980-\ua982\ua9b3\ua9b6-\ua9b9\ua9bc\uaa29-\uaa2e\uaa31\uaa32\uaa35\uaa36\uaa43\uaa4c\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uabe5\uabe8\uabed\udc00-\udfff\ufb1e\ufe00-\ufe0f\ufe20-\ufe26\uff9e\uff9f]/;
  function isExtendingChar(ch) { return ch.charCodeAt(0) >= 768 && extendingChars.test(ch); }

  // DOM UTILITIES

  function elt(tag, content, className, style) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    if (style) e.style.cssText = style;
    if (typeof content == "string") e.appendChild(document.createTextNode(content));
    else if (content) for (var i = 0; i < content.length; ++i) e.appendChild(content[i]);
    return e;
  }

  var range;
  if (document.createRange) range = function(node, start, end, endNode) {
    var r = document.createRange();
    r.setEnd(endNode || node, end);
    r.setStart(node, start);
    return r;
  };
  else range = function(node, start, end) {
    var r = document.body.createTextRange();
    try { r.moveToElementText(node.parentNode); }
    catch(e) { return r; }
    r.collapse(true);
    r.moveEnd("character", end);
    r.moveStart("character", start);
    return r;
  };

  function removeChildren(e) {
    for (var count = e.childNodes.length; count > 0; --count)
      e.removeChild(e.firstChild);
    return e;
  }

  function removeChildrenAndAdd(parent, e) {
    return removeChildren(parent).appendChild(e);
  }

  var contains = CodeMirror.contains = function(parent, child) {
    if (child.nodeType == 3) // Android browser always returns false when child is a textnode
      child = child.parentNode;
    if (parent.contains)
      return parent.contains(child);
    do {
      if (child.nodeType == 11) child = child.host;
      if (child == parent) return true;
    } while (child = child.parentNode);
  };

  function activeElt() {
    var activeElement = document.activeElement;
    while (activeElement && activeElement.root && activeElement.root.activeElement)
      activeElement = activeElement.root.activeElement;
    return activeElement;
  }
  // Older versions of IE throws unspecified error when touching
  // document.activeElement in some cases (during loading, in iframe)
  if (ie && ie_version < 11) activeElt = function() {
    try { return document.activeElement; }
    catch(e) { return document.body; }
  };

  function classTest(cls) { return new RegExp("(^|\\s)" + cls + "(?:$|\\s)\\s*"); }
  var rmClass = CodeMirror.rmClass = function(node, cls) {
    var current = node.className;
    var match = classTest(cls).exec(current);
    if (match) {
      var after = current.slice(match.index + match[0].length);
      node.className = current.slice(0, match.index) + (after ? match[1] + after : "");
    }
  };
  var addClass = CodeMirror.addClass = function(node, cls) {
    var current = node.className;
    if (!classTest(cls).test(current)) node.className += (current ? " " : "") + cls;
  };
  function joinClasses(a, b) {
    var as = a.split(" ");
    for (var i = 0; i < as.length; i++)
      if (as[i] && !classTest(as[i]).test(b)) b += " " + as[i];
    return b;
  }

  // WINDOW-WIDE EVENTS

  // These must be handled carefully, because naively registering a
  // handler for each editor will cause the editors to never be
  // garbage collected.

  function forEachCodeMirror(f) {
    if (!document.body.getElementsByClassName) return;
    var byClass = document.body.getElementsByClassName("CodeMirror");
    for (var i = 0; i < byClass.length; i++) {
      var cm = byClass[i].CodeMirror;
      if (cm) f(cm);
    }
  }

  var globalsRegistered = false;
  function ensureGlobalHandlers() {
    if (globalsRegistered) return;
    registerGlobalHandlers();
    globalsRegistered = true;
  }
  function registerGlobalHandlers() {
    // When the window resizes, we need to refresh active editors.
    var resizeTimer;
    on(window, "resize", function() {
      if (resizeTimer == null) resizeTimer = setTimeout(function() {
        resizeTimer = null;
        forEachCodeMirror(onResize);
      }, 100);
    });
    // When the window loses focus, we want to show the editor as blurred
    on(window, "blur", function() {
      forEachCodeMirror(onBlur);
    });
  }

  // FEATURE DETECTION

  // Detect drag-and-drop
  var dragAndDrop = function() {
    // There is *some* kind of drag-and-drop support in IE6-8, but I
    // couldn't get it to work yet.
    if (ie && ie_version < 9) return false;
    var div = elt('div');
    return "draggable" in div || "dragDrop" in div;
  }();

  var zwspSupported;
  function zeroWidthElement(measure) {
    if (zwspSupported == null) {
      var test = elt("span", "\u200b");
      removeChildrenAndAdd(measure, elt("span", [test, document.createTextNode("x")]));
      if (measure.firstChild.offsetHeight != 0)
        zwspSupported = test.offsetWidth <= 1 && test.offsetHeight > 2 && !(ie && ie_version < 8);
    }
    var node = zwspSupported ? elt("span", "\u200b") :
      elt("span", "\u00a0", null, "display: inline-block; width: 1px; margin-right: -1px");
    node.setAttribute("cm-text", "");
    return node;
  }

  // Feature-detect IE's crummy client rect reporting for bidi text
  var badBidiRects;
  function hasBadBidiRects(measure) {
    if (badBidiRects != null) return badBidiRects;
    var txt = removeChildrenAndAdd(measure, document.createTextNode("A\u062eA"));
    var r0 = range(txt, 0, 1).getBoundingClientRect();
    if (!r0 || r0.left == r0.right) return false; // Safari returns null in some cases (#2780)
    var r1 = range(txt, 1, 2).getBoundingClientRect();
    return badBidiRects = (r1.right - r0.right < 3);
  }

  // See if "".split is the broken IE version, if so, provide an
  // alternative way to split lines.
  var splitLinesAuto = CodeMirror.splitLines = "\n\nb".split(/\n/).length != 3 ? function(string) {
    var pos = 0, result = [], l = string.length;
    while (pos <= l) {
      var nl = string.indexOf("\n", pos);
      if (nl == -1) nl = string.length;
      var line = string.slice(pos, string.charAt(nl - 1) == "\r" ? nl - 1 : nl);
      var rt = line.indexOf("\r");
      if (rt != -1) {
        result.push(line.slice(0, rt));
        pos += rt + 1;
      } else {
        result.push(line);
        pos = nl + 1;
      }
    }
    return result;
  } : function(string){return string.split(/\r\n?|\n/);};

  var hasSelection = window.getSelection ? function(te) {
    try { return te.selectionStart != te.selectionEnd; }
    catch(e) { return false; }
  } : function(te) {
    try {var range = te.ownerDocument.selection.createRange();}
    catch(e) {}
    if (!range || range.parentElement() != te) return false;
    return range.compareEndPoints("StartToEnd", range) != 0;
  };

  var hasCopyEvent = (function() {
    var e = elt("div");
    if ("oncopy" in e) return true;
    e.setAttribute("oncopy", "return;");
    return typeof e.oncopy == "function";
  })();

  var badZoomedRects = null;
  function hasBadZoomedRects(measure) {
    if (badZoomedRects != null) return badZoomedRects;
    var node = removeChildrenAndAdd(measure, elt("span", "x"));
    var normal = node.getBoundingClientRect();
    var fromRange = range(node, 0, 1).getBoundingClientRect();
    return badZoomedRects = Math.abs(normal.left - fromRange.left) > 1;
  }

  // KEY NAMES

  var keyNames = CodeMirror.keyNames = {
    3: "Enter", 8: "Backspace", 9: "Tab", 13: "Enter", 16: "Shift", 17: "Ctrl", 18: "Alt",
    19: "Pause", 20: "CapsLock", 27: "Esc", 32: "Space", 33: "PageUp", 34: "PageDown", 35: "End",
    36: "Home", 37: "Left", 38: "Up", 39: "Right", 40: "Down", 44: "PrintScrn", 45: "Insert",
    46: "Delete", 59: ";", 61: "=", 91: "Mod", 92: "Mod", 93: "Mod",
    106: "*", 107: "=", 109: "-", 110: ".", 111: "/", 127: "Delete",
    173: "-", 186: ";", 187: "=", 188: ",", 189: "-", 190: ".", 191: "/", 192: "`", 219: "[", 220: "\\",
    221: "]", 222: "'", 63232: "Up", 63233: "Down", 63234: "Left", 63235: "Right", 63272: "Delete",
    63273: "Home", 63275: "End", 63276: "PageUp", 63277: "PageDown", 63302: "Insert"
  };
  (function() {
    // Number keys
    for (var i = 0; i < 10; i++) keyNames[i + 48] = keyNames[i + 96] = String(i);
    // Alphabetic keys
    for (var i = 65; i <= 90; i++) keyNames[i] = String.fromCharCode(i);
    // Function keys
    for (var i = 1; i <= 12; i++) keyNames[i + 111] = keyNames[i + 63235] = "F" + i;
  })();

  // BIDI HELPERS

  function iterateBidiSections(order, from, to, f) {
    if (!order) return f(from, to, "ltr");
    var found = false;
    for (var i = 0; i < order.length; ++i) {
      var part = order[i];
      if (part.from < to && part.to > from || from == to && part.to == from) {
        f(Math.max(part.from, from), Math.min(part.to, to), part.level == 1 ? "rtl" : "ltr");
        found = true;
      }
    }
    if (!found) f(from, to, "ltr");
  }

  function bidiLeft(part) { return part.level % 2 ? part.to : part.from; }
  function bidiRight(part) { return part.level % 2 ? part.from : part.to; }

  function lineLeft(line) { var order = getOrder(line); return order ? bidiLeft(order[0]) : 0; }
  function lineRight(line) {
    var order = getOrder(line);
    if (!order) return line.text.length;
    return bidiRight(lst(order));
  }

  function lineStart(cm, lineN) {
    var line = getLine(cm.doc, lineN);
    var visual = visualLine(line);
    if (visual != line) lineN = lineNo(visual);
    var order = getOrder(visual);
    var ch = !order ? 0 : order[0].level % 2 ? lineRight(visual) : lineLeft(visual);
    return Pos(lineN, ch);
  }
  function lineEnd(cm, lineN) {
    var merged, line = getLine(cm.doc, lineN);
    while (merged = collapsedSpanAtEnd(line)) {
      line = merged.find(1, true).line;
      lineN = null;
    }
    var order = getOrder(line);
    var ch = !order ? line.text.length : order[0].level % 2 ? lineLeft(line) : lineRight(line);
    return Pos(lineN == null ? lineNo(line) : lineN, ch);
  }
  function lineStartSmart(cm, pos) {
    var start = lineStart(cm, pos.line);
    var line = getLine(cm.doc, start.line);
    var order = getOrder(line);
    if (!order || order[0].level == 0) {
      var firstNonWS = Math.max(0, line.text.search(/\S/));
      var inWS = pos.line == start.line && pos.ch <= firstNonWS && pos.ch;
      return Pos(start.line, inWS ? 0 : firstNonWS);
    }
    return start;
  }

  function compareBidiLevel(order, a, b) {
    var linedir = order[0].level;
    if (a == linedir) return true;
    if (b == linedir) return false;
    return a < b;
  }
  var bidiOther;
  function getBidiPartAt(order, pos) {
    bidiOther = null;
    for (var i = 0, found; i < order.length; ++i) {
      var cur = order[i];
      if (cur.from < pos && cur.to > pos) return i;
      if ((cur.from == pos || cur.to == pos)) {
        if (found == null) {
          found = i;
        } else if (compareBidiLevel(order, cur.level, order[found].level)) {
          if (cur.from != cur.to) bidiOther = found;
          return i;
        } else {
          if (cur.from != cur.to) bidiOther = i;
          return found;
        }
      }
    }
    return found;
  }

  function moveInLine(line, pos, dir, byUnit) {
    if (!byUnit) return pos + dir;
    do pos += dir;
    while (pos > 0 && isExtendingChar(line.text.charAt(pos)));
    return pos;
  }

  // This is needed in order to move 'visually' through bi-directional
  // text -- i.e., pressing left should make the cursor go left, even
  // when in RTL text. The tricky part is the 'jumps', where RTL and
  // LTR text touch each other. This often requires the cursor offset
  // to move more than one unit, in order to visually move one unit.
  function moveVisually(line, start, dir, byUnit) {
    var bidi = getOrder(line);
    if (!bidi) return moveLogically(line, start, dir, byUnit);
    var pos = getBidiPartAt(bidi, start), part = bidi[pos];
    var target = moveInLine(line, start, part.level % 2 ? -dir : dir, byUnit);

    for (;;) {
      if (target > part.from && target < part.to) return target;
      if (target == part.from || target == part.to) {
        if (getBidiPartAt(bidi, target) == pos) return target;
        part = bidi[pos += dir];
        return (dir > 0) == part.level % 2 ? part.to : part.from;
      } else {
        part = bidi[pos += dir];
        if (!part) return null;
        if ((dir > 0) == part.level % 2)
          target = moveInLine(line, part.to, -1, byUnit);
        else
          target = moveInLine(line, part.from, 1, byUnit);
      }
    }
  }

  function moveLogically(line, start, dir, byUnit) {
    var target = start + dir;
    if (byUnit) while (target > 0 && isExtendingChar(line.text.charAt(target))) target += dir;
    return target < 0 || target > line.text.length ? null : target;
  }

  // Bidirectional ordering algorithm
  // See http://unicode.org/reports/tr9/tr9-13.html for the algorithm
  // that this (partially) implements.

  // One-char codes used for character types:
  // L (L):   Left-to-Right
  // R (R):   Right-to-Left
  // r (AL):  Right-to-Left Arabic
  // 1 (EN):  European Number
  // + (ES):  European Number Separator
  // % (ET):  European Number Terminator
  // n (AN):  Arabic Number
  // , (CS):  Common Number Separator
  // m (NSM): Non-Spacing Mark
  // b (BN):  Boundary Neutral
  // s (B):   Paragraph Separator
  // t (S):   Segment Separator
  // w (WS):  Whitespace
  // N (ON):  Other Neutrals

  // Returns null if characters are ordered as they appear
  // (left-to-right), or an array of sections ({from, to, level}
  // objects) in the order in which they occur visually.
  var bidiOrdering = (function() {
    // Character types for codepoints 0 to 0xff
    var lowTypes = "bbbbbbbbbtstwsbbbbbbbbbbbbbbssstwNN%%%NNNNNN,N,N1111111111NNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNbbbbbbsbbbbbbbbbbbbbbbbbbbbbbbbbb,N%%%%NNNNLNNNNN%%11NLNNN1LNNNNNLLLLLLLLLLLLLLLLLLLLLLLNLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLN";
    // Character types for codepoints 0x600 to 0x6ff
    var arabicTypes = "rrrrrrrrrrrr,rNNmmmmmmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmmmmmmmmrrrrrrrnnnnnnnnnn%nnrrrmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmmmmmmmmmmmmmNmmmm";
    function charType(code) {
      if (code <= 0xf7) return lowTypes.charAt(code);
      else if (0x590 <= code && code <= 0x5f4) return "R";
      else if (0x600 <= code && code <= 0x6ed) return arabicTypes.charAt(code - 0x600);
      else if (0x6ee <= code && code <= 0x8ac) return "r";
      else if (0x2000 <= code && code <= 0x200b) return "w";
      else if (code == 0x200c) return "b";
      else return "L";
    }

    var bidiRE = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/;
    var isNeutral = /[stwN]/, isStrong = /[LRr]/, countsAsLeft = /[Lb1n]/, countsAsNum = /[1n]/;
    // Browsers seem to always treat the boundaries of block elements as being L.
    var outerType = "L";

    function BidiSpan(level, from, to) {
      this.level = level;
      this.from = from; this.to = to;
    }

    return function(str) {
      if (!bidiRE.test(str)) return false;
      var len = str.length, types = [];
      for (var i = 0, type; i < len; ++i)
        types.push(type = charType(str.charCodeAt(i)));

      // W1. Examine each non-spacing mark (NSM) in the level run, and
      // change the type of the NSM to the type of the previous
      // character. If the NSM is at the start of the level run, it will
      // get the type of sor.
      for (var i = 0, prev = outerType; i < len; ++i) {
        var type = types[i];
        if (type == "m") types[i] = prev;
        else prev = type;
      }

      // W2. Search backwards from each instance of a European number
      // until the first strong type (R, L, AL, or sor) is found. If an
      // AL is found, change the type of the European number to Arabic
      // number.
      // W3. Change all ALs to R.
      for (var i = 0, cur = outerType; i < len; ++i) {
        var type = types[i];
        if (type == "1" && cur == "r") types[i] = "n";
        else if (isStrong.test(type)) { cur = type; if (type == "r") types[i] = "R"; }
      }

      // W4. A single European separator between two European numbers
      // changes to a European number. A single common separator between
      // two numbers of the same type changes to that type.
      for (var i = 1, prev = types[0]; i < len - 1; ++i) {
        var type = types[i];
        if (type == "+" && prev == "1" && types[i+1] == "1") types[i] = "1";
        else if (type == "," && prev == types[i+1] &&
                 (prev == "1" || prev == "n")) types[i] = prev;
        prev = type;
      }

      // W5. A sequence of European terminators adjacent to European
      // numbers changes to all European numbers.
      // W6. Otherwise, separators and terminators change to Other
      // Neutral.
      for (var i = 0; i < len; ++i) {
        var type = types[i];
        if (type == ",") types[i] = "N";
        else if (type == "%") {
          for (var end = i + 1; end < len && types[end] == "%"; ++end) {}
          var replace = (i && types[i-1] == "!") || (end < len && types[end] == "1") ? "1" : "N";
          for (var j = i; j < end; ++j) types[j] = replace;
          i = end - 1;
        }
      }

      // W7. Search backwards from each instance of a European number
      // until the first strong type (R, L, or sor) is found. If an L is
      // found, then change the type of the European number to L.
      for (var i = 0, cur = outerType; i < len; ++i) {
        var type = types[i];
        if (cur == "L" && type == "1") types[i] = "L";
        else if (isStrong.test(type)) cur = type;
      }

      // N1. A sequence of neutrals takes the direction of the
      // surrounding strong text if the text on both sides has the same
      // direction. European and Arabic numbers act as if they were R in
      // terms of their influence on neutrals. Start-of-level-run (sor)
      // and end-of-level-run (eor) are used at level run boundaries.
      // N2. Any remaining neutrals take the embedding direction.
      for (var i = 0; i < len; ++i) {
        if (isNeutral.test(types[i])) {
          for (var end = i + 1; end < len && isNeutral.test(types[end]); ++end) {}
          var before = (i ? types[i-1] : outerType) == "L";
          var after = (end < len ? types[end] : outerType) == "L";
          var replace = before || after ? "L" : "R";
          for (var j = i; j < end; ++j) types[j] = replace;
          i = end - 1;
        }
      }

      // Here we depart from the documented algorithm, in order to avoid
      // building up an actual levels array. Since there are only three
      // levels (0, 1, 2) in an implementation that doesn't take
      // explicit embedding into account, we can build up the order on
      // the fly, without following the level-based algorithm.
      var order = [], m;
      for (var i = 0; i < len;) {
        if (countsAsLeft.test(types[i])) {
          var start = i;
          for (++i; i < len && countsAsLeft.test(types[i]); ++i) {}
          order.push(new BidiSpan(0, start, i));
        } else {
          var pos = i, at = order.length;
          for (++i; i < len && types[i] != "L"; ++i) {}
          for (var j = pos; j < i;) {
            if (countsAsNum.test(types[j])) {
              if (pos < j) order.splice(at, 0, new BidiSpan(1, pos, j));
              var nstart = j;
              for (++j; j < i && countsAsNum.test(types[j]); ++j) {}
              order.splice(at, 0, new BidiSpan(2, nstart, j));
              pos = j;
            } else ++j;
          }
          if (pos < i) order.splice(at, 0, new BidiSpan(1, pos, i));
        }
      }
      if (order[0].level == 1 && (m = str.match(/^\s+/))) {
        order[0].from = m[0].length;
        order.unshift(new BidiSpan(0, 0, m[0].length));
      }
      if (lst(order).level == 1 && (m = str.match(/\s+$/))) {
        lst(order).to -= m[0].length;
        order.push(new BidiSpan(0, len - m[0].length, len));
      }
      if (order[0].level == 2)
        order.unshift(new BidiSpan(1, order[0].to, order[0].to));
      if (order[0].level != lst(order).level)
        order.push(new BidiSpan(order[0].level, len, len));

      return order;
    };
  })();

  // THE END

  CodeMirror.version = "5.6.1";

  return CodeMirror;
});

},{}],"C:\\ksana2015\\node_modules\\ksana-codemirror\\src\\automarkup.js":[function(require,module,exports){
/*
	auto markup , base on search.js
*/
(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("codemirror"), require("codemirror/addon/search/searchcursor"),
     require("codemirror/addon/dialog/dialog"));

  else if (typeof define == "function" && define.amd) // AMD
    define(["codemirror","codemirror/addon/search/searchcursor", 
      "codemirror/addon/dialog/dialog"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  function searchOverlay(query, caseInsensitive) {
    if (typeof query == "string")
      query = new RegExp(query.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), caseInsensitive ? "gi" : "g");
    else if (!query.global)
      query = new RegExp(query.source, query.ignoreCase ? "gi" : "g");

    return {token: function(stream) {
      query.lastIndex = stream.pos;
      var match = query.exec(stream.string);
      if (match && match.index == stream.pos) {
        stream.pos += match[0].length;
        return "searching";
      } else if (match) {
        stream.pos = match.index;
      } else {
        stream.skipToEnd();
      }
    }};
  }

  function SearchState() {
    this.posFrom = this.posTo = this.lastQuery = this.query = null;
    this.overlay = null;
  }

  function getSearchState(cm) {
    return cm.state.search || (cm.state.search = new SearchState());
  }

  function queryCaseInsensitive(query) {
    return typeof query == "string" && query == query.toLowerCase();
  }

  function getSearchCursor(cm, query, pos) {
    // Heuristic: if the query string is all lowercase, do a case insensitive search.
    return cm.getSearchCursor(query, pos, queryCaseInsensitive(query));
  }

  function persistentDialog(cm, text, deflt, f) {
    cm.openDialog(text, f, {
      value: deflt,
      selectValueOnOpen: true,
      closeOnEnter: false,
      onClose: function() { clearSearch(cm); }
    });
  }

  function dialog(cm, text, shortText, deflt, f) {
    if (cm.openDialog) cm.openDialog(text, f, {value: deflt, selectValueOnOpen: true});
    else f(prompt(shortText, deflt));
  }

  function confirmDialog(cm, text, shortText, fs) {
    if (cm.openConfirm) cm.openConfirm(text, fs);
    else if (confirm(shortText)) fs[0]();
  }

  function parseString(string) {
    return string.replace(/\\(.)/g, function(_, ch) {
      if (ch == "n") return "\n"
      if (ch == "r") return "\r"
      return ch
    })
  }

  function parseQuery(query) {
    var isRE = query.match(/^\/(.*)\/([a-z]*)$/);
    if (isRE) {
      try { query = new RegExp(isRE[1], isRE[2].indexOf("i") == -1 ? "" : "i"); }
      catch(e) {} // Not a regular expression after all, do a string search
    } else {
      query = parseString(query)
    }
    if (typeof query == "string" ? query == "" : query.test(""))
      query = /x^/;
    return query;
  }

  var queryDialog =
    'Search: <input type="text" style="width: 10em" class="CodeMirror-search-field"/>';

  function startSearch(cm, state, query) {
    state.queryText = query;
    state.query = parseQuery(query);
    cm.removeOverlay(state.overlay, queryCaseInsensitive(state.query));
    state.overlay = searchOverlay(state.query, queryCaseInsensitive(state.query));
    cm.addOverlay(state.overlay);
    if (cm.showMatchesOnScrollbar) {
      if (state.annotate) { state.annotate.clear(); state.annotate = null; }
      state.annotate = cm.showMatchesOnScrollbar(state.query, queryCaseInsensitive(state.query));
    }
  }

  function doSearch(cm, rev, persistent) {
    var state = getSearchState(cm);
    if (state.query) return findNext(cm, rev);
    var q = cm.getSelection() || state.lastQuery;
    if (persistent && cm.openDialog) {
      var hiding = null
      persistentDialog(cm, queryDialog, q, function(query, event) {
        CodeMirror.e_stop(event);
        if (!query) return;
        if (query != state.queryText) startSearch(cm, state, query);
        if (hiding) hiding.style.opacity = 1
        findNext(cm, event.shiftKey, function(_, to) {
          var dialog
          if (to.line < 3 && document.querySelector &&
              (dialog = cm.display.wrapper.querySelector(".CodeMirror-dialog")) &&
              dialog.getBoundingClientRect().bottom - 4 > cm.cursorCoords(to, "window").top)
            (hiding = dialog).style.opacity = .4
        })
      });
    } else {
      dialog(cm, queryDialog, "Search for:", q, function(query) {
        if (query && !state.query) cm.operation(function() {
          startSearch(cm, state, query);
          state.posFrom = state.posTo = cm.getCursor();
          findNext(cm, rev);
        });
      });
    }
  }

  function findNext(cm, rev, callback) {cm.operation(function() {
    var state = getSearchState(cm);
    var cursor = getSearchCursor(cm, state.query, rev ? state.posFrom : state.posTo);
    if (!cursor.find(rev)) {
      cursor = getSearchCursor(cm, state.query, rev ? CodeMirror.Pos(cm.lastLine()) : CodeMirror.Pos(cm.firstLine(), 0));
      if (!cursor.find(rev)) return;
    }
    cm.setSelection(cursor.from(), cursor.to());
    cm.scrollIntoView({from: cursor.from(), to: cursor.to()}, 20);
    state.posFrom = cursor.from(); state.posTo = cursor.to();
    if (callback) callback(cursor.from(), cursor.to())
  });}

  function clearSearch(cm) {cm.operation(function() {
    var state = getSearchState(cm);
    state.lastQuery = state.query;
    if (!state.query) return;
    state.query = state.queryText = null;
    cm.removeOverlay(state.overlay);
    if (state.annotate) { state.annotate.clear(); state.annotate = null; }
  });}

  var replaceQueryDialog =
    ' <input type="text" style="width: 10em" class="CodeMirror-search-field"/>';

  function replaceAll(cm, query, text) {
    cm.operation(function() {
    	var milestones=[];
      for (var cursor = getSearchCursor(cm, query); cursor.findNext();) {

        var marks=cm.getDoc().findMarks( cursor.from(), cursor.to());

        if (marks.length) continue;

      	query.lastIndex=0;
    		var match=query.exec(cm.getRange(cursor.from(), cursor.to()));
        var replaceto=text.replace(/\$(\d)/g, function(_, i) {return match[i];});

        cm.setSelection(cursor.from(), cursor.to());
        var orginaltext=cursor.pos.match[0];
        cm.getDoc().replaceSelection(replaceto,"around");

        var err=cm.execCommand("markMilestone");
        if (err) {
        	cm.getDoc().replaceSelection(orginaltext,"around");//replace back to original
        } else {
        	milestones.push([[cursor.from().ch,cursor.from().line]
        								, [cursor.to().ch,cursor.to().line]]);
        }
      }
      cm.react.createMilestones(milestones);
    });
  }
  var errormessage=function(cm,msg){
  	cm.openNotification("<span style='color:red'>"+msg+"</span>",{duration:1000});
  }
  function text2markup(cm, all) {
  	
    if (cm.getOption("readOnly")) return;
    var query = cm.getSelection() || getSearchState(cm).lastQuery;
    var typename="milestone";
    var dialogText = "Automark milestone:"
    dialog(cm, dialogText + replaceQueryDialog, dialogText, query,function(query) {
      query=new RegExp(query,"g");
      if (query.source.indexOf("(")==-1) return errormessage(cm,"should have capture group");
      replaceAll(cm, query, "$1")

    });
  }
  function text2markup(cm, all) {
    
    if (cm.getOption("readOnly")) return;
    var query = cm.getSelection() || getSearchState(cm).lastQuery;
    var typename="milestone";
    var dialogText = "Automark milestone:"
    dialog(cm, dialogText + replaceQueryDialog, dialogText, query,function(query) {
      query=new RegExp(query,"g");
      if (query.source.indexOf("(")==-1) return errormessage(cm,"should have capture group");
      replaceAll(cm, query, "$1")

    });
  }

  function markup2text(cm, all) {
    
    if (cm.getOption("readOnly")) return;
    var query = cm.getSelection() || getSearchState(cm).lastQuery;
    var dialogText = "typename:"
    dialog(cm, dialogText + replaceQueryDialog, dialogText, query,function(query) {
      throw "not implement yet"

    });
  }  

  CodeMirror.commands.text2markup = text2markup;
  CodeMirror.commands.markup2text = markup2text;
});

},{"codemirror":"C:\\ksana2015\\node_modules\\codemirror\\lib\\codemirror.js","codemirror/addon/dialog/dialog":"C:\\ksana2015\\node_modules\\codemirror\\addon\\dialog\\dialog.js","codemirror/addon/search/searchcursor":"C:\\ksana2015\\node_modules\\codemirror\\addon\\search\\searchcursor.js"}],"C:\\ksana2015\\node_modules\\ksana-codemirror\\src\\codemirror-react.js":[function(require,module,exports){
var CM = require('codemirror');

require('codemirror/addon/display/panel');
require('codemirror/addon/search/search.js');
require('codemirror/addon/search/searchcursor.js');
require('codemirror/addon/dialog/dialog.js');
require('codemirror/addon/hint/show-hint.js');
require('codemirror/addon/selection/active-line');
require('./automarkup.js');


var milestones=require("./milestones");
var React = require('react');
var ReactDOM = require('react-dom');
var E=React.createElement;

var applyMarkups=require("./markups").applyMarkups;

var randomKey=function() {
	return 'm'+Math.random().toString().substr(2,5);
}
var eventKeys=["altKey","ctrlKey","shiftKey","clientX","clientY","pageX","pageY","screenX","screenY","type"];
var CodeMirrorComponent = React.createClass({
	displayName :"CodeMirror"
	,propTypes: {
		onChange: React.PropTypes.func,
		onFocusChange: React.PropTypes.func,
		onCursorActivity: React.PropTypes.func,
		options: React.PropTypes.object,
		path: React.PropTypes.string,
		value: React.PropTypes.string,
		onBeforeCopy:React.PropTypes.func
	}
	,getInitialState:function () {
		return {
			isFocused: false
		};
	}
	,cursorActivity:function(cm) { 
		this.props.onCursorActivity&&this.props.onCursorActivity(cm);
	}
	,componentDidMount:function () {
		if (typeof window.IRE!=="undefined") {
			require("./ire-hint");
		}
		var textareaNode = ReactDOM.findDOMNode(this.refs.editor);
		this.codeMirror = CM(textareaNode, {
  		value: this.props.value
  		//,mode:  "javascript"
  		//inputStyle:"contenteditable",
  		,styleActiveLine:true
  		,undoDepth: Infinity
  		,lineWrapping:true
  		,readOnly:!!this.props.readOnly
  		,lineNumbers: true
  		,theme:this.props.theme||""
  		,gutters: ["CodeMirror-linenumbers"]
  		,lineSeparator:this.props.lineSeparator||null  		
  		,extraKeys: {
  			"Ctrl-I": function(cm){
  				cm.showHint({hint: CM.hint.ire});
  			}
  		}
		});

		this.codeMirror.setOption("lineNumberFormatter",milestones.lineNumberFormatter.bind(this));

		//CM.fromTextArea(textareaNode, this.props.options);
		if (this.props.onBeforeCopy) this.codeMirror.on('beforeCopyToClipboard', this.props.onBeforeCopy);
		this.codeMirror.getDoc().on('change', this.props.onChange);
		if (this.props.onBeforeChange) this.codeMirror.on('beforeChange', this.props.onBeforeChange);
		this.codeMirror.on('focus', this.focusChanged.bind(this, true));
		this.codeMirror.on('blur', this.focusChanged.bind(this, false));
		this.codeMirror.on('cursorActivity',this.cursorActivity);
		this.codeMirror.on('mousedown',this.onMouseDown);

		setTimeout(function(){
			this.props.markups&&applyMarkups(this.codeMirror,this.props.markups,true);
			this.props.onMarkupReady&&this.props.onMarkupReady(this.codeMirror);
		}.bind(this),30);//need to wait for this.codeMirror.react ready (dirty hack)
	}

	,componentWillUnmount:function () {
		// todo: is there a lighter-weight way to remove the cm instance?
		if (this.codeMirror&& this.codeMirror.toTextArea) {
			this.codeMirror.toTextArea();
		}
		clearTimeout(this.timermove);
	}

	,onMouseDown:function(cm,e) {
		this.props.onMouseDown&&this.props.onMouseDown(cm,e);
	}

	,shouldComponentUpdate:function(nextProps) {
		var update= (nextProps.value!==this.props.value || nextProps.history!==this.props.history 
				||nextProps.markups!==this.props.markups);
		return update;
	}

	,componentWillReceiveProps:function (nextProps) {
		if (this.codeMirror) {

			if (this.props.history !== nextProps.history) {
				//this.codeMirror.setHistory(nextProps.history);
			}

			if (this.props.markups !== nextProps.markups) {
				nextProps.markups&&applyMarkups(this.codeMirror,nextProps.markups);
			}
		}
	}

	,getCodeMirror:function () {
		return this.codeMirror;
	}
/*
	,markText:function(opts) {
		var doc=this.codeMirror.getDoc();
		var selections=doc.listSelections();
		
		for (var i=0;i<selections.length;i++) {
			var sel=selections[i];
			if (sel.anchor===sel.head) continue; //empty
			if (typeof opts.key!=="string") {
				opts.key=randomKey();
			}
			this.codeMirror.markText(sel.anchor,sel.head, opts );	
		}
	}
*/
	,focus:function () {
		if (this.codeMirror) {
			this.codeMirror.focus();
		}
	}

	,focusChanged:function (focused) {
		if (!this.isMounted())return;//no longer available
		this.setState({isFocused: focused});
		this.props.onFocusChange && this.props.onFocusChange(focused);
	}
	,onMouseMove:function(e) {
		if (!this.props.onMouseMove)return;
		clearTimeout(this.timermove);
		var ev={};
		eventKeys.forEach(function(k) {ev[k]=e[k]});
		this.timermove=setTimeout(function() {
			this.props.onMouseMove(ev);
		}.bind(this),100);
	}
	,render:function () {
		var obj={ref:"editor"};
		if (this.props.onMouseMove) obj.onMouseMove=this.onMouseMove;
		return E("span",obj);
	}

});

module.exports = CodeMirrorComponent;
},{"./automarkup.js":"C:\\ksana2015\\node_modules\\ksana-codemirror\\src\\automarkup.js","./ire-hint":"C:\\ksana2015\\node_modules\\ksana-codemirror\\src\\ire-hint.js","./markups":"C:\\ksana2015\\node_modules\\ksana-codemirror\\src\\markups.js","./milestones":"C:\\ksana2015\\node_modules\\ksana-codemirror\\src\\milestones.js","codemirror":"C:\\ksana2015\\node_modules\\codemirror\\lib\\codemirror.js","codemirror/addon/dialog/dialog.js":"C:\\ksana2015\\node_modules\\codemirror\\addon\\dialog\\dialog.js","codemirror/addon/display/panel":"C:\\ksana2015\\node_modules\\codemirror\\addon\\display\\panel.js","codemirror/addon/hint/show-hint.js":"C:\\ksana2015\\node_modules\\codemirror\\addon\\hint\\show-hint.js","codemirror/addon/search/search.js":"C:\\ksana2015\\node_modules\\codemirror\\addon\\search\\search.js","codemirror/addon/search/searchcursor.js":"C:\\ksana2015\\node_modules\\codemirror\\addon\\search\\searchcursor.js","codemirror/addon/selection/active-line":"C:\\ksana2015\\node_modules\\codemirror\\addon\\selection\\active-line.js","react":"react","react-dom":"react-dom"}],"C:\\ksana2015\\node_modules\\ksana-codemirror\\src\\index.js":[function(require,module,exports){
var serialization=require("./serialization");
module.exports={
	serialize:serialization.serialize
	,deserialize:serialization.deserialize
	,getSelections:require("./selection").getSelections
	,getCharAtCursor:require("./selection").getCharAtCursor
	,CodeMirror:require("codemirror")
	,Component:require("./codemirror-react")
	,milestones:require("./milestones")
	,textMarker2json:require("./markups").textMarker2json
	,json2textMarker:require("./markups").json2textMarker
};
},{"./codemirror-react":"C:\\ksana2015\\node_modules\\ksana-codemirror\\src\\codemirror-react.js","./markups":"C:\\ksana2015\\node_modules\\ksana-codemirror\\src\\markups.js","./milestones":"C:\\ksana2015\\node_modules\\ksana-codemirror\\src\\milestones.js","./selection":"C:\\ksana2015\\node_modules\\ksana-codemirror\\src\\selection.js","./serialization":"C:\\ksana2015\\node_modules\\ksana-codemirror\\src\\serialization.js","codemirror":"C:\\ksana2015\\node_modules\\codemirror\\lib\\codemirror.js"}],"C:\\ksana2015\\node_modules\\ksana-codemirror\\src\\ire-hint.js":[function(require,module,exports){
// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE
//if (var IRE=require("ksana-ire");
(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  var WORD = /[\w$]+/, RANGE = 500;
  var hint=function(cm,self,data) {
    cm.getDoc().replaceRange(data.text,self.from,self.to);
    var from={line:self.from.line, ch:self.from.ch+data.text.length-1};
    var to={line:self.to.line, ch:self.to.ch+data.text.length-1};
    cm.getDoc().setSelection(from,to);
    return data;
  }
  CodeMirror.registerHelper("hint", "ire", function(editor, options) {
    var cur = editor.getCursor(), curLine = editor.getLine(cur.line);
    var tofind=curLine[cur.ch-1];
    var candidates=IRE.getDerived(tofind);
    var list=candidates.map(function(candidate){
      var displayText=candidate;
      var text=String.fromCharCode(0x2fff)+displayText+tofind+"卍";
      return {text:text,displayText:displayText,hint:hint}
    });

    var parts=IRE.getUnicodeParts(tofind);
    parts.map(function(part){
      var text=String.fromCharCode(0x2fff)+tofind+part+"卍";
      var first={text:text,displayText:tofind+part+"●",hint:hint};
      list.unshift(first);
    });

    return {list: list, from: {line:cur.line,ch:cur.ch-1}, to:cur};
  });
});

},{"codemirror":"C:\\ksana2015\\node_modules\\codemirror\\lib\\codemirror.js"}],"C:\\ksana2015\\node_modules\\ksana-codemirror\\src\\markups.js":[function(require,module,exports){
/**
	put markups into CodeMirror
	do not use markups after this call
*/
var reservedfields={doc:true,lines:true,type:true,id:true,key:true,replacedWith:true
	,clearWhenEmpty:true,collapsed:true,widgetNode:true,atomic:true,handle:true}; //don't know id exists

var clearAllMarks=function(doc){
	var marks=doc.getAllMarks();
	for (var i in marks) {
		marks[i].clear();
	}
}

var applyBookmark=function(cm,bookmark) {
	var func="bookmark_"+bookmark.className;
	if (cm.react && cm.react[func]) {
		cm.getDoc().setCursor({line:bookmark.from[1] ,ch:bookmark.from[0]});
		return cm.react[func].call(cm.react,bookmark);
	}
	return null;
}

var json2textMarker=function(cm,key,m) {
	var fromch=m.from[0],fromline=m.from[1];

	if (typeof m.to==="undefined") {
		m.key=key;
		applyBookmark(cm,m).handle;
		return;
	}

	if (typeof m.to==="number") {
		toch=m.to;
		toline=fromline;
	}  else {
		toch=m.to[0];
		toline=m.to[1];
	}

	for (var i in m) {
		if (reservedfields[i]) delete m[i];
	}
	m.key=key; //probably from firebase uid
	m.handle=cm.markText({line:fromline,ch:fromch},{line:toline,ch:toch}, m );
}
var applyMarkups=function(cm,markups,clear) {
	if (clear) clearAllMarks(cm.getDoc());
	for (var key in markups) {
		if (markups[key].handle) continue; //already in view
		var m=markups[key];
		json2textMarker.call(this,cm,key,m);
	}
}

/**
	extract markups from CodeMirror
*/
var extractBookmark=function(textmarker, pos) {
	var out={from:[pos.ch,pos.line]};
	for (var i in textmarker) {
		if (typeof textmarker[i]==="function") continue;
		if (!reservedfields[i]) out[i]=textmarker[i];
	}
	return out;
}

var textMarker2json=function(m) {
	if (m.clearOnEnter) return; //temporary markup will not be saved
	var obj={};

	for (var key in m) {
		if (!m.hasOwnProperty(key))continue;
		if (!reservedfields[key] && key[0]!=="_") { //key start with _ will not saved
			obj[key]=m[key];
			if (key==="className"&& m[key].indexOf("editingMarker")>-1) {//should not save this class
				obj[key]=obj[key].replace(/ ?editingMarker ?/,"");
			}
		}
	}

	//overwrite from and to
	var pos=m.find();
	if (m.type==="bookmark") {
		obj=extractBookmark(m,pos);
	} else {
		obj.from=[pos.from.ch,pos.from.line];
		if (pos.to) {
			obj.to=pos.to.ch;
			if (pos.from.line!==pos.to.line) to=[to,pos.to.line];
		} else {
			console.error("markup missing to");
		}
	}	
	return obj;
}
var extractMarkups=function(doc) {
	var marks=doc.getAllMarks();
	var markups={};
	for (var i=0;i<marks.length;i++) {
		var m=marks[i];

		var obj=textMarker2json(m);
		if (obj) markups[m.key]=obj;		
	}
	return markups;
}

module.exports={applyMarkups:applyMarkups, extractMarkups:extractMarkups,
	json2textMarker:json2textMarker,textMarker2json:textMarker2json};
},{}],"C:\\ksana2015\\node_modules\\ksana-codemirror\\src\\milestones.js":[function(require,module,exports){

var findMilestone = function (array, obj, near) { 
  var low = 0,
  high = array.length;
  if (high===0) return -1;
  while (low < high) {
    var mid = (low + high) >> 1;
    if (array[mid][0]==obj) return mid;
    array[mid][0] < obj ? low = mid + 1 : high = mid;
  }
  if (near) return low;
  else if (low<array.length&&array[low][0]==obj) return low;else return -1;
};

var buildMilestone=function(doc,markups) {
	var name2milestone={},line2milestone=[];

	for (var i in markups) {
		var m=markups[i];
		if (m.className!=="milestone") continue;
		var cur=m.handle.find();
		var t=doc.getRange(cur.from,cur.to);
		name2milestone[t]=m.handle;
		line2milestone.push([cur.from.line,t,cur.from.ch,cur.to.ch]);
	}
	line2milestone.sort(function(a,b){
		return a[0]-b[0];
	});
	doc.name2milestone=name2milestone;
	doc.line2milestone=line2milestone;
}
var abs2milestone=function(line) {

	var idx=findMilestone(this.line2milestone,line,true)-1;
	if (idx<0||idx>=this.line2milestone.length) return [line-1];
	var ms=this.line2milestone[idx];
	if (line===ms[0]) return [line-1]; //fix line before first milestone = -1
	return [(line-ms[0]-1),ms[1]]; //  [line offset, milestone_caption]
}

var milestone2abs=function( name, offsetline) {
	var ms=this.name2milestone[name];
	if (!ms) return offsetline;

	var pos=ms.find();
	return pos.from.line+offsetline;

}

var lineNumberFormatter=function(line){
	var doc=this.codeMirror.getDoc();
	if (!doc) return "";
	if (!doc.line2milestone || !doc.line2milestone.length)return line-1;
	var ms=abs2milestone.call(doc,line)[0];
	return ms;
}

var unpack=function(r) {
	var o=[];
	if (!r.length) return r;
	if (r.length===1) { //quote
		o[0]=[r[0][0],r[0][1]];
		if (typeof o[0][1]==="number") o[0][1]=[r[0][1],r[0][0][1]];//same line

		if (typeof r[0][2]==="string") {
			o[0][1] = milestone2abs.call(this,r[0][2],r[0][1]);
		}

		return o;
	}

	if (r.length!==2)return r;
	if (typeof r[1]==="number") r[1]=[r[1]];
	o[0]=[r[0][0],r[0][1]];
	o[1]=[r[1][0],r[1][1]];

	if (typeof r[0][2]==="string") {
		o[0][1] = milestone2abs.call(this,r[0][2],r[0][1]);
	}

	if (typeof r[1][2]==="string") {
		o[1][1] = milestone2abs.call(this,r[1][2],r[1][1]);
	}

	if (r[1].length==1) {//same line
		o[1][1]=o[0][1];
	}
	return o;
}

var pack=function(r) {
	var o=[];
	if (r.length!==2)return r;
	if (typeof r[0][2]==="string") return r; //already pack

	o[0]=[r[0][0]].concat(abs2milestone.call(this,r[0][1]+1));

	if (r[1][1]===r[0][1]) {
		o[1]=r[1][0]; //same line
	} else {
		o[1]=[r[1][0]].concat(abs2milestone.call(this,r[1][1]+1));	
	}
	
	return o;
}
module.exports={lineNumberFormatter:lineNumberFormatter,findMilestone:findMilestone,
	abs2milestone:abs2milestone,buildMilestone:buildMilestone,unpack:unpack,pack:pack};
},{}],"C:\\ksana2015\\node_modules\\ksana-codemirror\\src\\selection.js":[function(require,module,exports){
var findRange=function(sels,sel) {
	for (var i=0;i<sels.length;i++) {
		var s=sels[i];
		if (JSON.stringify(s)==JSON.stringify(sel)) return i;
	}
	return -1;
}
//move newly added selected to bottom of array
//because codemirror:normalizeSelection will sort the ranges
var arrangeRanges=function(current,prev) {
	var out=[],newly=[];
	for (var i=0;i<current.length;i++) {
		var cur=current[i];
		if (findRange(prev,cur)==-1) {
			newly.push(cur);
		} else {
			out.push(cur);
		}
	}
	out=out.concat(newly);
	return out;
}
var getSelections=function(doc,prev) {
	var out=[];
	var sels=doc.listSelections();

	for (var i=0;i<sels.length;i++) {
		var sel=sels[i];
		var to=[sel.anchor.ch,sel.anchor.line];
		var from=[sel.head.ch,sel.head.line];
		if (JSON.stringify(sel.anchor)===JSON.stringify(sel.head)) {
			out.push([from]);//caret pos only
		} else {
			if ((from[1]==to[1]&& from[0]>to[0]) || (from[1]>to[1])) {
				t=from;
				from=to;
				to=t;
			}
			out.push([from,to]);			
		}
	}

	if (prev) {
		out=arrangeRanges(out,prev);
	}
	return out;
}

var	getCharAtCursor = function(doc) {
		var cursorch="";
		var cursor=doc.getCursor();
		var line=doc.getLine(cursor.line);
		var ch=cursor.ch-1;//the char before cursor
		if (!line) return "";
		var cursorch=line[ch];
		if (!cursorch) return "";

		var code=cursorch.charCodeAt(0);
		if (code>=0xD800 && code<0xDC00) {
			cursorch+=line[ch+1];
		}
		return cursorch;
	}


module.exports={getSelections:getSelections,getCharAtCursor:getCharAtCursor};
},{}],"C:\\ksana2015\\node_modules\\ksana-codemirror\\src\\serialization.js":[function(require,module,exports){

var itemstojson=function(obj){ //json friendly to github diff
	var out="";
	if (Array.isArray(obj)) {
		for (var i in obj) {
			out+="\n"+JSON.stringify(obj[i])+",";
		}		
		return '['+out.substr(0,out.length-1)+'\n]';
	} else {
		for (var i in obj) {
			out+='\n"'+i+'":'+JSON.stringify(obj[i])+",";
		}		
		return '{'+out.substr(0,out.length-1)+'\n}';
	}
	
}
var serialize=function(meta,text,history,markups) {
	if (typeof text !=="string") {
		var cm=text;
		var doc=cm.getDoc();
		text=doc.getValue().replace(/\r?\n/g,"\n");
		history=meta.readOnly?[]:doc.getHistory().done;
		markups=require("./markups").extractMarkups(doc);
	}
	var aux="{"+'"markups":'+itemstojson(markups);

	if (meta.saveHistory)	aux+='\n,"history":'+itemstojson(history);
		
	aux+="\n}";

	meta.textsize="0x00000000";//fix length

	var metastr=JSON.stringify(meta)+"\n";
	var textsize=text.length;
	var size="00000000"+textsize.toString(16);
	meta.textsize="0x"+size.substr(size.length-8);
	var metastr=JSON.stringify(meta)+"\n";

	return metastr+text+aux;
}

var parseFile=function(buffer,defaulttitle) {
	buffer=buffer.replace(/\r?\n/g,"\n");
	var idx=buffer.indexOf("\n");
	if (idx==-1) {
		//only one line
		idx=buffer.length;
	}

	var firstline=buffer.substr(0,idx).trim();
	if (firstline[0]!=="{") {//assuming a pure text
		firstline='{"title":"'+defaulttitle+'"}';
		idx=-1;
	}

	try {
		var meta=JSON.parse(firstline);
		meta.textsize = parseInt(meta.textsize) || buffer.length-(idx+1); //for new ktx file
		var aux=buffer.substring(idx+1+meta.textsize);
		aux=aux?JSON.parse(aux):{};
	} catch(e) {
		console.log(e);
		return null;
	}

	return {meta:meta, history: aux.history, markups:aux.markups, value:buffer.substr(idx+1,meta.textsize)};
}
var deserialize=function(buffer,filename) {
	var defaulttitle=filename.substr(0,filename.lastIndexOf("."));
	var idx=defaulttitle.lastIndexOf("/");
	if (idx>0) defaulttitle = defaulttitle.substr(idx+1);
	idx=defaulttitle.lastIndexOf("\\");
	if (idx>0) defaulttitle = defaulttitle.substr(idx+1);

	var parts=parseFile(buffer,defaulttitle);
	if (!parts) return null;

	//convert markups pointer
	return parts;
}



module.exports={serialize:serialize,deserialize:deserialize};
},{"./markups":"C:\\ksana2015\\node_modules\\ksana-codemirror\\src\\markups.js"}],"C:\\ksana2015\\node_modules\\ksana-inputmethod\\index.js":[function(require,module,exports){
var getIME=function() {
	return [
		{name:"ITRANS",ime:require("./romanized/itrans")}
		,{name:"Wylie",ime:require("./indic/tibetan")}
		//,{name:"Devanagari",ime:require("./indic/devanagari")}
	]
}
module.exports=getIME;
},{"./indic/tibetan":"C:\\ksana2015\\node_modules\\ksana-inputmethod\\indic\\tibetan.js","./romanized/itrans":"C:\\ksana2015\\node_modules\\ksana-inputmethod\\romanized\\itrans.js"}],"C:\\ksana2015\\node_modules\\ksana-inputmethod\\indic\\tibetan.js":[function(require,module,exports){
var wylie=require("./wylie");
var convert=function(s){
	return wylie.fromWylie(s);
}
var isValid=function(s){
	return true;
}
module.exports={convert:convert,isValid:isValid}
},{"./wylie":"C:\\ksana2015\\node_modules\\ksana-inputmethod\\indic\\wylie.js"}],"C:\\ksana2015\\node_modules\\ksana-inputmethod\\indic\\wylie.js":[function(require,module,exports){
var opt = { check:false, check_strict:false, print_warnings:false, fix_spacing:false }

function setopt(arg_opt) {
	for (i in arg_opt) opt[i] = arg_opt[i]
	if (opt.check_strict && !opt.check) { 
		throw 'check_strict requires check.'
	}
}

function newHashSet() {
	var x = []
	x.add = function (K) {
		if (this.indexOf(K) < 0) this.push(K)
	}
	x.contains = function (K) {
		return this.indexOf(K) >= 0
	}
	return x
}

function newHashMap() {
	var x = {}
	x.k = [], x.v = []
	x.put = function (K, V) {
		var i = this.k.indexOf(K)
		if (i < 0) this.k.push(K), this.v.push(V); else this.v[i] = V
	}
	x.containsKey = function (K) {
		return this.k.indexOf(K) >= 0
	}
	x.get = function (K) {
		var i = this.k.indexOf(K)
		if (i >= 0) return this.v[i]
	}
	return x
}
var tmpSet;
// mappings are ported from Java code
// *** Wylie to Unicode mappings ***
// list of wylie consonant => unicode
var m_consonant = new newHashMap();
m_consonant.put("k", 	"\u0f40");
m_consonant.put("kh", 	"\u0f41");
m_consonant.put("g", 	"\u0f42");
m_consonant.put("gh", 	"\u0f42\u0fb7");
m_consonant.put("g+h", 	"\u0f42\u0fb7");
m_consonant.put("ng", 	"\u0f44");
m_consonant.put("c", 	"\u0f45");
m_consonant.put("ch", 	"\u0f46");
m_consonant.put("j", 	"\u0f47");
m_consonant.put("ny", 	"\u0f49");
m_consonant.put("T", 	"\u0f4a");
m_consonant.put("-t", 	"\u0f4a");
m_consonant.put("Th", 	"\u0f4b");
m_consonant.put("-th", 	"\u0f4b");
m_consonant.put("D", 	"\u0f4c");
m_consonant.put("-d", 	"\u0f4c");
m_consonant.put("Dh", 	"\u0f4c\u0fb7");
m_consonant.put("D+h", 	"\u0f4c\u0fb7");
m_consonant.put("-dh", 	"\u0f4c\u0fb7");
m_consonant.put("-d+h", "\u0f4c\u0fb7");
m_consonant.put("N", 	"\u0f4e");
m_consonant.put("-n", 	"\u0f4e");
m_consonant.put("t", 	"\u0f4f");
m_consonant.put("th", 	"\u0f50");
m_consonant.put("d", 	"\u0f51");
m_consonant.put("dh", 	"\u0f51\u0fb7");
m_consonant.put("d+h", 	"\u0f51\u0fb7");
m_consonant.put("n", 	"\u0f53");
m_consonant.put("p", 	"\u0f54");
m_consonant.put("ph", 	"\u0f55");
m_consonant.put("b", 	"\u0f56");
m_consonant.put("bh", 	"\u0f56\u0fb7");
m_consonant.put("b+h", 	"\u0f56\u0fb7");
m_consonant.put("m", 	"\u0f58");
m_consonant.put("ts", 	"\u0f59");
m_consonant.put("tsh", 	"\u0f5a");
m_consonant.put("dz", 	"\u0f5b");
m_consonant.put("dzh", 	"\u0f5b\u0fb7");
m_consonant.put("dz+h", "\u0f5b\u0fb7");
m_consonant.put("w", 	"\u0f5d");
m_consonant.put("zh", 	"\u0f5e");
m_consonant.put("z", 	"\u0f5f");
m_consonant.put("'", 	"\u0f60");
m_consonant.put("\u2018", 	"\u0f60");	// typographic quotes
m_consonant.put("\u2019", 	"\u0f60");
m_consonant.put("y", 	"\u0f61");
m_consonant.put("r", 	"\u0f62");
m_consonant.put("l", 	"\u0f63");
m_consonant.put("sh", 	"\u0f64");
m_consonant.put("Sh", 	"\u0f65");
m_consonant.put("-sh", 	"\u0f65");
m_consonant.put("s", 	"\u0f66");
m_consonant.put("h", 	"\u0f67");
m_consonant.put("W", 	"\u0f5d");
m_consonant.put("Y", 	"\u0f61");
m_consonant.put("R", 	"\u0f6a");
m_consonant.put("f", 	"\u0f55\u0f39");
m_consonant.put("v", 	"\u0f56\u0f39");

// subjoined letters
var m_subjoined = new newHashMap();
m_subjoined.put("k", 	"\u0f90");
m_subjoined.put("kh", 	"\u0f91");
m_subjoined.put("g", 	"\u0f92");
m_subjoined.put("gh", 	"\u0f92\u0fb7");
m_subjoined.put("g+h", 	"\u0f92\u0fb7");
m_subjoined.put("ng", 	"\u0f94");
m_subjoined.put("c", 	"\u0f95");
m_subjoined.put("ch", 	"\u0f96");
m_subjoined.put("j", 	"\u0f97");
m_subjoined.put("ny", 	"\u0f99");
m_subjoined.put("T", 	"\u0f9a");
m_subjoined.put("-t", 	"\u0f9a");
m_subjoined.put("Th", 	"\u0f9b");
m_subjoined.put("-th", 	"\u0f9b");
m_subjoined.put("D", 	"\u0f9c");
m_subjoined.put("-d", 	"\u0f9c");
m_subjoined.put("Dh", 	"\u0f9c\u0fb7");
m_subjoined.put("D+h", 	"\u0f9c\u0fb7");
m_subjoined.put("-dh", 	"\u0f9c\u0fb7");
m_subjoined.put("-d+h",	"\u0f9c\u0fb7");
m_subjoined.put("N", 	"\u0f9e");
m_subjoined.put("-n", 	"\u0f9e");
m_subjoined.put("t", 	"\u0f9f");
m_subjoined.put("th", 	"\u0fa0");
m_subjoined.put("d", 	"\u0fa1");
m_subjoined.put("dh", 	"\u0fa1\u0fb7");
m_subjoined.put("d+h", 	"\u0fa1\u0fb7");
m_subjoined.put("n", 	"\u0fa3");
m_subjoined.put("p", 	"\u0fa4");
m_subjoined.put("ph", 	"\u0fa5");
m_subjoined.put("b", 	"\u0fa6");
m_subjoined.put("bh", 	"\u0fa6\u0fb7");
m_subjoined.put("b+h", 	"\u0fa6\u0fb7");
m_subjoined.put("m", 	"\u0fa8");
m_subjoined.put("ts", 	"\u0fa9");
m_subjoined.put("tsh", 	"\u0faa");
m_subjoined.put("dz", 	"\u0fab");
m_subjoined.put("dzh", 	"\u0fab\u0fb7");
m_subjoined.put("dz+h",	"\u0fab\u0fb7");
m_subjoined.put("w", 	"\u0fad");
m_subjoined.put("zh", 	"\u0fae");
m_subjoined.put("z", 	"\u0faf");
m_subjoined.put("'", 	"\u0fb0");
m_subjoined.put("\u2018", 	"\u0fb0");	// typographic quotes
m_subjoined.put("\u2019", 	"\u0fb0");
m_subjoined.put("y", 	"\u0fb1");
m_subjoined.put("r", 	"\u0fb2");
m_subjoined.put("l", 	"\u0fb3");
m_subjoined.put("sh", 	"\u0fb4");
m_subjoined.put("Sh", 	"\u0fb5");
m_subjoined.put("-sh", 	"\u0fb5");
m_subjoined.put("s", 	"\u0fb6");
m_subjoined.put("h", 	"\u0fb7");
m_subjoined.put("a", 	"\u0fb8");
m_subjoined.put("W", 	"\u0fba");
m_subjoined.put("Y", 	"\u0fbb");
m_subjoined.put("R", 	"\u0fbc");

// vowels
var m_vowel = new newHashMap();
m_vowel.put("a", 	"\u0f68");
m_vowel.put("A", 	"\u0f71");
m_vowel.put("i", 	"\u0f72");
m_vowel.put("I", 	"\u0f71\u0f72");
m_vowel.put("u", 	"\u0f74");
m_vowel.put("U", 	"\u0f71\u0f74");
m_vowel.put("e", 	"\u0f7a");
m_vowel.put("ai", 	"\u0f7b");
m_vowel.put("o", 	"\u0f7c");
m_vowel.put("au", 	"\u0f7d");
m_vowel.put("-i", 	"\u0f80");
m_vowel.put("-I", 	"\u0f71\u0f80");

// final symbols to unicode
var m_final_uni = new newHashMap();
m_final_uni.put("M", 	"\u0f7e");
m_final_uni.put("~M`", 	"\u0f82");
m_final_uni.put("~M", 	"\u0f83");
m_final_uni.put("X", 	"\u0f37");
m_final_uni.put("~X", 	"\u0f35");
m_final_uni.put("H", 	"\u0f7f");
m_final_uni.put("?", 	"\u0f84");
m_final_uni.put("^", 	"\u0f39");

// final symbols organized by class
var m_final_class = new newHashMap();
m_final_class.put("M", 	"M");
m_final_class.put("~M`", "M");
m_final_class.put("~M",  "M");
m_final_class.put("X", 	"X");
m_final_class.put("~X", "X");
m_final_class.put("H", 	"H");
m_final_class.put("?", 	"?");
m_final_class.put("^", 	"^");

// other stand-alone symbols
var m_other = new newHashMap();
m_other.put("0", 	"\u0f20");
m_other.put("1", 	"\u0f21");
m_other.put("2", 	"\u0f22");
m_other.put("3", 	"\u0f23");
m_other.put("4", 	"\u0f24");
m_other.put("5", 	"\u0f25");
m_other.put("6", 	"\u0f26");
m_other.put("7", 	"\u0f27");
m_other.put("8", 	"\u0f28");
m_other.put("9", 	"\u0f29");
m_other.put(" ", 	"\u0f0b");
m_other.put("*", 	"\u0f0c");
m_other.put("/", 	"\u0f0d");
m_other.put("//", 	"\u0f0e");
m_other.put(";", 	"\u0f0f");
m_other.put("|", 	"\u0f11");
m_other.put("!", 	"\u0f08");
m_other.put(":", 	"\u0f14");
m_other.put("_", 	" ");
m_other.put("=", 	"\u0f34");
m_other.put("<", 	"\u0f3a");
m_other.put(">", 	"\u0f3b");
m_other.put("(", 	"\u0f3c");
m_other.put(")", 	"\u0f3d");
m_other.put("@", 	"\u0f04");
m_other.put("#", 	"\u0f05");
m_other.put("$", 	"\u0f06");
m_other.put("%", 	"\u0f07");

// special characters: flag those if they occur out of context
var m_special = new newHashSet();
m_special.add(".");
m_special.add("+");
m_special.add("-");
m_special.add("~");
m_special.add("^");
m_special.add("?");
m_special.add("`");
m_special.add("]");

// superscripts: hashmap of superscript => set of letters or stacks below
var m_superscripts = new newHashMap();
tmpSet = new newHashSet();
tmpSet.add("k");
tmpSet.add("g");
tmpSet.add("ng");
tmpSet.add("j");
tmpSet.add("ny");
tmpSet.add("t");
tmpSet.add("d");
tmpSet.add("n");
tmpSet.add("b");
tmpSet.add("m");
tmpSet.add("ts");
tmpSet.add("dz");
tmpSet.add("k+y");
tmpSet.add("g+y");
tmpSet.add("m+y");
tmpSet.add("b+w");
tmpSet.add("ts+w");
tmpSet.add("g+w");
m_superscripts.put("r", tmpSet);

tmpSet = new newHashSet();
tmpSet.add("k");
tmpSet.add("g");
tmpSet.add("ng");
tmpSet.add("c");
tmpSet.add("j");
tmpSet.add("t");
tmpSet.add("d");
tmpSet.add("p");
tmpSet.add("b");
tmpSet.add("h");
m_superscripts.put("l", tmpSet);

tmpSet = new newHashSet();
tmpSet.add("k");
tmpSet.add("g");
tmpSet.add("ng");
tmpSet.add("ny");
tmpSet.add("t");
tmpSet.add("d");
tmpSet.add("n");
tmpSet.add("p");
tmpSet.add("b");
tmpSet.add("m");
tmpSet.add("ts");
tmpSet.add("k+y");
tmpSet.add("g+y");
tmpSet.add("p+y");
tmpSet.add("b+y");
tmpSet.add("m+y");
tmpSet.add("k+r");
tmpSet.add("g+r");
tmpSet.add("p+r");
tmpSet.add("b+r");
tmpSet.add("m+r");
tmpSet.add("n+r");
m_superscripts.put("s", tmpSet);

// subscripts => set of letters above
var m_subscripts = new newHashMap();
tmpSet = new newHashSet();
tmpSet.add("k");
tmpSet.add("kh");
tmpSet.add("g");
tmpSet.add("p");
tmpSet.add("ph");
tmpSet.add("b");
tmpSet.add("m");
tmpSet.add("r+k");
tmpSet.add("r+g");
tmpSet.add("r+m");
tmpSet.add("s+k");
tmpSet.add("s+g");
tmpSet.add("s+p");
tmpSet.add("s+b");
tmpSet.add("s+m");
m_subscripts.put("y", tmpSet);

tmpSet = new newHashSet();
tmpSet.add("k");
tmpSet.add("kh");
tmpSet.add("g");
tmpSet.add("t");
tmpSet.add("th");
tmpSet.add("d");
tmpSet.add("n");
tmpSet.add("p");
tmpSet.add("ph");
tmpSet.add("b");
tmpSet.add("m");
tmpSet.add("sh");
tmpSet.add("s");
tmpSet.add("h");
tmpSet.add("dz");
tmpSet.add("s+k");
tmpSet.add("s+g");
tmpSet.add("s+p");
tmpSet.add("s+b");
tmpSet.add("s+m");
tmpSet.add("s+n");
m_subscripts.put("r", tmpSet);

tmpSet = new newHashSet();
tmpSet.add("k");
tmpSet.add("g");
tmpSet.add("b");
tmpSet.add("r");
tmpSet.add("s");
tmpSet.add("z");
m_subscripts.put("l", tmpSet);

tmpSet = new newHashSet();
tmpSet.add("k");
tmpSet.add("kh");
tmpSet.add("g");
tmpSet.add("c");
tmpSet.add("ny");
tmpSet.add("t");
tmpSet.add("d");
tmpSet.add("ts");
tmpSet.add("tsh");
tmpSet.add("zh");
tmpSet.add("z");
tmpSet.add("r");
tmpSet.add("l");
tmpSet.add("sh");
tmpSet.add("s");
tmpSet.add("h");
tmpSet.add("g+r");
tmpSet.add("d+r");
tmpSet.add("ph+y");
tmpSet.add("r+g");
tmpSet.add("r+ts");
m_subscripts.put("w", tmpSet);

// prefixes => set of consonants or stacks after
var m_prefixes = new newHashMap();
tmpSet = new newHashSet();
tmpSet.add("c");
tmpSet.add("ny");
tmpSet.add("t");
tmpSet.add("d");
tmpSet.add("n");
tmpSet.add("ts");
tmpSet.add("zh");
tmpSet.add("z");
tmpSet.add("y");
tmpSet.add("sh");
tmpSet.add("s");
m_prefixes.put("g", tmpSet);

tmpSet = new newHashSet();
tmpSet.add("k");
tmpSet.add("g");
tmpSet.add("ng");
tmpSet.add("p");
tmpSet.add("b");
tmpSet.add("m");
tmpSet.add("k+y");
tmpSet.add("g+y");
tmpSet.add("p+y");
tmpSet.add("b+y");
tmpSet.add("m+y");
tmpSet.add("k+r");
tmpSet.add("g+r");
tmpSet.add("p+r");
tmpSet.add("b+r");
m_prefixes.put("d", tmpSet);

tmpSet = new newHashSet();
tmpSet.add("k");
tmpSet.add("g");
tmpSet.add("c");
tmpSet.add("t");
tmpSet.add("d");
tmpSet.add("ts");
tmpSet.add("zh");
tmpSet.add("z");
tmpSet.add("sh");
tmpSet.add("s");
tmpSet.add("r");
tmpSet.add("l");
tmpSet.add("k+y");
tmpSet.add("g+y");
tmpSet.add("k+r");
tmpSet.add("g+r");
tmpSet.add("r+l");
tmpSet.add("s+l");
tmpSet.add("r+k");
tmpSet.add("r+g");
tmpSet.add("r+ng");
tmpSet.add("r+j");
tmpSet.add("r+ny");
tmpSet.add("r+t");
tmpSet.add("r+d");
tmpSet.add("r+n");
tmpSet.add("r+ts");
tmpSet.add("r+dz");
tmpSet.add("s+k");
tmpSet.add("s+g");
tmpSet.add("s+ng");
tmpSet.add("s+ny");
tmpSet.add("s+t");
tmpSet.add("s+d");
tmpSet.add("s+n");
tmpSet.add("s+ts");
tmpSet.add("r+k+y");
tmpSet.add("r+g+y");
tmpSet.add("s+k+y");
tmpSet.add("s+g+y");
tmpSet.add("s+k+r");
tmpSet.add("s+g+r");
tmpSet.add("l+d");
tmpSet.add("l+t");
tmpSet.add("k+l");
tmpSet.add("s+r");
tmpSet.add("z+l");
tmpSet.add("s+w");
m_prefixes.put("b", tmpSet);

tmpSet = new newHashSet();
tmpSet.add("kh");
tmpSet.add("g");
tmpSet.add("ng");
tmpSet.add("ch");
tmpSet.add("j");
tmpSet.add("ny");
tmpSet.add("th");
tmpSet.add("d");
tmpSet.add("n");
tmpSet.add("tsh");
tmpSet.add("dz");
tmpSet.add("kh+y");
tmpSet.add("g+y");
tmpSet.add("kh+r");
tmpSet.add("g+r");
m_prefixes.put("m", tmpSet);

tmpSet = new newHashSet();
tmpSet.add("kh");
tmpSet.add("g");
tmpSet.add("ch");
tmpSet.add("j");
tmpSet.add("th");
tmpSet.add("d");
tmpSet.add("ph");
tmpSet.add("b");
tmpSet.add("tsh");
tmpSet.add("dz");
tmpSet.add("kh+y");
tmpSet.add("g+y");
tmpSet.add("ph+y");
tmpSet.add("b+y");
tmpSet.add("kh+r");
tmpSet.add("g+r");
tmpSet.add("d+r");
tmpSet.add("ph+r");
tmpSet.add("b+r");
m_prefixes.put("'", tmpSet);
m_prefixes.put("\u2018", tmpSet);
m_prefixes.put("\u2019", tmpSet);

// set of suffix letters
// also included are some Skt letters b/c they occur often in suffix position in Skt words
var m_suffixes = new newHashSet();
m_suffixes.add("'");
m_suffixes.add("\u2018");
m_suffixes.add("\u2019");
m_suffixes.add("g");
m_suffixes.add("ng");
m_suffixes.add("d");
m_suffixes.add("n");
m_suffixes.add("b");
m_suffixes.add("m");
m_suffixes.add("r");
m_suffixes.add("l");
m_suffixes.add("s");
m_suffixes.add("N");
m_suffixes.add("T");
m_suffixes.add("-n");
m_suffixes.add("-t");

// suffix2 => set of letters before
var m_suff2 = new newHashMap();
tmpSet = new newHashSet();
tmpSet.add("g");
tmpSet.add("ng");
tmpSet.add("b");
tmpSet.add("m");
m_suff2.put("s", tmpSet);

tmpSet = new newHashSet();
tmpSet.add("n");
tmpSet.add("r");
tmpSet.add("l");
m_suff2.put("d", tmpSet);

// root letter index for very ambiguous three-stack syllables
var m_ambiguous_key = new newHashMap();
m_ambiguous_key.put("dgs", 	1);
m_ambiguous_key.put("dms", 	1);
m_ambiguous_key.put("'gs", 	1);
m_ambiguous_key.put("mngs", 	0);
m_ambiguous_key.put("bgs", 	0);
m_ambiguous_key.put("dbs", 	1);

var m_ambiguous_wylie = new newHashMap();
m_ambiguous_wylie.put("dgs", 	"dgas");
m_ambiguous_wylie.put("dms", 	"dmas");
m_ambiguous_wylie.put("'gs", 	"'gas");
m_ambiguous_wylie.put("mngs", 	"mangs");
m_ambiguous_wylie.put("bgs", 	"bags");
m_ambiguous_wylie.put("dbs", 	"dbas");

// *** Unicode to Wylie mappings ***

// top letters
var m_tib_top = new newHashMap();
m_tib_top.put('\u0f40', 	"k");
m_tib_top.put('\u0f41', 	"kh");
m_tib_top.put('\u0f42', 	"g");
m_tib_top.put('\u0f43', 	"g+h");
m_tib_top.put('\u0f44', 	"ng");
m_tib_top.put('\u0f45', 	"c");
m_tib_top.put('\u0f46', 	"ch");
m_tib_top.put('\u0f47', 	"j");
m_tib_top.put('\u0f49', 	"ny");
m_tib_top.put('\u0f4a', 	"T");
m_tib_top.put('\u0f4b', 	"Th");
m_tib_top.put('\u0f4c', 	"D");
m_tib_top.put('\u0f4d', 	"D+h");
m_tib_top.put('\u0f4e', 	"N");
m_tib_top.put('\u0f4f', 	"t");
m_tib_top.put('\u0f50', 	"th");
m_tib_top.put('\u0f51', 	"d");
m_tib_top.put('\u0f52', 	"d+h");
m_tib_top.put('\u0f53', 	"n");
m_tib_top.put('\u0f54', 	"p");
m_tib_top.put('\u0f55', 	"ph");
m_tib_top.put('\u0f56', 	"b");
m_tib_top.put('\u0f57', 	"b+h");
m_tib_top.put('\u0f58', 	"m");
m_tib_top.put('\u0f59', 	"ts");
m_tib_top.put('\u0f5a', 	"tsh");
m_tib_top.put('\u0f5b', 	"dz");
m_tib_top.put('\u0f5c', 	"dz+h");
m_tib_top.put('\u0f5d', 	"w");
m_tib_top.put('\u0f5e', 	"zh");
m_tib_top.put('\u0f5f', 	"z");
m_tib_top.put('\u0f60', 	"'");
m_tib_top.put('\u0f61', 	"y");
m_tib_top.put('\u0f62', 	"r");
m_tib_top.put('\u0f63', 	"l");
m_tib_top.put('\u0f64', 	"sh");
m_tib_top.put('\u0f65', 	"Sh");
m_tib_top.put('\u0f66', 	"s");
m_tib_top.put('\u0f67', 	"h");
m_tib_top.put('\u0f68', 	"a");
m_tib_top.put('\u0f69', 	"k+Sh");
m_tib_top.put('\u0f6a', 	"R");

// subjoined letters
var m_tib_subjoined = new newHashMap();
m_tib_subjoined.put('\u0f90', 	"k");
m_tib_subjoined.put('\u0f91', 	"kh");
m_tib_subjoined.put('\u0f92', 	"g");
m_tib_subjoined.put('\u0f93', 	"g+h");
m_tib_subjoined.put('\u0f94', 	"ng");
m_tib_subjoined.put('\u0f95', 	"c");
m_tib_subjoined.put('\u0f96', 	"ch");
m_tib_subjoined.put('\u0f97', 	"j");
m_tib_subjoined.put('\u0f99', 	"ny");
m_tib_subjoined.put('\u0f9a', 	"T");
m_tib_subjoined.put('\u0f9b', 	"Th");
m_tib_subjoined.put('\u0f9c', 	"D");
m_tib_subjoined.put('\u0f9d', 	"D+h");
m_tib_subjoined.put('\u0f9e', 	"N");
m_tib_subjoined.put('\u0f9f', 	"t");
m_tib_subjoined.put('\u0fa0', 	"th");
m_tib_subjoined.put('\u0fa1', 	"d");
m_tib_subjoined.put('\u0fa2', 	"d+h");
m_tib_subjoined.put('\u0fa3', 	"n");
m_tib_subjoined.put('\u0fa4', 	"p");
m_tib_subjoined.put('\u0fa5', 	"ph");
m_tib_subjoined.put('\u0fa6', 	"b");
m_tib_subjoined.put('\u0fa7', 	"b+h");
m_tib_subjoined.put('\u0fa8', 	"m");
m_tib_subjoined.put('\u0fa9', 	"ts");
m_tib_subjoined.put('\u0faa', 	"tsh");
m_tib_subjoined.put('\u0fab', 	"dz");
m_tib_subjoined.put('\u0fac', 	"dz+h");
m_tib_subjoined.put('\u0fad', 	"w");
m_tib_subjoined.put('\u0fae', 	"zh");
m_tib_subjoined.put('\u0faf', 	"z");
m_tib_subjoined.put('\u0fb0', 	"'");
m_tib_subjoined.put('\u0fb1', 	"y");
m_tib_subjoined.put('\u0fb2', 	"r");
m_tib_subjoined.put('\u0fb3', 	"l");
m_tib_subjoined.put('\u0fb4', 	"sh");
m_tib_subjoined.put('\u0fb5', 	"Sh");
m_tib_subjoined.put('\u0fb6', 	"s");
m_tib_subjoined.put('\u0fb7', 	"h");
m_tib_subjoined.put('\u0fb8', 	"a");
m_tib_subjoined.put('\u0fb9', 	"k+Sh");
m_tib_subjoined.put('\u0fba', 	"W");
m_tib_subjoined.put('\u0fbb', 	"Y");
m_tib_subjoined.put('\u0fbc', 	"R");

// vowel signs:
// a-chen is not here because that's a top character, not a vowel sign.
// pre-composed "I" and "U" are dealt here; other pre-composed Skt vowels are more
// easily handled by a global replace in toWylie(), b/c they turn into subjoined "r"/"l".

var m_tib_vowel = new newHashMap();
m_tib_vowel.put('\u0f71', 	"A");
m_tib_vowel.put('\u0f72', 	"i");
m_tib_vowel.put('\u0f73', 	"I");
m_tib_vowel.put('\u0f74', 	"u");
m_tib_vowel.put('\u0f75', 	"U");
m_tib_vowel.put('\u0f7a', 	"e");
m_tib_vowel.put('\u0f7b', 	"ai");
m_tib_vowel.put('\u0f7c', 	"o");
m_tib_vowel.put('\u0f7d', 	"au");
m_tib_vowel.put('\u0f80', 	"-i");

// long (Skt) vowels
var m_tib_vowel_long = new newHashMap();
m_tib_vowel_long.put("i", 	"I");
m_tib_vowel_long.put("u", 	"U");
m_tib_vowel_long.put("-i", 	"-I");

// final symbols => wylie
var m_tib_final_wylie = new newHashMap();
m_tib_final_wylie.put('\u0f7e', 	"M");
m_tib_final_wylie.put('\u0f82', 	"~M`");
m_tib_final_wylie.put('\u0f83', 	"~M");
m_tib_final_wylie.put('\u0f37', 	"X");
m_tib_final_wylie.put('\u0f35', 	"~X");
m_tib_final_wylie.put('\u0f39', 	"^");
m_tib_final_wylie.put('\u0f7f', 	"H");
m_tib_final_wylie.put('\u0f84', 	"?");

// final symbols by class
var m_tib_final_class = new newHashMap();
m_tib_final_class.put('\u0f7e', 	"M");
m_tib_final_class.put('\u0f82', 	"M");
m_tib_final_class.put('\u0f83', 	"M");
m_tib_final_class.put('\u0f37', 	"X");
m_tib_final_class.put('\u0f35', 	"X");
m_tib_final_class.put('\u0f39', 	"^");
m_tib_final_class.put('\u0f7f', 	"H");
m_tib_final_class.put('\u0f84', 	"?");

// special characters introduced by ^
var m_tib_caret = new newHashMap();
m_tib_caret.put("ph", 	"f");
m_tib_caret.put("b", 	"v");

// other stand-alone characters
var m_tib_other = new newHashMap();
m_tib_other.put(' ', 		"_");
m_tib_other.put('\u0f04', 	"@");
m_tib_other.put('\u0f05', 	"#");
m_tib_other.put('\u0f06', 	"$");
m_tib_other.put('\u0f07', 	"%");
m_tib_other.put('\u0f08', 	"!");
m_tib_other.put('\u0f0b', 	" ");
m_tib_other.put('\u0f0c', 	"*");
m_tib_other.put('\u0f0d', 	"/");
m_tib_other.put('\u0f0e', 	"//");
m_tib_other.put('\u0f0f', 	";");
m_tib_other.put('\u0f11', 	"|");
m_tib_other.put('\u0f14', 	":");
m_tib_other.put('\u0f20', 	"0");
m_tib_other.put('\u0f21', 	"1");
m_tib_other.put('\u0f22', 	"2");
m_tib_other.put('\u0f23', 	"3");
m_tib_other.put('\u0f24', 	"4");
m_tib_other.put('\u0f25', 	"5");
m_tib_other.put('\u0f26', 	"6");
m_tib_other.put('\u0f27', 	"7");
m_tib_other.put('\u0f28', 	"8");
m_tib_other.put('\u0f29', 	"9");
m_tib_other.put('\u0f34', 	"=");
m_tib_other.put('\u0f3a', 	"<");
m_tib_other.put('\u0f3b', 	">");
m_tib_other.put('\u0f3c', 	"(");
m_tib_other.put('\u0f3d', 	")");

// all these stacked consonant combinations don't need "+"s in them
var m_tib_stacks = new newHashSet();
m_tib_stacks.add("b+l");
m_tib_stacks.add("b+r");
m_tib_stacks.add("b+y");
m_tib_stacks.add("c+w");
m_tib_stacks.add("d+r");
m_tib_stacks.add("d+r+w");
m_tib_stacks.add("d+w");
m_tib_stacks.add("dz+r");
m_tib_stacks.add("g+l");
m_tib_stacks.add("g+r");
m_tib_stacks.add("g+r+w");
m_tib_stacks.add("g+w");
m_tib_stacks.add("g+y");
m_tib_stacks.add("h+r");
m_tib_stacks.add("h+w");
m_tib_stacks.add("k+l");
m_tib_stacks.add("k+r");
m_tib_stacks.add("k+w");
m_tib_stacks.add("k+y");
m_tib_stacks.add("kh+r");
m_tib_stacks.add("kh+w");
m_tib_stacks.add("kh+y");
m_tib_stacks.add("l+b");
m_tib_stacks.add("l+c");
m_tib_stacks.add("l+d");
m_tib_stacks.add("l+g");
m_tib_stacks.add("l+h");
m_tib_stacks.add("l+j");
m_tib_stacks.add("l+k");
m_tib_stacks.add("l+ng");
m_tib_stacks.add("l+p");
m_tib_stacks.add("l+t");
m_tib_stacks.add("l+w");
m_tib_stacks.add("m+r");
m_tib_stacks.add("m+y");
m_tib_stacks.add("n+r");
m_tib_stacks.add("ny+w");
m_tib_stacks.add("p+r");
m_tib_stacks.add("p+y");
m_tib_stacks.add("ph+r");
m_tib_stacks.add("ph+y");
m_tib_stacks.add("ph+y+w");
m_tib_stacks.add("r+b");
m_tib_stacks.add("r+d");
m_tib_stacks.add("r+dz");
m_tib_stacks.add("r+g");
m_tib_stacks.add("r+g+w");
m_tib_stacks.add("r+g+y");
m_tib_stacks.add("r+j");
m_tib_stacks.add("r+k");
m_tib_stacks.add("r+k+y");
m_tib_stacks.add("r+l");
m_tib_stacks.add("r+m");
m_tib_stacks.add("r+m+y");
m_tib_stacks.add("r+n");
m_tib_stacks.add("r+ng");
m_tib_stacks.add("r+ny");
m_tib_stacks.add("r+t");
m_tib_stacks.add("r+ts");
m_tib_stacks.add("r+ts+w");
m_tib_stacks.add("r+w");
m_tib_stacks.add("s+b");
m_tib_stacks.add("s+b+r");
m_tib_stacks.add("s+b+y");
m_tib_stacks.add("s+d");
m_tib_stacks.add("s+g");
m_tib_stacks.add("s+g+r");
m_tib_stacks.add("s+g+y");
m_tib_stacks.add("s+k");
m_tib_stacks.add("s+k+r");
m_tib_stacks.add("s+k+y");
m_tib_stacks.add("s+l");
m_tib_stacks.add("s+m");
m_tib_stacks.add("s+m+r");
m_tib_stacks.add("s+m+y");
m_tib_stacks.add("s+n");
m_tib_stacks.add("s+n+r");
m_tib_stacks.add("s+ng");
m_tib_stacks.add("s+ny");
m_tib_stacks.add("s+p");
m_tib_stacks.add("s+p+r");
m_tib_stacks.add("s+p+y");
m_tib_stacks.add("s+r");
m_tib_stacks.add("s+t");
m_tib_stacks.add("s+ts");
m_tib_stacks.add("s+w");
m_tib_stacks.add("sh+r");
m_tib_stacks.add("sh+w");
m_tib_stacks.add("t+r");
m_tib_stacks.add("t+w");
m_tib_stacks.add("th+r");
m_tib_stacks.add("ts+w");
m_tib_stacks.add("tsh+w");
m_tib_stacks.add("z+l");
m_tib_stacks.add("z+w");
m_tib_stacks.add("zh+w");

// a map used to split the input string into tokens for fromWylie().
// all letters which start tokens longer than one letter are mapped to the max length of
// tokens starting with that letter.  
var m_tokens_start = new newHashMap();
m_tokens_start.put('S', 2);
m_tokens_start.put('/', 2);
m_tokens_start.put('d', 4);
m_tokens_start.put('g', 3);
m_tokens_start.put('b', 3);
m_tokens_start.put('D', 3);
m_tokens_start.put('z', 2);
m_tokens_start.put('~', 3);
m_tokens_start.put('-', 4);
m_tokens_start.put('T', 2);
m_tokens_start.put('a', 2);
m_tokens_start.put('k', 2);
m_tokens_start.put('t', 3);
m_tokens_start.put('s', 2);
m_tokens_start.put('c', 2);
m_tokens_start.put('n', 2);
m_tokens_start.put('p', 2);
m_tokens_start.put('\r', 2);

// also for tokenization - a set of tokens longer than one letter
var m_tokens = new newHashSet();
m_tokens.add("-d+h");
m_tokens.add("dz+h");
m_tokens.add("-dh");
m_tokens.add("-sh");
m_tokens.add("-th");
m_tokens.add("D+h");
m_tokens.add("b+h");
m_tokens.add("d+h");
m_tokens.add("dzh");
m_tokens.add("g+h");
m_tokens.add("tsh");
m_tokens.add("~M`");
m_tokens.add("-I");
m_tokens.add("-d");
m_tokens.add("-i");
m_tokens.add("-n");
m_tokens.add("-t");
m_tokens.add("//");
m_tokens.add("Dh");
m_tokens.add("Sh");
m_tokens.add("Th");
m_tokens.add("ai");
m_tokens.add("au");
m_tokens.add("bh");
m_tokens.add("ch");
m_tokens.add("dh");
m_tokens.add("dz");
m_tokens.add("gh");
m_tokens.add("kh");
m_tokens.add("ng");
m_tokens.add("ny");
m_tokens.add("ph");
m_tokens.add("sh");
m_tokens.add("th");
m_tokens.add("ts");
m_tokens.add("zh");
m_tokens.add("~M");
m_tokens.add("~X");
m_tokens.add("\r\n");

// A class to encapsulate the return value of fromWylieOneStack.
var WylieStack = function() {
	this.uni_string = ''
	this.tokens_used = 0
	this.single_consonant = ''
	this.single_cons_a = ''
	this.warns = []
	this.visarga = false
	return this
}

// Looking from i onwards within tokens, returns as many consonants as it finds,
// up to and not including the next vowel or punctuation.  Skips the caret "^".
// Returns: a string of consonants joined by "+" signs.
function consonantString(tokens, i) { // strings, int
	var out = [];
	var t = '';
	while (tokens[i] != null) {
		t = tokens[i++];
		if (t == '+' || t == '^') continue;
		if (consonant(t) == null) break;
		out.push(t);
	}
	return out.join("+");
}

// Looking from i backwards within tokens, at most up to orig_i, returns as 
// many consonants as it finds, up to and not including the next vowel or
// punctuation.  Skips the caret "^".
// Returns: a string of consonants (in forward order) joined by "+" signs.
function consonantStringBackwards(tokens, i, orig_i) {
	var out = [];
	var t = '';
	while (i >= orig_i && tokens[i] != null) {
		t = tokens[i--];
		if (t == '+' || t == '^') continue;
		if (consonant(t) == null) break;
		out.unshift(t);
	}
	return out.join("+");
}

// A class to encapsulate the return value of fromWylieOneTsekbar.
var WylieTsekbar = function() {
	this.uni_string = ''
	this.tokens_used = 0
	this.warns = []
	return this
}
// A class to encapsulate an analyzed tibetan stack, while converting Unicode to Wylie.
var ToWylieStack = function() {
	this.top = ''
	this.stack = []
	this.caret = false
	this.vowels = []
	this.finals = []
	this.finals_found = newHashMap()
	this.visarga = false
	this.cons_str = ''
	this.single_cons = ''
	this.prefix = false
	this.suffix = false
	this.suff2 = false
	this.dot = false
	this.tokens_used = 0
	this.warns = []
	return this
}

// A class to encapsulate the return value of toWylieOneTsekbar.
var ToWylieTsekbar = function() {
	this.wylie = ''
	this.tokens_used = 0
	this.warns = []
	return this
}

// Converts successive stacks of Wylie into unicode, starting at the given index
// within the array of tokens. 
// 
// Assumes that the first available token is valid, and is either a vowel or a consonant.
// Returns a WylieTsekbar object
// HELPER CLASSES AND STRUCTURES
var State = { PREFIX: 0, MAIN: 1, SUFF1: 2, SUFF2: 3, NONE: 4 }
	// split a string into Wylie tokens; 
	// make sure there is room for at least one null element at the end of the array
var splitIntoTokens = function(str) {
	var tokens = [] // size = str.length + 2
	var i = 0;
	var maxlen = str.length;
	TOKEN:
	while (i < maxlen) {
		var c = str.charAt(i);
		var mlo = m_tokens_start.get(c);
		// if there are multi-char tokens starting with this char, try them
		if (mlo != null) {
			for (var len = mlo; len > 1; len--) {
				if (i <= maxlen - len) {
					var tr = str.substring(i, i + len);
					if (m_tokens.contains(tr)) {
						tokens.push(tr);
						i += len;
						continue TOKEN;
					}
				}
			}
		}
		// things starting with backslash are special
		if (c == '\\' && i <= maxlen - 2) {
			if (str.charAt(i + 1) == 'u' && i <= maxlen - 6) {
				tokens.push(str.substring(i, i + 6));		// \\uxxxx
				i += 6;
			} else if (str.charAt(i + 1) == 'U' && i <= maxlen - 10) {
				tokens.push(str.substring(i, i + 10));		// \\Uxxxxxxxx
				i += 10;
			} else {
				tokens.push(str.substring(i, i + 2));		// \\x
				i += 2;
			}
			continue TOKEN;
		}
		// otherwise just take one char
		tokens.push(c.toString());
		i += 1;
	}
	return tokens;
}

// helper functions to access the various hash tables
var consonant = function(s) { return m_consonant.get(s) }
var subjoined = function(s) { return m_subjoined.get(s) }
var vowel = function(s) { return m_vowel.get(s) }
var final_uni = function(s) { return m_final_uni.get(s) }
var final_class = function(s) { return m_final_class.get(s) }
var other = function(s) { return m_other.get(s) }
var isSpecial = function(s) { return m_special.contains(s) }
var isSuperscript = function(s) { return m_superscripts.containsKey(s) }
var superscript = function(sup, below) {
	var tmpSet = m_superscripts.get(sup);
	if (tmpSet == null) return false;
	return tmpSet.contains(below);
}
var isSubscript = function(s) { return m_subscripts.containsKey(s) }
var subscript = function(sub, above) {
	var tmpSet = m_subscripts.get(sub);
	if (tmpSet == null) return false;
	return tmpSet.contains(above);
}
var isPrefix = function(s) { return m_prefixes.containsKey(s) }
var prefix = function(pref, after) {
	var tmpSet = m_prefixes.get(pref);
	if (tmpSet == null) return false;
	return tmpSet.contains(after);
}
var isSuffix = function(s) { return m_suffixes.contains(s) }
var isSuff2 = function(s) { return m_suff2.containsKey(s) }
var suff2 = function(suff, before) {
	var tmpSet = m_suff2.get(suff);
	if (tmpSet == null) return false;
	return tmpSet.contains(before);
}
var ambiguous_key = function(syll) { return m_ambiguous_key.get(syll) }
var ambiguous_wylie = function(syll) { return m_ambiguous_wylie.get(syll) }
var tib_top = function(c) { return m_tib_top.get(c) }
var tib_subjoined = function(c) { return m_tib_subjoined.get(c) }
var tib_vowel = function(c) { return m_tib_vowel.get(c) }
var tib_vowel_long = function(s) { return m_tib_vowel_long.get(s) }
var tib_final_wylie = function(c) { return m_tib_final_wylie.get(c) }
var tib_final_class = function(c) { return m_tib_final_class.get(c) }
var tib_caret = function(s) { return m_tib_caret.get(s) }
var tib_other = function(c) { return m_tib_other.get(c) }
var tib_stack = function(s) { return m_tib_stacks.contains(s) }

// does this string consist of only hexadecimal digits?
function validHex(t) {
	for (var i = 0; i < t.length; i++) {
		var c = t.charAt(i);
		if (!((c >= 'a' && c <= 'f') || (c >= '0' && c <= '9'))) return false;
	}
	return true;
}

// generate a warning if we are keeping them; prints it out if we were asked to
// handle a Wylie unicode escape, \\uxxxx or \\Uxxxxxxxx
function unicodeEscape (warns, line, t) { // [], int, str
	var hex = t.substring(2);
	if (hex == '') return null;
	if (!validHex(hex)) {
		warnl(warns, line, "\"" + t + "\": invalid hex code.");
		return "";
	}
	return String.fromCharCode(parseInt(hex, 16))
}

function warn(warns, str) {
	if (warns != null) warns.push(str);
	if (opt.print_warnings) console.log(str);
}

// warn with line number
function warnl(warns, line, str) {
	warn(warns, "line " + line + ": " + str);
}

function fromWylieOneTsekbar(tokens, i) { // (str, int)
	var orig_i = i
	var t = tokens[i]
	// variables for tracking the state within the syllable as we parse it
	var stack = null
	var prev_cons = ''
	var visarga = false
	// variables for checking the root letter, after parsing a whole tsekbar made of only single
	// consonants and one consonant with "a" vowel
	var check_root = true
	var consonants = [] // strings
	var root_idx = -1
	var out = ''
	var warns = []
	// the type of token that we are expecting next in the input stream
	//   - PREFIX : expect a prefix consonant, or a main stack
	//   - MAIN   : expect only a main stack
	//   - SUFF1  : expect a 1st suffix 
	//   - SUFF2  : expect a 2nd suffix
	//   - NONE   : expect nothing (after a 2nd suffix)
	//
	// the state machine is actually more lenient than this, in that a "main stack" is allowed
	// to come at any moment, even after suffixes.  this is because such syllables are sometimes
	// found in abbreviations or other places.  basically what we check is that prefixes and 
	// suffixes go with what they are attached to.
	//
	// valid tsek-bars end in one of these states: SUFF1, SUFF2, NONE
	var state = State.PREFIX;

	// iterate over the stacks of a tsek-bar
	STACK:
	while (t != null && (vowel(t) != null || consonant(t) != null) && !visarga) {
		// translate a stack
		if (stack != null) prev_cons = stack.single_consonant;
		stack = fromWylieOneStack(tokens, i);
		i += stack.tokens_used;
		t = tokens[i];
		out += stack.uni_string;
		warns = warns.concat(stack.warns);
		visarga = stack.visarga;
		if (!opt.check) continue;
		// check for syllable structure consistency by iterating a simple state machine
		// - prefix consonant
		if (state == State.PREFIX && stack.single_consonant != null) {
			consonants.push(stack.single_consonant);
			if (isPrefix(stack.single_consonant)) {
			var next = t;
			if (opt.check_strict) next = consonantString(tokens, i);
			if (next != null && !prefix(stack.single_consonant, next)) {
				next = next.replace(/\+/g, "");
				warns.push("Prefix \"" + stack.single_consonant + "\" does not occur before \"" + next + "\".");
			}
		} else {
			warns.push("Invalid prefix consonant: \"" + stack.single_consonant + "\".");
		}
		state = State.MAIN;
		// - main stack with vowel or multiple consonants
		} else if (stack.single_consonant == null) {
		state = State.SUFF1;
		// keep track of the root consonant if it was a single cons with an "a" vowel
		if (root_idx >= 0) {
			check_root = false;
		} else if (stack.single_cons_a != null) {
			consonants.push(stack.single_cons_a);
			root_idx = consonants.length - 1;
		}
		// - unexpected single consonant after prefix
		} else if (state == State.MAIN) {
			warns.push("Expected vowel after \"" + stack.single_consonant + "\".");
			// - 1st suffix
		} else if (state == State.SUFF1) {
			consonants.push(stack.single_consonant);
			// check this one only in strict mode b/c it trips on lots of Skt stuff
			if (opt.check_strict) {
				if (!isSuffix(stack.single_consonant)) {
					warns.push("Invalid suffix consonant: \"" + stack.single_consonant + "\".");
				}
			}
			state = State.SUFF2;
			// - 2nd suffix
		} else if (state == State.SUFF2) {
			consonants.push(stack.single_consonant);
			if (isSuff2(stack.single_consonant)) {
				if (!suff2(stack.single_consonant, prev_cons)) {
					warns.push("Second suffix \"" + stack.single_consonant 
					+ "\" does not occur after \"" + prev_cons + "\".");
				}
			} else {
				warns.push("Invalid 2nd suffix consonant: \"" + stack.single_consonant  + "\".");
			}
			state = State.NONE;
			// - more crap after a 2nd suffix
		} else if (state == State.NONE) {
			warns.push("Cannot have another consonant \"" + stack.single_consonant + "\" after 2nd suffix.");
		}
	}

	if (state == State.MAIN && stack.single_consonant != null && isPrefix(stack.single_consonant)) {
	warns.push("Vowel expected after \"" + stack.single_consonant + "\".");
	}

	// check root consonant placement only if there were no warnings so far, and the syllable 
	// looks ambiguous.  not many checks are needed here because the previous state machine 
	// already takes care of most illegal combinations.
	if (opt.check && warns.length == 0 && check_root && root_idx >= 0) {
		// 2 letters where each could be prefix/suffix: root is 1st
		if (consonants.length == 2 && root_idx != 0 
		&& prefix(consonants[0], consonants[1]) && isSuffix(consonants[1]))
		{
			warns.push("Syllable should probably be \"" + consonants[0] + "a" + consonants[1] + "\".");

			// 3 letters where 1st can be prefix, 2nd can be postfix before "s" and last is "s":
			// use a lookup table as this is completely ambiguous.
		} else if (consonants.length == 3 && isPrefix(consonants[0]) &&
			suff2("s", consonants[1]) && consonants[2] == "s")
		{
			var cc = consonants.join("");
			cc = cc.replace(/\u2018/g, '\'');
			cc = cc.replace(/\u2019/g, '\'');	// typographical quotes
			var expect_key = ambiguous_key(cc);
	//		console.log('typeof expect_key', typeof expect_key)
			if (expect_key != null && expect_key != root_idx) {
				warns.push("Syllable should probably be \"" + ambiguous_wylie(cc) + "\".");
			}
		}
	}
	// return the stuff as a WylieTsekbar struct
	var ret = new WylieTsekbar();
	ret.uni_string = out;
	ret.tokens_used = i - orig_i;
	ret.warns = warns;
	return ret;
}

    // Converts one stack's worth of Wylie into unicode, starting at the given index
    // within the array of tokens.
    // Assumes that the first available token is valid, and is either a vowel or a consonant.
    // Returns a WylieStack object.
function fromWylieOneStack(tokens, i) {
	var orig_i = i
	var t = '', t2 = '', o = ''
	var out = ''
	var warns = []
	var consonants = 0		// how many consonants found
	var vowel_found = null; // any vowels (including a-chen)
	var vowel_sign = null; // any vowel signs (that go under or above the main stack)
	var single_consonant = null; // did we find just a single consonant?
	var plus = false;		// any explicit subjoining via '+'?
	var caret = 0;			// find any '^'?
	var final_found = new newHashMap(); // keep track of finals (H, M, etc) by class

	// do we have a superscript?
	t = tokens[i]
	t2 = tokens[i + 1]
	if (t2 != null && isSuperscript(t) && superscript(t, t2)) {
		if (opt.check_strict) {
			var next = consonantString(tokens, i + 1);
			if (!superscript(t, next)) {
				next = next.replace(/\+/g, '')
				warns.push("Superscript \"" + t + "\" does not occur above combination \"" + next + "\".");
			}
		}
		out += consonant(t);
		consonants++;
		i++;
		while (tokens[i] != null && tokens[i] == ("^")) { caret++; i++; }
	}
	// main consonant + stuff underneath.
	// this is usually executed just once, but the "+" subjoining operator makes it come back here
	MAIN: 
	while (true) {
		// main consonant (or a "a" after a "+")
		t = tokens[i];
		if (consonant(t) != null || (out.length > 0 && subjoined(t) != null)) {
			if (out.length > 0) {
				out += (subjoined(t));
			} else {
				out += (consonant(t));
			}
			i++;

			if (t == "a") {
				vowel_found = "a";
			} else {
				consonants++;
				single_consonant = t;
			}

			while (tokens[i] != null && tokens[i] == "^") {
				caret++;
				i++;
			}
			// subjoined: rata, yata, lata, wazur.  there can be up two subjoined letters in a stack.
			for (var z = 0; z < 2; z++) {
				t2 = tokens[i];
				if (t2 != null && isSubscript(t2)) {
					// lata does not occur below multiple consonants 
					// (otherwise we mess up "brla" = "b.r+la")
					if (t2 == "l" && consonants > 1) break;
					// full stack checking (disabled by "+")
					if (opt.check_strict && !plus) {
						var prev = consonantStringBackwards(tokens, i-1, orig_i);
						if (!subscript(t2, prev)) {
							prev = prev.replace(/\+/g, "");
							warns.push("Subjoined \"" + t2 + "\" not expected after \"" + prev + "\".");
						}
						// simple check only
					} else if (opt.check) {
						if (!subscript(t2, t) && !(z == 1 && t2 == ("w") && t == ("y"))) {
							warns.push("Subjoined \"" + t2 + "\"not expected after \"" + t + "\".");
						}
					}
					out += subjoined(t2);
					i++;
					consonants++;
					while (tokens[i] != null && tokens[i] == ("^")) { caret++; i++; }
					t = t2;
				} else {
					break;
				}
			}
		}

		// caret (^) can come anywhere in Wylie but in Unicode we generate it at the end of 
		// the stack but before vowels if it came there (seems to be what OpenOffice expects),
		// or at the very end of the stack if that's how it was in the Wylie.
		if (caret > 0) {
			if (caret > 1) {
				warns.push("Cannot have more than one \"^\" applied to the same stack.");
			}
			final_found.put(final_class("^"), "^");
			out += (final_uni("^"));
			caret = 0;
		}
		// vowel(s)
		t = tokens[i];
		if (t != null && vowel(t) != null) {
			if (out.length == 0) out += (vowel("a"));
			if (t != "a") out += (vowel(t));
			i++;
			vowel_found = t;
			if (t != "a") vowel_sign = t;
		}
		// plus sign: forces more subjoining
		t = tokens[i];
		if (t != null && t == ("+")) {
			i++;
			plus = true;
			// sanity check: next token must be vowel or subjoinable consonant.  
			t = tokens[i];
			if (t == null || (vowel(t) == null && subjoined(t) == null)) {
				if (opt.check) warns.push("Expected vowel or consonant after \"+\".");
				break MAIN;
			}
			// consonants after vowels doesn't make much sense but process it anyway
			if (opt.check) {
				if (vowel(t) == null && vowel_sign != null) {
					warns.push("Cannot subjoin consonant (" + t + ") after vowel (" + vowel_sign + ") in same stack.");
				} else if (t == ("a") && vowel_sign != null) {
					warns.push("Cannot subjoin a-chen (a) after vowel (" + vowel_sign + ") in same stack.");
				}
			}
			continue MAIN;
		}
		break MAIN;
	}
	// final tokens
	t = tokens[i];
	while (t != null && final_class(t) != null) {
		var uni = final_uni(t);
		var klass = final_class(t);
		// check for duplicates
		if (final_found.containsKey(klass)) {
			if (final_found.get(klass) == t) {
				warns.push("Cannot have two \"" + t + "\" applied to the same stack.");
			} else {
				warns.push("Cannot have \"" + t + "\" and \"" + final_found.get(klass)
					+ "\" applied to the same stack.");
			}
		} else {
			final_found.put(klass, t);
			out += (uni);
		}
		i++;
		single_consonant = null;
		t = tokens[i];
	}
	// if next is a dot "." (stack separator), skip it.
	if (tokens[i] != null && tokens[i] == (".")) i++;
	// if we had more than a consonant and no vowel, and no explicit "+" joining, backtrack and 
	// return the 1st consonant alone
	if (consonants > 1 && vowel_found == null) {
		if (plus) {
			if (opt.check) warns.push("Stack with multiple consonants should end with vowel.");
		} else {
			i = orig_i + 1;
			consonants = 1;
			single_consonant = tokens[orig_i];
			out = '';
			out += (consonant(single_consonant));
		}
	}
	// calculate "single consonant"
	if (consonants != 1 || plus) {
		single_consonant = null;
	}
	// return the stuff as a WylieStack struct
	var ret = new WylieStack();
	ret.uni_string = out;
	ret.tokens_used = i - orig_i;
	if (vowel_found != null) {
		ret.single_consonant = null;
	} else {
		ret.single_consonant = single_consonant;
	}

	if (vowel_found != null && vowel_found == ("a")) {
		ret.single_cons_a = single_consonant;
	} else {
		ret.single_cons_a = null;
	}
	ret.warns = warns;
	ret.visarga = final_found.containsKey("H");
	return ret;
}

	// Converts a Wylie (EWTS) string to unicode.  If 'warns' is not 'null', puts warnings into it.
function fromWylie(str, warns) {
		var out = '', line = 1, units = 0, i = 0
		if (opt.fix_spacing) { str = str.replace(/^\s+/, '') }
		var tokens = splitIntoTokens(str);
		ITER:while (tokens[i] != null) {
			var t = tokens[i], o = null
			// [non-tibetan text] : pass through, nesting brackets
			if (t == "[") {
				var nesting = 1;
				i++;
					ESC:while (tokens[i] != null) {
					t = tokens[i++];
					if (t == "[") nesting++;
					if (t == "]") nesting--;
					if (nesting == 0) continue ITER;
					// handle unicode escapes and \1-char escapes within [comments]...
					if (t.charAt(0) == '\\' && (t.charAt(1) == 'u' || t.charAt(1) == 'U')) {
						o = unicodeEscape(warns, line, t);
						if (o != null) {
							out += o;
							continue ESC;
						}
					}
					if (t.charAt(0) == '\\') {
						o = t.substring(1);
					} else {
						o = t;
					}
					out += o;
				}
				warnl(warns, line, "Unfinished [non-Wylie stuff].");
				break ITER;
			}
			// punctuation, numbers, etc
			o = other(t);
			if (o != null) {
				out += o;
				i++;
				units++;
				// collapse multiple spaces?
				if (t == " " && opt.fix_spacing) {
					while (tokens[i] != null && tokens[i] == " ") i++;
				}
				continue ITER;
			}
			// vowels & consonants: process tibetan script up to a tsek, punctuation or line noise
			if (vowel(t) != null || consonant(t) != null) {
				var tb = fromWylieOneTsekbar(tokens, i);
				var word = '';
				for (var j = 0; j < tb.tokens_used; j++) {
					word += (tokens[i+j]);
				}
				out += tb.uni_string;
				i += tb.tokens_used;
				units++;
				for (var w = 0; w < tb.warns.length; w++) {
					warnl(warns, line, "\"" + word + "\": " + tb.warns[w]);
				}
				continue ITER;
			}
			// *** misc unicode and line handling stuff ***
			// ignore BOM and zero-width space
			if (t == "\ufeff" || t == "\u200b") {
				i++;
				continue ITER;
			}
			// \\u, \\U unicode characters
			if (t.charAt(0) == '\\' && (t.charAt(1) == 'u' || t.charAt(1) == 'U')) {
				o = unicodeEscape(warns, line, t);
				if (o != null) {
					i++;
					out += o;
					continue ITER;
				}
			}
			// backslashed characters
			if (t.charAt(0) == '\\') {
				out += t.substring(1);
				i++;
				continue ITER;
			}
			// count lines
			if (t == "\r\n" || t == "\n" || t == "\r") {
				line++;
				out += t;
				i++;
				// also eat spaces after newlines (optional)
				if (opt.fix_spacing) {
					while (tokens[i] != null && tokens[i] == " ") i++;
				}
				continue ITER;
			}
			// stuff that shouldn't occur out of context: special chars and remaining [a-zA-Z]
			var c = t.charAt(0);
			if (isSpecial(t) || (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')) {
				warnl(warns, line, "Unexpected character \"" + t + "\".");
			}
			// anything else: pass through
			out += t;
			i++;
		}
		if (units == 0) warn(warns, "No Tibetan characters found!");
		return out
	}
	
	// given a character, return a string like "\\uxxxx", with its code in hex
function formatHex(t) { //char
		// not compatible with GWT...
		// return String.format("\\u%04x", (int)t);
		var sb = '';
		sb += '\\u';
		var s = t.charCodeAt(0).toString(16);
		for (var i = s.length; i < 4; i++) sb += '0';
		sb += s;
		return sb;
	}

	// handles spaces (if any) in the input stream, turning them into '_'.
	// this is abstracted out because in non-escaping mode, we only want to turn spaces into _
	// when they come in the middle of Tibetan script.
function handleSpaces(str, i, out) { //return int
	var found = 0;
	var orig_i = i;
	while (i < str.length && str.charAt(i) == ' ') {
		i++;
		found++;
	}
	if (found == 0 || i == str.length) return 0;
	var t = str.charAt(i);
	if (tib_top(t) == null && tib_other(t) == null) return 0;
	// found 'found' spaces between two tibetan bits; generate the same number of '_'s
	for (i = 0; i < found; i++) out += '_';
	return found;
}

// for space-handling in escaping mode: is the next thing coming (after a number of spaces)
// some non-tibetan bit, within the same line?
function followedByNonTibetan(str, i) {
	var len = str.length;
	while (i < len && str.charAt(i) == ' ') i++;
	if (i == len) return false;
	var t = str.charAt(i);
	return tib_top(t) == null && tib_other(t) == null && t != '\r' && t != '\n';
}

// Convert Unicode to Wylie: one tsekbar
function toWylieOneTsekbar(str, len, i) {
	var orig_i = i;
	var warns = [];
	var stacks = [];// ArrayList<ToWylieStack>;
	ITER: 
	while (true) {
		var st = toWylieOneStack(str, len, i);
		stacks.push(st);
		warns = warns.concat(st.warns);
		i += st.tokens_used;
		if (st.visarga) break ITER;
		if (i >= len || tib_top(str.charAt(i)) == null) break ITER;
	}
	// figure out if some of these stacks can be prefixes or suffixes (in which case
	// they don't need their "a" vowels)
	var last = stacks.length - 1;
	if (stacks.length > 1 && stacks[0].single_cons != null) {
		// we don't count the wazur in the root stack, for prefix checking
		var cs = stacks[1].cons_str.replace(/\+w/g, "")
		if (prefix(stacks[0].single_cons, cs)) stacks[0].prefix = true;
	}
	if (stacks.length > 1 && stacks[last].single_cons != null 
	&& isSuffix(stacks[last].single_cons)) {
		stacks[last].suffix = true;
	}
	if (stacks.length > 2 && stacks[last].single_cons != null 
	&& stacks[last - 1].single_cons != null
	&& isSuffix(stacks[last - 1].single_cons)
	&& suff2(stacks[last].single_cons, stacks[last - 1].single_cons)) {
		stacks[last].suff2 = true;
		stacks[last - 1].suffix = true;
	}
	// if there are two stacks and both can be prefix-suffix, then 1st is root
	if (stacks.length == 2 && stacks[0].prefix && stacks[1].suffix) {
	    stacks[0].prefix = false;
	}
	// if there are three stacks and they can be prefix, suffix and suff2, then check w/ a table
	if (stacks.length == 3 && stacks[0].prefix && stacks[1].suffix && stacks[2].suff2) {
		var strb = []
		for (var si = 0; si < stacks.length; si++) strb.push(stacks[si].single_cons)
		var ztr = strb.join('')
		var root = ambiguous_key(ztr)
		if (root == null) {
			warns.push("Ambiguous syllable found: root consonant not known for \"" + ztr + "\".")
			// make it up...  (ex. "mgas" for ma, ga, sa)
			root = 1
		}
		stacks[root].prefix = stacks[root].suffix = false
		stacks[root + 1].suff2 = false
	}
	// if the prefix together with the main stack could be mistaken for a single stack, add a "."
	if (stacks[0].prefix && tib_stack(stacks[0].single_cons + "+" + stacks[1].cons_str)) 
		stacks[0].dot = true;
	// put it all together
	var out = ''
	for (var si = 0; si < stacks.length; si++) out += putStackTogether(stacks[si])
	var ret = new ToWylieTsekbar();
	ret.wylie = out;
	ret.tokens_used = i - orig_i;
	ret.warns = warns;
	return ret;
}
	 
// Unicode to Wylie: one stack at a time
function toWylieOneStack(str, len, i) {
	var orig_i = i;
	var ffinal = null, vowel = null, klass = null;
	// split the stack into a ToWylieStack object:
	//   - top symbol
	//   - stacked signs (first is the top symbol again, then subscribed main characters...)
	//   - caret (did we find a stray tsa-phru or not?)
	//   - vowel signs (including small subscribed a-chung, "-i" Skt signs, etc)
	//   - final stuff (including anusvara, visarga, halanta...)
	//   - and some more variables to keep track of what has been found
	var st = new ToWylieStack();
	// assume: tib_top(t) exists
	var t = str.charAt(i++);
	st.top = tib_top(t);
	st.stack.push(tib_top(t));
	// grab everything else below the top sign and classify in various categories
	while (i < len) {
		t = str.charAt(i);
		var o;
		if ((o = tib_subjoined(t)) != null) {
			i++;
			st.stack.push(o);
			// check for bad ordering
			if (st.finals.length > 0) {
				st.warns.push("Subjoined sign \"" + o + "\" found after final sign \"" + ffinal + "\".");
			} else if (st.vowels.length > 0) {
				st.warns.push("Subjoined sign \"" + o + "\" found after vowel sign \"" + vowel + "\".");
			}
		} else if ((o = tib_vowel(t)) != null) {
			i++;
			st.vowels.push(o);
			if (vowel == null) vowel = o;
			// check for bad ordering
			if (st.finals.length > 0) {
				st.warns.push("Vowel sign \"" + o + "\" found after final sign \"" + ffinal + "\".");
			}
		} else if ((o = tib_final_wylie(t)) != null) {
			i++;
			klass = tib_final_class(t);
			if (o == "^") {
				st.caret = true;
			} else {
				if (o == "H") st.visarga = true;
				st.finals.push(o);
				if (ffinal == null) ffinal = o;
				// check for invalid combinations
				if (st.finals_found.containsKey(klass)) {
					st.warns.push("Final sign \"" + o 
					+ "\" should not combine with found after final sign \"" + ffinal + "\".");
				} else {
					st.finals_found.put(klass, o);
				}
			}
		} else break;
	}
	// now analyze the stack according to various rules
	// a-chen with vowel signs: remove the "a" and keep the vowel signs
	if (st.top == "a" && st.stack.length == 1 && st.vowels.length > 0) st.stack.shift();
	// handle long vowels: A+i becomes I, etc.
	if (st.vowels.length > 1 && st.vowels[0] == "A" && tib_vowel_long(st.vowels[1]) != null) {
		var l = tib_vowel_long(st.vowels[1]);
		st.vowels.shift();
		st.vowels.shift();
		st.vowels.unshift(l);
	}
	// special cases: "ph^" becomes "f", "b^" becomes "v"
	if (st.caret && st.stack.length == 1 && tib_caret(st.top) != null) {
		var l = tib_caret(st.top);
		st.top = l;
		st.stack.shift();
		st.stack.unshift(l);
		st.caret = false;
	}
	st.cons_str = st.stack.join("+");
	// if this is a single consonant, keep track of it (useful for prefix/suffix analysis)
	if (st.stack.length == 1 && st.stack[0] != ("a") && !st.caret 
	&& st.vowels.length == 0 && st.finals.length == 0) {
		st.single_cons = st.cons_str;
	}
	// return the analyzed stack
	st.tokens_used = i - orig_i;
	return st;
}

// Puts an analyzed stack together into Wylie output, adding an implicit "a" if needed.
function putStackTogether(st) {
	var out = '';
	// put the main elements together... stacked with "+" unless it's a regular stack
	if (tib_stack(st.cons_str)) {
	    out += st.stack.join("");
	} else out += (st.cons_str);
	// caret (tsa-phru) goes here as per some (halfway broken) Unicode specs...
	if (st.caret) out += ("^");
	// vowels...
	if (st.vowels.length > 0) {
		out += st.vowels.join("+");
	} else if (!st.prefix && !st.suffix && !st.suff2
	&& (st.cons_str.length == 0 || st.cons_str.charAt(st.cons_str.length - 1) != 'a')) {
		out += "a"
	}
	// final stuff
	out += st.finals.join("");
	if (st.dot) out += ".";
	return out;
}

	// Converts from Unicode strings to Wylie (EWTS) transliteration.
	//
	// Arguments are:
	//    str   : the unicode string to be converted
	//    escape: whether to escape non-tibetan characters according to Wylie encoding.
	//            if escape == false, anything that is not tibetan will be just passed through.
	//
	// Returns: the transliterated string.
	//
	// To get the warnings, call getWarnings() afterwards.

function toWylie(str, warns, escape) {
	if (escape == undefined) escape = true
	var out = ''
	var line = 1
	var units = 0
	// globally search and replace some deprecated pre-composed Sanskrit vowels
	str = str.replace(/\u0f76/g, "\u0fb2\u0f80")
	str = str.replace(/\u0f77/g, "\u0fb2\u0f71\u0f80")
	str = str.replace(/\u0f78/g, "\u0fb3\u0f80")
	str = str.replace(/\u0f79/g, "\u0fb3\u0f71\u0f80")
	str = str.replace(/\u0f81/g, "\u0f71\u0f80")
	var i = 0
	var len = str.length
	// iterate over the string, codepoint by codepoint
	ITER:
	while (i < len) {
		var t = str.charAt(i);
		// found tibetan script - handle one tsekbar
		if (tib_top(t) != null) {
			var tb = toWylieOneTsekbar(str, len, i);
			out += tb.wylie;
			i += tb.tokens_used;
			units++;
			for (var w = 0; w < tb.warns.length; w++) warnl(warns, line, tb.warns[w]);
			if (!escape) i += handleSpaces(str, i, out);
			continue ITER;
		}
		// punctuation and special stuff. spaces are tricky:
		// - in non-escaping mode: spaces are not turned to '_' here (handled by handleSpaces)
		// - in escaping mode: don't do spaces if there is non-tibetan coming, so they become part
		//   of the [escaped block].
		var o = tib_other(t);
		if (o != null && (t != ' ' || (escape && !followedByNonTibetan(str, i)))) {
			out += o;
			i++;
			units++;
			if (!escape) i += handleSpaces(str, i, out);
			continue ITER;
		}
		// newlines, count lines.  "\r\n" together count as one newline.
		if (t == '\r' || t == '\n') {
			line++;
			i++;
			out += t;
			if (t == '\r' && i < len && str.charAt(i) == '\n') {
				i++;
				out += ('\n');
			}
			continue ITER;
		}
		// ignore BOM and zero-width space
		if (t == '\ufeff' || t == '\u200b') {
			i++;
			continue ITER;
		}
		// anything else - pass along?
		if (!escape) {
			out += (t);
			i++;
			continue ITER;
		}
		// other characters in the tibetan plane, escape with \\u0fxx
		if (t >= '\u0f00' && t <= '\u0fff') {
			var c = formatHex(t);
			out += c;
			i++;
			// warn for tibetan codepoints that should appear only after a tib_top
			if (tib_subjoined(t) != null || tib_vowel(t) != null || tib_final_wylie(t) != null) {
				warnl(warns, line, "Tibetan sign " + c + " needs a top symbol to attach to.");
			}
			continue ITER;
		}
		// ... or escape according to Wylie:
		// put it in [comments], escaping [] sequences and closing at line ends
		out += "[";
		while (tib_top(t) == null && (tib_other(t) == null || t == ' ') && t != '\r' && t != '\n') {
			// \escape [opening and closing] brackets
			if (t == '[' || t == ']') {
				out += "\\";
				out += t;
			// unicode-escape anything in the tibetan plane (i.e characters not handled by Wylie)
			} else if (t >= '\u0f00' && t <= '\u0fff') {
				out += formatHex(t);
				// and just pass through anything else!
			} else {
				out += t;
			}
			if (++i >= len) break;
			t = str.charAt(i);
		}
		 out += "]";
	}
	return out;
}
module.exports= {
		fromWylie: fromWylie,
		toWylie: toWylie,
		setopt: setopt,
		getopt: function() { return opt },
}


},{}],"C:\\ksana2015\\node_modules\\ksana-inputmethod\\romanized\\itrans.js":[function(require,module,exports){
var map={
	"A":"ā",
	"I":"ī",
	"U":"ū",
	"M":"ṃ",
	"N":"m̐",
	"H":"ḥ",
	"T":"ṭ",
	"D":"ḍ",
	"N":"ṇ",
	"S":"ṣ",
	"L":"ḻ",
	"x":"kṣ",
	"|":"।"

}
var convert=function(s) {
	var i=0,o="";
	while (i<s.length) {
		var c=s[i],n=s[i+1];
		var m=map[c];
		if (!m) {
			if (c==="a" && n==="a") {
				o+="ā"; i++;
			} else if (c==="i" && n==="i"){
				o+="I"; i++;
			} else if (c==="u" && n==="u"){
				o+="ū"; i++;
			} else if (c==="." && n==="m"){
				o+="ṃ"; i++;
			} else if (c==="." && n==="m"){
				o+="ṃ"; i++;
			} else if (c==="R" && (n==="R"||n==="^") ){
				var t=s[i+2];
				if (t==="i") {
					o+="ṛ";	i+=2;
				} else if (t==="I") {
					o+="ṝ";	i+=2;
				} else 	{o+=c;}
			} else if (c==="L" && (n==="L"||n==="^") ){
				var t=s[i+2];
				if (t==="i") {
					o+="ḷ";	i+=2;
				} else if (t==="I") {
					o+="ḹ";	i+=2;
				} else 	{o+=c;}
			} else if (c==="N" && n==="^") {
				o+="ṅ";
				i++;
			} else if (c==="~"&& n==="N") {
				o+="ṅ";
				i++;
			} else if (c==="~"&& n==="n") {
				o+="ñ";
				i++;
			} else if (c==="J"&& n==="N") {
				o+="ñ";
				i++;
			} else if (c==="s"&& n==="h") {
				o+="ś";
				i++;
			} else if (c==="s"&& n==="h") {
				o+="ś";
				i++;
			} else if (c==="|"&& n==="|") {
				o+="॥";
				i++;
			} else  		{o+=c;}
		} else {
			o+=m;
		}
		i++;
	}
	return o;
}
var isValid=function(s) {
	return true;
}
module.exports={convert:convert,isValid:isValid}
},{}],"C:\\ksana2015\\node_modules\\ksana2015-treetoc\\addnode.js":[function(require,module,exports){
var React=require("react");
var E=React.createElement;
var styles={
	textarea:{fontSize:"100%"}
}
var linecount=function(t) {
	var lcount=0;
	t.replace(/\n/g,function(){
		lcount++;
	})
	return lcount+2;
}
var AddNode=React.createClass({
	propTypes:{
		action: React.PropTypes.func.isRequired
	}
	,addingkeydown:function(e) {
		var t=e.target.value;
		if (e.key=="Enter" && t.charCodeAt(t.length-1)===10) {
			this.props.action("addnode",t.split("\n"),this.props.insertBefore);
		}
		var lc=linecount(t);
		e.target.rows=lc;
	}
	,componentDidMount:function() {
		this.refs.adding.focus();
	}
	,render:function(){
		return E("div", {}, 
			E("textarea",
				{style:styles.textarea,onKeyDown:this.addingkeydown,ref:"adding"
				 ,placeholder:"leading space to create child node",defaultValue:""}
		));
	}

})

module.exports=AddNode;
},{"react":"react"}],"C:\\ksana2015\\node_modules\\ksana2015-treetoc\\controls.js":[function(require,module,exports){
var React=require("react");
var E=React.createElement;

var Controls=React.createClass({
	propTypes:{
		enabled:React.PropTypes.array.isRequired
		,action:React.PropTypes.func.isRequired
	}
	,getDefaultProps:function(){
		return {enabled:[]};
	}
	,enb:function(name) {
		return this.props.enabled.indexOf(name)===-1;		
	}
	,act:function(name) {
		var that=this;
		return function(e){
			that.props.action(name,e.ctrlKey);
		}
	}
	,render:function() {
		return E("span",{},
			E("button" ,{onClick:this.act("addingnode"),title:"Create a new node below, press Ctrl to above here."},"＋"),
			E("button" ,{style:{visibility:"hidden"}}," "),
			E("button" ,{onClick:this.act("levelup"),title:"level -1",disabled:this.enb("levelup")},"⇠"),
			E("button" ,{onClick:this.act("leveldown"),title:"level +1",disabled:this.enb("leveldown")},"⇢")
		);
	}
})

module.exports=Controls;
},{"react":"react"}],"C:\\ksana2015\\node_modules\\ksana2015-treetoc\\index.js":[function(require,module,exports){
/*
   toc data format
   array of { d:depth, o:opened, t:text, n:next_same_level ]

   only first level can be 0

   TODO, do not write directly to props.toc
*/
var React=require("react");
var TreeNode=require("./treenode");
var E=React.createElement;
var manipulate=require("./manipulate");

var buildToc = function(toc) {
	if (!toc || !toc.length || toc.built) return;
	var depths=[];
 	var prev=0;
 	if (toc.length>1) {
 		toc[0].o=true;//opened
 	}
 	for (var i=0;i<toc.length;i++) delete toc[i].n;
	for (var i=0;i<toc.length;i++) {
	    var depth=toc[i].d||toc[i].depth;
	    if (prev>depth) { //link to prev sibling
	      if (depths[depth]) toc[depths[depth]].n = i;
	      for (var j=depth;j<prev;j++) depths[j]=0;
	    }
    	depths[depth]=i;
    	prev=depth;
	}
	toc.built=true;
	return toc;
}
var genToc=function(toc,title) {
    var out=[{depth:0,text:title||ksana.js.title}];
    if (toc.texts) for (var i=0;i<toc.texts.length;i++) {
      out.push({t:toc.texts[i],d:toc.depths[i], vpos:toc.vpos[i]});
    }
    return out;
}

var TreeToc=React.createClass({
	propTypes:{
		toc:React.PropTypes.array.isRequired  //core toc dataset
		,opts:React.PropTypes.object    
		,onSelect:React.PropTypes.func  //user select a treenode
		,tocid:React.PropTypes.string  //toc view 
		,styles:React.PropTypes.object //custom styles
	}
	,getInitialState:function(){
		return {editcaption:-1,selected:[]};
	}
	,clearHits:function() {
		for (var i=0;i<this.props.toc;i++) {
			if (this.props.toc[i].hit) delete this.props.toc[i].hit;
		}
	}
	,componentDidMount:function() {
		buildToc(this.props.toc);
	}
	,componentWillReceiveProps:function(nextProps) {
		if (nextProps.toc && !nextProps.toc.built) {
			buildToc(nextProps.toc);
		}
		if (nextProps.hits!==this.props.hits) {
			this.clearHits();
		}
		this.action("updateall");
	}
	,getDefaultProps:function() {
		return {opts:{}};
	}
	,markDirty:function() {
		this.props.onChanged&&this.props.onChanged();
	}
	,action:function() {
		var args=Array.prototype.slice.apply(arguments);
		var act=args.shift();
		var p1=args[0];
		var p2=args[1];
		var sels=this.state.selected;
		var toc=this.props.toc;
		var r=false;
		if (act==="updateall") {
			this.setState({editcaption:-1,deleting:-1});
		} else if (act==="editcaption") {
			var n=parseInt(p1);
			this.setState({editcaption:n,selected:[n]});
		} else if (act==="deleting") {
			this.setState({deleting:this.state.editcaption});
		} else if (act==="changecaption") {
			if (!this.state.editcaption===-1) return;
			if (!p1) {
				this.action("deleting");
			} else {
				this.props.toc[this.state.editcaption].t=p1;
				this.setState({editcaption:-1});
				this.markDirty();
			}
		} else if (act==="select") {
			var selected=this.state.selected;
			if (!(this.props.opts.multiselect && p2)) {
				selected=[];
			}
			var n=parseInt(p1);
			if (!isNaN(n)) {
				selected.push(n);
				this.props.onSelect&&this.props.onSelect(this.props.tocid,this.props.toc[n],n,this.props.toc);
			}
			this.setState({selected:selected,editcaption:-1,deleting:-1,adding:0});
		} else if (act==="addingnode") {
			var insertAt=sels[0];
			if (p1) {
				insertAt=-insertAt; //ctrl pressed insert before
			}
			this.setState({adding:insertAt,editcaption:-1});
		} else if (act=="addnode") {
			var n=this.state.selected[0];
			r=manipulate.addNode(toc,n,p1,p2)
		}else if (act==="levelup") r=manipulate.levelUp(sels,toc);
		else if (act==="leveldown") r=manipulate.levelDown(sels,toc);
		else if (act==="deletenode") r=manipulate.deleteNode(sels,toc);
		else if (act==="hitclick") {
			this.props.onHitClick&&this.props.onHitClick(this.props.tocid,this.props.toc[p1],p1,this.props.toc);
		}
		if (r) {
			toc.built=false;//force rebuild
			buildToc(toc);
			this.setState({editcaption:-1,deleting:-1,adding:0});
			if (act==="deletenode") this.setState({selected:[]});
			this.markDirty();
		}
	}
	,render:function() {
		return E("div",{},
			E(TreeNode,{toc:this.props.toc,
				editcaption:this.state.editcaption,
				deleting:this.state.deleting,
				selected:this.state.selected,
				styles:this.props.styles,
				adding:this.state.adding,
				action:this.action,opts:this.props.opts,cur:0,
				hits:this.props.hits}));
	}
})
module.exports={Component:TreeToc,genToc:genToc,buildToc:buildToc};

},{"./manipulate":"C:\\ksana2015\\node_modules\\ksana2015-treetoc\\manipulate.js","./treenode":"C:\\ksana2015\\node_modules\\ksana2015-treetoc\\treenode.js","react":"react"}],"C:\\ksana2015\\node_modules\\ksana2015-treetoc\\manipulate.js":[function(require,module,exports){
var descendantOf=function(n,toc) { /* returning all descendants */
	var d=toc[n].d;
	n++;
	while (n<toc.length) {
		if (toc[n].d<=d) return n;
		n++;
	}
	return toc.length-1;
}
var levelUp =function(sels,toc) { //move select node and descendants one level up
	if (!canLevelup(sels,toc))return;
	var n=sels[0];
	var cur=toc[n];
	var next=toc[n+1];
	var nextsib=cur.n||descendantOf(n,toc);
	if (next && next.d>cur.d) { //has child
		for (var i=n+1;i<nextsib;i++) {
			toc[i].d--;
		}
	}
	cur.d--;
	cur.o=true;//force open this node , so that sibling is visible
	return true;
}
var levelDown =function(sels,toc) {
	if (!canLeveldown(sels,toc))return; //move select node descendants one level down
	var n=sels[0];
	var cur=toc[n];
	var next=toc[n+1];

	//force open previous node as it becomes parent of this node
	var p=prevSibling(n,toc);
	if (p) toc[p].o=true;

	if (!cur.o) { //do no move descendants if opened
		if (next && next.d>cur.d) { //has child
			for (var i=n+1;i<cur.n;i++) {
				toc[i].d++;
			}
		}		
	}
	cur.d++;
	return true;
}
var parseDepth=function(s,basedepth,dnow) {
	var d=0;
	
	while (s[0]===" ") {
		s=s.substr(1);
		d++;
	}
	if (basedepth+d>dnow+1) d=dnow+1-basedepth;

	return {d:basedepth+d,t:s.trim()};
}
var addNode =function(toc,n,newnodes,insertbefore) {
	var d=toc[n].d, basedepth=d, dnow=d;
	if (!insertbefore) {
		//toc[n].o=true;
		if (toc[n].n)	n=toc[n].n ;
		else (n++);
	}
	

	var args=[n,0];

	for (var i=0;i<newnodes.length;i++) {
		var r=parseDepth(newnodes[i],basedepth,dnow);
		if (r.t) {
			args.push(r);
			dnow=r.d;
		}
	}
	toc.splice.apply(toc,args);
	return true;
}
var deleteNode =function(sels,toc) {
	if (!canDeleteNode(sels,toc))return; //move select node descendants one level down
	var n=sels[0];
	var to=descendantOf(n,toc);
	var del=to-n;
	if (n==toc.length-1) del++;
	toc.splice(n,del);
	return true;
}

var canDeleteNode=function(sels,toc) {
	if (sels.length==0) return false;
	var n=sels[0];
	return (sels.length==1 && toc[n].d>0 && toc.length>2);
}
var canLevelup=function(sels,toc) {
	if (sels.length==0) return false;
	var n=sels[0];
	return (sels.length==1 && toc[n].d>1);
}
var prevSibling=function(n,toc) {
	var p=n-1;
	var d=toc[n].d;
	while (p>0) {
		if (toc[p].d<d) return 0;
		if (toc[p].d==d) return p;
		p--;
	}
}
var canLeveldown=function(sels,toc) {
	if (sels.length==0) return false;
	var n=sels[0];
	return (sels.length==1 && prevSibling(n,toc));
}
var enabled=function(sels,toc) {
	var enabled=[];
	if (canLeveldown(sels,toc)) enabled.push("leveldown");
	if (canLevelup(sels,toc)) enabled.push("levelup");
	if (canDeleteNode(sels,toc)) enabled.push("deletenode");
	return enabled;
}
module.exports={enabled:enabled,levelUp:levelUp,levelDown:levelDown,
	addNode:addNode,deleteNode:deleteNode,descendantOf:descendantOf};
},{}],"C:\\ksana2015\\node_modules\\ksana2015-treetoc\\treenode.js":[function(require,module,exports){
var React=require("react");
var E=React.createElement;

var manipulate=require("./manipulate");
var Controls=require("./controls");
var AddNode=require("./addnode");
var treenodehits=require("./treenodehits");
var defaultstyles={
	selectedcaption:{borderBottom:"1px solid blue",cursor:"pointer",background:"highlight",borderRadius:"5px"}
	,caption:{cursor:"pointer"}
	,childnode:{left:"15px",position:"relative"}
	,rootnode:{position:"relative"}
	,folderbutton: {cursor:"pointer",borderRadius:"50%"}
	,closed:{cursor:"pointer",fontSize:"75%"}
	,opened:{cursor:"pointer",fontSize:"75%"}	
	,leaf:{fontSize:"75%"}	
	,hiddenleaf:{visibility:"hidden"}	
	,deletebutton:{background:"red",color:"yellow"}
	,nodelink:{fontSize:"65%",cursor:"pointer"}
	,hit:{color:"pink",fontSize:"65%",cursor:"pointer"}
	,input:{fontSize:"100%"}
};
var styles={};

var TreeNode=React.createClass({
	propTypes:{
		toc:React.PropTypes.array.isRequired
		,opts:React.PropTypes.object
		,action:React.PropTypes.func.isRequired 
		,selected:React.PropTypes.array         //selected treenode (multiple)
		,cur:React.PropTypes.number.isRequired //current active treenode
		,styles:React.PropTypes.object  //custom style
	}
	,getDefaultProps:function() {
		return {cur:0,opts:{},toc:[]};
	}
	,componentWillMount:function(){
		this.cloneStyle();
	}
	,click:function(e) {
		var n=parseInt(e.target.parentElement.attributes['data-n'].value);
		this.props.toc[n].o=!this.props.toc[n].o;
		this.forceUpdate();
		e.preventDefault();
    e.stopPropagation();
	}
	,select:function(e){
		if (e.target.nodeName!=="SPAN") return;
		var datan=e.target.parentElement.attributes['data-n'];
		if (!datan) return;
		var n=parseInt(datan.value);
		var selected=this.props.selected.indexOf(n)>-1;
		if (selected && this.props.opts.editable) {
			this.props.action("editcaption",n);
		} else {
			this.props.action("select",n,e.ctrlKey);
		}
		e.preventDefault();
    e.stopPropagation();
	}
	,cloneStyle:function(newstyles) {
		styles={};
		for (var i in defaultstyles) styles[i]=defaultstyles[i];
		if (newstyles) for (var i in newstyles) styles[i]=newstyles[i];
	}

	,componentWillReceiveProps:function(nextProps) {
		if (nextProps.styles && nextProps.styles!==this.props.styles) this.cloneStyle(nextProps.styles)
	}
	,componentDidUpdate:function() {
		if (this.refs.editcaption) {
			var dom=this.refs.editcaption;
			dom.focus();
			dom.selectionStart=dom.value.length;
		}
	}
	,oninput:function(e) {
		var size=e.target.value.length+2;;
		if (size<5) size=5;
		e.target.size=size;
	}

	,editingkeydown:function(e) {
		if (e.key=="Enter") {
			this.props.action("changecaption",e.target.value);	
			e.stopPropagation();
		} else this.oninput(e);
	}
	,deleteNodes:function() {
		this.props.action("deletenode");
	}
	,renderDeleteButton:function(n) {
		var childnode=null;
		var children=manipulate.descendantOf(n,this.props.toc);
		if (children>n+1) childnode=E("span",{}," "+(children-n)+" nodes");
		var out=E("button",{onClick:this.deleteNodes,style:styles.deletebutton},"Delete",childnode);
		return out;
	}
	,mouseenter:function(e) {
		e.target.style.background="highlight";
		e.target.style.oldcolor=e.target.style.color;
		e.target.style.color="HighlightText";
		var t=e.target.innerHTML;
		if (t==="＋"||t==="－") e.target.style.borderRadius="50%";
		else e.target.style.borderRadius="5px";
	}
	,mouseleave:function(e) {
		e.target.style.background="none";
		e.target.style.color=e.target.style.oldcolor;
	}
	,renderFolderButton:function(n) {
		var next=this.props.toc[n+1];
		var cur=this.props.toc[n];
		var folderbutton=null;
		var props={style:styles.closed, onClick:this.click, onMouseEnter:this.mouseenter,onMouseLeave:this.mouseleave};
		if (cur.o) props.style=styles.opened;
		if (next && next.d>cur.d) { 
			if (cur.o) folderbutton=E("a",props,"－");//"▼"
			else       folderbutton=E("a",props,"＋");//"▷"
		} else {
			folderbutton=E("a",{ style:styles.hiddenleaf},"　");
		}
		return folderbutton;
	}
	,renderCaption:function(n) {
		var cur=this.props.toc[n];
		var stylename="caption";
		if (this.props.selected.indexOf(n)>-1) stylename="selectedcaption";
		var caption=null;
		if (this.props.deleting===n) {
			caption=this.renderDeleteButton(n);
		} else if (this.props.editcaption===n) {
			var size=cur.t.length+2;
			if (size<5) size=5;
			caption=E("input",{onKeyDown:this.editingkeydown,style:styles.input,
				               size:size,ref:"editcaption",defaultValue:cur.t});
		} else {
			caption=E("span",{onMouseEnter:this.mouseenter,onMouseLeave:this.mouseleave
				,style:styles[stylename],title:n},cur.t+(cur.o?" ":""));
			//force caption to repaint by appending extra space at the end
		}
		return caption;
	}
	,renderAddingNode:function(n,above) {
		if (this.props.adding===n && n) { 
			return E(AddNode,{insertBefore:above,action:this.props.action});
		}
	}
	,renderEditControls:function(n) {
		if (!this.props.opts.editable) return;
		if (this.props.editcaption===n && n>0) {	
			var enabled=manipulate.enabled([n],this.props.toc);
			return E(Controls,{action:this.props.action,enabled:enabled});
		} 
	}
	,renderItem:function(e,idx){
		var t=this.props.toc[e];
		var props={};
		for (var i in this.props) {
			props[i]=this.props[i];
		}
		var opened=t.o?"o":"";
		props.key="k"+e;
		props.cur=e;
		return E(TreeNode,props);
	}
	,clickhit:function(e) {
		var n=parseInt(e.target.dataset.n);
		this.props.action("hitclick",n);
		e.preventDefault();
		e.stopPropagation();
	}
	,renderHit:function(hit,n) {
		if (!hit) return;
		return E("span",{onClick:this.clickhit,style:styles.hit,"data-n":n,
			onMouseEnter:this.mouseenter,onMouseLeave:this.mouseleave},hit);
	}
	,render:function() {
		if (this.props.toc.length===0) return E("span",{},"");
		var n=this.props.cur;
		var cur=this.props.toc[n];
		var stylename="childnode",children=[];
		var selected=this.props.selected.indexOf(n)>-1;
		var depthdeco=renderDepth(cur.d,this.props.opts)
		if (cur.d==0) stylename="rootnode";
		var adding_before_controls=this.renderAddingNode(-n,true);
		var adding_after_controls=this.renderAddingNode(n);
		var editcontrols=this.renderEditControls(n);
		var folderbutton=this.renderFolderButton(n);
		var caption=this.renderCaption(n);

		if (cur.o) children=enumChildren(this.props.toc,n);

		var extracomponent=this.props.opts.onNode&& this.props.opts.onNode(cur,selected,n,this.props.editcaption);
		if (this.props.deleting>-1) extracomponent=null;
		if (this.props.deleting>-1) editcontrols=null;
		var hits=treenodehits(this.props.toc,this.props.hits,n);

		return E("div",{onClick:this.select,"data-n":n,style:styles[stylename]},

			   adding_before_controls,
			   folderbutton,depthdeco,
			   editcontrols,
			   caption,
			   this.renderHit(hits,n),
			   extracomponent,
			   adding_after_controls,
			   children.map(this.renderItem));
	}
});

var ganzhi="　甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥";

var renderDepth=function(depth,opts) {
  var out=[];
  if (opts&&opts.tocstyle=="ganzhi") {
    return E("span", null, ganzhi[depth].trim()+" ");
  } else {
    if (opts&&opts.numberDepth && depth) return E("span", null, depth, ".")
    else return null;
  }
  return null;
};


var enumChildren=function(toc,cur) {
    var children=[];
    if (!toc || !toc.length || toc.length==1) return children;
    thisdepth=toc[cur].d||toc[cur].depth;
    if (cur==0) thisdepth=0;
    if (cur+1>=toc.length) return children;
    if ((toc[cur+1].d||toc[cur+1].depth)!= 1+thisdepth) {
    	return children;  // no children node
    }
    var n=cur+1;
    var child=toc[n];
    
    while (child) {
      children.push(n);
      var next=toc[n+1];
      if (!next) break;
      if ((next.d||next.depth)==(child.d||child.depth)) {
        n++;
      } else if ((next.d||next.depth)>(child.d||child.depth)) {
        n=child.n||child.next;
      } else break;
      if (n) child=toc[n];else break;
    }
    return children;
}
module.exports=TreeNode;
},{"./addnode":"C:\\ksana2015\\node_modules\\ksana2015-treetoc\\addnode.js","./controls":"C:\\ksana2015\\node_modules\\ksana2015-treetoc\\controls.js","./manipulate":"C:\\ksana2015\\node_modules\\ksana2015-treetoc\\manipulate.js","./treenodehits":"C:\\ksana2015\\node_modules\\ksana2015-treetoc\\treenodehits.js","react":"react"}],"C:\\ksana2015\\node_modules\\ksana2015-treetoc\\treenodehits.js":[function(require,module,exports){
var rangeOfTreeNode=function(toc,n) {
  //setting the ending vpos of a treenode
  //this value is fixed when hits is changed, but not saved in kdb
  if (typeof toc[n].end!=="undefined") return;

  if (n+1>=toc.length) {
    return;
  }
  var depth=toc[n].d , nextdepth=toc[n+1].d;
  if (n==toc.length-1 || n==0) {
      toc[n].end=Math.pow(2, 48);
      return;
  } else  if (nextdepth>depth){
    if (toc[n].n) {
      toc[n].end= toc[toc[n].n].vpos || Number.MAX_VALUE;  
    } else { //last sibling
      var next=n+1;
      while (next<toc.length && toc[next].d>depth) next++;
      if (next==toc.length) toc[n].end=Math.pow(2,48);
      else toc[n].end=toc[next].voff;
    }
  } else { //same level or end of sibling
    toc[n].end=toc[n+1].vpos;
  }
}
var calculateHit=function(toc,hits,n) {

  var start=toc[n].vpos;
  var end=toc[n].end;
  if (n==0) {
    return hits.length;
  } else {
    var hit=0;
    for (var i=0;i<hits.length;i++) {
      if (hits[i]>=start && hits[i]<end) hit++;
    }
    return hit;
  }
}

var treenodehits=function(toc,hits,n) {
  if (!hits || !hits.length) return 0;

  if (toc.length<2) return 0 ;

  //need to clear toc[n].hit when hits is changed.
  //see index.js clearHits()
  if (typeof toc[n].hit!=="undefined") return toc[n].hit;

  rangeOfTreeNode(toc,n);

  return toc[n].hit=calculateHit(toc,hits,n);
}

module.exports=treenodehits;
},{}],"C:\\ksana2015\\node_modules\\react-addons-pure-render-mixin\\index.js":[function(require,module,exports){
module.exports = require('react/lib/ReactComponentWithPureRenderMixin');
},{"react/lib/ReactComponentWithPureRenderMixin":"C:\\ksana2015\\node_modules\\react\\lib\\ReactComponentWithPureRenderMixin.js"}],"C:\\ksana2015\\node_modules\\react-tabs\\lib\\components\\Tab.js":[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function syncNodeAttributes(node, props) {
  if (props.selected) {
    node.setAttribute('tabindex', 0);
    node.setAttribute('selected', 'selected');
    if (props.focus) {
      node.focus();
    }
  } else {
    node.removeAttribute('tabindex');
    node.removeAttribute('selected');
  }
}

module.exports = _react2['default'].createClass({
  displayName: 'Tab',

  propTypes: {
    className: _react.PropTypes.string,
    id: _react.PropTypes.string,
    selected: _react.PropTypes.bool,
    disabled: _react.PropTypes.bool,
    panelId: _react.PropTypes.string,
    children: _react.PropTypes.oneOfType([_react.PropTypes.array, _react.PropTypes.object, _react.PropTypes.string])
  },

  getDefaultProps: function getDefaultProps() {
    return {
      focus: false,
      selected: false,
      id: null,
      panelId: null
    };
  },

  componentDidMount: function componentDidMount() {
    syncNodeAttributes((0, _reactDom.findDOMNode)(this), this.props);
  },

  componentDidUpdate: function componentDidUpdate() {
    syncNodeAttributes((0, _reactDom.findDOMNode)(this), this.props);
  },

  render: function render() {
    return _react2['default'].createElement(
      'li',
      {
        className: (0, _classnames2['default'])('ReactTabs__Tab', this.props.className, {
          'ReactTabs__Tab--selected': this.props.selected,
          'ReactTabs__Tab--disabled': this.props.disabled
        }),
        role: 'tab',
        id: this.props.id,
        'aria-selected': this.props.selected ? 'true' : 'false',
        'aria-expanded': this.props.selected ? 'true' : 'false',
        'aria-disabled': this.props.disabled ? 'true' : 'false',
        'aria-controls': this.props.panelId
      },
      this.props.children
    );
  }
});
},{"classnames":"C:\\ksana2015\\node_modules\\react-tabs\\node_modules\\classnames\\index.js","react":"react","react-dom":"react-dom"}],"C:\\ksana2015\\node_modules\\react-tabs\\lib\\components\\TabList.js":[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

module.exports = _react2['default'].createClass({
  displayName: 'TabList',

  propTypes: {
    className: _react.PropTypes.string,
    children: _react.PropTypes.oneOfType([_react.PropTypes.object, _react.PropTypes.array])
  },

  render: function render() {
    return _react2['default'].createElement(
      'ul',
      {
        className: (0, _classnames2['default'])('ReactTabs__TabList', this.props.className),
        role: 'tablist'
      },
      this.props.children
    );
  }
});
},{"classnames":"C:\\ksana2015\\node_modules\\react-tabs\\node_modules\\classnames\\index.js","react":"react"}],"C:\\ksana2015\\node_modules\\react-tabs\\lib\\components\\TabPanel.js":[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

module.exports = _react2['default'].createClass({
  displayName: 'TabPanel',

  propTypes: {
    className: _react.PropTypes.string,
    selected: _react.PropTypes.bool,
    id: _react.PropTypes.string,
    tabId: _react.PropTypes.string,
    children: _react.PropTypes.oneOfType([_react.PropTypes.array, _react.PropTypes.object, _react.PropTypes.string])
  },

  contextTypes: {
    forceRenderTabPanel: _react.PropTypes.bool
  },

  getDefaultProps: function getDefaultProps() {
    return {
      selected: false,
      id: null,
      tabId: null
    };
  },

  render: function render() {
    var children = this.context.forceRenderTabPanel || this.props.selected ? this.props.children : null;

    return _react2['default'].createElement(
      'div',
      {
        className: (0, _classnames2['default'])('ReactTabs__TabPanel', this.props.className, {
          'ReactTabs__TabPanel--selected': this.props.selected
        }),
        role: 'tabpanel',
        id: this.props.id,
        'aria-labeledby': this.props.tabId,
        style: { display: this.props.selected ? null : 'none' }
      },
      children
    );
  }
});
},{"classnames":"C:\\ksana2015\\node_modules\\react-tabs\\node_modules\\classnames\\index.js","react":"react"}],"C:\\ksana2015\\node_modules\\react-tabs\\lib\\components\\Tabs.js":[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _jsStylesheet = require('js-stylesheet');

var _jsStylesheet2 = _interopRequireDefault(_jsStylesheet);

var _helpersUuid = require('../helpers/uuid');

var _helpersUuid2 = _interopRequireDefault(_helpersUuid);

var _helpersChildrenPropType = require('../helpers/childrenPropType');

var _helpersChildrenPropType2 = _interopRequireDefault(_helpersChildrenPropType);

// Determine if a node from event.target is a Tab element
function isTabNode(node) {
  return node.nodeName === 'LI' && node.getAttribute('role') === 'tab';
}

// Determine if a tab node is disabled
function isTabDisabled(node) {
  return node.getAttribute('aria-disabled') === 'true';
}

var useDefaultStyles = true;

module.exports = _react2['default'].createClass({
  displayName: 'Tabs',

  propTypes: {
    className: _react.PropTypes.string,
    selectedIndex: _react.PropTypes.number,
    onSelect: _react.PropTypes.func,
    focus: _react.PropTypes.bool,
    children: _helpersChildrenPropType2['default'],
    forceRenderTabPanel: _react.PropTypes.bool
  },

  childContextTypes: {
    forceRenderTabPanel: _react.PropTypes.bool
  },

  statics: {
    setUseDefaultStyles: function setUseDefaultStyles(use) {
      useDefaultStyles = use;
    }
  },

  getDefaultProps: function getDefaultProps() {
    return {
      selectedIndex: -1,
      focus: false,
      focusRenderTabPanel: false
    };
  },

  getInitialState: function getInitialState() {
    return this.copyPropsToState(this.props);
  },

  getChildContext: function getChildContext() {
    return {
      forceRenderTabPanel: this.props.forceRenderTabPanel
    };
  },

  componentWillMount: function componentWillMount() {
    if (useDefaultStyles) {
      (0, _jsStylesheet2['default'])(require('../helpers/styles.js'));
    }
  },

  componentWillReceiveProps: function componentWillReceiveProps(newProps) {
    this.setState(this.copyPropsToState(newProps));
  },

  handleClick: function handleClick(e) {
    var node = e.target;
    do {
      if (isTabNode(node)) {
        if (isTabDisabled(node)) {
          return;
        }

        var index = [].slice.call(node.parentNode.children).indexOf(node);
        this.setSelected(index);
        return;
      }
    } while ((node = node.parentNode) !== null);
  },

  handleKeyDown: function handleKeyDown(e) {
    if (isTabNode(e.target)) {
      var index = this.state.selectedIndex;
      var preventDefault = false;

      // Select next tab to the left
      if (e.keyCode === 37 || e.keyCode === 38) {
        index = this.getPrevTab(index);
        preventDefault = true;
      }
      // Select next tab to the right
      /* eslint brace-style:0 */
      else if (e.keyCode === 39 || e.keyCode === 40) {
          index = this.getNextTab(index);
          preventDefault = true;
        }

      // This prevents scrollbars from moving around
      if (preventDefault) {
        e.preventDefault();
      }

      this.setSelected(index, true);
    }
  },

  setSelected: function setSelected(index, focus) {
    // Don't do anything if nothing has changed
    if (index === this.state.selectedIndex) return;
    // Check index boundary
    if (index < 0 || index >= this.getTabsCount()) return;

    // Keep reference to last index for event handler
    var last = this.state.selectedIndex;

    // Update selected index
    this.setState({ selectedIndex: index, focus: focus === true });

    // Call change event handler
    if (typeof this.props.onSelect === 'function') {
      this.props.onSelect(index, last);
    }
  },

  getNextTab: function getNextTab(index) {
    var count = this.getTabsCount();

    // Look for non-disabled tab from index to the last tab on the right
    for (var i = index + 1; i < count; i++) {
      var tab = this.getTab(i);
      if (!isTabDisabled((0, _reactDom.findDOMNode)(tab))) {
        return i;
      }
    }

    // If no tab found, continue searching from first on left to index
    for (var i = 0; i < index; i++) {
      var tab = this.getTab(i);
      if (!isTabDisabled((0, _reactDom.findDOMNode)(tab))) {
        return i;
      }
    }

    // No tabs are disabled, return index
    return index;
  },

  getPrevTab: function getPrevTab(index) {
    var i = index;

    // Look for non-disabled tab from index to first tab on the left
    while (i--) {
      var tab = this.getTab(i);
      if (!isTabDisabled((0, _reactDom.findDOMNode)(tab))) {
        return i;
      }
    }

    // If no tab found, continue searching from last tab on right to index
    i = this.getTabsCount();
    while (i-- > index) {
      var tab = this.getTab(i);
      if (!isTabDisabled((0, _reactDom.findDOMNode)(tab))) {
        return i;
      }
    }

    // No tabs are disabled, return index
    return index;
  },

  getTabsCount: function getTabsCount() {
    return this.props.children && this.props.children[0] ? _react2['default'].Children.count(this.props.children[0].props.children) : 0;
  },

  getPanelsCount: function getPanelsCount() {
    return _react2['default'].Children.count(this.props.children.slice(1));
  },

  getTabList: function getTabList() {
    return this.refs.tablist;
  },

  getTab: function getTab(index) {
    return this.refs['tabs-' + index];
  },

  getPanel: function getPanel(index) {
    return this.refs['panels-' + index];
  },

  getChildren: function getChildren() {
    var index = 0;
    var count = 0;
    var children = this.props.children;
    var state = this.state;
    var tabIds = this.tabIds = this.tabIds || [];
    var panelIds = this.panelIds = this.panelIds || [];
    var diff = this.tabIds.length - this.getTabsCount();

    // Add ids if new tabs have been added
    // Don't bother removing ids, just keep them in case they are added again
    // This is more efficient, and keeps the uuid counter under control
    while (diff++ < 0) {
      tabIds.push((0, _helpersUuid2['default'])());
      panelIds.push((0, _helpersUuid2['default'])());
    }

    // Map children to dynamically setup refs
    return _react2['default'].Children.map(children, function (child) {
      // null happens when conditionally rendering TabPanel/Tab
      // see https://github.com/rackt/react-tabs/issues/37
      if (child === null) {
        return null;
      }

      var result = null;

      // Clone TabList and Tab components to have refs
      if (count++ === 0) {
        // TODO try setting the uuid in the "constructor" for `Tab`/`TabPanel`
        result = (0, _react.cloneElement)(child, {
          ref: 'tablist',
          children: _react2['default'].Children.map(child.props.children, function (tab) {
            // null happens when conditionally rendering TabPanel/Tab
            // see https://github.com/rackt/react-tabs/issues/37
            if (tab === null) {
              return null;
            }

            var ref = 'tabs-' + index;
            var id = tabIds[index];
            var panelId = panelIds[index];
            var selected = state.selectedIndex === index;
            var focus = selected && state.focus;

            index++;

            return (0, _react.cloneElement)(tab, {
              ref: ref,
              id: id,
              panelId: panelId,
              selected: selected,
              focus: focus
            });
          })
        });

        // Reset index for panels
        index = 0;
      }
      // Clone TabPanel components to have refs
      else {
          var ref = 'panels-' + index;
          var id = panelIds[index];
          var tabId = tabIds[index];
          var selected = state.selectedIndex === index;

          index++;

          result = (0, _react.cloneElement)(child, {
            ref: ref,
            id: id,
            tabId: tabId,
            selected: selected
          });
        }

      return result;
    });
  },

  render: function render() {
    var _this = this;

    // This fixes an issue with focus management.
    //
    // Ultimately, when focus is true, and an input has focus,
    // and any change on that input causes a state change/re-render,
    // focus gets sent back to the active tab, and input loses focus.
    //
    // Since the focus state only needs to be remembered
    // for the current render, we can reset it once the
    // render has happened.
    //
    // Don't use setState, because we don't want to re-render.
    //
    // See https://github.com/rackt/react-tabs/pull/7
    if (this.state.focus) {
      setTimeout(function () {
        _this.state.focus = false;
      }, 0);
    }

    return _react2['default'].createElement(
      'div',
      {
        className: (0, _classnames2['default'])('ReactTabs', 'react-tabs', this.props.className),
        onClick: this.handleClick,
        onKeyDown: this.handleKeyDown
      },
      this.getChildren()
    );
  },

  // This is an anti-pattern, so sue me
  copyPropsToState: function copyPropsToState(props) {
    var selectedIndex = props.selectedIndex;

    // If no selectedIndex prop was supplied, then try
    // preserving the existing selectedIndex from state.
    // If the state has not selectedIndex, default
    // to the first tab in the TabList.
    //
    // TODO: Need automation testing around this
    // Manual testing can be done using examples/focus
    // See 'should preserve selectedIndex when typing' in specs/Tabs.spec.js
    if (selectedIndex === -1) {
      if (this.state && this.state.selectedIndex) {
        selectedIndex = this.state.selectedIndex;
      } else {
        selectedIndex = 0;
      }
    }

    return {
      selectedIndex: selectedIndex,
      focus: props.focus
    };
  }
});
},{"../helpers/childrenPropType":"C:\\ksana2015\\node_modules\\react-tabs\\lib\\helpers\\childrenPropType.js","../helpers/styles.js":"C:\\ksana2015\\node_modules\\react-tabs\\lib\\helpers\\styles.js","../helpers/uuid":"C:\\ksana2015\\node_modules\\react-tabs\\lib\\helpers\\uuid.js","classnames":"C:\\ksana2015\\node_modules\\react-tabs\\node_modules\\classnames\\index.js","js-stylesheet":"C:\\ksana2015\\node_modules\\react-tabs\\node_modules\\js-stylesheet\\jss.js","react":"react","react-dom":"react-dom"}],"C:\\ksana2015\\node_modules\\react-tabs\\lib\\helpers\\childrenPropType.js":[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _componentsTab = require('../components/Tab');

var _componentsTab2 = _interopRequireDefault(_componentsTab);

var _componentsTabList = require('../components/TabList');

var _componentsTabList2 = _interopRequireDefault(_componentsTabList);

module.exports = function childrenPropTypes(props, propName) {
  var error = undefined;
  var tabsCount = 0;
  var panelsCount = 0;
  var children = props[propName];

  _react2['default'].Children.forEach(children, function (child) {
    // null happens when conditionally rendering TabPanel/Tab
    // see https://github.com/rackt/react-tabs/issues/37
    if (child === null) {
      return;
    }

    if (child.type === _componentsTabList2['default']) {
      _react2['default'].Children.forEach(child.props.children, function (c) {
        // null happens when conditionally rendering TabPanel/Tab
        // see https://github.com/rackt/react-tabs/issues/37
        if (c === null) {
          return;
        }

        if (c.type === _componentsTab2['default']) {
          tabsCount++;
        } else {
          error = new Error('Expected `Tab` but found `' + (c.type.displayName || c.type) + '`');
        }
      });
    } else if (child.type.displayName === 'TabPanel') {
      panelsCount++;
    } else {
      error = new Error('Expected `TabList` or `TabPanel` but found `' + (child.type.displayName || child.type) + '`');
    }
  });

  if (tabsCount !== panelsCount) {
    error = new Error('There should be an equal number of `Tabs` and `TabPanels`. ' + 'Received ' + tabsCount + ' `Tabs` and ' + panelsCount + ' `TabPanels`.');
  }

  return error;
};
},{"../components/Tab":"C:\\ksana2015\\node_modules\\react-tabs\\lib\\components\\Tab.js","../components/TabList":"C:\\ksana2015\\node_modules\\react-tabs\\lib\\components\\TabList.js","react":"react"}],"C:\\ksana2015\\node_modules\\react-tabs\\lib\\helpers\\styles.js":[function(require,module,exports){
'use strict';

module.exports = {
  '.react-tabs [role=tablist]': {
    'border-bottom': '1px solid #aaa',
    'margin': '0 0 10px',
    'padding': '0'
  },

  '.react-tabs [role=tab]': {
    'display': 'inline-block',
    'border': '1px solid transparent',
    'border-bottom': 'none',
    'bottom': '-1px',
    'position': 'relative',
    'list-style': 'none',
    'padding': '6px 12px',
    'cursor': 'pointer'
  },

  '.react-tabs [role=tab][aria-selected=true]': {
    'background': '#fff',
    'border-color': '#aaa',
    'color': 'black',
    'border-radius': '5px 5px 0 0',
    '-moz-border-radius': '5px 5px 0 0',
    '-webkit-border-radius': '5px 5px 0 0'
  },

  '.react-tabs [role=tab][aria-disabled=true]': {
    'color': 'GrayText',
    'cursor': 'default'
  },

  '.react-tabs [role=tab]:focus': {
    'box-shadow': '0 0 5px hsl(208, 99%, 50%)',
    'border-color': 'hsl(208, 99%, 50%)',
    'outline': 'none'
  },

  '.react-tabs [role=tab]:focus:after': {
    'content': '""',
    'position': 'absolute',
    'height': '5px',
    'left': '-4px',
    'right': '-4px',
    'bottom': '-5px',
    'background': '#fff'
  }
};
},{}],"C:\\ksana2015\\node_modules\\react-tabs\\lib\\helpers\\uuid.js":[function(require,module,exports){
// Get a universally unique identifier
'use strict';

var count = 0;
module.exports = function uuid() {
  return 'react-tabs-' + count++;
};
},{}],"C:\\ksana2015\\node_modules\\react-tabs\\lib\\main.js":[function(require,module,exports){
'use strict';

module.exports = {
  Tabs: require('./components/Tabs'),
  TabList: require('./components/TabList'),
  Tab: require('./components/Tab'),
  TabPanel: require('./components/TabPanel')
};
},{"./components/Tab":"C:\\ksana2015\\node_modules\\react-tabs\\lib\\components\\Tab.js","./components/TabList":"C:\\ksana2015\\node_modules\\react-tabs\\lib\\components\\TabList.js","./components/TabPanel":"C:\\ksana2015\\node_modules\\react-tabs\\lib\\components\\TabPanel.js","./components/Tabs":"C:\\ksana2015\\node_modules\\react-tabs\\lib\\components\\Tabs.js"}],"C:\\ksana2015\\node_modules\\react-tabs\\node_modules\\classnames\\index.js":[function(require,module,exports){
/*!
  Copyright (c) 2015 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/
/* global define */

(function () {
	'use strict';

	var hasOwn = {}.hasOwnProperty;

	function classNames () {
		var classes = '';

		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (!arg) continue;

			var argType = typeof arg;

			if (argType === 'string' || argType === 'number') {
				classes += ' ' + arg;
			} else if (Array.isArray(arg)) {
				classes += ' ' + classNames.apply(null, arg);
			} else if (argType === 'object') {
				for (var key in arg) {
					if (hasOwn.call(arg, key) && arg[key]) {
						classes += ' ' + key;
					}
				}
			}
		}

		return classes.substr(1);
	}

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = classNames;
	} else if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
		// register as 'classnames', consistent with npm package name
		define('classnames', function () {
			return classNames;
		});
	} else {
		window.classNames = classNames;
	}
}());

},{}],"C:\\ksana2015\\node_modules\\react-tabs\\node_modules\\js-stylesheet\\jss.js":[function(require,module,exports){
!(function() {
  function jss(blocks) {
    var css = [];
    for (var block in blocks)
      css.push(createStyleBlock(block, blocks[block]));
    injectCSS(css);
  }

  function createStyleBlock(selector, rules) {
    return selector + ' {\n' + parseRules(rules) + '\n}';
  }

  function parseRules(rules) {
    var css = [];
    for (var rule in rules)
      css.push('  '+rule+': '+rules[rule]+';');
    return css.join('\n');
  }

  function injectCSS(css) {
    var style = document.getElementById('jss-styles');
    if (!style) {
      style = document.createElement('style');
      style.setAttribute('id', 'jss-styles');
      var head = document.getElementsByTagName('head')[0];
      head.insertBefore(style, head.firstChild);
    }
    var node = document.createTextNode(css.join('\n\n'));
    style.appendChild(node);
  }

  if (typeof exports === 'object')
    module.exports = jss;
  else
    window.jss = jss;

})();


},{}],"C:\\ksana2015\\node_modules\\react\\lib\\ReactComponentWithPureRenderMixin.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactComponentWithPureRenderMixin
 */

'use strict';

var shallowCompare = require('./shallowCompare');

/**
 * If your React component's render function is "pure", e.g. it will render the
 * same result given the same props and state, provide this Mixin for a
 * considerable performance boost.
 *
 * Most React components have pure render functions.
 *
 * Example:
 *
 *   var ReactComponentWithPureRenderMixin =
 *     require('ReactComponentWithPureRenderMixin');
 *   React.createClass({
 *     mixins: [ReactComponentWithPureRenderMixin],
 *
 *     render: function() {
 *       return <div className={this.props.className}>foo</div>;
 *     }
 *   });
 *
 * Note: This only checks shallow equality for props and state. If these contain
 * complex data structures this mixin may have false-negatives for deeper
 * differences. Only mixin to components which have simple props and state, or
 * use `forceUpdate()` when you know deep data structures have changed.
 */
var ReactComponentWithPureRenderMixin = {
  shouldComponentUpdate: function (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }
};

module.exports = ReactComponentWithPureRenderMixin;
},{"./shallowCompare":"C:\\ksana2015\\node_modules\\react\\lib\\shallowCompare.js"}],"C:\\ksana2015\\node_modules\\react\\lib\\shallowCompare.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
* @providesModule shallowCompare
*/

'use strict';

var shallowEqual = require('fbjs/lib/shallowEqual');

/**
 * Does a shallow comparison for props and state.
 * See ReactComponentWithPureRenderMixin
 */
function shallowCompare(instance, nextProps, nextState) {
  return !shallowEqual(instance.props, nextProps) || !shallowEqual(instance.state, nextState);
}

module.exports = shallowCompare;
},{"fbjs/lib/shallowEqual":"C:\\ksana2015\\node_modules\\react\\node_modules\\fbjs\\lib\\shallowEqual.js"}],"C:\\ksana2015\\node_modules\\react\\node_modules\\fbjs\\lib\\shallowEqual.js":[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule shallowEqual
 * @typechecks
 * 
 */

'use strict';

var hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Performs equality by iterating through keys on an object and returning false
 * when any key has values which are not strictly equal between the arguments.
 * Returns true when the values of all keys are strictly equal.
 */
function shallowEqual(objA, objB) {
  if (objA === objB) {
    return true;
  }

  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false;
  }

  var keysA = Object.keys(objA);
  var keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  // Test for A's keys different from B.
  var bHasOwnProperty = hasOwnProperty.bind(objB);
  for (var i = 0; i < keysA.length; i++) {
    if (!bHasOwnProperty(keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
      return false;
    }
  }

  return true;
}

module.exports = shallowEqual;
},{}],"C:\\ksana2015\\node_modules\\reflux\\index.js":[function(require,module,exports){
module.exports = require('./src');

},{"./src":"C:\\ksana2015\\node_modules\\reflux\\src\\index.js"}],"C:\\ksana2015\\node_modules\\reflux\\node_modules\\eventemitter3\\index.js":[function(require,module,exports){
'use strict';

/**
 * Representation of a single EventEmitter function.
 *
 * @param {Function} fn Event handler to be called.
 * @param {Mixed} context Context for function execution.
 * @param {Boolean} once Only emit once
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal EventEmitter interface that is molded against the Node.js
 * EventEmitter interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() { /* Nothing to set */ }

/**
 * Holds the assigned EventEmitters by name.
 *
 * @type {Object}
 * @private
 */
EventEmitter.prototype._events = undefined;

/**
 * Return a list of assigned event listeners.
 *
 * @param {String} event The events that should be listed.
 * @returns {Array}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event) {
  if (!this._events || !this._events[event]) return [];
  if (this._events[event].fn) return [this._events[event].fn];

  for (var i = 0, l = this._events[event].length, ee = new Array(l); i < l; i++) {
    ee[i] = this._events[event][i].fn;
  }

  return ee;
};

/**
 * Emit an event to all registered event listeners.
 *
 * @param {String} event The name of the event.
 * @returns {Boolean} Indication if we've emitted an event.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  if (!this._events || !this._events[event]) return false;

  var listeners = this._events[event]
    , len = arguments.length
    , args
    , i;

  if ('function' === typeof listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Functon} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  var listener = new EE(fn, context || this);

  if (!this._events) this._events = {};
  if (!this._events[event]) this._events[event] = listener;
  else {
    if (!this._events[event].fn) this._events[event].push(listener);
    else this._events[event] = [
      this._events[event], listener
    ];
  }

  return this;
};

/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  var listener = new EE(fn, context || this, true);

  if (!this._events) this._events = {};
  if (!this._events[event]) this._events[event] = listener;
  else {
    if (!this._events[event].fn) this._events[event].push(listener);
    else this._events[event] = [
      this._events[event], listener
    ];
  }

  return this;
};

/**
 * Remove event listeners.
 *
 * @param {String} event The event we want to remove.
 * @param {Function} fn The listener that we need to find.
 * @param {Boolean} once Only remove once listeners.
 * @api public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, once) {
  if (!this._events || !this._events[event]) return this;

  var listeners = this._events[event]
    , events = [];

  if (fn) {
    if (listeners.fn && (listeners.fn !== fn || (once && !listeners.once))) {
      events.push(listeners);
    }
    if (!listeners.fn) for (var i = 0, length = listeners.length; i < length; i++) {
      if (listeners[i].fn !== fn || (once && !listeners[i].once)) {
        events.push(listeners[i]);
      }
    }
  }

  //
  // Reset the array, or remove it completely if we have no more listeners.
  //
  if (events.length) {
    this._events[event] = events.length === 1 ? events[0] : events;
  } else {
    delete this._events[event];
  }

  return this;
};

/**
 * Remove all listeners or only the listeners for the specified event.
 *
 * @param {String} event The event want to remove all listeners for.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  if (!this._events) return this;

  if (event) delete this._events[event];
  else this._events = {};

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the module.
//
EventEmitter.EventEmitter = EventEmitter;
EventEmitter.EventEmitter2 = EventEmitter;
EventEmitter.EventEmitter3 = EventEmitter;

//
// Expose the module.
//
module.exports = EventEmitter;

},{}],"C:\\ksana2015\\node_modules\\reflux\\node_modules\\native-promise-only\\npo.js":[function(require,module,exports){
/*! Native Promise Only
    v0.7.6-a (c) Kyle Simpson
    MIT License: http://getify.mit-license.org
*/
!function(t,n,e){n[t]=n[t]||e(),"undefined"!=typeof module&&module.exports?module.exports=n[t]:"function"==typeof define&&define.amd&&define(function(){return n[t]})}("Promise","undefined"!=typeof global?global:this,function(){"use strict";function t(t,n){l.add(t,n),h||(h=y(l.drain))}function n(t){var n,e=typeof t;return null==t||"object"!=e&&"function"!=e||(n=t.then),"function"==typeof n?n:!1}function e(){for(var t=0;t<this.chain.length;t++)o(this,1===this.state?this.chain[t].success:this.chain[t].failure,this.chain[t]);this.chain.length=0}function o(t,e,o){var r,i;try{e===!1?o.reject(t.msg):(r=e===!0?t.msg:e.call(void 0,t.msg),r===o.promise?o.reject(TypeError("Promise-chain cycle")):(i=n(r))?i.call(r,o.resolve,o.reject):o.resolve(r))}catch(c){o.reject(c)}}function r(o){var c,u,a=this;if(!a.triggered){a.triggered=!0,a.def&&(a=a.def);try{(c=n(o))?(u=new f(a),c.call(o,function(){r.apply(u,arguments)},function(){i.apply(u,arguments)})):(a.msg=o,a.state=1,a.chain.length>0&&t(e,a))}catch(s){i.call(u||new f(a),s)}}}function i(n){var o=this;o.triggered||(o.triggered=!0,o.def&&(o=o.def),o.msg=n,o.state=2,o.chain.length>0&&t(e,o))}function c(t,n,e,o){for(var r=0;r<n.length;r++)!function(r){t.resolve(n[r]).then(function(t){e(r,t)},o)}(r)}function f(t){this.def=t,this.triggered=!1}function u(t){this.promise=t,this.state=0,this.triggered=!1,this.chain=[],this.msg=void 0}function a(n){if("function"!=typeof n)throw TypeError("Not a function");if(0!==this.__NPO__)throw TypeError("Not a promise");this.__NPO__=1;var o=new u(this);this.then=function(n,r){var i={success:"function"==typeof n?n:!0,failure:"function"==typeof r?r:!1};return i.promise=new this.constructor(function(t,n){if("function"!=typeof t||"function"!=typeof n)throw TypeError("Not a function");i.resolve=t,i.reject=n}),o.chain.push(i),0!==o.state&&t(e,o),i.promise},this["catch"]=function(t){return this.then(void 0,t)};try{n.call(void 0,function(t){r.call(o,t)},function(t){i.call(o,t)})}catch(c){i.call(o,c)}}var s,h,l,p=Object.prototype.toString,y="undefined"!=typeof setImmediate?function(t){return setImmediate(t)}:setTimeout;try{Object.defineProperty({},"x",{}),s=function(t,n,e,o){return Object.defineProperty(t,n,{value:e,writable:!0,configurable:o!==!1})}}catch(d){s=function(t,n,e){return t[n]=e,t}}l=function(){function t(t,n){this.fn=t,this.self=n,this.next=void 0}var n,e,o;return{add:function(r,i){o=new t(r,i),e?e.next=o:n=o,e=o,o=void 0},drain:function(){var t=n;for(n=e=h=void 0;t;)t.fn.call(t.self),t=t.next}}}();var g=s({},"constructor",a,!1);return s(a,"prototype",g,!1),s(g,"__NPO__",0,!1),s(a,"resolve",function(t){var n=this;return t&&"object"==typeof t&&1===t.__NPO__?t:new n(function(n,e){if("function"!=typeof n||"function"!=typeof e)throw TypeError("Not a function");n(t)})}),s(a,"reject",function(t){return new this(function(n,e){if("function"!=typeof n||"function"!=typeof e)throw TypeError("Not a function");e(t)})}),s(a,"all",function(t){var n=this;return"[object Array]"!=p.call(t)?n.reject(TypeError("Not an array")):0===t.length?n.resolve([]):new n(function(e,o){if("function"!=typeof e||"function"!=typeof o)throw TypeError("Not a function");var r=t.length,i=Array(r),f=0;c(n,t,function(t,n){i[t]=n,++f===r&&e(i)},o)})}),s(a,"race",function(t){var n=this;return"[object Array]"!=p.call(t)?n.reject(TypeError("Not an array")):new n(function(e,o){if("function"!=typeof e||"function"!=typeof o)throw TypeError("Not a function");c(n,t,function(t,n){e(n)},o)})}),a});

},{}],"C:\\ksana2015\\node_modules\\reflux\\src\\ActionMethods.js":[function(require,module,exports){
/**
 * A module of methods that you want to include in all actions.
 * This module is consumed by `createAction`.
 */
module.exports = {
};

},{}],"C:\\ksana2015\\node_modules\\reflux\\src\\Keep.js":[function(require,module,exports){
exports.createdStores = [];

exports.createdActions = [];

exports.reset = function() {
    while(exports.createdStores.length) {
        exports.createdStores.pop();
    }
    while(exports.createdActions.length) {
        exports.createdActions.pop();
    }
};

},{}],"C:\\ksana2015\\node_modules\\reflux\\src\\ListenerMethods.js":[function(require,module,exports){
var _ = require('./utils'),
    maker = require('./joins').instanceJoinCreator;

/**
 * Extract child listenables from a parent from their
 * children property and return them in a keyed Object
 *
 * @param {Object} listenable The parent listenable
 */
var mapChildListenables = function(listenable) {
    var i = 0, children = {}, childName;
    for (;i < (listenable.children||[]).length; ++i) {
        childName = listenable.children[i];
        if(listenable[childName]){
            children[childName] = listenable[childName];
        }
    }
    return children;
};

/**
 * Make a flat dictionary of all listenables including their
 * possible children (recursively), concatenating names in camelCase.
 *
 * @param {Object} listenables The top-level listenables
 */
var flattenListenables = function(listenables) {
    var flattened = {};
    for(var key in listenables){
        var listenable = listenables[key];
        var childMap = mapChildListenables(listenable);

        // recursively flatten children
        var children = flattenListenables(childMap);

        // add the primary listenable and chilren
        flattened[key] = listenable;
        for(var childKey in children){
            var childListenable = children[childKey];
            flattened[key + _.capitalize(childKey)] = childListenable;
        }
    }

    return flattened;
};

/**
 * A module of methods related to listening.
 */
module.exports = {

    /**
     * An internal utility function used by `validateListening`
     *
     * @param {Action|Store} listenable The listenable we want to search for
     * @returns {Boolean} The result of a recursive search among `this.subscriptions`
     */
    hasListener: function(listenable) {
        var i = 0, j, listener, listenables;
        for (;i < (this.subscriptions||[]).length; ++i) {
            listenables = [].concat(this.subscriptions[i].listenable);
            for (j = 0; j < listenables.length; j++){
                listener = listenables[j];
                if (listener === listenable || listener.hasListener && listener.hasListener(listenable)) {
                    return true;
                }
            }
        }
        return false;
    },

    /**
     * A convenience method that listens to all listenables in the given object.
     *
     * @param {Object} listenables An object of listenables. Keys will be used as callback method names.
     */
    listenToMany: function(listenables){
        var allListenables = flattenListenables(listenables);
        for(var key in allListenables){
            var cbname = _.callbackName(key),
                localname = this[cbname] ? cbname : this[key] ? key : undefined;
            if (localname){
                this.listenTo(allListenables[key],localname,this[cbname+"Default"]||this[localname+"Default"]||localname);
            }
        }
    },

    /**
     * Checks if the current context can listen to the supplied listenable
     *
     * @param {Action|Store} listenable An Action or Store that should be
     *  listened to.
     * @returns {String|Undefined} An error message, or undefined if there was no problem.
     */
    validateListening: function(listenable){
        if (listenable === this) {
            return "Listener is not able to listen to itself";
        }
        if (!_.isFunction(listenable.listen)) {
            return listenable + " is missing a listen method";
        }
        if (listenable.hasListener && listenable.hasListener(this)) {
            return "Listener cannot listen to this listenable because of circular loop";
        }
    },

    /**
     * Sets up a subscription to the given listenable for the context object
     *
     * @param {Action|Store} listenable An Action or Store that should be
     *  listened to.
     * @param {Function|String} callback The callback to register as event handler
     * @param {Function|String} defaultCallback The callback to register as default handler
     * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is the object being listened to
     */
    listenTo: function(listenable, callback, defaultCallback) {
        var desub, unsubscriber, subscriptionobj, subs = this.subscriptions = this.subscriptions || [];
        _.throwIf(this.validateListening(listenable));
        this.fetchInitialState(listenable, defaultCallback);
        desub = listenable.listen(this[callback]||callback, this);
        unsubscriber = function() {
            var index = subs.indexOf(subscriptionobj);
            _.throwIf(index === -1,'Tried to remove listen already gone from subscriptions list!');
            subs.splice(index, 1);
            desub();
        };
        subscriptionobj = {
            stop: unsubscriber,
            listenable: listenable
        };
        subs.push(subscriptionobj);
        return subscriptionobj;
    },

    /**
     * Stops listening to a single listenable
     *
     * @param {Action|Store} listenable The action or store we no longer want to listen to
     * @returns {Boolean} True if a subscription was found and removed, otherwise false.
     */
    stopListeningTo: function(listenable){
        var sub, i = 0, subs = this.subscriptions || [];
        for(;i < subs.length; i++){
            sub = subs[i];
            if (sub.listenable === listenable){
                sub.stop();
                _.throwIf(subs.indexOf(sub)!==-1,'Failed to remove listen from subscriptions list!');
                return true;
            }
        }
        return false;
    },

    /**
     * Stops all subscriptions and empties subscriptions array
     */
    stopListeningToAll: function(){
        var remaining, subs = this.subscriptions || [];
        while((remaining=subs.length)){
            subs[0].stop();
            _.throwIf(subs.length!==remaining-1,'Failed to remove listen from subscriptions list!');
        }
    },

    /**
     * Used in `listenTo`. Fetches initial data from a publisher if it has a `getInitialState` method.
     * @param {Action|Store} listenable The publisher we want to get initial state from
     * @param {Function|String} defaultCallback The method to receive the data
     */
    fetchInitialState: function (listenable, defaultCallback) {
        defaultCallback = (defaultCallback && this[defaultCallback]) || defaultCallback;
        var me = this;
        if (_.isFunction(defaultCallback) && _.isFunction(listenable.getInitialState)) {
            var data = listenable.getInitialState();
            if (data && _.isFunction(data.then)) {
                data.then(function() {
                    defaultCallback.apply(me, arguments);
                });
            } else {
                defaultCallback.call(this, data);
            }
        }
    },

    /**
     * The callback will be called once all listenables have triggered at least once.
     * It will be invoked with the last emission from each listenable.
     * @param {...Publishers} publishers Publishers that should be tracked.
     * @param {Function|String} callback The method to call when all publishers have emitted
     * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
     */
    joinTrailing: maker("last"),

    /**
     * The callback will be called once all listenables have triggered at least once.
     * It will be invoked with the first emission from each listenable.
     * @param {...Publishers} publishers Publishers that should be tracked.
     * @param {Function|String} callback The method to call when all publishers have emitted
     * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
     */
    joinLeading: maker("first"),

    /**
     * The callback will be called once all listenables have triggered at least once.
     * It will be invoked with all emission from each listenable.
     * @param {...Publishers} publishers Publishers that should be tracked.
     * @param {Function|String} callback The method to call when all publishers have emitted
     * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
     */
    joinConcat: maker("all"),

    /**
     * The callback will be called once all listenables have triggered.
     * If a callback triggers twice before that happens, an error is thrown.
     * @param {...Publishers} publishers Publishers that should be tracked.
     * @param {Function|String} callback The method to call when all publishers have emitted
     * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
     */
    joinStrict: maker("strict")
};

},{"./joins":"C:\\ksana2015\\node_modules\\reflux\\src\\joins.js","./utils":"C:\\ksana2015\\node_modules\\reflux\\src\\utils.js"}],"C:\\ksana2015\\node_modules\\reflux\\src\\ListenerMixin.js":[function(require,module,exports){
var _ = require('./utils'),
    ListenerMethods = require('./ListenerMethods');

/**
 * A module meant to be consumed as a mixin by a React component. Supplies the methods from
 * `ListenerMethods` mixin and takes care of teardown of subscriptions.
 * Note that if you're using the `connect` mixin you don't need this mixin, as connect will
 * import everything this mixin contains!
 */
module.exports = _.extend({

    /**
     * Cleans up all listener previously registered.
     */
    componentWillUnmount: ListenerMethods.stopListeningToAll

}, ListenerMethods);

},{"./ListenerMethods":"C:\\ksana2015\\node_modules\\reflux\\src\\ListenerMethods.js","./utils":"C:\\ksana2015\\node_modules\\reflux\\src\\utils.js"}],"C:\\ksana2015\\node_modules\\reflux\\src\\PublisherMethods.js":[function(require,module,exports){
var _ = require('./utils');

/**
 * A module of methods for object that you want to be able to listen to.
 * This module is consumed by `createStore` and `createAction`
 */
module.exports = {

    /**
     * Hook used by the publisher that is invoked before emitting
     * and before `shouldEmit`. The arguments are the ones that the action
     * is invoked with. If this function returns something other than
     * undefined, that will be passed on as arguments for shouldEmit and
     * emission.
     */
    preEmit: function() {},

    /**
     * Hook used by the publisher after `preEmit` to determine if the
     * event should be emitted with given arguments. This may be overridden
     * in your application, default implementation always returns true.
     *
     * @returns {Boolean} true if event should be emitted
     */
    shouldEmit: function() { return true; },

    /**
     * Subscribes the given callback for action triggered
     *
     * @param {Function} callback The callback to register as event handler
     * @param {Mixed} [optional] bindContext The context to bind the callback with
     * @returns {Function} Callback that unsubscribes the registered event handler
     */
    listen: function(callback, bindContext) {
        bindContext = bindContext || this;
        var eventHandler = function(args) {
            if (aborted){
                return;
            }
            callback.apply(bindContext, args);
        }, me = this, aborted = false;
        this.emitter.addListener(this.eventLabel, eventHandler);
        return function() {
            aborted = true;
            me.emitter.removeListener(me.eventLabel, eventHandler);
        };
    },

    /**
     * Attach handlers to promise that trigger the completed and failed
     * child publishers, if available.
     *
     * @param {Object} The promise to attach to
     */
    promise: function(promise) {
        var me = this;

        var canHandlePromise =
            this.children.indexOf('completed') >= 0 &&
            this.children.indexOf('failed') >= 0;

        if (!canHandlePromise){
            throw new Error('Publisher must have "completed" and "failed" child publishers');
        }

        promise.then(function(response) {
            return me.completed(response);
        }, function(error) {
            return me.failed(error);
        });
    },

    /**
     * Subscribes the given callback for action triggered, which should
     * return a promise that in turn is passed to `this.promise`
     *
     * @param {Function} callback The callback to register as event handler
     */
    listenAndPromise: function(callback, bindContext) {
        var me = this;
        bindContext = bindContext || this;
        this.willCallPromise = (this.willCallPromise || 0) + 1;

        var removeListen = this.listen(function() {

            if (!callback) {
                throw new Error('Expected a function returning a promise but got ' + callback);
            }

            var args = arguments,
                promise = callback.apply(bindContext, args);
            return me.promise.call(me, promise);
        }, bindContext);

        return function () {
          me.willCallPromise--;
          removeListen.call(me);
        };

    },

    /**
     * Publishes an event using `this.emitter` (if `shouldEmit` agrees)
     */
    trigger: function() {
        var args = arguments,
            pre = this.preEmit.apply(this, args);
        args = pre === undefined ? args : _.isArguments(pre) ? pre : [].concat(pre);
        if (this.shouldEmit.apply(this, args)) {
            this.emitter.emit(this.eventLabel, args);
        }
    },

    /**
     * Tries to publish the event on the next tick
     */
    triggerAsync: function(){
        var args = arguments,me = this;
        _.nextTick(function() {
            me.trigger.apply(me, args);
        });
    },

    /**
     * Returns a Promise for the triggered action
     *
     * @return {Promise}
     *   Resolved by completed child action.
     *   Rejected by failed child action.
     *   If listenAndPromise'd, then promise associated to this trigger.
     *   Otherwise, the promise is for next child action completion.
     */
    triggerPromise: function(){
        var me = this;
        var args = arguments;

        var canHandlePromise =
            this.children.indexOf('completed') >= 0 &&
            this.children.indexOf('failed') >= 0;

        var promise = _.createPromise(function(resolve, reject) {
            // If `listenAndPromise` is listening
            // patch `promise` w/ context-loaded resolve/reject
            if (me.willCallPromise) {
                _.nextTick(function() {
                    var old_promise_method = me.promise;
                    me.promise = function (promise) {
                        promise.then(resolve, reject);
                        // Back to your regularly schedule programming.
                        me.promise = old_promise_method;
                        return me.promise.apply(me, arguments);
                    };
                    me.trigger.apply(me, args);
                });
                return;
            }

            if (canHandlePromise) {
                var removeSuccess = me.completed.listen(function(args) {
                    removeSuccess();
                    removeFailed();
                    resolve(args);
                });

                var removeFailed = me.failed.listen(function(args) {
                    removeSuccess();
                    removeFailed();
                    reject(args);
                });
            }

            me.triggerAsync.apply(me, args);

            if (!canHandlePromise) {
                resolve();
            }
        });

        return promise;
    }
};

},{"./utils":"C:\\ksana2015\\node_modules\\reflux\\src\\utils.js"}],"C:\\ksana2015\\node_modules\\reflux\\src\\StoreMethods.js":[function(require,module,exports){
/**
 * A module of methods that you want to include in all stores.
 * This module is consumed by `createStore`.
 */
module.exports = {
};

},{}],"C:\\ksana2015\\node_modules\\reflux\\src\\bindMethods.js":[function(require,module,exports){
module.exports = function(store, definition) {
  for (var name in definition) {
    if (Object.getOwnPropertyDescriptor && Object.defineProperty) {
        var propertyDescriptor = Object.getOwnPropertyDescriptor(definition, name);

        if (!propertyDescriptor.value || typeof propertyDescriptor.value !== 'function' || !definition.hasOwnProperty(name)) {
            continue;
        }

        store[name] = definition[name].bind(store);
    } else {
        var property = definition[name];

        if (typeof property !== 'function' || !definition.hasOwnProperty(name)) {
            continue;
        }

        store[name] = property.bind(store);
    }
  }

  return store;
};

},{}],"C:\\ksana2015\\node_modules\\reflux\\src\\connect.js":[function(require,module,exports){
var Reflux = require('./index'),
    _ = require('./utils');

module.exports = function(listenable,key){
    return {
        getInitialState: function(){
            if (!_.isFunction(listenable.getInitialState)) {
                return {};
            } else if (key === undefined) {
                return listenable.getInitialState();
            } else {
                return _.object([key],[listenable.getInitialState()]);
            }
        },
        componentDidMount: function(){
            _.extend(this,Reflux.ListenerMethods);
            var me = this, cb = (key === undefined ? this.setState : function(v){me.setState(_.object([key],[v]));});
            this.listenTo(listenable,cb);
        },
        componentWillUnmount: Reflux.ListenerMixin.componentWillUnmount
    };
};

},{"./index":"C:\\ksana2015\\node_modules\\reflux\\src\\index.js","./utils":"C:\\ksana2015\\node_modules\\reflux\\src\\utils.js"}],"C:\\ksana2015\\node_modules\\reflux\\src\\connectFilter.js":[function(require,module,exports){
var Reflux = require('./index'),
  _ = require('./utils');

module.exports = function(listenable, key, filterFunc) {
    filterFunc = _.isFunction(key) ? key : filterFunc;
    return {
        getInitialState: function() {
            if (!_.isFunction(listenable.getInitialState)) {
                return {};
            } else if (_.isFunction(key)) {
                return filterFunc.call(this, listenable.getInitialState());
            } else {
                // Filter initial payload from store.
                var result = filterFunc.call(this, listenable.getInitialState());
                if (result) {
                  return _.object([key], [result]);
                } else {
                  return {};
                }
            }
        },
        componentDidMount: function() {
            _.extend(this, Reflux.ListenerMethods);
            var me = this;
            var cb = function(value) {
                if (_.isFunction(key)) {
                    me.setState(filterFunc.call(me, value));
                } else {
                    var result = filterFunc.call(me, value);
                    me.setState(_.object([key], [result]));
                }
            };

            this.listenTo(listenable, cb);
        },
        componentWillUnmount: Reflux.ListenerMixin.componentWillUnmount
    };
};


},{"./index":"C:\\ksana2015\\node_modules\\reflux\\src\\index.js","./utils":"C:\\ksana2015\\node_modules\\reflux\\src\\utils.js"}],"C:\\ksana2015\\node_modules\\reflux\\src\\createAction.js":[function(require,module,exports){
var _ = require('./utils'),
    Reflux = require('./index'),
    Keep = require('./Keep'),
    allowed = {preEmit:1,shouldEmit:1};

/**
 * Creates an action functor object. It is mixed in with functions
 * from the `PublisherMethods` mixin. `preEmit` and `shouldEmit` may
 * be overridden in the definition object.
 *
 * @param {Object} definition The action object definition
 */
var createAction = function(definition) {

    definition = definition || {};
    if (!_.isObject(definition)){
        definition = {actionName: definition};
    }

    for(var a in Reflux.ActionMethods){
        if (!allowed[a] && Reflux.PublisherMethods[a]) {
            throw new Error("Cannot override API method " + a +
                " in Reflux.ActionMethods. Use another method name or override it on Reflux.PublisherMethods instead."
            );
        }
    }

    for(var d in definition){
        if (!allowed[d] && Reflux.PublisherMethods[d]) {
            throw new Error("Cannot override API method " + d +
                " in action creation. Use another method name or override it on Reflux.PublisherMethods instead."
            );
        }
    }

    definition.children = definition.children || [];
    if (definition.asyncResult){
        definition.children = definition.children.concat(["completed","failed"]);
    }

    var i = 0, childActions = {};
    for (; i < definition.children.length; i++) {
        var name = definition.children[i];
        childActions[name] = createAction(name);
    }

    var context = _.extend({
        eventLabel: "action",
        emitter: new _.EventEmitter(),
        _isAction: true
    }, Reflux.PublisherMethods, Reflux.ActionMethods, definition);

    var functor = function() {
        return functor[functor.sync?"trigger":"triggerPromise"].apply(functor, arguments);
    };

    _.extend(functor,childActions,context);

    Keep.createdActions.push(functor);

    return functor;

};

module.exports = createAction;

},{"./Keep":"C:\\ksana2015\\node_modules\\reflux\\src\\Keep.js","./index":"C:\\ksana2015\\node_modules\\reflux\\src\\index.js","./utils":"C:\\ksana2015\\node_modules\\reflux\\src\\utils.js"}],"C:\\ksana2015\\node_modules\\reflux\\src\\createStore.js":[function(require,module,exports){
var _ = require('./utils'),
    Reflux = require('./index'),
    Keep = require('./Keep'),
    mixer = require('./mixer'),
    allowed = {preEmit:1,shouldEmit:1},
    bindMethods = require('./bindMethods');

/**
 * Creates an event emitting Data Store. It is mixed in with functions
 * from the `ListenerMethods` and `PublisherMethods` mixins. `preEmit`
 * and `shouldEmit` may be overridden in the definition object.
 *
 * @param {Object} definition The data store object definition
 * @returns {Store} A data store instance
 */
module.exports = function(definition) {

    definition = definition || {};

    for(var a in Reflux.StoreMethods){
        if (!allowed[a] && (Reflux.PublisherMethods[a] || Reflux.ListenerMethods[a])){
            throw new Error("Cannot override API method " + a +
                " in Reflux.StoreMethods. Use another method name or override it on Reflux.PublisherMethods / Reflux.ListenerMethods instead."
            );
        }
    }

    for(var d in definition){
        if (!allowed[d] && (Reflux.PublisherMethods[d] || Reflux.ListenerMethods[d])){
            throw new Error("Cannot override API method " + d +
                " in store creation. Use another method name or override it on Reflux.PublisherMethods / Reflux.ListenerMethods instead."
            );
        }
    }

    definition = mixer(definition);

    function Store() {
        var i=0, arr;
        this.subscriptions = [];
        this.emitter = new _.EventEmitter();
        this.eventLabel = "change";
        bindMethods(this, definition);
        if (this.init && _.isFunction(this.init)) {
            this.init();
        }
        if (this.listenables){
            arr = [].concat(this.listenables);
            for(;i < arr.length;i++){
                this.listenToMany(arr[i]);
            }
        }
    }

    _.extend(Store.prototype, Reflux.ListenerMethods, Reflux.PublisherMethods, Reflux.StoreMethods, definition);

    var store = new Store();
    Keep.createdStores.push(store);

    return store;
};

},{"./Keep":"C:\\ksana2015\\node_modules\\reflux\\src\\Keep.js","./bindMethods":"C:\\ksana2015\\node_modules\\reflux\\src\\bindMethods.js","./index":"C:\\ksana2015\\node_modules\\reflux\\src\\index.js","./mixer":"C:\\ksana2015\\node_modules\\reflux\\src\\mixer.js","./utils":"C:\\ksana2015\\node_modules\\reflux\\src\\utils.js"}],"C:\\ksana2015\\node_modules\\reflux\\src\\index.js":[function(require,module,exports){
exports.ActionMethods = require('./ActionMethods');

exports.ListenerMethods = require('./ListenerMethods');

exports.PublisherMethods = require('./PublisherMethods');

exports.StoreMethods = require('./StoreMethods');

exports.createAction = require('./createAction');

exports.createStore = require('./createStore');

exports.connect = require('./connect');

exports.connectFilter = require('./connectFilter');

exports.ListenerMixin = require('./ListenerMixin');

exports.listenTo = require('./listenTo');

exports.listenToMany = require('./listenToMany');


var maker = require('./joins').staticJoinCreator;

exports.joinTrailing = exports.all = maker("last"); // Reflux.all alias for backward compatibility

exports.joinLeading = maker("first");

exports.joinStrict = maker("strict");

exports.joinConcat = maker("all");

var _ = require('./utils');

exports.EventEmitter = _.EventEmitter;

exports.Promise = _.Promise;

/**
 * Convenience function for creating a set of actions
 *
 * @param definitions the definitions for the actions to be created
 * @returns an object with actions of corresponding action names
 */
exports.createActions = function(definitions) {
    var actions = {};
    for (var k in definitions){
        if (definitions.hasOwnProperty(k)) {
            var val = definitions[k],
                actionName = _.isObject(val) ? k : val;

            actions[actionName] = exports.createAction(val);
        }
    }
    return actions;
};

/**
 * Sets the eventmitter that Reflux uses
 */
exports.setEventEmitter = function(ctx) {
    var _ = require('./utils');
    exports.EventEmitter = _.EventEmitter = ctx;
};


/**
 * Sets the Promise library that Reflux uses
 */
exports.setPromise = function(ctx) {
    var _ = require('./utils');
    exports.Promise = _.Promise = ctx;
};


/**
 * Sets the Promise factory that creates new promises
 * @param {Function} factory has the signature `function(resolver) { return [new Promise]; }`
 */
exports.setPromiseFactory = function(factory) {
    var _ = require('./utils');
    _.createPromise = factory;
};


/**
 * Sets the method used for deferring actions and stores
 */
exports.nextTick = function(nextTick) {
    var _ = require('./utils');
    _.nextTick = nextTick;
};

/**
 * Provides the set of created actions and stores for introspection
 */
exports.__keep = require('./Keep');

/**
 * Warn if Function.prototype.bind not available
 */
if (!Function.prototype.bind) {
  console.error(
    'Function.prototype.bind not available. ' +
    'ES5 shim required. ' +
    'https://github.com/spoike/refluxjs#es5'
  );
}

},{"./ActionMethods":"C:\\ksana2015\\node_modules\\reflux\\src\\ActionMethods.js","./Keep":"C:\\ksana2015\\node_modules\\reflux\\src\\Keep.js","./ListenerMethods":"C:\\ksana2015\\node_modules\\reflux\\src\\ListenerMethods.js","./ListenerMixin":"C:\\ksana2015\\node_modules\\reflux\\src\\ListenerMixin.js","./PublisherMethods":"C:\\ksana2015\\node_modules\\reflux\\src\\PublisherMethods.js","./StoreMethods":"C:\\ksana2015\\node_modules\\reflux\\src\\StoreMethods.js","./connect":"C:\\ksana2015\\node_modules\\reflux\\src\\connect.js","./connectFilter":"C:\\ksana2015\\node_modules\\reflux\\src\\connectFilter.js","./createAction":"C:\\ksana2015\\node_modules\\reflux\\src\\createAction.js","./createStore":"C:\\ksana2015\\node_modules\\reflux\\src\\createStore.js","./joins":"C:\\ksana2015\\node_modules\\reflux\\src\\joins.js","./listenTo":"C:\\ksana2015\\node_modules\\reflux\\src\\listenTo.js","./listenToMany":"C:\\ksana2015\\node_modules\\reflux\\src\\listenToMany.js","./utils":"C:\\ksana2015\\node_modules\\reflux\\src\\utils.js"}],"C:\\ksana2015\\node_modules\\reflux\\src\\joins.js":[function(require,module,exports){
/**
 * Internal module used to create static and instance join methods
 */

var slice = Array.prototype.slice,
    _ = require("./utils"),
    createStore = require("./createStore"),
    strategyMethodNames = {
        strict: "joinStrict",
        first: "joinLeading",
        last: "joinTrailing",
        all: "joinConcat"
    };

/**
 * Used in `index.js` to create the static join methods
 * @param {String} strategy Which strategy to use when tracking listenable trigger arguments
 * @returns {Function} A static function which returns a store with a join listen on the given listenables using the given strategy
 */
exports.staticJoinCreator = function(strategy){
    return function(/* listenables... */) {
        var listenables = slice.call(arguments);
        return createStore({
            init: function(){
                this[strategyMethodNames[strategy]].apply(this,listenables.concat("triggerAsync"));
            }
        });
    };
};

/**
 * Used in `ListenerMethods.js` to create the instance join methods
 * @param {String} strategy Which strategy to use when tracking listenable trigger arguments
 * @returns {Function} An instance method which sets up a join listen on the given listenables using the given strategy
 */
exports.instanceJoinCreator = function(strategy){
    return function(/* listenables..., callback*/){
        _.throwIf(arguments.length < 3,'Cannot create a join with less than 2 listenables!');
        var listenables = slice.call(arguments),
            callback = listenables.pop(),
            numberOfListenables = listenables.length,
            join = {
                numberOfListenables: numberOfListenables,
                callback: this[callback]||callback,
                listener: this,
                strategy: strategy
            }, i, cancels = [], subobj;
        for (i = 0; i < numberOfListenables; i++) {
            _.throwIf(this.validateListening(listenables[i]));
        }
        for (i = 0; i < numberOfListenables; i++) {
            cancels.push(listenables[i].listen(newListener(i,join),this));
        }
        reset(join);
        subobj = {listenable: listenables};
        subobj.stop = makeStopper(subobj,cancels,this);
        this.subscriptions = (this.subscriptions || []).concat(subobj);
        return subobj;
    };
};

// ---- internal join functions ----

function makeStopper(subobj,cancels,context){
    return function() {
        var i, subs = context.subscriptions,
            index = (subs ? subs.indexOf(subobj) : -1);
        _.throwIf(index === -1,'Tried to remove join already gone from subscriptions list!');
        for(i=0;i < cancels.length; i++){
            cancels[i]();
        }
        subs.splice(index, 1);
    };
}

function reset(join) {
    join.listenablesEmitted = new Array(join.numberOfListenables);
    join.args = new Array(join.numberOfListenables);
}

function newListener(i,join) {
    return function() {
        var callargs = slice.call(arguments);
        if (join.listenablesEmitted[i]){
            switch(join.strategy){
                case "strict": throw new Error("Strict join failed because listener triggered twice.");
                case "last": join.args[i] = callargs; break;
                case "all": join.args[i].push(callargs);
            }
        } else {
            join.listenablesEmitted[i] = true;
            join.args[i] = (join.strategy==="all"?[callargs]:callargs);
        }
        emitIfAllListenablesEmitted(join);
    };
}

function emitIfAllListenablesEmitted(join) {
    for (var i = 0; i < join.numberOfListenables; i++) {
        if (!join.listenablesEmitted[i]) {
            return;
        }
    }
    join.callback.apply(join.listener,join.args);
    reset(join);
}

},{"./createStore":"C:\\ksana2015\\node_modules\\reflux\\src\\createStore.js","./utils":"C:\\ksana2015\\node_modules\\reflux\\src\\utils.js"}],"C:\\ksana2015\\node_modules\\reflux\\src\\listenTo.js":[function(require,module,exports){
var Reflux = require('./index');


/**
 * A mixin factory for a React component. Meant as a more convenient way of using the `ListenerMixin`,
 * without having to manually set listeners in the `componentDidMount` method.
 *
 * @param {Action|Store} listenable An Action or Store that should be
 *  listened to.
 * @param {Function|String} callback The callback to register as event handler
 * @param {Function|String} defaultCallback The callback to register as default handler
 * @returns {Object} An object to be used as a mixin, which sets up the listener for the given listenable.
 */
module.exports = function(listenable,callback,initial){
    return {
        /**
         * Set up the mixin before the initial rendering occurs. Import methods from `ListenerMethods`
         * and then make the call to `listenTo` with the arguments provided to the factory function
         */
        componentDidMount: function() {
            for(var m in Reflux.ListenerMethods){
                if (this[m] !== Reflux.ListenerMethods[m]){
                    if (this[m]){
                        throw "Can't have other property '"+m+"' when using Reflux.listenTo!";
                    }
                    this[m] = Reflux.ListenerMethods[m];
                }
            }
            this.listenTo(listenable,callback,initial);
        },
        /**
         * Cleans up all listener previously registered.
         */
        componentWillUnmount: Reflux.ListenerMethods.stopListeningToAll
    };
};

},{"./index":"C:\\ksana2015\\node_modules\\reflux\\src\\index.js"}],"C:\\ksana2015\\node_modules\\reflux\\src\\listenToMany.js":[function(require,module,exports){
var Reflux = require('./index');

/**
 * A mixin factory for a React component. Meant as a more convenient way of using the `listenerMixin`,
 * without having to manually set listeners in the `componentDidMount` method. This version is used
 * to automatically set up a `listenToMany` call.
 *
 * @param {Object} listenables An object of listenables
 * @returns {Object} An object to be used as a mixin, which sets up the listeners for the given listenables.
 */
module.exports = function(listenables){
    return {
        /**
         * Set up the mixin before the initial rendering occurs. Import methods from `ListenerMethods`
         * and then make the call to `listenTo` with the arguments provided to the factory function
         */
        componentDidMount: function() {
            for(var m in Reflux.ListenerMethods){
                if (this[m] !== Reflux.ListenerMethods[m]){
                    if (this[m]){
                        throw "Can't have other property '"+m+"' when using Reflux.listenToMany!";
                    }
                    this[m] = Reflux.ListenerMethods[m];
                }
            }
            this.listenToMany(listenables);
        },
        /**
         * Cleans up all listener previously registered.
         */
        componentWillUnmount: Reflux.ListenerMethods.stopListeningToAll
    };
};

},{"./index":"C:\\ksana2015\\node_modules\\reflux\\src\\index.js"}],"C:\\ksana2015\\node_modules\\reflux\\src\\mixer.js":[function(require,module,exports){
var _ = require('./utils');

module.exports = function mix(def) {
    var composed = {
        init: [],
        preEmit: [],
        shouldEmit: []
    };

    var updated = (function mixDef(mixin) {
        var mixed = {};
        if (mixin.mixins) {
            mixin.mixins.forEach(function (subMixin) {
                _.extend(mixed, mixDef(subMixin));
            });
        }
        _.extend(mixed, mixin);
        Object.keys(composed).forEach(function (composable) {
            if (mixin.hasOwnProperty(composable)) {
                composed[composable].push(mixin[composable]);
            }
        });
        return mixed;
    }(def));

    if (composed.init.length > 1) {
        updated.init = function () {
            var args = arguments;
            composed.init.forEach(function (init) {
                init.apply(this, args);
            }, this);
        };
    }
    if (composed.preEmit.length > 1) {
        updated.preEmit = function () {
            return composed.preEmit.reduce(function (args, preEmit) {
                var newValue = preEmit.apply(this, args);
                return newValue === undefined ? args : [newValue];
            }.bind(this), arguments);
        };
    }
    if (composed.shouldEmit.length > 1) {
        updated.shouldEmit = function () {
            var args = arguments;
            return !composed.shouldEmit.some(function (shouldEmit) {
                return !shouldEmit.apply(this, args);
            }, this);
        };
    }
    Object.keys(composed).forEach(function (composable) {
        if (composed[composable].length === 1) {
            updated[composable] = composed[composable][0];
        }
    });

    return updated;
};

},{"./utils":"C:\\ksana2015\\node_modules\\reflux\\src\\utils.js"}],"C:\\ksana2015\\node_modules\\reflux\\src\\utils.js":[function(require,module,exports){
/*
 * isObject, extend, isFunction, isArguments are taken from undescore/lodash in
 * order to remove the dependency
 */
var isObject = exports.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
};

exports.extend = function(obj) {
    if (!isObject(obj)) {
        return obj;
    }
    var source, prop;
    for (var i = 1, length = arguments.length; i < length; i++) {
        source = arguments[i];
        for (prop in source) {
            if (Object.getOwnPropertyDescriptor && Object.defineProperty) {
                var propertyDescriptor = Object.getOwnPropertyDescriptor(source, prop);
                Object.defineProperty(obj, prop, propertyDescriptor);
            } else {
                obj[prop] = source[prop];
            }
        }
    }
    return obj;
};

exports.isFunction = function(value) {
    return typeof value === 'function';
};

exports.EventEmitter = require('eventemitter3');

exports.nextTick = function(callback) {
    setTimeout(callback, 0);
};

exports.capitalize = function(string){
    return string.charAt(0).toUpperCase()+string.slice(1);
};

exports.callbackName = function(string){
    return "on"+exports.capitalize(string);
};

exports.object = function(keys,vals){
    var o={}, i=0;
    for(;i<keys.length;i++){
        o[keys[i]] = vals[i];
    }
    return o;
};

exports.Promise = require("native-promise-only");

exports.createPromise = function(resolver) {
    return new exports.Promise(resolver);
};

exports.isArguments = function(value) {
    return typeof value === 'object' && ('callee' in value) && typeof value.length === 'number';
};

exports.throwIf = function(val,msg){
    if (val){
        throw Error(msg||val);
    }
};

},{"eventemitter3":"C:\\ksana2015\\node_modules\\reflux\\node_modules\\eventemitter3\\index.js","native-promise-only":"C:\\ksana2015\\node_modules\\reflux\\node_modules\\native-promise-only\\npo.js"}],"C:\\ksana2015\\pannaloka\\index.js":[function(require,module,exports){
require("./src/index");
},{"./src/index":"C:\\ksana2015\\pannaloka\\src\\index.js"}],"C:\\ksana2015\\pannaloka\\src\\actions\\docfile.js":[function(require,module,exports){
module.exports=require("reflux").createActions(["openFile","closeFile","updateTrait","setActiveEditor"]);
},{"reflux":"C:\\ksana2015\\node_modules\\reflux\\index.js"}],"C:\\ksana2015\\pannaloka\\src\\actions\\ktcfile.js":[function(require,module,exports){
module.exports=require("reflux").createActions(["reload","newTree","openTree","writeTree"]);
},{"reflux":"C:\\ksana2015\\node_modules\\reflux\\index.js"}],"C:\\ksana2015\\pannaloka\\src\\actions\\ktxfile.js":[function(require,module,exports){
module.exports=require("reflux").createActions(["reload","newfile"]);
},{"reflux":"C:\\ksana2015\\node_modules\\reflux\\index.js"}],"C:\\ksana2015\\pannaloka\\src\\actions\\markup.js":[function(require,module,exports){
module.exports=require("reflux").createActions(["setHotkey","markupsUnderCursor",
	"createMarkup","toggleMarkup","editMarkup","hovering"]);
},{"reflux":"C:\\ksana2015\\node_modules\\reflux\\index.js"}],"C:\\ksana2015\\pannaloka\\src\\actions\\overlay.js":[function(require,module,exports){
module.exports=require("reflux").createActions(["connect","clear"]);
},{"reflux":"C:\\ksana2015\\node_modules\\reflux\\index.js"}],"C:\\ksana2015\\pannaloka\\src\\actions\\selection.js":[function(require,module,exports){
module.exports=require("reflux").createActions(["setSelection","clearSelectionOf","clearAllSelection"]);
},{"reflux":"C:\\ksana2015\\node_modules\\reflux\\index.js"}],"C:\\ksana2015\\pannaloka\\src\\actions\\stackwidget.js":[function(require,module,exports){
module.exports=require("reflux").createActions(["newWidget","closeWidget","openWidget"]);
},{"reflux":"C:\\ksana2015\\node_modules\\reflux\\index.js"}],"C:\\ksana2015\\pannaloka\\src\\cmfileio.js":[function(require,module,exports){
var socketfs=require("./socketfs");
var kcm=require("ksana-codemirror");

var readFile=function(fn,cb) {
  if (typeof fn==="function") {
    cb=fn;
    fn=null;
  }
  if (typeof cb!=="function") {
    cb=null;
  }
  fn=fn||"ktx/empty.ktx";
  socketfs.readFile(fn,"utf8",function(err,filecontent){
    if (err) {
      cb(err);
    } else {
      var obj=kcm.deserialize(filecontent,fn);
      if (!obj) {
        cb("error loading file "+fn);
      } else {
        cb.call(this,0,obj)
      }
    }
  }.bind(this));
}


var writeFile=function (meta,cm,fn,cb) {
  var data=kcm.serialize(meta,cm);
  socketfs.writeFile(fn, data,"utf8",function(err){
    if (err) {
      cb(err);
    } else {
      cb(0,meta);
    }
  }.bind(this));
}


module.exports = {writeFile:writeFile, readFile:readFile};
},{"./socketfs":"C:\\ksana2015\\pannaloka\\src\\socketfs.js","ksana-codemirror":"C:\\ksana2015\\node_modules\\ksana-codemirror\\src\\index.js"}],"C:\\ksana2015\\pannaloka\\src\\components\\documenttitle.js":[function(require,module,exports){
var React=require("react");
var ReactDOM=require("react-dom");
var Component=React.Component;
var PureRender=require('react-addons-pure-render-mixin');
var FlexHeight=require("./flexheight");


var styles={
	container:{cursor:"pointer"}
	,input:{fontSize:"75%",border:"0px solid",outline:0}
	,cancelbutton:{fontSize:"75%"}
}
var DocumentTitle = React.createClass({displayName: "DocumentTitle",
	getInitialState:function () {
		return {editing:false,title:this.props.title,flex:this.props.flex||1};
	}
	,onChange :function (e) {
		this.setState({title:e.target.value});
	}

	,onKeyUp :function (e)  {
		if (e.key==="Enter") {
			this.cancelEdit();
			if (this.props.title!==this.state.title) {
				this.props.onSetTitle&&this.props.onSetTitle(this.state.title);
			}
		}
		else if (e.key==="Escape") {
			this.cancelEdit();
		}
	}

	,componentDidUpdate :function() {
		var input=ReactDOM.findDOMNode(this.refs.titleinput);
		if (!input) return;
		if (document.activeElement!==input) {
			var len=this.state.title.length;
			input.focus(); 
			input.setSelectionRange(len,len)
		}
	}

	,edit :function(){
		this.setState({editing:true});
	}

	,setFlexHeight :function(flex) {
		this.setState({flex});
		this.props.onSetFlexHeight&&this.props.onSetFlexHeight(flex);
	}

	,cancelEdit :function() {
		this.setState({editing:false});
	}
	,onFileIdFocus:function(e) {
		e.target.select();
	}
	,renderFileId:function() {
		if (this.props.filename.indexOf("/")==-1){
			return React.createElement("span", null, "fileId:", React.createElement("input", {readOnly: true, style: styles.input, 
			defaultValue: this.props.filename, onFocus: this.onFileIdFocus}))	
		}		
	}
  ,render :function() {
  	if (this.state.editing) {
  		return React.createElement("span", {style: styles.container}, React.createElement("input", {ref: "titleinput", style: styles.input, 
  					autofocus: true, onKeyUp: this.onKeyUp, 
  									onBlur: this.onBlur, 
  									onChange: this.onChange, value: this.state.title}), 
  									React.createElement("button", {style: styles.cancelbutton, title: "ESC", onClick: this.cancelEdit}, "cancel"), 
  								this.renderFileId(), 
  								React.createElement(FlexHeight, {flex: this.state.flex, setValue: this.setFlexHeight})
  						)
  	} else {
  		return React.createElement("span", {style: styles.container, onClick: this.edit}, this.props.title)
  	}
  	
  }
});
module.exports=DocumentTitle;
},{"./flexheight":"C:\\ksana2015\\pannaloka\\src\\components\\flexheight.js","react":"react","react-addons-pure-render-mixin":"C:\\ksana2015\\node_modules\\react-addons-pure-render-mixin\\index.js","react-dom":"react-dom"}],"C:\\ksana2015\\pannaloka\\src\\components\\fileitem.js":[function(require,module,exports){
var React=require("react");

var selectedstyle={cursor:"pointer"};
var style={cursor:"default"};

var FileItem = React.createClass({displayName: "FileItem",
	renderTitle:function() {
		if (this.props.selected) {
			return React.createElement("a", {href: "#", onClick: this.props.onClick, title: this.props.filename}, this.props.title||this.props.t)
		} else {
			return React.createElement("span", {title: this.props.filename}, this.props.title||this.props.t);
		}
	}
	,render:function () {
		return React.createElement("div", {style: this.props.selected?selectedstyle:style}, 
			this.renderTitle()
		)
	}
});

module.exports = FileItem;
},{"react":"react"}],"C:\\ksana2015\\pannaloka\\src\\components\\flexheight.js":[function(require,module,exports){
var React=require("react");
var PureRender=require('react-addons-pure-render-mixin');
var styles={
	title:{fontSize:"100%"}
}
var FlexHeight=React.createClass({displayName: "FlexHeight",
	onClick :function()  {
		var newvalue=this.props.flex+0.5;
		if (newvalue>2) newvalue=0.5;
		this.props.setValue(newvalue);
	}

	,getHeight :function()  {
		return this.props.flex*100+"%";
	}
	,render:function() {
		return React.createElement("span", {onClick: this.onClick}, " Height:", this.getHeight())
	}
});
module.exports=FlexHeight;
},{"react":"react","react-addons-pure-render-mixin":"C:\\ksana2015\\node_modules\\react-addons-pure-render-mixin\\index.js"}],"C:\\ksana2015\\pannaloka\\src\\components\\markupselector.js":[function(require,module,exports){
var React=require("react");
var E=React.createElement;
var RangeHyperlink=require("./rangehyperlink");
var markuptypedef=require("../markuptypedef/");
var styles={picker:{border:"2px solid silver",borderRadius:"25%",cursor:"pointer"}}
var MarkupSelector = React.createClass({displayName: "MarkupSelector",
	getInitialState:function(){
		this.editingMarker=[];
		return this.getEditor(this.props.markups,0);
	}
	
	,highlightMarkup :function(markups,idx) {
		
		this.clearMarker();
		this.setMarker(markups[idx].doc,markups[idx].markup.handle,"editingMarker samegroup");
		if (!this.props.getOther) return;
		var others=this.props.getOther(markups[idx].markup);
		others.map(function(m){
			if (!m.handle)return;
			this.setMarker(m.handle.doc,m.handle,"samegroup");
		}.bind(this));
	}

	
	,setMarker :function(doc,textmarker,clsname) {
		clsname=clsname||"editingMarker";
		var pos=textmarker.find();
		this.editingMarker.push(doc.markText(pos.from,pos.to,{className:clsname}));
	}	

	,getEditor :function(markups,idx) {
		var markupeditor=null,M=null,deletable=false,typedef=null;
		if (markups.length) {
			M=(markups[idx]).markup;
			//doc==null, markup owner doc is freed
			if (!markups[idx].doc|| !M) return {markupeditor:null,M:null,idx:0,deletable:false,typedef:null};
			this.highlightMarkup.call(this,markups,idx);
			typedef=markuptypedef.types[M.className];
			if (typedef) {
				markupeditor=typedef.editor;
				deletable=typedef.isDeletable?typedef.isDeletable(M):true;
			}
			var ctrl_m_handler=deletable?this.onDeleteMarkup:null;
			this.props.onEditing&&this.props.onEditing(markups[idx],ctrl_m_handler);
		} else {
			this.clearMarker();
		}
		return {markupeditor,M,idx,deletable,typedef};
	}

	,shouldComponentUpdate :function(nextProps) {
		return (nextProps.markups!==this.props.markups && nextProps.markups.length>0
			||nextProps.ranges.length>0 || (this.props.markups.length && this.props.markups[0].doc==null)) ;
	}
	,componentWillReceiveProps :function(nextProps) {
		if (nextProps.markups.length) {
			this.setState(this.getEditor(nextProps.markups,0));	
		}
	}

	,clearMarker :function() {
		if (this.editingMarker) {
			this.editingMarker.map(function(m){m.clear()});
			this.editingMarker=[];
		}
	}

	,renderMarkupItem :function() {
		var idx=this.state.idx;
		var item=this.props.markups[idx];
		return React.createElement("span", {key: idx}, (idx+1)+"/"+this.props.markups.length)
	}

	,onNextMarkup :function(e) {
		var i=this.state.idx+1;
		if (i&& i===this.props.markups.length) i=0;
		this.setState(this.getEditor(this.props.markups,i));
		this.forceUpdate();
	}

	,renderMarkupPicker :function() {
		if (this.props.markups.length>1) {
			return React.createElement("span", {style: styles.picker, onClick: this.onNextMarkup}, this.renderMarkupItem())
		}
	}

	,renderTarget :function() {
		if (!this.state.M) return;
		var others=this.state.M.target;
		if (!others)return;
		if (!Array.isArray( others[0]) ) others=[others];
		return E(RangeHyperlink,{ranges:others,onHyperlinkClick:this.props.onHyperlinkClick
			,onHyperlinkEnter:this.props.onHyperlinkEnter});
	}


	,renderOthers:function() { //same view
		if (!this.state.M) return;
		if (!this.props.getOther) return;
		var others=this.props.getOther(this.state.M,{format:"range"});
		return E(RangeHyperlink,{ranges:others,onHyperlinkClick:this.props.onHyperlinkClick
				,onHyperlinkEnter:this.props.onHyperlinkEnter});
	}

	,componentWillUnmount :function() {
		this.clearMarker();
	}

	,onUpdateMarkup :function (trait) {
		var m=this.props.markups[this.state.idx];
		var mtrait=m.markup.trait;
		if (!mtrait) mtrait=m.markup.trait={};
		for (var i in trait) {
			mtrait[i]=trait[i];
		}
		this.props.onChanged&&this.props.onChanged(m.doc);	
	}

	,onDeleteMarkup :function () {
		var m=this.props.markups[this.state.idx].markup;
		this.props.onDelete(m,this.state.typedef);
		//this is a hack, because shouldComponentUpdate return false
		this.setState({M:null,markupeditor:null});
		this.forceUpdate();
	}

	,renderTypedef :function() {
		return (this.state.typedef)?this.state.typedef.label:"";
	}
	,render :function() {
		if (!this.props.markups.length || !this.props.getOther) {
			this.clearMarker();
			return React.createElement("span", null)
		}

		return React.createElement("span", null, 
				this.renderMarkupPicker(), 
				this.renderTypedef(), 
				this.state.markupeditor?E(this.state.markupeditor,{
					editing:true,markup:this.state.M
					,deletable:this.state.deletable
					,onUpdateMarkup:this.onUpdateMarkup
					,onDeleteMarkup:this.onDeleteMarkup
				}):null, 
				this.renderTarget(), 
				this.renderOthers()				
		)
	}
});
module.exports=MarkupSelector;
},{"../markuptypedef/":"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\index.js","./rangehyperlink":"C:\\ksana2015\\pannaloka\\src\\components\\rangehyperlink.js","react":"react"}],"C:\\ksana2015\\pannaloka\\src\\components\\rangehyperlink.js":[function(require,module,exports){
var React=require("react");
var E=React.createElement;
var PureRender=require('react-addons-pure-render-mixin');

var styles={hyperlink:{cursor:"pointer",color:"blue",fontSize:"75%"},label:{fontSize:"75%"}};

var RangeHyperlink = React.createClass({displayName: "RangeHyperlink",
	getIdx :function (e) {
		var domnode=e.target;
		while (domnode && (!domnode.dataset || !domnode.dataset.idx)) {
			domnode=domnode.parentElement;
		} 
		if (domnode) {
			var idx=parseInt(domnode.dataset.idx);
			return idx;			
		}
	}

	,onClick :function (e) {
		var idx=this.getIdx(e);
		var item=this.props.ranges[idx];
		this.props.onHyperlinkClick && this.props.onHyperlinkClick(item[0],item[1]);
	}

	,onMouseEnter :function (e) {
		var idx=this.getIdx(e);
		var item=this.props.ranges[idx];
		if (idx!==this.hovering) {
			this.hovering=idx;
			this.forceUpdate();
		}
		this.hovering=idx;
		
		this.props.onHyperlinkEnter && this.props.onHyperlinkEnter(item[0],item[1]);
	}


	,renderItem :function (item,idx)  {
		var rendered=(this.props.renderItem)?this.props.renderItem(item,idx,this.hovering):null;
		if (!rendered) {
			var text=item[2];
			if (text.length>8) text=item[2].substring(0,7)+"…";			
			rendered=React.createElement("span", {key: idx}, " | ", React.createElement("span", {className: "rangehyperlink", style: styles.hyperlink, "data-idx": idx, 
				title: item[3]||item[0], onMouseEnter: this.onMouseEnter, 
				onClick: this.onClick}, React.createElement("span", null, text))
				)
		}
		return rendered;
	}

	/* range format : file, mid_range , text */
	,renderRange :function (item,idx) {
		if (item[1]) {
			return this.renderItem(item,idx);
		} else {
			return React.createElement("span", {key: idx}, " | ", React.createElement("span", {style: styles.label, title: item[3]||item[0]}, item[2].substring(0,10)))
		}
	}

	,render :function() {
		return React.createElement("span", null, this.props.ranges.map(this.renderRange))
	}
});
module.exports=RangeHyperlink;
},{"react":"react","react-addons-pure-render-mixin":"C:\\ksana2015\\node_modules\\react-addons-pure-render-mixin\\index.js"}],"C:\\ksana2015\\pannaloka\\src\\components\\savebutton.js":[function(require,module,exports){
var React=require("react");
var Component=React.Component;

var styles={
	savebutton :{fontSize:"75%"}
	,saved:{background:"green",color:"yellow"}
}
var SaveButton = React.createClass({displayName: "SaveButton",

	getInitialState :function()	 {
		
		return {saved:false,countdown:60};
	}

	,componentWillReceiveProps :function(nextProps) {
		if (!nextProps.dirty && this.props.dirty) {
			this.setState({saved:true});
			setTimeout(function(){
				this.setState({saved:false});
			}.bind(this),1000);
		}
		if (nextProps.dirty ) {
			clearInterval(this.countdowntimer);
			this.setState({countdown:60});
			this.countdowntimer=setInterval(function(){
				if (this.state.countdown==0) {
					this.props.onSave();//autosave
					clearInterval(this.countdowntimer);
				}
				this.setState({countdown:this.state.countdown-1})
			}.bind(this),1000);
		}
	}

	,componentWillUnmount :function() {
		clearInterval(this.countdowntimer);
	}

	,render :function() {
		if (this.props.trait && this.props.trait.host==="google") return React.createElement("span", null)
		if (this.state.saved) {
			return React.createElement("span", {style: styles.saved}, "Saved!!")
		}
		if (this.props.dirty) {
			var countdown=this.state.countdown;
			if (countdown>10) countdown=Math.round(countdown/10)*10;
			return (React.createElement("span", null, 
					React.createElement("button", {style: styles.savebutton, onClick: this.props.onSave}, "Save in ", countdown+"s")
				));
		} else {
			return React.createElement("span", null)
		}
	}	
});
module.exports = SaveButton;

},{"react":"react"}],"C:\\ksana2015\\pannaloka\\src\\components\\selectionstatus.js":[function(require,module,exports){
var React=require("react");

var styles={
	unicode:{fontFamily:"courier"}
}
var SelectionStatus = React.createClass({displayName: "SelectionStatus",

	renderSelection :function(sels) {
		return sels.map(function(sel,idx){
			return React.createElement("span", {key: idx}, "["+sel[0]+(sel[1]?":"+sel[1]:"")+"]")
		});
	}

	,renderCh :function(ch) {
		if (!ch) return ;
		return React.createElement("span", {style: styles.unicode, key: "ch", title: ch}, "U+", ch.charCodeAt(0).toString(16).toUpperCase())
	}
	,render :function() {
		
		var out=[],c=0;
		for (var i in this.props.selections) {
			if (!this.props.selections[i].length) continue;
			out.push(React.createElement("span", {key: c++}, "(", i, ")"))
			out.push(React.createElement("span", {key: c++}, this.renderSelection(this.props.selections[i])));
		}

		if (out.length) out.unshift(React.createElement("span", {key: "name"}, ", sels:"));
	
		return React.createElement("span", null, "|", this.renderCh(this.props.cursorch), out)
	}	
});
module.exports = SelectionStatus;
},{"react":"react"}],"C:\\ksana2015\\pannaloka\\src\\components\\stackwidgetmenu.js":[function(require,module,exports){
var React=require("react");
var Component=React.Component;

var StackWidgetMenu = React.createClass({displayName: "StackWidgetMenu",
  render :function () {
  	return React.createElement("div", null, 
  		React.createElement("button", {onClick: this.props.onClose}, "Close")
  		)
  }
});
module.exports=StackWidgetMenu;
},{"react":"react"}],"C:\\ksana2015\\pannaloka\\src\\components\\textviewmenu.js":[function(require,module,exports){
var React=require("react");
var Component=React.Component;
var DocumentTitle=require("./documenttitle");
var SaveButton=require("./savebutton");
var PureRender=require('react-addons-pure-render-mixin');

var styles={
	menu : {background:"silver"}
}
TextViewMenu = React.createClass({displayName: "TextViewMenu",
  render :function() {
  	return React.createElement("span", {style: styles.menu}, 
  		
  		React.createElement(DocumentTitle, {title: this.props.trait.title, onSetTitle: this.props.onSetTitle, 
  		filename: this.props.trait.filename, 
      onSetFlexHeight: this.props.onSetFlexHeight, flex: this.props.trait.flex}), 

  		 this.props.readOnly?"(fixed text)":"", 

  			React.createElement(SaveButton, React.__spread({},  this.props))
  	)
  }
});
module.exports = TextViewMenu;
},{"./documenttitle":"C:\\ksana2015\\pannaloka\\src\\components\\documenttitle.js","./savebutton":"C:\\ksana2015\\pannaloka\\src\\components\\savebutton.js","react":"react","react-addons-pure-render-mixin":"C:\\ksana2015\\node_modules\\react-addons-pure-render-mixin\\index.js"}],"C:\\ksana2015\\pannaloka\\src\\components\\transclusion.js":[function(require,module,exports){
var React=require("react");
var Component=React.Component;
var PureRender=require('react-addons-pure-render-mixin');

var Transclusion = React.createClass({displayName: "Transclusion",
	render :function() {
		return React.createElement("span", {"data-mid": this.props.mid, title: this.props.title, 
			className: "transclusion", onClick: this.props.onClick}, this.props.text)
	}
});
module.exports=Transclusion;
},{"react":"react","react-addons-pure-render-mixin":"C:\\ksana2015\\node_modules\\react-addons-pure-render-mixin\\index.js"}],"C:\\ksana2015\\pannaloka\\src\\containers\\leftpanel.js":[function(require,module,exports){
var React=require("react");
var Component=React.Component;
var reactTab=require("react-tabs");
var Tab=reactTab.Tab , Tabs=reactTab.Tabs, TabList=reactTab.TabList, TabPanel=reactTab.TabPanel;
var FileList=require('../views/filelist');
var TreeList=require('../views/treelist');
var OutlinePanel=require("../views/outlinepanel");

var GoogleLogin=require("../google/googlelogin");

var styles={key:{fontSize:"110%",color:"darkblue",fontFamily:"monospace",textAlign:"center"},
section:{fontSize:"130%",textAlign:"center"},
desc:{textAlign:"center"}};
var Key = React.createClass({displayName: "Key",
  render :function() {
    return React.createElement("span", {style: styles.key}, React.createElement("br", null), this.props.children+" ")
  }
});
var Section = React.createClass({displayName: "Section",
  render :function() {
    return React.createElement("div", {style: styles.section}, React.createElement("br", null), this.props.children)
  }
});
var Desc = React.createClass({displayName: "Desc",
  render :function () {
    return React.createElement("span", {style: styles.desc}, this.props.children)
  }
});
var LeftPanel = React.createClass({displayName: "LeftPanel",
  getInitialState:function(){
    return {selectedIndex:0};
  }

	,componentWillReceiveProps:function (nextProps) {
		this.panelheight=nextProps.height-45;
		this.panelstyle={height:this.panelheight,overflowY:"auto"};		
	}

  ,switchToTree : function(){ 
    this.setState({selectedIndex:1});
  }

  ,localFileList : function(){ 
    if (this.props.localfilesystem) return React.createElement(TabPanel, null, 
        React.createElement("div", {style: this.panelstyle}, 
          React.createElement(FileList, null), 
          React.createElement(TreeList, {onOpenTree: this.switchToTree})
        )
      )
  }

  ,localTab : function(){ 
    if (this.props.localfilesystem)return  React.createElement(Tab, null, "Local File")
  }
  ,render :function() {
  	if (this.props.height<100) return React.createElement("div", null, "error height")

  	return React.createElement(Tabs, {
        onSelect: this.handleSelected, 
        selectedIndex: this.state.selectedIndex, 
        forceRenderTabPanel: true
      }, 
      React.createElement(TabList, null, 
          React.createElement(Tab, null, "Cloud"), 
          this.localTab(), 
          React.createElement(Tab, null, "Outline"), 
          React.createElement(Tab, null, "Help")
      ), 

      React.createElement(TabPanel, null, 
        React.createElement("div", {style: this.panelstyle}, 
          React.createElement(GoogleLogin, null)
        )
      ), 

      this.localFileList(), 

      React.createElement(TabPanel, null, 
	      React.createElement("div", {style: this.panelstyle}, 
        React.createElement("h2", null, React.createElement(OutlinePanel, null))
	  		)

      ), 
      React.createElement(TabPanel, null, 
	      React.createElement("div", {style: this.panelstyle}, 
        React.createElement(Section, null, "Markup"), 
          React.createElement(Key, null, "Ctrl-M"), 
          React.createElement(Desc, null, "Create/Delete Markup"), 
          React.createElement(Key, null, "Ctrl-L"), 
          React.createElement(Desc, null, "Create/Delete a transclusion"), 
          React.createElement(Key, null, "Ctrl-K"), 
          React.createElement(Desc, null, "Convert Text to Markup"), 
          React.createElement(Key, null, "Shift-Ctrl-K"), 
          React.createElement(Desc, null, "Convert Markup to Text"), 
        React.createElement(Section, null, "Editing"), 
          React.createElement(Key, null, "Ctrl-I"), 
          React.createElement(Desc, null, "Character information"), 
          React.createElement(Key, null, "Ctrl-Z"), 
          React.createElement(Desc, null, "Undo"), 
          React.createElement(Key, null, "Ctrl-Y"), 
          React.createElement(Desc, null, "Redo"), 
          React.createElement(Key, null, "Ctrl-S"), 
          React.createElement(Desc, null, "Save Immediately"), 
          React.createElement(Key, null, "Ctrl-Q"), 
          React.createElement(Desc, null, "Close the editing file"), 
        React.createElement(Section, null, "Search and Replace"), 
            React.createElement(Key, null, "Ctrl-F"), 
            React.createElement(Desc, null, "Start searching"), 
            React.createElement(Key, null, "Ctrl-G"), 
            React.createElement(Desc, null, "Find next"), 
            React.createElement(Key, null, "Shift-Ctrl-G"), 
            React.createElement(Desc, null, "Find previous"), 
            React.createElement(Key, null, "Shift-Ctrl-F"), 
            React.createElement(Desc, null, "Replace"), 
            React.createElement(Key, null, "Shift-Ctrl-R"), 
            React.createElement(Desc, null, "Replace all")
  			)
      )

  	)
  }
});
module.exports = LeftPanel;
},{"../google/googlelogin":"C:\\ksana2015\\pannaloka\\src\\google\\googlelogin.js","../views/filelist":"C:\\ksana2015\\pannaloka\\src\\views\\filelist.js","../views/outlinepanel":"C:\\ksana2015\\pannaloka\\src\\views\\outlinepanel.js","../views/treelist":"C:\\ksana2015\\pannaloka\\src\\views\\treelist.js","react":"react","react-tabs":"C:\\ksana2015\\node_modules\\react-tabs\\lib\\main.js"}],"C:\\ksana2015\\pannaloka\\src\\containers\\main.js":[function(require,module,exports){
var React=require("react");
var ReactDOM=require("react-dom");
var Component=React.Component;
var MainMenu=require('./mainmenu');
var LeftPanel=require('./leftpanel');
var RightPanel=require('./rightpanel');
var StatusPanel=require('./statuspanel');
var Overlay=require("../views/overlay");
var socketfs=require("../socketfs");
var styles={
	Body:{fontSize:"150%"}
	,Main:{display:"flex"}
	,LeftPanel:{flex:2,overflowY:"hidden"}
	,RightPanel:{flex:6,overflowY:"auto",background:"silver"}
}

var Main=React.createClass({displayName: "Main",
	getInitialState:function(){
		return {height:0};
	}
	,componentDidMount :function() {
		this.setHeight();
		window.onresize = this.resize;
	}
	, setHeight :function(){
		var height=window.innerHeight-ReactDOM.findDOMNode(this.refs.mainmenu).style.height-30; //
		this.refs.leftpanel.style.height=height;
		this.refs.rightpanel.style.height=height;
		this.setState({height});
	}

	,resize:function() {
		clearTimeout(this.resizetimer);
		this.resizetimer=setTimeout(function(){
			this.setHeight();
		}.bind(this),200);
	}

  ,render:function () {
  	return   	React.createElement("div", null, 
  		React.createElement("div", {style: styles.Body}, 
  			React.createElement(MainMenu, {ref: "mainmenu"}), 
  		React.createElement("div", {ref: "scrollstart", style: styles.Main}, 
  			React.createElement("div", {ref: "leftpanel", style: styles.LeftPanel}, 
  				React.createElement(LeftPanel, {height: this.state.height, localfilesystem: socketfs.ready()})
  			), 
  			React.createElement("div", {ref: "rightpanel", style: styles.RightPanel}, 
  				React.createElement(RightPanel, {height: this.state.height})				
  			)
  		)
  	), 
  	React.createElement(Overlay, null)
  )
  }
});
module.exports=Main;
},{"../socketfs":"C:\\ksana2015\\pannaloka\\src\\socketfs.js","../views/overlay":"C:\\ksana2015\\pannaloka\\src\\views\\overlay.js","./leftpanel":"C:\\ksana2015\\pannaloka\\src\\containers\\leftpanel.js","./mainmenu":"C:\\ksana2015\\pannaloka\\src\\containers\\mainmenu.js","./rightpanel":"C:\\ksana2015\\pannaloka\\src\\containers\\rightpanel.js","./statuspanel":"C:\\ksana2015\\pannaloka\\src\\containers\\statuspanel.js","react":"react","react-dom":"react-dom"}],"C:\\ksana2015\\pannaloka\\src\\containers\\mainmenu.js":[function(require,module,exports){
var React=require("react");
var Component=React.Component;
var StackWidgetMainMenu=require("../views/stackwidgetmainmenu");
var MarkupPanel=require("../views/markuppanel");
var InputMethod=require("../views/inputmethod");
var docfilestore=require("../stores/docfile");

var styles={
	container:{display:"flex"}
	,left:{flex:2}
	,right:{flex:6}
	,banner:{borderRadius:"0.25em"}
	//background:"-webkit-radial-gradient(center, ellipse cover, #f1da36 0%,gray 70%)"}
}
var MainMenu = React.createClass({displayName: "MainMenu",
	getInitialState:function(){
		return {ime:0};
	}
	,changeTheme :function() {
		var docs=docfilestore.getDocs();
		document.body.classList.toggle("darktheme");
		var dark=document.body.classList.contains("darktheme");

		docs.map(function(d){
			d.getEditor().setOption("theme", dark?"ambiance":"");
		});

		localStorage.setItem("lighttheme",!dark);
	}
	,setIME :function(ime) {
		localStorage.setItem("ime",ime);
		this.setState({ime:ime});
	}
	,componentDidMount :function () {
		if (localStorage.getItem("lighttheme")=="true"){
			this.changeTheme();
		}
		var ime=parseInt(localStorage.getItem("ime")||"1");
		if (ime)this.setIME(ime);			
	}
	,toggleIME :function () {
		this.setIME(-this.state.ime);
	}

  ,render :function () {
  	return React.createElement("div", {style: styles.container}, 
  	React.createElement("div", {style: styles.left}, 

  	React.createElement("span", {style: styles.banner, title: "2015.10.31"}, "智", 
  	React.createElement("span", {style: {cursor:"pointer"}, onClick: this.toggleIME}, "慧"), 
  	React.createElement("span", {style: {cursor:"pointer"}, onClick: this.changeTheme}, "光"))
  	), 
  	React.createElement("div", {style: styles.right}, 
  	React.createElement(MarkupPanel, null), 
  	React.createElement(InputMethod, {ime: this.state.ime, onSetIME: this.setIME})
  	
  	)

  	)
  }
});
module.exports=MainMenu;
},{"../stores/docfile":"C:\\ksana2015\\pannaloka\\src\\stores\\docfile.js","../views/inputmethod":"C:\\ksana2015\\pannaloka\\src\\views\\inputmethod.js","../views/markuppanel":"C:\\ksana2015\\pannaloka\\src\\views\\markuppanel.js","../views/stackwidgetmainmenu":"C:\\ksana2015\\pannaloka\\src\\views\\stackwidgetmainmenu.js","react":"react"}],"C:\\ksana2015\\pannaloka\\src\\containers\\rightpanel.js":[function(require,module,exports){
var React=require("react");
var Component=React.Component;
var StackWidgetList=require('../views/stackwidgetlist')

var RightPanel = React.createClass({displayName: "RightPanel",
  render :function() {
  	if (this.props.height<100) return React.createElement("div", null, "invalid height")

  	return React.createElement("div", null, 
  		React.createElement(StackWidgetList, {height: this.props.height})
  	)
  }
});
module.exports = RightPanel ;
},{"../views/stackwidgetlist":"C:\\ksana2015\\pannaloka\\src\\views\\stackwidgetlist.js","react":"react"}],"C:\\ksana2015\\pannaloka\\src\\containers\\stackwidget.js":[function(require,module,exports){
var React=require("react");
var ReactDOM=require("react-dom");
var Component=React.Component;
var PureRender=require('react-addons-pure-render-mixin');

var WidgetClasses=require("../views/widgetclasses");

var style={borderBottom:"1px solid silver"};

var StackWidget = React.createClass({displayName: "StackWidget",
	updateHeight : function() {
		ReactDOM.findDOMNode(this).style.height=this.props.height;
	}
	,componentDidMount :function() {
		this.updateHeight();
	}
	,componentDidUpdate :function() {
		this.updateHeight();
	}
	,renderWidget:function() {
		var widgetclass=this.props.widgetClass||"SimpleView";
		var widget=WidgetClasses[widgetclass];
		if (!widget){
			throw "cannot load widget "+widgetclass;
		}
		return React.createElement(widget,this.props);
	}

	,render :function() {
		return React.createElement("div", {style: style}, 
			this.renderWidget()
		)
	}
});
module.exports = StackWidget;
},{"../views/widgetclasses":"C:\\ksana2015\\pannaloka\\src\\views\\widgetclasses.js","react":"react","react-addons-pure-render-mixin":"C:\\ksana2015\\node_modules\\react-addons-pure-render-mixin\\index.js","react-dom":"react-dom"}],"C:\\ksana2015\\pannaloka\\src\\containers\\statuspanel.js":[function(require,module,exports){
var React=require("react");
var Component=React.Component;
var StatusView=require("../views/statusview");

var StatusPanel = React.createClass({displayName: "StatusPanel",
  render :function() {
  	return React.createElement("div", null, React.createElement(StatusView, null))
  }
});
module.exports = StatusPanel;
},{"../views/statusview":"C:\\ksana2015\\pannaloka\\src\\views\\statusview.js","react":"react"}],"C:\\ksana2015\\pannaloka\\src\\google\\clientid.js":[function(require,module,exports){
var clientId="87253189434-k0e445bs8e5mgcvcp2loo46rbir6fuou.apps.googleusercontent.com";
var AppId="87253189434";
var clientSecret="FMs8q0mA18laYc29WqbIF2yB";
module.exports={clientId:clientId,clientSecret:clientSecret,AppId:AppId};
},{}],"C:\\ksana2015\\pannaloka\\src\\google\\googlelogin.js":[function(require,module,exports){
var React=require("react");
var clientId=require("./clientid").clientId;
var AppId=require("./clientid").AppId;
var action=require("./realtimeaction");
var store=require("./realtimestore");
var LoggedIn=require("./loggedin");
var styles={loginButton:{fontSize:"125%"}};
var GoogleLogin=React.createClass({displayName: "GoogleLogin",
	getInitialState:function(){
		return {authorized:false};
	}
	,componentDidMount:function(){
		window.gapi.load('auth:client,drive-realtime,drive-share', function(){
			this.realtimeUtils = new utils.RealtimeUtils({ clientId: clientId });
			action.setRealtimeUtils(this.realtimeUtils);
	    this.authorize();
		}.bind(this));
	}
	,authorize:function(){
 		this.realtimeUtils.authorize(function(response){
 			if (response.error) {
 				//must attach eventListener , React Onclick doesn't work
          var button = document.getElementById('auth_button');
          button.addEventListener('click', function () {
            this.realtimeUtils.authorize(function(response){
              action.loggedIn(response);
            }, true);
          }.bind(this));
 			}

      if(!response.error){
        action.loggedIn(response);
        this.setState({authorized:true});
      }
    }.bind(this), false);
	}
	,render:function(){
			if (!this.state.authorized) {
				return React.createElement("button", {style: styles.loginButton, id: "auth_button"}, "Login")
			} else {
				return React.createElement(LoggedIn, null)
			}
	}
})
module.exports=GoogleLogin;
},{"./clientid":"C:\\ksana2015\\pannaloka\\src\\google\\clientid.js","./loggedin":"C:\\ksana2015\\pannaloka\\src\\google\\loggedin.js","./realtimeaction":"C:\\ksana2015\\pannaloka\\src\\google\\realtimeaction.js","./realtimestore":"C:\\ksana2015\\pannaloka\\src\\google\\realtimestore.js","react":"react"}],"C:\\ksana2015\\pannaloka\\src\\google\\loggedin.js":[function(require,module,exports){
var React=require("react");
var Reflux=require("reflux");
var realtimeaction=require("./realtimeaction");

var realtimestore=require("./realtimestore");
var AppId=require("./clientid").AppId;
var stackwidgetaction=require("../actions/stackwidget");
var googledrive=require("../textview/googledrive");
var styles={openButton:{fontSize:"125%"},createButton:{fontSize:"125%"},openURL:{fontSize:"125%"}};
var RecentFiles=require("./recentfiles");
var docOf=require("../stores/docfile").docOf;
var GooglePanel=React.createClass({displayName: "GooglePanel",
	mixins:[Reflux.listenTo(realtimestore,"onRecentFiles")]
	,getInitialState:function(){
		return {recentfiles:realtimestore.getRecentFiles(),opening:null};
	}
	,componentDidMount:function(){
		var m=decodeURI(location.search).match(/"ids":(\[.*?\])/);
		if (m) {
			try {
				var fileIds=JSON.parse(m[1]);	
				fileIds.map(function(fileid){googledrive.openFile(fileid)});				
			} catch(e) {
				console.log(m[1])
				console.error(e);
			}
		}
	}
	,onRecentFiles:function(files) {
		this.setState({recentfiles:files});
	}
	,openFile:function(fileid,title,opts) {
		this.setState({opening:fileid});
		realtimeaction.openFile(fileid, title, opts,this.onFileLoaded);
	}
	,openCallback:function(res){
		if (res.action==="picked"){
			for (var i in res.docs) this.openFile(res.docs[i].id, res.docs[i].name);
		}
		if (res.action!=="loaded") {
			this.enableButtons();
		}
	}
	,pickFile:function() {
		this.disableButtons();
		google.load('picker', '1', {
        callback: function() {
          var picker, token, view;
          token = gapi.auth.getToken().access_token;
          view = new google.picker.View(google.picker.ViewId.DOCS);
          view.setMimeTypes("application/vnd.google-apps.drive-sdk." + AppId);
          //view.setMimeTypes("text/plain");
          picker = new google.picker.PickerBuilder()
          .enableFeature(google.picker.Feature.NAV_HIDDEN)
          .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
          .setAppId(AppId).setOAuthToken(token).addView(view)
          //.addView(new google.picker.DocsUploadView())
          .setCallback(this.openCallback).build();
          return picker.setVisible(true);
        }.bind(this)
    });
	}
	,onFileLoaded:function(doc){
		this.enableButtons();
	}
	,onFileInitialize:function(model) {
  	var string = model.createString();
    string.setText('file on Google drive');

    var markups= model.createMap();
    model.getRoot().set('text', string);
    model.getRoot().set('markups',markups);
	}
	,openURL:function(){
		var url=prompt("url").replace("https://drive.google.com/open?id=","");
		this.setState({opening:url});
		googledrive.openFile(url);
	}
	,disableButtons:function(){
		this.refs.openbutton.disabled=true;
		this.refs.createbutton.disabled=true;
		this.refs.openurlbutton.disabled=true;
	}
	,enableButtons:function(){
		this.refs.openbutton.disabled=false;
		this.refs.createbutton.disabled=false;
		this.refs.openurlbutton.disabled=false;
		this.setState({opening:null});
	}
	,recentClick:function(fileid){
		if (docOf(fileid))return;
		this.disableButtons();
		this.setState({opening:fileid});
		googledrive.openFile(fileid,{},this.onFileLoaded);
	}
	,createFile:function() {
		this.disableButtons();
		var title='New File(click to change)';
		this.title=title;

		realtimeaction.createFile(title, function(createResponse) {
         //window.history.pushState(null, null, '?id=' + createResponse.id);
         realtimeaction.openFile(createResponse.id, title, {},this.onFileLoaded, this.onFileInitialize);
    }.bind(this));
	}
	,render:function() {
		return React.createElement("span", null, 
		React.createElement("button", {style: styles.openButton, ref: "openbutton", onClick: this.pickFile}, "Open"), 
		React.createElement("button", {style: styles.createButton, ref: "createbutton", onClick: this.createFile}, "Create"), 
		React.createElement("button", {style: styles.openURL, ref: "openurlbutton", onClick: this.openURL}, "Open File Id"), 
		React.createElement(RecentFiles, {opening: this.state.opening, files: this.state.recentfiles, onOpenFile: this.recentClick})
		)
	}
});
module.exports=GooglePanel;
},{"../actions/stackwidget":"C:\\ksana2015\\pannaloka\\src\\actions\\stackwidget.js","../stores/docfile":"C:\\ksana2015\\pannaloka\\src\\stores\\docfile.js","../textview/googledrive":"C:\\ksana2015\\pannaloka\\src\\textview\\googledrive.js","./clientid":"C:\\ksana2015\\pannaloka\\src\\google\\clientid.js","./realtimeaction":"C:\\ksana2015\\pannaloka\\src\\google\\realtimeaction.js","./realtimestore":"C:\\ksana2015\\pannaloka\\src\\google\\realtimestore.js","./recentfiles":"C:\\ksana2015\\pannaloka\\src\\google\\recentfiles.js","react":"react","reflux":"C:\\ksana2015\\node_modules\\reflux\\index.js"}],"C:\\ksana2015\\pannaloka\\src\\google\\realtimeaction.js":[function(require,module,exports){
module.exports=require("reflux").createActions(["loggedIn","openFile","createFile","setRealtimeUtils"]);
},{"reflux":"C:\\ksana2015\\node_modules\\reflux\\index.js"}],"C:\\ksana2015\\pannaloka\\src\\google\\realtimestore.js":[function(require,module,exports){
var Reflux=require("reflux");
var stackwidgetaction=require("../actions/stackwidget");
var docOf=require("../stores/docfile").docOf;

var realtimestore=Reflux.createStore({
	listenables:[require("./realtimeaction")]
	,init:function() {
		this.recentFiles=JSON.parse(localStorage.getItem("recentfiles")||"[]");
	}
	,onLoggedIn:function(response) {
		this.response=response;
		//console.log(response);
	}
	,onSetRealtimeUtils:function(realtimeUtils) {
		this.realtimeUtils=realtimeUtils;
	}
	,getRealtimeUtils:function(){
		return this.realtimeUtils;
	}
	,onCreateFile:function(title,cb){
		this.realtimeUtils.createRealtimeFile(title,cb);
	}
	,addRecentFile:function(fileid,title){
		this.recentFiles=this.recentFiles.filter(function(recent){return recent[0]!==fileid});
		this.recentFiles.unshift([fileid,title]);
		this.trigger(this.recentFiles);
		localStorage.setItem("recentfiles",JSON.stringify(this.recentFiles));
	}
	,getRecentFiles:function(){
		return this.recentFiles;
	}
	,onOpenFile:function(docid,title,opts,cb,onFileInitialized){
		if (docOf(docid))return;
		this.realtimeUtils.load(docid, function(doc){
    	var obj={filename:docid,host:"google",doc:doc,title:title};
    	stackwidgetaction.openWidget(obj,"TextWidget",opts);
    	this.addRecentFile(docid,title);
    	if (cb) cb();
    }.bind(this),onFileInitialized);
	}
});
module.exports=realtimestore;
},{"../actions/stackwidget":"C:\\ksana2015\\pannaloka\\src\\actions\\stackwidget.js","../stores/docfile":"C:\\ksana2015\\pannaloka\\src\\stores\\docfile.js","./realtimeaction":"C:\\ksana2015\\pannaloka\\src\\google\\realtimeaction.js","reflux":"C:\\ksana2015\\node_modules\\reflux\\index.js"}],"C:\\ksana2015\\pannaloka\\src\\google\\recentfiles.js":[function(require,module,exports){
var React=require("react");
var styles={normal:{},hovered:{color:"blue",textDecoration:"underline",cursor:"pointer"}};

var RecentFiles=React.createClass({displayName: "RecentFiles",
	onClick:function(e){
		this.props.onOpenFile&&this.props.onOpenFile(e.target.dataset.fileid);
	}
	,getInitialState:function(){
		return {hovering:-1};
	}
	,onMouseEnter:function(e) {
		this.setState({hovering:parseInt(e.target.dataset.idx)});
	}
	,onMouseLeave:function(e) {
		this.setState({hovering:-1});
	}
	,renderItem:function(item,idx){
		return React.createElement("div", {style: idx==this.state.hovering?styles.hovered:styles.normal, 
		"data-idx": idx, key: idx, onMouseEnter: this.onMouseEnter, onMouseLeave: this.onMouseLeave, 
		title: item[0], "data-fileid": item[0], onClick: this.onClick}, item[1])
	}
	,render:function(){
		if (this.props.opening) {
			return React.createElement("div", null, "Opening file ", this.props.opening)
		} else {
			return React.createElement("div", null, this.props.files.map(this.renderItem))	
		}
	}
});
module.exports=RecentFiles;
},{"react":"react"}],"C:\\ksana2015\\pannaloka\\src\\index.js":[function(require,module,exports){
var React=require('react');
var ReactDOM=require('react-dom');
var Main=require('./containers/main');
//import {Main} from './oldmain';
//var Main=require('./oldmain');

ReactDOM.render(React.createElement(Main), document.getElementById('root'));

},{"./containers/main":"C:\\ksana2015\\pannaloka\\src\\containers\\main.js","react":"react","react-dom":"react-dom"}],"C:\\ksana2015\\pannaloka\\src\\markup\\find.js":[function(require,module,exports){
var byMasterText=function(text,markups) {
	var out=[];
	for (var key in markups) {
		var m=markups[key].handle;
		if (!m)continue;
		var pos=m.find();
		if (!pos.to) continue;
		if (pos.from.line!==pos.to.line) continue;//cross line
		var len=pos.to.ch-pos.from.ch;
		if (len!==text.length) continue;
		var rangetext=m.doc.getRange(pos.from,pos.to);
		if (rangetext===text){
			out.push(m.key);
		}
	}
	return out;
}
module.exports={byMasterText:byMasterText};
},{}],"C:\\ksana2015\\pannaloka\\src\\markup\\nav.js":[function(require,module,exports){
/*sort markup by position, group by type */
var docfilestore=require("../stores/docfile");
var byFile={};
var allmarkups=null;

var sortByPos=function(arr){
	arr.sort(function(a,b){
		return a[1]===b[1]? (a[2]-b[2]) : a[1]-b[1];
	});
}
// this function must be call when ever add/remove of markups
// if type is not given, all types will be rebuilt
var rebuild=function(file,type) { 
	if (!allmarkups)return;

	var byType=byFile[file];
	if (!byType) byType=byFile[file]={};

	if (type) {
		byFile[file][type]=byType[type]=[];
	} else {
		byFile[file]=byType={};
	}

	for (var key in allmarkups) {

		var M=allmarkups[key];
		if (type && M.className!==type) continue;

		if (!byType[M.className]) byType[M.className]=[];
		var pos=M.handle.find();
		if (!pos.from) continue;//bookmark

		var posarr=[key, pos.from.line, pos.from.ch];

		byType[M.className].push(posarr);
	}	
	if (type) {
		sortByPos(byType[type]);
	} else {
		for (var t in byType) sortByPos(byType[t]);
	}
}

var setMarkups=function(markups,filename,norebuild) {
	allmarkups=markups;
	if (!norebuild) rebuild(filename);
}

var next=function(markup) { // O(N)
	if (!markup||!markup.handle) return;
	var file=docfilestore.fileOf(markup.handle.doc);
	var byType=byFile[file];
	if (!byType)return;

	var type=markup.className;
	var arr=byType[type];
	if (!arr||!arr.length)return;
	for (var i=0;i<arr.length;i++) {
		if (arr[i][0]==markup.key) {
			if (i===arr.length-1) return arr[0][0];
			else return arr[i+1][0];
		}
	}
}
var prev=function(markup) { //O(N)
	if (!markup||!markup.handle) return;
	var file=docfilestore.fileOf(markup.handle.doc);
	var byType=byFile[file];
	if (!byType)return;

	var type=markup.className;
	var arr=byType[type];
	if (!arr||!arr.length)return;
	for (var i=0;i<arr.length;i++) {
		if (arr[i][0]==markup.key) {
			if (i===0) return arr[arr.length-1][0];
			else return arr[i-1][0];
		}
	}
}

module.exports={next:next,prev:prev,rebuild:rebuild,setMarkups:setMarkups};
},{"../stores/docfile":"C:\\ksana2015\\pannaloka\\src\\stores\\docfile.js"}],"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\actionbutton.js":[function(require,module,exports){
var React=require("react");
var E=React.createElement;
var styles={input:{fontSize:"100%"},deletebutton:{color:"red"}};
var ActionButton=React.createClass({displayName: "ActionButton",
	getHandler:function() {
		var handler=this.props.editing?this.props.onUpdateMarkup:this.props.onCreateMarkup;
		this.props.setHotkey&&this.props.setHotkey(handler);
		return handler;
	}
	,deleteButton:function(){
		if (this.props.editing && !this.props.dirty && this.props.deletable ) {
			return E("button",{title:"Ctrl+M",onClick:this.props.onDeleteMarkup,style:styles.deletebutton},"DELETE")
		}
	}
	,render:function () {
		var buttontext=this.props.editing?(this.props.dirty?"Update":null):"Create";
		return E("span",null
			,(buttontext?E("button",{title:"Ctrl+M",onClick:this.getHandler()},buttontext):null)
			,this.deleteButton()
		);
	}
});
module.exports=ActionButton;
},{"react":"react"}],"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\context.js":[function(require,module,exports){
var React=require("react");
var E=React.createElement;
var ActionButton=require("./actionbutton");
var ContextMember=require("./contextmember");
var getMemberMarkup=require("./validatecontext").getMemberMarkup;
var markupaction=require("../actions/markup");

var ContextAttributeEditor=React.createClass({displayName: "ContextAttributeEditor",
	getInitialState:function() {
		var attr1=(this.props.markup&&this.props.markup.trait)?this.props.markup.trait.attr1:"";
		return {attr1:attr1,dirty:false,member:getMemberMarkup(this.props.selections)||[]
		,filename:this.getFilenameFromSelection()};
	}
	,onCreateMarkup:function() {
		var def=this.state.member[0];
		var memberkeys=this.state.member.map(function(m){return m.key});
		memberkeys.shift();
		def.handle.member=memberkeys;
		var pos=def.handle.find();
		markupaction.editMarkup(def);
		def.handle.doc.getEditor().react.setDirty();
	}
	,getFilenameFromSelection:function(selections) {
		var keys=Object.keys(selections||this.props.selections);
		if (keys.length) return keys[0];
	}
	,componentWillReceiveProps:function(nextprops) {
		var attr1=(nextprops.markup&&nextprops.markup.trait)?nextprops.markup.trait.attr1:"";

		this.setState({attr1:attr1,member:getMemberMarkup(nextprops.selections)||[],
			filename:this.getFilenameFromSelection(nextprops.selections)});
	}
	,setMember:function(member) {
		this.setState({member:member});
	}
	,render:function() {
		return E("span",null
			,React.createElement(ActionButton, {
			   setHotkey: this.props.setHotkey, 
			   dirty: this.state.dirty, 
				 onCreateMarkup: this.onCreateMarkup})
			,React.createElement(ContextMember, {member: this.state.member, 
				filename: this.state.filename, removable: true, 
				setMember: this.setMember})
			);
	}
})
module.exports=ContextAttributeEditor;
},{"../actions/markup":"C:\\ksana2015\\pannaloka\\src\\actions\\markup.js","./actionbutton":"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\actionbutton.js","./contextmember":"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\contextmember.js","./validatecontext":"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\validatecontext.js","react":"react"}],"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\contextmember.js":[function(require,module,exports){
var React=require("react");
var E=React.createElement;
var PT=React.PropTypes;
var highlight=require("../textview/highlight");
var docfilestore=require("../stores/docfile");
var RangeHyperlink=require("../components/rangehyperlink");
var isDefinition=require("./validatecontext").isDefinition;
var styles={deletehyperlink:{cursor:"pointer",color:"yellow",background:"red",fontSize:"75%"
,borderRadius:"5px",cursor:"no-drop"},label:{fontSize:"75%"}};
var ContextMember=React.createClass({displayName: "ContextMember",
	propTypes:{
		"member":PT.array.isRequired
		,"setMember":PT.func
		,"sideButton":PT.func
		,"onSideButtonClick":PT.func
		,"filename":PT.string.isRequired
	}
	,onHyperlinkClick:function(file,mid) {
		var doc=docfilestore.docOf(file);
		if (doc) { //already in view , open the target
			var m=doc.getEditor().react.getMarkup(mid);
			highlight.autoGoMarkup(m);
		} else {
			highlight.gotoRangeOrMarkupID(file,mid,{autoOpen:true});	
		}
	}
	,onHyperlinkEnter:function(file,mid) {
		var doc=docfilestore.docOf(file);
		var m=doc.getEditor().react.getMarkup(mid);
		highlight.highlightRelatedMarkup(m);
	}
	,onDeleteClick:function(e) {
		var idx=parseInt(e.target.parentElement.dataset.idx);
		if (!idx)return;
		var member=this.props.member.filter(function(m,i){
			return i!==idx;
		});
		this.props.setMember(member);
	}
	,renderItem:function(item,idx,hovering) {
		if (!idx || idx!==hovering || !this.props.removable) return false; //hand over to default
		return React.createElement("span", {key: idx, "data-idx": idx}, " | ", React.createElement("span", {title: "從情境移除", 
			className: "rangehyperlink", style: styles.deletehyperlink, 
			onClick: this.onDeleteClick}, item[2]))
	}
	,getMasterTerm:function(filename) {
		if (!this.props.member || !this.props.member[0] ||  !this.props.member[0].handle) return;
		var doc=docfilestore.docOf(filename);
		return highlight.getMarkupText(doc,this.props.member[0].handle);
	}
	,render:function() {
		var getTypeLabel=require("./types").getTypeLabel; //not available when this file is loaded
		var ranges=this.props.member.map(function(m,idx){
			var label=getTypeLabel(m.className);
			var firstDef=idx||!isDefinition(m);
			return [this.props.filename,m.key,
			   firstDef?label:this.getMasterTerm(this.props.filename)
				,firstDef?"從情境移除":"設定情境"];
		}.bind(this));

		return React.createElement(RangeHyperlink, {ranges: ranges, renderItem: this.renderItem, 
			onHyperlinkClick: this.onHyperlinkClick, 
			onHyperlinkEnter: this.onHyperlinkEnter})
	}	
});
module.exports=ContextMember;

},{"../components/rangehyperlink":"C:\\ksana2015\\pannaloka\\src\\components\\rangehyperlink.js","../stores/docfile":"C:\\ksana2015\\pannaloka\\src\\stores\\docfile.js","../textview/highlight":"C:\\ksana2015\\pannaloka\\src\\textview\\highlight.js","./types":"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\types.js","./validatecontext":"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\validatecontext.js","react":"react"}],"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\definition.js":[function(require,module,exports){
var React=require("react");
var E=React.createElement;
var styles={input:{border:"0px",fontSize:"100%",outline:0,borderBottom:"1px solid "}};
var ActionButton=require("./actionbutton");
var getMember=require("./validatecontext").getMember;
var ContextMember=require("./contextmember");
var docfilestore=require("../stores/docfile");
var DefinitionAttributeEditor=React.createClass({displayName: "DefinitionAttributeEditor",
	getInitialState:function() {
		var attr1=(this.props.markup&&this.props.markup.trait)?this.props.markup.trait.attr1:"";
		return {attr1:attr1,dirty:false,filename:this.getFilename()};
	}
	,onCreateMarkup:function() {
		this.props.onCreateMarkup({attr1:this.state.attr1});
	}
	,onUpdateMarkup:function() {
		this.props.onUpdateMarkup({attr1:this.state.attr1});
		this.setState({dirty:false});
	}
	,getFilename:function(markup) {
		markup=markup||this.props.markup;
		if (!markup || !markup.handle) return;
		return docfilestore.fileOf(markup.handle.doc);
	}
	,componentWillReceiveProps:function(nextprops) {
		var attr1=(nextprops.markup&&nextprops.markup.trait)?nextprops.markup.trait.attr1:"";
		this.setState({attr1:attr1,filename:this.getFilename(nextprops.markup)});
	}
	,oAttr1Change(e) {
		this.setState({attr1:e.target.value,dirty:true});
	}
	,renderMember:function(){
		if (!this.props.markup)return;
		var member=getMember(this.props.markup);
		if (member.length) {
			return React.createElement("span", null, 
			"情境：", 
			React.createElement(ContextMember, {member: member, filename: this.state.filename}), 
			"。定義："
			)
		} else {
			return React.createElement("span", null, "選取含一個及以上標記的文字，以指定情境。定義：")
		}
	}
	,render:function() {
		return E("span",null
			,React.createElement(ActionButton, {
				 deletable: this.props.deletable, 
			   editing: this.props.editing, 
			   setHotkey: this.props.setHotkey, 
			   dirty: this.state.dirty, 
				 onCreateMarkup: this.onCreateMarkup, 
				 onDeleteMarkup: this.props.onDeleteMarkup, 
				 onUpdateMarkup: this.onUpdateMarkup})
				,this.renderMember()
			);
	}
})
module.exports=DefinitionAttributeEditor;
},{"../stores/docfile":"C:\\ksana2015\\pannaloka\\src\\stores\\docfile.js","./actionbutton":"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\actionbutton.js","./contextmember":"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\contextmember.js","./validatecontext":"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\validatecontext.js","react":"react"}],"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\defmarkupattr.js":[function(require,module,exports){
var React=require("react");
var ActionButton=require("./actionbutton");

var E=React.createElement;
var DefaultMarkupAttributeEditor=React.createClass({displayName: "DefaultMarkupAttributeEditor",
	getInitialState:function() {
		return {dirty:false};
	}
	,onCreateMarkup:function() {
		this.props.onCreateMarkup({});
	}
	,onUpdateMarkup:function() {
		this.props.onUpdateMarkup({});
	}
	,renderButton:function () {

		return React.createElement(ActionButton, {
				 deletable: this.props.deletable, 
			   editing: this.props.editing, 
			   setHotkey: this.props.setHotkey, 
				 onCreateMarkup: this.onCreateMarkup, 
				 onDeleteMarkup: this.props.onDeleteMarkup, 
				 onUpdateMarkup: this.onUpdateMarkup})

		//var buttontext=this.props.editing?(this.state.dirty?"Update":"|"):"Create";
		//if (buttontext) return E("button",{onClick:this.getHandler()},buttontext);
	}
	,getHandler:function() {
		var handler=this.props.editing?this.onUpdateMarkup:this.onCreateMarkup;
		return handler;
	}
	,render:function() {
		return E("span",null,
			this.renderButton()
		);
	}
});
module.exports=DefaultMarkupAttributeEditor;
},{"./actionbutton":"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\actionbutton.js","react":"react"}],"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\index.js":[function(require,module,exports){
var mark=require("./mark");
var types=require("./types").types;

var getAvailableType=function(selections) {
	var out=[];
	for (var i in types) {
		if (types[i].validate && types[i].validate(selections) && !types[i].hidden){
			out.push(i);
		}
	}
	return out;
}


module.exports={getAvailableType:getAvailableType, types:types,  
	milestone_novalidate:mark.milestone_novalidate};
},{"./mark":"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\mark.js","./types":"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\types.js"}],"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\mark.js":[function(require,module,exports){
var uuid=require('../uuid');
var validate=require('./validateselection');
var validatemilestone=require('./validatemilestone');
var util=require("./util");
var milestones=require("ksana-codemirror").milestones;
var MAX_LABEL=5;
var singleone=function(params, docOf, cb) {
	var selections=validate.singleone(params.selections);
	if (!selections) return ;
	var files=Object.keys(selections);
	var range=selections[files[0]][0];
	var key=uuid();

	var mrk={className:params.typename, trait:params.trait,from:range[0],to:range[1]};

	var doc=docOf(files[0]);

	cb(0, [{markup:mrk, doc:doc, key:key}]);

}
var milestone_novalidate=function(doc,range,trait) {
	var key=uuid();
	return {markup:{className:"milestone", trait:trait,
	from:range[0],to:range[1],automic:true,readOnly:true}
		,doc:doc,key:key};
}

var milestone=function(params, docOf, cb) {
	var selections=validatemilestone.milestone(params.selections);
	if (!selections) return ;
	var files=Object.keys(selections);
	var range=selections[files[0]][0];

	var doc=docOf(files[0]);
	var mrk=milestone_novalidate(doc,range,params.trait);
	cb(0, [mrk]);
}


var dualone=function(mark,docOf, cb) {
	var selections=validate.dualone(mark.selections);
	if (!selections) return ;

	var files=Object.keys(selections);
	var range1=selections[files[0]][0];
	var key1=uuid();

	var range2=selections[files[1]][0];
	var key2=uuid();

	var doc1=docOf(files[0]);
	var doc2=docOf(files[1]);

	var text1=getTrimedRangeText(doc1,range1); 
	var text2=getTrimedRangeText(doc2,range2); 


	var mrk1={className:mark.typename , trait:mark.trait, from:range1[0], to:range1[1], target:[files[1],key2,text2] };
	var mrk2={className:mark.typename+"2", from:range2[0], to:range2[1], target:[files[0],key1,text1]};
	

	cb(0, [{markup:mrk1, doc:doc1, key:key1}
				,{markup:mrk2, doc:doc2, key:key2}] );
}

var oneway=function(mark,docOf, cb) {
	var selections=validate.dualone(mark.selections);
	if (!selections) return ;

	var files=[];
	for (var i in selections) files.push(i);//cannot use Object.keys, files should not be sorted

	var range1=selections[files[0]][0];
	var key1=uuid();

	var range2=selections[files[1]][0];

	var doc1=docOf(files[0]);
	var doc2=docOf(files[1]);

	var text2=getTrimedRangeText(doc2,range2); 

	var packed=milestones.pack.call(doc2,[range2[0],range2[1]]);
	var mrk1={className:mark.typename, trait:mark.trait, from:range1[0], to:range1[1], 
		target:[files[1],packed,text2] };

	cb(0, [{markup:mrk1, doc:doc1, key:key1}] );
}

var singletwo=function(mark,docOf,cb) {
	var selections=validate.singletwomore(mark.selections);
	if (!selections) return ;

	var files=Object.keys(selections);
	var doc1=docOf(files[0]);
	var key=uuid();

	var ranges=selections[files[0]];

	var markups=[],master;
	for (var i=0;i<ranges.length;i++) {
		var cls=mark.typename, newkey=uuid();
		if (i) cls+="2";
		var obj={className:cls, from:ranges[i][0],to:ranges[i][1] };
		if (i==0) {
			master=obj.others=[];
			newkey=key;
		} else {
			obj.master=key;
			master.push(newkey);
		}
		markups.push({markup:obj,doc:doc1,key:newkey});
	}
	cb(0, markups);
}



var dualonemore=function(mark,docOf, cb) {
	var selections=validate.dualonemore(mark.selections);
	if (!selections) return ;

	var files=Object.keys(selections);
	var range1=selections[files[0]][0];
	var key=uuid();

	var doc1=docOf(files[0]);
	var doc2=docOf(files[1]);

	var text1=getTrimedRangeText(doc1,range1);

	var mrk1={className:mark.typename, from:range1[0], to:range1[1], target:[] };

	var ranges=selections[files[1]];

	var markups=[{markup:mrk1,doc:doc1,key:key}],master=[files[0],key,text1];
	for (var i=0;i<ranges.length;i++) {

		var text2=getTrimedRangeText(doc2,ranges[i]);
		
		var cls=mark.typename+"2", newkey=uuid();

		var obj={className:cls, from:ranges[i][0],to:ranges[i][1] ,target:master};
		mrk1.target.push([files[1],newkey,text2]);
		markups.push({markup:obj,doc:doc2,key:newkey});
	}	

	cb(0, markups );
}

var getTrimedRangeText=function(doc,range) {
	var text=util.getRangeText(doc,range);
	if (text.length>MAX_LABEL) text=text.substr(0,MAX_LABEL)+"…";	
	return text;
}

var multi=function(mark,docOf, cb) {
	var selections=validate.multi(mark.selections);
	if (!selections) return ;

	var files=Object.keys(selections);
	var doc1_ranges=selections[files[0]];
	var doc1_range1=selections[files[0]][0];
	var key=uuid();
	var doc1=docOf(files[0]);
	var doc1_text1=getTrimedRangeText(doc1,doc1_range1);

	var mastermrk={className:mark.typename, from:doc1_range1[0], to:doc1_range1[1], target:[] };
	var markups=[{markup:mastermrk,doc:doc1,key:key}],master=[files[0],key,doc1_text1];

	//same doc
	for (var i=1;i<doc1_ranges.length;i++) {
		var r=doc1_ranges[i];
		var text=getTrimedRangeText(doc1,doc1_ranges[i]);
		var mrk2={className:mark.typename+'2', from:r[0], to:r[1], target:[],target:master };
		var newkey=uuid();
		mastermrk.target.push([files[0],newkey,text]);
		markups.push({markup:mrk2,doc:doc1,key:newkey})
	}
	
	for (var i=1;i<files.length;i++) { //foreign doc
		var ranges=selections[files[i]];
		var fdoc=docOf(files[i]);
		for (var j=0;j<ranges.length;j++) {
			var ftext=getTrimedRangeText(fdoc,ranges[j]);
			var newkey=uuid();
			var cls=mark.typename+"2", newkey=uuid();
			var obj={className:cls, from:ranges[j][0],to:ranges[j][1] ,target:master};
			mastermrk.target.push([files[i],newkey,ftext]);
			markups.push({markup:obj,doc:fdoc,key:newkey});
		}	
	}

	cb(0, markups );
}


module.exports={singleone:singleone,dualone:dualone,singletwo:singletwo,dualonemore:dualonemore,
	milestone:milestone,milestone_novalidate:milestone_novalidate,oneway:oneway,multi:multi};
},{"../uuid":"C:\\ksana2015\\pannaloka\\src\\uuid.js","./util":"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\util.js","./validatemilestone":"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\validatemilestone.js","./validateselection":"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\validateselection.js","ksana-codemirror":"C:\\ksana2015\\node_modules\\ksana-codemirror\\src\\index.js"}],"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\quote.js":[function(require,module,exports){
var React=require("react");
var E=React.createElement;
var styles={input:{fontSize:"80%"}};
var ActionButton=require("./actionbutton");
var QuoteAttributeEditor=React.createClass({displayName: "QuoteAttributeEditor",
	getInitialState:function() {
		var m=this.props.markup;
		this.note="";
		if (m&&m.trait) this.note=m.trait.note;
		return {note:this.note,dirty:false};
	}
	,onCreateMarkup:function() {
		this.props.onCreateMarkup({note:this.state.note});
	}
	,onUpdateMarkup:function() {
		this.props.onUpdateMarkup({note:this.state.note});
		this.setState({dirty:false});
	}
	,componentWillReceiveProps:function(nextprops) {
		var m=nextprops.markup;
		this.note="";
		if (m&&m.trait) this.note=m.trait.note;
		this.setState({note:this.note});
	}
	,onNoteChange(e) {
		var dirty=e.target.value!==this.note;
		this.setState({note:e.target.value,dirty:dirty});
	}
	,render:function() {
		return E("span",null
			,React.createElement(ActionButton, {deletable: this.props.deletable, 
			   editing: this.props.editing, dirty: this.state.dirty, 
				 onCreateMarkup: this.onCreateMarkup, 
				 onDeleteMarkup: this.props.onDeleteMarkup, 
				 onUpdateMarkup: this.onUpdateMarkup})
			,E("input",{ref:"note",style:styles.input,value:this.state.note,onChange:this.onNoteChange})
			);
	}
})
module.exports=QuoteAttributeEditor;
},{"./actionbutton":"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\actionbutton.js","react":"react"}],"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\simple.js":[function(require,module,exports){
var React=require("react");
var E=React.createElement;
var styles={input:{border:"0px",fontSize:"100%",outline:0,borderBottom:"1px solid "}};
var ActionButton=require("./actionbutton");
var SimpleAttributeEditor=React.createClass({displayName: "SimpleAttributeEditor",
	getInitialState:function() {
		var attr1=(this.props.markup&&this.props.markup.trait)?this.props.markup.trait.attr1:"";
		return {attr1:attr1,dirty:false};
	}
	,onCreateMarkup:function() {
		this.props.onCreateMarkup({attr1:this.state.attr1});
	}
	,onUpdateMarkup:function() {
		this.props.onUpdateMarkup({attr1:this.state.attr1});
		this.setState({dirty:false});
	}
	,componentWillReceiveProps:function(nextprops) {
		var attr1=(nextprops.markup&&nextprops.markup.trait)?nextprops.markup.trait.attr1:"";
		this.setState({attr1:attr1});
	}
	,oAttr1Change(e) {
		this.setState({attr1:e.target.value,dirty:true});
	}
	,render:function() {
		return E("span",null
			,React.createElement(ActionButton, {
				 deletable: this.props.deletable, 
			   editing: this.props.editing, 
			   setHotkey: this.props.setHotkey, 
			   dirty: this.state.dirty, 
				 onCreateMarkup: this.onCreateMarkup, 
				 onDeleteMarkup: this.props.onDeleteMarkup, 
				 onUpdateMarkup: this.onUpdateMarkup})
			,"note:"
			,E("input",{ref:"attr1",style:styles.input,value:this.state.attr1,onChange:this.oAttr1Change})
			
			);
	}
})
module.exports=SimpleAttributeEditor;
},{"./actionbutton":"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\actionbutton.js","react":"react"}],"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\types.js":[function(require,module,exports){
var vs=require("./validateselection");
var vsmilestone=require("./validatemilestone");
var docfilestore=require("../stores/docfile");
var markupstore=require("../stores/markup");
var vscontext=require("./validatecontext");
var mark=require("./mark");
var isIntertextDeletable=function(markup) {
	var file=markup.target[0];
	if (Array.isArray(file)) {
		for (var i in markup.target) {
			var m=markup.target[i];
			if (!docfilestore.docOf(m[0]))return false;
		}
		return true;
	} else {
		return !!docfilestore.docOf(file);	
	}
}

var deletIntertext=function(markup) {

	var file=markup.target[0];
	if (Array.isArray(markup.target[0])) {
		for (var i in markup.target) {
			var m=markup.target[i];
			markupstore.removeByMid(m[1],m[0]);
		}
	} else {
		markupstore.removeByMid(markup.target[1],markup.target[0]);
	}
}
var types={
	"context":{validate:vscontext.validate,label:"情境",editor:require("./context"),mark:vscontext.mark}
	,"definition":{validate:vs.singletwomore,label:"釋義",mark:mark.singletwo,editor:require("./definition")}
	,"important":{validate:vs.singleone,label:"重點",
							editor:require("./simple"), mark:mark.singleone}
	,"insight":{validate:vs.singleone,label:"創見",mark:mark.singleone,editor:require("./simple")}
	,"intertext":{validate:vs.dualonemore,label:"互文", mark:mark.dualonemore, editor:require("./quote"),
						isDeletable: isIntertextDeletable,onDelete:deletIntertext}

	,"parallel":{validate:vs.multi,label:"對映", mark:mark.multi, editor:require("./simple"),
						isDeletable: isIntertextDeletable,onDelete:deletIntertext}

	,"quote":{validate:vs.dualone,label:"出處", mark:mark.oneway, editor:require("./quote")}
  ,"causeeffect":{validate:vs.singletwo,label:"因果",mark:mark.singletwo,editor:require("./simple")}
  ,"historyculture":{validate:vs.singletwomore,label:"歷史文化",mark:mark.singletwo,editor:require("./simple")}
  ,"exthistoryculture":{validate:vs.dualone,label:"歷史文化",mark:mark.dualone,editor:require("./simple")}
  ,"explaination":{validate:vs.singletwomore,label:"說明",mark:mark.singletwo,editor:require("./simple")}
  ,"part":{validate:vs.singletwomore,label:"部份",mark:mark.singletwo,editor:require("./simple")}
  ,"individual":{validate:vs.singletwomore,label:"總別",mark:mark.singletwo,editor:require("./simple")}
  ,"synonym":{validate:vs.singletwomore,label:"同義",mark:mark.singletwo,editor:require("./simple")}
  ,"signifier":{validate:vs.singletwo,label:"能所",mark:mark.singletwo,editor:require("./simple")}
  ,"extsignifier":{validate:vs.dualone,label:"能所",mark:mark.dualone,editor:require("./simple"),
		isDeletable: isIntertextDeletable,onDelete:deletIntertext}

  ,"ritual":{validate:vs.singletwo,label:"儀軌",mark:mark.singletwo,editor:require("./simple")}
  ,"extritual":{validate:vs.dualone,label:"儀軌",mark:mark.dualone,editor:require("./simple"),
		isDeletable: isIntertextDeletable,onDelete:deletIntertext}

  ,"authorbg":{validate:vs.singletwo,label:"作者背景",mark:mark.singletwo,editor:require("./simple")}
  ,"extauthorbg":{validate:vs.dualone,label:"作者背景",mark:mark.dualone,editor:require("./simple"),
		isDeletable: isIntertextDeletable,onDelete:deletIntertext}

	,"milestone":{validate:vsmilestone.validate,label:"界石",editor:require("./simple"), mark:mark.milestone}
	,"extdefinition":{validate:vs.dualonemore,label:"外部釋義",mark:mark.dualonemore,editor:require("./simple"),
		isDeletable: isIntertextDeletable,onDelete:deletIntertext}
	,"causeeffect2":{label:"果：",hidden:true}
	,"intertext2":{label:"互文：",hidden:true}
	,"part2":{label:"部份：",hidden:true}
	,"signifier2":{label:"所指：",hidden:true}
	,"explaination2":{label:"說明：",hidden:true}
	,"synonym2":{label:"同義詞",hidden:true}
  ,"definition2"	:{label:"定義：",hidden:true}
  ,"extdefinition2"	:{label:"定義：",hidden:true}
  ,"extsignifier2"	:{label:"所指：",hidden:true}
  ,"historyculture2"	:{label:"歷史文化：",hidden:true}
  ,"exthistoryculture2"	:{label:"歷史文化：",hidden:true}
  ,"individual2":{label:"別相：",hidden:true}
  ,"ritual2":{label:"儀軌：",hidden:true}
  ,"extritual2":{label:"儀軌：",hidden:true}
  ,"authorbg2":{label:"作者背景：",hidden:true}
  ,"extauthorbg2":{label:"作者背景：",hidden:true}
}

var getTypeLabel=function(type) {
	var t=types[type];
	if (t) return t.label;
}

module.exports={types:types,getTypeLabel:getTypeLabel};
},{"../stores/docfile":"C:\\ksana2015\\pannaloka\\src\\stores\\docfile.js","../stores/markup":"C:\\ksana2015\\pannaloka\\src\\stores\\markup.js","./context":"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\context.js","./definition":"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\definition.js","./mark":"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\mark.js","./quote":"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\quote.js","./simple":"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\simple.js","./validatecontext":"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\validatecontext.js","./validatemilestone":"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\validatemilestone.js","./validateselection":"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\validateselection.js"}],"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\util.js":[function(require,module,exports){
var getMarkupsInRange=require("../textview/highlight").getMarkupsInRange;

var filterEmptyRange=function(selections) {
	var out={};
	for (var i in selections){
		if (selections[i].length==0) continue;

		var sels=[];
		for (var j in selections[i]) {
			var sel=selections[i][j];
			if (sel.length>1) sels.push(sel);
		}
		if (sels.length) out[i]=sels;
	}
	return out;
}

var markupsFromSelection=function(doc,selections) {
	var markups=[];
	for (var i=0;i<selections.length;i++) {
		var sel=selections[i];
		var from={line:sel[0][1],ch:sel[0][0]};
		var to={line:sel[1][1],ch:sel[1][0]};
		markups=markups.concat(getMarkupsInRange(doc,from,to));
	}
	return markups;	
}


var getRangeText=function(doc,r) {
	var from={line:r[0][1],ch:r[0][0]},to={line:r[1][1],ch:r[1][0]};
	return doc.getRange(from,to);
}
module.exports={filterEmptyRange:filterEmptyRange,getRangeText,markupsFromSelection:markupsFromSelection};
},{"../textview/highlight":"C:\\ksana2015\\pannaloka\\src\\textview\\highlight.js"}],"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\validatecontext.js":[function(require,module,exports){
//must have at least one definition and one contextual markup
var filterEmptyRange=require("./util").filterEmptyRange;
var selectionstore=require("../stores/selection");
var docfilestore=require("../stores/docfile");
var util=require("./util");
var contextual=["insight","causeeffect","historyculture","part","individual","synonym"
,"signifier","ritual","extritual","extsignifier","authorbg","extauthorbg"];

var isDefinition=function(m) {
	return m.className==="definition" || m.className==="extdefinition";
}
var getMemberMarkup=function(selections) {
	var sels=filterEmptyRange(selections);
	var keys=Object.keys(sels);
	if (keys.length!==1) return null;

	var selections=sels[keys[0]];
	var doc=docfilestore.docOf(keys[0]);

	var markups=util.markupsFromSelection(doc,selections);
	var definition_markup_count=0,contextual_markup_count=0;
	var member=[],definition=null;
	for (var i=0;i<markups.length;i++) {
		var m=markups[i].markup;
		if (isDefinition(m)) {
			if ((!m.handle.member || !m.handle.member.length) && !definition) definition=m;
		}
		if (contextual.indexOf(m.className)>-1) {
			member.push(m);
		}
	}	
	if (definition) member.unshift(definition); //only one definition and on top
	return member;
}
var getMember=function(markup) {
	if (!markup.handle.member) return [];
	var filename=docfilestore.fileOf(markup.handle.doc);
	var getMarkup=markup.handle.doc.getEditor().react.getMarkup;
	var member=markup.handle.member.map(function(key){
		return getMarkup(key);
	});
	return member;
}
var validate=function(selections) {
	var member=getMemberMarkup(selections);
	if (!member) return false;
	return (member.length>1 && isDefinition(member[0]));
}

var mark=function(m,docOf, cb) {
	console.log('marking context',m);
}
module.exports={validate:validate,getMemberMarkup:getMemberMarkup,getMember:getMember,mark:mark
,isDefinition:isDefinition};
},{"../stores/docfile":"C:\\ksana2015\\pannaloka\\src\\stores\\docfile.js","../stores/selection":"C:\\ksana2015\\pannaloka\\src\\stores\\selection.js","./util":"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\util.js"}],"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\validatemilestone.js":[function(require,module,exports){
var filterEmptyRange=require("./util").filterEmptyRange;
var selectionstore=require("../stores/selection");
var docfilestore=require("../stores/docfile");
var milestones=require("ksana-codemirror").milestones;
var validate=function(selections) {
	var sels=filterEmptyRange(selections);
	var keys=Object.keys(sels);
	if (keys.length!==1) return null;
	if (sels[keys[0]].length!==1) return null;
	var range=sels[keys[0]][0];
	var doc=docfilestore.docOf(keys[0]);
	var text=selectionstore.getRangeText(0);
	if (validTextRange.call(doc,text,range)!=null) return null;
	return sels;
}
var invalidChar=function(name) {
	var valid=[" ","\n","．","<",">","{","}","。","，","！","/","?","\\"]
	for (var i=0;i<name.length;i++) {
		var code=name.charCodeAt(0);
		var ch=name.charAt(0);
		if (i===0 && code<40) return ch;
		if (code<30) return ch;
		if (valid.indexOf(ch)>-1) return ch;
		if (code>0xDFFF) return ch;
	}
	return null;
}

var validTextRange=function(text,range) {
	if (range[0][1]!==range[1][1]) return "cannot cross line";
	if (this.name2milestone[text]) return "repeated";
	if (text.length>15) return "name too long";

	var ch=invalidChar(text);
	if (ch) return "invalid char"+ch;

	var line=range[0][1];
	//check overlap
	var idx=milestones.findMilestone(this.line2milestone,line);
	if (idx>-1) return "already have milestone at this line";
	return null;
}

module.exports={validate:validate,validTextRange:validTextRange};
},{"../stores/docfile":"C:\\ksana2015\\pannaloka\\src\\stores\\docfile.js","../stores/selection":"C:\\ksana2015\\pannaloka\\src\\stores\\selection.js","./util":"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\util.js","ksana-codemirror":"C:\\ksana2015\\node_modules\\ksana-codemirror\\src\\index.js"}],"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\validateselection.js":[function(require,module,exports){
var filterEmptyRange=require("./util").filterEmptyRange;

var singleone=function(selections) {
	var sels=filterEmptyRange(selections);
	var keys=Object.keys(sels);
	if (keys.length!==1) return null;
	if (sels[keys[0]].length!==1) return null;

	return sels;
}


var singletwo=function(selections) {
	var sels=filterEmptyRange(selections);
	var keys=Object.keys(sels);
	if (keys.length!==1) return null;
	if (sels[keys[0]].length!==2) return null;

	return sels;
}
var singletwomore=function(selections) { //one view, more than 2 ranges
	var sels=filterEmptyRange(selections);
	var keys=Object.keys(sels);
	if (keys.length!==1) return null;
	if (sels[keys[0]].length<2) return null;

	return sels;
}
var dualone=function(selections) { //two views, each has only one range
	var sels=filterEmptyRange(selections);
	var keys=Object.keys(sels);
	if (keys.length!==2) return null;

	for (var i in sels){
		if (sels[i].length!==1)return null;
	}
	
	return sels;
}

var dualonemore=function(selections) { //two views, first view has one range, second has one or more range
	var sels=filterEmptyRange(selections);
	var keys=Object.keys(sels);
	if (keys.length!==2) return null;
	
	if (sels[keys[0]].length!==1) return null; //

	return sels;
}

var multi=function(selections) {
	var sels=filterEmptyRange(selections);
	var keys=Object.keys(sels);
	if (keys.length<2) return null;
	
	return sels;
}
module.exports={singleone:singleone,singletwo:singletwo,dualonemore:dualonemore,
	singletwomore:singletwomore,dualone:dualone,multi:multi};
},{"./util":"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\util.js"}],"C:\\ksana2015\\pannaloka\\src\\node\\readdirmeta.js":[function(require,module,exports){
/**
	read all ktx files and return meta json
*/
var fs=require("fs");
var readdirmeta=function(dataroot,path,cb){

	var files=fs.readdirSync(dataroot+path);
	if (!files) {
		cb("cannot readdir");
		return ;
	}

	try {
		var out=files.map(function(file){
			var fullname=dataroot+path+'/'+file;
			var stat=fs.statSync(fullname);
			var f=fs.openSync(fullname,"r");
			var buffer = new Buffer(16*1024); //header should less than 16K

			fs.readSync(f,buffer,0,16*1024,0);
			var s=buffer.toString("utf8");
			var idx=s.indexOf("\n");
			try {
				var firstline=s.substr(0,idx).trim();
				if (firstline[0]==="[") {
					firstline=firstline.substr(1); //for ktx
					var last=firstline[firstline.length-1];
					if (last!=="}") firstline=firstline.substr(0,firstline.length-1);
				}
				var meta=JSON.parse(firstline);
			} catch (e) {
				meta={title:file.substr(0,file.lastIndexOf("."))};
			}
			fs.closeSync(f);
			meta.filename=path+'/'+file;
			meta.stat=stat;
			return meta;
		});
	} catch(e) {
			console.log(e);
	}
	setTimeout(function(){
		cb(0,out);
	},10);//wait for nw 
}
module.exports=readdirmeta;
},{"fs":false}],"C:\\ksana2015\\pannaloka\\src\\rpc\\rpc.js":[function(require,module,exports){
/*
	this is for browser, a simple wrapper for socket.io rpc
	
	for each call to server, create a unique id
	when server return, get the slot by unique id, and invoke callbacks.
*/
(function(){

if (typeof io=="undefined") {
	module.exports=window.host={exec:function(){}}; 
	return;
}
function GUID () {
  var S4 = function ()    {    return Math.floor(        Math.random() * 0x10000  ).toString(16);  };
  return (   S4() + S4() + "-" + S4() + "-" +  S4() + "-" + S4() + "-" +S4() + S4() + S4()    );
}

var RPCs={}; //*  key: unique calling id  */

var socket = io.connect(window.location.host);

var returnfromserver=function(res) {
	var slot=RPCs[res.fid];
	
	if (!slot) {
		throw "invalid fid "+res.fid;
		return;
	}
	
	if (res.success) {
		if (slot.successCB)  slot.successCB(res.err,res.response);
	} else {
		if (slot.errorCB)  slot.errorCB(res.err,res.response);
	}
	delete RPCs[res.fid]; //drop the slot
}

var pchost={
	rpchost:true
	,exec: function(successCB, errorCB, service, action, params) {
		var fid=GUID();
		//create a slot to hold
		var slot={  fid:fid, successCB:successCB, errorCB:errorCB ,params:params, action:action, service:service};
		RPCs[fid]=slot;
		socket.emit('rpc',  { service: service, action:action, params: params , fid:fid });
	}
}

socket.on( 'rpc', returnfromserver );	 
window.host=pchost;
module.exports=pchost;

})();
},{}],"C:\\ksana2015\\pannaloka\\src\\rpc\\rpc_fs.js":[function(require,module,exports){
var host=require("./rpc");

var makeinf=function(name) {
	return (
		function(opts,callback) {
			host.exec(callback,0,"fs",name,opts);
		});
}

var API={};
//TODO , create a cache object on client side to save network trafic on
//same getRaw
API.readFile=makeinf("readFile");
API.writeFile=makeinf("writeFile");
API.exists=makeinf("exists");
API.unlink=makeinf("unlink");
API.mkdir=makeinf("mkdir");
API.readdir=makeinf("readdir");


//API.closeAll=makeinf("closeAll");
//exports.version='0.0.13'; //this is a quick hack

host.exec(function(err,data){
	//console.log('version',err,data)
	exports.version=data;
},0,"fs","version",{});


module.exports=API;
},{"./rpc":"C:\\ksana2015\\pannaloka\\src\\rpc\\rpc.js"}],"C:\\ksana2015\\pannaloka\\src\\rpc\\rpc_util.js":[function(require,module,exports){
var host=require("./rpc");

var makeinf=function(name) {
	return (
		function(opts,callback) {
			host.exec(callback,0,"util",name,opts);
		});
}

var API={};
//TODO , create a cache object on client side to save network trafic on
//same getRaw
API.readdirmeta=makeinf("readdirmeta");

host.exec(function(err,data){
	//console.log('version',err,data)
	exports.version=data;
},0,"util","version",{});


module.exports=API;
},{"./rpc":"C:\\ksana2015\\pannaloka\\src\\rpc\\rpc.js"}],"C:\\ksana2015\\pannaloka\\src\\socketfs.js":[function(require,module,exports){
var fs=(typeof process!=="undefined")?require("fs"):{}; // webpack.config.js node:{    fs:"empty" }
if (typeof fs.readFile=="undefined") {
	var rpcfs=require("./rpc/rpc_fs");	
	var rpcutil=require("./rpc/rpc_util");	
}

var dataroot="pannaloka/data/";

var ready=function() {
	if (fs.readFile) return true;
	if (window.host.rpchost) return true;
	return false;
}
var readFile=function(fn,opts,cb) {
	if (fs.readFile) fs.readFile(dataroot+fn,opts,cb);
	else {
		if (typeof opts==="function") {
			cb=opts;
			opts=null;
		}
		rpcfs.readFile({filename:dataroot+fn,opts:opts},cb);
	}
}
var writeFile=function(fn,data,opts,cb) {
	if (fs.writeFile) fs.writeFile(dataroot+fn,data,opts,cb);
	else {
		if (typeof opts==="function") {
			cb=opts;
			opts=null;
		}
		rpcfs.writeFile({filename:dataroot+fn,opts:opts,data:data},cb);
	}
}
var exists=function(fn,cb){
	if (fs.exists) fs.exists(dataroot+fn,cb);
	else {
		rpcfs.exists({filename:dataroot+fn},cb);
	}
}

var unlink=function(fn,cb){
	if (fs.unlink) fs.unlink(dataroot+fn,cb);
	else {
		rpcfs.unlink({filename:dataroot+fn},cb);
	}
}
var mkdir=function(path,mode,cb) {
	if (fs.mkdir) fs.mkdir(dataroot+path,cb);
	else {
		if (typeof mode==="function") {
			cb=mode;
			mode=null;
		}
		rpcfs.mkdir({path:dataroot+path,mode:mode},cb);
	}
}
var readdir=function(path,cb) {
	if (fs.readdir) fs.readdir(dataroot+path,cb);
	else {
		rpcfs.readdir({path:dataroot+path},cb);
	}
}

var readdirmeta=function(path,cb) {//read all meta in given path
	if (fs.readdir) {
		require("./node/readdirmeta")(dataroot,path,cb);
	} else {
		rpcutil.readdirmeta({dataroot:dataroot,path:path},cb);
	}

}
module.exports={readFile:readFile,writeFile:writeFile,exists:exists,
	unlink:unlink,mkdir:mkdir,readdir:readdir,readdirmeta:readdirmeta,ready:ready};
},{"./node/readdirmeta":"C:\\ksana2015\\pannaloka\\src\\node\\readdirmeta.js","./rpc/rpc_fs":"C:\\ksana2015\\pannaloka\\src\\rpc\\rpc_fs.js","./rpc/rpc_util":"C:\\ksana2015\\pannaloka\\src\\rpc\\rpc_util.js","fs":false}],"C:\\ksana2015\\pannaloka\\src\\stores\\docfile.js":[function(require,module,exports){
//doc and filename mapping
//wid, doc, filename

var Reflux=require("reflux");

var docFileStore=Reflux.createStore({
	docfile:[]
	,cm:null
	,listenables:[require("../actions/docfile")]
	,onOpenFile:function(doc,filename,trait) {
		this.docfile=this.docfile.filter(function(df){
			return  df[0]!==doc;
		});
		this.docfile=[[doc,filename,trait]].concat(this.docfile);
		this.trigger(this.docfile,{action:"open"});
	}
	,onCloseFile:function(file) {
		var doc=this.docOf(file);
		if (this.cm && this.cm.getDoc()===doc) {
			this.cm==null;
		}
		
		this.docfile=this.docfile.filter(function(df){
			return  df[1]!==file;
		});
		this.trigger(this.docfile,{action:"close"});
	}
	,onUpdateTrait:function(file,trait) {
		var remain=this.docfile.filter(function(df){
			return  df[1]===file;
		});
		if (remain.length) {
			remain[0][2]=JSON.parse(JSON.stringify(trait));
		}

		this.trigger(this.docfile,{action:"update"});
	}
	,getDocs:function() {
		return this.docfile.map(function(df){
			return df[0];
		});
	}
	,fileOf:function(doc) {
		var remain=this.docfile.filter(function(df){
			return  df[0]===doc;
		});
		if (remain.length) return remain[0][1];
	}
	,docOf:function(file) {
		var remain=this.docfile.filter(function(df){
			return  df[1]===file;
		});
		if (remain.length) return remain[0][0];
	}
	,traitOf:function(file) {
		var remain=this.docfile.filter(function(df){
			return  df[1]===file;
		});
		if (remain.length) return remain[0][2];
	}
	,getActiveEditor() {
		return this.cm;
	}
	,onSetActiveEditor:function(cm) {
		this.cm=cm;
	}
});
module.exports=docFileStore;
},{"../actions/docfile":"C:\\ksana2015\\pannaloka\\src\\actions\\docfile.js","reflux":"C:\\ksana2015\\node_modules\\reflux\\index.js"}],"C:\\ksana2015\\pannaloka\\src\\stores\\ktcfile.js":[function(require,module,exports){
var Reflux=require("reflux");
var socketfs=require("../socketfs");
var KTXFileStore=Reflux.createStore({
	listenables:[require("../actions/ktcfile")]
	,files:[]
	,openTree:function(fn,cb){
		this.openingfilename=fn;
	  socketfs.readFile(fn,"utf8",function(err,filecontent){
	    if (err) {
	      cb(err);
	    } else {
	    	cb(0,JSON.parse("["+filecontent.split(/\r?\n/).join(",")+"]"));
	    }
	  }.bind(this));
	}
	,loaddir:function(openfn,noopen){
		socketfs.readdirmeta("ktc",function(err,data){
			if (!err) {
				this.files=data.filter(function(f){
						var ext=f.filename.substr(f.filename.length-4);
						return  (ext===".ktc");
				});

				if (!this.files.length) return;
				var idx=0;
				if (openfn) {
					idx=this.files.indexOf(openfn);
					if (idx==-1) idx=0;
				}
				if (!noopen) {
					setTimeout(function(){
						this.onOpenTree(this.files[idx].filename);	
					}.bind(this),100);					
				}
			}
		}.bind(this));
	}
	,init:function() {
		this.loaddir();
	}
	,onReload:function() {
		this.loaddir();
	}
	,newfilename:function() {
		return "ktc/"+Math.random().toString().substr(2,8)+".ktc";
	}

	,onWriteTree:function(toc,cb){
		var tocstring="";
		toc.map(function(item,idx){
			if (idx) tocstring+="\n"
			tocstring+=JSON.stringify({t:item.t,d:item.d,links:item.links});
		});
				
	  socketfs.writeFile(this.fn,tocstring,"utf8",function(err){
	  	this.loaddir(this.fn,true);
	    cb&&cb(err);
	  }.bind(this));
	}
	,onOpenTree:function(fn){
		this.openTree(fn,function(err2,toc){
			this.toc=toc;
			this.fn=fn;
			this.trigger(this.files,toc);
		}.bind(this));
	}
	,onNewTree:function() {
		var filename=this.newfilename();
		this.fn=filename;
		this.onWriteTree([{t:'emptytree',d:0},{t:'child',d:1}]);
	}
})
module.exports=KTXFileStore;
},{"../actions/ktcfile":"C:\\ksana2015\\pannaloka\\src\\actions\\ktcfile.js","../socketfs":"C:\\ksana2015\\pannaloka\\src\\socketfs.js","reflux":"C:\\ksana2015\\node_modules\\reflux\\index.js"}],"C:\\ksana2015\\pannaloka\\src\\stores\\ktxfile.js":[function(require,module,exports){
var Reflux=require("reflux");
var socketfs=require("../socketfs");
var KTXFileStore=Reflux.createStore({
	listenables:[require("../actions/ktxfile")]
	,files:[]
	,loaddir:function(){
		socketfs.readdirmeta("ktx",function(err,data){
			if (!err) {
				this.files=data.filter(function(f){
						var ext=f.filename.substr(f.filename.length-4);
						if (ext!==".txt" && ext!==".ktx") return false;
						return f.filename!=="ktx/empty.ktx" && f.filename!=="ktx/dummy.ktx"
				});
				this.trigger(this.files);	
			}
		}.bind(this));
	}
	,init:function() {
		this.loaddir();
	}
	,onReload:function() {
		this.loaddir();
	}
	,findFile:function(fn) {
		var res=this.files.filter(function(f){return f.filename===fn});
		if (res.length) return res[0];
	}
	,newfilename:function() {
		return "ktx/"+Math.random().toString().substr(2,8)+".ktx";
	}
})
module.exports=KTXFileStore;
},{"../actions/ktxfile":"C:\\ksana2015\\pannaloka\\src\\actions\\ktxfile.js","../socketfs":"C:\\ksana2015\\pannaloka\\src\\socketfs.js","reflux":"C:\\ksana2015\\node_modules\\reflux\\index.js"}],"C:\\ksana2015\\pannaloka\\src\\stores\\markup.js":[function(require,module,exports){
/**
	Markup under cursor and editing
*/

var Reflux=require("reflux");

var docfilestore=require("./docfile");
var markupNav=require("../markup/nav");

var markupStore=Reflux.createStore({
	listenables:[require("../actions/markup")]
	,markupsUnderCursor:[]
	,ctrl_m_handler:null
	,editing:null
	,hovering:null
	,onMarkupsUnderCursor:function(markupsUnderCursor) {
		//this.editing=null;
		if (this.markupsUnderCursor==markupsUnderCursor) return;
		this.markupsUnderCursor=markupsUnderCursor||[];
		this.trigger(this.markupsUnderCursor,{cursor:true});
	}
	,getEditing:function() {
		return this.editing;
	}
	,getNext:function() {
		if (!this.editing) return;
		return markupNav.next(this.editing.markup);
	}
	,getPrev:function() {
		if (!this.editing) return;
		return markupNav.prev(this.editing.markup);
	}
	,cancelEdit:function() {
		this.editing=null;
		this.ctrl_m_handler=null;
	}
	,freeEditing:function() {
		if (!this.editing) return;
		this.editing.doc=null;//to notify markupselector shouldComponentUpdate
	}
	,onEditMarkup:function(markup) {
		this.cancelEdit();
		this.editing=markup;
		this.ctrl_m_handler=null;
		this.trigger([{doc:markup.handle.doc,key:markup.key,markup:markup}],{cursor:true});
	}
	,setEditing:function(markup,handler) {
		this.cancelEdit();
		this.editing=markup;
		this.ctrl_m_handler=handler;
		//this.trigger([],{cursor:true});
		this.trigger(markup,{editing:true});
	}
	,onSetHotkey:function(handler) {
		this.ctrl_m_handler=handler;
		//console.log("handler",handler,this);
	}
	,remove:function(markup) {
		//console.log("remove markup",markup);
		this.cancelEdit();
		var doc=markup.handle.doc;
		doc.getEditor().react.removeMarkup(markup.key);

		this.trigger([],{cursor:true});
	}
	,removeByMid:function(mid,file){
		//console.log("remove mid in file",mid,file);
		var doc=docfilestore.docOf(file);
		doc.getEditor().react.removeMarkup(mid);
		this.trigger([],{cursor:true});
	}
	,onToggleMarkup:function(){
		if (this.ctrl_m_handler) {
				this.ctrl_m_handler();
				this.ctrl_m_handler=null;//fire once
		}
	}
	,getHovering:function() {
		return this.hovering;
	}
	,onHovering:function(m) {
		this.hovering=m;
		this.trigger(m,{hovering:true});
	}
	,onCreateMarkup:function(obj,cb) {
		if (!obj.typedef || !obj.typedef.mark) {
			console.log(obj);
			throw "cannot create markup"
		}
		this.editing=null;

		obj.typedef.mark(obj, docfilestore.docOf ,function(err,newmarkup){
			this.markupsUnderCursor=newmarkup;
			this.trigger( this.markupsUnderCursor,{newly:true});
			if (cb) cb();
		}.bind(this));
	}
})
module.exports=markupStore;
},{"../actions/markup":"C:\\ksana2015\\pannaloka\\src\\actions\\markup.js","../markup/nav":"C:\\ksana2015\\pannaloka\\src\\markup\\nav.js","./docfile":"C:\\ksana2015\\pannaloka\\src\\stores\\docfile.js","reflux":"C:\\ksana2015\\node_modules\\reflux\\index.js"}],"C:\\ksana2015\\pannaloka\\src\\stores\\overlay.js":[function(require,module,exports){
var Reflux=require("reflux");
var OverlayStore=Reflux.createStore({
	paths:[]
	,listenables:require("../actions/overlay")
	,onConnect:function(from,to){
		var F={x:from.left-5,y:from.top,w:from.right-from.left,h:from.bottom-from.top}

		var T={x:to.left-5,y:to.top,w:to.right-to.left,h:to.bottom-to.top}

		this.paths=[
		//{cmd:"rect",stroke:"green",strokeOpacity:0.4,fillOpacity:0,strokeWidth:2,
	//		x:F.x,y:F.y,width:F.w,height:F.h,rx:10,ry:10}
	//	,{cmd:"rect",stroke:"brown",fillOpacity:0,strokeWidth:2,
	//		x:T.x,y:T.y,width:T.w,height:T.h,rx:10,ry:10}
		,{key:1,stroke:"black",strokeOpacity:0.25,strokeWidth:4,stroke:"green"  //line
			,d:"M"+(from.left+F.w/2)+" "+(from.top+F.h/2)+"L"+(to.left+T.w/2)+" "+(to.top+T.h/2)+"Z"},

		]
		clearTimeout(this.timer1);
		this.trigger(this.paths);
		this.timer1=setTimeout(function(){
			this.paths=[];
			this.trigger(this.paths);
		}.bind(this),3000);
	}
	,onClear:function() {
		this.paths=[];
		this.trigger(this.paths);
	}
});
module.exports=OverlayStore;

},{"../actions/overlay":"C:\\ksana2015\\pannaloka\\src\\actions\\overlay.js","reflux":"C:\\ksana2015\\node_modules\\reflux\\index.js"}],"C:\\ksana2015\\pannaloka\\src\\stores\\selection.js":[function(require,module,exports){
var Reflux=require("reflux");
var docfile=require("./docfile");
var milestones=require("ksana-codemirror").milestones;

var selectionStore=Reflux.createStore({
	listenables:[require("../actions/selection")]
	,selections:{}
	,init:function() {
	}
	,copySel:function(selections,remove) {
		var sels={};
		for (var i in this.selections) {
			if (remove && remove===i) continue;
			sels[i]=this.selections[i];
		}
		return sels;		
	}
	,onSetSelection:function(filename,selections,cursorchar) {
		//do not copy key==filename,
		//file of newly set selection will be on the bottom of Object.keys() 
		//to preserve the order of selection (for dualone , dualonemore)
		var sels=this.copySel(selections,filename); 
		sels[filename]=selections;
		this.cursorchar=cursorchar;
		this.selections=sels;
		this.trigger(this.selections,cursorchar);
	}
	,getSelection:function(filename) {
		return this.selections[filename];
	}
	,getCursorChar:function() {
		return this.cursorchar;
	}
	,onClearAllSelection:function() {
		var sels=this.copySel(this.selections);
		for (var i in sels) {
			sels[i]=[];
		}
		this.selections=sels;

		this.trigger(this.selections,this.cursorchar);
	}
	,onClearSelectionOf:function(filename) {
		var sels=this.copySel(this.selections);
		sels[filename]=[];

		this.selections=sels;
		this.trigger(this.selections,this.cursorchar);
	}
	,hasRange:function() {
		return this.getRanges().length>0;
	}
	,getRanges:function (opts) {
		opts=opts||{};
		var out=[]; // filename, selections
		for (var i in this.selections) {
			for (var j in this.selections[i]) {
				if (this.selections[i][j].length>1) {
					var r=[i, this.selections[i][j] ];
					if (opts.textLength) {
						var text=this.getRangeText(r);
						if (text.length>opts.textLength) {
							text=text.substr(0,opts.textLength)+"…";
						}
						r.push(text);
					}
					out.push(r);
				}
			}
		}
		if (opts.pack) {

			out=out.map(function(range){
				var doc=docfile.docOf(range[0]);
				return [range[0],milestones.pack.call(doc,range[1]),range[2]];
			});
		}
		return out;
	}
	,getRangeText:function(idx_range) {
		if (typeof idx_range==="number") {
			var ranges=this.getRanges();
			if (idx_range>ranges.length-1)return null;
			var r=ranges[idx_range][1];			
			var doc=docfile.docOf(ranges[idx_range][0]);
		} else {
			var r=idx_range[1]; //send in 
			var doc=docfile.docOf(idx_range[0]);
		}

		var from={line:r[0][1],ch:r[0][0]},to={line:r[1][1],ch:r[1][0]} ;
		return doc.getRange(from,to);
	}
})
module.exports=selectionStore;
},{"../actions/selection":"C:\\ksana2015\\pannaloka\\src\\actions\\selection.js","./docfile":"C:\\ksana2015\\pannaloka\\src\\stores\\docfile.js","ksana-codemirror":"C:\\ksana2015\\node_modules\\ksana-codemirror\\src\\index.js","reflux":"C:\\ksana2015\\node_modules\\reflux\\index.js"}],"C:\\ksana2015\\pannaloka\\src\\stores\\stackwidget.js":[function(require,module,exports){
var Reflux=require("reflux");
var StackWidgetStore=Reflux.createStore({
	listenables:[require("../actions/stackwidget")]
	,widgets:[]
	,wseq:0
	,at:function(wid) {
		for (var i=0;i<this.widgets.length;i++) {
			if (this.widgets[i].wid==wid) return i;
		}
		return 0;
	}
	,onNewWidget:function(trait,widgetClass,opts) {
		opts=opts||{};
		var w={wid:'w'+this.wseq++,widgetClass:widgetClass||"SimpleWidget",trait:trait};
		var out=[];
		for (var i=0;i<this.widgets.length;i++) out.push(this.widgets[i]);
		if (opts.below) {
			var at=this.at(opts.below);
			out.splice(at+1,0,w);  //open below
		} else {
			out.unshift(w); //open at top
		}
		this.widgets=out;
		this.trigger(this.widgets);
	}
	,onCloseWidget:function(wid) {
		this.widgets=this.widgets.filter(function(w){
			return w.wid!=wid;
		});
		this.trigger(this.widgets);
	}
	,find:function(trait){
		return this.widgets.filter(function(w){
			return w.trait===trait;
		});
	}
	,onOpenWidget:function(trait,widgetClass,opts) {
		opts=opts||{};
		var found=this.find(trait);

		if (!found.length) {//prevent repeat open
			this.onNewWidget(trait,widgetClass,opts);
		} else {//move it to the top
			var rest=this.widgets.filter(function(w){
				return w.trait!==trait;
			});

			this.widgets= found.concat(rest);
			this.trigger(this.widgets);
		}
	}

})
module.exports=StackWidgetStore;
},{"../actions/stackwidget":"C:\\ksana2015\\pannaloka\\src\\actions\\stackwidget.js","reflux":"C:\\ksana2015\\node_modules\\reflux\\index.js"}],"C:\\ksana2015\\pannaloka\\src\\textview\\charinfo.js":[function(require,module,exports){
var selectionstore=require("../stores/selection");
var run=function(cm) {
	var renderCh=function (ch) {
		if (!ch) return ;
		return ch+":U+"+ch.charCodeAt(0).toString(16).toUpperCase();
	}

	if (cm.openNotification) {
        cm.openNotification('<span style="color: green">' + 
        	renderCh(selectionstore.getCursorChar()) + '</span>',
      {duration: 5000});
  }
}
module.exports={run:run};
},{"../stores/selection":"C:\\ksana2015\\pannaloka\\src\\stores\\selection.js"}],"C:\\ksana2015\\pannaloka\\src\\textview\\closetextbutton.js":[function(require,module,exports){
var React=require("react");

var CloseTextButton = React.createClass({displayName: "CloseTextButton",
	render : function() {
		return React.createElement("span", {title: "Ctrl+Q", className: "closebutton", onClick: this.props.onClose}, "×")
	}
});
module.exports = CloseTextButton;

},{"react":"react"}],"C:\\ksana2015\\pannaloka\\src\\textview\\createmilestones.js":[function(require,module,exports){
var types=require("../markuptypedef").types;
var milestone_novalidate=require("../markuptypedef").milestone_novalidate;
var validTextRange=require("../markuptypedef/validatemilestone").validTextRange;
var markupAction=require("../actions/markup");
var CodeMirror=require("codemirror");
var milestones=require("ksana-codemirror").milestones;
var docOf=require("../stores/docfile").docOf;

var selectionStore=require("../stores/selection");
/*
var createMilestone=function(){
	var ranges=selectionStore.getRanges();
	if (ranges.length!==1)return;
	var text=selectionStore.getRangeText(0);
	createMS.call(this,text,ranges[0][1]);
}
var invalidChar=function(name) {
	var valid=[" ","\n","<",">","{","}","。","，","！","/","?","\\"]
	for (var i=0;i<name.length;i++) {
		var code=name.charCodeAt(0);
		var ch=name.charAt(0);
		if (i===0 && code<40) return ch;
		if (code<30) return ch;
		if (valid.indexOf(ch)>-1) return ch;
		if (code>0xDFFF) return ch;
	}
	return null;
}

var canCreateMS=function(name,range) {
	if (range[0][1]!==range[1][1]) return "cannot cross line";
	if (this.doc.name2milestone[name]) return "repeated";
	if (name.length>15) return "name too long";

	var ch=invalidChar(name);
	if (ch) return "invalid char"+ch;

	var line=range[0][1];
	//check overlap
	var idx=milestones.findMilestone(this.doc.line2milestone,line);
	if (idx>-1) return "already have milestone at this line";
	return null;
}
*/

var createMS=function(name,range) {
	var err=validTextRange.call(this.doc,name,range);
	if (!err){
		var o={typename:"milestone",selections:selectionStore.selections,typedef:types.milestone};
		markupAction.createMarkup(o);	
	}
	return err;
}

var markMilestone=function(cm) { //convert cursor to 
	var doc=cm.getDoc();
	var name=doc.getSelection();
	var sel=doc.listSelections()[0];
	var range=[ [sel.anchor.ch,sel.anchor.line],[sel.head.ch,sel.head.line]];
	var err=createMS.call(cm.react,name,range);
	if (!err) {
		//temporary set the name to check uniqueness, valid until next rebuildMilestone
		doc.name2milestone[name]=true;
	}
	return err;
}
CodeMirror.commands.markMilestone=markMilestone; //uses by ksana-codemirror/automarkup

//create from batch replace
var createMilestones=function(ranges,cb) { //this is CodeMirror instance
	var doc=this.getDoc();
	this.operation(function(){
		var out=[];
		for (var i=0;i<ranges.length;i++){
			out.push(milestone_novalidate(doc,ranges[i]));
		}
		cb(out);
	});
}


module.exports=createMilestones;
},{"../actions/markup":"C:\\ksana2015\\pannaloka\\src\\actions\\markup.js","../markuptypedef":"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\index.js","../markuptypedef/validatemilestone":"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\validatemilestone.js","../stores/docfile":"C:\\ksana2015\\pannaloka\\src\\stores\\docfile.js","../stores/selection":"C:\\ksana2015\\pannaloka\\src\\stores\\selection.js","codemirror":"C:\\ksana2015\\node_modules\\codemirror\\lib\\codemirror.js","ksana-codemirror":"C:\\ksana2015\\node_modules\\ksana-codemirror\\src\\index.js"}],"C:\\ksana2015\\pannaloka\\src\\textview\\cursormethod.js":[function(require,module,exports){
var kcm=require("ksana-codemirror");
var getSelections=kcm.getSelections, getCharAtCursor=kcm.getCharAtCursor;
var selectionaction=require("../actions/selection");
var docfileaction=require("../actions/docfile");
var markupstore=require("../stores/markup");
var selectionstore=require("../stores/selection");
var markupaction=require("../actions/markup");
var highlight=require("./highlight");

var sortByDistance=function(cursor,markups,doc) {
	return markups.filter(function(m){
		return m.markup;
	}).sort(function(m1,m2){
		var p1=m1.markup.handle.find();
		var p2=m2.markup.handle.find();

		if (p1.line!==p2.line) {
			return (cursor.line-p1.from.line) - (cursor.line-p2.from.line);
		} else {
			return (cursor.ch-p1.from.ch) - (cursor.ch-p2.from.ch);
		}
	});
}
var showcursorcoords=function() {
	var pos=this.doc.getCursor();
	console.log(this.cm.cursorCoords(pos),pos.line,pos.ch);
}
var cursorActivity=function(){
	clearTimeout(this.timer1);
	this.hasMarkupUnderCursor=false;
	this.timer1=setTimeout(function(){
		var cursorch=getCharAtCursor(this.doc);
		var prevsel=selectionstore.getSelection(this.props.trait.filename);
		var selections=getSelections(this.doc,prevsel); //push new selection to bottom
		selectionaction.setSelection(this.props.trait.filename,selections,cursorch);
		if (selections.length>2 || (selections.length>0&&selections[0].length>1)){
			this.markups=null;
			markupaction.markupsUnderCursor([]);
			this.hasMarkupUnderCursor=false;
			//has range
		} else {
			var markups=highlight.getMarkupsInRange(this.doc,this.doc.getCursor());
			markups=sortByDistance(this.doc.getCursor(),markups);
			this.markups=markups;
			markupaction.markupsUnderCursor(markups);
			this.hasMarkupUnderCursor=markups.length>0;
			docfileaction.setActiveEditor(this.cm);
			//showcursorcoords.call(this);
		}
	}.bind(this),150);//cursor throttle
}


var mouseMove=function(cm,e) {//event captured by React, not Codemirror
	//console.log(e.clientX,e.clientY,e.pageX,e.pageY)
	var pos=cm.coordsChar({left:e.clientX,top:e.clientY});
	var markups=highlight.getMarkupsInRange(this.doc,pos);
	markups=sortByDistance(this.doc.getCursor(),markups);
	if (!markups.length){
		markupaction.hovering(null);
		return;
	}

	var m=markups[0].markup;//only highlight first one
	markupaction.hovering(m);
	highlight.highlightRelatedMarkup(m);
}

var mouseDown=function(cm,e){
	var m=markupstore.getHovering();
	if (m) highlight.autoGoMarkup.call(this,m);
}

module.exports={cursorActivity:cursorActivity, mouseDown:mouseDown
,mouseMove:mouseMove};
},{"../actions/docfile":"C:\\ksana2015\\pannaloka\\src\\actions\\docfile.js","../actions/markup":"C:\\ksana2015\\pannaloka\\src\\actions\\markup.js","../actions/selection":"C:\\ksana2015\\pannaloka\\src\\actions\\selection.js","../stores/markup":"C:\\ksana2015\\pannaloka\\src\\stores\\markup.js","../stores/selection":"C:\\ksana2015\\pannaloka\\src\\stores\\selection.js","./highlight":"C:\\ksana2015\\pannaloka\\src\\textview\\highlight.js","ksana-codemirror":"C:\\ksana2015\\node_modules\\ksana-codemirror\\src\\index.js"}],"C:\\ksana2015\\pannaloka\\src\\textview\\defaulttextview.js":[function(require,module,exports){
var React=require("react");
var ReactDOM=require("react-dom");
var CodeMirror=require("ksana-codemirror").Component;
var TextViewMenu=require("../components/textviewmenu");

var markupstore=require("../stores/markup"),markupaction=require("../actions/markup");
var selectionstore=require("../stores/selection");
var transclude=require("./transclude");

var cursormethod=require("./cursormethod");
var filemethod=require("./filemethod");
var markupmethod=require("./markupmethod");
var traitmethod=require("./traitmethod");

var charinfo=require("./charinfo");
var ListMarkup=require("./listmarkup");
var CloseTextButton=require("./closetextbutton");
var googledrive=require("./googledrive");
var DefaultTextView = React.createClass({displayName: "DefaultTextView",

	getInitialState:function() {
		this.hasMarkupUnderCursor=false; //for second click on a markup
		return {dirty:false,markups:{},value:"",history:[]};
	}

	,componentDidMount :function() {
		if (this.props.newfile) {
			this.setState({dirty:true,titlechanged:true,value:"new file"},this.loaded);
		} else {
			filemethod.load.call(this,this.props.trait.filename,this.props.trait);
		}
		this.unsubscribeMarkup = markupstore.listen(this.onMarkup);
		this.unsubscribeSelection = selectionstore.listen(this.onSelection);
	}

	,componentWillUnmount:function() {
		this.unsubscribeMarkup();
		this.unsubscribeSelection();
		this.cm.react=null;
		googledrive.unmount.call(this);
	}

	,componentDidUpdate:function() {
		this.setsize();
	}

	,isGoogleDriveFile:function(){
		return (this.props.trait && this.props.trait.host==="google");
	}
	,keymap:function(){
		this.cm.setOption("extraKeys", {
	  	"Ctrl-L": function(cm) {
	  		var bookmark=cm.react.bookmark_transclusion(null,markupstore.getEditing());
	  		if (bookmark) {
	  			cm.react.addMarkup(bookmark);
	  			cm.react.setState({dirty:true});
	  		}
	  	}
	  	,"Ctrl-S":this.onSave
	  	,"Ctrl-M":markupaction.toggleMarkup.bind(this)
	  	,"Ctrl-K":"text2markup"
	  	,"Shift-Ctrl-K":"markup2text"
	  	,"Ctrl-I":charinfo.run
	  	,"Ctrl-D":charinfo.run
	  	//,"Ctrl-B": search markup with same type, jump to first markup if no editing markup
	  	//,"Ctrl-E": //dangerous, beside ctrl+W
	  	//,"Ctrl-J":
	  	//,"Ctrl-U" , Ctrl-O , Ctrl+P , Ctrl+D
	  	//,"Ctrl-R"
	  	//,

	  	,"Ctrl-Q":this.onClose
		});
	}

	,rebuildMilestone :function (markups)  {
		markupmethod.rebuildMilestone.call(this,markups);
	}

 //uses by ksana-codemirror/automarkup.js
	,createMilestones :function(ranges) {	
		return markupmethod.createMilestones.call(this,ranges);	
	}

	//just for lookup , not trigger redraw as markup.handle already exists.
	,addMarkup :function (markup) {	
		return markupmethod.addMarkup.call(this,markup);	
	}

	,getMarkup :function (key) {
		return this.state.markups[key];	
	}

	,getOther :function (markup,opts) {
		return markupmethod.getOther.call(this,markup,opts);
	}

	,removeMarkup :function(key) {
		return markupmethod.removeMarkup.call(this,key);
	}

	,onMarkup :function (M,action) {		
		return markupmethod.onMarkup.call(this,M,action);
	}

	,onSelection :function (fileselections) {
		var selections=fileselections[this.props.trait.filename];
		if (!selections) return;
		if (selections.length==0) {
			var cursor=this.doc.getCursor();
			this.doc.setSelections([{anchor:cursor,head:cursor}]);
			this.cm.focus();
		}
	}	

	,bookmark_transclusion :function(bookmark,editing_markup) { // bookmark.className="transclusion" , bookmark_ prefix (see markups.js applyBookmark)
		return transclude.call(this,bookmark,editing_markup);
	}

	,setsize :function() {
		var menu=ReactDOM.findDOMNode(this.refs.menu);
		if (this.cm) this.cm.setSize("100%",this.props.height-menu.offsetHeight); 
	}

	,getWid:function() {
		return this.props.wid;
	}
	,onClose :function () {
		filemethod.close.call(this);
	}

	,onChange :function (doc,change) {
		this.setState({dirty:!this.doc.isClean(this.generation)});

		if (doc.lineCount()!==this.state.lineCount) {
			console.log("change rebuild milestone")
			this.rebuildMilestone(this.state.markups);
			this.setState({lineCount:doc.lineCount()})
		}
	}

	,onSetTitle :function (title) {
		return traitmethod.setTitle.call(this,title); 
	}

	,onSetFlexHeight :function (flex) {
		return traitmethod.setFlexHeight.call(this,flex); 
	}

	,setDirty:function(cb) {
		this.setState({dirty:true});
	}

	,loaded :function () {
		return filemethod.loaded.call(this); 
	}

  ,writefile :function(fn) { 
  	return filemethod.save.call(this,fn); 
  }

	,onSave :function () {	
		return this.writefile(this.props.trait.filename); 
	}

	,markupReady :function() {
		return !!this.state.markupReady;
	}

	,onMarkupReady :function () {
		this.setState({markupReady:true});
		markupmethod.markupReady.call(this,this.state.markups);
	}


	,onCursorActivity :function (cm) {
		cursormethod.cursorActivity.call(this,cm);
	}

	,onMouseDown :function (cm,e) {//double click on a markup
		cursormethod.mouseDown.call(this,cm,e);	
	}

	,onMouseMove :function(e) {
		cursormethod.mouseMove.call(this,this.cm,e);
	}


	,getTheme :function() {
		return localStorage.getItem("lighttheme")=="true"?"":"ambiance";
	}

	,onBeforeChange :function(cm,changeObj) {
		googledrive.beforeChange.call(this,cm,changeObj);
	}

	,render:function () {
		if (!this.state.value) return React.createElement("div", null, "loading ", this.props.trait.filename)

		return React.createElement("div", null, 
			React.createElement(CloseTextButton, {onClose: this.onClose}), 
			React.createElement(TextViewMenu, React.__spread({ref: "menu"},  this.props, {dirty: this.state.dirty, generation: this.state.generation, 
				readOnly: this.props.trait.readOnly, 
				onClose: this.onClose, onSave: this.onSave, 
				onSetTitle: this.onSetTitle, 
				onSetFlexHeight: this.onSetFlexHeight})), 
			React.createElement(ListMarkup, {markups: this.state.markups, filename: this.props.trait.filename, doc: this.doc}), 
			
			React.createElement(CodeMirror, {ref: "cm", value: this.state.value, history: this.state.history, 
				markups: this.state.markups, 
				onMarkupReady: this.onMarkupReady, 
				readOnly: this.props.trait.readOnly, 
				onCursorActivity: this.onCursorActivity, 
				onBeforeChange: this.onBeforeChange, 
				theme: this.getTheme(), 
				onMouseDown: this.onMouseDown, 
				onMouseMove: this.onMouseMove, 
				onChange: this.onChange})
		)
	}
});
module.exports=DefaultTextView;
},{"../actions/markup":"C:\\ksana2015\\pannaloka\\src\\actions\\markup.js","../components/textviewmenu":"C:\\ksana2015\\pannaloka\\src\\components\\textviewmenu.js","../stores/markup":"C:\\ksana2015\\pannaloka\\src\\stores\\markup.js","../stores/selection":"C:\\ksana2015\\pannaloka\\src\\stores\\selection.js","./charinfo":"C:\\ksana2015\\pannaloka\\src\\textview\\charinfo.js","./closetextbutton":"C:\\ksana2015\\pannaloka\\src\\textview\\closetextbutton.js","./cursormethod":"C:\\ksana2015\\pannaloka\\src\\textview\\cursormethod.js","./filemethod":"C:\\ksana2015\\pannaloka\\src\\textview\\filemethod.js","./googledrive":"C:\\ksana2015\\pannaloka\\src\\textview\\googledrive.js","./listmarkup":"C:\\ksana2015\\pannaloka\\src\\textview\\listmarkup.js","./markupmethod":"C:\\ksana2015\\pannaloka\\src\\textview\\markupmethod.js","./traitmethod":"C:\\ksana2015\\pannaloka\\src\\textview\\traitmethod.js","./transclude":"C:\\ksana2015\\pannaloka\\src\\textview\\transclude.js","ksana-codemirror":"C:\\ksana2015\\node_modules\\ksana-codemirror\\src\\index.js","react":"react","react-dom":"react-dom"}],"C:\\ksana2015\\pannaloka\\src\\textview\\filemethod.js":[function(require,module,exports){
var highlight=require("./highlight");
var docfileaction=require("../actions/docfile");
var ktxfileaction=require("../actions/ktxfile");
var selectionaction=require("../actions/selection");
var cmfileio=require("../cmfileio");
var stackwidgetaction=require("../actions/stackwidget");
var markupaction=require("../actions/markup");
var markupstore=require("../stores/markup");
var googledrive=require("./googledrive");

var	loaded = function() {
	this.cm=this.refs.cm.getCodeMirror();
	this.cm.react=this;
	this.generation=this.cm.changeGeneration(true);
	this.doc=this.cm.getDoc();	
	docfileaction.openFile(this.doc,this.props.trait.filename,this.props.trait);
	this.setsize();
	this.keymap();
	this.cm.focus();
	if (this.props.trait.top) {
		this.cm.scrollTo(0,this.props.trait.top);
	}
	if (this.props.trait.scrollTo) {
		setTimeout(function(){
			highlight.highlightDoc(this.doc,this.props.trait.scrollTo);
		}.bind(this),300);//wait for markup to load
	}
}


var load = function(fn,opts) {
	opts=opts||{};
	if (opts.host==="google") {
		googledrive.load.call(this,opts.doc,opts.title);
	} else {
		cmfileio.readFile(this.props.trait.filename,function(err,data){
			if (err) {
				this.setState({value:"File created on "+new Date()},this.loaded);
			} else {
				this.setState(data,this.loaded);
			}
		}.bind(this));

	}
}

var save = function(fn) {
	if (this.props.trait.host==="google") {
		this.setState({dirty:false});
		return;
	}

	var meta=JSON.parse(JSON.stringify(this.props.trait));
	delete meta.stat;

	meta.top=this.cm.getScrollInfo().top;
	cmfileio.writeFile(meta,this.cm,fn,function(err,newmeta){
    if (err) console.log(err);
    else  {
    	if (this.state.titlechanged) ktxfileaction.reload();
			this.generation=this.cm.changeGeneration(true);
			this.setState({dirty:false,titlechange:false,meta:newmeta,generation:this.generation});

			for (var i in meta){
				this.props.trait[i]=meta[i];	
			}
    }
  }.bind(this));
}

var close = function() {
		stackwidgetaction.closeWidget(this.props.wid);
		selectionaction.clearSelectionOf(this.props.trait.filename);
		docfileaction.closeFile(this.props.trait.filename);

		var editing=markupstore.getEditing();
		if (editing && editing.doc===this.doc) {
			markupstore.freeEditing();
			markupaction.markupsUnderCursor([]);
		}

}
module.exports={load:load,loaded:loaded,save:save,close:close};
},{"../actions/docfile":"C:\\ksana2015\\pannaloka\\src\\actions\\docfile.js","../actions/ktxfile":"C:\\ksana2015\\pannaloka\\src\\actions\\ktxfile.js","../actions/markup":"C:\\ksana2015\\pannaloka\\src\\actions\\markup.js","../actions/selection":"C:\\ksana2015\\pannaloka\\src\\actions\\selection.js","../actions/stackwidget":"C:\\ksana2015\\pannaloka\\src\\actions\\stackwidget.js","../cmfileio":"C:\\ksana2015\\pannaloka\\src\\cmfileio.js","../stores/markup":"C:\\ksana2015\\pannaloka\\src\\stores\\markup.js","./googledrive":"C:\\ksana2015\\pannaloka\\src\\textview\\googledrive.js","./highlight":"C:\\ksana2015\\pannaloka\\src\\textview\\highlight.js"}],"C:\\ksana2015\\pannaloka\\src\\textview\\googledrive.js":[function(require,module,exports){
var textMarker2json=require("ksana-codemirror").textMarker2json;
var json2textMarker=require("ksana-codemirror").json2textMarker;
var realtimeaction=require("../google/realtimeaction");

var TEXT_DELETED,TEXT_INSERTED,VALUES_ADDED,VALUES_REMOVED,VALUE_CHANGED;
var load=function(doc,title){
		this._changes=[];
		var _markups=doc.getModel().getRoot().get('markups');
		var markups=loadMarkupFromGoogleDrive.call(this,_markups);
		var _text=doc.getModel().getRoot().get('text'); 
		var data={value:_text.text, meta:{title:title}, markups:markups
		, _markups:_markups, _text:_text ,_doc:doc };

		TEXT_INSERTED=gapi.drive.realtime.EventType.TEXT_INSERTED;
		TEXT_DELETED=gapi.drive.realtime.EventType.TEXT_DELETED;
		VALUES_ADDED=gapi.drive.realtime.EventType.VALUES_ADDED;
		VALUES_REMOVED=gapi.drive.realtime.EventType.VALUES_REMOVED;
		VALUE_CHANGED=gapi.drive.realtime.EventType.VALUE_CHANGED;

		_text.addEventListener(TEXT_INSERTED,inserttext.bind(this));
		_text.addEventListener(TEXT_DELETED,deletetext.bind(this));

		_markups.addEventListener(VALUE_CHANGED,markupchanged.bind(this));
		this.setState(data,this.loaded);
}

var loadMarkupFromGoogleDrive=function(markups) {
	var out={};
	var keys=markups.keys(),values=markups.values();
	for (var i=0;i<keys.length;i++) {
		var k=keys[i]
		var v=values[i];
		out[k]={};
		for (var key in v){
			out[k][key]=v[key];
		}
	}
	return out;
}
var setTitle=function(fileid,title,cb){
	gapi.client.load('drive', 'v2', function() {  
		var renameRequest = gapi.client.drive.files.patch({
            fileId: fileid,
            resource: { title: title }
    });
		renameRequest.execute(function(resp) {
			cb(0,resp.title);
    });
	});
}
var inserttext=function(e) {
	if (e.isLocal) return;
  var from  = this.cm.posFromIndex(e.index);
  this.ignore_change = true ;
  this.cm.replaceRange(e.text, from, from);
	this.ignore_change = false ;
}

var deletetext=function(e) {
	if (e.isLocal) return;
  var from = this.cm.posFromIndex(e.index) ;
	var to   = this.cm.posFromIndex(e.index + e.text.length) ;

  this.ignore_change = true ;
  this.cm.replaceRange("", from, to);
	this.ignore_change = false ;
}

var markupadded=function(e){
	if (e.isLocal) return;
	var m={};
	for (var i in e.newValue) {
		m[i]=e.newValue[i];
	}
	json2textMarker.call(this,this.cm,e.property,m);
	this.state.markups[e.property]=m;
}
var markupmodified=function(e){
	var newtrait={};
	if (!e.newValue.trait) return;

	for (var key in e.newValue.trait){
		newtrait[key]=newValue.trait[key];
	}
	var M=this.state.markups[e.property];
	if (newValue.from) M.from=JSON.parse(JSON.stringify(e.newValue.from));
	if (newValue.to) M.to=JSON.parse(JSON.stringify(e.newValue.to));

	M.trait=newtrait;
}
var markupdelete=function(e){
	if (e.isLocal) return;

	var m=this.getMarkup(e.property);
	delete this.state.markups[e.property];//in this.state.markups
	if (m && m.handle) m.handle.clear();
}
var markupchanged=function(e){
	if (e.isLocal) return;

	if (e.oldValue===null && e.newValue) markupadded.call(this,e);
	else if (e.newValue===null && e.oldValue) markupdelete.call(this,e);
	else markupmodified.call(this,e);
}
var beforeChange=function(cm,changeObj) {
	if (!this.isGoogleDriveFile())return;
	if (this.ignore_change) return;

	var coString=this.state._text;

  var from  = this.cm.indexFromPos(changeObj.from);
  var to    = this.cm.indexFromPos(changeObj.to);
  var text  = changeObj.text.join('\n');

  clearTimeout(this._gdrivetimer);
  this._changes.push([from,to,text]);

  this._gdrivetimer=setTimeout(function(){
  	update.call(this);
  }.bind(this),1000);

}
var findTouchedMarkup=function(){
	var markups=this.state.markups;
	var out=[];
	for (var key in markups) {
		var m=markups[key];
		var pos=m.handle.find();
		if (pos.from.line!==m.from[1] || pos.from.ch!==m.from[0] ||
			  pos.to.line!==m.to[1] || pos.to.ch!==m.to[0] ) {
			var newm=textMarker2json(m.handle);
			out.push([key,newm]);
		}
	}
	return out;
}

var unmount = function() {
	if (this.state._text) this.state._text.removeAllEventListeners();
	if (this.state._markups) this.state._markups.removeAllEventListeners();
}

var update=function(){
	var coString=this.state._text, coMarkups=this.state._markups;
	var model=this.state._doc.getModel();
	model.beginCompoundOperation();
	for (var i=0;i<this._changes.length;i++){
		var c=this._changes[i];
		var from=c[0], to=c[1],text=c[2];
		if (to - from > 0)    coString.removeRange(from, to);
  	if (text.length > 0)  coString.insertString(from, text);
	}
	this._changes=[];
	var touchedMarkups=findTouchedMarkup.call(this);
	for (var i=0;i<touchedMarkups.length;i++) {
		var m=touchedMarkups[i];
		coMarkups.set(m[0],m[1]);
	}

	model.endCompoundOperation();

	//replace markup in textview
	setTimeout(function(){
		for (var i=0;i<touchedMarkups.length;i++) {
			var m=touchedMarkups[i];
			var oldm=this.state.markups[m[0]];
			m[1].handle=oldm.handle;
			this.state.markups[m[0]]=m[1];
		}
	}.bind(this),500);//must smaller than 	
}
var openFile=function(fileid,opts,cb) {
	gapi.client.load('drive', 'v2', function() {  
		var request = gapi.client.drive.files.get({
  	  'fileId': fileid
  	});
  	request.execute(function(resp){
  		if (resp.error) {
  			alert(resp.error.message);
  		} else {
  			realtimeaction.openFile(fileid,resp.title,opts,cb);	
  		}
	  })
  });
}
module.exports={load:load,update:update,markupchanged:markupchanged,inserttext:inserttext,deletetext:deletetext
,beforeChange:beforeChange,unmount:unmount,openFile:openFile,setTitle:setTitle};
},{"../google/realtimeaction":"C:\\ksana2015\\pannaloka\\src\\google\\realtimeaction.js","ksana-codemirror":"C:\\ksana2015\\node_modules\\ksana-codemirror\\src\\index.js"}],"C:\\ksana2015\\pannaloka\\src\\textview\\highlight.js":[function(require,module,exports){
var docfilestore=require("../stores/docfile");
var stackwidgetaction=require("../actions/stackwidget");
var overlayaction=require("../actions/overlay");
var milestones=require("ksana-codemirror").milestones;
var ktxfilestore=require("../stores/ktxfile");
var markupstore=require("../stores/markup");
var googledrive=require("./googledrive");
var gotoRangeOrMarkupID=function(file,range_mid,opts) {
	opts=opts||{};
	if (opts.below && !opts.autoOpen) opts.autoOpen=true;
	
	var targetdoc=docfilestore.docOf(file);
	
	if (targetdoc) {
		if (!targetdoc.getEditor().react.markupReady()) {
		//wait for this.state.markups ready, because markups is load later
		//see ksana-codemirror/src/codemirror-react.js componentDidMount			
			setTimeout(function(){
				highlightDoc.call(this,targetdoc,range_mid,opts);
			}.bind(this),500);//wait for markups to load
		} else {
			highlightDoc.call(this,targetdoc,range_mid,opts);
		}
	} else {
		if (!opts.autoOpen) return;
		var target=ktxfilestore.findFile(file);
		if (target) {
			target.scrollTo=range_mid;
			stackwidgetaction.openWidget(target,"TextWidget",{below:opts.below});	
		} else if (file.indexOf("/")===-1){
			googledrive.openFile.call(this,file,{below:opts.below,scrollTo:range_mid});
		}
	}
}
var getLinkedBy=function(m){
	var others=m.target;
	if (!others)return;
	if (typeof others[0]==="string"){
		var file=others[0];
		var doc=docfilestore.docOf(file);
		var mid=others[1];
		var markup=doc.getEditor().react.getMarkup(mid);
		return markup;
	}
}

var getMarkupsInRange=function(doc,from,to) {
	if (!to) {
		var marks=doc.findMarksAt(from);
	} else {
		var marks=doc.findMarks(from,to);
	}
		
	var markups=[],getMarkup=doc.getEditor().react.getMarkup;
	marks.forEach(function(m){
		if (m.type!=="bookmark" && m.className.substring(0,13)!=="editingMarker" && !m.clearOnEnter) {
			var markup=getMarkup(m.key);
			markups.push({markup:markup,key:m.key,doc:doc});
		}
	});
	return markups;
}

var getMarkupRect=function(m){
	var cm=m.handle.doc.getEditor();
	var pos=m.handle.find();
	var x1y1=cm.charCoords(pos.from);
	var x2y2=cm.charCoords(pos.to);
	return {left:x1y1.left,top:x1y1.top,right:x2y2.right,bottom:x2y2.bottom};
}

var drawLink=function(m1,m2) {	
	var rect1=getMarkupRect(m1);
	var rect2=getMarkupRect(m2);
	//console.log("drawlink",rect1,rect2)
	overlayaction.connect(rect1,rect2);
}
var highlights_handles=[];
var clearHighlights=function(){
	highlights_handles.map(function(h){h.clear()});
	highlights_handles=[];
}
var makeHighlights=function(doc,highlights,opts){
	if (!opts.noClear) clearHighlights();
	for (var i=0;i<highlights.length;i++) {
		var from=highlights[i][0],to=highlights[i][1];
		highlights_handles.push(doc.markText(from,to,{className:"highlight",clearOnEnter:true}));
		////var by=getLinkedBy(markup);
		//if (by) drawLink(markup,by);
	}

	clearInterval(this.timerMarker);
	if (!opts.keep) {
		this.timerMarker=setInterval(function(){
			
			if (!markupstore.getHovering()) clearHighlights();
		}.bind(this),1500);
	}
}
var	highlightDoc=function (doc,range_markupid,opts) {
	if (!range_markupid) return;
	opts=opts||{};
	var hl=range_markupid,highlights=[];
	//one or more key
	if (typeof range_markupid==="string" || typeof range_markupid[0]==="string") {
		var ranges=range_markupid;
		if (typeof range_markupid==="string") {
			ranges=[range_markupid];
		}
		highlights=[];
		for (var i=0;i<ranges.length;i++) {
			var markup=doc.getEditor().react.getMarkup(ranges[i]);
			if (!markup) {
				console.error("markup not found",ranges[i]);
			} else {
				var pos=markup.handle.find();
				var from=pos.from, to=pos.to;
				if (opts.moveCursor && i===0) doc.setCursor(from);
				highlights.push([from,to]);
			}
		}
	} else { //array format
		if (hl[0][0] instanceof Array) {
			//for quote , single range
			var newhl=milestones.unpack.call(doc,hl[0]);
			var from={line:newhl[0][1],ch:newhl[0][0]},to={line:newhl[1][1],ch:newhl[1][0]};
		} else {
			var newhl=milestones.unpack.call(doc,hl);	
			var from={line:newhl[0][1],ch:newhl[0][0]},to={line:newhl[1][1],ch:newhl[1][0]};
		}
		
		highlights=[[from,to]];
		if (opts.moveCursor) {
			doc.getEditor().focus();	
			doc.setCursor(from);
		} 
	}
	var marker = document.createElement('span');

	if (highlights.length && !opts.noScroll) {
		doc.getEditor().scrollIntoView(highlights[0][0],50);
	}

	makeHighlights.call(this,doc,highlights,opts);
}

var getMarkupText=function(doc,m) {
	var pos=m.find();
	if (!pos) return;
	return doc.getRange(pos.from,pos.to);
}	

var posInRange=function(pos,range) { //check if a pos in range, cm format
	if (pos.line>range.from.line && pos.line<range.to.line) return true;//in range , not on boundary
	if (pos.line<range.from.line||pos.line>range.to.line)return false; //out of range
	if (pos.line===range.from.line) {
		return pos.ch>=range.from.ch;
	}

	if (pos.line===range.to.line) {
		return pos.ch<range.from.ch;
	}
	return false;
}
var highlightRelatedMarkup=function(m) { //highlight markup and all related 
	var filename=docfilestore.fileOf(m.handle.doc);
	if (!filename) return;

	var hilights={};//group by filename
	hilights[filename]=[];
	hilights[filename].push(m.handle.key);

	if (m.master) hilights[filename].push(m.master);

	if (m.handle.others && m.handle.others[0]) {
		hilights[filename]=hilights[filename].concat(m.handle.others);
	}
	var targets=m.handle.target;
	if (targets) {
		if (!(targets[0] instanceof Array)) targets=[targets];
		targets.forEach(function(t){
			if (!hilights[t[0]]) hilights[t[0]]=[];
			hilights[t[0]].push(t[1]);
		});		
	}
	clearHighlights();
	for (var file in hilights) {
		var doc=docfilestore.docOf(file);
		if (doc) highlightDoc.call(this,doc,hilights[file],{noScroll:true,noClear:true});
	}
}
var	autoGoMarkup = function(m) {
	var others=m.source||m.by||m.target;
	if (!others)return;
	if (others[0] instanceof Array) {
		others=others[0];
	}
	if (typeof others[0]==="string"){
		var wid=m.handle.doc.getEditor().react.getWid();
		gotoRangeOrMarkupID.call(this,others[0],others[1],{below:wid});
	}
}

module.exports={gotoRangeOrMarkupID:gotoRangeOrMarkupID,highlightDoc:highlightDoc
,getMarkupText:getMarkupText,posInRange:posInRange,getMarkupsInRange:getMarkupsInRange
,highlightRelatedMarkup:highlightRelatedMarkup,autoGoMarkup:autoGoMarkup};
},{"../actions/overlay":"C:\\ksana2015\\pannaloka\\src\\actions\\overlay.js","../actions/stackwidget":"C:\\ksana2015\\pannaloka\\src\\actions\\stackwidget.js","../stores/docfile":"C:\\ksana2015\\pannaloka\\src\\stores\\docfile.js","../stores/ktxfile":"C:\\ksana2015\\pannaloka\\src\\stores\\ktxfile.js","../stores/markup":"C:\\ksana2015\\pannaloka\\src\\stores\\markup.js","./googledrive":"C:\\ksana2015\\pannaloka\\src\\textview\\googledrive.js","ksana-codemirror":"C:\\ksana2015\\node_modules\\ksana-codemirror\\src\\index.js"}],"C:\\ksana2015\\pannaloka\\src\\textview\\listmarkup.js":[function(require,module,exports){
var React=require("react");
var selectionstore=require("../stores/selection");
var findmarkup=require("../markup/find");
var RangeHyperlink=require("../components/rangehyperlink");
var highlight=require("./highlight");
var types=require("../markuptypedef").types;
var ListMarkup = React.createClass({displayName: "ListMarkup",
	getInitialState:function(){
		return {links:[]};
	}
	,componentDidMount:function(){
		this.unsubscribe = selectionstore.listen(this.onSelection);
	}
	,componentWillUnmount:function(){
		clearTimeout(this.timer);
		this.unsubscribe();
	}

	,onHyperlinkClick:function(file,key_range) {
		highlight.gotoRangeOrMarkupID(file,key_range,{moveCursor:true,autoOpen:true});
	}

	,findMarkup :function() {
		var ranges=selectionstore.getRanges({textLength:20});
		if (!ranges || ranges.length!==1)return ;

		var rangetext=ranges[0][2],links=[];
		var markups=findmarkup.byMasterText(rangetext,this.props.markups);
		if (markups && markups.length) {
			links=markups.map(function(key){
				var clsname=this.props.markups[key].className;
				var typelabel="~"+types[clsname].label;
				return [this.props.filename, key, typelabel ];
			}.bind(this));				
		}

		if (this.props.filename==ranges[0][0]) {
			links.unshift([this.props.filename, ranges[0][1], rangetext,"跳回選取區" ]);//for link back to selection
		} else {
			links.unshift([this.props.filename, null, rangetext,markups.length?"":"無搜尋結果" ]);//not clickable , label only
		}
		this.setState({links});
	}	

	,onSelection :function(fileselections)  {
		clearTimeout(this.timer);
		var delta=Math.round(Math.random()*200);
		this.timer=setTimeout(this.findMarkup,800+delta);//different view get fired seperately
	}
	,render:function() {
		return React.createElement("span", null, React.createElement(RangeHyperlink, {onHyperlinkClick: this.onHyperlinkClick, ranges: this.state.links}))
	}
})
module.exports=ListMarkup;
},{"../components/rangehyperlink":"C:\\ksana2015\\pannaloka\\src\\components\\rangehyperlink.js","../markup/find":"C:\\ksana2015\\pannaloka\\src\\markup\\find.js","../markuptypedef":"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\index.js","../stores/selection":"C:\\ksana2015\\pannaloka\\src\\stores\\selection.js","./highlight":"C:\\ksana2015\\pannaloka\\src\\textview\\highlight.js","react":"react"}],"C:\\ksana2015\\pannaloka\\src\\textview\\markupmethod.js":[function(require,module,exports){
var highlight=require("./highlight");
var docfilestore=require("../stores/docfile");
var createmilestones=require("./createmilestones");
var selectionaction=require("../actions/selection");
var kcm=require("ksana-codemirror");
var textMarker2json=kcm.textMarker2json;
var markupNav=require("../markup/nav");
var	createMilestones = function (ranges)  { //uses by ksana-codemirror/automarkup.js
	createmilestones.call(this.cm,ranges,function(newmarkups){
		if (!newmarkups.length) return;
		var markups={};
		for (var i in this.state.markups ) markups[i]=this.state.markups[i];

		for (var i=0;i<newmarkups.length;i++) {
			markups[newmarkups[i].key]=newmarkups[i].markup;
		}
		
		this.setState({dirty:true,markups},function(){
			this.rebuildMilestone(this.state.markups);
		}.bind(this));
	}.bind(this));
}

var addremotemarkup=function(key,markup){//not in textview yet
	this.state._markups.set(key,markup);
}

var removeremotemarkup=function(markup) {
	this.state._markups.delete(markup.key);
}
/*
//just for lookup , not trigger redraw as markup.handle already exists.
var	addMarkup = function (markup) {
	if (!markup  || !markup.key) return;
	this.state.markups[markup.key]=markup;

	if (this.isGoogleDriveFile()) addremotemarkup(markup);
	if (markup.className==="milestone") this.rebuildMilestone(this.state.markups);
	var file=docfilestore.fileOf(markup.handle.doc);
	markupNav.rebuild(file,markup.className);
	this.setState({dirty:true});
}
*/

var	getOther = function(markup,opts) {
	var out=[],markups=this.state.markups;
	opts=opts||{};
	if (markup.master) {
		var master=markups[markup.master];
		if (master) out.push(master);
	} else if (markup.others) {
		for (var i=0;i<markup.others.length;i++) {
			var key=markup.others[i];
			out.push(markups[key]);
		}
	}

	if (out.length && opts.format=="range") {
		return out.map(function(m){
			var file=docfilestore.fileOf(m.handle.doc);
			var text=highlight.getMarkupText(m.handle.doc,m.handle);
			return [file,m.key,text];
		});
	}
	return out;
}

var	removeMarkup =function(key) {
	var m=this.state.markups[key];

	if (m) {
		var clsname=m.className;
		if (this.isGoogleDriveFile()) removeremotemarkup.call(this,m);

		m.handle.clear();
		delete this.state.markups[key];
		if (clsname==="milestone") this.rebuildMilestone(this.state.markups);
		var file=docfilestore.fileOf(m.handle.doc);
		markupNav.rebuild(file,clsname);
		this.setState({dirty:true});
	} else {
		console.error("unknown markup id",key)
	}
}

var markupReady = function (markups) {//this is React component
	this.rebuildMilestone.call(this,markups);//in defaulttextview
	var fn=docfilestore.fileOf(this.doc);
	markupNav.setMarkups(markups,fn);
}

var onMarkup = function(M,action) {		
	var shallowCopyMarkups = function(M) { //use Object.assign in future
		var out={};
		for (var i in M) out[i]=M[i];
		return out;
	}
	if (!action || !action.newly || !M.length) return;
	var touched=null;
	var markups=null;
	for (var i in M) {
		var m=M[i];
		if (m.doc===this.doc) {
			if (!markups) markups=shallowCopyMarkups(this.state.markups);
			markups[m.key]=m.markup;
			if (this.isGoogleDriveFile()) addremotemarkup.call(this,m.key,m.markup);
			if (!touched) touched={};
			touched[m.markup.className]=true;
		}
	}

	selectionaction.clearAllSelection();
	if (markups) this.setState({dirty:true,markups},function(){
		//console.log(Object.keys(markups).length,Object.keys(this.state.markups).length);
		if (touched) {
			var file=docfilestore.fileOf(this.doc);
			markupNav.setMarkups(this.state.markups,file,true);//do not perform full rebuild
			for (var type in touched) {
				markupNav.rebuild(file,type);
			}
		}
		if (M[0].markup.className==="milestone") this.rebuildMilestone(markups);
	}.bind(this));

}

var rebuildMilestone = function (markups) {
	kcm.milestones.buildMilestone(this.doc,markups);
	//force repaint of gutter
	this.cm.setOption("lineNumbers",false);
	this.cm.setOption("lineNumbers",true);
}

module.exports={onMarkup:onMarkup,createMilestones:createMilestones,markupReady:markupReady,
	getOther:getOther,removeMarkup:removeMarkup,rebuildMilestone:rebuildMilestone}
},{"../actions/selection":"C:\\ksana2015\\pannaloka\\src\\actions\\selection.js","../markup/nav":"C:\\ksana2015\\pannaloka\\src\\markup\\nav.js","../stores/docfile":"C:\\ksana2015\\pannaloka\\src\\stores\\docfile.js","./createmilestones":"C:\\ksana2015\\pannaloka\\src\\textview\\createmilestones.js","./highlight":"C:\\ksana2015\\pannaloka\\src\\textview\\highlight.js","ksana-codemirror":"C:\\ksana2015\\node_modules\\ksana-codemirror\\src\\index.js"}],"C:\\ksana2015\\pannaloka\\src\\textview\\traitmethod.js":[function(require,module,exports){
var docfileaction=require("../actions/docfile");
var googledrive=require("./googledrive");
var setFlexHeight=function(flex) {
	this.props.trait.flex=flex; //bad practice
	this.props.resize();
}


var setTitle=function(title){
	if (this.props.trait.host==="google") {
		googledrive.setTitle(this.props.trait.filename,title,function(err,title){
			this.props.trait.title=title; //bad practice
			this.setState({dirty:true,titlechanged:true});
		}.bind(this));

	}else {
		this.props.trait.title=title; //bad practice
		this.setState({dirty:true,titlechanged:true});
	}
}	

module.exports={setFlexHeight:setFlexHeight,setTitle:setTitle};
},{"../actions/docfile":"C:\\ksana2015\\pannaloka\\src\\actions\\docfile.js","./googledrive":"C:\\ksana2015\\pannaloka\\src\\textview\\googledrive.js"}],"C:\\ksana2015\\pannaloka\\src\\textview\\transclude.js":[function(require,module,exports){
var MAX_TRANSCLUSION_LENGTH = 30;

var React=require("react");
var ReactDOM=require("react-dom");
var selectionstore=require("../stores/selection");
var docfilestore=require("../stores/docfile");
var uuid=require("../uuid");
var transclusion = require("../components/transclusion");
var milestones=require("ksana-codemirror").milestones;
var highlight=require("./highlight");
var bookmarkfromrange=function(doc) { //simulate bookmark format in file
	var bookmark={}; 
	var ranges=selectionstore.getRanges();
	if (ranges.length!==1)return;
	var thisfile=docfilestore.fileOf(doc);
	if (!thisfile || thisfile==ranges[0][0])return ;//cannot tranclude in same file

  var text=selectionstore.getRangeText(0);
  if (text.length>MAX_TRANSCLUSION_LENGTH) text=text.substr(0,MAX_TRANSCLUSION_LENGTH)+"...";

  var packed=milestones.pack.call( docfilestore.docOf(ranges[0][0]),ranges[0][1]);
  bookmark.target=[ranges[0][0],packed,text];
  bookmark.key=uuid();
  bookmark.className="transclusion";
  //TODO save target file generation 
  return bookmark;
}

var bookmarkfrommarkup=function(mrk) {
	var bookmark={};
	var file=docfilestore.fileOf(mrk.markup.handle.doc);
	var text="~"+highlight.getMarkupText(mrk.markup.handle.doc,mrk.markup.handle);
	bookmark.target=[file, mrk.key, text];
	bookmark.key=uuid();
	bookmark.className="transclusion";
	return bookmark;
}

var removeBookmarkAtCursor = function(doc) {
	var cursor=doc.getCursor();
	var removed=0;
	var react=doc.getEditor().react;
	var bookmarks=doc.findMarksAt(cursor);
	bookmarks.forEach(function(bookmark){
		if (bookmark.type==="bookmark") {
			react.removeMarkup(bookmark.key);
			bookmark.clear();
			removed++;
		}
	});
	return removed;
}

var transclude_onclick=function(e) {
	var key=e.target.dataset.mid;
	var m=this.getMarkup(key);
	var highlight= m.target[1];
	this.doc.setCursor(m.handle.find());
	highlight.gotoRangeOrMarkupID(m.target[0],m.target[1],{below:this.props.wid,moveCursor:true});
}	


var transclude=function(bm,mrk) {
	var doc=this.doc;
	var removed=removeBookmarkAtCursor.call(this,doc);
	if (removed) return;
	if (mrk) {
		bm=bookmarkfrommarkup(mrk);
	} else if (!bm) {
		bm=bookmarkfromrange(doc);
	}
	if (!bm) return;

	var cursor=doc.getCursor();
  var marker = document.createElement('span');
  ReactDOM.render(  React.createElement(transclusion,
  	{title:bm.target[0],mid:bm.key,text:bm.target[2],onClick:transclude_onclick.bind(this)})
  ,marker);
  var textmarker=doc.markText(cursor,cursor,{
  	  //need codemirror after 5.7.1 https://github.com/codemirror/CodeMirror/commit/bc5a4939b2603f587c2358a8b13063862660bcdf
  	replacedWith:marker,target:bm.target,className:bm.className,clearWhenEmpty: false,key:bm.key,type:"bookmark"}
  );

  //textmarker.type="bookmark"; //load from file will cause transclusion class apply till end-of-line
  bm.handle=textmarker;
  return bm;
}


module.exports=transclude;
},{"../components/transclusion":"C:\\ksana2015\\pannaloka\\src\\components\\transclusion.js","../stores/docfile":"C:\\ksana2015\\pannaloka\\src\\stores\\docfile.js","../stores/selection":"C:\\ksana2015\\pannaloka\\src\\stores\\selection.js","../uuid":"C:\\ksana2015\\pannaloka\\src\\uuid.js","./highlight":"C:\\ksana2015\\pannaloka\\src\\textview\\highlight.js","ksana-codemirror":"C:\\ksana2015\\node_modules\\ksana-codemirror\\src\\index.js","react":"react","react-dom":"react-dom"}],"C:\\ksana2015\\pannaloka\\src\\uuid.js":[function(require,module,exports){
module.exports=function generateUUID(){
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}
},{}],"C:\\ksana2015\\pannaloka\\src\\views\\createmarkup.js":[function(require,module,exports){
var React=require("react");
var Component=React.Component;
var PureRender=require('react-addons-pure-render-mixin');

var selectionstore=require("../stores/selection");
var markupstore=require("../stores/markup");
var markupaction=require("../actions/markup");
var markuptypedef=require("../markuptypedef");
var getAvailableType=markuptypedef.getAvailableType;
var types=markuptypedef.types;
var DefaultMarkupAttrEditor=require("../markuptypedef/defmarkupattr");

var UserPreference =function() {
	this.preferences=[];
	this.setPrefer=function(type, others) {
		this.preferences=this.preferences.filter(function(pref){
			return (others.indexOf(pref)===-1);
		});
		this.preferences.push(type);
	} 

	this.getPrefer=function(types) { //return first matching perference
		for (var i=0;i<types.length;i++) {
			if (this.preferences.indexOf(types[i])>-1) {
				return i;
			}
		}
		return 0;
	}
}

var CreateMarkup = React.createClass({displayName: "CreateMarkup",
	getInitialState:function() {
		var selections=selectionstore.selections;
		this.user=new UserPreference();
		var T=getAvailableType(selections);
		var selectedIndex=this.user.getPrefer(T);		
		return {types:T,userselect:"",selectedIndex:0,selections:selectionstore.selections};
	}

	,onData :function(selections) {
		var types=getAvailableType(selections);
		var selectedIndex=this.user.getPrefer(types);
		if (types.length) markupstore.cancelEdit();
		this.setState({types,selectedIndex,selections});
	}

	,componentDidMount :function() {
		this.unsubscribe = selectionstore.listen(this.onData);
	}

	,componentWillUnmount :function() {
		this.unsubscribe();
	}

	,selecttype :function(e) {
		var target=e.target;
		while (target && typeof target.dataset.idx==="undefined") target=target.parentElement;
		if (!target) return;
		var idx=parseInt(target.dataset.idx);
		var userselect=this.state.types[idx];
		this.user.setPrefer(userselect,this.state.types);
		this.setState({selectedIndex:idx});
	}

	,renderType :function(item,idx) {
		return React.createElement("label", {className: "markuptype", key: idx, "data-idx": idx}, React.createElement("input", {checked: idx==this.state.selectedIndex, 
				onChange: this.selecttype, 
				type: "radio", name: "markuptype"}), types[item].label)
	}

	,onCreateMarkup :function (trait) {
		var selections=this.state.selections;
		var typename=this.state.types[this.state.selectedIndex];
		var typedef=types[typename];
		markupaction.createMarkup({selections,trait,typename,typedef});
	}

	,setHotkey :function (handler) {
		markupaction.setHotkey(handler);
	}

	,renderAttributeEditor :function() {
		if (this.state.types.length===0 || this.state.selectedIndex===-1) return;

		var activetype=this.state.types[this.state.selectedIndex];
		var attributeEditor=types[activetype].editor || DefaultMarkupAttrEditor;
		return React.createElement( attributeEditor,
			{selections:this.state.selections
				,setHotkey:this.setHotkey
				,onCreateMarkup:this.onCreateMarkup} );

	}
	,msg :function() {
		var s="選取文字，按Ctrl選多段";
		if (markupstore.getEditing()) s="";//Ctrl+L 嵌用此標記→";
		return s;
	}

	,render :function() {//need 130% to prevent flickering when INPUT add to markup editor
		if (!this.props.editing) {
			markupaction.setHotkey(null);
			return React.createElement("span", null)
		}

		if (!this.state.types.length) {
			markupaction.setHotkey(null);
		}

		return React.createElement("span", null, 
			this.state.types.length?
			this.state.types.map(this.renderType):this.msg(), 
			"|", 
			this.renderAttributeEditor()
		)
	}
});
module.exports=CreateMarkup;
},{"../actions/markup":"C:\\ksana2015\\pannaloka\\src\\actions\\markup.js","../markuptypedef":"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\index.js","../markuptypedef/defmarkupattr":"C:\\ksana2015\\pannaloka\\src\\markuptypedef\\defmarkupattr.js","../stores/markup":"C:\\ksana2015\\pannaloka\\src\\stores\\markup.js","../stores/selection":"C:\\ksana2015\\pannaloka\\src\\stores\\selection.js","react":"react","react-addons-pure-render-mixin":"C:\\ksana2015\\node_modules\\react-addons-pure-render-mixin\\index.js"}],"C:\\ksana2015\\pannaloka\\src\\views\\filelist.js":[function(require,module,exports){
var React=require("react");
var Component=React.Component;
var PureRender=require('react-addons-pure-render-mixin');


var ktxfilestore=require("../stores/ktxfile");
var FileItem=require("../components/fileitem");

var stackwidgetaction=require("../actions/stackwidget");
var NewFileButton = React.createClass({displayName: "NewFileButton",
	newfile : function(){
		var emptyfile={filename:ktxfilestore.newfilename() , title:"Untitled" , newfile:true};
		stackwidgetaction.openWidget(emptyfile,"TextWidget");
	}

	,render :function() {
		return React.createElement("button", {onClick: this.newfile}, "Create New File")
	}
});
var FileList = React.createClass({displayName: "FileList",
	getInitialState:function(){
		return {files:[],selectedIndex:0};
	}

	,onData :function(files) {
		this.setState({files});
	}

	,componentDidMount :function() {
		this.unsubscribe = ktxfilestore.listen(this.onData);
	}

	,componentWillUnmount :function() {
		this.unsubscribe();
	}

	,openfile :function(e) {
		var fobj=this.state.files[this.state.selectedIndex];
		var obj=ktxfilestore.findFile(fobj.filename);
		if (obj) {
			stackwidgetaction.openWidget(obj,"TextWidget");	
		}
	}

	,renderItem :function(item,idx) {
		return React.createElement("div", {key: idx, "data-idx": idx}, 
			React.createElement(FileItem, React.__spread({onClick: this.openfile, 
			selected: this.state.selectedIndex==idx},  item)))
	}

	,selectItem :function(e) {
		var target=e.target;
		while (target && target.dataset && !target.dataset.idx) {
			target=target.parentElement;
		}
		if (!target || !target.dataset) return;
		var selectedIndex=parseInt(target.dataset.idx);
		if (!isNaN(selectedIndex)) this.setState({selectedIndex});
	}

	,render :function() {
		return React.createElement("div", null, 
				React.createElement(NewFileButton, null), 
				React.createElement("div", {onClick: this.selectItem}, this.state.files.map(this.renderItem))
		)
	}
});
module.exports = FileList;
},{"../actions/stackwidget":"C:\\ksana2015\\pannaloka\\src\\actions\\stackwidget.js","../components/fileitem":"C:\\ksana2015\\pannaloka\\src\\components\\fileitem.js","../stores/ktxfile":"C:\\ksana2015\\pannaloka\\src\\stores\\ktxfile.js","react":"react","react-addons-pure-render-mixin":"C:\\ksana2015\\node_modules\\react-addons-pure-render-mixin\\index.js"}],"C:\\ksana2015\\pannaloka\\src\\views\\inputmethod.js":[function(require,module,exports){
var React=require("react");
var Component=React.Component;
var docfilestore=require("../stores/docfile");
var IME=require("ksana-inputmethod")();

var InputMethod=React.createClass({displayName: "InputMethod",
	getInitialState:function() {
		return {selected:this.props.ime-1,preview:""};
	}
	,input:function(val,e) {
		var cm=docfilestore.getActiveEditor();
		var output=IME[this.state.selected].ime.convert(val);
		if (output) {
			var pos=cm.getCursor();
			cm.replaceRange(output,pos,pos);
			cm.setCursor({line:pos.line,ch:pos.ch+output.length});
			this.setState({preview:""});
		}
		e.target.value="";
	}
	,componentWillUnmount:function() {
		clearTimeout(this.timer);
	}
	,onChange:function(e) {
		clearTimeout(this.timer);
		var val=e.target.value;
		this.timer=setTimeout(function(){
			var preview=IME[this.state.selected].ime.convert(val);
			this.setState({preview:preview});
		}.bind(this),100);
	}
	,onKeyPress:function(e) {
		if (e.key=="Enter") return this.input(e.target.value,e);
	}
	,componentWillReceiveProps : function(nextprops) {
		this.setState({selected:nextprops.ime-1});
	}
	,renderIME:function(item,idx){
		return React.createElement("option", {value: item.name, key: idx}, item.name)
	}
	,selectIME:function(e){
		this.setState({selected:e.target.selectedIndex});
		this.props.onSetIME&&this.props.onSetIME(e.target.selectedIndex+1);
	}
	,render:function(){
		if (this.state.selected<0) return React.createElement("span", null)
		return React.createElement("span", null, 
			React.createElement("select", {value: IME[this.state.selected].name, 
			onChange: this.selectIME}, IME.map(this.renderIME)), 
			React.createElement("input", {onKeyPress: this.onKeyPress, onChange: this.onChange}), 
			React.createElement("span", null, this.state.preview)
		)
	}
});

module.exports=InputMethod;
},{"../stores/docfile":"C:\\ksana2015\\pannaloka\\src\\stores\\docfile.js","ksana-inputmethod":"C:\\ksana2015\\node_modules\\ksana-inputmethod\\index.js","react":"react"}],"C:\\ksana2015\\pannaloka\\src\\views\\markupnav.js":[function(require,module,exports){
var React=require("react");
var markupstore=require("../stores/markup");
var markupNav = React.createClass({displayName: "markupNav",
	next :function() {
		var next=markupstore.getNext();
		this.props.goMarkupByKey(next);
	}
	,prev :function() {
		var prev=markupstore.getPrev();
		this.props.goMarkupByKey(prev);
	}
	,render :function() {
		var editing=markupstore.getEditing();
		if (!editing) return React.createElement("span", null)
		return React.createElement("span", null, 
			React.createElement("button", {onClick: this.prev}, "Prev"), 
			React.createElement("button", {onClick: this.next}, "Next")

		)
	}
});
module.exports=markupNav;
},{"../stores/markup":"C:\\ksana2015\\pannaloka\\src\\stores\\markup.js","react":"react"}],"C:\\ksana2015\\pannaloka\\src\\views\\markuppanel.js":[function(require,module,exports){
var React=require("react");
var Component=React.Component;
var PureRender=require('react-addons-pure-render-mixin');


var markupstore=require("../stores/markup");
var markupaction=require("../actions/markup");
var selectionstore=require("../stores/selection");
var docfilestore=require("../stores/docfile");
var CreateMarkup=require("./createmarkup");
var MarkupSelector=require("../components/markupselector");
var MarkupNavigator=require("./markupnav");
var highlight=require("../textview/highlight");

var MarkupPanel = React.createClass({displayName: "MarkupPanel",
	getInitialState() {
		return {editing:null,markups:[],hasSelection:false,deletable:false,getOther:null};
	}
	,onClose : function()  {
		stackwidgetaction.closeWidget(this.props.wid)
	}

	,onMarkup : function (markups,action)  {
		if (action.cursor) {
			var keys=Object.keys(markups);
			var wid=null,cm=null,getOther=null;
			if (keys.length) {
				cm=markups[keys[0]].doc.getEditor();
				wid=cm.react.getWid();
				getOther=cm.react.getOther;
			}
			this.setState({markups,wid,cm,getOther});
		}
	}

	,onDocfile : function()  {
		this.forceUpdate();
	}

	,componentDidMount : function() {
		this.unsubscribe1 = markupstore.listen(this.onMarkup);
		this.unsubscribe2 = docfilestore.listen(this.onDocfile);
	}

	,componentWillUnmount : function() {
		this.unsubscribe1();
		this.unsubscribe2();
	}

	,onHyperlinkClick : function (file,mid,opts)  {
		var o={};
		for (var i in opts)	o[i]=opts[i];
		o.below=this.state.wid;
		o.autoopen=true;
		highlight.gotoRangeOrMarkupID(file,mid,o);
	}

	,onHyperlinkEnter : function (file,mid)  {
		highlight.gotoRangeOrMarkupID(file,mid,{noScroll:true});
	}

	,goMarkupByKey : function (mid)  {
		var editing=markupstore.getEditing();
		if (!editing)return;
		var file=docfilestore.fileOf(editing.doc);
		this.onHyperlinkClick(file,mid,{moveCursor:true});
	}

	,onChanged : function (doc)  {
		doc.getEditor().react.setDirty();
	}

	,onDelete : function(m,typedef)  {
		if (!m || !m.handle) {
			throw "wrong markup"
			return;
		}
		markupstore.remove(m);
		var others=m.handle.doc.getEditor().react.getOther(m);
		if (others) {
			others.map(function(other){markupstore.remove(other)});
		}
		typedef.onDelete &&	typedef.onDelete(m);
	}

	,onEditing : function(m,handler)  {
		markupstore.setEditing(m,handler);
	}

	,render : function () {		

		var ranges=selectionstore.getRanges();

		return (React.createElement("span", null, React.createElement("span", {style: {fontSize:"130%"}}, "|"), 
			React.createElement(MarkupNavigator, {goMarkupByKey: this.goMarkupByKey}), 
			React.createElement(CreateMarkup, {editing: !this.state.markups.length}), 
			React.createElement(MarkupSelector, {
			 onHyperlinkClick: this.onHyperlinkClick, 
			 onHyperlinkEnter: this.onHyperlinkEnter, 
			 getOther: this.state.getOther, 
			 markups: this.state.markups, onChanged: this.onChanged, 
			 onDelete: this.onDelete, 
			 onEditing: this.onEditing, 
			 ranges: ranges, 
			 editing: this.state.editing, deletable: this.state.deletable})

			 
			)

		)
	}
});
module.exports=MarkupPanel;
},{"../actions/markup":"C:\\ksana2015\\pannaloka\\src\\actions\\markup.js","../components/markupselector":"C:\\ksana2015\\pannaloka\\src\\components\\markupselector.js","../stores/docfile":"C:\\ksana2015\\pannaloka\\src\\stores\\docfile.js","../stores/markup":"C:\\ksana2015\\pannaloka\\src\\stores\\markup.js","../stores/selection":"C:\\ksana2015\\pannaloka\\src\\stores\\selection.js","../textview/highlight":"C:\\ksana2015\\pannaloka\\src\\textview\\highlight.js","./createmarkup":"C:\\ksana2015\\pannaloka\\src\\views\\createmarkup.js","./markupnav":"C:\\ksana2015\\pannaloka\\src\\views\\markupnav.js","react":"react","react-addons-pure-render-mixin":"C:\\ksana2015\\node_modules\\react-addons-pure-render-mixin\\index.js"}],"C:\\ksana2015\\pannaloka\\src\\views\\outlinepanel.js":[function(require,module,exports){
var React=require("react");
var E=React.createElement;
var Component=React.Component;
var PureRender=require('react-addons-pure-render-mixin');

var docfilestore=require("../stores/docfile");
var ktcfilestore=require("../stores/ktcfile");
var ktcfileaction=require("../actions/ktcfile");
var highlight=require("../textview/highlight");
var TreeToc=require("ksana2015-treetoc").Component;
var RangeHyperlink=require("../components/rangehyperlink");
var SaveButton=require("../components/savebutton");
var selectionstore=require("../stores/selection");
var markupstore=require("../stores/markup");
var docfilestore=require("../stores/docfile");
var OutlinePanel = React.createClass({displayName: "OutlinePanel",
	getInitialState:function() {		
		return { toc:[{d:0,t:"test"},{d:1,t:"testchild"}] ,dirty:false};
	}

	,onToc :function( allfiles, toc) {
		if (!toc) return;
		this.setState({toc});
	}

	,componentDidMount :function() {
		this.unsubscribe = ktcfilestore.listen(this.onToc);
	}
	,componentWillUnmount :function() {
		this.unsubscribe();
	}
	,saveTree : function() {
		ktcfileaction.writeTree(this.state.toc);
		this.setState({dirty:false});
	}
	,onChanged : function() {
		this.setState({dirty:true});
	}

	,setLink :function(node) {
		var m=markupstore.getEditing();

		if (m) {
			var text=highlight.getMarkupText(m.doc,m.markup.handle);
			node.links=[[docfilestore.fileOf(m.doc),m.key,text]];
		} else { //try range
			var ranges=selectionstore.getRanges({textLength:5,pack:true});
			if (ranges.length) {
				node.links=ranges;
			} else delete node.links;
		}
		this.onChanged();
		this.forceUpdate();

	}

	,onHyperlinkClick :function(file,range) {
		highlight.gotoRangeOrMarkupID(file,range,{moveCursor:true,autoOpen:true});
	}
	,onNode :function(node,selected,n,editingcaption) {
		if (n==editingcaption) {
			var label="🔗";
			if (node.links) label="reset "+label;
			return E("button",{onClick:this.setLink.bind(this,node)},label);
		} else {
			return E(RangeHyperlink,{onHyperlinkClick:this.onHyperlinkClick,ranges:node.links||[]})
		}
	}

	,render :function() {
		return React.createElement("div", null, 
		React.createElement(SaveButton, {dirty: this.state.dirty, onSave: this.saveTree}), 
		React.createElement(TreeToc, {opts: {editable:true,onNode:this.onNode}, 
			onChanged: this.onChanged, 
			toc: this.state.toc})
		)
	}
});
module.exports = OutlinePanel;
},{"../actions/ktcfile":"C:\\ksana2015\\pannaloka\\src\\actions\\ktcfile.js","../components/rangehyperlink":"C:\\ksana2015\\pannaloka\\src\\components\\rangehyperlink.js","../components/savebutton":"C:\\ksana2015\\pannaloka\\src\\components\\savebutton.js","../stores/docfile":"C:\\ksana2015\\pannaloka\\src\\stores\\docfile.js","../stores/ktcfile":"C:\\ksana2015\\pannaloka\\src\\stores\\ktcfile.js","../stores/markup":"C:\\ksana2015\\pannaloka\\src\\stores\\markup.js","../stores/selection":"C:\\ksana2015\\pannaloka\\src\\stores\\selection.js","../textview/highlight":"C:\\ksana2015\\pannaloka\\src\\textview\\highlight.js","ksana2015-treetoc":"C:\\ksana2015\\node_modules\\ksana2015-treetoc\\index.js","react":"react","react-addons-pure-render-mixin":"C:\\ksana2015\\node_modules\\react-addons-pure-render-mixin\\index.js"}],"C:\\ksana2015\\pannaloka\\src\\views\\overlay.js":[function(require,module,exports){
var React=require("react");
var Component=React.Component;
var E=React.createElement;
var PureRender=require('react-addons-pure-render-mixin');

var styles={svg:{width:"1920px",height:"1080px"},
overlay:{position:"absolute",left:0,top:0,pointerEvents:"none"}};
var overlaystore=require("../stores/overlay");
var Overlay = React.createClass({displayName: "Overlay",
  getInitialState:function() {
    return {paths:[]};
    //{stroke:"red",d:"M150 0 L75 200 L225 200Z"}
  }
  ,onPath :function(paths) {
    this.setState({paths});
  }
  ,componentDidMount:function() {
    this.unsubscribe = overlaystore.listen(this.onPath);
  }
  ,componentWillUnmount :function() {
    this.unsubscribe();
  }
  ,renderPaths :function(path,idx) {
    return E(path.cmd||"path",path);
  }
  ,render :function() {
    return ( 
        React.createElement("div", {id: "svgmarkups", style: styles.overlay}, 
          React.createElement("svg", {xmlns: "http://www.w3.org/2000/svg", style: styles.svg}, 
            this.state.paths.map(this.renderPaths), 
           React.createElement("defs", null, 
              React.createElement("marker", {id: "head", orient: "auto", markerWidth: "2", markerHeight: "4", refX: "0.1", 
                refY: "2"}, React.createElement("path", {id: "headpoly", d: "M0,0 V4 L5,5 Z", fill: "black"}))
           )
        )
      )
    ); 
  }
});
module.exports=Overlay;
},{"../stores/overlay":"C:\\ksana2015\\pannaloka\\src\\stores\\overlay.js","react":"react","react-addons-pure-render-mixin":"C:\\ksana2015\\node_modules\\react-addons-pure-render-mixin\\index.js"}],"C:\\ksana2015\\pannaloka\\src\\views\\simpleview.js":[function(require,module,exports){
var React=require("react");
var Component=React.Component;
var stackwidgetaction=require("../actions/stackwidget");
var StackWidgetMenu=require("../components/stackwidgetmenu");

var SimpleView = React.createClass({displayName: "SimpleView",
	onClose:function(){
		stackwidgetaction.closeWidget(this.props.wid);
	}
	,render :function() {
		return React.createElement("div", null, 
			React.createElement(StackWidgetMenu, {onClose: this.onClose}), 
			"hello ", this.props.trait.text, " ", this.props.wid
		)
	}
});
module.exports=SimpleView;
},{"../actions/stackwidget":"C:\\ksana2015\\pannaloka\\src\\actions\\stackwidget.js","../components/stackwidgetmenu":"C:\\ksana2015\\pannaloka\\src\\components\\stackwidgetmenu.js","react":"react"}],"C:\\ksana2015\\pannaloka\\src\\views\\stackwidgetlist.js":[function(require,module,exports){
var React=require("react");
var Component=React.Component;

var stackwidgetstore=require("../stores/stackwidget");
var StackWidget=require("../containers/stackwidget");

var MINWIDGETHEIGHT = 150;

var StackWidgetList = React.createClass({displayName: "StackWidgetList",
	getInitialState:function(){
    
    return  { widgets:[], widgetheights:[]};
  }

	,componentDidMount :function() {
		this.unsubscribe = stackwidgetstore.listen(this.onData);
	}

	,componentWillUnmount :function() {
		this.unsubscribe();
	}

	,totalFlex :function(widgets) {
		return widgets.reduce(function(prev,w){ 
			return (w.trait.flex||1)+prev } 
		,0);
	}
	,setWidgetHeight :function(props,widgets) {
		if (!props) props=this.props;
		if (!widgets) widgets=this.state.widgets;
		var totalheight=props.height;
		var total=this.totalFlex(widgets);

		var widgetheights=widgets.map(function(w){
			var widgetheight=totalheight*((w.trait.flex||1)/total) - 4;
			if (widgetheight<MINWIDGETHEIGHT) widgetheight=MINWIDGETHEIGHT;
			return widgetheight;
		}.bind(this));

		this.setState({widgetheights});
	}

	,componentWillReceiveProps :function(nextProps) {
		this.setWidgetHeight(nextProps,this.state.widgets);
	}

	,onData :function(widgets) {
		this.setWidgetHeight(this.props,widgets);
		this.setState({widgets});
	}

	,renderItem :function(item,idx) {
		return React.createElement(StackWidget, {height: this.state.widgetheights[idx], key: item.wid, 
		resize: this.setWidgetHeight, wid: item.wid, widgetClass: item.widgetClass, trait: item.trait})
	}

  ,render :function() {
  	return React.createElement("div", null, 
  		this.state.widgets.map(this.renderItem)
  	)
  }
});
module.exports=StackWidgetList;
},{"../containers/stackwidget":"C:\\ksana2015\\pannaloka\\src\\containers\\stackwidget.js","../stores/stackwidget":"C:\\ksana2015\\pannaloka\\src\\stores\\stackwidget.js","react":"react"}],"C:\\ksana2015\\pannaloka\\src\\views\\stackwidgetmainmenu.js":[function(require,module,exports){
var React=require("react");
var Component=React.Component;

var stackwidgetaction=require("../actions/stackwidget");
var selectionaction=require("../actions/selection");

var StackWidgetMainMenu = React.createClass({displayName: "StackWidgetMainMenu",
	newWidget :function () {
		stackwidgetaction.newWidget({text:"widget"});
	}

  ,render : function() {
  	return React.createElement("span", null, 
  		React.createElement("button", {onClick: this.newWidget}, "New widget")
  	)
  }
});
module.exports=StackWidgetMainMenu;

},{"../actions/selection":"C:\\ksana2015\\pannaloka\\src\\actions\\selection.js","../actions/stackwidget":"C:\\ksana2015\\pannaloka\\src\\actions\\stackwidget.js","react":"react"}],"C:\\ksana2015\\pannaloka\\src\\views\\statusview.js":[function(require,module,exports){
var React=require("react");
var Component=React.Component;
var PureRender=require('react-addons-pure-render-mixin');

var selectionstore=require("../stores/selection");
var SelectionStatus=require("../components/selectionstatus");

var StatusView = React.createClass({displayName: "StatusView",
	getInitialState:function() {
		return {selections:{},cursorch:""};
	}

	,onData :function(selections,cursorch) {
		this.setState({selections,cursorch});
	}

	,componentDidMount :function() {
		this.unsubscribe = selectionstore.listen(this.onData);
	}

	,componentWillUnmount :function() {
		this.unsubscribe();
	}

	,render :function() {
		return React.createElement("div", null, 
			React.createElement(SelectionStatus, {selections: this.state.selections, cursorch: this.state.cursorch})
		)
	}
});
module.exports=StatusView;
},{"../components/selectionstatus":"C:\\ksana2015\\pannaloka\\src\\components\\selectionstatus.js","../stores/selection":"C:\\ksana2015\\pannaloka\\src\\stores\\selection.js","react":"react","react-addons-pure-render-mixin":"C:\\ksana2015\\node_modules\\react-addons-pure-render-mixin\\index.js"}],"C:\\ksana2015\\pannaloka\\src\\views\\treelist.js":[function(require,module,exports){
var React=require("react");
var Component=React.Component;
var PureRender=require('react-addons-pure-render-mixin');

var ktcfilestore=require("../stores/ktcfile");
var FileItem=require("../components/fileitem");

var ktcfileaction=require("../actions/ktcfile");
var NewFileButton =React.createClass({displayName: "NewFileButton",
	newfile : function(){
		ktcfileaction.newTree();
		setTimeout(function(){
			this.props.onOpenTree();
		}.bind(this),100);
		
	}

	,render :function() {
		return React.createElement("button", {onClick: this.newfile}, "Create New Tree")
	}
});

var TreeList = React.createClass({displayName: "TreeList",
	getInitialState:function(){
		return {files:[],selectedIndex:0};
	}

	, onData :function(files) {
		this.setState({files});
	}

	,componentDidMount :function() {
		this.unsubscribe = ktcfilestore.listen(this.onData);
	}

	,componentWillUnmount :function() {
		this.unsubscribe();
	}

	,opentree :function(e) {
		var file=this.state.files[this.state.selectedIndex];
		ktcfileaction.openTree(file.filename);
		this.props.onOpenTree && this.props.onOpenTree();
	}

	,renderItem :function(item,idx) {
		return React.createElement("div", {key: idx, "data-idx": idx}, 
			React.createElement(FileItem, React.__spread({onClick: this.opentree, selected: this.state.selectedIndex==idx},  item)))
	}

	,selectItem :function(e) {
		var target=e.target;
		while (target && !target.dataset.idx) {
			target=target.parentElement;
		}
		var selectedIndex=parseInt(target.dataset.idx);
		if (!isNaN(selectedIndex)) this.setState({selectedIndex});
	}

	,render :function() {
		return React.createElement("div", null, 
				React.createElement(NewFileButton, {onOpenTree: this.props.onOpenTree}), 
				React.createElement("div", {onClick: this.selectItem}, this.state.files.map(this.renderItem))
		)
	}
});

module.exports = TreeList ;
},{"../actions/ktcfile":"C:\\ksana2015\\pannaloka\\src\\actions\\ktcfile.js","../components/fileitem":"C:\\ksana2015\\pannaloka\\src\\components\\fileitem.js","../stores/ktcfile":"C:\\ksana2015\\pannaloka\\src\\stores\\ktcfile.js","react":"react","react-addons-pure-render-mixin":"C:\\ksana2015\\node_modules\\react-addons-pure-render-mixin\\index.js"}],"C:\\ksana2015\\pannaloka\\src\\views\\widgetclasses.js":[function(require,module,exports){
var DefaultTextView=require("../textview/defaulttextview");
var SimpleView=require("./simpleview");

module.exports = {
	TextWidget:DefaultTextView
	,SimpleWidget:SimpleView
}
},{"../textview/defaulttextview":"C:\\ksana2015\\pannaloka\\src\\textview\\defaulttextview.js","./simpleview":"C:\\ksana2015\\pannaloka\\src\\views\\simpleview.js"}]},{},["C:\\ksana2015\\pannaloka\\index.js"])
//# sourceMappingURL=bundle.js.map
