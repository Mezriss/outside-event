
export default class OutsideEvent {
	constructor() {
		this._listeners = {};
		this._matches = (el, selector) => 
			(el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector).call(el, selector);
		this._body = document.querySelector('body');
		if (!this._body) {
			throw new Error(`Don't initialize outsideEvent service before <body> is rendered`);
		}
	}

	_checkParentsForNode(node, target) {
		if (!target || target === this._body) {
			return false;
		}

		return (typeof node === 'string' ? this._matches(target, node) : node === target) ? 
			true : this._checkParentsForNode(node, target && target.parentNode);
	}

	_listener(event) {
		if (!Array.isArray(this._listeners[event.type])) {
			return;
		}
		this._listeners[event.type].forEach(el => {
			let insideEvent = false;

			for (let i = 0; i < el.elements.length && !insideEvent; i += 1) {
				for (let j = 0; j < el.elements[i].length && !insideEvent; j += 1) {
					insideEvent = this._checkParentsForNode(el.elements[i][j], event.target);
				}
			}

			if (!insideEvent) {
				el.cb(event);
			}
		});
	}
	/*
		@events - string or array of strings
		@elements - selector string, or node, or nodeList or array of any combination of these
		@cb - this one should be obvious; don't forget to save reference somewhere for unsubscribing
	 */
	on(events, elements, cb) {
		if (!Array.isArray(events)) {
			events = [events];
		}

		if (!Array.isArray(elements)) {
			elements = [elements];
		}

		elements.forEach((el, i) => {
				if (el instanceof HTMLElement || typeof el === 'string') {
					elements[i] = [el];
				}
			}
		);

		events.forEach(event => {
			if (!this._listeners[event]) {
				this._body.addEventListener(event, this._listener.bind(this));
				this._listeners[event] = [];
			}
			this._listeners[event].push({elements: elements, cb: cb});
		});
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
				this._body.removeEventListener(eventType, this._listener);
			}
		});
	}
}