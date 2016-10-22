/**
 * Created by marknorman on 17/07/15.
 */

// Pass in an array of arrays get return a single array
flatten = function flatten() {
    // variable number of arguments, each argument could be:
    // - array
    //   array items are passed to flatten function as arguments and result is appended to flat array
    // - anything else
    //   pushed to the flat array as-is
    var flat = [],
        i;
    for (i = 0; i < arguments.length; i++) {
        if (arguments[i] instanceof Array) {
            flat = flat.concat(flatten.apply(null, arguments[i]));
        } else {
            flat.push(arguments[i]);
        }
    }
    return flat;
};


Sequence = class Sequence  {
    // TODO: make the param list variable
    constructor(parent, params) {
        this._parent = parent;
        this._params = params;
        return this;
    }

    arraySequence(sourceData, params) {
        return new  ArraySequence(sourceData, params)
    }

    transducer(xfr, params) {
        return new TransducerSequence(this, xfr, params);
    }

    transform(xfrm, params) {
        return new TransformSequence(this, xfrm, params);
    }

    // Arguments -  variable list of sources
    merge(params) {
        let streams = flatten(this, Array.slice(arguments));

        return new MergeSequence([], streams.reverse(), params);
    }

    _get() {
        return this._parent._get();
    }

    _getParentSource() {
        return this._parent._getParentSource();
    }

    toArray(flattenResults = false) {
        var results = [];

        do {
            var item = this._get();

            if (item) {
                results.push(item);
            }

        } while (typeof(item) !== "undefined");

        return flattenResults ? flatten(results) : results;
    }

    // each take a callback to receive data, for each upstream change
    // i.e. this function is
    each(callback) {
        // if the source changes, update the callback function with the new data

        return function() {};
    }
};

ArraySequence = class ArraySequence extends Sequence {
    constructor(arrayData, params) {
        super(null,params);
        this._arrayData = arrayData;
        this._pos = 0;
    };

    reset() {
        this._arrayData = [];
        this._pos = 0;
    }

    _get() {
        // TODO: Use yield to make this async?
        let item = this._arrayData[this._pos++];
        return item ? item : undefined; // return undefined to indicate end of list
    }

    _getParentSource() {
        return this;
    }

    append(newData) {
        this._arrayData.push(newData);
    }

};

TransducerSequence = class TransducerSequence extends Sequence {
    constructor(parent, xfr, params) {
        super(parent, params);
        this._xfr = xfr;
    };

    // eagerly consume the available streamusing the supplied step function to return a new value
    // if the step functionr return undefined then terminate and return the result so far
    // if the step function returns a value, call the transform function to get a transformed value
    // if the xfrmed value == undefined then the result has been filtered.
    // TODO: refactor for tail recursion
    _xdr = (stepFunction, xfr, results=[], params={}, flattenResults=true) => {

        let newItem = stepFunction();

        if (typeof(newItem) !== 'undefined') {
            var xfrmValue = xfr(newItem);
            if (xfrmValue) {
                results.push(xfrmValue);
            }
            return this._xdr(stepFunction, xfr, results, params, flattenResults);
        } else {
            var sequenceData = results.length > 0 ? [flattenResults ? flatten(results) : result] : undefined;
            return sequenceData;
        }
    };

    _get() {

        // Take the current value and process the data via the transducer
        let res = this._xdr(super._get.bind(this), this._xfr, [], this._params/*, flattenResults*/);
        return res;
    }
};

TransformSequence = class TransformSequence extends Sequence {
    constructor(parent, xfrm, params) {
        super(parent, params);
        this._xfrm = xfrm;
    };

    _get() {
        let currentValue = super._get();

        // Take the current value and process the data via the transducer
        return typeof(currentValue) !== "undefined" ? this._xfrm(currentValue, this._params) : currentValue;
    }
};


MergeSequence = class MergeSequence extends ArraySequence {

    constructor(parent, streams, params) {
        super([], params);
        this._parent = parent;
        this._streams = streams;
    };

    _get() {

        // Check if we have reached the end of the current buffer
        if (this._pos  === this._arrayData.length) {

            // Clear down previous data
            this.reset();

            // pull data from all streams
            let streamVals = this._streams.reduce( (previousValue, stream) => {
                let val = stream._get();
                if (val) {
                    previousValue.push(val);
                }
                return previousValue;
            },[]);

            this._arrayData = this._arrayData.concat(streamVals);
        }

        return this._pos  < this._arrayData.length ? super._get() : undefined;
    };

};

SmartVarSequence = class SmartVarSequence extends Sequence {
    constructor(smartVar, params) {
        super(null,params);

        this._smartVar = smartVar;
        this.supportedPaths = [];


    }

    addPath(newPath) {
        this.supportedPaths.push(newPath);
        return this;
    }

    _newData(attr, data, filter) {}

};
