import { createChannel } from '..';

describe("Channel", () => {

    test("can be instantiated", () => {
        const channel = createChannel();
    })

    test("can be subscribed to", () => {
        const channel = createChannel();
        channel.subscribe(() => {
            'test';
        });
    })

    test("dispatching calls subscribers", () => {
        const channel = createChannel();
        var callCount = 0;
        channel.subscribe(() => callCount++);
        channel.subscribe(() => callCount++);
        expect(callCount).toBe(0);
        channel.dispatch();
        expect(callCount).toBe(2);
    })

    test("subscription can be ended", () => {
        const channel = createChannel();
        var callCount = 0;
        const unsubscribeFirst = channel.subscribe(() => callCount++);
        const unsubscribeSecond = channel.subscribe(() => callCount++);
        unsubscribeFirst();
        expect(callCount).toBe(0);
        channel.dispatch();
        expect(callCount).toBe(1);
    })

    test("dispatched arguments are passed to subscribers", () => {
        const channel = createChannel();
        var state = null;
        channel.subscribe(value => state = value);
        expect(state).toBe(null);
        channel.dispatch(42);
        expect(state).toBe(42);
    })

    test("subscriber exceptions don't break the channel", () => {
        const original = console.error;
        console.error = () => {};
        const channel = createChannel();
        var state = null;
        channel.subscribe(() => { throw "banana" });
        channel.subscribe(() => { state = "peanuts" });
        channel.dispatch();
        console.error = original;
        expect(state).toBe("peanuts");
    })

    test("exceptions are logged", () => {
        const original = console.error;
        var state = null;
        console.error = exception => state = exception;
        const channel = createChannel();
        channel.subscribe(() => { throw "babana" });
        expect(state).toBe(null);
        channel.dispatch();
        console.error = original;
        expect(state).not.toBe(null);  
    })

    test("can detect when somebody subscribes", () => {
        var count = 0;
        const channel = createChannel({ onSubscribe: () => { count++; } })
        expect(count).toBe(0);
        channel.subscribe(() => {});
        expect(count).toBe(1);
        channel.subscribe(() => {});
        expect(count).toBe(2);
    })

    test("can detect first subscriber", () => {
        var count = 0;
        const channel = createChannel({ onFirstSubscribe: () => { count++; } })
        expect(count).toBe(0);
        channel.subscribe(() => {});
        expect(count).toBe(1);
        channel.subscribe(() => {});
        expect(count).toBe(1);
    })

    test("when detecting subscriber, subscribe still return fn", () => {
        const channel = createChannel({ onSubscribe: () => { } })
        const unsub = channel.subscribe(() => {});
        expect(typeof unsub).toBe("function");
    })

    test("when detectng first subscriber, subscribe returns fn", () => {
        const channel = createChannel({ onFirstSubscribe: () => { } })
        const unsub = channel.subscribe(() => {});
        expect(typeof unsub).toBe("function");
    })

    test("unsubscribing inside handler does not cause second subscriber to miss out on the event", () => {
        var first = 0;
        var second = 0;
        const channel = createChannel();
        const unsubFirst = channel.subscribe(() => {
            first++;
            unsubFirst();
        });
        const unsubSecond = channel.subscribe(() => {
            second++;
        })
        expect([first, second]).toEqual([0,0]);
        channel.dispatch();
        expect([first, second]).toEqual([1,1]);
    })
})