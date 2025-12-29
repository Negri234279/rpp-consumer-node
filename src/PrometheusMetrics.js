import { collectDefaultMetrics, Counter, register } from 'prom-client'

export class PrometheusMetrics {
    constructor({ logger }) {
        this.logger = logger

        collectDefaultMetrics()

        this.alarmsTotal = new Counter({
            name: 'rust_alarms_total',
            help: 'Número total de alarmas recibidas',
        })

        this.alarmsByServer = new Counter({
            name: 'rust_alarms_by_server',
            help: 'Alarmas por servidor con fecha',
            labelNames: ['server', 'date'],
        })

        this.alarmsByDay = new Counter({
            name: 'rust_alarms_by_day',
            help: 'Alarmas por día',
            labelNames: ['date'],
        })
    }

    registerAlarm({ server, date }) {
        this.alarmsTotal.inc()
        this.alarmsByServer.inc({ server })
        this.alarmsByDay.inc({ date })

        this.logger.info(`Métrica registrada para la alarma del servidor: ${server} en la fecha: ${date}`)
    }

    async metrics() {
        return register.metrics()
    }
}
