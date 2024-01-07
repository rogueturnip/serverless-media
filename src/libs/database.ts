import { Kysely, SqliteDialect } from "kysely";

import { Database } from "@typesDef/database-types"; // this is the Database interface we defined earlier
import SQLite from "better-sqlite3";

const database = new SQLite("media.db");

const dialect = new SqliteDialect({
  database,
});

// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.
export const db = new Kysely<Database>({
  dialect,
});
