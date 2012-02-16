var getStyle, mQuery, toCamelCase;

mQuery = (function() {
  var addClass, append, css, hasClass, html, removeClass, toggleClass;

  function mQuery(obj) {
    var type;
    if (obj === window) return new mQuery(obj);
    type = typeof obj;
    if (type === "string") {
      this.el = document.getElementById(obj);
    } else if (type === "object" && obj.nodeType !== "undefined" && obj.nodeType === 1) {
      this.el = obj;
    } else {
      throw new Error("Invalid Argument");
    }
  }

  mQuery.prototype.addEvent = function(evt, fn) {
    mQuery.addEvent(this.el, evt, fn);
    return this;
  };

  mQuery.prototype.removeEvent = function(evt, fn) {
    mQuery.removeEvent(this.el, evt, fn);
    return this;
  };

  mQuery.prototype.click = function(fn) {
    var that;
    that = this;
    mQuery.addEvent(this.el, "click", function(e) {
      return fn.call(that, e);
    });
    return this;
  };

  mQuery.prototype.mouseout = function(fn) {
    var that;
    that = this;
    mQuery.addEvent(this.el, "mouseout", function(e) {
      return fn.call(that, e);
    });
    return this;
  };

  mQuery.prototype.mouseover = function(fn) {
    var that;
    that = this;
    mQuery.addEvent(this.el, "mouseover", function(e) {
      return fn.call(that, e);
    });
    return this;
  };

  css = function(css, value) {
    return mQuery.css(this.el, css, value) || this;
  };

  addClass = function(value) {
    mQuery.addClass(this.el, value);
    return this;
  };

  removeClass = function(value) {
    mQuery.removeClass(this.el, value);
    return this;
  };

  toggleClass = function(value) {
    mQuery.toggleClass(this.el, value);
    return this;
  };

  hasClass = function(value) {
    return mQuery.hasClass(this.el, value);
  };

  append = function(data) {
    var html;
    if (typeof data.nodeType !== "undefined" && data.nodeType === 1) {
      this.el.appendChild(data);
    } else if (data instanceof mQuery) {
      this.el.appendChild(data.el);
    } else if (typeof data === "string") {
      html = this.el.innerHTML;
      this.el.innerHTML = html + data;
    }
    return this;
  };

  html = function(html) {
    if (typeof html !== "undefined") {
      this.el.innerHTML = html;
      return this;
    } else {
      return this.el.innerHTML;
    }
  };

  if (typeof addEventListener !== "undefined") {
    mQuery.addEvent = function(obj, evt, fn) {
      return obj.addEventListener(evt, fn, false);
    };
    mQuery.removeEvent = function(obj, evt, fn) {
      return obj.removeEventListener(evt, fn, false);
    };
  } else if (typeof attachEvent !== "undefined") {
    mQuery.addEvent = function(obj, evt, fn) {
      var fnHash;
      fnHash = "e_" + evt + fn;
      obj[fnHash] = function() {
        var relatedTarget, type;
        type = event.type;
        relatedTarget = null;
        if (type === "mouseover" || type === "mouseout") {
          relatedTarget = (type === "mouseover" ? event.fromElement : event.toElement);
        }
        return fn.call(obj, {
          target: event.srcElement,
          type: type,
          relatedTarget: relatedTarget,
          _event: event,
          preventDefault: function() {
            return this._event.returnValue = false;
          },
          stopPropagation: function() {
            return this._event.cancelBubble = true;
          }
        });
      };
      return obj.attachEvent("on" + evt, obj[fnHash]);
    };
    mQuery.removeEvent = function(obj, evt, fn) {
      var fnHash;
      fnHash = "e_" + evt + fn;
      if (typeof obj[fnHash] !== "undefined") {
        obj.detachEvent("on" + evt, obj[fnHash]);
        return delete obj[fnHash];
      }
    };
  } else {
    mQuery.addEvent = function(obj, evt, fn) {
      return obj["on" + evt] = fn;
    };
    mQuery.removeEvent = function(obj, evt, fn) {
      return obj["on" + evt] = null;
    };
  }

  mQuery.css = function(el, css, value) {
    var cssType, elStyle, prop, valueType, _results;
    cssType = typeof css;
    valueType = typeof value;
    elStyle = el.style;
    if (cssType !== "undefined" && valueType === "undefined") {
      if (cssType === "object") {
        _results = [];
        for (prop in css) {
          if (css.hasOwnProperty(prop)) {
            _results.push(elStyle[toCamelCase(prop)] = css[prop]);
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      } else if (cssType === "string") {
        return getStyle(el, css);
      } else {
        throw {
          message: "Invalid parameter passed to css()"
        };
      }
    } else if (cssType === "string" && valueType === "string") {
      return elStyle[toCamelCase(css)] = value;
    } else {
      throw {
        message: "Invalid parameters passed to css()"
      };
    }
  };

  mQuery.hasClass = function(el, value) {
    return (" " + el.className + " ").indexOf(" " + value + " ") > -1;
  };

  mQuery.addClass = function(el, value) {
    var className, classNames, i, l;
    className = el.className;
    if (!className) {
      return el.className = value;
    } else {
      classNames = value.split(/\s+/);
      l = classNames.length;
      i = 0;
      while (i < l) {
        if (!this.hasClass(el, classNames[i])) className += " " + classNames[i];
        i++;
      }
      return el.className = className.trim();
    }
  };

  mQuery.removeClass = function(el, value) {
    var className, classNames, i, l;
    if (value) {
      classNames = value.split(/\s+/);
      className = " " + el.className + " ";
      l = classNames.length;
      i = 0;
      while (i < l) {
        className = className.replace(" " + classNames[i] + " ", " ");
        i++;
      }
      return el.className = className.trim();
    } else {
      return el.className = "";
    }
  };

  mQuery.toggleClass = function(el, value) {
    var className, classNames, i, _results;
    classNames = value.split(/\s+/);
    i = 0;
    className = void 0;
    _results = [];
    while (className = classNames[i++]) {
      _results.push(this[(this.hasClass(el, className) ? "removeClass" : "addClass")](el, className));
    }
    return _results;
  };

  mQuery.createElement = function(obj) {
    var attr, child, el, i, prop;
    if (!obj || !obj.tagName) {
      throw {
        message: "Invalid argument"
      };
    }
    el = document.createElement(obj.tagName);
    obj.id && (el.id = obj.id);
    obj.className && (el.className = obj.className);
    obj.html && (el.innerHTML = obj.html);
    if (typeof obj.attributes !== "undefined") {
      attr = obj.attributes;
      prop = void 0;
      for (prop in attr) {
        if (attr.hasOwnProperty(prop)) el.setAttribute(prop, attr[prop]);
      }
    }
    if (typeof obj.children !== "undefined") {
      child = void 0;
      i = 0;
      while (child = obj.children[i++]) {
        el.appendChild(this.createElement(child));
      }
    }
    return el;
  };

  return mQuery;

})();

toCamelCase = function(str) {
  return str.replace(/-([a-z])/g, function(all, letter) {
    return letter.toUpperCase();
  });
};

getStyle = (function() {
  if (typeof getComputedStyle !== "undefined") {
    return function(el, cssProp) {
      return window.getComputedStyle(el, null).getPropertyValue(cssProp);
    };
  } else {
    return function(el, cssProp) {
      return el.currentStyle[toCamelCase(cssProp)];
    };
  }
})();

if (typeof String.prototype.trim === "undefined") {
  String.prototype.trim = function() {
    return this.replace(/^\s+/, "").replace(/\s+$/, "");
  };
}