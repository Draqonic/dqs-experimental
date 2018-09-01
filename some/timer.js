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
		if (this.triggeredOnStart)
			this.triggered()
		this.running = true
	}

	stop() {
		this.running = false
	}

	_renewTimer() {
		if (this.priv.timer)
			clearTimeout(this.priv.timer)
		if (!this.running) return

		if (this.repeat)
			this.priv.timer = setInterval(this.triggered.bind(this), this.interval)
		else
			this.priv.timer = setTimeout(this.triggered.bind(this), this.interval)
	}
}
Timer.property('interval', 'int', 1000)
Timer.property('running', 'bool')
Timer.property('repeat', 'bool')
Timer.property('triggeredOnStart', 'bool')
Timer.signal('triggered')
Timer.on('triggered', () => {
	if (!this.repeat && (!this.triggeredOnStart || this._triggered))
		this.running = false
})

Timer.change(['running', 'interval', 'repeat'], function() {
	this._renewTimer()
})

module.exports = Timer