import { SmartAlarmMessageHandler } from './SmartAlarmMessageHandler.js'
import { ProcessSmartAlarmUseCase } from '../../../application/useCases/ProcessSmartAlarmUseCase.js'

export class HandlerFactory {
    /**
     * @param {Object} dependencies
     * @param {import('../../../application/ports/output/ILogger.js').ILogger} dependencies.logger
     * @param {import('../../../application/ports/output/IMetricsRecorder.js').IMetricsRecorder} dependencies.metricsRecorder
     */
    constructor({ logger, metricsRecorder }) {
        this.logger = logger
        this.metricsRecorder = metricsRecorder
    }

    /**
     * Create SmartAlarmMessageHandler
     * @returns {SmartAlarmMessageHandler}
     */
    createSmartAlarmHandler() {
        const processAlarmUseCase = new ProcessSmartAlarmUseCase({
            metricsRecorder: this.metricsRecorder,
            logger: this.logger
        })

        return new SmartAlarmMessageHandler({
            processAlarmUseCase,
            logger: this.logger
        })
    }

    /**
     * Create all handlers at once
     * @returns {Object} Object with all handlers
     */
    createAllHandlers() {
        return {
            smartAlarmMessageHandler: this.createSmartAlarmHandler(),
        }
    }
}
