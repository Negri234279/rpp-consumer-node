import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { RABBITMQ_URL } from './config.js'
import { Logger } from './Logger.js'
import { RabbitConsumer } from './providers/RabbitConsumer.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const CONSUMER_LOG_PATH = path.resolve(__dirname, '../logs/rpp-consumer-node.log')

const logger = new Logger({ path: CONSUMER_LOG_PATH })

const consumer = new RabbitConsumer({
    url: RABBITMQ_URL,
    queue: 'rustplus_alarms',
    logger,
})

const SERVERS = [
    'Rustopia.gg - EU Mondays',
    'Rusty Moose |EU Low|',
    'Rustopia.gg - EU Medium',
    'Rustafied.com - EU Medium II',
    'Rustoria.co - EU East Long',
    'Rustoria.co - EU Long',
]

const server = SERVERS[Math.floor(Math.random() * SERVERS.length)]

consumer
    .connect()
    .then(async () => {
        await consumer.sendToQueue({
            active: false,
            reachable: true,
            everyone: false,
            name: 'Smart Alarm',
            message: 'Your base is under attack!',
            lastTrigger: null,
            command: '371757554',
            id: '371757554',
            image: 'smart_alarm.png',
            location: 'K14',
            server,
            messageId: '1455211382176874670',
        })

        await consumer.stop()

        process.exit(0)
    })
    .catch((err) => {
        logger.error(err)
        process.exit(1)
    })
