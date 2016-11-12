# outside-event

Standalone helper for capturing events that happen outside of given element. Or elements.

It's small, framework agnostic, has zero (production) dependencies and should fit nicely into your ES2015 codebase.

## Getting started

```javascript
import OutsideEvent from 'outside-event';
```
or just include outside-event.min.js into your page in case you didn't setup a fancy build process.

```javascript
const ev = new OutsideEvent();
ev.on('click', document.querySelector('.test'), test);
```
And now you're listening to click events that happen outside of .test element. 

Don't forget to check demo for more examples.

## Api
### on(events, elements, callback)
#### events
An event or list of events delimited by space (for example "mousedown touchstart").
#### elements
Selector (string), Node, NodeList or an array with any combination of the above. 

String selectors will be evaluated on each event trigger so it would be wise to use them only for dynamic content.
#### callback
This one should be obvious. It receives original event.
### once (events, elements, callback)
Same as above, but callback will be unbound after first call.
### off (callback)
Unbinds provided callback. Unbinds everything when called without parameters.

## Browser support
- modern browsers
- IE10