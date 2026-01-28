import pino from "pino";
import config from "../config/config.js";

const logger = pino({
  level: config.env === "production" ? "info" : "debug",
  transport:
    config.env === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss",
            ignore: "pid,hostname",
          },
        }
      : undefined,
});

export default logger;
