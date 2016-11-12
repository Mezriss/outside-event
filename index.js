export default class OutsideEvent {
	constructor() {
		this._listeners = {};
		if (!document.body) {
			throw new Error(`Don't initialize outsideEvent service before <body> is rendered`);
		}
	}

	_listener(event) {
		if (!Array.isArray(this._listeners[event.type])) {
			return;
		}
		this._listeners[event.type].forEach(el => {
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
			if (!this._listeners[event]) {
				document.addEventListener(event, this._listener.bind(this));
				this._listeners[event] = [];
			}
			this._listeners[event].push({elements, cb, once});
		});
	}
	once(events, elements, cb) {
		this.on(events, elements, cb, true);
	}
	off(cb) {
		Object.keys(this._listeners).forEach(eventType => {
			const index = this._listeners[eventType].findIndex(el => el.cb === cb);
			if (index < 0) {
				return;
			}
			this._listeners[eventType].splice(index, 1);
			if (!this._listeners[eventType].length) {
				delete this._listeners[eventType];
				document.removeEventListener(eventType, this._listener);
			}
		});
	}
}