import { METRICS_ENABLED } from './config.js'

export class AlarmMetricsService {
    constructor({ metrics }) {
        this.metrics = metrics
    }

    record(alarm) {
        if (!METRICS_ENABLED) return

        const date = new Date().toISOString().split('T')[0]

        this.metrics.registerAlarm({
            server: alarm.server,
            date,
        })
    }
}
