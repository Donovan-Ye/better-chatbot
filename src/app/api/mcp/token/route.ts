import { NextRequest } from "next/server";
import { getToolName } from "ai";
import { mcpClientsManager } from "lib/ai/mcp/mcp-manager";
import { pgMcpOAuthRepository } from "lib/db/pg/repositories/mcp-oauth-repository.pg";

export async function POST(request: NextRequest) {
  try {
    const { toolName: providedToolName, part } = await request.json();

    let toolName = providedToolName;

    // 如果没有提供 toolName，尝试从 part 中获取
    if (!toolName && part) {
      toolName = getToolName(part);
    }

    if (!toolName) {
      return Response.json(
        { error: "toolName or part is required" },
        { status: 400 },
      );
    }

    // 获取所有 MCP 工具
    const mcpTools = await mcpClientsManager.tools();

    // 找到对应的工具并获取其 MCP 服务器 ID
    const tool = mcpTools[toolName];
    if (!tool || !tool._mcpServerId) {
      return Response.json(
        { error: `Tool ${toolName} not found or missing MCP server ID` },
        { status: 404 },
      );
    }

    const mcpServerId = tool._mcpServerId;

    // 通过 MCP 服务器 ID 获取 OAuth session
    const oauthSession =
      await pgMcpOAuthRepository.getAuthenticatedSession(mcpServerId);

    if (!oauthSession?.tokens) {
      return Response.json(
        { error: `No OAuth tokens found for MCP server ${mcpServerId}` },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      data: {
        serverId: mcpServerId,
        serverName: tool._mcpServerName,
        tokens: oauthSession.tokens,
        toolName: tool._originToolName,
      },
    });
  } catch (error) {
    console.error("Error getting MCP token:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
