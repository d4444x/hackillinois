/**
 * Dwolla Payment Button Helper Script
 *
 * @version 3.0.2
 * @author Michael Schonfeld <michael@dwolla.com>
 * @url https://developers.dwolla.com
 */

(function (window) {
    window.DOMReady = (function () {
        // Private vars
        var fns = [],
    isReady = false,
    errorHandler = null,
    run = function (fn, args) {
        try {
            // call function
            fn.apply(this, args || []);
        } catch (err) {
            // error occured while executing function
            if (errorHandler)
        errorHandler.call(this, err);
        }
    },
    ready = function () {
        isReady = true;

        // call all registered functions
        for (var x = 0; x < fns.length; x++)
        run(fns[x].fn, fns[x].args || []);

        // clear handlers
        fns = [];
    };

    /**
     * Set error handler
     * @static
     * @param {Function} fn
     * @return {DOMReady} For chaining
     */
    this.setOnError = function (fn) {
        errorHandler = fn;

        // return this for chaining
        return this;
    };

    /**
     * Add code or function to execute when the DOM is ready
     * @static
     * @param {Function} fn
     * @param {Array} args Arguments will be passed on when calling function
     * @return {DOMReady} For chaining
     */
    this.add = function (fn, args) {
        // call imediately when DOM is already ready
        if (isReady) {
            run(fn, args);
        } else {
            // add to the list
            fns[fns.length] = {
                fn: fn,
                args: args
            };
        }

        // return this for chaining
        return this;
    };

    // for all browsers except IE
    if (window.addEventListener) {
        window.document.addEventListener('DOMContentLoaded', function () { ready(); }, false);
    } else {
        // for IE
        // code taken from http://ajaxian.com/archives/iecontentloaded-yet-another-domcontentloaded
        (function () {
            // check IE's proprietary DOM members
            if (!window.document.uniqueID && window.document.expando)
            return;

        // you can create any tagName, even customTag like <document :ready />
        var tempNode = window.document.createElement('document:ready');

        try {
            // see if it throws errors until after ondocumentready
            tempNode.doScroll('left');

            // call ready
            ready();
        } catch (err) {
            setTimeout(arguments.callee, 0);
        }
        })();
    }

    return this;
    })();
})(window);

// IE7 Fixes. Jesus christ.
if (!window.Element) {
    Element = function () { }

    var __createElement = document.createElement;
    document.createElement = function (tagName) {
        var element = __createElement(tagName);
        for (var key in Element.prototype)
            element[key] = Element.prototype[key];
        return element;
    }

    var __getElementById = document.getElementById
        document.getElementById = function (id) {
            var element = __getElementById(id);
            for (var key in Element.prototype)
                element[key] = Element.prototype[key];
            return element;
        }
}


// X-Browser AddEventListener
var addEvent = (function () {
    var setListener = function (el, ev, fn) {
        if (el.addEventListener) {
            setListener = function (el, ev, fn) {
                el.addEventListener(ev, fn, false);
            };
        } else if (el.attachEvent) {
            setListener = function (el, ev, fn) {
                el.attachEvent('on' + ev, fn);
            };
        } else {
            setListener = function (el, ev, fn) {
                el['on' + ev] = fn;
            };
        }
        setListener(el, ev, fn);
    };

    return function (el, ev, fn) {
        setListener(el, ev, fn);
    };
} ());

// Universal getElementsByClassName
getElsByClass = function (cls) {
    var el, reg, _i, _len, _ref, _results;
    if (typeof document.getElementsByClassName === 'function') {
        return document.getElementsByClassName(cls);
    } else if (typeof document.querySelectorAll === 'function') {
        return document.querySelectorAll("." + cls);
    } else {
        reg = new RegExp("(^|\\s)" + cls + "(\\s|$)");
        _ref = document.getElementsByTagName('*');
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            el = _ref[_i];
            if (reg.test(el.className)) {
                _results.push(el);
            }
        }
        return _results;
    }
};

var DwollaBtn = DwollaBtn || (function () {
    var _args = {
        cssURI: 'https://uat.dwolla.com/content/button.min.css' // This should point to where the css file lives
    , dwollaPayAction: 'https://uat.dwolla.com/payment/pay' // This should point to Dwolla's Payment endpoint
    , dwollaMisconfiguredPage: 'https://developers.dwolla.com/button' // This should point to Dwolla's general button misconfigured page
    };

    return {
        _skip: function (el) {
            if (el.nextSibling && el.nextSibling.className && el.nextSibling.className.indexOf('d-btn') !== -1) { return true; }

            return false;
        },

    _createButton: function (btn_script, classes, label) {
        if (label == null) { label = false; }

        // Create button element's <a/> tag
        var btn = document.createElement('a');

        // Add the label
        var btnText = document.createElement('span');
        btnText.setAttribute('class', 'd-btn-text');
        btnText.appendChild(document.createTextNode(label || btn_script.getAttribute('data-label')));
        btn.appendChild(btnText);

        // Add the arrow icon
        var btnIcon = document.createElement('span');
        btnIcon.setAttribute('class', 'd-btn-icon');
        btn.appendChild(btnIcon);

        // Add the d-btn class, and
        // any additional specified classes
        btn.setAttribute('class', 'd-btn ' + classes);

        // Add attributes
        btn.setAttribute('href', _args.dwollaMisconfiguredPage);
        for (var j = 0; j < btn_script.attributes.length; j++) {
            if (btn_script.attributes[j].nodeName.substr(0, 5) == 'data-') {
                btn.setAttribute(btn_script.attributes[j].nodeName, btn_script.attributes[j].nodeValue);
            }
        }

        return btn;
    },

    _parse: function (text) {
        // macbook:::1000|||pc:123
        var options = [];

        var blocks = text.split('|||');
        for (var b = 0; b < blocks.length; b++) {
            var parts = blocks[b].split(':::')
                , pair = {}
            ;

            pair['name'] = parts[0];
            pair['price'] = parts[1];
            if (pair['name'] && pair['price']) {
                options.push(pair);
            }
        }

        return options;
    },

    init: function () {
        // Append CSS
        this.appendCSS();

        // Create markup for v2 buttons (<script/> buttons)
        this.createMarkup();

        // Bind buttons
        this.registerButtons();

        // Handle gateway response
        this.handleResponse();

        // All done
        return true;
    },
    appendCSS: function () {
        // Don't add twice...
        if (document.getElementById('dwolla-button-stylesheet')) {
            return false;
        }

        // Create the button <link> tag
        var cssFile = document.createElement('link');
        cssFile.setAttribute('rel', 'stylesheet');
        cssFile.setAttribute('type', 'text/css');
        cssFile.setAttribute('href', _args.cssURI);
        cssFile.setAttribute('id', 'dwolla-button-stylesheet');

        // Append the tag to the <head>
        document.getElementsByTagName('head')[0].appendChild(cssFile);
    },
    createMarkup: function () {
        // Iterate thru every dwolla button on the page
        var els = getElsByClass('dwolla_button');

        for (var i = 0; i < els.length; i++) {
            var btn_script = els[i]
                , type = btn_script.getAttribute('data-type')
                ;

            if (!type || typeof type == 'undefined') {
                // Skip if already created
                if (btn_script.className.indexOf('d-btn') !== -1) { return; }

                // Some legacy suppport...
                btn_script.setAttribute('data-redirect', btn_script.getAttribute('href'));
                btn_script.setAttribute('data-description', btn_script.getAttribute('data-desc'));

                // Create a button element (<a/>)
                var btn = this._createButton(btn_script, 'd-btn-legacy', btn_script.firstChild.nodeValue);

                // Add to DOM as a replacement
                // to the original <a/> tag
                btn_script.parentNode.replaceChild(btn, btn_script);
            }
            else if (type == 'simple') {
                // Skip if already created
                if (this._skip(btn_script)) { return; }

                // Create a button element (<a/>)
                var btn = this._createButton(btn_script, 'd-btn-simple');

                // Add to DOM right after the
                // <script/> tag
                btn_script.parentNode.insertBefore(btn, btn_script.nextSibling);
            }
            else if (type == 'freetype') {
                // Skip if already created
                if (this._skip(btn_script)) { return; }

                // Create a button element (<a/>)
                var btn = this._createButton(btn_script, 'd-btn-freetype');

                // Add the input box
                var btnInput = document.createElement('input');
                btnInput.setAttribute('type', 'text');
                btnInput.setAttribute('onClick', 'this.select();');
                addEvent(btnInput, 'keyup', function (k) {
                    // Submit on enter
                    if (k.keyCode == 13) {
                        DwollaBtn.submitButton(this.parentNode);
                    }
                });
                btnInput.value = btn_script.getAttribute('data-amount');
                btn.appendChild(btnInput);

                // Add to DOM right after the
                // <script/> tag
                btn_script.parentNode.insertBefore(btn, btn_script.nextSibling);
            }
            else if (type == 'options') {
                // Skip if already created
                if (this._skip(btn_script)) { return; }

                // Create a button element (<a/>)
                var btn = this._createButton(btn_script, 'd-btn-options');

                // Add the select box
                var btnSelect = document.createElement('select');
                var options = this._parse(btn_script.getAttribute('data-options'));

                var defaultOption = document.createElement('option');
                defaultOption.setAttribute('disabled', 'disabled');
                defaultOption.setAttribute('selected', 'selected');
                defaultOption.innerHTML = 'Choose...';
                btnSelect.appendChild(defaultOption);

                for (var o = 0; o < options.length; o++) {
                    var option = document.createElement('option');
                    option.value = options[o]['price'] + ':' + options[o]['name'];
                    option.innerHTML = options[o]['name'] + ' ($' + options[o]['price'] + ')';

                            btnSelect.appendChild(option);
                            }
                            btn.appendChild(btnSelect);

                            // Submit on option selection
                            addEvent(btnSelect, 'change', function (k) {
                                // Change the amount and name dynamically
                                var amount = this.value.substr(0, this.value.indexOf(':'))
                                , name = this.value.substr(this.value.indexOf(':') + 1)
                                ;

                            this.parentNode.setAttribute('data-amount', amount.replace('$', ''));
                            this.parentNode.setAttribute('data-name', name);

                            // Submit on selection
                            DwollaBtn.submitButton(this.parentNode);
                            });

                            // Remove the default amount and name
                            btn.setAttribute('data-amount', '');
                            btn.setAttribute('data-name', '');

                            // Add to DOM right after the
                            // <script/> tag
                            btn_script.parentNode.insertBefore(btn, btn_script.nextSibling);
            }
        }
    },
    registerButtons: function () {
        if (window.DwollaClickEvent != null) { return false; }

        // Helper function to determine whether
        // a dwolla button was clicked
        var isDBtn = function (el, parent_el) {
            var check = function (e) { return (e.className.indexOf('d-btn') !== -1) && e.nodeName == "A" }

            if (check(el)) {
                return el;
            } else if (check(parent_el)) {
                return parent_el;
            }

            return false;
        };

        // Mimic jQuery's .live method
        var clickFn = function (e) {
            // Check both the clicked element
            // and its parent, since we have a 1-level
            // nested button
            var click_el = (e.target || e.srcElement)
                , parent_el = click_el.parentNode
                , el
                ;

            if (el = isDBtn(click_el, parent_el)) {
                // Avoid any unwanted actions from the
                // button element
                (e.preventDefault) ? e.preventDefault() : e.returnValue = false;

                // Don't submit on freetype's
                // input click
                if (click_el.nodeName == 'INPUT' || click_el.nodeName == 'SELECT' || click_el.nodeName == 'OPTION') {
                    return false;
                }

                DwollaBtn.submitButton(el);

                // Don't continue to the href
                return false;
            }
        };

        addEvent(document, 'click', clickFn);
        window.DwollaClickEvent = true;
    },

    handleResponse: function () {
        if (window.DwollaResponseEvent != null) { return false; }

        var getParameterByName = function (name) {
            var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
            return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
        };

        if (getParameterByName('error') == 'failure' && getParameterByName('error_description')) {
            DwollaBtn.onFailure(getParameterByName('error_description'));
        }

        window.DwollaResponseEvent = true;

        return true;
    },

    submitButton: function (el) {
        // Is this a valid <a/> tag?
        if (!el || el.nodeName != 'A') {
            return false;
        }

        // Do we need to update the amount before
        // submitting the form?
        if (el.getAttribute('data-type') == 'freetype') {
            var amount = el.getElementsByTagName('INPUT')[0].value;
            el.setAttribute('data-amount', amount.replace('$', ''));
        }

        // Make sure we have all the needed params
        if (!el.getAttribute('data-amount')) {
            return false;
        }

        // Create a dynamic form
        var form = document.createElement('form');

        // Config the form
        form.setAttribute('method', 'POST');
        form.setAttribute('action', _args.dwollaPayAction);

        // Create and append inputs
        var inputs = {
            destinationId: null
                , amount: el.getAttribute('data-amount')
                , shipping: el.getAttribute('data-shipping')
                , tax: el.getAttribute('data-tax')
                , name: el.getAttribute('data-name')
                , description: el.getAttribute('data-description')
                , redirect: el.getAttribute('data-redirect')
                , key: el.getAttribute('data-key')
                , orderId: el.getAttribute('data-orderid')
                , facilitatorAmount: el.getAttribute('data-facilitator-fee')
                , notes: el.getAttribute('data-notes')
                , test: el.getAttribute('data-test')
                , allowFundingSources: el.getAttribute('data-guest-checkout')
                , callback: el.getAttribute('data-callback')
        };
        for (key in inputs) {
            if (inputs[key] != null) {
                var input = document.createElement("input");

                input.setAttribute('type', 'hidden');
                input.setAttribute('name', key);
                input.setAttribute('value', inputs[key]);

                form.appendChild(input);
            }
        }

        // Put the form in the body and submit
        document.getElementsByTagName('body')[0].appendChild(form);

        // Should we use a popup?
        if (el.getAttribute('data-popup')) {
            var _width = el.getAttribute('data-popup-width') || 875,
                _height = el.getAttribute('data-popup-height') || 475;

            window.open('about:blank', 'dwollapopup', 'width=' + _width + ',height=' + _height + ',resizeable,scrollbars');
            form.target = 'dwollapopup';
        }

        setTimeout(function () {
            form.submit();
        }, 500);
    },

    onFailure: function (error_message) {
        return false;
    }
    };
} ());

DOMReady.add(function () {
    // Grab immediate Dwolla buttons
    DwollaBtn.init();

    // Refresh buttons on DOM changes
    addEvent(document, 'DOMSubtreeModified', function () {
        DwollaBtn.init();
    });
});
