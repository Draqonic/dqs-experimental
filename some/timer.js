const { DS, DSObject } = require('./DSObject')

class Timer extends DSObject {
	constructor() {
		super()
	}

	complete() {
		super.onComplete()
	}

	static singleShot(interval, func) {
		setTimeout(func, interval)
	}

	start() {
		if (this.runOnStart)
			this.triggered()
		this.active = true
	}

	stop() {
		this.active = false
	}

	restart() {
		this._renewTimer()
	}

	_renewTimer() {
		// console.log('renew')
		if (this.priv.timer)
			clearTimeout(this.priv.timer)
		if (!this.active) return

		if (this.repeat)
			this.priv.timer = setInterval(this.triggered.bind(this), this.interval)
		else
			this.priv.timer = setTimeout(this.triggered.bind(this), this.interval)
		this.startTime = new Date()
	}

	leftSeconds() {
		if (!this.active) return 0
		return Math.ceil((this.priv.timer._idleStart + this.priv.timer._idleTimeout - (new Date - this.startTime)) / 1000)
	}
}

Timer.property('interval', 'int', 1000)
Timer.property('active', 'bool')
Timer.property('repeat', 'bool')
Timer.property('runOnStart', 'bool')

Timer.signal('triggered')
Timer.on('triggered', function() {
	if (!this.repeat) // TODO: && (!this.runOnStart || this._triggered))
		this.active = false
})

Timer.change(['active', 'interval', 'repeat'], function(value) {
	this._renewTimer()
})

// Timer.change('active', (value) => console.log('active', value))

module.exports = Timer
