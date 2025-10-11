import { ToolUIPart, getToolName } from "ai";
import { OAuthTokens } from "@modelcontextprotocol/sdk/shared/auth.js";

export type McpTokenResponse =
  | {
      success: true;
      data: {
        serverId: string;
        serverName: string;
        tokens: OAuthTokens;
        toolName: string;
      };
    }
  | {
      success: false;
      error: string;
    };

/**
 * 通过工具名称获取 MCP OAuth token
 * @param toolName 工具名称
 * @returns Promise<McpTokenResponse>
 */
export async function getMcpTokenByToolName(
  toolName: string,
): Promise<McpTokenResponse> {
  try {
    const response = await fetch("/api/mcp/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ toolName }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || "Failed to get MCP token",
      };
    }

    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * 通过 ToolUIPart 获取 MCP OAuth token
 * @param part ToolUIPart
 * @returns Promise<McpTokenResponse>
 */
export async function getMcpTokenByPart(
  part: ToolUIPart,
): Promise<McpTokenResponse> {
  const toolName = getToolName(part);
  return getMcpTokenByToolName(toolName);
}

/**
 * 通过 toolCallId 获取 MCP OAuth token（需要提供 part 对象）
 * @param part ToolUIPart 包含 toolCallId 的部分
 * @returns Promise<McpTokenResponse>
 */
export async function getMcpTokenByToolCallId(
  part: ToolUIPart,
): Promise<McpTokenResponse> {
  return getMcpTokenByPart(part);
}
