
function createSignalObject(initialValue, options){
    const result = createSignalImpl(initialValue, options);
    result.event = (eventHandler) => {
        const subscription = result.subscribe(eventHandler);
        subscription.cancel = subscription;
        return subscription;
    };
    Object.defineProperties(result, {
        value: {
            enumerable: true,
            configurable: false,
            get: () => result.read(),
            set: newValue => result.update(newValue)
        }
    });
    Object.freeze(result);
    return result;
}

export const createSignal = createSignalObject;
export const create = createSignalObject;

const _value = Symbol("value");
const _fn = Symbol("fn");

function createSignalImpl(initialValue, options){
    var value;
    var firstUpdate = true;
    const channel = createChannel(options);
    function read(){
        return value;
    }
    let equals = Object.is;
    if (options != null && options.equals != null){
        equals = options.equals;
    }
    function update(newValue){
        if (!firstUpdate && equals(value, newValue)){
            // only update if values are different
            return;
        }
        firstUpdate = false;
        value = newValue;
        Object.seal(value);
        Object.freeze(value);
        channel.dispatch(value);
    }
    function subscribe(fn){
        return channel.subscribe(fn);
    }

    let signal = { subscribe, update, read };
    if (options != null){
        signal = addSignalOptions(signal, options, initialValue);
    } else {
        signal.update(initialValue)
    }
    return signal;
}

export function createChannel(options){

    const dispatcherFactory = (options != null && options.awaitListeners === true)
        ? asyncDispatcher 
        : basicDispatcher;

    let channel = basicChannel(dispatcherFactory);
    if (options != null) {
        channel = addOptions(channel, options);
    }
    return channel;
}

function addSignalOptions(signal, { transform, input, inputs, delay }, initialValue){
    if (transform != null){
        signal = addSignalTransform(signal, transform);
    }
    if (input != null){
        signal = addSignalInput(signal, input);
    }
    if (inputs != null){
        signal = addSignalInputs(signal, inputs);
    }
    signal.update(initialValue);
    if (delay != null){
        signal = addSignalDelay(signal, delay);
    }
    return signal;
}

function addSignalDelay(signal, delay){
    let value, timeout = null;
    const read = signal.read;
    const subscribe = signal.subscribe;

    const update = updatedValue => {
        value = updatedValue;
        if (timeout != null){
            return;
        }
        setTimeout(() =>  {
            timeout = null;
            signal.update(value)
        }, delay);
    }

    return { subscribe, update, read };
}

function addSignalTransform(signal, transform){
    const update = value => {
        signal.update(transform(value))
    };
    const read = signal.read, subscribe = signal.subscribe;
    return { subscribe, update, read };
}

function addSignalInput(signal, input){
    let didSubscribe = false;
    const subscribe = fn => {
        if (!didSubscribe){
            didSubscribe = true;
            input.event(signal.update);
        }
        signal.subscribe(fn);
    }
    const update = () => {
        signal.update(input.value);
    }
    const read = () => {
        if (!didSubscribe) update();
        return signal.read();
    };
    return { subscribe, update, read };
}

function addSignalInputs(signal, inputs){

    let didSubscribe = false;
    const subscribe = fn => {
        if (!didSubscribe){
            didSubscribe = true;
            for (let i=0; i<inputs.length; i++){
                const input = inputs[i];
                input.event(update);
            }
        }
        signal.subscribe(fn);
    }

    const update = () => signal.update(inputs.map(input => input.value));

    const read = () => {
        if (!didSubscribe) update();
        return signal.read();
    };
    return { subscribe, update, read };
}

function basicChannel (dispatcherFactory){

    let dispatchers = [];

    function subscribe(fn){
        dispatchers.push(dispatcherFactory(fn));
        return () => {
            dispatchers = dispatchers.filter(item => !item.equals(fn));
        }
    };

    function dispatch(...args){
        dispatchers.forEach(sub => sub.dispatch(...args));
    }

    return { subscribe, dispatch };
}

const addOptions = (channel, { onSubscribe, onFirstSubscribe }) => {
    if(onSubscribe != null){
        channel = addSubscribeListener(channel, onSubscribe);
    }
    if(onFirstSubscribe != null){
        channel = addFirstSubscribeListener(channel, onFirstSubscribe);
    }
    return channel;
}

const addSubscribeListener = (channel, listener) => {
    const dispatch = channel.dispatch;
    const subscribe = (fn) => {
        const unsub = channel.subscribe(fn);
        listener(fn);
        return unsub;
    }
    return { subscribe, dispatch };
}

const addFirstSubscribeListener = (channel, listener) => { 
    const dispatch = channel.dispatch;
    const subscribe = (fn) => {
        const unsub = channel.subscribe(fn);
        listener(fn);
        result.subscribe = channel.subscribe;
        return unsub;
    }
    const result = { dispatch, subscribe };
    return result;
}

function basicDispatcher(fn){
    return {
        dispatch: (...args) => {
            try {
                return fn(...args);
            } 
            catch (exception) {
                console.error('signal event handler failed', exception);
            }
        },
        equals: other => fn === other
    }
}

function asyncDispatcher(fn){
    let value;
    let active = false;
    let dirty = false;

    function dispatch(...args){
        value = args;
        dirty = true;
        if (!active) {
            activate();
        }
    }
    
    async function activate(){
        active = true;
        while(dirty){
            dirty = false;
            try{
                await(fn(...value));
            }
            catch (exception) {
                console.error('signal event handler failed', exception);
            }
        }
        active = false;
    }

    function equals(other){
        return fn === other;
    }

    return {
        equals, 
        dispatch
    }
}