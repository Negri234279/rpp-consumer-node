export class Alarm {
    /**
     * @param {Object} param0
     * @param {string} param0.id
     * @param {string} param0.name
     * @param {string} param0.message
     * @param {string} param0.server
     * @param {Date} [param0.timestamp]
     *
     */
    constructor({ id, name, message, server, location, lastTrigger, timestamp }) {
        this.id = id
        this.name = name
        this.message = message
        this.server = server
        this.location = location
        this.lastTrigger = lastTrigger
        this.timestamp = timestamp || new Date()
    }

    static fromMessage(data) {
        return new Alarm({
            id: data.deviceId,
            name: data.name,
            message: data.message,
            server: data.server,
            location: data.location,
            lastTrigger: data.lastTrigger,
            timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        })
    }

    getDate() {
        return this.timestamp.toISOString().split('T')[0]
    }
}
