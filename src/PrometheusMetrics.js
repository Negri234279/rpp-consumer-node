import { collectDefaultMetrics, Counter, Histogram, register } from 'prom-client'

export class PrometheusMetrics {
    alarmsTotal
    alarmsByServer
    alarmsByDay
    alarmsProcessed
    alarmsFailed
    alarmProcessingSuccessDuration
    alarmProcessingErrorDuration

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

        this.alarmsProcessed = new Counter({
            name: 'rust_alarms_processed_total',
            help: 'Total alarms processed successfully',
        })

        this.alarmsFailed = new Counter({
            name: 'rust_alarms_failed_total',
            help: 'Total alarms failed',
        })

        this.alarmProcessingSuccessDuration = new Histogram({
            name: 'rust_alarm_processing_success_duration_seconds',
            help: 'Latency of successful alarm processing',
            buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5],
        })

        this.alarmProcessingErrorDuration = new Histogram({
            name: 'rust_alarm_processing_error_duration_seconds',
            help: 'Latency of failed alarm processing',
            buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5],
        })
    }

    recordSuccess(durationSeconds) {
        this.alarmProcessingSuccessDuration.observe(durationSeconds)
        this.alarmsProcessed.inc()
    }

    recordFailure(durationSeconds) {
        this.alarmProcessingErrorDuration.observe(durationSeconds)
        this.alarmsFailed.inc()
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
