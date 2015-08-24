/* */ 
(function(process) {
  'use strict';
  var dom_adapter_1 = require("../../../dom/dom_adapter");
  var collection_1 = require("../../../facade/collection");
  var lang_1 = require("../../../facade/lang");
  var ShadowCss = (function() {
    function ShadowCss() {
      this.strictStyling = true;
    }
    ShadowCss.prototype.shimStyle = function(style, selector, hostSelector) {
      if (hostSelector === void 0) {
        hostSelector = '';
      }
      var cssText = dom_adapter_1.DOM.getText(style);
      return this.shimCssText(cssText, selector, hostSelector);
    };
    ShadowCss.prototype.shimCssText = function(cssText, selector, hostSelector) {
      if (hostSelector === void 0) {
        hostSelector = '';
      }
      cssText = this._insertDirectives(cssText);
      return this._scopeCssText(cssText, selector, hostSelector);
    };
    ShadowCss.prototype._insertDirectives = function(cssText) {
      cssText = this._insertPolyfillDirectivesInCssText(cssText);
      return this._insertPolyfillRulesInCssText(cssText);
    };
    ShadowCss.prototype._insertPolyfillDirectivesInCssText = function(cssText) {
      return lang_1.StringWrapper.replaceAllMapped(cssText, _cssContentNextSelectorRe, function(m) {
        return m[1] + '{';
      });
    };
    ShadowCss.prototype._insertPolyfillRulesInCssText = function(cssText) {
      return lang_1.StringWrapper.replaceAllMapped(cssText, _cssContentRuleRe, function(m) {
        var rule = m[0];
        rule = lang_1.StringWrapper.replace(rule, m[1], '');
        rule = lang_1.StringWrapper.replace(rule, m[2], '');
        return m[3] + rule;
      });
    };
    ShadowCss.prototype._scopeCssText = function(cssText, scopeSelector, hostSelector) {
      var _this = this;
      var unscoped = this._extractUnscopedRulesFromCssText(cssText);
      cssText = this._insertPolyfillHostInCssText(cssText);
      cssText = this._convertColonHost(cssText);
      cssText = this._convertColonHostContext(cssText);
      cssText = this._convertShadowDOMSelectors(cssText);
      if (lang_1.isPresent(scopeSelector)) {
        _withCssRules(cssText, function(rules) {
          cssText = _this._scopeRules(rules, scopeSelector, hostSelector);
        });
      }
      cssText = cssText + '\n' + unscoped;
      return cssText.trim();
    };
    ShadowCss.prototype._extractUnscopedRulesFromCssText = function(cssText) {
      var r = '',
          m;
      var matcher = lang_1.RegExpWrapper.matcher(_cssContentUnscopedRuleRe, cssText);
      while (lang_1.isPresent(m = lang_1.RegExpMatcherWrapper.next(matcher))) {
        var rule = m[0];
        rule = lang_1.StringWrapper.replace(rule, m[2], '');
        rule = lang_1.StringWrapper.replace(rule, m[1], m[3]);
        r += rule + '\n\n';
      }
      return r;
    };
    ShadowCss.prototype._convertColonHost = function(cssText) {
      return this._convertColonRule(cssText, _cssColonHostRe, this._colonHostPartReplacer);
    };
    ShadowCss.prototype._convertColonHostContext = function(cssText) {
      return this._convertColonRule(cssText, _cssColonHostContextRe, this._colonHostContextPartReplacer);
    };
    ShadowCss.prototype._convertColonRule = function(cssText, regExp, partReplacer) {
      return lang_1.StringWrapper.replaceAllMapped(cssText, regExp, function(m) {
        if (lang_1.isPresent(m[2])) {
          var parts = m[2].split(','),
              r = [];
          for (var i = 0; i < parts.length; i++) {
            var p = parts[i];
            if (lang_1.isBlank(p))
              break;
            p = p.trim();
            r.push(partReplacer(_polyfillHostNoCombinator, p, m[3]));
          }
          return r.join(',');
        } else {
          return _polyfillHostNoCombinator + m[3];
        }
      });
    };
    ShadowCss.prototype._colonHostContextPartReplacer = function(host, part, suffix) {
      if (lang_1.StringWrapper.contains(part, _polyfillHost)) {
        return this._colonHostPartReplacer(host, part, suffix);
      } else {
        return host + part + suffix + ', ' + part + ' ' + host + suffix;
      }
    };
    ShadowCss.prototype._colonHostPartReplacer = function(host, part, suffix) {
      return host + lang_1.StringWrapper.replace(part, _polyfillHost, '') + suffix;
    };
    ShadowCss.prototype._convertShadowDOMSelectors = function(cssText) {
      for (var i = 0; i < _shadowDOMSelectorsRe.length; i++) {
        cssText = lang_1.StringWrapper.replaceAll(cssText, _shadowDOMSelectorsRe[i], ' ');
      }
      return cssText;
    };
    ShadowCss.prototype._scopeRules = function(cssRules, scopeSelector, hostSelector) {
      var cssText = '';
      if (lang_1.isPresent(cssRules)) {
        for (var i = 0; i < cssRules.length; i++) {
          var rule = cssRules[i];
          if (dom_adapter_1.DOM.isStyleRule(rule) || dom_adapter_1.DOM.isPageRule(rule)) {
            cssText += this._scopeSelector(rule.selectorText, scopeSelector, hostSelector, this.strictStyling) + ' {\n';
            cssText += this._propertiesFromRule(rule) + '\n}\n\n';
          } else if (dom_adapter_1.DOM.isMediaRule(rule)) {
            cssText += '@media ' + rule.media.mediaText + ' {\n';
            cssText += this._scopeRules(rule.cssRules, scopeSelector, hostSelector);
            cssText += '\n}\n\n';
          } else {
            try {
              if (lang_1.isPresent(rule.cssText)) {
                cssText += rule.cssText + '\n\n';
              }
            } catch (x) {
              if (dom_adapter_1.DOM.isKeyframesRule(rule) && lang_1.isPresent(rule.cssRules)) {
                cssText += this._ieSafeCssTextFromKeyFrameRule(rule);
              }
            }
          }
        }
      }
      return cssText;
    };
    ShadowCss.prototype._ieSafeCssTextFromKeyFrameRule = function(rule) {
      var cssText = '@keyframes ' + rule.name + ' {';
      for (var i = 0; i < rule.cssRules.length; i++) {
        var r = rule.cssRules[i];
        cssText += ' ' + r.keyText + ' {' + r.style.cssText + '}';
      }
      cssText += ' }';
      return cssText;
    };
    ShadowCss.prototype._scopeSelector = function(selector, scopeSelector, hostSelector, strict) {
      var r = [],
          parts = selector.split(',');
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p = p.trim();
        if (this._selectorNeedsScoping(p, scopeSelector)) {
          p = strict && !lang_1.StringWrapper.contains(p, _polyfillHostNoCombinator) ? this._applyStrictSelectorScope(p, scopeSelector) : this._applySelectorScope(p, scopeSelector, hostSelector);
        }
        r.push(p);
      }
      return r.join(', ');
    };
    ShadowCss.prototype._selectorNeedsScoping = function(selector, scopeSelector) {
      var re = this._makeScopeMatcher(scopeSelector);
      return !lang_1.isPresent(lang_1.RegExpWrapper.firstMatch(re, selector));
    };
    ShadowCss.prototype._makeScopeMatcher = function(scopeSelector) {
      var lre = /\[/g;
      var rre = /\]/g;
      scopeSelector = lang_1.StringWrapper.replaceAll(scopeSelector, lre, '\\[');
      scopeSelector = lang_1.StringWrapper.replaceAll(scopeSelector, rre, '\\]');
      return lang_1.RegExpWrapper.create('^(' + scopeSelector + ')' + _selectorReSuffix, 'm');
    };
    ShadowCss.prototype._applySelectorScope = function(selector, scopeSelector, hostSelector) {
      return this._applySimpleSelectorScope(selector, scopeSelector, hostSelector);
    };
    ShadowCss.prototype._applySimpleSelectorScope = function(selector, scopeSelector, hostSelector) {
      if (lang_1.isPresent(lang_1.RegExpWrapper.firstMatch(_polyfillHostRe, selector))) {
        var replaceBy = this.strictStyling ? "[" + hostSelector + "]" : scopeSelector;
        selector = lang_1.StringWrapper.replace(selector, _polyfillHostNoCombinator, replaceBy);
        return lang_1.StringWrapper.replaceAll(selector, _polyfillHostRe, replaceBy + ' ');
      } else {
        return scopeSelector + ' ' + selector;
      }
    };
    ShadowCss.prototype._applyStrictSelectorScope = function(selector, scopeSelector) {
      var isRe = /\[is=([^\]]*)\]/g;
      scopeSelector = lang_1.StringWrapper.replaceAllMapped(scopeSelector, isRe, function(m) {
        return m[1];
      });
      var splits = [' ', '>', '+', '~'],
          scoped = selector,
          attrName = '[' + scopeSelector + ']';
      for (var i = 0; i < splits.length; i++) {
        var sep = splits[i];
        var parts = scoped.split(sep);
        scoped = collection_1.ListWrapper.map(parts, function(p) {
          var t = lang_1.StringWrapper.replaceAll(p.trim(), _polyfillHostRe, '');
          if (t.length > 0 && !collection_1.ListWrapper.contains(splits, t) && !lang_1.StringWrapper.contains(t, attrName)) {
            var re = /([^:]*)(:*)(.*)/g;
            var m = lang_1.RegExpWrapper.firstMatch(re, t);
            if (lang_1.isPresent(m)) {
              p = m[1] + attrName + m[2] + m[3];
            }
          }
          return p;
        }).join(sep);
      }
      return scoped;
    };
    ShadowCss.prototype._insertPolyfillHostInCssText = function(selector) {
      selector = lang_1.StringWrapper.replaceAll(selector, _colonHostContextRe, _polyfillHostContext);
      selector = lang_1.StringWrapper.replaceAll(selector, _colonHostRe, _polyfillHost);
      return selector;
    };
    ShadowCss.prototype._propertiesFromRule = function(rule) {
      var cssText = rule.style.cssText;
      var attrRe = /['"]+|attr/g;
      if (rule.style.content.length > 0 && !lang_1.isPresent(lang_1.RegExpWrapper.firstMatch(attrRe, rule.style.content))) {
        var contentRe = /content:[^;]*;/g;
        cssText = lang_1.StringWrapper.replaceAll(cssText, contentRe, 'content: \'' + rule.style.content + '\';');
      }
      return cssText;
    };
    return ShadowCss;
  })();
  exports.ShadowCss = ShadowCss;
  var _cssContentNextSelectorRe = /polyfill-next-selector[^}]*content:[\s]*?['"](.*?)['"][;\s]*}([^{]*?){/gim;
  var _cssContentRuleRe = /(polyfill-rule)[^}]*(content:[\s]*['"](.*?)['"])[;\s]*[^}]*}/gim;
  var _cssContentUnscopedRuleRe = /(polyfill-unscoped-rule)[^}]*(content:[\s]*['"](.*?)['"])[;\s]*[^}]*}/gim;
  var _polyfillHost = '-shadowcsshost';
  var _polyfillHostContext = '-shadowcsscontext';
  var _parenSuffix = ')(?:\\((' + '(?:\\([^)(]*\\)|[^)(]*)+?' + ')\\))?([^,{]*)';
  var _cssColonHostRe = lang_1.RegExpWrapper.create('(' + _polyfillHost + _parenSuffix, 'im');
  var _cssColonHostContextRe = lang_1.RegExpWrapper.create('(' + _polyfillHostContext + _parenSuffix, 'im');
  var _polyfillHostNoCombinator = _polyfillHost + '-no-combinator';
  var _shadowDOMSelectorsRe = [/>>>/g, /::shadow/g, /::content/g, /\/deep\//g, /\/shadow-deep\//g, /\/shadow\//g];
  var _selectorReSuffix = '([>\\s~+\[.,{:][\\s\\S]*)?$';
  var _polyfillHostRe = lang_1.RegExpWrapper.create(_polyfillHost, 'im');
  var _colonHostRe = /:host/gim;
  var _colonHostContextRe = /:host-context/gim;
  function _cssToRules(cssText) {
    return dom_adapter_1.DOM.cssToRules(cssText);
  }
  function _withCssRules(cssText, callback) {
    if (lang_1.isBlank(callback))
      return;
    var rules = _cssToRules(cssText);
    callback(rules);
  }
})(require("process"));
