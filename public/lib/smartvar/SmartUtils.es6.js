SmartUtils = class SmartUtils {

    static isObjLiteral(_obj) {
        var _test  = _obj;
        return (  typeof _obj !== 'object' || _obj === null ?
                false :
                (
                    (function () {
                        while (!false) {
                            if (  Object.getPrototypeOf( _test = Object.getPrototypeOf(_test)  ) === null) {
                                break;
                            }
                        }
                        return Object.getPrototypeOf(_obj) === _test;
                    })()
                )
        );
    }

    static isFunction(functionToCheck) {
        var getType = {};
        return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    }

    static isArray(obj) {
        return obj instanceof Array;
    }

    static isSmartVar(obj) {
        return obj instanceof SmartVar;
    }

    static isObjLiteral(_obj) {
        var _test  = _obj;
        return (  typeof _obj !== 'object' || _obj === null ?
                false :
                (
                    (function () {
                        while (!false) {
                            if (  Object.getPrototypeOf( _test = Object.getPrototypeOf(_test)  ) === null) {
                                break;
                            }
                        }
                        return Object.getPrototypeOf(_obj) === _test;
                    })()
                )
        );
    }

    static isFunction(functionToCheck) {
        var getType = {};
        return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    }

    static isArray(obj) {
        return obj instanceof Array;
    }
    static isSmartVar(obj) {
        return obj instanceof SmartVar;
    }

}

