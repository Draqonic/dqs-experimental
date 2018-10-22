'use strict'

// const log = console.log
// const warn = console.warn
const error = console.error
// const debug = console.debug
// const print = log

const DS = require('./DS')

class DSObject {
  constructor (parent) {
    if (parent) this.parent = parent
    this.binds = []
    this.signals = {}
    this.children = []
    this.properties = {}
    this.pbind = []
    this.priv = {} // TODO: parent to priv
  }

  complete () {}

  props (properties) {
    for (const property of properties) {
      this.prop(property[0], property[1], property[2])
    }
  }

  bindFor (dsBind, property) {
    let res = []

    for (const kk of dsBind) {
      if (typeof this[kk] === 'function') {
        // log(typeof this[kk] === 'function')
        let kek = this.bindFor(DS.bind(this[kk]).DSBind['this'], property)
        res.push(...kek)
      } else if (this[kk] !== undefined && kk !== property) {
        res.push(this)
        res.push(kk)
      }
    }

    return res
  }

  static property (property, type, val, target) {
    if (!type) type = 'any'
    if (!this.prototype.properties) this.prototype.properties = {}
    let prop = this.prototype.properties

    if (property in prop) {
      error(`Error: Property '${property}' already exists`)
      return
    }

    prop[property] = {
      type: type,
      value: undefined
    }
    const change = `${property}Change`

    if (this.prototype[property] || this.prototype[change]) {
      error(`Error: can't create property, because name '${property}' занято`)
      return
    }

    Object.defineProperty(this.prototype, property, {
      get: function () {
        return this.getProp(property)
      },
      set: function (value) {
        if (value && value.hasOwnProperty('DSBind')) {
          let dsBind = value.DSBind['this']
          let res = this.bindFor(dsBind, property)
          this.bind(property, value.DSFunc, ...res)
        } else {
          if (this.pbind.indexOf(property) !== -1) {
            this.unbind(property)
          }

          this.setProp(property, value)
        }
      }
    })

    Object.defineProperty(this.prototype, change, {
      value: function () {
        this.emit(change, this.getProp(property), this.getProp(property))
      },
      writable: false
    })

    switch (type) {
      case 'int':
        val = Math.round(Number(val)) || 0
        break
      case 'number':
        val = Number(val) || 0
        break
      case 'string':
        val = String(val)
        break
      case 'bool':
        val = !!val
        break
    }
    this.prototype.properties[property].value = val
  }

  static change (prop, func, target) {
    if (!target) target = this
    if (!func) {
      return error(`Error: need function for on${prop}Change`)
    }
    if (Array.isArray(prop)) {
      for (const pr of prop) {
        target.change(pr, func)
      }
      return
    }

    let prototype = this.prototype
    if (target instanceof DSObject) {
      prototype = target.constructor.prototype.properties
    }
    if (!(prop in prototype)) {
      return error(`Error: cant find property ${prop}`)
    }

    target.on(`${prop}Change`, func)
  }

  change (prop, func) {
    DSObject.change(prop, func, this)
  }

  static signal (name) {
    if (this.prototype[name]) {
      error(`Error: can't create signal, because name '${name}' занято`)
      return
    }

    Object.defineProperty(this.prototype, name, {
      value: function (...values) {
        this.emit(name, ...values)
      },
      writable: false
    })
  }

  // TODO: reimpl on as change
  static on (signal, slot) { // add string
    if (!this.prototype.signals) this.prototype.signals = {}

    if (typeof slot !== 'function') {
      error('Error: connect slot must be function')
      return
    }

    if (!this.prototype[signal]) {
      error(`Error: can't connect undefined signal '${signal}'`)
      return
    }

    if (!this.prototype.signals[signal]) {
      this.prototype.signals[signal] = []
    }

    this.prototype.signals[signal].push(slot)
  }

  emit (signal, ...values) {
    // TODO: add binds, add string
    if (this.constructor.prototype.signals && signal in this.constructor.prototype.signals) {
      for (const func of this.constructor.prototype.signals[signal]) {
        if (typeof func === 'function') {
          func.bind(this)(...values)
        }
      }
    }

    if (this.signals && signal in this.signals) {
      for (const func of this.signals[signal]) {
        if (typeof func === 'function') {
          func.bind(this)(...values)
        }
      }
    }
  }

  on (signal, slot) {
    if (typeof slot !== 'function') {
      error('Error: connect slot must be function')
      return
    }

    if (!this[signal]) {
      error(`Error: can't connect undefined signal '${signal}'`)
      return
    }

    if (!this.signals[signal]) {
      this.signals[signal] = []
    }

    this.signals[signal].push(slot)
  }

  off (signal, slot) {
    let signs = this.signals[signal]
    signs.splice(signs.indexOf(slot), 1)
  }

  toString () {
    return this.constructor.name + ' {}'
  }

  addChild (el) {
    if (this.children.indexOf(el)) {
      this.children.push(el)
    }
    el.parent = this
  }

  parentAt (index) {
    let indx = 0
    if (!this.parent) return undefined

    let parent = this.parent
    while (indx++ !== index) {
      if (parent.parent) {
        parent = parent.parent
      } else {
        return undefined
      }
    }
    return parent
  }

  setId (id) {
    if (this.id) return error('Error: id is already set for this object')
    this.id = id
    if (typeof window !== 'undefined') {
      if (window[id]) {
        error('Error: id dublicate')
        return
      }
      window[id] = this
    } else if (typeof global !== 'undefined') {
      if (global[id]) {
        error('Error: id dublicate')
        return
      }
      global[id] = this
    }
  }

  bind (prop, upd, ...values) { // TODO: disable bind loop if this.prop bind to this.prop
    if (arguments.length === 2) {
      return this.autoBind(prop, upd)
    }
    let args = values
    if (Array.isArray(values[0])) args = values[0]
    let updater = function () {
      let oldProp = this.properties[prop] || this.constructor.prototype.properties[prop].value
      let newProp = upd.bind(this)()
      this.properties[prop] = newProp
      if (newProp !== oldProp) { // TODO: check arrays
        this.emit(prop + 'Change', newProp, oldProp)
      }
    }.bind(this)

    for (let i = 0; i !== args.length; i += 2) {
      let eventName = args[i + 1] + 'Change'
      // log(values[i])
      args[i].on(eventName, updater)

      this.binds.push({
        prop,
        target: args[i],
        updater,
        eventName
      })
    }

    this.pbind.push(prop)

    updater()
  }

  unbind (prop) {
    if (this.pbind.indexOf(prop) === -1) {
      return error('Error: nothind to unbind for', prop)
    }

    let binds = this.binds
    let arr = []
    for (const bind of binds) {
      if (bind.prop === prop) {
        bind.target.off(bind.eventName, bind.updater)
      } // .removeListener(binds[i]['eventName'], binds[i]['updater'])
      arr.push(binds.indexOf(bind))
    }
    for (const a of arr) {
      binds.splice(a)
    }

    this.pbind.splice(this.pbind.indexOf(prop), 1)
  }

  static get (prop, func) {
    if (!this.prototype.gets) this.prototype.gets = {}

    if (!(prop in this.prototype.gets)) {
      this.prototype.gets[prop] = []
    }

    this.prototype.gets[prop].push(func)
  }

  get (prop, func) {
    if (!this.gets) this.gets = {}

    if (!(prop in this.gets)) {
      this.gets[prop] = []
    }

    this.gets[prop].push(func)
  }

  getProp (property) {
    let prop
    prop = property in this.properties ? this.properties[property] : this.constructor.prototype.properties[property].value
    return prop
  }

  setProp (property, value) {
    const change = `${property}Change`
    if (!this.properties[property]) {
      this.properties[property] = this.constructor.prototype.properties[property].value
    }
    const type = this.constructor.prototype.properties[property].type

    let prop = this.properties[property]
    switch (type) {
      case 'int':
        value = Math.round(parseFloat(value)) || 0
        break
      case 'number':
        value = parseFloat(value) || 0
        break
      case 'string':
        value = String(value)
        break
      case 'bool':
        value = !!value
        break
      case 'array':
        value = Array.isArray(value) ? value : [value]
        break
      // case 'BigInt':
      //   let parse = Math.round(parseFloat(value))
      //   value = parse ? BigInt(parse) : BigInt(0)
      //   break
    }

    if (prop === value) {
      return
    }

    this.properties[property] = value
    this.emit(change, value, prop)
  }

  autoBind (prop, func) {
    let up = func
    let upd = up.toString()
    let arr = []
    let spl = upd.split(/[\s\n*{}=()\\+]+/)
    // log(spl)
    for (let i = 0; i !== spl.length; ++i) {
      let w = spl[i]

      // let prev = spl[i - 1]
      // let pprev = spl[i - 2]

      let next = spl[i + 1]

      let nnext = spl[i + 2]
      if (w && ['return', 'function'].indexOf(w) === -1 && !!isNaN(parseFloat(w))) {
        // log(w)
        if (w === 'this') {
          let ws = w.indexOf('.') !== -1
          let ns = next.indexOf('.') !== -1
          let nns = nnext.indexOf('.') !== -1
          if (ws || ns || nns) {
            // log(w, next, nnext)
            // log(ws, ns, nns)

            if (w === 'this' && next === '.') {
              arr.push({
                this: true,
                v: nnext,
                from: 1
              })
              // log('var = this', nnext)
            }
            if (w === 'this' && next[0] === '.' && next.length > 1) {
              arr.push({
                this: true,
                v: next.substr(1, next.length - 1),
                from: 2
              })
              // log('var = this', next.substr(1, next.length - 1))
            }
          }
        }

        if (w.substr(0, 5) === 'this.' && w.length > 5) {
          // log('!!!!!!!!!!!!!!', w)
          arr.push({
            this: true,
            v: w.substr(5, w.length - 1),
            from: 3
          })
        }
      }
    }

    // log(arr)
    let kkk = {
      this: []
    }
    for (const or of arr) {
      if (kkk.this.indexOf(or.v) === -1) {
        kkk['this'].push(or.v)
      }
      // kkk.push({this: or.this, v: or.v})
    }

    // log(kkk)
    let res = []
    for (const kk of kkk['this']) {
      if (this[kk] !== undefined) {
        res.push(this)
        res.push(kk)
      }
    }
    // log(res)
    this.bind(prop, func, ...res)
  }

  get parent () {
    return this.Parent ? this.Parent : undefined
  }

  set parent (target) {
    this.Parent = target
    target.children.push(this)
  }
}
// if (DSObject.prototype.addProperies)
// DSObject.prototype.addProperies.call(this)

module.exports = {
  DS,
  DSObject
}
