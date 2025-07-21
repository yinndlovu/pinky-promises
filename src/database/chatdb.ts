import { openDatabaseSync } from "expo-sqlite";

export type ChatMessage = {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
};

const db = openDatabaseSync("chat.db");

export const createTable = async (): Promise<void> => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY NOT NULL,
        text TEXT NOT NULL,
        sender TEXT NOT NULL,
        timestamp INTEGER NOT NULL
      );
    `);

    try {
      await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_timestamp ON messages (timestamp);
      `);
    } catch (indexError) {}
  } catch (error) {
    throw error;
  }
};

export const saveMessage = async (
  id: string,
  text: string,
  sender: string,
  timestamp: number
): Promise<void> => {
  if (!id || !text || !sender || typeof timestamp !== "number") {
    throw new Error("Invalid input for saving message");
  }
  try {
    await db.runAsync(
      `INSERT INTO messages (id, text, sender, timestamp) VALUES (?, ?, ?, ?)`,
      [id, text, sender, timestamp]
    );
  } catch (error) {
    throw error;
  }
};

export const deleteOldMessages = async (): Promise<void> => {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  try {
    await db.runAsync(`DELETE FROM messages WHERE timestamp < ?`, [
      thirtyDaysAgo,
    ]);
  } catch (error) {
    throw error;
  }
};

export const fetchMessages = async (): Promise<ChatMessage[]> => {
  try {
    const result = await db.getAllAsync<ChatMessage>(
      `SELECT * FROM messages ORDER BY timestamp DESC`
    );
    return result;
  } catch (error) {
    throw error;
  }
};
