import { Client, TextMessage } from '@line/bot-sdk';
import dotenv from 'dotenv';

dotenv.config();

// LINE SDKクライアントの初期化
const lineClient = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || ''
});

// ユーザーにテキストメッセージを送信する関数
export async function sendTextMessage(userId: string, text: string): Promise<void> {
  if (!process.env.LINE_CHANNEL_ACCESS_TOKEN) {
    throw new Error('LINE_CHANNEL_ACCESS_TOKEN is not set in environment variables');
  }

  if (!userId) {
    throw new Error('UserId is required to send a message');
  }

  const message: TextMessage = {
    type: 'text',
    text: text
  };

  try {
    await lineClient.pushMessage(userId, message);
    console.log(`Message sent to ${userId}: ${text}`);
  } catch (error) {
    console.error('Error sending message to LINE:', error);
    throw error;
  }
}

export { lineClient };