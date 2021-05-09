import { createSignal } from '..';

jest.useFakeTimers();

test("call setTimeout", ()=>{
    let signal = createSignal(null, {
        delay: 100
    });
    let received = null;
    signal.subscribe(value => received = value);
    expect(setTimeout).toHaveBeenCalledTimes(0);
    signal.update(42);
    expect(setTimeout).toHaveBeenCalledTimes(1);
});

test("update after delay", () =>{
    let signal = createSignal(null, {
        delay:100
    });
    let received = null;
    signal.subscribe(value => received = value);
    signal.update(42);

    expect(received).toBe(null);
    jest.advanceTimersByTime(99);
    expect(received).toBe(null);
    jest.advanceTimersByTime(2);
    expect(received).toBe(42);
});

test("only last value is received", () =>{
    let signal = createSignal(null, {
        delay:100
    });
    let received = null;
    let count = 0;
    signal.subscribe(value => {
        count++;
        received = value;
    });

    signal.update(42);
    jest.advanceTimersByTime(20);
    signal.update(36);
    jest.advanceTimersByTime(20);
    signal.update(12);
    expect(received).toBe(null);

    expect(count).toBe(0);
    jest.advanceTimersByTime(100);
    expect(received).toBe(12);
    expect(count).toBe(1);
});