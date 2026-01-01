import { IMessageHandler } from '../../../application/ports/input/IMessageHandler.js'

export class SmartAlarmMessageHandler extends IMessageHandler {
    /**
     * @param {Object} param0
     * @param {import('../../../application/ports/input/IUseCase.js').IUseCase} param0.processAlarmUseCase
     * @param {import('../../../application/ports/output/ILogger.js').ILogger} param0.logger
     */
    constructor({ processAlarmUseCase, logger }) {
        super()

        this.processAlarmUseCase = processAlarmUseCase
        this.logger = logger
    }

    async handle(message) {
        if (!message) {
            throw new Error('Invalid message')
        }

        this.logger.info(`Message received:\n${JSON.stringify(message, null, 2)}`)

        await this.processAlarmUseCase.execute(message)
    }
}
