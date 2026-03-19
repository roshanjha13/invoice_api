// const winston = require('winston');

// const logger = winston.createLogger({
//     level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
//     format: winston.format.combine(
//         winston.format({ format: 'YYYY-MM-DD HH:mm:ss' }),
//         winston.format.errors({ stack: true}),      
//         winston.format.json(),      
//     ),
//     transports: [
//         new winston.transports.Console({
//             format: winston.format.combine(
//                 winston.format.colorize(),
//                 winston.format.printf(({ timestamp, level, message, stack}) => {
//                     return stack
//                         ? `${timestamp} [${level}]: ${message}\n${stack}`
//                         : `${timestamp} [${level}]: ${message}`
//                 })
//             )
//         }),

//         new winston.transports.File({
//             filename: 'logs/error.log',
//             level: 'error'
//         }),

//         new winston.transports.File({
//             filename: 'logs/combined.log'
//         })
//     ]

// })

// module.exports = logger;

const winston = require('winston');

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

const consoleFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  printf(({ timestamp, level, message, stack }) => {
    return stack
      ? `${timestamp} [${level}]: ${message}\n${stack}`
      : `${timestamp} [${level}]: ${message}`;
  })
);

const fileFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  json()
);

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  transports: [
    new winston.transports.Console({
      format: consoleFormat
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: fileFormat
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: fileFormat
    }),
  ],
});

module.exports = logger;