

SmartStream = class SmartStream {

    constructor() {
        this._subscribers = [];
        this._processFunc = null;

        return this;
    }

    subscribe (stream, filter) {
        var handle = this._subscribers.length;

        this._subscribers.push({ 'stream': stream, 'callback': null, 'filter': filter, 'active':true});

        return handle;
    }

    subscribeCallback (callback, filter) {
        var handle = this._subscribers.length;

        this._subscribers.push({ 'callback': callback, 'stream': null, 'filter': filter, 'active':true});

        return handle;
    }

    unSubscribe(handle) {
        this._subscribers[handle].active = false;
    }

    update (newObj, parentElement, changedAttr, newValue, oldValue)  {

        this.processAttributeEvent(newObj, parentElement, changedAttr, newValue, oldValue);

        //console.log('Update: Attr: '+changedAttr+ " , value: "+newValue);
        this.notifySubscribers(newObj, parentElement, changedAttr, newValue, oldValue);
    }

    processAttributeEvent(newObj, parentElement, changedAttr, newValue, oldValue) {

    }

    // An element on this object changed in value notify all _subscribers
    // TODO: decouple the message processing, from the message generation
    notifySubscribers (obj, parentElement, attr, value, oldValue, msg) {
        var _self = this;

        for (var f = 0; f< _self._subscribers.length;f++) {
            if (_self._subscribers[f].filter) {
                if (_self._subscribers[f].filter === attr) {

                    if (_self._subscribers[f].active) {

                        if (_self._subscribers[f].callback) {
                            _self._subscribers[f].callback(attr,value, oldValue);

                        } else if (_self._subscribers[f].stream._processFunc) {
                            _self._subscribers[f].stream._processFunc(attr,value, oldValue);
                        }
                        if (_self._subscribers[f].stream) {
                            _self._subscribers[f].stream.update(attr,value, oldValue);
                        }

                    }
                } else {
                    // ignore messaging _subscribers if the filter does not match
                }
            } else {
                if (_self._subscribers[f].active) {
                    if (_self._subscribers[f].callback) {
                        _self._subscribers[f].callback(attr, value, oldValue);
                    } else if (_self._subscribers[f].stream._processFunc) {
                        _self._subscribers[f].stream._processFunc(obj, parentElement, attr, value, oldValue);
                    }
                    if (_self._subscribers[f].stream) {
                        _self._subscribers[f].stream.update(obj, parentElement, attr, value, oldValue);
                    }
                }
            }
        }
    }

    changes (processFunc)  {

        var newStream = new Stream();
        newStream.processFunc = processFunc;
        this.subscribe(newStream);

        return newStream;

    }

}