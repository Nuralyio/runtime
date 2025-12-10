// logging.ts

// Define log levels
export const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  EXECUTION_TIME: 3
};

let logLevel = LOG_LEVELS.INFO;
let loggingEnabled = false;
let benchmarkingEnabled = true;
let currentPrefix = ""; // Variable to hold the current prefix

// Set the log level
export function setLogLevel(level: number) {
  logLevel = level;
}

// Enable or disable logging
export function enableLogging(enabled: boolean) {
  loggingEnabled = enabled;
}

// Enable or disable benchmarking
export function enableBenchmarking(enabled: boolean) {
  benchmarkingEnabled = enabled;
}

// Internal function to log messages
function logMessage(level: number, message: string, ...args: any[]) {
  if (!loggingEnabled || level > logLevel) return;

  const styles = {
    [LOG_LEVELS.ERROR]: "background: #FF6347; color: white; padding: 2px; border-radius: 3px;", // Tomato
    [LOG_LEVELS.WARN]: "background: #FFD700; color: black; padding: 2px; border-radius: 3px;", // Gold
    [LOG_LEVELS.INFO]: "background: #4682B4; color: white; padding: 2px; border-radius: 3px;", // SteelBlue
    [LOG_LEVELS.DEBUG]: "background: #D1D1D1; color: black; padding: 2px; border-radius: 3px;", // LightGray
    [LOG_LEVELS.EXECUTION_TIME]: "background: #90EE90; color: black; padding: 2px; border-radius: 3px;" // LightGreen
  };

  const prefixStyle = "background: #8A2BE2; color: white; padding: 2px; border-radius: 3px;"; // BlueViolet for prefix

  if (currentPrefix) {
    console.log(`%c${currentPrefix} %c${message}`, prefixStyle, styles[level], ...args);
    currentPrefix = ""; // Reset the prefix after logging
  } else {
    console.log(`%c${message}`, styles[level], ...args);
  }
}

// The log object with methods for each log level and prefix setting
export const log = {
  error: (message: string, ...args: any[]) => logMessage(LOG_LEVELS.ERROR, message, ...args),
  warn: (message: string, ...args: any[]) => logMessage(LOG_LEVELS.WARN, message, ...args),
  info: (message: string, ...args: any[]) => logMessage(LOG_LEVELS.INFO, message, ...args),
  debug: (message: string, ...args: any[]) => logMessage(LOG_LEVELS.DEBUG, message, ...args),
  executionTime: (message: string, ...args: any[]) => logMessage(LOG_LEVELS.EXECUTION_TIME, message, ...args),
  prefix: (prefix: string) => {
    currentPrefix = prefix;
    return log; // Return the log object to allow chaining
  }
};

/**
 *
 *
 import { log, setLogLevel, enableLogging } from "./logging";

 // Set the log level to DEBUG
 setLogLevel(LOG_LEVELS.DEBUG);

 // Enable logging
 enableLogging(true);

 // Example usage of logging methods
 log.info("This is an info message");
 log.debug("This is a debug message");
 log.warn("This is a warning message");
 log.error("This is an error message");
 log.executionTime("This is a message related to execution time");

 // Example usage of prefix with chaining
 log.prefix("INFO PREFIX").info("This is an info message with a prefix");
 log.prefix("ERROR PREFIX").error("This is an error message with a prefix");
 log.prefix("DEBUG PREFIX").debug("This is a debug message with a prefix and additional arguments", "Arg1", "Arg2");

 */