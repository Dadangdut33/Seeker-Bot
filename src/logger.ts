import { Logger, ILogObj } from "tslog";

export const logger: Logger<ILogObj> = new Logger({ type: "pretty", prettyLogTimeZone: process.env.NODE_ENV === "development" ? "local" : "UTC" });
