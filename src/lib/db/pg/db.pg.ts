import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";

const dbUrl = process.env.USE_LOCAL_DB
  ? process.env.POSTGRES_URL_LOCAL!
  : process.env.POSTGRES_URL!;

console.log("⏳ Connecting to database:", dbUrl);

export const pgDb = drizzlePg(dbUrl);
