import { createSignal } from '..';

test("can be created", () =>{
    createSignal(true);
});

test("inital value can be read", () => {
    const signal = createSignal(true);
    expect(signal.read()).toBe(true);
});

test("value can be updated", () => {
    const signal = createSignal(true);
    signal.update(42);
    expect(signal.read()).toBe(42);
});

test("receives updates", () => {
    var received = null;
    const signal = createSignal(42);
    signal.subscribe(value => received = value);
    signal.update("cat");
    expect(received).toBe("cat");
})

test("can unsubscribe", () => {
    var received = null;
    const signal = createSignal();
    const unsub = signal.subscribe(value => received = value);
    signal.update(42);
    expect(received).toBe(42);
    unsub();
    signal.update(13);
    expect(received).toBe(42);
})

test("initial values are sealed", () => {
    const signal = createSignal({ok:true});
    expect(Object.isSealed(signal.read())).toBe(true);
});

test("initial values are frozen", () => {
    const signal = createSignal({ok:true});
    expect(Object.isFrozen(signal.read())).toBe(true);
});

test("updated values are sealed", () => {
    const signal = createSignal({ok:true});
    signal.update({ok:false});
    expect(Object.isSealed(signal.read())).toBe(true);
});

test("updated values are frozen", () => {
    const signal = createSignal({ok:true});
    signal.update({ok:false});
    expect(Object.isFrozen(signal.read())).toBe(true);
});

test("updating calls listeners if value changed", () => {
    const signal = createSignal(true);
    let received = null;
    let updateCount = 0;
    signal.subscribe(value => {
        received = value;
        updateCount++;
    });
    
    signal.update(false);
    expect(received).toBe(false);
    expect(updateCount).toBe(1);

    signal.update(false);
    expect(updateCount).toBe(1);

    signal.update(true);
    expect(received).toBe(true);
    expect(updateCount).toBe(2);
});

test("accepts same options as channel", () => {
    let first = 0;
    let subscribed = 0;
    const signal = createSignal(true, {
        onFirstSubscribe: () => first++,
        onSubscribe: () => subscribed++
    });
    expect([first, subscribed]).toStrictEqual([0,0]);
    signal.subscribe(() => {});
    expect([first, subscribed]).toStrictEqual([1,1]);
    signal.subscribe(() => {});
    expect([first, subscribed]).toStrictEqual([1,2]);
})

test("onFirstSubscribe only triggered once", () => {
    let count = 0;
    const signal = createSignal(true, {
        onFirstSubscribe: () => count++
    });
    signal.subscribe(() => {});
    signal.subscribe(() => {});
    signal.subscribe(() => {});
    expect(count).toBe(1);
})

test("can transform value", () => {
    const signal = createSignal(2.0, { transform: value => value * value });
    expect(signal.read()).toBe(4.0);
    let receivedValue = null;
    signal.subscribe(v => receivedValue = v);
    expect(receivedValue).toBe(null);
    signal.update(3.0);
    expect(signal.read()).toBe(9.0);
    expect(receivedValue).toBe(9.0);
})

test("can take another signal as input", () =>{
    const originalSignal = createSignal(2.0);
    const signal = createSignal(null, {
        input: originalSignal
    })
    expect(signal.read()).toBe(2.0);
    let receivedValue = null;
    signal.subscribe(v => receivedValue = v);
    originalSignal.update(3.0);
    expect(receivedValue).toBe(3.0);
})

test("can take multiple signal inputs, and transform them", () => {
    const signalA = createSignal(2.0);
    const signalB = createSignal(3.0);
    const signalY = createSignal(null, {
        inputs: [signalA, signalB],
        transform: ([a,b]) => a*b
    }) 
    expect(signalY.read()).toBe(6);
    signalA.update(3);
    expect(signalY.read()).toBe(9);
    let receivedValue = null;
    signalY.subscribe(v => receivedValue = v);
    signalB.update(4.0);
    expect(receivedValue).toBe(12);
});