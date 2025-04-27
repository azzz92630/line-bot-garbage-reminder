import { CronJob } from 'cron';
import { sendTextMessage } from '../utils/line.js';
import { McpToolDefinition, McpToolCallRequest, McpToolCallResponse } from '../types/mcp.js';

// ゴミ種別の定義
const GARBAGE_TYPES = {
  MONDAY: '燃えるゴミ',
  TUESDAY: '草木',
  WEDNESDAY: 'プラスチックゴミ・空き瓶',
  THURSDAY: '燃えるゴミ',
  FRIDAY: '不燃ごみ・ペットボトル',
  SATURDAY: '資源・古着',
  SUNDAY: '特になし'
};

// 曜日を日本語に変換
const DAY_NAMES_JP = {
  MONDAY: '月曜日',
  TUESDAY: '火曜日',
  WEDNESDAY: '水曜日',
  THURSDAY: '木曜日',
  FRIDAY: '金曜日',
  SATURDAY: '土曜日',
  SUNDAY: '日曜日'
};

// 今日の曜日を取得
function getTodayDayName(): string {
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const today = new Date();
  return days[today.getDay()];
}

// 明日の曜日を取得
function getTomorrowDayName(): string {
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return days[tomorrow.getDay()];
}

// ゴミ捨てリマインダー通知を送信
export async function sendGarbageReminder(userId: string, timing: 'today' | 'tomorrow' = 'today'): Promise<string> {
  try {
    const dayName = timing === 'today' ? getTodayDayName() : getTomorrowDayName();
    const garbageType = GARBAGE_TYPES[dayName as keyof typeof GARBAGE_TYPES];
    const dayNameJp = DAY_NAMES_JP[dayName as keyof typeof DAY_NAMES_JP];
    
    const message = timing === 'today' 
      ? `おはようございます！今日は${dayNameJp}、${garbageType}の日です。`
      : `明日は${dayNameJp}、${garbageType}の日です。準備をお忘れなく！`;
    
    await sendTextMessage(userId, message);
    return `リマインダーを正常に送信しました: ${message}`;
  } catch (error) {
    console.error('ゴミ捨てリマインダー送信エラー:', error);
    return `エラーが発生しました: ${error instanceof Error ? error.message : String(error)}`;
  }
}

// 毎朝7時にリマインダーを送信するcronジョブを設定
export function scheduleGarbageReminder(userId: string): CronJob {
  const job = new CronJob('0 7 * * *', async () => {
    try {
      await sendGarbageReminder(userId);
      console.log(`${new Date().toISOString()}: ゴミ捨てリマインダーを送信しました`);
    } catch (error) {
      console.error('cronジョブエラー:', error);
    }
  }, null, true, 'Asia/Tokyo');
  
  return job;
}

// MCP用のツール定義
export const garbageReminderToolDefinition: McpToolDefinition = {
  name: 'garbage_reminder',
  description: 'ユーザーにゴミ捨てリマインダーを送信します。毎朝7時に自動送信されますが、このツールを使って手動で送信することもできます。',
  parameters: {
    type: 'object',
    properties: {
      timing: {
        type: 'string',
        description: 'リマインドするタイミング（today: 今日のゴミ、tomorrow: 明日のゴミ）',
        enum: ['today', 'tomorrow'],
      }
    },
    required: []
  }
};

// MCP Tool呼び出しハンドラー
export async function handleGarbageReminderToolCall(request: McpToolCallRequest): Promise<McpToolCallResponse> {
  const userId = process.env.LINE_USER_ID;
  
  if (!userId) {
    return {
      content: 'エラー: LINE_USER_ID環境変数が設定されていません。'
    };
  }
  
  const timing = request.parameters.timing || 'today';
  
  try {
    const result = await sendGarbageReminder(userId, timing as 'today' | 'tomorrow');
    return {
      content: result
    };
  } catch (error) {
    return {
      content: `エラーが発生しました: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}