# reactive-signals

This is a lightweight library which is all about reactive and asynchronous programming.

Your primitive is a signal, it can hold one value at a time:

```javascript
const { createSignal } = require('reactive-signals');
const signal = createSignal();
signal.value = 42;
```

When a value is changed, you can be notified of the change:

```javascript

const signal = createSignal();
let triggerCount = 0;
signal.event(() => triggerCount++);
signal.value = 42; // trigger count changes from 0 to 1
```

Sometimes the object listening to the signal might be detroyed,
in this case you will need to unsubscribe from the signal.

```javascript
const signal = createSignal();
let triggerCount = 0;
const subscription = signal.event(() => triggerCount++);
signal.value = 42; // triggerCount changes from 0 to 1
subscription.cancel();
signal.value = 13; // triggerCount stays 1 because we unsubscribed
```

There are a few more things which help manage compelxity and improve performance,
signals will detect if the value changes and only trigger 
an event if the value has indeed changed:

```javascript
const signal = createSignal();
let triggerCount = 0;
signal.value = 13;
signal.event(() => triggerCount++);
signal.value = 13; // no change
signal.value = 42; // triggerCount changes to 1
signal.value = 42; // triggerCount stays 1
```

You can supply your own object comparer:

```javascript
const signal = createSignal({x:1,y:2}, {
    equals: (a,b) => a.x === b.x && a.y === b.y
});
let triggerCount = 0;
signal.event(() => triggerCount++);
signal.value = {x:1, y:2}; // no change
signal.value = {x:1, y:3}; // triggerCount changes to 1
signal.value = {x:1, y:3}; // triggerCount stays 1
```

## other features

Best check out the code. 
[Typedef file contains additional documentation](https://github.com/peterekepeter/reactive-signals/blob/master/lib/signal.d.ts)
[Tests cover additional use cases](https://github.com/peterekepeter/reactive-signals/tree/master/test)
