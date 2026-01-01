# [1.7.0](https://github.com/Negri234279/rpp-consumer-node/compare/v1.6.0...v1.7.0) (2026-01-01)


### Features

* agregar configuración de Docker y Prometheus para producción ([48cf0db](https://github.com/Negri234279/rpp-consumer-node/commit/48cf0db9c43a69ee444f1214f63e4a6887618cce))

# [1.6.0](https://github.com/Negri234279/rpp-consumer-node/compare/v1.5.0...v1.6.0) (2026-01-01)


### Features

* refactor HttpServer to use class-based structure and improve error handling ([8823d73](https://github.com/Negri234279/rpp-consumer-node/commit/8823d73cc343e5feaad20dbf17d04e86b8896988))

# [1.5.0](https://github.com/Negri234279/rpp-consumer-node/compare/v1.4.0...v1.5.0) (2025-12-30)


### Features

* agregar manejo de métricas y registro de alarmas ([d7333b6](https://github.com/Negri234279/rpp-consumer-node/commit/d7333b6a406764968dffff987e13883730746542))
* eliminar método consume4 de RabbitConsumer ([d796e35](https://github.com/Negri234279/rpp-consumer-node/commit/d796e35a0139d171621e88e44e9e9b7cae76ceb8))

# [1.4.0](https://github.com/Negri234279/rpp-consumer-node/compare/v1.3.0...v1.4.0) (2025-12-30)


### Features

* agregar archivo generate-event.js para manejar eventos de alarma en RabbitMQ ([f55c567](https://github.com/Negri234279/rpp-consumer-node/commit/f55c5677135094c349a9be4394f0eafb804e51e6))
* agregar soporte para exchange en RabbitConsumer y mejorar manejo de mensajes ([9fe576c](https://github.com/Negri234279/rpp-consumer-node/commit/9fe576cb69c485ee087d577d35df854c65d53479))
* improve error handling by logging uncaught exceptions and unhandled rejections ([f31d489](https://github.com/Negri234279/rpp-consumer-node/commit/f31d48929fda296faf4811c91a1db69e8d287237))
* improve error logging in shutdown and consumer connection handling ([014c8d9](https://github.com/Negri234279/rpp-consumer-node/commit/014c8d9a0b761752f814b7873b62d984316c4409))
* update SmartAlarmHandler to record full payload instead of just alarm ([71da900](https://github.com/Negri234279/rpp-consumer-node/commit/71da900cee295e23317cbf09d683851957852dad))

# [1.3.0](https://github.com/Negri234279/rpp-consumer-node/compare/v1.2.0...v1.3.0) (2025-12-29)


### Features

* update README and implement Prometheus metrics for alarm tracking ([44af24f](https://github.com/Negri234279/rpp-consumer-node/commit/44af24f9887be51b16ef6f2b848ba7f9e9a0bc13))

# [1.2.0](https://github.com/Negri234279/rpp-consumer-node/compare/v1.1.0...v1.2.0) (2025-12-29)


### Features

* add Prometheus metrics integration and alarm recording functionality ([35c737a](https://github.com/Negri234279/rpp-consumer-node/commit/35c737ab764e047311a2ca0b523307b218c7a822))

# [1.1.0](https://github.com/Negri234279/rpp-consumer-node/compare/v1.0.1...v1.1.0) (2025-12-28)


### Features

* implement RabbitMQ consumer with logging and message handling ([90ac80c](https://github.com/Negri234279/rpp-consumer-node/commit/90ac80ca201d4407b21daaad55c5eeee0f38589d))

## [1.0.1](https://github.com/Negri234279/rpp-consumer-node/compare/v1.0.0...v1.0.1) (2025-12-28)


### Bug Fixes

* update production Dockerfile to ignore scripts during npm install ([10b728c](https://github.com/Negri234279/rpp-consumer-node/commit/10b728ce41ca5809c4140101877377443d1d3731))

# 1.0.0 (2025-12-28)


### Features

* initialize RabbitMQ consumer with logging and graceful shutdown ([b752618](https://github.com/Negri234279/rpp-consumer-node/commit/b75261839389563fe90d3de3ae34c4cf767a6001))
