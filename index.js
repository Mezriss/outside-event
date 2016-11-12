function _listener (event) {
	if (!Array.isArray(this._eventList[event.type])) {
		return;
	}
	this._eventList[event.type].forEach(el => {
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
		this._eventList = {}; //ie10 concession
		if (!document.body) {
			throw new Error(`Don't initialize outside-event before <body> is rendered`);
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
			if (!this._eventList[event]) {
				document.addEventListener(event, _listener.bind(this));
				this._eventList[event] = [];
			}
			this._eventList[event].push({ elements, cb, once });
		});
	}

	once(events, elements, cb) {
		this.on(events, elements, cb, true);
	}

	/*
		@cb - callback to unbind; unbinds everything if called without parameters
	*/
	off(cb) {
		if (arguments.length && !cb) {
			return;
		}
		if (!arguments.length) {
			Object.keys(this._eventList).forEach(eventType => {
				delete this._eventList[eventType];
				document.removeEventListener(eventType, _listener);
			});
			return;
		}
		Object.keys(this._eventList).forEach(eventType => {
			let index = -1;
			for (let i = 0; i < this._eventList[eventType].length && index < 0; i += 1) { //ie10 concession
				if (this._eventList[eventType][i].cb === cb) {
					index = i;
				}
			}
			if (index < 0) {
				return;
			}
			this._eventList[eventType].splice(index, 1);
			if (!this._eventList[eventType].length) {
				delete this._eventList[eventType];
				document.removeEventListener(eventType, _listener);
			}
		});
	}
}