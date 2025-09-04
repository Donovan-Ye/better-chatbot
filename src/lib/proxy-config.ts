/**
 * Proxy configuration for OpenAI requests
 */
export const PROXY_CONFIG = {
  // 代理服务器地址，默认为本地7890端口
  PROXY_URL: process.env.OPENAI_PROXY_URL || "http://127.0.0.1:7890",
  // 是否启用代理
  ENABLED: process.env.OPENAI_USE_PROXY !== "false", // 默认启用，设置为 "false" 时禁用
};

/**
 * 创建支持代理的自定义 fetch 函数
 * 使用 undici 的 ProxyAgent 方式设置代理
 */
export function createProxyFetch(): typeof fetch {
  console.log("🔧 Proxy config:", {
    enabled: PROXY_CONFIG.ENABLED,
    proxyUrl: PROXY_CONFIG.PROXY_URL,
  });

  if (!PROXY_CONFIG.ENABLED) {
    console.log("❌ Proxy disabled, using standard fetch");
    return fetch;
  }

  return async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;

    console.log("🌐 Fetch request to:", url);

    // 只对 OpenAI API 请求使用代理
    if (url.includes("api.openai.com")) {
      console.log("🔄 Using proxy for OpenAI request:", {
        url,
        proxyUrl: PROXY_CONFIG.PROXY_URL,
      });

      try {
        // 尝试使用 undici 的 ProxyAgent
        const { ProxyAgent } = await import("undici");
        const proxyAgent = new ProxyAgent(PROXY_CONFIG.PROXY_URL);

        console.log("🔧 Created undici ProxyAgent");

        const response = await fetch(input, {
          ...init,
          // @ts-expect-error - undici ProxyAgent 支持
          dispatcher: proxyAgent,
        });

        console.log("✅ Proxy request successful:", response.status);
        return response;
      } catch (error) {
        console.error("❌ Proxy request failed:", error);
        // console.log("🔄 Fallback: trying with proxy agents...");

        // // 回退到使用传统的 proxy agents
        // try {
        //   const proxyAgent = createProxyAgent(url);
        //   console.log("🔧 Created proxy agent:", proxyAgent.constructor.name);

        //   const response = await fetch(input, {
        //     ...init,
        //     // @ts-ignore - Node.js fetch 支持 agent 参数
        //     agent: proxyAgent,
        //   });

        //   console.log("✅ Fallback proxy request successful:", response.status);
        //   return response;
        // } catch (fallbackError) {
        //   console.error(
        //     "❌ Fallback proxy request also failed:",
        //     fallbackError,
        //   );
        //   throw fallbackError;
        // }
      }
    }

    console.log("🌐 Direct request (no proxy):", url);
    // 其他请求不使用代理
    return fetch(input, init);
  };
}

/**
 * 获取代理配置信息（用于调试）
 */
export function getProxyInfo() {
  return {
    enabled: PROXY_CONFIG.ENABLED,
    proxyUrl: PROXY_CONFIG.PROXY_URL,
  };
}
