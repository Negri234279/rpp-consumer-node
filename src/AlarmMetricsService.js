import { METRICS_ENABLED } from './config.js'

export class AlarmMetricsService {
    constructor({ metrics }) {
        this.metrics = metrics
    }

    record(alarm) {
        if (!METRICS_ENABLED) return

        this.metrics.registerAlarm({
            server: alarm.server,
            date: Date.now(),
        })
    }
}
