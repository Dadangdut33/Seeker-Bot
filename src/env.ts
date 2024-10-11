import dotenv from "dotenv";
import { z, TypeOf } from "zod";

dotenv.config();

const zodEnv = z.object({
	NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
	PORT: z.string().default("10032"),
	PREFIX: z.string().default("!!"),
	DB_HOST: z.string().min(1),
	DB_NAME: z.string().min(1),
	DB_USER: z.string().min(1),
	DB_PASS: z.string().min(1),
	DB_PORT: z.string().min(1),
	DB_CA: z.string().optional(),

	// Bot
	TOKEN: z.string().min(1),
	CLIENT_ID: z.string().min(1),

	// API usage
	MD_USER: z.string().optional(),
	MD_PASS: z.string().optional(),
	SAUCENAO_KEY: z.string().optional(),

	// Other config
	SERVER_INVITE: z.string().optional(),
	PERSONAL_SERVER_ID: z.string().optional(),
	PERSONAL_SERVER_MEMBER_COUNT_ID: z.string().optional(),
	PERSONAL_SERVER_SPOTLIGHT_CHANNEL_ID: z.string().optional(),
	PERSONAL_SERVER_NYAA_CHANNEL_ID: z.string().optional(),
	PERSONAL_SERVER_MAL_CHANNEL_ID: z.string().optional(),
	PERSONAL_SERVER_CRUNCHYROLL_CHANNEL_ID: z.string().optional(),
	PERSONAL_SERVER_ANN_CHANNEL_ID: z.string().optional(),
});

let env: TypeOf<typeof zodEnv>, isProd: boolean;
try {
	env = zodEnv.parse(process.env);
	isProd = env.NODE_ENV === "production";
} catch (err) {
	if (err instanceof z.ZodError) {
		const { fieldErrors } = err.flatten();
		const errorMessage = Object.entries(fieldErrors)
			.map(([field, errors]) => (errors ? `${field}: ${errors.join(", ")}` : field))
			.join("\n  ");
		throw new Error(`Missing environment variables:\n  ${errorMessage}`);
		process.exit(1);
	}
}

export { env, isProd };
