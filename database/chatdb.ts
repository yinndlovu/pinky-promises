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
  } catch (error) {
    console.error("Error creating table:", error);
    throw error;
  }
};

export const saveMessage = async (
  id: string,
  text: string,
  sender: string,
  timestamp: number
): Promise<void> => {
  try {
    await db.runAsync(
      `INSERT INTO messages (id, text, sender, timestamp) VALUES (?, ?, ?, ?)`,
      [id, text, sender, timestamp]
    );
  } catch (error) {
    console.error("Error saving message:", error);
    throw error;
  }
};

export const deleteOldMessages = async (): Promise<void> => {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  try {
    await db.runAsync(`DELETE FROM messages WHERE timestamp < ?`, [
      sevenDaysAgo,
    ]);
  } catch (error) {
    console.error("Error deleting old messages:", error);
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
    console.error("Error fetching messages:", error);
    throw error;
  }
};
