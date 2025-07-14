/*
 * @Description:
 * @Version: 2.0
 * @Autor: MyStery
 * @Date: 2025-07-09 23:30:45
 * @LastEditors: MyStery
 * @LastEditTime: 2025-07-14 20:15:43
 */
/**
 * 代理控制器
 * 负责将请求转发到外部API
 */

const axios = require("axios");
const modelSourceModel = require("../models/modelSource");
const fetch = require("node-fetch"); // 确保安装了node-fetch
const { verifyToken } = require("./authController"); // 导入token验证中间件

// 转发模型列表请求
async function forwardModelsRequest(ctx) {
  // 验证Token
  try {
    await verifyToken(ctx, async () => {
      // Token验证通过，继续执行原有逻辑
      await executeForwardModelsRequest(ctx);
    });
  } catch (error) {
    // Token验证失败，verifyToken已经设置了响应
    return;
  }
}

// 原有的转发模型列表请求逻辑
async function executeForwardModelsRequest(ctx) {
  try {
    const { type } = ctx.query;

    // 验证必要的参数
    if (!type) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "缺少必要的参数: type",
      };
      return;
    }

    // 从数据库获取API密钥
    const apiKey = await modelSourceModel.getApiKeyByType(type);

    // 构建完整的API URL
    const apiUrl = await modelSourceModel.buildApiUrl(type, "/v1/models");

    if (!apiKey || !apiUrl) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: `不支持的type值: ${type}，或该来源未启用`,
      };
      return;
    }

    // 转发请求
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: apiKey,
      },
    });

    // 返回外部API的响应，包装成统一格式
    ctx.body = {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("转发请求失败:", error.message);

    // 如果是外部API返回的错误，保留状态码和错误信息
    if (error.response) {
      ctx.status = error.response.status;
      ctx.body = {
        success: false,
        message: "外部API返回错误",
        error: error.response.data,
      };
    } else {
      // 其他错误
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: "转发请求失败",
        error: error.message,
      };
    }
  }
}

// 转发聊天完成请求
async function forwardChatCompletions(ctx) {
  // 验证Token
  try {
    await verifyToken(ctx, async () => {
      // Token验证通过，继续执行原有逻辑
      await executeForwardChatCompletions(ctx);
    });
  } catch (error) {
    // Token验证失败，verifyToken已经设置了响应
    return;
  }
}

// 原有的转发聊天完成请求逻辑
async function executeForwardChatCompletions(ctx) {
  try {
    const { type } = ctx.query;
    const requestData = ctx.request.body;
    const isStreamMode = requestData.stream === true;

    console.log("=== 聊天完成请求开始 ===");
    console.log("查询参数 type:", type);
    console.log("用户信息:", ctx.user); // 显示验证通过的用户信息
    // console.log("请求体:", JSON.stringify(requestData, null, 2));
    console.log("是否流式模式:", isStreamMode);

    // 验证必要的参数
    if (!type) {
      console.log("❌ 缺少type参数");
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "缺少必要的参数: type",
      };
      return;
    }

    // 从数据库获取API密钥
    console.log("🔍 正在获取API密钥...");
    const apiKey = await modelSourceModel.getApiKeyByType(type);
    console.log("API密钥获取结果:", apiKey ? "✅ 成功" : "❌ 失败");

    // 构建完整的API URL
    console.log("🔗 正在构建API URL...");
    const apiUrl = await modelSourceModel.buildApiUrl(
      type,
      "/v1/chat/completions"
    );
    console.log("构建的API URL:", apiUrl);

    if (!apiKey || !apiUrl) {
      console.log("❌ API密钥或URL获取失败");
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: `不支持的type值: ${type}，或该来源未启用`,
      };
      return;
    }

    if (isStreamMode) {
      console.log("🌊 开始处理流式响应...");

      // 设置Koa不要自动处理响应
      ctx.respond = false;

      // 流式响应处理
      ctx.set({
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });
      console.log("📝 设置响应头完成");

      try {
        // console.log("📡 发送fetch请求到外部API...");
        // console.log("请求URL:", apiUrl);
        // console.log("请求头:", {
        //   Authorization: apiKey.substring(0, 20) + "...",
        //   "Content-Type": "application/json",
        //   Accept: "text/event-stream",
        // });

        // 使用fetch API处理流式响应
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            Authorization: apiKey,
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify(requestData),
        });

        console.log("📥 收到外部API响应:");
        // console.log("响应状态:", response.status);
        // console.log("响应状态文本:", response.statusText);
        // console.log("响应头:", Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          console.log("❌ 外部API返回错误状态");
          throw new Error(
            `API请求失败: ${response.status} ${response.statusText}`
          );
        }

        console.log("✅ 外部API响应正常，开始处理流...");

        // 获取响应体的可读流
        const reader = response.body;
        console.log("📖 获取到流读取器:", reader ? "✅ 成功" : "❌ 失败");

        if (!reader) {
          throw new Error("无法获取响应流");
        }

        // 设置响应状态码
        ctx.res.statusCode = response.status;

        // 将流直接传递给客户端
        reader.on("readable", () => {
          console.log("📊 流可读事件触发");
          let chunk;
          let chunkCount = 0;
          while (null !== (chunk = reader.read())) {
            chunkCount++;
            // console.log(
            //   `📦 处理数据块 ${chunkCount}, 大小: ${chunk.length} 字节`
            // );
            if (!ctx.res.writableEnded && !ctx.res.destroyed) {
              ctx.res.write(chunk);
              // console.log(`✅ 数据块 ${chunkCount} 已写入客户端`);
            } else {
              console.log(`⚠️ 客户端连接已关闭，跳过数据块 ${chunkCount}`);
              break;
            }
          }
        });

        // 处理流结束
        reader.on("end", () => {
          console.log("🏁 流读取结束");
          if (!ctx.res.writableEnded && !ctx.res.destroyed) {
            ctx.res.end();
            console.log("✅ 响应已正常结束");
          } else {
            // console.log("⚠️ 响应已经结束，无需重复结束");
          }
        });

        // 处理错误
        reader.on("error", (err) => {
          console.error("❌ 流读取错误:", err);
          if (!ctx.res.writableEnded && !ctx.res.destroyed) {
            ctx.res.statusCode = 500;
            ctx.res.end(
              JSON.stringify({
                success: false,
                message: "流读取错误",
                error: err.message,
              })
            );
            console.log("📝 错误响应已发送");
          }
        });

        // 处理客户端断开连接
        ctx.req.on("close", () => {
          console.log("🔌 客户端连接断开，销毁流读取器");
          reader.destroy();
        });

        console.log("🎯 流式响应设置完成，等待数据传输...");
        // 返回，但不结束响应
        return;
      } catch (error) {
        console.error("❌ 流式请求失败:", error.message);
        console.error("错误堆栈:", error.stack);

        // 重新启用Koa的响应处理
        ctx.respond = true;
        ctx.status = 500;
        ctx.body = {
          success: false,
          message: "流式请求失败",
          error: error.message,
        };
        return;
      }
    } else {
      console.log("📄 处理普通响应...");
      // 普通响应处理
      const response = await axios.post(apiUrl, requestData, {
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
      });

      console.log("✅ 普通响应处理完成");
      // 返回外部API的响应
      ctx.body = {
        success: true,
        data: response.data,
      };
    }
  } catch (error) {
    console.error("❌ 转发聊天请求失败:", error.message);
    console.error("错误堆栈:", error.stack);

    // 如果是外部API返回的错误，保留状态码和错误信息
    if (error.response) {
      console.log("外部API错误状态:", error.response.status);
      console.log("外部API错误数据:", error.response.data);
      ctx.status = error.response.status;
      ctx.body = {
        success: false,
        message: "外部API返回错误",
        error: error.response.data,
      };
    } else {
      // 其他错误
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: "转发聊天请求失败",
        error: error.message,
      };
    }
  }
}

// 获取所有模型来源信息
async function getModelSources(ctx) {
  // 验证Token
  try {
    await verifyToken(ctx, async () => {
      // Token验证通过，继续执行原有逻辑
      await executeGetModelSources(ctx);
    });
  } catch (error) {
    // Token验证失败，verifyToken已经设置了响应
    return;
  }
}

// 原有的获取所有模型来源信息逻辑
async function executeGetModelSources(ctx) {
  try {
    // 从数据库获取所有模型来源
    const sources = await modelSourceModel.getAllSources();

    // 格式化返回数据，只包含必要信息
    const formattedSources = sources.map((source) => ({
      type: source.type,
      name: source.name,
      baseUrl: source.base_url,
      isActive: source.is_active,
    }));

    ctx.body = {
      success: true,
      data: formattedSources,
    };
  } catch (error) {
    console.error("获取模型来源失败:", error.message);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "获取模型来源失败",
      error: error.message,
    };
  }
}

// 获取单个模型来源信息
async function getModelSourceByType(ctx) {
  // 验证Token
  try {
    await verifyToken(ctx, async () => {
      // Token验证通过，继续执行原有逻辑
      await executeGetModelSourceByType(ctx);
    });
  } catch (error) {
    // Token验证失败，verifyToken已经设置了响应
    return;
  }
}

// 原有的获取单个模型来源信息逻辑
async function executeGetModelSourceByType(ctx) {
  try {
    const { type } = ctx.params;

    if (!type) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "缺少必要的参数: type",
      };
      return;
    }

    // 从数据库获取模型来源信息
    const source = await modelSourceModel.getSourceByType(type);

    if (!source) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: `找不到type为${type}的模型来源`,
      };
      return;
    }

    // 格式化返回数据，不包含敏感信息
    const formattedSource = {
      type: source.type,
      name: source.name,
      baseUrl: source.base_url,
      isActive: source.is_active,
      createdAt: source.created_at,
      updatedAt: source.updated_at,
    };

    ctx.body = {
      success: true,
      data: formattedSource,
    };
  } catch (error) {
    console.error("获取模型来源失败:", error.message);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "获取模型来源失败",
      error: error.message,
    };
  }
}

// 导出所有控制器方法
module.exports = {
  forwardModelsRequest,
  forwardChatCompletions,
  getModelSources,
  getModelSourceByType,
};
