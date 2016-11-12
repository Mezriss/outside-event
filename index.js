const _listenerList = new WeakMap(); 

function _listener (event) {
	if (!Array.isArray(_listenerList.get(this)[event.type])) {
		return;
	}
	_listenerList.get(this)[event.type].forEach(el => {
		let insideEvent = false;

		for (let i = 0; i < el.elements.length && !insideEvent; i += 1) {
			let nodes = typeof el.elements[i] === 'string' ? document.querySelectorAll(el.elements[i]) : el.elements[i];
			for (let j = 0; j < nodes.length && !insideEvent; j += 1) {
				insideEvent = nodes[j].contains(event.target);
			}
		}

		if (!insideEvent) {
			el.cb(event);
			if (el.once) {
				this.off(el.cb);
			}
		}
	});
};

export default class OutsideEvent {
	constructor() {
		_listenerList.set(this, {});
		if (!document.body) {
			throw new Error(`Don't initialize outsideEvent service before <body> is rendered`);
		}
	}

	/*
		@events - string with event type or list of event types (with space as delimiter)
		@elements - selector string, or node, or nodeList or array of any combination of these
		@cb - this one should be obvious; don't forget to save reference somewhere for unsubscribing
		@once - run only once
	 */
	on(events, elements, cb, once) {
		events = events.split(' ');

		if (!Array.isArray(elements)) {
			elements = [elements];
		}

		elements.forEach((el, i) => {
			if (el instanceof HTMLElement) {
				elements[i] = [el];
			}
		}
		);

		events.forEach(event => {
			if (!_listenerList.get(this)[event]) {
				document.addEventListener(event, _listener.bind(this));
				_listenerList.get(this)[event] = [];
			}
			_listenerList.get(this)[event].push({ elements, cb, once });
		});
	}

	once(events, elements, cb) {
		this.on(events, elements, cb, true);
	}
	
	off(cb) {
		Object.keys(_listenerList.get(this)).forEach(eventType => {
			const index = _listenerList.get(this)[eventType].findIndex(el => el.cb === cb);
			if (index < 0) {
				return;
			}
			_listenerList.get(this)[eventType].splice(index, 1);
			if (!_listenerList.get(this)[eventType].length) {
				delete _listenerList.get(this)[eventType];
				document.removeEventListener(eventType, _listener);
			}
		});
	}
}