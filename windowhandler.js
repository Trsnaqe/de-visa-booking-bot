var dswh = dswh || {
  DEBUG_MODE: !1,
  TEMP_WINDOW_NAME: "tempWindowId",
  MANAGED_WINDOW_NAME_PREFIX: "ds-",
  windowId: null,
  clientWindowRenderMode: null,
  maxWindowIdLength: 10,
  cfg: null,
  init: function (a, c, b, d) {
    dswh.utils.log("------- DeltaSpike windowhandler.js -------");
    dswh.utils.log("--- #init('" + a + "', '" + c + "'," + b + "," + dswh.utils.stringify(d) + ")");
    dswh.utils.log("window.name: " + window.name);
    this.windowId = a;
    this.clientWindowRenderMode = c;
    this.maxWindowIdLength = b;
    this.cfg = d ? d : {};
    var e = this.strategy[c];
    if (e) {
      dswh.utils.log("--- #validate");
      e.validate();
      dswh.utils.log("--- #init(false)");
      e.init(!1);
      jsf.ajax.addOnEvent(function (a) {
        "success" === a.status && (dswh.utils.log("--- #init(true)"), e.init(!0));
      });
      if (window.$ && window.PrimeFaces)
        $(document).on("pfAjaxComplete", function () {
          dswh.utils.log("--- #init(true)");
          e.init(!0);
        });
      var f = window.onload;
      window.onload = function (a) {
        try {
          f ? f(a) : null;
        } finally {
          dswh.utils.log("--- #init(false)"), e.init(!1);
        }
      };
    }
  },
  strategy: {
    CLIENTWINDOW: {
      validate: function () {
        this.cleanupCookies();
        this.assertWindowId();
      },
      init: function (a) {
        this.overwriteLinkOnClickEvents();
        this.overwriteButtonOnClickEvents();
        dswh.utils.appendHiddenWindowIdToForms();
      },
      assertWindowId: function () {
        dswh.utils.log("--- #assertWindowId");
        (dswh.utils.isWindowNameDefined() && dswh.utils.isManagedWindowName()) ||
          (dswh.utils.log("window name not defined or unmanaged - request new windowId"), dswh.utils.requestNewWindowId());
      },
      overwriteLinkOnClickEvents: function () {
        var a = dswh.cfg.tokenizedRedirect,
          c = dswh.utils.isHtml5() && dswh.cfg.storeWindowTreeOnLinkClick;
        dswh.utils.log("--- #overwriteLinkOnClickEvents");
        dswh.utils.log("tokenizedRedirect: " + dswh.cfg.tokenizedRedirect);
        dswh.utils.log("storeWindowTreeOnLinkClick: " + dswh.cfg.storeWindowTreeOnLinkClick);
        if (a || c)
          for (var b = document.getElementsByTagName("a"), d = 0; d < b.length; d++) {
            var e = b[d],
              f = e.getAttribute("target");
            !0 !== dswh.strategy.CLIENTWINDOW.isHrefDefined(e) ||
              (f && "_self" !== f) ||
              (e.onclick
                ? ("" + e.onclick).match(".*storeWindowTree().*") ||
                  (function () {
                    var d = e.onclick;
                    e.onclick = function (b) {
                      b = b || window.event;
                      var e = d.bind(this)(b);
                      return ("undefined" !== typeof e && !0 !== e) ||
                        b.ctrlKey ||
                        (c && dswh.strategy.CLIENTWINDOW.storeWindowTree(), !a)
                        ? e
                        : (dswh.strategy.CLIENTWINDOW.tokenizedRedirect(this), !1);
                    };
                  })()
                : (e.onclick = function (b) {
                    b = b || window.event;
                    if (!b.ctrlKey)
                      return (
                        c && dswh.strategy.CLIENTWINDOW.storeWindowTree(),
                        a ? (dswh.strategy.CLIENTWINDOW.tokenizedRedirect(this), !1) : !0
                      );
                  }));
          }
      },
      overwriteButtonOnClickEvents: function () {
        var a = dswh.utils.isHtml5() && dswh.cfg.storeWindowTreeOnButtonClick;
        dswh.utils.log("--- #overwriteButtonOnClickEvents");
        dswh.utils.log("storeWindowTreeOnButtonClick: " + dswh.cfg.storeWindowTreeOnButtonClick);
        if (a)
          for (var a = document.getElementsByTagName("input"), c = 0; c < a.length; c++) {
            var b = a[c];
            if ("submit" === b.getAttribute("type") || "button" === b.getAttribute("type"))
              b.onclick
                ? ("" + b.onclick).match(".*storeWindowTree().*") ||
                  (function () {
                    var a = b.onclick;
                    b.onclick = function (b) {
                      b = b || window.event;
                      dswh.strategy.CLIENTWINDOW.storeWindowTree();
                      return a.bind(this)(b);
                    };
                  })()
                : (b.onclick = function () {
                    dswh.strategy.CLIENTWINDOW.storeWindowTree();
                    return !0;
                  });
          }
      },
      isHrefDefined: function (a) {
        a = a.getAttribute("href");
        if (!a || null === a) return !1;
        a = a.replace(/^\s+|\s+$/g, "");
        return "" === a || "#" === a || 0 === a.lastIndexOf("javascript:", 0) ? !1 : !0;
      },
      tokenizedRedirect: function (a) {
        dswh.utils.log("--- #tokenizedRedirect");
        var c = dswh.utils.generateNewRequestToken();
        dswh.utils.storeCookie("dsrwid-" + c, dswh.windowId, 3);
        window.location = dswh.utils.setUrlParam(a.href, "dsrid", c);
      },
      storeWindowTree: function () {
        dswh.utils.log("--- #storeWindowTree");
        for (var a = document.getElementsByTagName("head")[0].childNodes, c = [], b = 0, d = 0; d < a.length; d++) {
          var e = a[d].tagName;
          e &&
            dswh.utils.equalsIgnoreCase(e, "link") &&
            dswh.utils.equalsIgnoreCase(a[d].getAttribute("type"), "text/css") &&
            ((e = a[d].getAttribute("media")),
            !e || dswh.utils.equalsIgnoreCase(e, "all") || dswh.utils.equalsIgnoreCase(e, "screen")) &&
            (c[b++] = a[d].getAttribute("href"));
        }
        localStorage.setItem(window.name + "_css", dswh.utils.stringify(c));
        a = document.getElementsByTagName("body")[0];
        localStorage.setItem(window.name + "_body", a.innerHTML);
        c = {};
        for (d = 0; d < a.attributes.length; d++) (b = a.attributes[d]), (c[b.name] = b.value);
        localStorage.setItem(window.name + "_bodyAttributes", dswh.utils.stringify(c));
        localStorage.setItem(
          window.name + "_scrollTop",
          (window.pageYOffset || document.documentElement.scrollTop) - (document.documentElement.clientTop || 0)
        );
        localStorage.setItem(
          window.name + "_scrollLeft",
          (window.pageXOffset || document.documentElement.scrollLeft) - (document.documentElement.clientLeft || 0)
        );
      },
      cleanupCookies: function () {
        dswh.utils.log("--- #cleanupCookies");
        var a = dswh.utils.getUrlParameter(window.location.href, "dsrid");
        a && dswh.utils.expireCookie("dsrwid-" + a);
      },
    },
    LAZY: {
      validate: function () {
        this.cleanupCookies();
        this.assertWindowId();
      },
      init: function (a) {
        dswh.utils.appendHiddenWindowIdToForms();
      },
      assertWindowId: function () {
        var a = dswh.utils.getUrlParameter(window.location.href, "dswid");
        dswh.utils.log("--- #assertWindowId");
        dswh.utils.log("dswid: " + a);
        if (dswh.utils.isWindowNameDefined())
          if (dswh.utils.isManagedWindowName()) {
            var c = dswh.utils.getWindowIdFromWindowName();
            c === dswh.TEMP_WINDOW_NAME
              ? a
                ? (dswh.utils.log("assign window name from request parameter"), dswh.utils.setWindowIdAsWindowName(a))
                : (dswh.utils.log("assign window name from server windowId"), dswh.utils.setWindowIdAsWindowName(dswh.windowId))
              : c.length > dswh.maxWindowIdLength
              ? (dswh.utils.log("window id from window name exeeds maxWindowIdLength - request new windowId"),
                dswh.utils.requestNewWindowId())
              : c !== a &&
                (dswh.utils.log("reload url with window name"),
                (window.location = dswh.utils.setUrlParam(window.location.href, "dswid", c)));
          } else dswh.utils.log("window name is unmanaged - request new windowId"), dswh.utils.requestNewWindowId();
        else
          a
            ? dswh.cfg.initialRedirectWindowId && a === dswh.cfg.initialRedirectWindowId
              ? (dswh.utils.log("assign window name from initialRedirectWindowId"),
                dswh.utils.setWindowIdAsWindowName(dswh.cfg.initialRedirectWindowId))
              : (dswh.utils.log("request new windowId"), dswh.utils.requestNewWindowId())
            : dswh.windowId &&
              (dswh.utils.log("assign window name from server windowId"), dswh.utils.setWindowIdAsWindowName(dswh.windowId));
      },
      cleanupCookies: function () {
        dswh.utils.log("--- #cleanupCookies");
        var a = dswh.utils.getUrlParameter(window.location.href, "dswid");
        a && dswh.utils.expireCookie("dsrwid-" + a);
      },
    },
  },
  utils: {
    isWindowNameDefined: function () {
      return window.name && 0 < window.name.length;
    },
    isManagedWindowName: function () {
      return window.name ? 0 === window.name.indexOf(dswh.MANAGED_WINDOW_NAME_PREFIX) : !1;
    },
    getWindowIdFromWindowName: function () {
      return window.name.substring(dswh.MANAGED_WINDOW_NAME_PREFIX.length);
    },
    setWindowIdAsWindowName: function (a) {
      window.name = dswh.MANAGED_WINDOW_NAME_PREFIX + a;
    },
    requestNewWindowId: function () {
      dswh.utils.setWindowIdAsWindowName(dswh.TEMP_WINDOW_NAME);
      window.location = dswh.utils.setUrlParam(window.location.href, "dswid", null);
    },
    isHtml5: function () {
      try {
        return !!localStorage.getItem;
      } catch (a) {
        return !1;
      }
    },
    stringify: function (a) {
      return JSON ? JSON.stringify(a) : a.join("|||");
    },
    unstringify: function (a) {
      return JSON ? JSON.parse(a) : a.split("|||");
    },
    equalsIgnoreCase: function (a, c) {
      return a || c ? (a && c ? a.toLowerCase() === c.toLowerCase() : !1) : !0;
    },
    getUrlParameter: function (a, c) {
      var b = document.createElement("a");
      b.href = a;
      if ((b = b.search) && 0 < b.length)
        for (var b = b.substring(1).split("\x26"), d = 0; d < b.length; d++) {
          var e = b[d].split("\x3d");
          if (e[0] === c) return 1 < e.length ? decodeURIComponent(e[1]) : "";
        }
      return null;
    },
    setUrlParam: function (a, c, b) {
      var d = document.createElement("a");
      d.href = a;
      (b && 0 !== b.replace(/^\s+|\s+$/g, "").length) || (b = "");
      if (0 === b.length && (0 === d.search.length || -1 === d.search.indexOf(c + "\x3d"))) return d.href;
      if (0 === d.search.length) return (d.search = "?" + encodeURIComponent(c) + "\x3d" + encodeURIComponent(b)), d.href;
      a = d.search.substring(1).split("\x26");
      var e = [];
      e.push(c + "\x3d" + encodeURIComponent(b));
      for (b = 0; b < a.length; b++) {
        var f = a[b];
        if (0 < f.length) {
          var g = f.split("\x3d")[0];
          (f = f.split("\x3d")[1]) && 0 < f.replace(/^\s+|\s+$/g, "").length && g !== c && e.push(g + "\x3d" + f);
        }
      }
      d.search = "?" + e.join("\x26");
      return d.href;
    },
    appendHiddenWindowIdToForms: function () {
      for (var a = document.getElementsByTagName("form"), c = 0; c < a.length; c++) {
        var b = a[c],
          d = b.elements.dspwid;
        d ||
          ((d = document.createElement("INPUT")),
          d.setAttribute("name", "dspwid"),
          d.setAttribute("type", "hidden"),
          b.appendChild(d));
        d.setAttribute("value", dswh.windowId);
      }
    },
    expireCookie: function (a) {
      var c = new Date();
      c.setTime(c.getTime() - 864e6);
      c = ";max-age\x3d0;expires\x3d" + c.toGMTString();
      document.cookie = a + "\x3d" + c + "; path\x3d/";
    },
    generateNewRequestToken: function () {
      return "" + Math.floor(999 * Math.random());
    },
    generateNewWindowId: function () {
      return "" + Math.floor(8999 * Math.random() + 1e3);
    },
    storeCookie: function (a, c, b) {
      var d = new Date();
      d.setTime(d.getTime() + 1e3 * b);
      b = "; expires\x3d" + d.toGMTString();
      document.cookie = a + "\x3d" + c + b + "; path\x3d/";
    },
    log: function (a) {
      !0 === dswh.DEBUG_MODE && console.log(a);
    },
  },
};
Function.prototype.bind ||
  (Function.prototype.bind = function (a) {
    if ("function" !== typeof this) throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    var c = Array.prototype.slice.call(arguments, 1),
      b = this,
      d = function () {},
      e = function () {
        return b.apply(this instanceof d && a ? this : a, c.concat(Array.prototype.slice.call(arguments)));
      };
    d.prototype = this.prototype;
    e.prototype = new d();
    return e;
  });

module.exports = dswh;
