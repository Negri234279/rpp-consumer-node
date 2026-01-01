export class IMetricsRecorder {
    /**
     * @param {number} duration - Duration in seconds
     */
    recordSuccess(duration) {
        throw new Error('IMetricsRecorder.recordSuccess() not implemented')
    }

    /**
     * @param {number} duration - Duration in seconds
     */
    recordFailure(duration) {
        throw new Error('IMetricsRecorder.recordFailure() not implemented')
    }

    /**
     * @param {import('../../../domain/Alarm').Alarm} alarm
     */
    async registerAlarm(alarm) {
        throw new Error('IMetricsRecorder.registerAlarm() not implemented')
    }

    /**
     * @returns {Promise<string>} - Metrics data
     */
    async metrics() {
        throw new Error('IMetricsRecorder.metrics() not implemented')
    }
}
