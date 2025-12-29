export class SmartAlarmHandler {
    constructor({ logger, alarmMetricsService }) {
        this.logger = logger
        this.alarmMetricsService = alarmMetricsService
    }

    async handle(payload) {
        if (!payload) throw new Error('Payload inválido')

        this.logger.info(`Mensaje:\n${JSON.stringify(payload, null, 2)}`)

        this.alarmMetricsService.record(payload)
    }
}
