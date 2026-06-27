import { db, devicePushTokensTable } from "@workspace/db";

const EXPO_PUSH_API = "https://exp.host/--/api/v2/push/send";

interface PushMessage {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export async function sendPushToAll(message: PushMessage): Promise<void> {
  const rows = await db.select().from(devicePushTokensTable);
  if (rows.length === 0) return;

  const tokens = rows.map((r) => r.token);

  const chunks: string[][] = [];
  for (let i = 0; i < tokens.length; i += 100) {
    chunks.push(tokens.slice(i, i + 100));
  }

  for (const chunk of chunks) {
    const messages = chunk.map((to) => ({
      to,
      title: message.title,
      body: message.body,
      data: message.data ?? {},
      sound: "default",
      priority: "high",
    }));

    try {
      await fetch(EXPO_PUSH_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
        },
        body: JSON.stringify(messages),
      });
    } catch {
    }
  }
}
