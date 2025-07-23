import { openDatabaseSync } from "expo-sqlite";
import type {
  PersistedClient,
  Persister,
} from "@tanstack/react-query-persist-client";

const db = openDatabaseSync("reactQueryCache.db");
const TABLE_NAME = "react_query_cache";
const KEY = "cache";

async function ensureTable() {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);
}

export const sqlitePersistor: Persister = {
  persistClient: async (client: PersistedClient) => {
    await ensureTable();
    await db.runAsync(
      `INSERT OR REPLACE INTO ${TABLE_NAME} (key, value) VALUES (?, ?)`,
      [KEY, JSON.stringify(client)]
    );
  },
  restoreClient: async () => {
    await ensureTable();
    const result = await db.getAllAsync<{ value: string }>(
      `SELECT value FROM ${TABLE_NAME} WHERE key = ?`,
      [KEY]
    );
    if (result.length > 0) {
      return JSON.parse(result[0].value);
    }
    return null;
  },
  removeClient: async () => {
    await ensureTable();
    await db.runAsync(`DELETE FROM ${TABLE_NAME} WHERE key = ?`, [KEY]);
  },
};
