import { Client } from "discord.js";
import express, { Request, Response } from "express";
import { logger } from "../logger";

module.exports = (client: Client) => {
	const app = express();
	const port = process.env.PORT || 10032;
	app.get("/", (_req: Request, res: Response) => res.send("<h1>Hello World!</h1>"));
	app.listen(port, () => logger.info(`Server listening at http://localhost:${port}`));
};
