import { METRICS_ENABLED } from './config.js'

export class AlarmMetricsService {
    constructor({ metrics, logger }) {
        this.metrics = metrics
        this.logger = logger
    }

    async record(alarm) {
        if (!METRICS_ENABLED) return

        const date = new Date().toISOString().split('T')[0]

        this.metrics.registerAlarm({
            server: alarm.server,
            date,
        })

        this.logger.info(`Alarm recorded for server: ${alarm.server} on date: ${date}`)
    }
}
