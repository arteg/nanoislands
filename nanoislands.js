/* ../node_modules/es5-shim/es5-shim.js begin */
/*!
 * https://github.com/es-shims/es5-shim
 * @license es5-shim Copyright 2009-2014 by contributors, MIT License
 * see https://github.com/es-shims/es5-shim/blob/master/LICENSE
 */

// vim: ts=4 sts=4 sw=4 expandtab


// UMD (Universal Module Definition)
// see https://github.com/umdjs/umd/blob/master/returnExports.js
// Add semicolon to prevent IIFE from being passed as argument to concatenated code.
;(function (root, factory) {
    'use strict';
    /*global define, exports, module */
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
    }
}(this, function () {

/**
 * Brings an environment as close to ECMAScript 5 compliance
 * as is possible with the facilities of erstwhile engines.
 *
 * Annotated ES5: http://es5.github.com/ (specific links below)
 * ES5 Spec: http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf
 * Required reading: http://javascriptweblog.wordpress.com/2011/12/05/extending-javascript-natives/
 */

// Shortcut to an often accessed properties, in order to avoid multiple
// dereference that costs universally.
var ArrayPrototype = Array.prototype;
var ObjectPrototype = Object.prototype;
var FunctionPrototype = Function.prototype;
var StringPrototype = String.prototype;
var NumberPrototype = Number.prototype;
var array_slice = ArrayPrototype.slice;
var array_splice = ArrayPrototype.splice;
var array_push = ArrayPrototype.push;
var array_unshift = ArrayPrototype.unshift;
var call = FunctionPrototype.call;

// Having a toString local variable name breaks in Opera so use to_string.
var to_string = ObjectPrototype.toString;

var isFunction = function (val) {
    return to_string.call(val) === '[object Function]';
};
var isRegex = function (val) {
    return to_string.call(val) === '[object RegExp]';
};
var isArray = function isArray(obj) {
    return to_string.call(obj) === '[object Array]';
};
var isString = function isString(obj) {
    return to_string.call(obj) === '[object String]';
};
var isArguments = function isArguments(value) {
    var str = to_string.call(value);
    var isArgs = str === '[object Arguments]';
    if (!isArgs) {
        isArgs = !isArray(value) &&
          value !== null &&
          typeof value === 'object' &&
          typeof value.length === 'number' &&
          value.length >= 0 &&
          isFunction(value.callee);
    }
    return isArgs;
};

var supportsDescriptors = Object.defineProperty && (function () {
    try {
        Object.defineProperty({}, 'x', {});
        return true;
    } catch (e) { /* this is ES3 */
        return false;
    }
}());

// Define configurable, writable and non-enumerable props
// if they don't exist.
var defineProperty;
if (supportsDescriptors) {
    defineProperty = function (object, name, method, forceAssign) {
        if (!forceAssign && (name in object)) { return; }
        Object.defineProperty(object, name, {
            configurable: true,
            enumerable: false,
            writable: true,
            value: method
        });
    };
} else {
    defineProperty = function (object, name, method, forceAssign) {
        if (!forceAssign && (name in object)) { return; }
        object[name] = method;
    };
}
var defineProperties = function (object, map, forceAssign) {
    for (var name in map) {
        if (ObjectPrototype.hasOwnProperty.call(map, name)) {
          defineProperty(object, name, map[name], forceAssign);
        }
    }
};

//
// Util
// ======
//

// ES5 9.4
// http://es5.github.com/#x9.4
// http://jsperf.com/to-integer

function toInteger(num) {
    var n = +num;
    if (n !== n) { // isNaN
        n = 0;
    } else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0)) {
        n = (n > 0 || -1) * Math.floor(Math.abs(n));
    }
    return n;
}

function isPrimitive(input) {
    var type = typeof input;
    return input === null ||
        type === 'undefined' ||
        type === 'boolean' ||
        type === 'number' ||
        type === 'string';
}

function toPrimitive(input) {
    var val, valueOf, toStr;
    if (isPrimitive(input)) {
        return input;
    }
    valueOf = input.valueOf;
    if (isFunction(valueOf)) {
        val = valueOf.call(input);
        if (isPrimitive(val)) {
            return val;
        }
    }
    toStr = input.toString;
    if (isFunction(toStr)) {
        val = toStr.call(input);
        if (isPrimitive(val)) {
            return val;
        }
    }
    throw new TypeError();
}

var ES = {
    // ES5 9.9
    // http://es5.github.com/#x9.9
    ToObject: function (o) {
        /*jshint eqnull: true */
        if (o == null) { // this matches both null and undefined
            throw new TypeError("can't convert " + o + ' to object');
        }
        return Object(o);
    },
    ToUint32: function ToUint32(x) {
        return x >>> 0;
    }
};

//
// Function
// ========
//

// ES-5 15.3.4.5
// http://es5.github.com/#x15.3.4.5

var Empty = function Empty() {};

defineProperties(FunctionPrototype, {
    bind: function bind(that) { // .length is 1
        // 1. Let Target be the this value.
        var target = this;
        // 2. If IsCallable(Target) is false, throw a TypeError exception.
        if (!isFunction(target)) {
            throw new TypeError('Function.prototype.bind called on incompatible ' + target);
        }
        // 3. Let A be a new (possibly empty) internal list of all of the
        //   argument values provided after thisArg (arg1, arg2 etc), in order.
        // XXX slicedArgs will stand in for "A" if used
        var args = array_slice.call(arguments, 1); // for normal call
        // 4. Let F be a new native ECMAScript object.
        // 11. Set the [[Prototype]] internal property of F to the standard
        //   built-in Function prototype object as specified in 15.3.3.1.
        // 12. Set the [[Call]] internal property of F as described in
        //   15.3.4.5.1.
        // 13. Set the [[Construct]] internal property of F as described in
        //   15.3.4.5.2.
        // 14. Set the [[HasInstance]] internal property of F as described in
        //   15.3.4.5.3.
        var bound;
        var binder = function () {

            if (this instanceof bound) {
                // 15.3.4.5.2 [[Construct]]
                // When the [[Construct]] internal method of a function object,
                // F that was created using the bind function is called with a
                // list of arguments ExtraArgs, the following steps are taken:
                // 1. Let target be the value of F's [[TargetFunction]]
                //   internal property.
                // 2. If target has no [[Construct]] internal method, a
                //   TypeError exception is thrown.
                // 3. Let boundArgs be the value of F's [[BoundArgs]] internal
                //   property.
                // 4. Let args be a new list containing the same values as the
                //   list boundArgs in the same order followed by the same
                //   values as the list ExtraArgs in the same order.
                // 5. Return the result of calling the [[Construct]] internal
                //   method of target providing args as the arguments.

                var result = target.apply(
                    this,
                    args.concat(array_slice.call(arguments))
                );
                if (Object(result) === result) {
                    return result;
                }
                return this;

            } else {
                // 15.3.4.5.1 [[Call]]
                // When the [[Call]] internal method of a function object, F,
                // which was created using the bind function is called with a
                // this value and a list of arguments ExtraArgs, the following
                // steps are taken:
                // 1. Let boundArgs be the value of F's [[BoundArgs]] internal
                //   property.
                // 2. Let boundThis be the value of F's [[BoundThis]] internal
                //   property.
                // 3. Let target be the value of F's [[TargetFunction]] internal
                //   property.
                // 4. Let args be a new list containing the same values as the
                //   list boundArgs in the same order followed by the same
                //   values as the list ExtraArgs in the same order.
                // 5. Return the result of calling the [[Call]] internal method
                //   of target providing boundThis as the this value and
                //   providing args as the arguments.

                // equiv: target.call(this, ...boundArgs, ...args)
                return target.apply(
                    that,
                    args.concat(array_slice.call(arguments))
                );

            }

        };

        // 15. If the [[Class]] internal property of Target is "Function", then
        //     a. Let L be the length property of Target minus the length of A.
        //     b. Set the length own property of F to either 0 or L, whichever is
        //       larger.
        // 16. Else set the length own property of F to 0.

        var boundLength = Math.max(0, target.length - args.length);

        // 17. Set the attributes of the length own property of F to the values
        //   specified in 15.3.5.1.
        var boundArgs = [];
        for (var i = 0; i < boundLength; i++) {
            boundArgs.push('$' + i);
        }

        // XXX Build a dynamic function with desired amount of arguments is the only
        // way to set the length property of a function.
        // In environments where Content Security Policies enabled (Chrome extensions,
        // for ex.) all use of eval or Function costructor throws an exception.
        // However in all of these environments Function.prototype.bind exists
        // and so this code will never be executed.
        bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this, arguments); }')(binder);

        if (target.prototype) {
            Empty.prototype = target.prototype;
            bound.prototype = new Empty();
            // Clean up dangling references.
            Empty.prototype = null;
        }

        // TODO
        // 18. Set the [[Extensible]] internal property of F to true.

        // TODO
        // 19. Let thrower be the [[ThrowTypeError]] function Object (13.2.3).
        // 20. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "caller", PropertyDescriptor {[[Get]]: thrower, [[Set]]:
        //   thrower, [[Enumerable]]: false, [[Configurable]]: false}, and
        //   false.
        // 21. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "arguments", PropertyDescriptor {[[Get]]: thrower,
        //   [[Set]]: thrower, [[Enumerable]]: false, [[Configurable]]: false},
        //   and false.

        // TODO
        // NOTE Function objects created using Function.prototype.bind do not
        // have a prototype property or the [[Code]], [[FormalParameters]], and
        // [[Scope]] internal properties.
        // XXX can't delete prototype in pure-js.

        // 22. Return F.
        return bound;
    }
});

// _Please note: Shortcuts are defined after `Function.prototype.bind` as we
// us it in defining shortcuts.
var owns = call.bind(ObjectPrototype.hasOwnProperty);

//
// Array
// =====
//

// ES5 15.4.4.12
// http://es5.github.com/#x15.4.4.12
var spliceNoopReturnsEmptyArray = (function () {
    var a = [1, 2];
    var result = a.splice();
    return a.length === 2 && isArray(result) && result.length === 0;
}());
defineProperties(ArrayPrototype, {
    // Safari 5.0 bug where .splice() returns undefined
    splice: function splice(start, deleteCount) {
        if (arguments.length === 0) {
            return [];
        } else {
            return array_splice.apply(this, arguments);
        }
    }
}, spliceNoopReturnsEmptyArray);

var spliceWorksWithEmptyObject = (function () {
    var obj = {};
    ArrayPrototype.splice.call(obj, 0, 0, 1);
    return obj.length === 1;
}());
defineProperties(ArrayPrototype, {
    splice: function splice(start, deleteCount) {
        if (arguments.length === 0) { return []; }
        var args = arguments;
        this.length = Math.max(toInteger(this.length), 0);
        if (arguments.length > 0 && typeof deleteCount !== 'number') {
            args = array_slice.call(arguments);
            if (args.length < 2) {
                args.push(this.length - start);
            } else {
                args[1] = toInteger(deleteCount);
            }
        }
        return array_splice.apply(this, args);
    }
}, !spliceWorksWithEmptyObject);

// ES5 15.4.4.12
// http://es5.github.com/#x15.4.4.13
// Return len+argCount.
// [bugfix, ielt8]
// IE < 8 bug: [].unshift(0) === undefined but should be "1"
var hasUnshiftReturnValueBug = [].unshift(0) !== 1;
defineProperties(ArrayPrototype, {
    unshift: function () {
        array_unshift.apply(this, arguments);
        return this.length;
    }
}, hasUnshiftReturnValueBug);

// ES5 15.4.3.2
// http://es5.github.com/#x15.4.3.2
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
defineProperties(Array, { isArray: isArray });

// The IsCallable() check in the Array functions
// has been replaced with a strict check on the
// internal class of the object to trap cases where
// the provided function was actually a regular
// expression literal, which in V8 and
// JavaScriptCore is a typeof "function".  Only in
// V8 are regular expression literals permitted as
// reduce parameters, so it is desirable in the
// general case for the shim to match the more
// strict and common behavior of rejecting regular
// expressions.

// ES5 15.4.4.18
// http://es5.github.com/#x15.4.4.18
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/forEach

// Check failure of by-index access of string characters (IE < 9)
// and failure of `0 in boxedString` (Rhino)
var boxedString = Object('a');
var splitString = boxedString[0] !== 'a' || !(0 in boxedString);

var properlyBoxesContext = function properlyBoxed(method) {
    // Check node 0.6.21 bug where third parameter is not boxed
    var properlyBoxesNonStrict = true;
    var properlyBoxesStrict = true;
    if (method) {
        method.call('foo', function (_, __, context) {
            if (typeof context !== 'object') { properlyBoxesNonStrict = false; }
        });

        method.call([1], function () {
            'use strict';
            properlyBoxesStrict = typeof this === 'string';
        }, 'x');
    }
    return !!method && properlyBoxesNonStrict && properlyBoxesStrict;
};

defineProperties(ArrayPrototype, {
    forEach: function forEach(fun /*, thisp*/) {
        var object = ES.ToObject(this),
            self = splitString && isString(this) ? this.split('') : object,
            thisp = arguments[1],
            i = -1,
            length = self.length >>> 0;

        // If no callback function or if callback is not a callable function
        if (!isFunction(fun)) {
            throw new TypeError(); // TODO message
        }

        while (++i < length) {
            if (i in self) {
                // Invoke the callback function with call, passing arguments:
                // context, property value, property key, thisArg object
                // context
                fun.call(thisp, self[i], i, object);
            }
        }
    }
}, !properlyBoxesContext(ArrayPrototype.forEach));

// ES5 15.4.4.19
// http://es5.github.com/#x15.4.4.19
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/map
defineProperties(ArrayPrototype, {
    map: function map(fun /*, thisp*/) {
        var object = ES.ToObject(this),
            self = splitString && isString(this) ? this.split('') : object,
            length = self.length >>> 0,
            result = Array(length),
            thisp = arguments[1];

        // If no callback function or if callback is not a callable function
        if (!isFunction(fun)) {
            throw new TypeError(fun + ' is not a function');
        }

        for (var i = 0; i < length; i++) {
            if (i in self) {
                result[i] = fun.call(thisp, self[i], i, object);
            }
        }
        return result;
    }
}, !properlyBoxesContext(ArrayPrototype.map));

// ES5 15.4.4.20
// http://es5.github.com/#x15.4.4.20
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/filter
defineProperties(ArrayPrototype, {
    filter: function filter(fun /*, thisp */) {
        var object = ES.ToObject(this),
            self = splitString && isString(this) ? this.split('') : object,
            length = self.length >>> 0,
            result = [],
            value,
            thisp = arguments[1];

        // If no callback function or if callback is not a callable function
        if (!isFunction(fun)) {
            throw new TypeError(fun + ' is not a function');
        }

        for (var i = 0; i < length; i++) {
            if (i in self) {
                value = self[i];
                if (fun.call(thisp, value, i, object)) {
                    result.push(value);
                }
            }
        }
        return result;
    }
}, !properlyBoxesContext(ArrayPrototype.filter));

// ES5 15.4.4.16
// http://es5.github.com/#x15.4.4.16
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/every
defineProperties(ArrayPrototype, {
    every: function every(fun /*, thisp */) {
        var object = ES.ToObject(this),
            self = splitString && isString(this) ? this.split('') : object,
            length = self.length >>> 0,
            thisp = arguments[1];

        // If no callback function or if callback is not a callable function
        if (!isFunction(fun)) {
            throw new TypeError(fun + ' is not a function');
        }

        for (var i = 0; i < length; i++) {
            if (i in self && !fun.call(thisp, self[i], i, object)) {
                return false;
            }
        }
        return true;
    }
}, !properlyBoxesContext(ArrayPrototype.every));

// ES5 15.4.4.17
// http://es5.github.com/#x15.4.4.17
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/some
defineProperties(ArrayPrototype, {
    some: function some(fun /*, thisp */) {
        var object = ES.ToObject(this),
            self = splitString && isString(this) ? this.split('') : object,
            length = self.length >>> 0,
            thisp = arguments[1];

        // If no callback function or if callback is not a callable function
        if (!isFunction(fun)) {
            throw new TypeError(fun + ' is not a function');
        }

        for (var i = 0; i < length; i++) {
            if (i in self && fun.call(thisp, self[i], i, object)) {
                return true;
            }
        }
        return false;
    }
}, !properlyBoxesContext(ArrayPrototype.some));

// ES5 15.4.4.21
// http://es5.github.com/#x15.4.4.21
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduce
var reduceCoercesToObject = false;
if (ArrayPrototype.reduce) {
    reduceCoercesToObject = typeof ArrayPrototype.reduce.call('es5', function (_, __, ___, list) { return list; }) === 'object';
}
defineProperties(ArrayPrototype, {
    reduce: function reduce(fun /*, initial*/) {
        var object = ES.ToObject(this),
            self = splitString && isString(this) ? this.split('') : object,
            length = self.length >>> 0;

        // If no callback function or if callback is not a callable function
        if (!isFunction(fun)) {
            throw new TypeError(fun + ' is not a function');
        }

        // no value to return if no initial value and an empty array
        if (!length && arguments.length === 1) {
            throw new TypeError('reduce of empty array with no initial value');
        }

        var i = 0;
        var result;
        if (arguments.length >= 2) {
            result = arguments[1];
        } else {
            do {
                if (i in self) {
                    result = self[i++];
                    break;
                }

                // if array contains no values, no initial value to return
                if (++i >= length) {
                    throw new TypeError('reduce of empty array with no initial value');
                }
            } while (true);
        }

        for (; i < length; i++) {
            if (i in self) {
                result = fun.call(void 0, result, self[i], i, object);
            }
        }

        return result;
    }
}, !reduceCoercesToObject);

// ES5 15.4.4.22
// http://es5.github.com/#x15.4.4.22
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduceRight
var reduceRightCoercesToObject = false;
if (ArrayPrototype.reduceRight) {
    reduceRightCoercesToObject = typeof ArrayPrototype.reduceRight.call('es5', function (_, __, ___, list) { return list; }) === 'object';
}
defineProperties(ArrayPrototype, {
    reduceRight: function reduceRight(fun /*, initial*/) {
        var object = ES.ToObject(this),
            self = splitString && isString(this) ? this.split('') : object,
            length = self.length >>> 0;

        // If no callback function or if callback is not a callable function
        if (!isFunction(fun)) {
            throw new TypeError(fun + ' is not a function');
        }

        // no value to return if no initial value, empty array
        if (!length && arguments.length === 1) {
            throw new TypeError('reduceRight of empty array with no initial value');
        }

        var result, i = length - 1;
        if (arguments.length >= 2) {
            result = arguments[1];
        } else {
            do {
                if (i in self) {
                    result = self[i--];
                    break;
                }

                // if array contains no values, no initial value to return
                if (--i < 0) {
                    throw new TypeError('reduceRight of empty array with no initial value');
                }
            } while (true);
        }

        if (i < 0) {
            return result;
        }

        do {
            if (i in self) {
                result = fun.call(void 0, result, self[i], i, object);
            }
        } while (i--);

        return result;
    }
}, !reduceRightCoercesToObject);

// ES5 15.4.4.14
// http://es5.github.com/#x15.4.4.14
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
var hasFirefox2IndexOfBug = Array.prototype.indexOf && [0, 1].indexOf(1, 2) !== -1;
defineProperties(ArrayPrototype, {
    indexOf: function indexOf(sought /*, fromIndex */) {
        var self = splitString && isString(this) ? this.split('') : ES.ToObject(this),
            length = self.length >>> 0;

        if (!length) {
            return -1;
        }

        var i = 0;
        if (arguments.length > 1) {
            i = toInteger(arguments[1]);
        }

        // handle negative indices
        i = i >= 0 ? i : Math.max(0, length + i);
        for (; i < length; i++) {
            if (i in self && self[i] === sought) {
                return i;
            }
        }
        return -1;
    }
}, hasFirefox2IndexOfBug);

// ES5 15.4.4.15
// http://es5.github.com/#x15.4.4.15
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/lastIndexOf
var hasFirefox2LastIndexOfBug = Array.prototype.lastIndexOf && [0, 1].lastIndexOf(0, -3) !== -1;
defineProperties(ArrayPrototype, {
    lastIndexOf: function lastIndexOf(sought /*, fromIndex */) {
        var self = splitString && isString(this) ? this.split('') : ES.ToObject(this),
            length = self.length >>> 0;

        if (!length) {
            return -1;
        }
        var i = length - 1;
        if (arguments.length > 1) {
            i = Math.min(i, toInteger(arguments[1]));
        }
        // handle negative indices
        i = i >= 0 ? i : length - Math.abs(i);
        for (; i >= 0; i--) {
            if (i in self && sought === self[i]) {
                return i;
            }
        }
        return -1;
    }
}, hasFirefox2LastIndexOfBug);

//
// Object
// ======
//

// ES5 15.2.3.14
// http://es5.github.com/#x15.2.3.14

// http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
var hasDontEnumBug = !({'toString': null}).propertyIsEnumerable('toString'),
    hasProtoEnumBug = function () {}.propertyIsEnumerable('prototype'),
    dontEnums = [
        'toString',
        'toLocaleString',
        'valueOf',
        'hasOwnProperty',
        'isPrototypeOf',
        'propertyIsEnumerable',
        'constructor'
    ],
    dontEnumsLength = dontEnums.length;

defineProperties(Object, {
    keys: function keys(object) {
        var isFn = isFunction(object),
            isArgs = isArguments(object),
            isObject = object !== null && typeof object === 'object',
            isStr = isObject && isString(object);

        if (!isObject && !isFn && !isArgs) {
            throw new TypeError('Object.keys called on a non-object');
        }

        var theKeys = [];
        var skipProto = hasProtoEnumBug && isFn;
        if (isStr || isArgs) {
            for (var i = 0; i < object.length; ++i) {
                theKeys.push(String(i));
            }
        } else {
            for (var name in object) {
                if (!(skipProto && name === 'prototype') && owns(object, name)) {
                    theKeys.push(String(name));
                }
            }
        }

        if (hasDontEnumBug) {
            var ctor = object.constructor,
                skipConstructor = ctor && ctor.prototype === object;
            for (var j = 0; j < dontEnumsLength; j++) {
                var dontEnum = dontEnums[j];
                if (!(skipConstructor && dontEnum === 'constructor') && owns(object, dontEnum)) {
                    theKeys.push(dontEnum);
                }
            }
        }
        return theKeys;
    }
});

var keysWorksWithArguments = Object.keys && (function () {
    // Safari 5.0 bug
    return Object.keys(arguments).length === 2;
}(1, 2));
var originalKeys = Object.keys;
defineProperties(Object, {
    keys: function keys(object) {
        if (isArguments(object)) {
            return originalKeys(ArrayPrototype.slice.call(object));
        } else {
            return originalKeys(object);
        }
    }
}, !keysWorksWithArguments);

//
// Date
// ====
//

// ES5 15.9.5.43
// http://es5.github.com/#x15.9.5.43
// This function returns a String value represent the instance in time
// represented by this Date object. The format of the String is the Date Time
// string format defined in 15.9.1.15. All fields are present in the String.
// The time zone is always UTC, denoted by the suffix Z. If the time value of
// this object is not a finite Number a RangeError exception is thrown.
var negativeDate = -62198755200000;
var negativeYearString = '-000001';
var hasNegativeDateBug = Date.prototype.toISOString && new Date(negativeDate).toISOString().indexOf(negativeYearString) === -1;

defineProperties(Date.prototype, {
    toISOString: function toISOString() {
        var result, length, value, year, month;
        if (!isFinite(this)) {
            throw new RangeError('Date.prototype.toISOString called on non-finite value.');
        }

        year = this.getUTCFullYear();

        month = this.getUTCMonth();
        // see https://github.com/es-shims/es5-shim/issues/111
        year += Math.floor(month / 12);
        month = (month % 12 + 12) % 12;

        // the date time string format is specified in 15.9.1.15.
        result = [month + 1, this.getUTCDate(), this.getUTCHours(), this.getUTCMinutes(), this.getUTCSeconds()];
        year = (
            (year < 0 ? '-' : (year > 9999 ? '+' : '')) +
            ('00000' + Math.abs(year)).slice(0 <= year && year <= 9999 ? -4 : -6)
        );

        length = result.length;
        while (length--) {
            value = result[length];
            // pad months, days, hours, minutes, and seconds to have two
            // digits.
            if (value < 10) {
                result[length] = '0' + value;
            }
        }
        // pad milliseconds to have three digits.
        return (
            year + '-' + result.slice(0, 2).join('-') +
            'T' + result.slice(2).join(':') + '.' +
            ('000' + this.getUTCMilliseconds()).slice(-3) + 'Z'
        );
    }
}, hasNegativeDateBug);


// ES5 15.9.5.44
// http://es5.github.com/#x15.9.5.44
// This function provides a String representation of a Date object for use by
// JSON.stringify (15.12.3).
var dateToJSONIsSupported = false;
try {
    dateToJSONIsSupported = (
        Date.prototype.toJSON &&
        new Date(NaN).toJSON() === null &&
        new Date(negativeDate).toJSON().indexOf(negativeYearString) !== -1 &&
        Date.prototype.toJSON.call({ // generic
            toISOString: function () {
                return true;
            }
        })
    );
} catch (e) {
}
if (!dateToJSONIsSupported) {
    Date.prototype.toJSON = function toJSON(key) {
        // When the toJSON method is called with argument key, the following
        // steps are taken:

        // 1.  Let O be the result of calling ToObject, giving it the this
        // value as its argument.
        // 2. Let tv be toPrimitive(O, hint Number).
        var o = Object(this),
            tv = toPrimitive(o),
            toISO;
        // 3. If tv is a Number and is not finite, return null.
        if (typeof tv === 'number' && !isFinite(tv)) {
            return null;
        }
        // 4. Let toISO be the result of calling the [[Get]] internal method of
        // O with argument "toISOString".
        toISO = o.toISOString;
        // 5. If IsCallable(toISO) is false, throw a TypeError exception.
        if (typeof toISO !== 'function') {
            throw new TypeError('toISOString property is not callable');
        }
        // 6. Return the result of calling the [[Call]] internal method of
        //  toISO with O as the this value and an empty argument list.
        return toISO.call(o);

        // NOTE 1 The argument is ignored.

        // NOTE 2 The toJSON function is intentionally generic; it does not
        // require that its this value be a Date object. Therefore, it can be
        // transferred to other kinds of objects for use as a method. However,
        // it does require that any such object have a toISOString method. An
        // object is free to use the argument key to filter its
        // stringification.
    };
}

// ES5 15.9.4.2
// http://es5.github.com/#x15.9.4.2
// based on work shared by Daniel Friesen (dantman)
// http://gist.github.com/303249
var supportsExtendedYears = Date.parse('+033658-09-27T01:46:40.000Z') === 1e15;
var acceptsInvalidDates = !isNaN(Date.parse('2012-04-04T24:00:00.500Z')) || !isNaN(Date.parse('2012-11-31T23:59:59.000Z'));
var doesNotParseY2KNewYear = isNaN(Date.parse('2000-01-01T00:00:00.000Z'));
if (!Date.parse || doesNotParseY2KNewYear || acceptsInvalidDates || !supportsExtendedYears) {
    // XXX global assignment won't work in embeddings that use
    // an alternate object for the context.
    /*global Date: true */
    Date = (function (NativeDate) {

        // Date.length === 7
        function Date(Y, M, D, h, m, s, ms) {
            var length = arguments.length;
            if (this instanceof NativeDate) {
                var date = length === 1 && String(Y) === Y ? // isString(Y)
                    // We explicitly pass it through parse:
                    new NativeDate(Date.parse(Y)) :
                    // We have to manually make calls depending on argument
                    // length here
                    length >= 7 ? new NativeDate(Y, M, D, h, m, s, ms) :
                    length >= 6 ? new NativeDate(Y, M, D, h, m, s) :
                    length >= 5 ? new NativeDate(Y, M, D, h, m) :
                    length >= 4 ? new NativeDate(Y, M, D, h) :
                    length >= 3 ? new NativeDate(Y, M, D) :
                    length >= 2 ? new NativeDate(Y, M) :
                    length >= 1 ? new NativeDate(Y) :
                                  new NativeDate();
                // Prevent mixups with unfixed Date object
                date.constructor = Date;
                return date;
            }
            return NativeDate.apply(this, arguments);
        }

        // 15.9.1.15 Date Time String Format.
        var isoDateExpression = new RegExp('^' +
            '(\\d{4}|[+-]\\d{6})' + // four-digit year capture or sign +
                                      // 6-digit extended year
            '(?:-(\\d{2})' + // optional month capture
            '(?:-(\\d{2})' + // optional day capture
            '(?:' + // capture hours:minutes:seconds.milliseconds
                'T(\\d{2})' + // hours capture
                ':(\\d{2})' + // minutes capture
                '(?:' + // optional :seconds.milliseconds
                    ':(\\d{2})' + // seconds capture
                    '(?:(\\.\\d{1,}))?' + // milliseconds capture
                ')?' +
            '(' + // capture UTC offset component
                'Z|' + // UTC capture
                '(?:' + // offset specifier +/-hours:minutes
                    '([-+])' + // sign capture
                    '(\\d{2})' + // hours offset capture
                    ':(\\d{2})' + // minutes offset capture
                ')' +
            ')?)?)?)?' +
        '$');

        var months = [
            0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365
        ];

        function dayFromMonth(year, month) {
            var t = month > 1 ? 1 : 0;
            return (
                months[month] +
                Math.floor((year - 1969 + t) / 4) -
                Math.floor((year - 1901 + t) / 100) +
                Math.floor((year - 1601 + t) / 400) +
                365 * (year - 1970)
            );
        }

        function toUTC(t) {
            return Number(new NativeDate(1970, 0, 1, 0, 0, 0, t));
        }

        // Copy any custom methods a 3rd party library may have added
        for (var key in NativeDate) {
            Date[key] = NativeDate[key];
        }

        // Copy "native" methods explicitly; they may be non-enumerable
        Date.now = NativeDate.now;
        Date.UTC = NativeDate.UTC;
        Date.prototype = NativeDate.prototype;
        Date.prototype.constructor = Date;

        // Upgrade Date.parse to handle simplified ISO 8601 strings
        Date.parse = function parse(string) {
            var match = isoDateExpression.exec(string);
            if (match) {
                // parse months, days, hours, minutes, seconds, and milliseconds
                // provide default values if necessary
                // parse the UTC offset component
                var year = Number(match[1]),
                    month = Number(match[2] || 1) - 1,
                    day = Number(match[3] || 1) - 1,
                    hour = Number(match[4] || 0),
                    minute = Number(match[5] || 0),
                    second = Number(match[6] || 0),
                    millisecond = Math.floor(Number(match[7] || 0) * 1000),
                    // When time zone is missed, local offset should be used
                    // (ES 5.1 bug)
                    // see https://bugs.ecmascript.org/show_bug.cgi?id=112
                    isLocalTime = Boolean(match[4] && !match[8]),
                    signOffset = match[9] === '-' ? 1 : -1,
                    hourOffset = Number(match[10] || 0),
                    minuteOffset = Number(match[11] || 0),
                    result;
                if (
                    hour < (
                        minute > 0 || second > 0 || millisecond > 0 ?
                        24 : 25
                    ) &&
                    minute < 60 && second < 60 && millisecond < 1000 &&
                    month > -1 && month < 12 && hourOffset < 24 &&
                    minuteOffset < 60 && // detect invalid offsets
                    day > -1 &&
                    day < (
                        dayFromMonth(year, month + 1) -
                        dayFromMonth(year, month)
                    )
                ) {
                    result = (
                        (dayFromMonth(year, month) + day) * 24 +
                        hour +
                        hourOffset * signOffset
                    ) * 60;
                    result = (
                        (result + minute + minuteOffset * signOffset) * 60 +
                        second
                    ) * 1000 + millisecond;
                    if (isLocalTime) {
                        result = toUTC(result);
                    }
                    if (-8.64e15 <= result && result <= 8.64e15) {
                        return result;
                    }
                }
                return NaN;
            }
            return NativeDate.parse.apply(this, arguments);
        };

        return Date;
    }(Date));
    /*global Date: false */
}

// ES5 15.9.4.4
// http://es5.github.com/#x15.9.4.4
if (!Date.now) {
    Date.now = function now() {
        return new Date().getTime();
    };
}


//
// Number
// ======
//

// ES5.1 15.7.4.5
// http://es5.github.com/#x15.7.4.5
var hasToFixedBugs = NumberPrototype.toFixed && (
  (0.00008).toFixed(3) !== '0.000' ||
  (0.9).toFixed(0) !== '1' ||
  (1.255).toFixed(2) !== '1.25' ||
  (1000000000000000128).toFixed(0) !== '1000000000000000128'
);

var toFixedHelpers = {
  base: 1e7,
  size: 6,
  data: [0, 0, 0, 0, 0, 0],
  multiply: function multiply(n, c) {
      var i = -1;
      while (++i < toFixedHelpers.size) {
          c += n * toFixedHelpers.data[i];
          toFixedHelpers.data[i] = c % toFixedHelpers.base;
          c = Math.floor(c / toFixedHelpers.base);
      }
  },
  divide: function divide(n) {
      var i = toFixedHelpers.size, c = 0;
      while (--i >= 0) {
          c += toFixedHelpers.data[i];
          toFixedHelpers.data[i] = Math.floor(c / n);
          c = (c % n) * toFixedHelpers.base;
      }
  },
  numToString: function numToString() {
      var i = toFixedHelpers.size;
      var s = '';
      while (--i >= 0) {
          if (s !== '' || i === 0 || toFixedHelpers.data[i] !== 0) {
              var t = String(toFixedHelpers.data[i]);
              if (s === '') {
                  s = t;
              } else {
                  s += '0000000'.slice(0, 7 - t.length) + t;
              }
          }
      }
      return s;
  },
  pow: function pow(x, n, acc) {
      return (n === 0 ? acc : (n % 2 === 1 ? pow(x, n - 1, acc * x) : pow(x * x, n / 2, acc)));
  },
  log: function log(x) {
      var n = 0;
      while (x >= 4096) {
          n += 12;
          x /= 4096;
      }
      while (x >= 2) {
          n += 1;
          x /= 2;
      }
      return n;
  }
};

defineProperties(NumberPrototype, {
    toFixed: function toFixed(fractionDigits) {
        var f, x, s, m, e, z, j, k;

        // Test for NaN and round fractionDigits down
        f = Number(fractionDigits);
        f = f !== f ? 0 : Math.floor(f);

        if (f < 0 || f > 20) {
            throw new RangeError('Number.toFixed called with invalid number of decimals');
        }

        x = Number(this);

        // Test for NaN
        if (x !== x) {
            return 'NaN';
        }

        // If it is too big or small, return the string value of the number
        if (x <= -1e21 || x >= 1e21) {
            return String(x);
        }

        s = '';

        if (x < 0) {
            s = '-';
            x = -x;
        }

        m = '0';

        if (x > 1e-21) {
            // 1e-21 < x < 1e21
            // -70 < log2(x) < 70
            e = toFixedHelpers.log(x * toFixedHelpers.pow(2, 69, 1)) - 69;
            z = (e < 0 ? x * toFixedHelpers.pow(2, -e, 1) : x / toFixedHelpers.pow(2, e, 1));
            z *= 0x10000000000000; // Math.pow(2, 52);
            e = 52 - e;

            // -18 < e < 122
            // x = z / 2 ^ e
            if (e > 0) {
                toFixedHelpers.multiply(0, z);
                j = f;

                while (j >= 7) {
                    toFixedHelpers.multiply(1e7, 0);
                    j -= 7;
                }

                toFixedHelpers.multiply(toFixedHelpers.pow(10, j, 1), 0);
                j = e - 1;

                while (j >= 23) {
                    toFixedHelpers.divide(1 << 23);
                    j -= 23;
                }

                toFixedHelpers.divide(1 << j);
                toFixedHelpers.multiply(1, 1);
                toFixedHelpers.divide(2);
                m = toFixedHelpers.numToString();
            } else {
                toFixedHelpers.multiply(0, z);
                toFixedHelpers.multiply(1 << (-e), 0);
                m = toFixedHelpers.numToString() + '0.00000000000000000000'.slice(2, 2 + f);
            }
        }

        if (f > 0) {
            k = m.length;

            if (k <= f) {
                m = s + '0.0000000000000000000'.slice(0, f - k + 2) + m;
            } else {
                m = s + m.slice(0, k - f) + '.' + m.slice(k - f);
            }
        } else {
            m = s + m;
        }

        return m;
    }
}, hasToFixedBugs);


//
// String
// ======
//

// ES5 15.5.4.14
// http://es5.github.com/#x15.5.4.14

// [bugfix, IE lt 9, firefox 4, Konqueror, Opera, obscure browsers]
// Many browsers do not split properly with regular expressions or they
// do not perform the split correctly under obscure conditions.
// See http://blog.stevenlevithan.com/archives/cross-browser-split
// I've tested in many browsers and this seems to cover the deviant ones:
//    'ab'.split(/(?:ab)*/) should be ["", ""], not [""]
//    '.'.split(/(.?)(.?)/) should be ["", ".", "", ""], not ["", ""]
//    'tesst'.split(/(s)*/) should be ["t", undefined, "e", "s", "t"], not
//       [undefined, "t", undefined, "e", ...]
//    ''.split(/.?/) should be [], not [""]
//    '.'.split(/()()/) should be ["."], not ["", "", "."]

var string_split = StringPrototype.split;
if (
    'ab'.split(/(?:ab)*/).length !== 2 ||
    '.'.split(/(.?)(.?)/).length !== 4 ||
    'tesst'.split(/(s)*/)[1] === 't' ||
    'test'.split(/(?:)/, -1).length !== 4 ||
    ''.split(/.?/).length ||
    '.'.split(/()()/).length > 1
) {
    (function () {
        var compliantExecNpcg = typeof (/()??/).exec('')[1] === 'undefined'; // NPCG: nonparticipating capturing group

        StringPrototype.split = function (separator, limit) {
            var string = this;
            if (typeof separator === 'undefined' && limit === 0) {
                return [];
            }

            // If `separator` is not a regex, use native split
            if (to_string.call(separator) !== '[object RegExp]') {
                return string_split.call(this, separator, limit);
            }

            var output = [],
                flags = (separator.ignoreCase ? 'i' : '') +
                        (separator.multiline ? 'm' : '') +
                        (separator.extended ? 'x' : '') + // Proposed for ES6
                        (separator.sticky ? 'y' : ''), // Firefox 3+
                lastLastIndex = 0,
                // Make `global` and avoid `lastIndex` issues by working with a copy
                separator2, match, lastIndex, lastLength;
            separator = new RegExp(separator.source, flags + 'g');
            string += ''; // Type-convert
            if (!compliantExecNpcg) {
                // Doesn't need flags gy, but they don't hurt
                separator2 = new RegExp('^' + separator.source + '$(?!\\s)', flags);
            }
            /* Values for `limit`, per the spec:
             * If undefined: 4294967295 // Math.pow(2, 32) - 1
             * If 0, Infinity, or NaN: 0
             * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
             * If negative number: 4294967296 - Math.floor(Math.abs(limit))
             * If other: Type-convert, then use the above rules
             */
            limit = typeof limit === 'undefined' ?
                -1 >>> 0 : // Math.pow(2, 32) - 1
                ES.ToUint32(limit);
            while (match = separator.exec(string)) {
                // `separator.lastIndex` is not reliable cross-browser
                lastIndex = match.index + match[0].length;
                if (lastIndex > lastLastIndex) {
                    output.push(string.slice(lastLastIndex, match.index));
                    // Fix browsers whose `exec` methods don't consistently return `undefined` for
                    // nonparticipating capturing groups
                    if (!compliantExecNpcg && match.length > 1) {
                        match[0].replace(separator2, function () {
                            for (var i = 1; i < arguments.length - 2; i++) {
                                if (typeof arguments[i] === 'undefined') {
                                    match[i] = void 0;
                                }
                            }
                        });
                    }
                    if (match.length > 1 && match.index < string.length) {
                        array_push.apply(output, match.slice(1));
                    }
                    lastLength = match[0].length;
                    lastLastIndex = lastIndex;
                    if (output.length >= limit) {
                        break;
                    }
                }
                if (separator.lastIndex === match.index) {
                    separator.lastIndex++; // Avoid an infinite loop
                }
            }
            if (lastLastIndex === string.length) {
                if (lastLength || !separator.test('')) {
                    output.push('');
                }
            } else {
                output.push(string.slice(lastLastIndex));
            }
            return output.length > limit ? output.slice(0, limit) : output;
        };
    }());

// [bugfix, chrome]
// If separator is undefined, then the result array contains just one String,
// which is the this value (converted to a String). If limit is not undefined,
// then the output array is truncated so that it contains no more than limit
// elements.
// "0".split(undefined, 0) -> []
} else if ('0'.split(void 0, 0).length) {
    StringPrototype.split = function split(separator, limit) {
        if (typeof separator === 'undefined' && limit === 0) { return []; }
        return string_split.call(this, separator, limit);
    };
}

var str_replace = StringPrototype.replace;
var replaceReportsGroupsCorrectly = (function () {
    var groups = [];
    'x'.replace(/x(.)?/g, function (match, group) {
        groups.push(group);
    });
    return groups.length === 1 && typeof groups[0] === 'undefined';
}());

if (!replaceReportsGroupsCorrectly) {
    StringPrototype.replace = function replace(searchValue, replaceValue) {
        var isFn = isFunction(replaceValue);
        var hasCapturingGroups = isRegex(searchValue) && (/\)[*?]/).test(searchValue.source);
        if (!isFn || !hasCapturingGroups) {
            return str_replace.call(this, searchValue, replaceValue);
        } else {
            var wrappedReplaceValue = function (match) {
                var length = arguments.length;
                var originalLastIndex = searchValue.lastIndex;
                searchValue.lastIndex = 0;
                var args = searchValue.exec(match) || [];
                searchValue.lastIndex = originalLastIndex;
                args.push(arguments[length - 2], arguments[length - 1]);
                return replaceValue.apply(this, args);
            };
            return str_replace.call(this, searchValue, wrappedReplaceValue);
        }
    };
}

// ECMA-262, 3rd B.2.3
// Not an ECMAScript standard, although ECMAScript 3rd Edition has a
// non-normative section suggesting uniform semantics and it should be
// normalized across all browsers
// [bugfix, IE lt 9] IE < 9 substr() with negative value not working in IE
var string_substr = StringPrototype.substr;
var hasNegativeSubstrBug = ''.substr && '0b'.substr(-1) !== 'b';
defineProperties(StringPrototype, {
    substr: function substr(start, length) {
        return string_substr.call(
            this,
            start < 0 ? ((start = this.length + start) < 0 ? 0 : start) : start,
            length
        );
    }
}, hasNegativeSubstrBug);

// ES5 15.5.4.20
// whitespace from: http://es5.github.io/#x15.5.4.20
var ws = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' +
    '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028' +
    '\u2029\uFEFF';
var zeroWidth = '\u200b';
var wsRegexChars = '[' + ws + ']';
var trimBeginRegexp = new RegExp('^' + wsRegexChars + wsRegexChars + '*');
var trimEndRegexp = new RegExp(wsRegexChars + wsRegexChars + '*$');
var hasTrimWhitespaceBug = StringPrototype.trim && (ws.trim() || !zeroWidth.trim());
defineProperties(StringPrototype, {
    // http://blog.stevenlevithan.com/archives/faster-trim-javascript
    // http://perfectionkills.com/whitespace-deviations/
    trim: function trim() {
        if (typeof this === 'undefined' || this === null) {
            throw new TypeError("can't convert " + this + ' to object');
        }
        return String(this).replace(trimBeginRegexp, '').replace(trimEndRegexp, '');
    }
}, hasTrimWhitespaceBug);

// ES-5 15.1.2.2
if (parseInt(ws + '08') !== 8 || parseInt(ws + '0x16') !== 22) {
    /*global parseInt: true */
    parseInt = (function (origParseInt) {
        var hexRegex = /^0[xX]/;
        return function parseIntES5(str, radix) {
            str = String(str).trim();
            if (!Number(radix)) {
                radix = hexRegex.test(str) ? 16 : 10;
            }
            return origParseInt(str, radix);
        };
    }(parseInt));
}

}));

/* ../node_modules/es5-shim/es5-shim.js end */

/* ../libs/jquery.ba-throttle-debounce.js begin */
/*!
 * jQuery throttle / debounce - v1.1 - 3/7/2010
 * http://benalman.com/projects/jquery-throttle-debounce-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

// Script: jQuery throttle / debounce: Sometimes, less is more!
//
// *Version: 1.1, Last updated: 3/7/2010*
// 
// Project Home - http://benalman.com/projects/jquery-throttle-debounce-plugin/
// GitHub       - http://github.com/cowboy/jquery-throttle-debounce/
// Source       - http://github.com/cowboy/jquery-throttle-debounce/raw/master/jquery.ba-throttle-debounce.js
// (Minified)   - http://github.com/cowboy/jquery-throttle-debounce/raw/master/jquery.ba-throttle-debounce.min.js (0.7kb)
// 
// About: License
// 
// Copyright (c) 2010 "Cowboy" Ben Alman,
// Dual licensed under the MIT and GPL licenses.
// http://benalman.com/about/license/
// 
// About: Examples
// 
// These working examples, complete with fully commented code, illustrate a few
// ways in which this plugin can be used.
// 
// Throttle - http://benalman.com/code/projects/jquery-throttle-debounce/examples/throttle/
// Debounce - http://benalman.com/code/projects/jquery-throttle-debounce/examples/debounce/
// 
// About: Support and Testing
// 
// Information about what version or versions of jQuery this plugin has been
// tested with, what browsers it has been tested in, and where the unit tests
// reside (so you can test it yourself).
// 
// jQuery Versions - none, 1.3.2, 1.4.2
// Browsers Tested - Internet Explorer 6-8, Firefox 2-3.6, Safari 3-4, Chrome 4-5, Opera 9.6-10.1.
// Unit Tests      - http://benalman.com/code/projects/jquery-throttle-debounce/unit/
// 
// About: Release History
// 
// 1.1 - (3/7/2010) Fixed a bug in <jQuery.throttle> where trailing callbacks
//       executed later than they should. Reworked a fair amount of internal
//       logic as well.
// 1.0 - (3/6/2010) Initial release as a stand-alone project. Migrated over
//       from jquery-misc repo v0.4 to jquery-throttle repo v1.0, added the
//       no_trailing throttle parameter and debounce functionality.
// 
// Topic: Note for non-jQuery users
// 
// jQuery isn't actually required for this plugin, because nothing internal
// uses any jQuery methods or properties. jQuery is just used as a namespace
// under which these methods can exist.
// 
// Since jQuery isn't actually required for this plugin, if jQuery doesn't exist
// when this plugin is loaded, the method described below will be created in
// the `Cowboy` namespace. Usage will be exactly the same, but instead of
// $.method() or jQuery.method(), you'll need to use Cowboy.method().

(function(window,undefined){
  '$:nomunge'; // Used by YUI compressor.
  
  // Since jQuery really isn't required for this plugin, use `jQuery` as the
  // namespace only if it already exists, otherwise use the `Cowboy` namespace,
  // creating it if necessary.
  var $ = window.jQuery || window.Cowboy || ( window.Cowboy = {} ),
    
    // Internal method reference.
    jq_throttle;
  
  // Method: jQuery.throttle
  // 
  // Throttle execution of a function. Especially useful for rate limiting
  // execution of handlers on events like resize and scroll. If you want to
  // rate-limit execution of a function to a single time, see the
  // <jQuery.debounce> method.
  // 
  // In this visualization, | is a throttled-function call and X is the actual
  // callback execution:
  // 
  // > Throttled with `no_trailing` specified as false or unspecified:
  // > ||||||||||||||||||||||||| (pause) |||||||||||||||||||||||||
  // > X    X    X    X    X    X        X    X    X    X    X    X
  // > 
  // > Throttled with `no_trailing` specified as true:
  // > ||||||||||||||||||||||||| (pause) |||||||||||||||||||||||||
  // > X    X    X    X    X             X    X    X    X    X
  // 
  // Usage:
  // 
  // > var throttled = jQuery.throttle( delay, [ no_trailing, ] callback );
  // > 
  // > jQuery('selector').bind( 'someevent', throttled );
  // > jQuery('selector').unbind( 'someevent', throttled );
  // 
  // This also works in jQuery 1.4+:
  // 
  // > jQuery('selector').bind( 'someevent', jQuery.throttle( delay, [ no_trailing, ] callback ) );
  // > jQuery('selector').unbind( 'someevent', callback );
  // 
  // Arguments:
  // 
  //  delay - (Number) A zero-or-greater delay in milliseconds. For event
  //    callbacks, values around 100 or 250 (or even higher) are most useful.
  //  no_trailing - (Boolean) Optional, defaults to false. If no_trailing is
  //    true, callback will only execute every `delay` milliseconds while the
  //    throttled-function is being called. If no_trailing is false or
  //    unspecified, callback will be executed one final time after the last
  //    throttled-function call. (After the throttled-function has not been
  //    called for `delay` milliseconds, the internal counter is reset)
  //  callback - (Function) A function to be executed after delay milliseconds.
  //    The `this` context and all arguments are passed through, as-is, to
  //    `callback` when the throttled-function is executed.
  // 
  // Returns:
  // 
  //  (Function) A new, throttled, function.
  
  $.throttle = jq_throttle = function( delay, no_trailing, callback, debounce_mode ) {
    // After wrapper has stopped being called, this timeout ensures that
    // `callback` is executed at the proper times in `throttle` and `end`
    // debounce modes.
    var timeout_id,
      
      // Keep track of the last time `callback` was executed.
      last_exec = 0;
    
    // `no_trailing` defaults to falsy.
    if ( typeof no_trailing !== 'boolean' ) {
      debounce_mode = callback;
      callback = no_trailing;
      no_trailing = undefined;
    }
    
    // The `wrapper` function encapsulates all of the throttling / debouncing
    // functionality and when executed will limit the rate at which `callback`
    // is executed.
    function wrapper() {
      var that = this,
        elapsed = +new Date() - last_exec,
        args = arguments;
      
      // Execute `callback` and update the `last_exec` timestamp.
      function exec() {
        last_exec = +new Date();
        callback.apply( that, args );
      };
      
      // If `debounce_mode` is true (at_begin) this is used to clear the flag
      // to allow future `callback` executions.
      function clear() {
        timeout_id = undefined;
      };
      
      if ( debounce_mode && !timeout_id ) {
        // Since `wrapper` is being called for the first time and
        // `debounce_mode` is true (at_begin), execute `callback`.
        exec();
      }
      
      // Clear any existing timeout.
      timeout_id && clearTimeout( timeout_id );
      
      if ( debounce_mode === undefined && elapsed > delay ) {
        // In throttle mode, if `delay` time has been exceeded, execute
        // `callback`.
        exec();
        
      } else if ( no_trailing !== true ) {
        // In trailing throttle mode, since `delay` time has not been
        // exceeded, schedule `callback` to execute `delay` ms after most
        // recent execution.
        // 
        // If `debounce_mode` is true (at_begin), schedule `clear` to execute
        // after `delay` ms.
        // 
        // If `debounce_mode` is false (at end), schedule `callback` to
        // execute after `delay` ms.
        timeout_id = setTimeout( debounce_mode ? clear : exec, debounce_mode === undefined ? delay - elapsed : delay );
      }
    };
    
    // Set the guid of `wrapper` function to the same of original callback, so
    // it can be removed in jQuery 1.4+ .unbind or .die by using the original
    // callback as a reference.
    if ( $.guid ) {
      wrapper.guid = callback.guid = callback.guid || $.guid++;
    }
    
    // Return the wrapper function.
    return wrapper;
  };
  
  // Method: jQuery.debounce
  // 
  // Debounce execution of a function. Debouncing, unlike throttling,
  // guarantees that a function is only executed a single time, either at the
  // very beginning of a series of calls, or at the very end. If you want to
  // simply rate-limit execution of a function, see the <jQuery.throttle>
  // method.
  // 
  // In this visualization, | is a debounced-function call and X is the actual
  // callback execution:
  // 
  // > Debounced with `at_begin` specified as false or unspecified:
  // > ||||||||||||||||||||||||| (pause) |||||||||||||||||||||||||
  // >                          X                                 X
  // > 
  // > Debounced with `at_begin` specified as true:
  // > ||||||||||||||||||||||||| (pause) |||||||||||||||||||||||||
  // > X                                 X
  // 
  // Usage:
  // 
  // > var debounced = jQuery.debounce( delay, [ at_begin, ] callback );
  // > 
  // > jQuery('selector').bind( 'someevent', debounced );
  // > jQuery('selector').unbind( 'someevent', debounced );
  // 
  // This also works in jQuery 1.4+:
  // 
  // > jQuery('selector').bind( 'someevent', jQuery.debounce( delay, [ at_begin, ] callback ) );
  // > jQuery('selector').unbind( 'someevent', callback );
  // 
  // Arguments:
  // 
  //  delay - (Number) A zero-or-greater delay in milliseconds. For event
  //    callbacks, values around 100 or 250 (or even higher) are most useful.
  //  at_begin - (Boolean) Optional, defaults to false. If at_begin is false or
  //    unspecified, callback will only be executed `delay` milliseconds after
  //    the last debounced-function call. If at_begin is true, callback will be
  //    executed only at the first debounced-function call. (After the
  //    throttled-function has not been called for `delay` milliseconds, the
  //    internal counter is reset)
  //  callback - (Function) A function to be executed after delay milliseconds.
  //    The `this` context and all arguments are passed through, as-is, to
  //    `callback` when the debounced-function is executed.
  // 
  // Returns:
  // 
  //  (Function) A new, debounced, function.
  
  $.debounce = function( delay, at_begin, callback ) {
    return callback === undefined
      ? jq_throttle( delay, at_begin, false )
      : jq_throttle( delay, callback, at_begin !== false );
  };
  
})(this);

/* ../libs/jquery.ba-throttle-debounce.js end */

/* ../libs/nanoblocks.js begin */
/**
 *
 * warning!
 * achtung!
 * увага!
 * внимание!
 *
 * Это автоматически сгенеренный файл. Не редактируйте его самостоятельно.
 *
 */
//  nanoblocks
//  ==========

var nb = {};

/**
 * IE < 9
 * @type {Boolean}
 * @constant
 */
nb.IE_LT9 = Boolean(document['documentMode'] && document['documentMode'] < 9);

//  ---------------------------------------------------------------------------------------------------------------  //

//  Минимальный common.js
//  ---------------------

//  Наследование:
//
//      function Foo() {}
//      Foo.prototype.foo = function() {
//          console.log('foo');
//      };
//
//      function Bar() {}
//      nb.inherit(Bar, Foo);
//
//      var bar = Bar();
//      bar.foo();
//
nb.inherit = function(child, parent) {
    var F = function() {
    };
    F.prototype = parent.prototype;
    child.prototype = new F();
    child.prototype.constructor = child;
};

//  Расширение объекта свойствами другого объекта(ов):
//
//      var foo = { foo: 42 };
//      nb.extend( foo, { bar: 24 }, { boo: 66 } );
//
nb.extend = function(dest) {
    var srcs = [].slice.call(arguments, 1);

    for (var i = 0, l = srcs.length; i < l; i++) {
        var src = srcs[i];
        for (var key in src) {
            dest[key] = src[key];
        }
    }

    return dest;
};

//  nb.node
//  -------

var nb = nb || {};

(function() {

    nb.node = {};

//  ---------------------------------------------------------------------------------------------------------------  //

    nb.node.data = function(node, key, value) {
        //  Возвращаем или меняем data-атрибут.
        if (key) {
            if (value !== undefined) {
                node.setAttribute('data-nb-' + key, value);
            } else {
                return parseValue(node.getAttribute('data-nb-' + key) || '');
            }
        } else {
            //  Возвращаем все data-атрибуты.
            var data = {};

            var attrs = node.attributes;
            var r;
            for (var i = 0, l = attrs.length; i < l; i++) {
                var attr = attrs[i];
                if (( r = /^data-nb-(.+)/.exec(attr.name) )) {
                    data[ r[1] ] = parseValue(attr.value);
                }
            }

            return data;
        }

        function parseValue(value) {
            var ch = value.charAt(0);
            return (ch === '[' || ch === '{') ? eval('(' + value + ')') : value;
        }
    };

//  ---------------------------------------------------------------------------------------------------------------  //

//  Работа с модификаторами.

//  Получить модификатор.
    nb.node.getMod = function(node, name) {
        return nb.node.setMod(node, name);
    };

    var modCache = {};

//  Установить/получить/удалить модификатор.
    nb.node.setMod = function(node, name, value) {
        //  Например, name равно popup_to. В bem-терминах это значит, что имя блока popup, а модификатора to.
        //  Ищем строки вида popup_to_left и popup_to (в этом случае, значение модификатора -- true).
        var rx = modCache[name] || (( modCache[name] = RegExp('(?:^|\\s+)' + name + '(?:_([\\w-]+))?(?:$|\\s+)') ));

        var className = node.className;

        if (value === undefined) {
            //  Получаем модификатор.

            var r = rx.exec(className);
            //  Если !r (т.е. r === null), значит модификатора нет вообще, возвращаем '' (FIXME: или нужно возвращать null?).
            //  Если r[1] === undefined, это значит модификатор со значением true.
            return (r) ? ( (r[1] === undefined) ? true : r[1] ) : '';

        } else {
            //  Удаляем старый модификатор, если он там был.
            className = className.replace(rx, ' ').trim();

            //  Тут недостаточно просто if (value) { ... },
            //  потому что value может быть нулем.
            if (value !== false && value !== '') {
                //  Устанавливаем новое значение.
                //  При этом, если значение true, то просто не добавляем часть после _.
                className += ' ' + name + ( (value === true) ? '' : '_' + value );
            }
            node.className = className;

        }
    };

//  Удалить модификатор.
    nb.node.delMod = function(node, name) {
        nb.node.setMod(node, name, false);
    };

//  ---------------------------------------------------------------------------------------------------------------  //

})();

(function() {

//  ---------------------------------------------------------------------------------------------------------------  //

//  Информация про все объявленные блоки.
    var _factories = {};

//  Список всех уже повешенных на document событий.
    var _docEvents = {};

//  Список всех поддерживаемых DOM-событий.
    var _domEvents = [
        'click',
        'dblclick',
        'mouseup',
        'mousedown',
        'keydown',
        'keypress',
        'keyup',
        'input',
        'change',

        // local: вешаются напрямую на ноду блока / подноду блока по селектору
        'blur',

        /*
         FIXME: Сейчас эти события называются mouseover и mouseout.
         'mouseenter',
         'mouseleave',
         */
        'mouseover',
        'mouseout',
        'focusin',
        'focusout'
    ];

//  Regexp для строк вида 'click', 'click .foo'.
    var _rx_domEvents = new RegExp('^(' + _domEvents.join('|') + ')\\b\\s*(.*)?$');

//  Автоинкрементный id для блоков, у которых нет атрибута id.
    var _id = 0;

//  Кэш проинициализированных блоков.
//  По id ноды хранится хэш с блоками на ноде.
//  Пример: { 'button-id': { 'popup-toggler': {}, 'counter': {} } }
    var _cache = {};

//  Получает название блока по ноде.
    var _getName = function(node) {
        var _data_nb = node.getAttribute('data-nb');
        return _data_nb ? _data_nb.trim().replace(/\s+/g, ' ') : _data_nb;
    };

    var _getNames = function(name) {
        return name.split(/\s+/);
    };

//  ---------------------------------------------------------------------------------------------------------------  //

//  Block
//  --------

//  Базовый класс для блоков. В явном виде не используется.
//  Все реальные блоки наследуются от него при помощи функции nb.define.

    var Block = function() {
    };

//  ---------------------------------------------------------------------------------------------------------------  //

//  Публичные методы и свойства блоков
//  ----------------------------------

//  Публичные свойства:
//
//    * name -- имя блока.
//    * node -- html-нода, на которой был проинициализирован блок.

//  Публичные методы у Block:
//
//    * on, off, trigger        -- методы для работы с событиями (кастомными и DOM).
//    * nbdata                  -- получает/меняет/удаляет data-nb-атрибуты блока.
//    * show, hide              -- показывает/прячет блок.
//    * getMod, setMod, delMod  -- методы для работы с модификаторами.

//  ---------------------------------------------------------------------------------------------------------------  //

//  Сам конструктор пустой для удобства наследования,
//  поэтому вся реальная инициализация тут.
    Block.prototype.__init = function(node) {
        //  Нода блока.
        this.node = node;

        //  Обработчики кастомных событий.
        this.__handlers = {};

        //  Развешиваем обработчики кастомных событий.
        this.__bindEvents();

        //  Возможность что-то сделать сразу после инициализации.
        this.trigger('init');

        //  Отправляем в "космос" сообщение, что блок проинициализирован.
        //  Проверка space нужна для того, чтобы при создании самого space не происходило ошибки.
        //  FIXME: Сделать поддержку специального атрибута, например, data-nb-inited-key, который, если есть,
        //  используется вместо id. Нужно для нескольких одинаковых блоков (у которых id, очевидно, разные).
        if (space) {
            nb.trigger('inited:' + this.id, this);
        }
    };

//  ---------------------------------------------------------------------------------------------------------------  //

//  Вешаем кастомные (не DOM) события на экземпляр блока.
    Block.prototype.__bindEvents = function() {
        var that = this;

        //  Информация про события блока лежат в его factory.
        var mixinEvents = Factory.get(this.name).events;

        //  Вешаем события для каждого миксина отдельно.
        for (var i = 0, l = mixinEvents.length; i < l; i++) {
            var events = mixinEvents[i].custom;
            var local = mixinEvents[i].local;

            for (var event in events) {
                (function(handlers) {
                    that.__bindCustomEvent(event, function(e, params) {

                        //  Перебираем обработчики справа налево: самый правый это обработчик самого блока,
                        //  затем родительский и т.д.
                        for (var i = handlers.length; i--;) {
                            var r = handlers[i].call(that, e, params);
                            //  false означает, что нужно прекратить обработку и не баблиться дальше,
                            //  а null -- что просто прекратить обработку (т.е. не вызывать унаследованные обработчики).
                            if (r === false || r === null) {
                                return r;
                            }
                        }
                    });
                })(events[event]);
            }

            //  Навешиваем локальные обработчики (напрямую на ноды).
            //  Для этого вначале собираем строки вида `event selector`
            for (var event in local) {
                for (var selector in local[event]) {
                    var suffix = (selector || '').length ? (' ' + selector) : '';
                    var eventDefinition = event + suffix;
                    var handlers = local[event][selector];
                    for (var i = 0; i < handlers.length; i++) {
                        (function(handler) {
                            that.on(eventDefinition, function() {
                                handler.apply(that, arguments);
                            });
                        }(handlers[i]));
                    }
                }
            }
        }
    };

//  ---------------------------------------------------------------------------------------------------------------  //

//  Удаляем блок.
    Block.prototype.nbdestroy = function() {

        var mixinEvents = Factory.get(this.name).events;

        for (var i = 0, l = mixinEvents.length; i < l; i++) {
            //  Снимаем все кастомные события.
            for (var event in mixinEvents[i].custom) {
                this.off(event);
            }
            //  Снимаем все локальные события.
            for (var event in mixinEvents[i].local) {
                this.off(event);
            }
        }

        //  Удалем блок из кэша.
        _cache[this.id] = null;

    };

//  ---------------------------------------------------------------------------------------------------------------  //

//  Работа с событиями
//  ------------------

//  Каждый блок реализует простейший pub/sub + возможность вешать DOM-события.

//  Возвращает список обработчиков события name.
//  Если еще ни одного обработчика не забинжено, возвращает (и сохраняет) пустой список.
    Block.prototype.__getHandlers = function(name) {
        var handlers = this.__handlers;

        return handlers[name] || (( handlers[name] = [] ));
    };

//  Подписываем обработчик handler на событие name.
//  При этом name может быть вида:
//
//    * 'click'         -- обычное DOM-событие.
//    * 'click .foo'    -- DOM-событие с уточняющим селектором.
//    * 'init'          -- кастомное событие.
//
//  DOM-события вешаются на ноду блока.
//  Помимо этого, есть еще возможность подписаться на DOM-события,
//  повешенные на document (см. nb.define).
//
    Block.prototype.on = function(name, handler) {
        var r = _rx_domEvents.exec(name);
        if (r) {
            //  DOM-событие.

            //  В r[1] тип события (например, click), в r[2] необязательный селектор.
            $(this.node).on(r[1], r[2] || '', handler);
        } else {
            //  Кастомное событие.

            this.__bindCustomEvent(name, handler);
        }

        return handler;
    };

    Block.prototype.__bindCustomEvent = function(name, handler) {
        this.__getHandlers(name).push(handler);
    };

//  Отписываем обработчик handler от события name.
//  Если не передать handler, то удалятся вообще все обработчики события name.
//  Типы событий такие же, как и в on().
    Block.prototype.off = function(name, handler) {
        var r = _rx_domEvents.exec(name);
        if (r) {
            //  DOM-событие.

            $(this.node).off(r[1], r[2] || '', handler);
        } else {
            //  Кастомное событие.

            if (handler) {
                var handlers = this.__getHandlers(name);
                //  Ищем этот хэндлер среди уже забинженных обработчиков этого события.
                var i = handlers.indexOf(handler);

                //  Нашли и удаляем этот обработчик.
                if (i !== -1) {
                    handlers.splice(i, 1);
                }
            } else {
                //  Удаляем всех обработчиков этого события.
                this.__handlers[name] = null;
            }
        }
    };

//  "Генерим" кастомное событие name.
//  Т.е. вызываем по очереди (в порядке подписки) все обработчики события name.
//  В каждый передаем name и params.
    Block.prototype.trigger = function(name) {
        //  Копируем список хэндлеров. Если вдруг внутри какого-то обработчика будет вызван off(),
        //  то мы не потеряем вызов следующего обработчика.
        var handlers = this.__getHandlers(arguments[0]).slice();

        for (var i = 0, l = handlers.length; i < l; i++) {
            //  Вызываем обработчик в контексте this.
            handlers[i].apply(this, arguments);
        }
    };

//  ---------------------------------------------------------------------------------------------------------------  //

//  Метод возвращает или устанавливает значение data-атрибута блока.
//  Блок имеет доступ (через этот метод) только к data-атрибутам с префиксом nb-.
//  Как следствие, атрибут data-nb недоступен -- он определяет тип блока
//  и менять его не рекомендуется в любом случае.
//
//  Если вызвать метод без аргументов, то он вернет объект со всеми data-атрибутами.
//
    Block.prototype.nbdata = function(key, value) {
        return nb.node.data(this.node, key, value);
    };

//  ---------------------------------------------------------------------------------------------------------------  //

//  Показываем блок.
    Block.prototype.show = function() {
        $(this.node).removeClass('nb-is-hidden');
        this.trigger('show');
    };

//  Прячем блок.
    Block.prototype.hide = function() {
        $(this.node).addClass('nb-is-hidden');
        this.trigger('hide');
    };

//  ---------------------------------------------------------------------------------------------------------------  //

//  Работа с модификаторами
//  -----------------------

//  Получить модификатор.
    Block.prototype.getMod = function(name) {
        return nb.node.setMod(this.node, name);
    };

//  Установить модификатор.
    Block.prototype.setMod = function(name, value) {
        nb.node.setMod(this.node, name, value);
    };

//  Удалить модификатор.
    Block.prototype.delMod = function(name) {
        nb.node.setMod(this.node, name, false);
    };

//  ---------------------------------------------------------------------------------------------------------------  //

//  Возвращает массив блоков, находящихся внутри блока.
//  Вариант для применения:
//
//      block.children.forEach(function(block) {
//          block.trigger('init');
//      });
//
    Block.prototype.children = function() {
        var children = [];

        //  Ищем все ноды с атрибутом data-nb. Это потенциальные блоки.
        var $nodes = $(this.node).find('[data-nb]');
        for (var i = 0, l = $nodes.length; i < l; i++) {
            children = children.concat(nb.blocks($nodes[i]));
        }

        return children;
    };

//  Определение  модуля, в котором находится шаблон YATE для блока
    Block.prototype.getYateModuleName = function() {
        return 'main';
    };

//  Чтобы можно было вызывать методы базового класса.
    nb.Block = Block;

//  ---------------------------------------------------------------------------------------------------------------  //

//  Factory
//  -------

//  Для каждого типа блока ( == вызова nb.define) создается специальный объект,
//  который хранит в себе информацию про конструктор и события, на которые подписывается блок.
//  Кроме того, factory умеет создавать экземпляры нужных блоков.

//  Конструктор.
    var Factory = function(name, ctor, events) {
        this.name = name;

        ctor.prototype.name = name;
        this.ctor = ctor;

        this.events = this._prepareEvents(events);
    };

//  ---------------------------------------------------------------------------------------------------------------  //

//  Делим события на DOM и кастомные и создаем объект this.events,
//  в котором хранится информация про события и их обработчики,
//  с примерно такой структурой:
//
//      //  Каждый элемент массива соответствует одному миксину.
//      //  В случае простых блоков в массиве будет ровно один элемент.
//      [
//          {
//              //  DOM-события.
//              dom: {
//                  //  Тип DOM-события.
//                  click: {
//                      //  Селектор DOM-события (может быть пустой строкой).
//                      '': [
//                          //  Этот массив -- это обработчики для блока и его предков.
//                          //  Для "простых" блоков (без наследования), в массиве всегда один хэндлер.
//                          handler1,
//                          handler2,
//                          ...
//                      ],
//                      '.foo': [ handler3 ],
//                      ...
//                  },
//                  ...
//              },
//              //  Кастомные события.
//              custom: {
//                  'open': [ handler4, handler5 ],
//                  ...
//              }
//          }
//      ]
//
//  В общем есть два типа комбинирования классов:
//
//    * Миксины. Каждый миксин добавляет один объект во внешний массив.
//    * Расширение. Каждое расширение добавляет обработчики во внешние массивы.
//
    Factory.prototype._prepareEvents = function(events) {
        events = events || {};

        var proto = this.ctor.prototype;

        //  Делим события на DOM и кастомные.
        var dom = {};
        var custom = {};
        var local = {};

        for (var event in events) {
            //  Матчим строки вида 'click' или 'click .foo'.
            var r = _rx_domEvents.exec(event);
            var handlers, key;
            if (r) {
                //  Тип DOM-события, например, click.
                var type = r[1];

                if (type === 'blur') {
                    //  Тут те события, которые нужно слушать на конкретной ноде.
                    handlers = local[type] || (( local[type] = {} ));
                } else {
                    //  Тут все события, которые можно слушать на документе.
                    handlers = dom[type] || (( dom[type] = {} ));
                }

                //  Селектор.
                key = r[2] || '';

            } else {
                handlers = custom;
                key = event;
            }

            var handler = events[event];

            //  handlers и key определяют, где именно нужно работать с handler.
            //  Скажем, если event это 'click .foo' или 'init', то это будут соответственно
            //  dom['click']['.foo'] и custom['init'].

            //  Строки превращаем в "ссылку" на метод.
            //  При этом, даже если мы изменим прототип (при наследовании, например),
            //  вызываться будут все равно правильные методы.
            if (typeof handler === 'string') {
                handler = proto[handler];
            }

            if (handler === null) {
                //  @doc
                //  Особый случай, бывает только при наследовании блоков.
                //  null означает, что нужно игнорировать родительские обработчики события.
                handlers[key] = null;
            } else {
                //  Просто добавляем еще один обработчик.
                handlers = handlers[key] || (( handlers[key] = [] ));
                handlers.push(handler);
            }

        }

        //  Для всех типов DOM-событий этого класса вешаем глобальный обработчик на document.
        for (var type in dom) {
            //  При этом, запоминаем, что один раз мы его уже повесили и повторно не вешаем.
            if (!_docEvents[type]) {
                $(document).on(type, function(e) {
                    //  Все обработчики вызывают один чудо-метод:

                    //  https://github.com/nanoblocks/nanoblocks/issues/48
                    //  Цельнотянуто из jquery:
                    //
                    //  Make sure we avoid non-left-click bubbling in Firefox (#3861)
                    if (e.button && e.type === 'click') {
                        return;
                    }

                    return Factory._onevent(e);
                });

                _docEvents[type] = true;
            }
        }

        //  На локальные события блок подписывается только после создания, потому что только в этот момент создаются настоящие ноды.

        //  Возвращаем структуру, которая будет сохранена в this.events.
        return [
            {
                dom: dom,
                custom: custom,
                local: local
            }
        ];

    };

//  ---------------------------------------------------------------------------------------------------------------  //

//  Создаем экземпляр соответствующего класса на переданной ноде node.
//  Опциональный параметр events позволяет сразу навесить на экземпляр блока
//  дополнительных событий (помимо событий, объявленных в nb.define).
    Factory.prototype.create = function(node, events) {

        var id = node.getAttribute('id');
        if (!id) {
            //  У блока нет атрибута id. Создаем его, генерим уникальный id.
            //  В следующий раз блок можно будет достать из кэша при по этому id.
            id = 'nb-' + _id++;
            node.setAttribute('id', id);
        }

        //  Инициализируем кэш для блоков ноды, если нужно.
        if (!_cache[id]) {
            _cache[id] = {};

            //  FIXME: Что будет, если node.getAttribute('data-nb') !== this.name ?
            //  FIXME: для ручных вызовов nb.block() надо будет дописывать имена блоков в атрибут data-nb
            //  У ноды каждого блока должен быть атрибут data-nb.
            if (_getName(node) === null) {
                node.setAttribute('data-nb', this.name);
            }
        }

        //  Создаём блок текущей фабрики для переданной ноды.
        if (!_cache[id][this.name]) {

            var block = new this.ctor();

            //  Инициализируем блок.
            block.id = id;
            block.__init(node);

            //  Если переданы events, навешиваем их.
            if (events) {
                for (var event in events) {
                    block.on(event, events[event]);
                }
            }

            //  Кэшируем блок. Последующие вызовы nb.block на этой же ноде
            //  достанут блок из кэша.
            _cache[id][this.name] = block;
        }

        return _cache[id][this.name];
    };

//  ---------------------------------------------------------------------------------------------------------------  //

//  Наследуем события.
//  При наследовании классов необходимо склеить список обработчиков класса
//  с соответствующим списком обработчиков родителя.
//
//      {
//          dom: {
//              'click': {
//                  '.foo': [ .... ] // handlers
//                  ...
//
//  и
//
//      {
//          custom: {
//              'init': [ ... ] // handlers
//
//
    Factory.prototype._extendEvents = function(base) {
        //  Это всегда "простой" класс (т.е. не миксин), так что всегда берем нулевой элемент.
        var t_dom = this.events[0].dom;
        var b_dom = base.events[0].dom;

        //  Конкатим обработчиков DOM-событий.
        for (var event in b_dom) {
            extend(t_dom[event] || (( t_dom[event] = {} )), b_dom[event]);
        }

        //  Конкатим обработчиков кастомных событий.
        extend(this.events[0].custom, base.events[0].custom);

        function extend(dest, src) {
            for (var key in src) {
                var s_handlers = src[key];
                var d_handlers = dest[key];

                //  Если встречаем null, это значит, что нужно все родительские обработчики выкинуть.
                dest[key] = (d_handlers === null) ? [] : s_handlers.concat(d_handlers || []);
            }
        }

    };

//  ---------------------------------------------------------------------------------------------------------------  //

//  Единый live-обработчик всех DOM-событий.
    Factory._onevent = function(e) {
        var type = e.type;

        //  Нода, на которой произошло событие.
        var origNode = e.target;

        //  Для mouseover/mouseout событий нужна особая обработка.
        var isHover = (type === 'mouseover' || type === 'mouseout');
        //  В случае isHover, это нода, из которой (в которую) переместили указатель мыши.
        var fromNode = e.relatedTarget;

        //  Эти переменные условно "глобальные".
        //  Они все используются нижеописанными функциями, которые имеют побочные эффекты.
        //
        //  Очередной отрезок (см. комментарии ниже).
        var nodes;
        //  Длина массива nodes.
        var n;
        //  Массив с соответствующими $(node) для nodes.
        var $nodes;
        //  Текущая нода блока.
        var blockNode;
        //  Текущее имя блока.
        var name;
        //  Текущая фабрика блоков.
        var factory;

        //  Мы проходим вверх по DOM'у, начиная от e.target до самого верха (<html>).
        //  Пытаемся найти ближайший блок, внутри которого случилось событие и
        //  у которого есть событие, подходящее для текущей ноды.

        //  Переменная цикла.
        var node = origNode;

        //  Оригинальная нода тоже имеет право на события!
        nodes = [];
        $nodes = [];
        n = nodes.length;

        while (1) {
            //  Цепочку нод от e.target до <html> мы разбиваем на отрезки,
            //  по границам блоков. Например:
            //
            //      <html> <!-- node5 -->
            //          <div data-nb="foo"> <!-- node4 -->
            //              <div> <!-- node3 -->
            //                  <div data-nb="bar"> <!-- node2 -->
            //                      <div> <!-- node1 -->
            //                          <span>Hello</span> <!-- node0 -->
            //
            //  Событие случилось на node0 (она же e.target).
            //  Тогда первый отрезок это [ node0, node1, node2 ], второй [ node3, node4 ], ...
            //
            //  Функция findBlockNodes возращает true, если очередной отрезок удалось найти,
            //  и false, если дошли до самого верха, не найдя больше нод блоков.
            //  При этом, она устанавливает значения переменных nodes, n, $nodes, blockNode, name, factory.
            if (!findBlockNodes()) {
                //  Все, больше никаких блоков выше node нет.
                break;
            }

            var names = _getNames(name);
            var r = true;

            for (var j = 0; j < names.length; j++) {

                //  Название текущего проверяемого блока.
                var blockName = names[j];

                //  Мы собрали в nodes все ноды внутри блока с именем name.
                factory = Factory.get(blockName);

                //  Событие может случится до того, как мы определим все наноблоки.
                //  пропустим такой блок
                if (!factory) {
                    continue;
                }

                //  Берем все события, на которые подписан этот блок.
                var mixinEvents = factory.events;

                //  Для каждого миксина проверяем все ноды из nodes.
                for (var i = 0, l = mixinEvents.length; i < l; i++) {
                    //  Пытаемся найти подходящее событие для node среди всех событий миксина.
                    if (checkEvents(blockName, mixinEvents[i].dom[type]) === false) {
                        //  Если обработчик вернул false выше текущей ноды обработка события не пойдёт.
                        //  Но на данной ноде событие послушают все блоки.
                        r = false;
                    }
                }
            }

            //  Нашли подходящий блок, один из обработчиков события этого блока вернул false.
            //  Значит все, дальше вверх по DOM'у не идем. Т.е. останавливаем "баблинг".
            if (!r) {
                return false;
            }

            //  В случае hover-события с определенным fromNode можно останавливаться после первой итерации.
            //  fromNode означает, что мышь передвинули с одной ноды в другую.
            //  Как следствие, это событие касается только непосредственно того блока,
            //  внутри которого находится e.target. Потому что остальные блоки обработали этот ховер
            //  во время предыдущего mouseover/mouseout.
            //
            //  А вот в случае, когда fromNode === null (возможно, когда мышь передвинули, например,
            //  с другого окна в центр нашего окна), все блоки, содержащие e.target должны обработать ховер.
            if (fromNode) {
                return;
            }

            //  Догоняем список нод текущей нодой блока.
            nodes.push(node);
            $nodes.push($(node));
            n = nodes.length;

            //  Идем еще выше, в новый блок.
            node = node.parentNode;
        }

        function findBlockNodes() {
            //  Сбрасываем значения на каждой итерации.
            blockNode = null;

            var parent;
            //  Идем по DOM'у вверх, начиная с node и заканчивая первой попавшейся нодой блока (т.е. с атрибутом data-nb).
            //  Условие о наличии parentNode позволяет остановиться на ноде <html>.
            while (( parent = node.parentNode )) {
                if (( name = _getName(node) )) {
                    blockNode = node;
                    break;
                }
                //  При этом в nodes запоминаем только ноды внутри блока.
                nodes.push(node);
                node = parent;
            }

            if (blockNode) {
                if (isHover && fromNode) {
                    //  Мы передвинули указатель мыши с одной ноды на другую.
                    //  Если e.target это и есть нода блока, то внутренних (nodes) нод нет вообще и
                    //  нужно проверить только саму ноду блока. Либо же нужно проверить одну
                    //  внутреннюю ноду (e.target) и ноду блока.
                    nodes = (origNode === blockNode) ? [] : [ origNode ];
                }
                n = nodes.length;

                return true;
            }
        }

        //  Проверяем все ноды из nodes и отдельно blockNode.
        //  blockName название блока, для которого выполняется проверка
        function checkEvents(blockName, events) {
            if (!events) {
                return;
            }

            var R;
            //  Проверяем, матчатся ли ноды какие-нибудь ноды из nodes на какие-нибудь
            //  селекторы из событий блока.
            var node, $node;
            for (var i = 0; i < n; i++) {
                node = nodes[i];
                //  Лениво вычисляем $node.
                $node = $nodes[i] || (( $nodes[i] = $(node) ));

                for (var selector in events) {
                    //  Проверяем, матчится ли нода на селектор.
                    if (
                    //  Во-первых, для внутренних нод блока должен быть селектор и нода должна ему соответствовать.
                        selector && $node.is(selector) &&
                            //  Во-вторых, для ховер-событий нужен отдельный костыль,
                            //  "преобразующий" события mouseover/mouseout в mouseenter/mouseleave.
                            !(
                                //  Если мы пришли из ноды fromNode,
                                isHover && fromNode &&
                                    //  то она должна лежать вне этой ноды.
                                    $.contains(node, fromNode)
                                )
                        ) {
                        //  Вызываем обработчиков событий.
                        var r = doHandlers(node, blockName, events[selector]);
                        if (r === false) {
                            R = r;
                        }
                    }
                }

                //  Стоп "баблинг"! В смысле выше по DOM'у идти не нужно.
                if (R === false) {
                    return R;
                }
            }

            //  Отдельно обрабатываем ситуацию, когда node === blockNode.
            //  В этом случае мы смотрим только события без селекторов.
            //  События с селектором относятся только к нодам строго внутри блока.
            var handlers = events[''];
            //  Опять таки костыль для ховер-событий.
            if (handlers && !( isHover && fromNode && $.contains(blockNode, fromNode))) {
                return doHandlers(blockNode, blockName, handlers);
            }
        }

        function doHandlers(node, blockName, handlers) {
            //  Блок создаем только один раз и только, если мы таки дошли до сюда.
            //  Т.е. если мы нашли подходящее для node событие.
            var block = factory.create(blockNode);

            //  В handlers лежит цепочка обработчиков этого события.
            //  Самый последний обработчик -- это обработчик собственно этого блока.
            //  Перед ним -- обработчик предка и т.д.
            //  Если в nb.define не был указан базовый блок, то длина цепочки равна 1.
            for (var i = handlers.length; i--;) {
                //  В обработчик передаем событие и ноду, на которой он сработал.
                var r = handlers[i].call(block, e, node);
                //  Обработчик вернул false или null, значит оставшиеся обработчики не вызываем.
                //  При этом false означает, что не нужно "баблиться" выше по DOM'у.
                if (r === false) {
                    return false;
                }
                if (r === null) {
                    break;
                }
            }
        }
    };

//  ---------------------------------------------------------------------------------------------------------------  //

//  Достаем класс по имени.
    Factory.get = function(name) {
        return _factories[name];
    };

//  ---------------------------------------------------------------------------------------------------------------  //

//  Интерфейсная часть
//  ------------------

//  Возвращает информацию про то, инициализирован ли блок на ноде.
//  @param {Element} node Нода, для которой выполняется проверка.
//  @param {string=} blockName (optional) Имя блока, созданность которого проверяется.
    nb.hasBlock = function(node, blockName) {
        var id = node.getAttribute('id');
        return !!(id && _cache[id] && (!blockName || _cache[id][blockName]));
    };

//  Если передано название блока, создаётся блок этого типа на ноде. Возвращается созданный блок.
//  Если не передано название блока, создаются все блоки на переданной ноде и возвращается первый из созданных блоков.
//
//      var popup = nb.block( document.getElementById('popup') );
//
    nb.block = function(node, events, blockName) {
        var name = _getName(node);
        if (!name) {
            //  Эта нода не содержит блока. Ничего не делаем.
            return null;
        }

        //  Если указано имя блока - инициализируем и возвращаем только его.
        if (blockName) {
            return Factory.get(blockName).create(node, events);
        }

        //  Инициализируем все блоки на ноде.
        //  Возвращаем первый из списка блоков.
        return nb.blocks(node, events)[0];
    };

//  Метод создает и возвращает все блоки на переданной ноде:
//
//      var popup = nb.blocks( document.getElementById('popup') );
//
    nb.blocks = function(node, events) {
        var name = _getName(node);
        if (!name) {
            return [];
        }

        //  Инициализируем все блоки на ноде.
        //  Возвращаем первый из списка блоков.
        var names = _getNames(name);
        var blocks = [];
        for (var i = 0; i < names.length; i++) {
            blocks.push(Factory.get(names[i]).create(node, events));
        }
        return blocks;
    };

//  Находим ноду по ее id, создаем на ней блок и возвращаем его.
    nb.find = function(id) {
        var node = document.getElementById(id);
        if (node) {
            return nb.block(node);
        }
    };

//  ---------------------------------------------------------------------------------------------------------------  //

//  Метод определяет новый блок (точнее класс):
//
//      nb.define('popup', {
//          //  События, на которые реагирует блок.
//          events: {
//              'click': 'onclick',             //  DOM-событие.
//              'click .close': 'onclose',      //  DOM-событие с уточняющим селектором.
//              'open': 'onopen',               //  Кастомное событие.
//              'close': function() { ... }     //  Обработчик события можно задать строкой-именем метода, либо же функцией.
//              ...
//          },
//
//          //  Дополнительные методы блока.
//          'onclick': function() { ... },
//          ...
//      });
//
    nb.define = function(name, methods, base) {
        if (typeof name !== 'string') {
            //  Анонимный блок.

            //  Сдвигаем параметры.
            base = methods;
            methods = name;
            //  Генерим ему уникальное имя.
            name = 'nb-' + _id++;
        }

        if (base) {
            base = Factory.get(base);
        }

        //  Вытаскиваем из methods информацию про события.
        var events = methods.events;
        //  Оставляем только методы.
        delete methods.events;

        //  Пустой конструктор.
        var ctor = function() {
        };
        //  Наследуемся либо от дефолтного конструктора, либо от указанного базового.
        nb.inherit(ctor, (base) ? base.ctor : Block);
        //  Все, что осталось в methods -- это дополнительные методы блока.
        nb.extend(ctor.prototype, methods);

        var factory = new Factory(name, ctor, events);

        //  Если указан базовый блок, нужно "склеить" события.
        if (base) {
            factory._extendEvents(base);
        }

        //  Сохраняем для дальнейшего применения.
        //  Достать нужную factory можно вызовом Factory.get(name).
        _factories[name] = factory;

        return factory;
    };

//  ---------------------------------------------------------------------------------------------------------------  //

//  Неленивая инициализация.
//  Находим все ноды с классом _init и на каждой из них инициализируем блок.
//  По-дефолту ищем ноды во всем документе, но можно передать ноду,
//  внутри которой будет происходить поиск. Полезно для инициализации динамически
//  созданных блоков.
    nb.init = function(where) {
        where = where || document;

        var nodes = $(where).find('._init').addBack().filter('._init'); // XXX
        for (var i = 0, l = nodes.length; i < l; i++) {
            nb.block(nodes[i]);
        }
    };

//  FIXME метод странный, потому что от него ожидаешь, что он найдёт все блоки внутри ноды и кильнёт их, а он ищет по классу _init только.
//  FIXME тест на то, что подписанные обработчики отписались
    nb.destroy = function(where) {
        where = where || document;

        var nodes = $(where).find('._init').addBack().filter('._init');
        for (var i = 0, l = nodes.length; i < l; i++) {
            var node = nodes[i];
            var id = node.getAttribute('id');
            var blocks = _cache[id];
            if (blocks) {
                for (var name in blocks) {
                    blocks[name].destroy();
                }
            }
        }
    };

//  ---------------------------------------------------------------------------------------------------------------  //

//  Создаем "космос".
//  Физически это пустой блок, созданный на ноде html.
//  Его можно использовать как глобальный канал для отправки сообщений
//  и для навешивания разных live-событий на html.
    var space = nb.define({
        events: {
            'click': function(e) {
                nb.trigger('space:click', e.target);
            }
        }
    }).create(document.getElementsByTagName('html')[0]);

    nb.on = function(name, handler) {
        return space.on(name, handler);
    };

    nb.off = function(name, handler) {
        space.off(name, handler);
    };

    nb.trigger = function(name, params) {
        space.trigger(name, params);
    };

//  ---------------------------------------------------------------------------------------------------------------  //

})();


/* ../libs/nanoblocks.js end */


/* arrow/arrow.js begin */
nb.define('arrow', {
    oninit: function() {
    }
}, 'base');

/* arrow/arrow.js end */

/* common/common.js begin */
/**
 * @class nb.block.Base
 * @augments Block
 */
nb.define('base', {
    events: {
        'init': '_oninit'
    },

    /**
     * @constuctor
     */
    _oninit: function() {
        this.$node = $(this.node);
        if (this.oninit) {
            this.oninit();
        }
    },

    /*!
     * @returns {String} type of block
     */
    getType: function() {
        return this.$node.attr('data-nb');
    }
});

/* common/common.js end */

/* button/button.js begin */
nb.define('button', {

    events: {},

    oninit: function() {
        this.$node.button({
            // set ui button disabled on init
            disabled: this.$node.prop('disabled')
        });
        this.trigger('nb-inited', this);
    },

    /**
     * Set text of the button
     *
     * ```
     *     button.setContent('Hello, world!');
     * ```
     * 
     * @param {String} text - text for the button
     * @fires 'nb-content-set'
     * @return {Object} block for chaining
     */
    setContent: function(text) {
        if (this.$node && this.$node.data('uiButton')) {
            this.$node.find('._nb-button-content').html(text);
            this.trigger('nb-text-set', this);
        }
        return this;
    },

    /**
     * Get text of the button
     *
     * ```
     *     button.setText('Hello, world!');
     *     button.getText(); // --> 'Hello, world!'
     * ```
     * 
     * @return {String} text of the button
     *
     */
    getContent: function() {
        return this.$node.find('._nb-button-content').html();
    },

    /**
     * Set href of the link button
     *
     * ```
     * button.setUrl('yandex.ru');
     * ```
     *
     * @param {String} href - link for the button
     * @fires 'nb-url-set'
     * @return {Object} block for chaining
     */
    setUrl: function(href) {
        this.$node.attr('href', href);
        this.trigger('nb-url-set', this);
        return this;
    },

    /**
     * Get href of the link button
     *
     * ```
     * button.setUrl('yandex.ru');
     * button.getUrl(); // --> yandex.ru
     * ```
     *
     * @return {String} text of the button
     */
    getUrl: function() {
        return this.$node.attr('href');
    },

    /**
     * Disable the button
     *
     * ```
     * button.disable();
     * ```
     *
     * @fires 'nb-disabled'
     * @return {Object} blocks for chaining
     */
    disable: function() {
        if (this.$node && this.$node.data('uiButton')) {
            this.$node.button('disable');
            this._tabindex = this.$node.attr('tabindex');
            this.$node.attr('tabindex', '-1');
            this.$node.addClass('_nb-is-disabled');
            this.trigger('nb-disabled', this);
        }
        return this;
    },

    /**
     * Enables the button
     *
     * ```
     * button.enable();
     * ```
     *
     * @fires 'nb-enabled'
     * @return {Object} blocks for chaining
     */
    enable: function() {
        if (this.$node && this.$node.data('uiButton')) {
            this.$node.button('enable');
            this.$node.attr('tabindex', this._tabindex || '0');
            this.$node.removeClass('_nb-is-disabled');
            this.trigger('nb-enabled', this);
        }
        return this;
    },

    /**
     * Return state of the button
     *
     * ```
     * button.isEnabled(); // --> true (by default)
     *
     * button.disable();
     * button.isEnabled(); // --> false
     * ```
     *
     * @return {Boolean}
     */
    isEnabled: function() {
        return !this.$node.prop("disabled");
    },

    /**
     * Focus the button
     *
     * ```
     * button.focus();
     * ```
     *
     * @fires 'nb-focus'
     * @return {Object} blocks for chaining
     */
    focus: function() {
        if (this.isEnabled()) {
            this.$node.focus();
        }
        this.trigger('nb-focused', this);
        return this;
    },

    /**
     * Blur the button
     *
     * ```
     * button.blur();
     * ```
     *
     * @fires 'nb-blured'
     * @return {Object} blocks for chaining
     */
    blur: function() {
        if (this.isEnabled()) {
            this.$node.blur();
        }
        this.trigger('nb-blured', this);
        return this;
    },

    /**
     * Destroy the button
     *
     * ```
     * button.destroy();
     * ```
     *
     * @fires 'nb-destroyed'
     */
    destroy: function() {
        // вызвали destroy в одном методе, но ссылка на кнопку была сохранена в другом
        // в результате повторный вызов и ошибка в консоли
        if (this.$node && this.$node.data('uiButton')) {
            this.$node.button('destroy');
        }
        this.trigger('nb-destroyed', this);
        this.nbdestroy();
    }
}, 'base');

/* button/button.js end */

/* tooltip/tooltip.js begin */
nb.define('tooltip-jq-toggler', {

    //NOTES: из-за такого определения Factory._onevent постоянно долбится событиями
    // но по другому (mouseeneter/leave) не сделать, потому что они случаться один раз на document
    // как вариант для mouseenter/leave надо делать не $document.on(event), $document.on(event, '.nb')
    events: {
        'mouseover': 'onmouseenter'
    },

    'onmouseenter': function() {
        if (this.$node.hasClass('_nb-is-disabled')) {
            return true;
        }

        var data = this.nbdata()[this.name];

        var params = {
            content: data.content,
            items: '*',
            tooltipClass: "nb-tooltip nb-island _nb-small-fly-island"
        };

        if (data.position) {
            params.position = data.position;
        }

        this.$node.tooltip(params);
        this.$node.tooltip("open");
    }

}, 'base');

/* tooltip/tooltip.js end */

/* checkbox/checkbox.js begin */
/*!
 * @class nb.block.Checkbox
 * @augments nb.block.Base
 */
nb.define('checkbox', {
    events: {
        'change input': 'onchange'
    },

    _onCheckboxChecked: function(evtName, params) {
        if (params.name == this.getName() && params.value != this.getValue()) {
            this.uncheck();
        }
    },

    onchange: function() {
        if (this.$control.prop('checked')) {
            this.check();
        } else {
            this.uncheck();
        }
    },

    /**
     * Init a checkbox
     * @fires 'nb-inited'
     * @constructor
     */
    oninit: function() {
        this.$control = this.$node.find('input[type]');
        this._isChecked = this.$control.prop('checked');

        this.$control.on('click.nb-checkbox', function(evt) {
            evt.stopPropagation();
        });

        // emulates "change" event for IE<9
        // IE<9 triggers "change" only after "blur"
        if (document['documentMode'] && document['documentMode'] < 9) {
            var that = this;
            this.$control.on('propertychange.nb-checkbox', function(e) {
                if (e.originalEvent.propertyName === 'checked') {
                    that.onchange();
                }
            });
        }

        if (this.getType() === 'radio') {
            nb.on('checkbox:checked', $.proxy(this._onCheckboxChecked, this));
        }

        this.trigger('nb-inited', this);
    },

    /**
     * Override base getType()
     *
     * ```
     * checkbox.getType(); // --> checkbox | radio
     * ```
     *
     * @returns {String} — type of control
     */

    getType: function() {
        return this.$control.attr('type');
    },

    /**
     * Return check state of the checkbox or radio
     *
     * ```
     * checkbox.isChecked(); // --> false (by default)
     *
     * checkbox.check();
     * checkbox.isChecked(); // --> true
     * ```
     *
     * @returns {Boolean}
     */
    isChecked: function() {
        return this._isChecked;
    },

    /**
     * Checking checkbox or radio
     *
     * ```
     * checkbox.check();
     * ```
     *
     * @fires 'nb-checked', 'nb-changed'
     * @returns {Object} nb.block
     */
    check: function() {
        if (!this.isEnabled()) {
            return this;
        }
        if (this.getType() === 'radio') {
            nb.trigger('checkbox:checked', {
                name: this.getName(),
                value: this.getValue()
            });
        }

        var isChecked = this.isChecked();

        this.$control.prop({
            'indeterminate': false,
            'checked': true
        });

        this._isChecked = true;
        this.trigger('nb-checked', this);

        if (!isChecked) {
            this.trigger('nb-changed', this);
        }

        return this;
    },

    /**
     * Unchecking checkbox or radio
     *
     * ```
     * checkbox.uncheck();
     * ```
     *
     * @fires 'nb-unchecked', 'nb-changed'
     * @returns {Object} nb.block
     */
    uncheck: function() {
        if (!this.isEnabled()) {
            return this;
        }

        var isChecked = this.isChecked();

        this.$control.prop({
            'indeterminate': false,
            'checked': false
        });

        this._isChecked = false;
        this.trigger('nb-unchecked', this);

        if (isChecked) {
            this.trigger('nb-changed', this);
        }

        return this;
    },

    /**
     * Toggle to the opposite state checkbox or radio
     *
     * ```
     * checkbox.toggle();
     * ```
     *
     * @fires 'change'
     * @return {Object} nb.block
     */
    toggle: function() {
        if (!this.isEnabled()) {
            return this;
        }

        this.trigger('nb-change', this);

        if (this.isChecked()) {
            this.uncheck();
        } else {
            this.check();
        }
        return this;
    },

    /**
     * Return indeterminate state of the checkbox or radio
     *
     * ```
     * checkbox.isIndeterminate();
     * ```
     *
     * @returns {Boolean}
     */
    isIndeterminate: function() {
        return this.$control.prop('indeterminate');
    },

    /**
     * Set indeterminate state of the checkbox or radio
     *
     * ```
     * checkbox.setIndeterminate();
     * ```
     *
     * @fires 'nb-indeterminated'
     * @returns {Object} nb.block
     */
    setIndeterminate: function() {
        if (this.isEnabled()) {
            this.$control.prop('indeterminate', true);
            this.trigger('nb-indeterminated', this);
        }
        return this;
    },

    /**
     * Set determinate state of the checkbox or radio
     *
     * ```
     * checkbox.setDeterminate();
     * ```
     *
     * @fires 'nb-determinated'
     * @returns {Object} nb.block
     */
    setDeterminate: function() {
        if (this.isEnabled()) {
            this.$control.prop('indeterminate', false);
            this.trigger('nb-determinated', this);
        }
        return this;
    },

    /**
     * Return enable state of the checkbox or radio
     *
     * ```
     * checkbox.isEnabled();
     * ```
     *
     * @returns {Boolean}
     */
    isEnabled: function() {
        return !this.$control.prop('disabled');
    },

    /**
     * Enable the checkbox or radio
     *
     * ```
     * checkbox.enable();
     * ```
     *
     * @fires 'nb-enabled'
     * @returns {Object} nb.block
     */
    enable: function() {
        if (!this.isEnabled()) {
            this.$node.removeClass('_nb-is-disabled');
            this.$control.removeAttr('disabled');
            this.trigger('nb-enabled', this);
        }
        return this;
    },

    /**
     * Disable the checkbox or radio
     *
     * ```
     * checkbox.disable();
     * ```
     *
     * @fires 'nb-disabled'
     * @returns {Object} nb.block
     */
    disable: function() {
        if (this.isEnabled()) {
            this.blur();
            this.$node.addClass('_nb-is-disabled');
            this.$control.attr('disabled', 'disabled');
            this.trigger('nb-disabled', this);
        }
        return this;
    },

    /**
     * Focus the checkbox or radio
     *
     * ```
     * checkbox.focus();
     * ```
     *
     * @fires 'nb-focused'
     * @returns {Object} nb.block
     */
    focus: function() {
        this.$control.focus();
        this.trigger('nb-focused', this);
        return this;
    },

    /**
     * Blur the checkbox or radio
     *
     * ```
     * checkbox.blur();
     * ```
     *
     * @fires 'nb-blured'
     * @returns {Object} nb.block
     */
    blur: function() {
        this.$control.blur();
        this.trigger('nb-blured', this);
        return this;
    },

    /**
     * Sets label of the checkbox or radio
     *
     * ```
     * checkbox.setLabel();
     * ```
     *
     * @param {String|Number} label
     * @fires 'nb-label-set'
     * @returns {Object} nb.block
     */
    setLabel: function(label) {
        this.$node.find('._nb-checkbox-label').html(label);
        this.trigger('nb-label-set', this);
        return this;
    },

    /**
     * Gets label of the checkbox or radio
     *
     * ```
     * checkbox.getLabel(); // --> ...
     * ```
     *
     * @returns {String | Number}
     */
    getLabel: function() {
        return this.$node.find('._nb-checkbox-label').html();
    },

    /**
     * Get name of the checkbox or radio
     *
     * ```
     * checkbox.getName(); // --> ...
     * ```
     *
     * @returns {String|Object} name
     */
    getName: function() {
        return this.$control.prop('name');
    },

    /**
     * Set checkbox's name
     *
     * ```
     * checkbox.setName('sex');
     * ```
     *
     * @param {String|Number} value
     * @fires 'nb-name-set'
     * @returns {Object} nb.block
     */
    setName: function(value) {
        this.$control.attr('name', value);
        this.trigger('nb-name-set', this);
        return this;
    },

    /**
     * Returns checkbox value
     *
     * ```
     * checkbox.getValue();
     * ```
     *
     * @returns {String}
     */
    getValue: function() {
        var valueAttr = this.$control.attr('value');
        if (typeof valueAttr === 'string') {
            return valueAttr;
        } else {
            // checkbox without @value has .value === 'on'
            // this is standard browser behavour
            return 'on';
        }
    },

    /**
     * Set checkbox value
     *
     * ```
     * checkbox.setValue('male');
     * ```
     *
     * @param {String|Number} value
     * @fires 'nb-value-set'
     * @returns {Object} nb.block
     */
    setValue: function(value) {
        this.$control.attr('value', value);
        this.trigger('nb-value-set', this);
        return this;
    },

    /**
     * Destroy checkbox
     *
     * ```
     * checkbox.destroy();
     * ```
     *
     * @fires 'nb-destroyed'
     */
    destroy: function() {
        this.$control.off('.nb-checkbox');
        if (this.getType() === 'radio') {
            nb.off('checkbox:checked', $.proxy(this._onCheckboxChecked, this));
        }
        this.trigger('nb-destroyed', this);
        this.nbdestroy();
    }

}, 'base');

/* checkbox/checkbox.js end */

/* select/select.js begin */
/**
 * ## JS
 * ### jQuery UI Depends:
 *
 * - jquery.ui.autocomplete.js
 * - jquery.ui.button.js
 * - jquery.ui.core.js
 * - jquery.ui.widget.js
 * - jquery.ui.position.js
 * - jquery.ui.menu.js
 */


/*!
 * @class nb.block.Select
 * @augments nb.block.Base
 */
nb.define('select', {
        events: {
            'mousedown': '_onclick'
            //'open' { event, ui}
            //'close' { event, ui}
        },

        /**
         * Init select
         * @fires 'nb-inited'
         * @constructor
         */
        oninit: function() {
            this.isOpen = false;
            this.$control = this.$node.find('select');
            this.data = this.nbdata();
            this.$dropdown = this.$node.children('.nb-select-dropdown').appendTo(this.data.appendto || 'body');

            this._updateFromSelect();

            // degradation to native control in IE < 9
            if (nb.IE_LT9) {
                var that = this;
                this.$control.on('change', function(e) {
                    that.setState({
                        value: e.target.value
                    });
                });
            } else {
                // preparing control depending on configuration and content
                this.controlPrepare();
            }

            this.trigger('nb-inited', this);
        },

        /**
         * preparing control depending on configuration and content
         */
        controlPrepare: function() {
            var that = this;
            // preparing position parameters for popup from direction data
            var position = {};
            position.collision = 'flip';

            if (that.data.within) {
                position.within = that.data.within;
            }

            if (that.data.direction == 'top') {
                position.my = "left bottom";
                position.at = "left top";

            } else {
                position.my = "left top";
                position.at = "left bottom";
            }

            that._returnOptItem = function(item) {
                var $item = $(item);
                var icon = $item.data('icon');
                var className = $item.data('class');
                var result = {};
                if ($item.attr('separator')) {
                    result = {
                        separator: true,
                        option: item
                    };
                } else {
                    result = {
                        label: $item.text(),
                        value: $item.val(),
                        option: item
                    };
                    if (icon) {
                        result['icon'] = icon;
                    }

                    if (className) {
                        result['className'] = className;
                    }
                }
                return result;
            };

            // select JUI control init
            that.$node.autocomplete({
                disabled: that.$node.hasClass('_nb-is-disabled'),
                delay: 0,
                minLength: 0,
                autoFocus: false,
                position: position,
                appendTo: that.$dropdown,
                source: function(request, response) {
                    response(that.$control.children(['option', 'optgroup']).map(function() {
                        var returnObj;
                        var $this = $(this);

                        if (this.tagName == 'OPTGROUP') {
                            returnObj = {
                                type: 'group',
                                label: $this.attr('label'),
                                option: this,
                                group: $this.children('option').map(function() {
                                    return that._returnOptItem(this);
                                })
                            };
                        } else {
                            returnObj = that._returnOptItem(this);
                        }

                        return returnObj;
                    }));
                },
                select: function(event, ui) {
                    if (ui.item.type != 'group') {
                        ui.item.option.selected = true;

                        that.$jUI._trigger('selected', event, {
                            item: ui.item.option
                        });
                    }
                },
                // delegate handler on 'outer' click on open
                open: function() {
                    that.$jUI._on(that.$jUI.document, {
                        // on 'outer' mousedown close control
                        mousedown: function(e) {
                            if (e.which == 1 && !$.contains(that.$jUI.element.get(0), e.target) && !$.contains(that.$dropdown[0], e.target)) {
                                this.close();
                            }
                        }
                    });
                    that.trigger('nb-opened', that);
                },

                close: function() {
                    that.$jUI._off(that.$jUI.document, 'mousedown');
                    that.trigger('nb-closed', that);
                }
            }).addClass('ui-widget ui-widget-content');

            that.$jUI = that.$node.data('uiAutocomplete');

            that.$node.on('autocompleteopen', function() {
                that.isOpen = true;
            });

            that.$node.on('autocompleteclose', function() {
                that.isOpen = false;
            });

// redefine one menu item rendering method, fires every time, then popup opening
            that.$jUI._renderItem = function(ul, item) {
                var $itemNode = $('<li class="_nb-select-item"></li>');

                if (item.className) {
                    $itemNode.addClass(item.className);
                }

                if (item.option.selected) {
                    $itemNode.addClass('is-selected');
                }

                if (item.type == 'group') {

                    $itemNode.addClass('_nb-select-group-item');
                    var $innerUL = $('<ul></ul>');

                    item.group.each(function(index, item) {
                        that.$jUI._renderItem($innerUL, item);
                    });

                    $itemNode.append($innerUL);
                }

                if (item.separator) {
                    $itemNode.addClass('_nb-select-seperator-item');
                } else {
                    $itemNode.data('ui-autocomplete-item', item);

                    var $itemNodeContent = $('<a class="_nb-select-a"></a>');

                    if (item.type == 'group') {
                        $itemNodeContent.html('<span class="_nb-select-text">' + item.label + '</span>');
                    } else {
                        $itemNodeContent.text(item.label).appendTo($itemNodeContent);
                    }

                    if (item.icon) {
                        $itemNodeContent.prepend('<img class="nb-icon nb-s-' + item.icon + '-icon" src="//yandex.st/lego/_/La6qi18Z8LwgnZdsAr1qy1GwCwo.gif">');
                    }

                    $itemNode.append($itemNodeContent);
                }

                $itemNode.appendTo(ul);
                return $itemNode;
            };

// redefine valueMethod, extend with button text changing and fallback select value changing
// if value not provided, return current value of fallback select
            that.$jUI.valueMethod = function(value) {

                if (typeof value === 'string') {
                    var text = that.$control.find('option[value="' + value + '"]').text();
                    that.setState({
                        value: value,
                        text: text
                    });
                }
                return that.$selected.val();
            };

// safe original function
            that.$jUI.__resizeMenu = that.$jUI._resizeMenu;

            that.$jUI._resizeMenu = function() {
                // set maxHeight before the menu is displayed
                if (that.data.maxheight) {
                    that._setMaxHeight(that.data.maxheight);
                }

                this.__resizeMenu();
            };

            that.$jUI.menu.element.on('click', function(evt) {
                evt.stopPropagation();
            });
        },

        /*!
         * Save value and text from <select> node.
         * @private
         */
        _updateFromSelect: function() {
            // get selected <option/>
            this.$selected = this.$control.find(':selected');

            this.value = this.$selected.val();
            // &nbsp; - to prevent button from collapse if no text on <option/>
            this.text = this.$selected.text();
            this.icon = this.$selected.data('icon');

            this._setText({ text: this.text, icon: this.icon});
        },

        _onclick: function(evt) {
            if (this.$node && this.$node.data('uiAutocomplete')) {
                evt.preventDefault();
                // close if already visible
                if (this.isOpen) {
                    this.close();
                } else if (this.isEnabled()) {
                    this.open();
                    this.$node.focus();
                }
            }
        },

        _setText: function(params) {
            var content = this.$node.find('._nb-button-content');
            if (params.text || params.icon) {
                // use .text() to prevent XSS
                content.text(params.text);
                if (params.icon) {
                    this.$node.addClass('_nb-with-icon');
                    if (!params.text) {
                        this.$node.addClass('_nb-with-only-button');
                    }
                    content.prepend('<img class="nb-icon nb-s-' + params.icon + '-icon" src="//yandex.st/lego/_/La6qi18Z8LwgnZdsAr1qy1GwCwo.gif">');
                }
            } else {
                // &nbsp; - to prevent button from collapse if no text on <option/>
                this.$node.find('._nb-button-content').html('&nbsp;');
            }

        },

        _setMaxHeight: function(maxheight) {
            var height;
            if (/^\d+$/.test(maxheight)) {
                var item = this.$jUI.menu.element.find('._nb-select-item').first();
                height = parseInt(item.height()) * maxheight;
            } else {
                height = maxheight;
            }

            this.$jUI.menu.element.css({
                'max-height': height,
                'overflow-y': 'auto',
                'overflow-x': 'hidden'
            });
        },

        /**
         * Render dropdown of the select
         * @fires 'nb-rendered'
         * @returns {Object} nb.block
         */
        render: function() {
            if (!this.isEnabled()) {
                return this;
            }

            // pass empty string as value to search for, displaying all results
            this.$node.autocomplete('search', '');

            this.trigger('nb-rendered', this);
            return this;
        },

        /**
         * Open dropdown of the select
         * @fires 'nb-opened'
         * @returns {Object} nb.block
         */
        open: function() {
            if (this.$node && this.$node.data('uiAutocomplete') && this.isEnabled()) {
                this.render();
            }
            return this;
        },

        /**
         * Close dropdown of the select
         * @fires 'nb-closed'
         * @returns {Object} nb.block
         */
        close: function() {
            if (this.$node && this.$node.data('uiAutocomplete')) {
                this.$node.autocomplete('close');
                this.trigger('nb-closed', this);
            }
            return this;
        },

        /**
         * Changes a value of control, text on the button and select value it the fallback
         * @param {Object} params — {
         *     text: '..'
         *     value: '..'
         * }
         * @fires 'nb-changed'
         * @returns {Object} nb.block
         */
        setState: function(params) {
            params = params || {};

            if (this.value !== params.value) {
                var selected;

                if (params.value) {
                    selected = this.$control.find('option[value="' + params.value + '"]').first();
                } else {
                    selected = this.$control.find('option:contains(' + params.text + ')').first();
                }

                if (selected.length !== 0) {
                    this.$selected.prop('selected', false);

                    this.$selected = selected;

                    this.$selected.prop('selected', true);

                    this.value = this.$selected.val();

                    this.text = this.$selected.text();
                    this.icon = this.$selected.data('icon');

                    this._setText({ text: this.text, icon: this.icon});

                    this.trigger('nb-changed', this);

                    this.$control.val(params.value);

                }
            }
            return this;
        },

        /**
         * Returns state of the select
         *
         * @return {Object} -
         * {
         *     value: '..'
         *     text: '..'
         * }
         */
        getState: function() {
            return {
                value: this.value,
                text: this.text
            };
        },

        /**
         * Get name of the select
         * @returns {String|Object} name
         */
        getName: function() {
            return this.$control.prop('name');
        },

        /**
         * Changes a value of control, text on the button and select value it the fallback
         * @param {string} name
         * @fires 'nb-name-set'
         * @returns {Object} nb.block
         */
        setName: function(name) {
            this.$control.prop('name', name);
            this.trigger('nb-name-set', this);
            return this;
        },

        /**
         * Disables the select
         * @fires 'nb-disabled'
         * @returns {Object} nb.block
         */
        disable: function() {
            if (this.isEnabled()) {
                this.$node.addClass('_nb-is-disabled');
                this._tabindex = this.$node.attr('tabindex');
                this.$node.attr('tabindex', '-1');
                this.$node.attr('_nb-is-disabled');
                if (!nb.IE_LT9) {
                    this.$node.autocomplete('disable');
                }
                this.$control.attr('disabled', 'disabled');
                this.trigger('nb-disabled', this);
            }
            return this;
        },

        /**
         * Enables the select
         * @fires 'nb-enabled'
         * @returns {Object} nb.block
         */
        enable: function() {
            if (!this.isEnabled()) {
                this.$node.attr('tabindex', this._tabindex || '0');
                this.$node.removeClass('_nb-is-disabled');
                if (!nb.IE_LT9) {
                    this.$node.autocomplete('enable');
                }
                this.$control.removeAttr('disabled');
                this.trigger('nb-enabled', this);
            }
            return this;
        },

        /**
         * Return state of the select
         * @returns {Boolean}
         */
        isEnabled: function() {
            return !this.$node.hasClass('_nb-is-disabled');
        },

        /*
         * Set new items for select
         * @params {Array} source New source
         * @fires 'nb-source-changed'
         * @returns {Object} nb.block
         */
        setSource: function(source) {

            if (!source) {
                return this;
            }

            if (!(source instanceof Array)) {
                source = [source];
            }

            // find all selected items
            var selected = [];
            source.forEach(function(item) {
                if (item.selected) {
                    selected.push(item);
                }
            });

            // leave only last selected item (this is native browser behaviour)
            selected.slice(0, -1).forEach(function(item) {
                item.selected = false;
            });

            // render options with yate to prevent XSS
            var html = yr.run(this.getYateModuleName(), {
                items: source
            }, 'nb-select-options');

            // set new source for select
            this.$control.empty().append(html);

            this._updateFromSelect();
            this.trigger('nb-source-changed', this);
            return this;
        },

        /*
         * Get items from select
         * @returns {Array} source
         */
        getSource: function() {
            return $.map(this.$control.children('option'), function(node) {
                var $node = $(node);
                return {
                    text: $node.text(),
                    value: $node.val(),
                    selected: $node.prop('selected')
                };
            });
        },

        /*
         * Add items to select
         * @param {Array|Object} items
         * @param {Number} index to insert
         * @fires 'nb-source-changed'
         * @returns {Object} nb.block
         */
        addToSource: function(items, index) {
            var source = this.getSource();

            if (!(items instanceof Array)) {
                items = [items];
            }

            var selectedItemValue = null;

            var insertion = items.filter(function(item) {
                var newItem = source.indexOf(item) === -1;
                if (newItem) {
                    if (item.selected) {
                        // stores last selected item
                        selectedItemValue = item.value;
                    }
                    return true;
                }
                return false;
            }, this);

            if (isNaN(index)) {
                index = source.length;
            }

            insertion.forEach(function(item, i) {
                source.splice(index + i, 0, item);
            }, this);

            this.setSource(source);

            // set state from new items
            if (selectedItemValue) {
                // use #setState() to fire 'nb-changed' event
                this.setState({
                    value: selectedItemValue
                });
            }
            this.trigger('nb-source-changed', this);
            return this;
        },

        /*
         * Remove items to select
         * @param {Array|Object|number} items or index
         * @fires 'nb-source-changed'
         * @returns {Object} nb.block
         */
        removeFromSource: function(param) {
            var source = this.getSource();

            var index;

            if (typeof param == 'number' || typeof param == 'string') {
                index = parseInt(param);
            } else if (!(param instanceof Array)) {
                param = [param];
            }

            if (index || index === 0) {
                source.splice(index, 1);
            } else {
                param.forEach(function(item) {
                    source = source.filter(function(obj) {
                        return obj.text != item.text && obj.value != item.value;
                    });
                }, this);
            }

            this.setSource(source);
            this.trigger('nb-source-changed', this);
            return this;
        },

        /**
         * Focus the select
         * @fires 'nb-focused'
         * @returns {Object} nb.block
         */
        focus: function() {
            if (this.isEnabled()) {
                this.$node.focus();
            }
            this.trigger('nb-focused', this);
            return this;
        },

        /**
         * Blur the select
         * @fires 'nb-blured'
         * @returns {Object} nb.block
         */
        blur: function() {
            if (this.isEnabled()) {
                this.$node.blur();
            }
            this.trigger('nb-blured', this);
            return this;
        },

        /**
         * Sets option to the jUI widget
         * http://api.jqueryui.com/autocomplete/#method-option
         * @param  {Object.<string, number>} option — {
           *      name: value —  имя и значение опцииопции
           * }
         * @fires 'nb-option-set'
         * @returns {Object} nb.block
         */
        setOption: function(option) {
            this.$node.autocomplete('option', option);
            this.trigger('nb-option-set', this);
            return this;
        },

        /**
         * Gets option of the jUI widget
         * http://api.jqueryui.com/autocomplete/#method-option
         * @param {String} option
         * @returns {String} option value
         */
        getOption: function(option) {
            return this.$node.autocomplete('option', option);
        },

        /**
         * Destroy the select
         * @fires 'nb-destroyed'
         */
        destroy: function() {
            if (this.$node && this.$node.data('uiAutocomplete')) {
                this.$node.autocomplete('destroy');
                this.$dropdown.empty().appendTo(this.$node);
            }
            this.trigger('nb-destroyed', this);
            this.nbdestroy();
        }
    },
    'base');

/* select/select.js end */

/* slider/slider.js begin */
/*
 * ### jQuery UI Depends:
 * - jquery.ui.slider.js
 * - jquery.ui.core.js
 * - jquery.ui.mouse.js
 * - jquery.ui.widget.js
 */

/*!
 * @class nb.block.Slider
 * @augments nb.block.Base
 */
nb.define('slider', {
    /**
     * Init the slider
     * @fires 'nb-inited'
     */
    oninit: function() {
        var that = this;

        this.data = this.nbdata();
        this.$control = this.$node.find('._nb-slider-fallback');
        this.$body = this.$node.children('._nb-slider-body');

        this.$body.show();

        this.$body.slider({
            range: 'min',
            disabled: this.$node.hasClass('_nb-is-disabled'),
            value: parseFloat(this.data.value),
            change: function(e, ui) {
                this.$control.val(ui.value);
            }.bind(this)
        });

        this.$body.on('slidestop', function(event, ui) {
            that.trigger('nb-slider_slidestop', ui.value);
        });

        this.$body.on('slidestart', function(event, ui) {
            that.trigger('nb-slider_slidestart', ui.value);
        });

        this.$body.on('slide', function(event, ui) {
            that.trigger('nb-slider_slide', ui.value);
        });


        this.trigger('nb-inited', this);
        return this;
    },

    /**
     * Set specified value to slider
     * @param {Number} value
     * @fires 'nb-value-set'
     */
    setValue: function(value) {
        if (this.$body.slider('option', 'disabled')) {
            return this;
        }
        this.$body.slider('value', value);
        this.trigger('nb-value-set', this);
        return this;
    },

    /**
     * Return slider's value
     * @return {Number} value
     */
    getValue: function() {
        return this.$body.slider('option', 'value');
    },

    /**
     * Set name of the fallback input
     * @param {String|Number} value
     * @fires 'nb-name-set'
     * @return {Object} nb.block
     */
    setName: function(value) {
        this.$control.prop('name', value);
        this.trigger('nb-name-set', this);
        return this;
    },

    /**
     * Get name of the fallback input
     * @return {String|Boolean} name
     */
    getName: function() {
        return this.$control.prop('name');
    },

    /**
     * Set disabled state
     * @fires 'nb-disabled'
     * @return {Object} nb.block
     */
    disable: function() {
        this.$node.addClass('_nb-is-disabled');
        this.$body.slider('disable');
        this.trigger('nb-disabled', this);
        return this;
    },

    /**
     * Reset disabled state
     * @fires 'nb-enabled'
     * @return {Object} nb.block
     */
    enable: function() {
        this.$node.removeClass('_nb-is-disabled');
        this.$body.slider('enable');
        this.trigger('nb-enabled', this);
        return this;
    },

    /**
     * Return state of the slider
     * @return {Boolean}
     */
    isEnabled: function() {
        return !this.$body.slider('option', 'disabled');
    },

    /**
     * Destroy the slider
     * @fires 'nb-destroyed'
     */
    destroy: function() {
        if (this.$body && this.$body.data('uiSlider')) {
            this.$body.slider('destroy');
        }
        this.trigger('nb-destroyed', this);
        this.nbdestroy();
    }
}, 'base');

/* slider/slider.js end */

/* popup/popup.js begin */
/*! 
 * ### jQuery UI Depends
 * 
 * - jquery.ui.dialog.js
 * - jquery.ui.core.js
 * - jquery.ui.widget.js
 * - jquery.ui.button.js
 * - jquery.ui.draggable.js
 * - jquery.ui.mouse.js
 * - jquery.ui.position.js
 */

(function() {

    // Надстройки nb над jQueryUI
    $.nb = {};

    // 60 fps is optimal rate for smooth changes
    var TIME_PER_FRAME = 1000 / 60;

    $.widget('nb.baseDialog', $.ui.dialog, {
        options: {
            height: 'auto',
            minHeight: 'auto',
            width: 'auto'
        },
        open: function() {
            this._super();
            var that = this;

            if (this.options.autoclose) {
                if (this.options.modal) {
                    this._onmousedown = function(e) {

                        if (e.which === 2 || e.which === 3) {
                            return;
                        }

                        that.options.closedByOuterClick = true;
                        that.close();
                    };
                    this.overlay.click(this._onmousedown);
                } else {
                    this._onmousedown = function(e) {
                        var popupId = $(that.uiDialog[0]).find('.nb-popup').attr('id');
                        var toggler = $(e.target).parents().addBack().filter('[data-nb="popup-toggler"]');

                        if (e.which === 2 || e.which === 3) {
                            return;
                        }

                        if ($.contains(that.uiDialog[0], e.target)) {
                            return;
                        }

                        // if we handle click on toggler we shouldn't close linked popup by outerclick
                        if (toggler.length && nb.find(toggler.attr('id')) && nb.find(toggler.attr('id')).nbdata()["popup-toggler"].id == popupId) {
                            return;
                        }

                         // hacky way to detect click on scroll
                        if (e.clientX > window.screen.width - 18) {
                            return;
                        }

                        that.options.closedByOuterClick = true;
                        that.close();
                    };

                    this.document.on('mousedown', this._onmousedown);
                    this.document.on('touchstart', this._onmousedown);
                }
            }

            this._onresize = $.throttle(TIME_PER_FRAME, this._position.bind(this));
            this.window.on('resize', this._onresize);


            this._onpopupclose = nb.on('popup-close', function() {
                if (that.options.autoclose) {
                    that.close();
                }
            });
        },
        close: function(evt) {
            this._super();

            // if we close modal popup by "esc", we should trigger 'nb-closed' event
            if (evt && evt.keyCode === 27 && this.options.modal) {
                this.nbBlock = this.nbBlock || nb.find($(this.uiDialog[0]).find('.nb-popup').attr('id'));
                this.nbBlock.trigger('nb-closed', this.nbBlock);
            }

            if (this.options.autoclose) {
                this.document.off('mousedown', this._onmousedown);
                this.document.off('touchstart', this._onmousedown);
                this.document.off('click', this._onmousedown);
            }

            if (this._onresize) {
                this.window.off('resize', this._onresize);
            }

            nb.off('popup-close', this._onpopupclose);
        },
        _focusTabbable: function() {
            if (this.options.autofocus) {
                this._super();
            }
        },
        _keepFocus: $.noop,
        _create: function() {
            this.options.dialogClass += _getUIDialogExtraClass.call(this);
            this.options.dialogClass += (this.options.position.fixed) ? ' ui-dialog-fixed' : '';
            this._super();
            this.element[0].widget = this;
        },
        _destroy: function() {
            this._super();
            delete this.element[0].widget;
        },

        _position: function() {
            var that = this;
            var using = this.options.position.using;

            // Перестановка базового опорного свойства.
            this.options.position.using = function(props, ui) {
                var position = $.extend({}, props);
                var width;
                var height;

                $(ui.element.element[0]).css({top: 'auto', bottom: 'auto', left: 'auto', right: 'auto'});

                if (ui.vertical == 'bottom') {
                    height = that.window.height();
                    position.bottom = height - (position.top + ui.element.height);
                    position.top = 'auto';
                }

                if (ui.horizontal == 'right') {
                    width = that.window.width();
                    position.right = width - (position.left + ui.element.width);
                    position.left = 'auto';
                }

                return using.call(ui.element.element[0], position, ui);
            };

            this._super();

            this.options.position.using = using;
        },
        _createTitlebar: function() {
            this.uiDialogTitlebarClose = $();
        }
    });

    // диалог с хвостиком
    $.widget('nb.contextDialog', $.nb.baseDialog, {

        tailOffset: 13,

        options: {
            height: 'auto',
            minHeight: 'auto',
            width: 'auto',
            show: {
                effect: 'nb',
                duration: 150
            },
            hide: {
                effect: 'nb',
                duration: 150
            },
            draggable: false,
            resizable: false,
            dialogClass: '_nb-popup-outer ui-dialog-no-close',
            position: {
                my: 'center top',
                at: 'center bottom',
                // horizontal: fit, пытаемся уместить в window
                // vertical: flip - выбирает наилучший вариант - вверх или вних
                collision: "fit flip"
            }
        },


        _create: function() {
            this._super();
            if (!this.options.withoutTail) {
                this.$tail = $('<div class="_nb-popup-tail"><i/></div>');
                //TODO: проверить, что вызывается один раз
                this.$tail.prependTo(this.uiDialog);
            }

        },
        _position: function() {
            var that = this;
            var using = this.options.position.using;

            // Позиционирование хвостика попапа, заданное в CSS.
            var defaultTailPosition = {
                top: '',
                left: '',
                right: '',
                bottom: ''
            };

            this.options.position.using = function(props, ui) {
                var $el = ui.element.element;
                var el = $el[0];
                var tailPosition;
                var tailLimits;

                // Определение направления хвостика.
                var tailDirection = _getPopupTailDirection(ui.target, ui.element);
                var targetCenter = _getElementCenter(ui.target);

                nb.node.setMod(el, '_nb-popup_to', _getInverseDirection(tailDirection));
                $el.data('nb-tail-dir', tailDirection);

                if (!that.options.withoutTail) {
                    // Позиционирование хвостика вдоль попапа, необходимо для того,
                    // чтобы хвостик указывал на центр целевого элемента.
                    if (_isDirectionVertical(tailDirection)) {
                        tailLimits = [that.tailOffset, ui.element.width - that.tailOffset];
                        tailPosition = _limitNumber(Math.abs(targetCenter.x - ui.element.left), tailLimits);

                        that.$tail.css($.extend(defaultTailPosition, {
                            left: tailPosition + 'px'
                        }));

                    } else {
                        tailLimits = [that.tailOffset, ui.element.height - that.tailOffset];
                        tailPosition = _limitNumber(Math.abs(targetCenter.y - ui.element.top), tailLimits);

                        that.$tail.css($.extend(defaultTailPosition, {
                            top: tailPosition + 'px'
                        }));
                    }

                    props[tailDirection] += that.tailOffset;
                }

                return using.call(el, props, ui);
            };

            this._super();

            this.options.position.using = using;
        }
    });

    jQuery.effects.effect.nb = function(o, done) {
        var $this = $(this);
        var nbBlock = nb.block($this.find('.nb-popup').get(0));
        var mode = $.effects.setMode($this, o.mode || 'hide');
        var shouldHide = mode === 'hide';
        var tailDirection = $this.data('nb-tail-dir');
        var distance = $.nb.contextDialog.prototype.tailOffset;

        var animation = {};

        var doWithoutAnimation = function() {

            $this.css({'opacity': '1'});
            if (shouldHide) {
                $this.hide();
                nbBlock.trigger('nb-closed', nbBlock);
                done();
            } else {
                nbBlock.trigger('nb-opened', nbBlock);
                done();
            }
            nbBlock.animationInProgress = false;
            return;
        };

        var doWithAnimation = function() {
            $this.animate(animation, {
                queue: false,
                duration: o.duration,
                easing: o.easing,
                complete: function() {
                    if (shouldHide) {
                        $this.hide();
                        nbBlock.animationInProgress = false;
                        nbBlock.trigger('nb-closed', nbBlock);
                        done();
                    } else {
                        nbBlock.animationInProgress = false;
                        nbBlock.trigger('nb-opened', nbBlock);
                        done();
                    }
                    return;
                }
            });
            return;
        };

        animation.opacity = shouldHide ? 0 : 1;
        animation[tailDirection] = (shouldHide ? '+=' : '-=') + distance;

        nbBlock.animationInProgress = false;

        if (nbBlock.animationInProgress) {
            done();
        } else {
            if (!shouldHide) {
                if (nbBlock.hasAnimation) {
                    $this.css(tailDirection, '+=' + distance);
                }
                $this.show();
            }

            nbBlock.animationInProgress = true;

            if (nbBlock.hasAnimation) {
                doWithAnimation();
            } else {
                doWithoutAnimation();
            }
        }
    };

    /**
     * Вычисляет направление хвостика попапа, принимая во внимание положение
     * и размер обоих элементов.
     *
     * Сперва для каждого элемента вычисляются координаты вершин опоясывающего
     * прямоугольника. После этого, для каждой внешней полуплоскости,
     * образованной сторонами прямоугольника целевого элемента (т.н. тогглера)
     * проверяется попадание вершин прямоугольника попапа.
     *
     * @param  {Object} targetDimensions Положение и измерения элемента, на который указывает попап
     * @param  {Object} popupDimensions  Положение и измерения попапа
     * @return {String} top|right|bottom|left
     * @private
     */
    function _getPopupTailDirection(targetDimensions, popupDimensions) {
        var p = _getBoundingRectangle(popupDimensions);
        var t = _getBoundingRectangle(targetDimensions);

        // Проверка полуплоскости вверх от целевого элемента.
        if (p[0].y <= t[0].y && p[1].y <= t[0].y) {
            return 'bottom';
        }

        // Проверка полуплоскости вправо от целевого элемента.
        if (p[0].x >= t[1].x && p[1].x >= t[1].x) {
            return 'left';
        }

        // Проверка полуплоскости вниз от целевого элемента.
        if (p[0].y >= t[1].y && p[1].y >= t[1].y) {
            return 'top';
        }

        // В оставшихся случаях попап лежит слева от тогглера.
        return 'right';
    }

    /**
     * Рассчитывает координату центра прямоугольника на основе значений
     * `left`, `top`, `width`, `height`.
     * @param  {Object} d
     * @return {Object}
     * @private
     */
    function _getElementCenter(d) {
        return {
            x: Math.round(d.left + (d.width / 2)),
            y: Math.round(d.top + (d.height / 2))
        };
    }

    /**
     * Ограничивает переданное число в заданный промежуток.
     * @param  {Number} number
     * @param  {Array}  range  [min, max]
     * @return {Number}
     * @private
     */
    function _limitNumber(number, range) {
        return Math.min(Math.max(number, range[0]), range[1]);
    }

    /**
     * Возвращает координаты левой верхней и правой нижней вершин прямоугольника,
     * из значений `top`, `left`, `width` и `height`:
     *
     *     {
     *         top: 20,
     *         left: 25,
     *         width: 50,
     *         height: 20
     *     }
     *
     * в
     *
     *     [
     *         {
     *             x: 25,
     *             y: 20
     *         },
     *         {
     *             x: 75,
     *             y: 70
     *         }
     *     ]
     *
     * @param  {Object} d
     * @return {Object}
     * @private
     */
    function _getBoundingRectangle(d) {
        return [
            {
                x: Math.round(d.left),
                y: Math.round(d.top)
            },
            {
                x: Math.round(d.left + d.width),
                y: Math.round(d.top + d.height)
            }
        ];
    }

    /**
     * Возвращает строковое представление противоположного направления,
     * например `top` -> `bottom`.
     * @param  {String} direction
     * @return {String}
     * @private
     */
    function _getInverseDirection(direction) {
        var inversion = {
            top: 'bottom',
            bottom: 'top',
            left: 'right',
            right: 'left'
        };

        return inversion[direction];
    }

    function _isDirectionVertical(direction) {
        return direction === 'top' || direction === 'bottom';
    }

    /*!
     *  Функция возвращает строку с модификаторами
     *  для обертки попапа, которую добавляет jquery ui,
     *  в соответсвии с модификаторами самого попапа
     *
     *  Например, для попапа заданы классы-модификаторы nb-popup_mod и nb-popup_another-mod,
     *  функция вернет строку 'nb-popup-outer_mod nb-popup-outer_another-mod'
     *
     */
    function _getUIDialogExtraClass() {
        var popupClasses = this.element.attr('class').split(' ') || [];
        // не матчимся на _ в начале слова
        // иначе это глобальный класс,
        // не мачимся на __, чтобы ислючить элемент
        var modRe = /\w+\_(?!_)/;
        var uiDialogClasses;

        uiDialogClasses = $.map(popupClasses, function(item) {
            var parts = item.split(modRe);
            var l = parts.length;
            var modifier = parts.pop();
            var newClass = '';

            // в массиве должно быть больше 1 элемента
            // иначе модификатора не было
            if (l > 1) {
                newClass = 'nb-popup-outer_' + modifier;
            }

            return newClass;
        });

        return uiDialogClasses.join(' ');
    }


    nb.define('popup', {

        events: {
            'click ._nb-popup-close': 'close',
            'position': 'onposition'
        },

        // ----------------------------------------------------------------------------------------------------------------- //
        oninit: function() {
            var that = this;
            var data = this.nbdata();

            if ('modal' in data) {
                this.modal = true;
            }

            this.$menu = this.$node.find('._nb-popup-menu');

            if (this.$menu.length) {
                this.$menu.menu({
                    select: function(event, ui) {
                        that.trigger('nb-select', {
                            event: event,
                            ui: ui
                        });
                    }
                });
            }
        },

        onposition: function(e, params) {
            var where = params.where;
            var how = params.how;
            this._move(where, how, params);
        },


        /* Open popup
         *
         * ```
         * popup.open({
         *     where: [100, 200],
         *     how: 'top bottom'
         * });
         * ```
         *
         * @param {Object} params settings for popup
         * @fires 'nb-open-started' and 'nb-opened'
         * @return {Object} nb.block
         */
        open: function(p) {
            if (!p && !this.modal) {
                console.warn('Trying to call popup.open() without params;');
                return this;
            }
            var params = p || {};
            var where = params.where;
            var how = params.how;

            if (this.where) {
                //  Попап уже открыт
                //  FIXME: Буэээ. Уродливое условие для варианта, когда заданы координаты вместо ноды.
                if (where !== this.where || ( (where instanceof Array) && (where[0] !== this.where[0] || where[1] !== this.where[1] ))) {
                    //  На другой ноде. Передвигаем его в нужное место.
                    this._move(where, how);
                }
            } else {
                //  Попап закрыт. Будем открывать.
                if (params.where || this.modal) {
                    this.$node.removeClass('_nb-is-hidden');
                    //  Передвигаем попап.
                    this._move(where, how, params);
                    if (this.modal) {
                        this.trigger('nb-opened');
                    } else {
                        this.trigger('nb-open-started');
                    }
                }
            }
            return this;
        },

        /**
         * Close popup
         * @fires 'nb-close-started' and 'nb-closed'
         * @return {Object} nb.block
         */
        close: function() {

            //  Снимаем флаг о том, что попап открыт.
            this.where = null;

            if (this.isOpen()) {
                this.node.widget.close();

                if (this.modal) {
                    this.trigger('nb-closed');
                } else {
                    this.trigger('nb-close-started');
                }
            }


            // if popup closed by document click we also should fire event
            if (this.node && this.node.widget && this.node.widget.options.closedByOuterClick) {
                if (this.modal) {
                    this.trigger('nb-closed');
                } else {
                    this.trigger('nb-close-started');
                }
                this.node.widget.options.closedByOuterClick = false;
            }

            return this;
        },

        /**
         * Set content of popup (not menu, not modal)
         * @fires 'nb-content-set'
         * @returns {Object} nb.block
         */
        setContent: function(content) {
            this.$node.find('._nb-popup-content').html(content);
            this.trigger('nb-content-set');
            return this;
        },

        /**
         * Get content of popup (not menu, not modal)
         * @returns {String} content
         */
        getContent: function() {
            return this.$node.find('._nb-popup-content').html();
        },

        isOpen: function() {
            return this.node && this.node.widget && this.node.widget.isOpen();
        },

        /**
         * Destroy the popup
         */
        destroy: function() {
            if (this.node && this.node.widget) {
                this.node.widget.destroy();
                this.$node.addClass('_nb-is-hidden');
            }

            this.trigger('nb-destroyed', this);
            this.nbdestroy();
        },

        // ----------------------------------------------------------------------------------------------------------------- //

        _move: function(where, how, params) {
            //  Запоминаем, на какой ноде мы открываем попап.
            this.where = where;
            var that = this;
            var params = params || {};
            var how = how || {};

            var data = this.nbdata();
            // по умолчанию попап позиционирова абсолютно
            var isFixed = false;

            // сделаем попап фиксированным, если
            // у popup-toggler задан how.fixed = true
            if (how.fixed) {
                isFixed = true;
            }
            // или если был задан атрибут data-nb-how = 'fixed'
            // в настройках самого попапа
            if (data && data.how == 'fixed') {
                isFixed = true;
            }

            var using = function(props) {
                var $el = $(this);
                $el.css(props);
            };

            var autoclose = true;

            if (typeof how.autoclose !== 'undefined') {
                autoclose = how.autoclose;
            }

            if (typeof params.autoclose !== 'undefined') {
                autoclose = params.autoclose;
            }


            var autofocus = true;

            if (typeof how.autofocus !== 'undefined') {
                autofocus = how.autofocus;
            }

            if (typeof params.autofocus !== 'undefined') {
                autofocus = params.autofocus;
            }

            this.hasAnimation = true;

            if (typeof how.animation !== 'undefined') {
                this.hasAnimation = how.animation;
            }

            if (typeof params.animation !== 'undefined') {
                this.hasAnimation = params.animation;
            }

            //  Модальный попап двигать не нужно.
            if (this.modal) {
                $(this.node).baseDialog({
                    height: data.height,
                    minHeight: data.minheight,
                    width: data.width,
                    show: 'fade',
                    hide: 'fade',
                    modal: true,
                    resizable: false,
                    draggable: false,
                    dialogClass: '_nb-popup-outer ui-dialog-fixed',
                    close: function() {
                        that.close();
                    },
                    appendTo: params.appendTo,
                    position: {
                        using: using
                    },
                    autoclose: autoclose,
                    autofocus: autofocus
                });

                return;
            }

            if (!this.animationInProgress) {
                this.$node.hide().contextDialog({
                    position: {
                        // где попап
                        at: (how.at ? how.at : 'center bottom'),// + ' center',
                        // где ссылка, которая открыла попап
                        my: (how.my ? how.my : 'center top'),// + ' center',
                        fixed: isFixed,
                        of: $(this.where),
                        // horizontal: fit, пытаемся уместить в window
                        // vertical: flip - выбирает наилучший вариант - вверх или вних
                        collision: (how.collision ? how.collision : 'fit flip'),
                        using: using || how.using,
                        within: how.within
                    },
                    close: function() {
                        that.close();
                    },
                    appendTo: params.appendTo || how.appendTo,
                    autoclose: autoclose,
                    autofocus: autofocus,
                    withoutTail: params.withoutTail || data.withouttail || false
                });
            }
        }
    }, 'base');
})();

// ----------------------------------------------------------------------------------------------------------------- //

nb.define('popup-toggler', {

    events: {
        'click': 'toggle'
    },

    oninit: function() {
        var that = this;
        this.data = this.nbdata()['popup-toggler'];
        this.popup = nb.find(this.data['id']);

        if (this.popup) {
            this.popup.on('nb-closed', function() {
                that.trigger('nb-closed', that);
            });

            this.popup.on('nb-opened', function() {
                that.trigger('nb-opened', that);
            });
        }

        this.options = {
            //  Относительно чего позиционировать попап.
            //  Если заданы точные координаты в `data.where`, то по ним.
            //  Иначе относительно ноды этого блока.
            where: this.data.where || this.node,

            //  Как позиционировать попап.
            how: this.data.how,
            // Без хвоста
            withoutTail: this.data.withoutTail,

            // Закрывать ли автоматически
            autoclose: this.data.autoclose,

            // Фокусировать ли автоматически
            autofocus: this.data.autofocus,

            // Куда его вставлять
            appendTo: this.data.appendTo
        };
        this.trigger('nb-inited', this);
    },
    /**
     * Toggle popup
     * @returns {Object} nb.block
     */
    toggle: function(evt) {
        if (evt) {
            evt.preventDefault();
        }
        if (this.popup && this.popup.isOpen()) {
            this.close(evt);
        } else {
            this.open(evt);
        }
        return this;
    },

    /**
     * Open popup
     * @fires 'nb-open-started' and 'nb-opened'
     * @returns {Object} nb.block
     */
    open: function(evt) {
        if (evt) {
            evt.preventDefault();
        }
        if (this.isEnabled() && this.popup && !this.popup.isOpen()) {
            this.popup.open(this.options);
            this.trigger('nb-open-started', this);
        }
        return this;
    },

    /**
     * Close popup
     * @fires 'nb-close-started' and 'nb-closed'
     * @returns {Object} nb.block
     */
    close: function() {
        if (this.isEnabled() && this.popup && this.popup.isOpen()) {
            this.popup.close();
            this.trigger('nb-close-started', this);
        }
        return this;
    },

    /**
     * Returns connected popup
     * @returns {Object} nb.block
     */
    getPopup: function() {
        return this.popup;
    },

    /**
     * Sets connected popup
     * @param {Object} params
     *
     *  ```
     *  {
     *       id : 'id' — popupID or link to nb.block
     *       where: '#elem' — to what elem popup attached
     *       how: { my: 'left', at:'right' } — to to open popup
     *   }
     *  ```
     * @returns {Object} nb.block
     */
    setPopup: function(params) {
        if (typeof params === 'string') {
            var obj = {};
            obj.popup = params;
            params = obj;
        }

        if (arguments.length === 1 && typeof params === 'object' && params.popup) {
            var id = params.popup;
            delete params.popup;

            if (params.where) {
                this.options = params;
            }

            if (typeof id === 'string') {
                this.popup = nb.find(id);
            } else {
                this.popup = id;
            }
            this.trigger('nb-popup-set', this);
        }
        return this;
    },

    /**
     * Get connected popup  option
     * @returns {Object} options
     */
    getOptions: function() {
        return this.options;
    },

    /**
     * Sets connected popup options
     * @param {Object} params
     *   ```
     *  {
     *       id : 'id' — popupID or link to nb.block
     *       where: '#elem' — to what elem popup attached
     *       how: { my: 'left', at:'right' } — to to open popup
     *   }
     *  ```
     * @returns {Object} nb.block
     */
    setOptions: function(params) {
        if (arguments.length === 1 && typeof params === 'object') {
            this.options = params;
            this.trigger('nb-options-set', this);
        }
        return this;
    },

    /**
     * Disable the toggler
     *
     * ```
     * popupToggler.disable();
     * ```
     *
     * @fires 'nb-disabled'
     * @return {Object} blocks for chaining
     */
    disable: function() {
        this._tabindex = this.$node.attr('tabindex');
        this.$node.attr('tabindex', '-1');
        this.$node.addClass('_nb-is-disabled');
        this.trigger('nb-disabled', this);
        return this;
    },

    /**
     * Enables the  toggler
     *
     * ```
     * popupToggler.enable();
     * ```
     *
     * @fires 'nb-enabled'
     * @return {Object} blocks for chaining
     */
    enable: function() {
        this.$node.attr('tabindex', this._tabindex || '0');
        this.$node.removeClass('_nb-is-disabled');
        this.trigger('nb-enabled', this);
        return this;
    },

    /**
     * Return state of the toggler
     *
     *
     * @return {Boolean}
     */
    isEnabled: function() {
        return !this.$node.hasClass('_nb-is-disabled');
    },

    /**
     * Destroy the popup toggler
     * @fires 'nb-destroyed'
     */
    destroy: function() {
        this.nbdestroy();
    }

}, 'base');

/* popup/popup.js end */

/* input/input.js begin */
(function() {

    var bindOninput = function(block, callback) {
        if (block.$control.get(0).attachEvent) {
            //IE8 does not supports oninput events: https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers.oninput
            block.$control.get(0).attachEvent('onpropertychange', function(e) {
                if (e.propertyName === "value") {
                    callback(e);
                }
            });
        } else {
            block.$control.on('input', callback);
        }
    };

    /*!
     * @class nb.block.Input
     * @augments nb.block.Base
     */
    nb.define('input', {
        events: {
            'click': 'focus',
            'mousedown ._nb-input-reset': 'reset'
        },

        /**
         * Init input
         * @fires 'nb-inited'
         * @constructor
         */
        oninit: function() {
            var that = this;

            this.data = this.nbdata();

            if (this.data.type == 'simple') {
                this.$control = this.$node;
            } else {
                this.$control = this.$node.find('._nb-input-controller');
            }

            this.focused = false;
            this.disabled = this.$control.prop('disabled');
            this.value = this.getValue();

            this.$reset = this.$node.find('._nb-input-reset');
            this.$hint = this.$node.find('._nb-input-hint');

            this.$control.on('focusin', function(e) {
                if (!that.focused) {
                    that._onfocus(e);
                }
            });

            this.$control.on('focusout', function(e) {
                if (that.focused) {
                    that._onblur(e);
                }
            });

            this.$control.on('change', function(e) {
                that.trigger('nb-changed', this, e);
            });

            bindOninput(this, function(e) {
                that.value = that.getValue();

                if (that.value !== '' && that.$reset.length) {
                    that.$reset.css('visibility', 'visible');
                } else {
                    that.$reset.css('visibility', 'hidden');
                }

                that.trigger('nb-input', this, e);
            });

            if (this.$hint.length) {
                this._inithint();
            }

            if (this.data.ghost) {
                this.$node.on('mouseover mouseout', function() {
                    that.$node.toggleClass('_nb-is-ghost');
                });
            }

            if (this.data.error) {
                this.error = nb.find(this.data.error.id);
            }

            if (this.value === '' && this.$reset.length) {
                this.$reset.css('visibility', 'hidden');
            }

            this._onmousedown = function(e) {
                if ($.contains(this.$node.get(0), e.target)) {
                    return;
                }

                this._onblur(e);
            }.bind(this);

            // IE 9/10 Enter Key causing Form Submit / Button Click
             // this.$control.keypress(function(e) {
             // if (e.which == 13) {
             // e.preventDefault();
             // }
             // });

            $(document).on('mousedown', this._onmousedown);
            $(document).on('touchstart', this._onmousedown);

            this.trigger('nb-inited', this);
        },

        _inithint: function() {
            var that = this;

            this.$control.removeAttr('placeholder');

            this.$hintGhost = this.$hint.find('._nb-input-hint-ghost');

            if (this.$hintGhost.length) {
                this.$hintGhost.html(that.getValue());

                bindOninput(this, function() {
                    that.$hintGhost.html(that.getValue());
                });

            } else {
                that.$hint.css('visibility', 'visible');
                bindOninput(this, function() {
                    if (that.getValue() === '') {
                        that.$hint.css('visibility', 'inherit');
                    } else {
                        that.$hint.css('visibility', 'hidden');
                    }
                });
            }
        },

        _onfocus: function(e) {
            this.$node.addClass('_nb-is-focused');
            this.focused = true;
            // if e this method called after tabulation. TODO checking of focus property
            if (!e) {
                this.$control.focus();
            }
            if (this.$hintGhost && this.$hintGhost.length) {
                this.$hint.css('visibility', 'hidden');
            }

            if (this.data.ghost) {
                this.$node.removeClass('_nb-is-ghost');
            }
        },

        _onblur: function(e) {
            this.$node.removeClass('_nb-is-focused');
            this.focused = false;
            // if e this method called after tabulation. TODO checking of focus property
            if (!e) {
                this.$control.blur();
            }
            if (this.$hintGhost && this.$hintGhost.length) {
                this.$hint.css('visibility', 'inherit');
            }

            if (this.data.ghost) {
                this.$node.addClass('_nb-is-ghost');
            }
        },

        /**
         * Show inputs error
         * @param {Object|String} params optional params of error popup or contentof Error
         * @returns {Object} nb.block
         */
        showError: function(params) {
            var wasFocused = this.focused;
            var params = params || {};

            if (this.data.error) {
                this.$node.addClass('_nb-is-wrong');
                var how = {
                    collision: 'flip flip'

                };

                if (this.data.error.direction && this.data.error.direction == 'left') {
                    how.at = "left";
                    how.my = "right";

                } else {
                    how.at = "right";
                    how.my = "left";
                }

                if (typeof params === 'string') {
                    this.setErrorContent(params);
                }

                if (params.content) {
                    this.setErrorContent(params.content);
                }

                if (!this.error.isOpen()) {

                    this.error.open({
                        autoclose: params.autoclose || false,
                        autofocus: false,
                        where: params.where || this.node,
                        how: params.how || how,
                        appendTo: params.appendTo || false
                    });

                    if (wasFocused) {
                        this._onfocus();
                    }
                }
            }
            return this;
        },

        /**
         * Hide inputs error
         * @returns {Object} nb.block
         */
        hideError: function() {
            if (this.data.error) {
                this.$node.removeClass('_nb-is-wrong');
                this.error.close();
            }
            return this;
        },

        /**
         * Set content of inputs error
         * @param {string} content - content for error
         * @fires 'nb-error-content-set'
         * @returns {Object} nb.block
         */
        setErrorContent: function(content) {
            if (this.data.error) {
                this.error.$node.find('._nb-popup-content').html(content);
                this.trigger('nb-error-content-set', this);
            }
            return this;
        },


        /**
         * Focus the input
         * @fires 'nb-focused'
         * @returns {Object} nb.block
         */
        focus: function() {
            if (!this.focused && this.isEnabled()) {
                nb.trigger('nb-focusout');
                this._onfocus();
                this.trigger('nb-focused', this);
            }
            return this;
        },

        /**
         * Blur the input
         * @fires 'nb-blured'
         * @returns {Object} nb.block
         */
        blur: function() {
            if (this.focused && this.isEnabled()) {
                this._onblur();
                this.trigger('nb-blured', this);
            }
            return this;
        },

        /**
         * Disables the input
         * @fires 'nb-disabled'
         * @returns {Object} nb.block
         */
        disable: function() {
            this.$node.addClass('_nb-is-disabled');
            this.$control.prop('disabled', true);
            this.trigger('nb-disabled', this);
            return this;
        },

        /**
         * Enables the input
         * @fires 'nb-enabled'
         * @returns {Object} nb.block
         */
        enable: function() {
            this.$node.removeClass('_nb-is-disabled');
            this.$control.prop('disabled', false);
            this.trigger('nb-enabled', this);
            return this;
        },

        /**
         * Set value of the input
         * @param {String|Object} value
         * @fires 'nb-value-set', 'nb-changed'
         * @returns {Object} nb.block
         */
        setValue: function(value) {
            
             // Check newValue and actualValue to avoid recursion

             // nbInput.on('nb-changed', function() {
             // var validValue = validate(this.getValue());
             // this.setValue(validValue);
             // });
             
            if (this.value != value) {
                this.value = value;
                this.$control.val(value);
                this.$control.trigger('input');
                this.trigger('nb-value-set', this);
                this.trigger('nb-changed', this);
            }
            return this;
        },

        /**
         * Get value of the input
         * @returns {String|Object} value
         */
        getValue: function() {
            // get actual value from <input/> and save it to instance
            return this.$control.val();
        },

        /**
         * Get name of the input
         * @returns {String|Object} name
         */
        getName: function() {
            return this.$control.prop('name');
        },

        /**
         * Set name of the input
         * @param {String|Object} value
         * @fires 'nb-name-set'
         * @returns {Object} nb.block
         */
        setName: function(value) {
            this.$control.attr('name', value);
            this.trigger('nb-name-set', this);
            return this;
        },

        /**
         * Return state of the input
         * @returns {Boolean}
         */
        isEnabled: function() {
            return !this.$control.prop('disabled');
        },

        /**
         * Resets value of the input
         * @fires 'nb-value-set'
         * @returns {Object} nb.block
         */
        reset: function(evt) {
            if (evt && evt.preventDefault) {
                evt.preventDefault();
            }

            this.setValue('');
            return this;
        },

        /**
         * Set hint of the input
         * @param {String} value
         * @fires 'nb-hint-set'
         * @returns {Object} nb.block
         */
        setHint: function(value) {
            if (this.$hint.length) {
                if (this.$hintGhost.length) {
                    this.$hint.find('._nb-input-hint-content').html(value);
                } else {
                    this.$hint.find('._nb-input-hint-inner').html(value);
                }
                this.trigger('nb-hint-set', this);
            }

            return this;
        },

        /**
         * Get hint of the input
         * @returns {String} hint
         */
        getHint: function() {
            var value = '';
            if (this.$hint.length) {

                if (this.$hintGhost.length) {
                    value = this.$hint.find('._nb-input-hint-content').html();
                } else {
                    value = this.$hint.find('._nb-input-hint-inner').html();
                }

            }
            return value;
        },

        /**
         * Destroy the button
         * @fires 'nb-destroyed'
         */
        destroy: function() {
            this.trigger('nb-destroyed', this);
            if (this.error) {
                this.error.nbdestroy();
                this.error.$node.remove();
            }
            $(document).off('mousedown', this._onmousedown);
            $(document).off('touchstart', this._onmousedown);
            this.nbdestroy();
        }
    }, 'base');


})();    

/* input/input.js end */

/* input-group/input-group.js begin */
nb.define('input-group', {
    events: {
        'click': 'oninit',
        'disable': 'onDisable',
        'enable': 'onEnable'
    },

    oninit: function() {
        var that = this;
        that.disabled = this.nbdata()['disabled'];
        $(this.children()).each(function() {
            if (this.$node.hasClass('nb-input')) {
                that.input = this;
            } else {
                that.button = this;
            }
        });
    },
    /*!
     * Disables the input-group
     */
    onDisable: function() {
        this.input.trigger('disable');
        this.button.disable();
        this.disabled = true;
    },

    /*!
     * Enables the input-group
     */
    onEnable: function() {
        this.input.trigger('enable');
        this.button.enable();
        this.disabled = false;
    }
}, 'base');

/* input-group/input-group.js end */

/* progress/progress.js begin */
nb.define('progress', {

    oninit: function() {
        var data = this.nbdata();

        if (data && data.type) {
            this.type = data.type;
        }

        this.$title = this.$node.find('.js-title');
        this.$control = this.$node.find('input');
        this.$bar = this.$node.find('.js-bar');
    },

    /**
     * Set value of the progress
     * @param {String|Number} value
     * @fires 'nb-value-set'
     * @returns {Object} nb.block
     */
    setValue: function(value) {
        var val = parseFloat(value);

        this.$control.val(val);
        this.$bar.css({width: val + '%'});

        if (this.type == 'percentage') {
            this.$title.html(val + '%');
        }
        this.trigger('nb-value-set', this);
        return this;
    },

    /**
     * Get value of the progress
     * @returns {String} value
     */
    getValue: function() {
        return this.$control.val();
    },

    /**
    * Change value of the progress by 1
    * @fires 'nb-changed'
    * @returns {Object} nb.block
    */
    tick: function() {
        var val = parseFloat(this.getValue());

        if (val < 100) {
            val++;
        }

        this.setValue(val);
        this.trigger('nb-changed', this);

        return this;
    }
}, 'base');

/* progress/progress.js end */

/* tabs/tabs.js begin */
/*
 * ### jQuery UI Depends:
 * 
 * - jquery.ui.tabs.js
 * - jquery.ui.core.js
 * - jquery.ui.widget.js
 */
nb.define('tabs', {
    oninit: function() {
        this.$node.tabs();
    }
}, 'base');

/* tabs/tabs.js end */

/* header/header.js begin */
nb.define('header', {
    events: {
        'click .nb-header-button': 'togglePress'
    },

    /*!
     * Toggles pressed state of button
     */

    togglePress: function(e) {
        var $target = $(e.target);
        $target.closest('.nb-header-button').toggleClass('nb-header-pressed-button');

        if ($target.hasClass('nb-services-icon')) {
            nb.trigger('services-click');
        }

        if ($target.hasClass('nb-settings-icon')) {
            nb.trigger('settings-click');
        }
    }
}, 'base');

/* header/header.js end */

/* suggest/suggest.js begin */
(function() {
    /*!
     * Саджест
     * @namespace jquery.ui.suggest
     * @extends {jquery.ui.autocomplete} http://api.jqueryui.com/autocomplete/
     * @description
     *      Саджест это блок сотоящий из инпута и выпадающего списка.
     *      При вводе какого-либо значения в инпут это значение матчится на список
     *      слов из источника данных, и подходящие элементы из исходного списка
     *      показываются в выпадающем списке, в котором пользователь может выбрать
     *      нужный ему элемент.
     *      После выбора элемента значение инпута меняется на значение выбранного элемента
     *
     *      Поддерживаемые события:
     *        nb-type – всплывает при вводе значения в инпут
     *        nb-select – всплывает при выборе значения из саджеста
     *        nb-keypress-enter – всплывает при нажатии на энетер и отсутвии саджеста
     */

    /*!
     * Опции инициализации саджеста
     * @description
     *     Эти опции могут быть определены в yate шаблонах при описании наноблока.
     *     Опции можно менять в рантайме через событие setOption
     *
     * @example
     *     var sug = nb.find('#mysuggest');
     *     sug.setOption({ 'source','http://mydomain.com/user/search'});
     *
     * @type {Object}
     */
    var optionsSuggest = {
        /*!
         * Истоник данных
         * @description См. http://api.jqueryui.com/autocomplete/#option-source
         *
         * @type {(String|Array|Function)}
         */
        source: null,

        /*!
         * Количество элеметов, при котором в выпадающем списке появляется скролл
         *
         * @type {Number}
         */
        countMax: 10,

        /*!
         * Тип саджеста
         * @description
         *     Указывает из какого шаблона брать верстку для элемента выпадающего списка.
         *     См. файл suggest.yate: match /[.type].item nb-suggest
         *
         * @type {String}
         */
        type: 'default',

        /*!
         * Включение или отключение выделения жирным начертанием результатов
         * матчинга в выпадающем списке.
         *
         * @type {Boolean}
         */
        highlight: false,

        /*!
         * Размер блока.
         * @description Применятся на размер элементов в выпадающем списке.
         *
         * @type {String}
         */
        size: 's',

        /*!
         * Количесвто введенных символов, после которого начинать поиск слов
         */
        minLength: 2
    };

    $.widget("ui.suggest", $.ui.autocomplete, {
        options: optionsSuggest,

        _renderMenu: function(ul, items) {
            var that = this;
            var html = '';

            $.each(items, function(index, item) {
                html += that._renderItem(item);
            });

            $(html).appendTo(ul);

            ul.children('li').each(function(index) {
                $(this).data("ui-autocomplete-item", items[index]);
            });
        },

        _renderItem: function(item) {
            var clone = $.extend({}, item);

            if (this.options.highlight) {
                if (typeof highlightings[this.options.type] == 'function') {
                    highlightings[this.options.type](clone, this._value());
                } else if (typeof this.options.highlight == 'function') {
                    this.options.highlight(clone, this._value());
                }
            }

            clone.labelContent = clone.label;
            delete clone.label;

            var renderData = {
                item: clone,
                type: this.options.type,
                size: this.options.size
            };

            if ($.isFunction(this.options.renderItem)) {
                return this.options.renderItem(renderData);
            } else {
                return '<li><a href="#">' + clone.labelContent + '</a></li>';
            }
        },

        _suggest: function(items) {
            this._super(items);

            if (this.options.countMax && !this._heightMax) {
                this._heightMax = this.menu.element.children().eq(0).height() * this.options.countMax;
                this.menu.element.css({
                    'max-height': this._heightMax,
                    'overflow-y': 'auto',
                    'overflow-x': 'hidden'
                });
            }
        },

        search: function(value, event) {
            this._trigger('_search');

            return this._super(value, event);
        }
    });

    var highlightings = {
        'default': function(item, term) {
            var matcher = new RegExp('(' + $.ui.autocomplete.escapeRegex(term) + ')', "i");
            item.label = item.label.replace(matcher, '<b>$1</b>');
        },

        'username': function(item, term) {
            var matcher = new RegExp('(' + $.ui.autocomplete.escapeRegex(term) + ')', "ig");

            item.usernameHighlighted = item.username.replace(matcher, '<span class="_nb-suggest-hl">$1</span>');

            if (typeof item.email == 'string') {
                item.emailHighlighted = item.email.replace(matcher, '<span class="_nb-suggest-hl">$1</span>');
            }
        }
    };

    /*
     * ### jQuery UI Depends:
     * - jquery.ui.autocomplete.js
     * - jquery.ui.button.js
     * - jquery.ui.core.js
     * - jquery.ui.widget.js
     * - jquery.ui.position.js
     * - jquery.ui.menu.js
     */

    /*!
     * @class nb.block.Suggest
     * @augments nb.block.Base
     */
    nb.define('suggest', {

        /**
         * Init select
         * @fires 'nb-suggest_inited'
         */
        oninit: function() {
            var that = this;
            var nodeTagName = this.$node[0].tagName.toLowerCase();

            if (nodeTagName === 'input' || nodeTagName === 'textarea') {
                this.$control = this.$node;
            } else {
                this.$control = this.$node.find('input');
                this.input = this.children()[0];
            }

            var source = this.$node.data('source');

            this.$control.on('keydown.nb-suggest', function(e) {
                var keyCode = $.ui.keyCode;

                if ($.inArray(e.keyCode, [ keyCode.ENTER, keyCode.NUMPAD_ENTER ]) !== -1) {
                    if (!this.$jUI.data().uiSuggest.menu.active) {
                        this.trigger('nb-keypress-enter', this, this.getValue());
                    }
                }
            }.bind(this));

            this.$jUI = this.$control.suggest({
                source: source,
                countMax: this.$node.data('countMax'),
                type: this.$node.data('type'),
                size: this.$node.data('size'),
                highlight: this.$node.data('highlight'),
                minLength: this.$node.data('minLength'),
                renderItem: function(data) {
                    return yr.run(that.getYateModuleName(), data, 'nb-suggest');
                }
            });

            this.$suggest = this.$jUI.data().uiSuggest.menu.element;

            this.$suggest.addClass(this.$node.data('class-suggest'));

            this.$jUI.on('suggest_search.nb-suggest', function() {
                this.trigger('nb-type', this, this.getValue());
            }.bind(this));

            this.$jUI.on('suggestselect.nb-suggest', function(e, item) {
                this.$selected = item.item;
                this.trigger('nb-select', this, item.item);
            }.bind(this));

            this.trigger('nb-inited', this);
        },

        /**
         * Get selected item from suggest
         * @return {Object}
         */
        getSelected: function() {
            return this.$selected;
        },

        /**
         * Sets option to the jUI widget
         * http://api.jqueryui.com/autocomplete/#method-option
         * @param  {Object} option `{ name: value }` имя и значение опции
         * @fires 'nb-option-set'
         * @returns {Object} nb.block
         */
        setOption: function(option) {
            this.$jUI.suggest('option', option);
            this.trigger('nb-option-set', this);
            return this;
        },


        /**
         * Gets option of the jUI widget
         * http://api.jqueryui.com/autocomplete/#method-option
         * @param {String} option
         * @returns {String} option value
         */
        getOption: function(option) {
            return this.$jUI.suggest('option', option);
        },

        /*
         * Set new items for suggest
         * @params {Array} source New source
         * @fires 'nb-source-changed'
         * @returns {Object} nb.block
         */
        setSource: function(source) {
            this.setOption({'source': source});
            this.trigger('nb-source-set', this);
            return this;
        },

        /*
         * Get items from suggest
         * @returns {Array} source
         */
        getSource: function() {
            return this.getOption('source');
        },

        /**
         * Скрывает список предложений
         * @fires 'nb-closed'
         * @returns {Object} nb.block
         */
        close: function() {
            this.$jUI.suggest('close');
            this.trigger('nb-closed', this);
            return this;
        },

        /**
         * Disables the suggest
         * @fires 'nb-disabled'
         * @returns {Object} nb.block
         */
        disable: function() {
            if (this.isEnabled()) {
                if (this.input) {
                    this.input.disable();
                } else {
                    this.$control.prop('disabled', true);
                }
                this.$node.addClass('_nb-is-disabled');
                this.$jUI.suggest('disable');
                this.trigger('nb-disabled', this);
            }
            return this;
        },

        /**
         * Enables the suggest
         * @fires 'nb-enabled'
         * @returns {Object} nb.block
         */
        enable: function() {
            if (!this.isEnabled()) {
                if (this.input) {
                    this.input.enable();
                } else {
                    this.$control.prop('disabled', false);
                }
                this.$node.removeClass('_nb-is-disabled');
                this.$jUI.suggest('enable');
                this.trigger('nb-enabled', this);
            }
            return this;
        },

        /**
         * Return state of the suggest
         * @returns {Boolean}
         */
        isEnabled: function() {
            return !this.$node.hasClass('_nb-is-disabled');
        },

        /**
         * Focus the suggest
         * @fires 'nb-focused'
         * @returns {Object} nb.block
         */
        focus: function() {
            if (this.isEnabled()) {
                if (this.input) {
                    this.input.focus();
                } else {
                    this.$control.focus();
                }
            }
            this.trigger('nb-focused', this);
            return this;
        },

        /**
         * Get name of the suggest
         * @returns {String|Object} name
         */
        getName: function() {
            return this.$control.prop('name');
        },

        /**
         * Set name of the suggest
         * @param {string} name
         * @fires 'nb-name-set'
         * @returns {Object} nb.block
         */
        setName: function(name) {
            this.$control.prop('name', name);
            this.trigger('nb-name-set', this);
            return this;
        },

        /**
         * Blur the suggest
         * @fires 'nb-blured'
         * @returns {Object} nb.block
         */
        blur: function() {
            if (this.isEnabled()) {
                if (this.input) {
                    this.input.blur();
                } else {
                    this.$control.blur();
                }
            }
            this.trigger('nb-blured', this);
            return this;
        },

        /**
         * Get current value of the suggest
         * @returns {String | Number}
         */
        getValue: function() {
            return this.$control.val();
        },

        /**
         * Get current value of the suggest
         * @param {String} value
         * @fires 'nb-value-set'
         * @returns {Object} nb.block
         */
        setValue: function(value) {
            if (this.isEnabled()) {
                this.$control.val(value);
                this.trigger('nb-value-set', this);
            }
            return this;
        },

        /**
         * Search value in the source array and open suggest popup
         * @param  {string|number} value
         * @returns {Object} nb.block
         */
        search: function(value) {
            this.$jUI.suggest("search", value);
            return this;
        },

        /**
         * Destroy the suggest
         * @fires 'nb-destroyed'
         */
        destroy: function() {
            if (this.$control && this.$jUI) {
                var jUIData = this.$jUI.data();
                this.$control.off('.nb-suggest');
                this.$jUI.off('.nb-suggest');
                if (jUIData && jUIData.uiSuggest) {
                    this.$jUI.suggest('destroy');
                }
            }
            this.trigger('nb-destroyed', this);
            this.nbdestroy();
        }

    }, 'base');

})();

/* suggest/suggest.js end */

/* toggler/toggler.js begin */
nb.define('toggler', {
    events: {
        'click': 'toggle'
    },

    /*!
     * Init the toggler
     * @fires 'nb-inited'
     */
    oninit: function() {
        this.$control = this.$node.find('._nb-toggler-checkbox');
        this.trigger('nb-inited', this);
        return this;
    },

    /**
     * Set value of the toggler
     * @param {String} value of the check state
     * @fires 'nb-value-set'
     * @returns {Object} nb.block
     */
    setValue: function(value) {
        this.$control.attr('value', value);
        this.trigger('nb-value-set', this);
        return this;
    },

    /**
     * Returns value of the toggler
     * @return {String} value
     */
    getValue: function() {
        return this.$control.prop('value');
    },

    /**
     * Toggle to the opposite value
     * Do nothing if toggler is disabled
     * @fires 'nb-changed'
     * @returns {Object} nb.block
     */
    toggle: function() {
        if (this.isEnabled()) {
            if (this.isChecked()) {
                this.uncheck();
            } else {
                this.check();
            }
            this.trigger('nb-changed', this);
        }
        return this;
    },

    /**
     * Returns name of the toggler
     * @return {String} value
     */
    getName: function() {
        return this.$control.attr('name');
    },

    /**
     * Set name of the toggler
     * @param {String} value
     * @fires 'nb-name-set'
     * @returns {Object} nb.block
     */
    setName: function(value) {
        this.$control.attr('name', value);
        this.trigger('nb-name-set', this);
        return this;
    },

    /**
     * Disable toggler
     * @fires 'nb-disabled'
     */
    disable: function() {
        this.$control.prop('disabled', true);
        this.$node.addClass('_nb-is-disabled');
        this.trigger('nb-disabled', this);
        return this;
    },

    /**
     * Enable toggler
     * @fires 'nb-enabled'
     */
    enable: function() {
        this.$control.prop('disabled', false);
        this.$node.removeClass('_nb-is-disabled');
        this.trigger('nb-enabled', this);
        return this;
    },

    /**
     * Return enable state of the toggler
     * @returns {Boolean}
     */
    isEnabled: function() {
        return !this.$control.prop('disabled');
    },


    /**
     * Focus the input
     * @fires 'nb-focused'
     * @returns {Object} nb.block
     */
    focus: function() {
        if (this.isEnabled()) {
            if (!this.$node.hasClass('_nb-is-focused')) {
                this.$node.addClass('_nb-is-focused').focus();
                this.focused = true;
                this.$control.focus();
                this.trigger('nb-focused', this);
            }
        }
        return this;
    },

    /**
     * Blur the input
     * @fires 'nb-blured'
     * @returns {Object} nb.block
     */
    blur: function() {
        this.$node.removeClass('_nb-is-focused').blur();
        this.focused = false;
        this.trigger('nb-blured', this);
        return this;
    },

    /**
     * Return check state of the toggler
     * @returns {Boolean}
     */
    isChecked: function() {
        return this.$control.prop('checked');
    },

    /**
     * Checking toggler
     * @fires 'nb-checked'
     * @returns {Object} nb.block
     */
    check: function() {
        if (this.isEnabled() && !this.isChecked()) {
            this.$control.prop({
                'checked': true
            });
            this.$node.addClass('_nb-is-checked');
            this.trigger('nb-checked', this);
        }
        return this;
    },

    /**
     * Unchecking toggler
     * @fires 'nb-unchecked'
     * @returns {Object} nb.block
     */
    uncheck: function() {
        if (this.isEnabled() && this.isChecked()) {
            this.$control.prop({
                'checked': false
            });
            this.$node.removeClass('_nb-is-checked');
            this.trigger('nb-unchecked', this);
        }
        return this;
    },

    /**
     * Destroy the toggler
     * @fires 'nb-destroyed'
     */
    destroy: function() {
        this.trigger('nb-destroyed', this);
        this.nbdestroy();
    }
}, 'base');

/* toggler/toggler.js end */

