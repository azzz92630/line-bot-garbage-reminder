# LINE ゴミ捨てリマインダーボット

Claude DesktopのMCP（Model Context Protocol）を活用した、LINEゴミ捨てリマインダーボットです。毎朝7時にLINEユーザーに「今日は何のゴミの日」かを通知します。

## 機能

- 毎朝7時に自動でLINEメッセージ送信
- 曜日に応じたゴミ種別の通知
- Claude Desktop MCPサーバーとの連携

## 必要条件

- Node.js 18以上
- LINE Messaging API Channel
- Claude Desktop
- LINE Developer Account

## セットアップ

1. リポジトリをクローン