import { collectDefaultMetrics, Counter, register } from 'prom-client'

export class PrometheusMetrics {
    constructor({ logger }) {
        this.logger = logger

        collectDefaultMetrics()

        this.alarmsTotal = new Counter({
            name: 'rust_alarms_total',
            help: 'Total number of alarms received',
        })

        this.alarmsByServer = new Counter({
            name: 'rust_alarms_by_server',
            help: 'Server alarms',
            labelNames: ['server'],
        })

        this.alarmsByDay = new Counter({
            name: 'rust_alarms_by_day',
            help: 'Alarms per day',
            labelNames: ['date'],
        })
    }

    registerAlarm({ server, date }) {
        this.alarmsTotal.inc()
        this.alarmsByServer.inc({ server })
        this.alarmsByDay.inc({ date })

        this.logger.info(`Metric registered for alarm from server: ${server} on date: ${date}`)
    }

    async metrics() {
        return register.metrics()
    }
}
