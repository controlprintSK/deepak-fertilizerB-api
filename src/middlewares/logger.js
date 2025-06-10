const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf, json } = format;
require('winston-daily-rotate-file');

const CATEGORY = 'PIL Pharma';

const fileLogger = createLogger({
  level: 'info', // Set the default level to info for production
  format: combine(
    label({ label: CATEGORY }),
    timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
    json(),
    printf(({ level, timestamp, label, message }) => {
      return JSON.stringify({ level, timestamp, label, message });
    })
  ),
  transports: [
    new transports.DailyRotateFile({
      level: 'info',
      datePattern: 'YYYY-MM-DD',
      filename: 'logs/info-%DATE%.log',
      maxSize: '10m', // Adjusted size to 10MB
      maxFiles: null, // Keep all files
    }),
    new transports.DailyRotateFile({
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      filename: 'logs/error-%DATE%.log',
      maxSize: '10m', // Adjusted size to 10MB
      maxFiles: null, // Keep all files
    }),
    new transports.DailyRotateFile({
      level: 'warn',
      datePattern: 'YYYY-MM-DD',
      filename: 'logs/warn-%DATE%.log',
      maxSize: '10m', // Adjusted size to 10MB
      maxFiles: null, // Keep all files
    }),
    new transports.DailyRotateFile({
      level: 'debug',
      datePattern: 'YYYY-MM-DD',
      filename: 'logs/debug-%DATE%.log',
      maxSize: '10m', // Adjusted size to 10MB
      maxFiles: null, // Keep all files
    }),
  ],
});

// logger.info('info', { label: 'info label' });
// logger.error('error', { label: 'error label' });
// logger.warn('warn', { label: 'warn label' });
// logger.debug('debug', { label: 'debug label' });

module.exports = fileLogger;
