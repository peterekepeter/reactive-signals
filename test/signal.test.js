import { createSignal } from '..';

test("has 'value' property which is r/w", () => {
    const signal = createSignal();
    expect(signal.value).not.toBe(42);
    signal.value = 42;
    expect(signal.value).toBe(42);
});

test("when property is set, event is triggered", () => {
    const signal = createSignal();
    let triggerCount = 0;
    signal.event(() => triggerCount++);
    expect(triggerCount).toBe(0);
    signal.value = 42;
    expect(triggerCount).toBe(1);
});

test("event handler can be removed", () => {
    const signal = createSignal();
    let triggerCount = 0;
    const subscription = signal.event(() => triggerCount++);
    expect(triggerCount).toBe(0);
    signal.value = 42;
    expect(triggerCount).toBe(1);
    subscription.cancel();
    signal.value = 13;
    expect(triggerCount).toBe(1);
});

test("signal only notifies of changes", () => {
    const signal = createSignal();
    let triggerCount = 0;
    signal.value = 13;
    signal.event(() => triggerCount++);
    signal.value = 13;
    expect(triggerCount).toBe(0);
    signal.value = 42;
    expect(triggerCount).toBe(1);
    signal.value = 42;
    expect(triggerCount).toBe(1);
})

test("signal can recevive object comparer", () => {
    const signal = createSignal({x:1,y:2}, {
        equals: (a,b) => a.x === b.x && a.y === b.y
    });
    let triggerCount = 0;
    signal.event(() => triggerCount++);
    expect(triggerCount).toBe(0);
    signal.value = {x:1, y:2};
    expect(triggerCount).toBe(0);
    signal.value = {x:1, y:3};
    expect(triggerCount).toBe(1);
    signal.value = {x:1, y:3};
    expect(triggerCount).toBe(1);
});