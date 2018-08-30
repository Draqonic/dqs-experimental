const log = console.log
const warn = console.warn
const error = console.error
const debug = console.debug
const print = log

const DS = require('./DS')

if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});

class DSObject {
	constructor() {
		this.parent = null
		this.binds = []
		this.signals = {}
		// this.children = []
		this.properties = {}
		this.pbind = []
	}

	props(properties) {
		for(const property of properties) {
			this.prop(property[0], property[1], property[2])
		}
	}

	static property(property, type, val, target) {
		if (!type) type = 'any';
		if (!this.prototype.properties) this.prototype.properties = {}
		let prop = this.prototype.properties
	
		if(property in prop) {
			error(`Error: Property '${property}' already exists`);
			return;
		}
	
		prop[property] = { type: type, value: undefined }
		const change = `${property}Change`;

		if (this.prototype[property] || this.prototype[change]) {
			error(`Error: can't create property, because name '${property}' занято`)
			return
		}
	
		Object.defineProperty(this.prototype, property, {
			get: function() {
				return this.getProp(property)
			},
			set: function(value) {
				if (value && value.hasOwnProperty('DSBind')) {
					//log('DS', value)
					let res = []
					for(const kk of value.DSBind['this']) {
						if (this[kk] !== undefined) {
							res.push(this)
							res.push(kk)
						}
					}
					this.bind(property, value.DSFunc, ...res)
				}
				else {
					if(this.pbind.indexOf(property) !== -1)
						this.unbind(property)
					
					this.setProp(property, value)
				}
			}
		});
	
		Object.defineProperty(this.prototype, change, {
			value: function() {
				this.emit(change, prop.value, prop.value)
			},
			writable: false
		});
	
		// this.prototype[change].Name = change;
		// this.prototype[change].connect = function(slot) {
		// 	if (!slot) {
		// 		error(`Error: Undefined slot for signal '${change}'`);
		// 		return;
		// 	}
		// 	this.connect(change, slot.Name ? slot.Name : slot);
		// }.bind(this)
	
		switch(type) {
			case 'int': val = parseInt(val) ? parseInt(val) : 0; break;
			case 'number': val = parseFloat(val) ? parseFloat(val) : 0.0; break;
			case 'string': val = val ? String(val) : ''; break;
			case 'bool': val = !!val; break;
		}
		this.prototype.properties[property].value = val
	
		//log(`New property: ${property} (${type})`, val ? `= ${val}` : '');
	}

	change(prop, func) {
		if (!func)
			return error(`Error: need function for on${prop}Change`)

		this.on(`${prop}Change`, func)
	}

	static change(prop, func) {
		if (!this.prototype[prop])
			return error(`Error: cant find property ${prop}`)
		if (!func)
			return error(`Error: need function for on${prop}Change`)

		this.on(`${prop}Change`, func)
	}

	static signal(name) {
		if (this.prototype[name]) {
			error(`Error: can't create signal, because name '${name}' занято`)
			return
		}

		Object.defineProperty(this.prototype, name, {
			value: function(...values) {
				this.emit(name, ...values)
			},
			writable: false
		});
	}

	static on(signal, slot) { // add string
		if (!this.prototype.signals) this.prototype.signals = {}

		if (typeof slot !== 'function') {
			error('Error: connect slot must be function')
			return
		}

		if (!this.prototype[signal]) {
			error(`Error: can't connect undefined signal '${signal}'`)
			return
		}

		if (!this.prototype.signals[signal])
			this.prototype.signals[signal] = []
		
		this.prototype.signals[signal].push(slot)
	}

	emit(signal, ...values) {
		// TODO: add binds, add string
		if (this.constructor.prototype.signals && signal in this.constructor.prototype.signals) {
			for(const func of this.constructor.prototype.signals[signal]) {
				if (typeof func === 'function')
					func.bind(this)(...values)
			}
		}

		if (this.signals && signal in this.signals) {
			for(const func of this.signals[signal]) {
				if (typeof func === 'function')
					func.bind(this)(...values)
			}
		}
	}

	change(prop, func) {
		if (!this.prototype[prop])
			return error(`Error: cant find property ${prop}`)
		if (!func)
			return error(`Error: need function for on${prop}Change`)

		this.on(`${prop}Change`, func)
	}

	on(signal, slot) {
		if (typeof slot !== 'function') {
			error('Error: connect slot must be function')
			return
		}

		if (!this[signal]) {
			error(`Error: can't connect undefined signal '${signal}'`)
			return
		}

		if (!this.signals[signal])
			this.signals[signal] = []

		this.signals[signal].push(slot)
		// if (!this.signals) this.signals = []
		// log('Connect', signal, slot)

		// if (typeof slot === 'string') {
		// 	// TODO: check if signal or slot exists
		// 	if (signal === slot) {
		// 		error(`Error: Disable connect '${signal}' to '${signal}'.`)
		// 		return false
		// 	}

		// 	for(const signals of this.signals) {
		// 		if (signals.signal === slot && signals.slot === signal) {
		// 			error(`Error: Disable connect '${slot}' to '${signal}', because '${signal}' already attached to '${slot}'.`)
		// 			return false
		// 		}
		// 	}
		// }

		
		// // let func
		// // if (typeof slot === 'function')
		// 	// func = slot
		// // else
		// 	// func = function(...values) { this[slot](...values) }
		// // this.on(signal, func)
		// // this.signals.push({signal, slot, func})

		// // return true
	}
	
	off(signal, slot) {
		let signs = this.signals[signal]
		signs.splice(signs.indexOf(slot), 1)
	}

	toString() {
		return this.constructor.name + ' {}'
	}

	addChild(el) {
		if (this.children.indexOf(el))
			this.children.push(el)
		el.parent = this
	}

	setId(id) {
		if (this.id) return error('Error: id is already set for this object')
		this.id = id;
		if (typeof window !== 'undefined') {
			if (window[id]) { error('Error: id dublicate'); return }
			window[id] = this
		}
		else if (typeof global !== 'undefined') {
			if (global[id]) { error('Error: id dublicate'); return }
			global[id] = this
		}
	}

	bind(prop, upd, ...values) { // TODO: disable bind loop if this.prop bind to this.prop
		if(arguments.length === 2)
			return this.autoBind(prop, upd)
		let args = values
		if (Array.isArray(values[0])) args = values[0]
		let updater = function() {
			let oldProp = this.properties[prop] || this.constructor.prototype.properties[prop].value
			let newProp = upd.bind(this)()
			this.properties[prop] = newProp
			if (newProp !== oldProp)
				this.emit(prop + 'Change', newProp, oldProp)
		}.bind(this)

		for(let i = 0; i !== args.length; i += 2) {
			let eventName = args[i + 1] + 'Change'
			//log(values[i])
			args[i].on(eventName, updater)

			this.binds.push({prop, target: args[i], updater, eventName})
		}

		this.pbind.push(prop)

		updater()
	}

	unbind(prop) {
		if(this.pbind.indexOf(prop) === -1)
			return error('Error: nothind to unbind for', prop)

		let binds = this.binds
		let arr = []
		for(const bind of binds) {
			if (bind.prop === prop)
				bind.target.off(bind.eventName, bind.updater) //.removeListener(binds[i]['eventName'], binds[i]['updater'])
			arr.push(binds.indexOf(bind))
		}
		for(const a of arr) {
			binds.splice(a)
		}
		
		this.pbind.splice(this.pbind.indexOf(prop), 1)
	}

	getProp(property) {
		let prop = property in this.properties ? this.properties[property] : this.constructor.prototype.properties[property].value
		return prop
	}

	setProp(property, value) {
		const change = `${property}Change`;
		if (!this.properties[property])
			this.properties[property] = this.constructor.prototype.properties[property].value
		const type = this.constructor.prototype.properties[property].type

		let prop = this.properties[property]
		let parse
		switch(type) {
			case 'int': parse = parseInt(value); value = parse; parse ? parse : 0; break;
			case 'number': parse = parseFloat(value); value = parse; parse ? parse : 0; break;
			case 'string': value = String(value); break;
			case 'bool': value = !!value; break;
		}

		// log(prop, value)
		// log('11111111', prop, value, prop == value)
		if (Array.isArray(prop) && Array.isArray(value)) {
			if (prop.equals(value))
				return
		}

		// log(prop, value)

		if (prop === value)
			return;

		let oldValue = prop;
		this.properties[property] = value;
		this.emit(change, value, oldValue);
	}

	autoBind(prop, func) {
		let up = func
		let upd = up.toString()
		let arr = []
		let spl = upd.split(/[\s\n*{}=()\+]+/)
		//log(spl)
		for(let i = 0; i !== spl.length; ++i) {
			let w = spl[i], prev = spl[i - 1], pprev = spl[i - 2], next = spl[i + 1], nnext = spl[i + 2];
			if (w && ['return', 'function'].indexOf(w) === -1 && !!isNaN(parseFloat(w))) {
				// log(w)
				if (w === 'this') {
					let ws = w.indexOf('.') !== -1
					let ns = next.indexOf('.') !== -1
					let nns = nnext.indexOf('.') !== -1
					if(ws || ns || nns) {
						//log(w, next, nnext)
						//log(ws, ns, nns)

						if (w === 'this' && next === '.') {
							arr.push({this: true, v: nnext, from: 1})
							//	log('var = this', nnext)
						}
						if (w === 'this' && next[0] === '.' && next.length > 1) {
							arr.push({this: true, v: next.substr(1, next.length - 1), from: 2})
						//	log('var = this', next.substr(1, next.length - 1))
						}
					}
				}

				if (w.substr(0, 5) === 'this.' && w.length > 5) {
					//log('!!!!!!!!!!!!!!', w)
					arr.push({this: true, v: w.substr(5, w.length - 1), from: 3})
				}
			}
		}


		// log(arr)
		let kkk = {this: []}
		for(const or of arr) {
			if (kkk.this.indexOf(or.v) === -1)
				kkk['this'].push(or.v)
			// kkk.push({this: or.this, v: or.v})
		}

// log(kkk)
		let res = []
		for(const kk of kkk['this']) {
			if (this[kk] !== undefined) {
				res.push(this)
				res.push(kk)
			}
		}
		// log(res)
		this.bind(prop, func, ...res)
	}
}
//if (DSObject.prototype.addProperies)
    //DSObject.prototype.addProperies.call(this)

module.exports = { DS, DSObject }