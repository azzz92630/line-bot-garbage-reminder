// MCP関連の型定義

export interface McpToolDefinition {
    name: string;
    description: string;
    parameters: {
      type: string;
      properties: Record<string, {
        type: string;
        description: string;
        enum?: string[];
        required?: boolean;
      }>;
      required?: string[];
    };
  }
  
  export interface McpToolCallRequest {
    tool_name: string;
    parameters: Record<string, any>;
  }
  
  export interface McpToolCallResponse {
    content: string;
  }
  
  export interface McpServerConfig {
    port: number;
    tools: McpToolDefinition[];
  }