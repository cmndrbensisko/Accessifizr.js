define(["dojo/_base/declare", "dojo/_base/lang", "dojo/topic", "dojo/dom", "dojo/query", "dojo/dom-attr", "dojo/dom-construct", "dojo/json", "dojo/on", "dojo/keys", "dojo/_base/array", "dojo/dom-class", "dojo/Deferred", "dijit/focus", "dojo/i18n!./nls/strings", "dojo/domReady!"], function(declare, lang, topic, dom, query, domAttr, domConstruct, JSON, on, keys, array, domClass, Deferred, focusUtil, i18n) {
    return {
        init: function(args) {
            handlerBus = [];
            options = JSON.parse(args.data);
            setParent(options.tabOrder, null);
            query("*", document.body).forEach(function(node) {
                setTabs(node, -1);
            });
            assignTabs(options.tabOrder);
        },
        reInitTabs: function() {
            assignTabs(options.tabOrder);
        }
    };

    function aSyncProcess(node, needDisplay) {
        var deferred = new Deferred;
        var interval = setInterval(dojo.hitch(this, function() {
            if (query(node.id).length > 0 && !needDisplay || query(node.id).length > 0 && query(node.id)[0].style.display != "none" && needDisplay) {
                deferred.resolve(node);
                clearInterval(interval);
            }
        }, 100));
        return deferred.promise;
    }

    function getEventString(obj, eventString) {
        if (lang.exists(eventString, obj)) {
            var clickString = obj[eventString].replace(/\[.*\]/g, "");
            return clickString;
        }
        return null;
    }

    function checkEvt(evt, obj, eventString) {
        var returnValue = false;
        if (lang.exists(eventString, obj)) {
            var a = obj[eventString].split(",");
            a.forEach(function(node) {
                if (/\[/g.test(node)) {
                    if (evt.type == node.replace(/\[.*\]/g, "") && array.indexOf(node.match(/\[(.*?)\]/)[1].split("|"), evt.keyCode) >= 0) {
                        returnValue = true;
                    }
                } else {
                    if (node == evt.type) {
                        returnValue = true;
                    }
                }
            });
        } else {
            returnValue = false;
        }
        return returnValue;
    }

    function assignTabs(tabOrder) {
        if (lang.exists("preserveTabs", tabOrder)) {
            if (!tabOrder.preserveTabs) {
                clearTabs();
            }
        } else {
            clearTabs();
        }
        if (lang.exists("escModes", tabOrder)) {
            array.forEach(tabOrder.objects, function(object) {
                object.escModes = tabOrder.escModes;
                object.onEsc = tabOrder.onEsc;
            });
        }
        array.forEach(tabOrder.objects, function(object) {
            var process = aSyncProcess(object, false);
            process.then(dojo.hitch(this, function(createdObject) {
                query(createdObject.id).forEach(function(node) {
                    if (i18n[createdObject.id]) {
                        domAttr.set(node, "alt", i18n[createdObject.id]);
                    }
                    if (lang.exists("gridConfig", createdObject)) {
                        if (createdObject.gridConfig.type == "dgrid") {
                            query("[tabindex=0]", query(createdObject.id)[0]).forEach(function(_node) {
                                setTabs(_node, createdObject.tab);
                            });
                        }
                    } else {
                        setTabs(node, createdObject.tab);
                    }
                    if (lang.exists("onClick", createdObject)) {
                        var tabBus = [];
                        if (lang.exists("objects", createdObject.onClick)) {
                            tabBus.push(function() {
                                assignTabs(createdObject.onClick);
                            });
                        }
                        if (lang.exists("back", createdObject.onClick)) {
                            tabBus.push(function() {
                                assignTabs(recurseParent(getObjects(options, "id", createdObject.id)[0], createdObject.onClick.back));
                            });
                        }
                        handlerBus.push(on(node, getEventString(createdObject, "clickModes"), lang.hitch(this, function(evt) {
                            if (checkEvt(evt, createdObject, "clickModes")) {
                                if (lang.exists("clickControl", createdObject)) {
                                    var emitNode = query(createdObject.clickControl)[0]
                                } else {
                                    var emitNode = focusUtil.curNode
                                }
                                if (lang.exists("clickControlEvt", createdObject)) {
                                    var emitType = createdObject.clickControlEvt
                                } else {
                                    var emitType = "click"
                                }
                                if (evt.type !== emitType) {
                                    on.emit(emitNode, emitType, {
                                        "bubbles": true
                                    });
                                } else {
                                    tabBus.forEach(function(callback) {
                                        callback();
                                    });
                                    if (lang.exists("onClick.focus", createdObject)) {
                                        var process = aSyncProcess(createdObject.onClick.focus, true);
                                        process.then(dojo.hitch(this, function(domObjectId) {
                                            query(domObjectId.id)[0].focus();
                                        }));
                                    }
                                }
                            }
                        })));
                    }
                    if (lang.exists("onEsc", createdObject)) {
                        handlerBus.push(on(node, getEventString(createdObject, "escModes"), function(evt) {
                            if (checkEvt(evt, createdObject, "escModes")) {
                                var emitNode = createdObject.onEsc.escControl;
                                if (emitNode == "self") {
                                    emitNode = focusUtil.curNode;
                                } else {
                                    emitNode = query(emitNode)[0];
                                }
                                if (evt.type !== createdObject.onEsc.escControlEvt) {
                                    on.emit(emitNode, createdObject.onEsc.escControlEvt, {
                                        "bubbles": true
                                    });
                                }
                            }
                        }));
                    }
                });
            }));
        });
    }

    function checkForSwap(node) {
        return node.nodeName == "IMG" && !domClass.contains(node, "layerTile") && !domClass.contains(node, "canBeHidden") && !domClass.contains(node, "alwaysHidden");
    }

    function clearTabs() {
        for (i = 0; i <= 10; i++) {
            query('[tabIndex="' + i + '"]', document.body).forEach(function(node) {
                setTabs(node, -1);
            });
        }
        array.forEach(handlerBus, function(handler) {
            handler.remove();
        });
    }

    function findUpTag(el) {
        while (el.parentNode) {
            el = el.parentNode;
            return el;
        }
        return null;
    }

    function getObjects(obj, key, val) {
        var objects = [];
        for (var i in obj) {
            if (!obj.hasOwnProperty(i)) {
                continue;
            }
            if (i == "parent") {
                continue;
            }
            if (typeof obj[i] == "object") {
                objects = objects.concat(getObjects(obj[i], key, val));
            } else {
                if (i == key && obj[i] == val || i == key && val == "") {
                    objects.push(obj);
                } else {
                    if (obj[i] == val && key == "") {
                        if (objects.lastIndexOf(obj) == -1) {
                            objects.push(obj);
                        }
                    }
                }
            }
        }
        return objects;
    }

    function getSwapType(swapType, target) {
        var swapTypes = {
            "div": function(target) {
                var newNode = makeNewElementFromElement("div", target);
                newNode.style.background = "transparent url(" + target.src + ") no-repeat";
                newNode.attributes["originalDiv"] = target.outerHTML;
                var img = new Image;
                img.src = target.src;
                if (img.width > target.width || img.height > target.height) {
                    newNode.style.backgroundSize = target.width + "px " + target.height + "px";
                    newNode.style["-webkit-background-size"] = target.width + "px " + target.height + "px";
                }
                newNode.style.display = "inline-block";
                target.style.display = "none";
                target.style.visibility = "hidden";
                domAttr.set(target, "aria-hidden", "true");
                on(newNode, "click", function(e) {
                    on.emit(target, "click", {});
                });
                on(newNode, "keydown", function(e) {
                    on.emit(target, "keydown", {});
                });
                if (target.id == "") {
                    target.id = makeId();
                }
                newNode.id = target.id + "_dis";
                if (query("#" + target.id + "_dis").length == 0) {
                    domConstruct.place(newNode, target, "after");
                }
            },
            "img": function(target) {
                target.style.display = "inline-block";
                target.style.visibility = "";
                domAttr.set(target, "aria-hidden", "false");
                if (target.id != "" && query("#" + target.id + "_dis").length > 0) {
                    domConstruct.destroy(query("#" + target.id + "_dis")[0]);
                }
            }
        };
        return swapTypes[swapType](target);
    }

    function hasSrc(target) {
        var deferred = new Deferred;
        setTimeout(function() {
            if (target.src != "") {
                deferred.resolve(target);
            }
        }, 100);
        return deferred.promise;
    }

    function makeId() {
        var text = "";
        var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 10; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    function makeNewElementFromElement(tag, elem) {
        var newElem = document.createElement(tag),
            i, prop, attr = elem.attributes,
            attrLen = attr.length;
        elem = elem.cloneNode(true);
        while (elem.firstChild) {
            newElem.appendChild(elem.firstChild);
        }
        for (i in elem) {
            try {
                prop = elem[i];
                if (prop && i !== "outerHTML" && (typeof prop === "string" || typeof prop === "number")) {
                    newElem[i] = elem[i];
                }
            } catch (e) {}
        }
        for (i = 0; i < attrLen; i++) {
            newElem.setAttribute(attr[i].nodeName, attr[i].value);
        }
        newElem.style.cssText = elem.style.cssText;
        return newElem;
    }

    function recurseParent(obj, iter) {
        for (i = 0; i <= iter; i++) {
            obj = obj.parent;
        }
        return obj;
    }

    function setParent(o, g) {
        o.parent = g;
        if (typeof o !== "undefined") {
            for (n in o.objects) {
                o.objects[n].parent = o;
                if (o.objects[n].onClick) {
                    setParent(o.objects[n].onClick, o);
                }
            }
        }
    }

    function setTabs(node, index) {
        domAttr.set(node, "tabIndex", index);
        if (options.applyAria) {
            watchResult(node);
        }
    }

    function swapForAccess(imgOrDiv, target) {
        hasSrc(target).then(function(target) {
            getSwapType(imgOrDiv, target);
        });
    }

    function watchResult(target) {
        if ((array.indexOf(options.exemptTags, target.nodeName) == -1) && (dojo.every(options.exemptClasses, function(_class){return !domClass.contains(target,_class)})) && (array.indexOf(options.exemptIDs, target.id))){
            if (domAttr.get(target, "tabindex") == 0 || domAttr.get(target, "tabindex") > 0) {
                domAttr.set(target, "aria-hidden", "false");
                if (checkForSwap(target)) {
                    swapForAccess("img", target);
                }
                var el = target;
                while (null !== findUpTag(el)) {
                    domAttr.set(el, "aria-hidden", "false");
                    el = findUpTag(el);
                }
                dojo.query("*", target).forEach(function(node) {
                    if (!domClass.contains(node, "alwaysHidden")) {
                        domAttr.set(node, "aria-hidden", "false");
                    }
                    if (checkForSwap(node)) {
                        swapForAccess("img", node);
                    }
                });
            }
            if (domAttr.get(target, "tabindex") == -1) {
                domAttr.set(target, "aria-hidden", "true");
                if (checkForSwap(target)) {
                    swapForAccess("div", target);
                }
                dojo.query("*", target).forEach(function(node) {
                    if (domAttr.get(node, "tabindex") == 0 || domAttr.get(node, "tabindex") > 0) {
                        domAttr.set(target, "aria-hidden", "false");
                        if (checkForSwap(target)) {
                            swapForAccess("img", target);
                        }
                        domAttr.set(node, "aria-hidden", "false");
                        if (checkForSwap(node)) {
                            swapForAccess("img", node);
                        }
                        var el = target;
                        while (null !== findUpTag(el)) {
                            domAttr.set(el, "aria-hidden", "false");
                            if (checkForSwap(el)) {
                                swapForAccess("img", el);
                            }
                            el = findUpTag(el);
                        }
                    }
                    if (checkForSwap(node)) {
                        swapForAccess("div", node);
                    }
                });
            }
        }
    }
});