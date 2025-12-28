export class SmartAlarmHandler {
    constructor(logger) {
        this.logger = logger
    }

    async handle(payload) {
        if (!payload) throw new Error('Payload inválido')

        this.logger.info(`Mensaje:\n${JSON.stringify(payload, null, 2)}`)
    }
}