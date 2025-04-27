import express from 'express';
import dotenv from 'dotenv';
import { garbageReminderToolDefinition, handleGarbageReminderToolCall, scheduleGarbageReminder } from './tools/garbage_reminder_tool.js';
import { McpToolCallRequest, McpServerConfig } from './types/mcp.js';

// 環境変数を読み込み
dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3333;
const LINE_USER_ID = process.env.LINE_USER_ID;

// 環境変数チェック
if (!process.env.LINE_CHANNEL_ACCESS_TOKEN || !process.env.LINE_CHANNEL_SECRET || !LINE_USER_ID) {
  console.error('必要な環境変数が設定されていません。.envファイルを確認してください。');
  process.exit(1);
}

// Expressアプリの初期化
const app = express();
app.use(express.json());

// MCP設定
const mcpConfig: McpServerConfig = {
  port: PORT,
  tools: [garbageReminderToolDefinition]
};

// MCP Manifestエンドポイント
app.get('/v1/tools', (req, res) => {
  res.json({ tools: mcpConfig.tools });
});

// MCP Tool呼び出しエンドポイント
app.post('/v1/tools/call', async (req, res) => {
  try {
    const request = req.body as McpToolCallRequest;
    console.log('Tool call request:', request);
    
    if (request.tool_name === 'garbage_reminder') {
      const response = await handleGarbageReminderToolCall(request);
      res.json(response);
    } else {
      res.status(404).json({ error: `Unknown tool: ${request.tool_name}` });
    }
  } catch (error) {
    console.error('Tool call error:', error);
    res.status(500).json({ error: `Internal server error: ${error instanceof Error ? error.message : String(error)}` });
  }
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`MCP Server running on port ${PORT}`);
  console.log(`Tool manifest available at: http://localhost:${PORT}/v1/tools`);
  
  // 毎朝7時のリマインダー設定
  if (LINE_USER_ID) {
    const job = scheduleGarbageReminder(LINE_USER_ID);
    console.log(`ゴミ捨てリマインダーが設定されました。次回実行: ${job.nextDates()}`);
  }
});

// 終了時の処理
process.on('SIGINT', () => {
  console.log('MCP Server shutting down');
  process.exit(0);
});