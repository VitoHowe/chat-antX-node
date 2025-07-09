/*
 * @Description:
 * @Version: 2.0
 * @Autor: MyStery
 * @Date: 2025-07-09 23:30:45
 * @LastEditors: MyStery
 * @LastEditTime: 2025-07-10 00:06:43
 */
/**
 * 代理控制器
 * 负责将请求转发到外部API
 */

const axios = require("axios");
const modelSourceModel = require("../models/modelSource");

// 转发模型列表请求
async function forwardModelsRequest(ctx) {
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

    // 从数据库获取API密钥和URL
    const apiKey = await modelSourceModel.getApiKeyByType(type);
    const apiUrl = await modelSourceModel.getApiUrlByType(type);

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

    // 返回外部API的响应
    ctx.body = response.data;
  } catch (error) {
    console.error("转发请求失败:", error.message);

    // 如果是外部API返回的错误，保留状态码和错误信息
    if (error.response) {
      ctx.status = error.response.status;
      ctx.body = error.response.data;
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

// 获取所有模型来源信息
async function getModelSources(ctx) {
  try {
    // 从数据库获取所有模型来源
    const sources = await modelSourceModel.getAllSources();

    // 格式化返回数据，只包含必要信息
    const formattedSources = sources.map((source) => ({
      type: source.type,
      name: source.name,
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
      apiUrl: source.api_url,
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
  getModelSources,
  getModelSourceByType,
};
