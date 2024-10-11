import { defineConfig } from "drizzle-kit";
import { dbConfig } from "./src/utils/db/utils";

export default defineConfig({
	schema: "./src/utils/db/schema",
	out: "./drizzle/generated",
	dialect: "postgresql",
	dbCredentials: dbConfig as any, // it match but the type is not compatible
	verbose: true,
});
