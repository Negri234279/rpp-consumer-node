import { Alarm } from '../../domain/Alarm.js'
import { IUseCase } from '../ports/input/IUseCase.js'

export class ProcessSmartAlarmUseCase extends IUseCase {
    /**
     * @param {Object} param0
     * @param {import('../ports/output/IMetricsRecorder.js').IMetricsRecorder} param0.metricsRecorder
     * @param {import('../ports/output/ILogger.js').ILogger} param0.logger
     */
    constructor({ metricsRecorder, logger }) {
        super()
        
        this.metricsRecorder = metricsRecorder
        this.logger = logger
    }

    async execute(data) {
        const alarm = Alarm.fromMessage(data)

        await this.metricsRecorder.registerAlarm(alarm)

        this.logger.info(`Smart alarm processed for server: ${alarm.server}`)

        return alarm
    }
}
