import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";
import { dbConfig } from "./utils";

export const client = new Pool({ ...dbConfig, max: 3 });
export const db = drizzle(client, { schema });
