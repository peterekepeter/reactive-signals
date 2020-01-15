const signal = require("../lib/signal");
const createSignal = signal.create;

test("async listeners are awaited", async() => {
    let signal = createSignal(null, {
        awaitListeners:true
    });
    let enter = 0;
    let exit = 0;
    signal.subscribe(async () => {
        enter++;
        await delay(100);
        exit++;
    })
    expect(enter).toBe(0);
    signal.update(13);
    expect(enter).toBe(1);
    await delay(15);
    signal.update(42);
    expect(enter).toBe(1);
    await delay(100);
    expect(exit).toBe(1);
    expect(enter).toBe(2);
    await delay(100);
    expect(exit).toBe(2);
});

test("updates while async listener is running filtered out, last value is received", async () =>{
    let signal = createSignal(null, {
        awaitListeners:true
    });
    let received, count=0;
    signal.subscribe(async (value) => {
        await delay(100);
        received = value;
        count++;
    })
    signal.update(111);
    await delay(15);
    signal.update(99);
    signal.update(98);
    signal.update(95);
    
    await delay(100);
    expect(received).toBe(111);
    await delay(100);
    expect(received).toBe(95);
    expect(count).toBe(2);
})

test("async with delay can be used to filter out fast changes", async () =>{
    let signal = createSignal(null, {
        awaitListeners: true, 
        delay: 10
    })
    let received, count=0;
    signal.subscribe(async (value) => {
        await delay(10);
        received = value;
        count++;
    })
    signal.update(111);
    signal.update(99);
    signal.update(98);
    signal.update(95);
    await delay(100);
    expect(count).toBe(1);
    expect(received).toBe(95);
});

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));