/**
 * 模型来源数据模型
 * 负责存储不同类型的API来源及其对应的API密钥
 */

const { query } = require("./db");

// 创建模型来源表的SQL语句
const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS model_sources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type INT NOT NULL UNIQUE COMMENT '来源类型，1: translate-api, 2: voct-api',
    name VARCHAR(100) NOT NULL COMMENT '来源名称',
    base_url VARCHAR(255) NOT NULL COMMENT '基础服务器地址',
    api_key VARCHAR(255) NOT NULL COMMENT 'API密钥',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`;

// 初始化表
async function initTable() {
  try {
    await query(CREATE_TABLE_SQL);
    console.log("模型来源表初始化成功");

    // 检查是否已有数据，避免重复插入
    const existingData = await query(
      "SELECT COUNT(*) as count FROM model_sources"
    );

    if (existingData[0].count === 0) {
      // 插入初始数据
      await query(`
        INSERT INTO model_sources (type, name, base_url, api_key, is_active) VALUES 
        (1, 'translate-api', 'https://translate-api.665.pp.ua', 'Bearer sk-mLpIJlWduRji0XPqcLGFknplVTVMHXOR8mFDbF3Hktw5umJA', true),
        (2, 'voct-api', 'https://v2.voct.top', 'Bearer sk-mLpIJlWduRji0XPqcLGFknplVTVMHXOR8mFDbF3Hktw5umJA', true)
      `);
      console.log("模型来源初始数据添加成功");
    }

    return true;
  } catch (error) {
    console.error("模型来源表初始化失败:", error.message);
    return false;
  }
}

// 根据类型获取API密钥
async function getApiKeyByType(type) {
  try {
    const sources = await query(
      "SELECT api_key FROM model_sources WHERE type = ? AND is_active = true",
      [type]
    );
    return sources.length > 0 ? sources[0].api_key : null;
  } catch (error) {
    console.error("获取API密钥失败:", error.message);
    throw error;
  }
}

// 根据类型获取基础URL
async function getBaseUrlByType(type) {
  try {
    const sources = await query(
      "SELECT base_url FROM model_sources WHERE type = ? AND is_active = true",
      [type]
    );
    return sources.length > 0 ? sources[0].base_url : null;
  } catch (error) {
    console.error("获取基础URL失败:", error.message);
    throw error;
  }
}

// 根据类型和路径构建完整API URL
async function buildApiUrl(type, path) {
  try {
    const baseUrl = await getBaseUrlByType(type);
    if (!baseUrl) return null;

    // 确保路径以/开头
    if (!path.startsWith("/")) {
      path = "/" + path;
    }

    return `${baseUrl}${path}`;
  } catch (error) {
    console.error("构建API URL失败:", error.message);
    throw error;
  }
}

// 根据类型获取完整的模型来源信息
async function getSourceByType(type) {
  try {
    const sources = await query(
      "SELECT id, type, name, base_url, is_active, created_at, updated_at FROM model_sources WHERE type = ?",
      [type]
    );
    return sources.length > 0 ? sources[0] : null;
  } catch (error) {
    console.error("获取模型来源信息失败:", error.message);
    throw error;
  }
}

// 获取所有模型来源
async function getAllSources() {
  try {
    return await query(
      "SELECT id, type, name, base_url, is_active, created_at, updated_at FROM model_sources"
    );
  } catch (error) {
    console.error("获取模型来源列表失败:", error.message);
    throw error;
  }
}

// 更新模型来源
async function updateSource(id, data) {
  try {
    const { name, base_url, api_key, is_active } = data;
    const updateFields = [];
    const params = [];

    if (name) {
      updateFields.push("name = ?");
      params.push(name);
    }
    if (base_url) {
      updateFields.push("base_url = ?");
      params.push(base_url);
    }
    if (api_key) {
      updateFields.push("api_key = ?");
      params.push(api_key);
    }
    if (is_active !== undefined) {
      updateFields.push("is_active = ?");
      params.push(is_active);
    }

    if (updateFields.length === 0) {
      return false;
    }

    params.push(id);
    const result = await query(
      `UPDATE model_sources SET ${updateFields.join(", ")} WHERE id = ?`,
      params
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error("更新模型来源失败:", error.message);
    throw error;
  }
}

module.exports = {
  initTable,
  getApiKeyByType,
  getBaseUrlByType,
  buildApiUrl,
  getSourceByType,
  getAllSources,
  updateSource,
};
