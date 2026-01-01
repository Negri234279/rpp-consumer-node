import { collectDefaultMetrics, Counter, Histogram, register } from 'prom-client'

import { IMetricsRecorder } from '../../application/ports/output/IMetricsRecorder.js'
import { METRICS_ENABLED } from '../config/config.js'

export class PrometheusMetrics extends IMetricsRecorder {
    alarmsTotal
    alarmsByServer
    alarmsByDay
    alarmsProcessed
    alarmsFailed
    alarmProcessingSuccessDuration
    alarmProcessingErrorDuration

    /**
     * @param {Object} param0
     * @param {import('../../application/ports/output/ILogger.js').ILogger} param0.logger
     */
    constructor({ logger }) {
        super()
        
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
        if (!METRICS_ENABLED) return

        this.alarmProcessingSuccessDuration.observe(durationSeconds)
        this.alarmsProcessed.inc()
    }

    recordFailure(durationSeconds) {
        if (!METRICS_ENABLED) return

        this.alarmProcessingErrorDuration.observe(durationSeconds)
        this.alarmsFailed.inc()
    }

    /**
     * @param {import('../../domain/Alarm').Alarm} alarm
     */
    registerAlarm(alarm) {
        if (!METRICS_ENABLED) return

        this.alarmsTotal.inc()
        this.alarmsByServer.inc({ server: alarm.server })
        this.alarmsByDay.inc({ date: alarm.getDate() })
        
        this.logger.info(`Metric registered for alarm from server: ${alarm.server} on date: ${alarm.getDate()}`)
    }

    async metrics() {
        return METRICS_ENABLED ? register.metrics() : ''
    }
}
