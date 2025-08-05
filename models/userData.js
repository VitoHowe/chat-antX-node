/**
 * 用户数据模型
 * 负责用户自定义字段数据的增删改查操作
 * 支持JSON格式的大数据存储
 */

const { query } = require("./db");

// 创建用户数据表的SQL语句
const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS user_data (
    id LONGTEXT NOT NULL COMMENT '数据记录唯一标识（前端key）',
    user_id INT NOT NULL COMMENT '关联用户ID',
    field_name VARCHAR(100) NOT NULL COMMENT '字段名称标识',
    data JSON NOT NULL COMMENT 'JSON格式的数据内容',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '记录更新时间',
    PRIMARY KEY (id(255)),
    INDEX idx_user_id (user_id),
    INDEX idx_user_field (user_id, field_name),
    INDEX idx_user_key (user_id, id(255))
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户自定义数据存储表'
`;

// 初始化用户数据表
async function initTable() {
  try {
    // 先尝试删除旧表（如果存在）
    try {
      await query("DROP TABLE IF EXISTS user_data");
      console.log("已删除旧的用户数据表");
    } catch (dropError) {
      console.error("删除旧表失败:", dropError.message);
      // 继续执行，尝试创建新表
    }
    
    // 创建新表
    await query(CREATE_TABLE_SQL);
    console.log("用户数据表初始化成功");
    return true;
  } catch (error) {
    console.error("用户数据表初始化失败:", error.message);
    return false;
  }
}

// 根据用户ID获取所有数据
async function getUserDataByUserId(userId) {
  try {
    return await query(
      "SELECT id, field_name, created_at, updated_at FROM user_data WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );
  } catch (error) {
    console.error("获取用户数据失败:", error.message);
    throw error;
  }
}

// 根据用户ID和字段名获取特定数据（内部使用，用于重复检查）
async function _getUserDataByUserIdAndField(userId, fieldName) {
  try {
    const results = await query(
      "SELECT id, data, created_at, updated_at FROM user_data WHERE user_id = ? AND field_name = ?",
      [userId, fieldName]
    );
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error("获取用户特定字段数据失败:", error.message);
    throw error;
  }
}

// 根据用户ID和记录ID获取特定数据
async function getUserDataByUserIdAndId(userId, dataId) {
  try {
    const results = await query(
      "SELECT id, field_name, data, created_at, updated_at FROM user_data WHERE user_id = ? AND id = ?",
      [userId, dataId]
    );
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error("获取用户特定数据失败:", error.message);
    throw error;
  }
}

// 创建新的用户数据记录
async function createUserData(userData) {
  try {
    const { id, user_id, field_name, data } = userData;
    
    // 验证必填参数
    if (!id || !user_id || !field_name || data === undefined) {
      throw new Error("id、user_id、field_name和data都是必填参数");
    }
    
    // 检查ID是否已存在（全局唯一性检查）
    const existingById = await query(
      "SELECT id FROM user_data WHERE id = ?",
      [id]
    );
    if (existingById.length > 0) {
      throw new Error(`ID "${id}" 已存在，请使用不同的key值`);
    }
    
    const result = await query(
      "INSERT INTO user_data (id, user_id, field_name, data) VALUES (?, ?, ?, ?)",
      [id, user_id, field_name, JSON.stringify(data)]
    );
    return id; // 返回前端传递的key值
  } catch (error) {
    // 增强错误处理，提供更明确的错误消息
    if (error.message.includes("Out of range value for column 'id'")) {
      console.error("ID值超出范围或包含不支持的字符:", error.message);
      throw new Error("ID值包含不支持的字符，请只使用字母、数字、下划线、连字符和点号");
    } else if (error.message.includes("Incorrect string value")) {
      console.error("字符串值编码错误:", error.message);
      throw new Error("字段值包含不支持的字符，请检查编码");
    } else {
      console.error("创建用户数据失败:", error.message);
      throw error;
    }
  }
}

// 更新用户数据记录
async function updateUserData(id, updateData) {
  try {
    const { field_name, data } = updateData;
    const updateFields = [];
    const params = [];

    if (field_name) {
      updateFields.push("field_name = ?");
      params.push(field_name);
    }
    if (data !== undefined) {
      updateFields.push("data = ?");
      params.push(JSON.stringify(data));
    }

    if (updateFields.length === 0) {
      return false;
    }

    params.push(id);
    const result = await query(
      `UPDATE user_data SET ${updateFields.join(", ")} WHERE id = ?`,
      params
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error("更新用户数据失败:", error.message);
    throw error;
  }
}

// 根据用户ID和记录ID更新数据
async function updateUserDataByUserIdAndId(userId, dataId, updateData) {
  try {
    const { field_name, data } = updateData;
    const updateFields = [];
    const params = [];

    if (field_name) {
      updateFields.push("field_name = ?");
      params.push(field_name);
    }
    if (data !== undefined) {
      updateFields.push("data = ?");
      params.push(JSON.stringify(data));
    }

    if (updateFields.length === 0) {
      return false;
    }

    params.push(userId, dataId);
    const result = await query(
      `UPDATE user_data SET ${updateFields.join(", ")} WHERE user_id = ? AND id = ?`,
      params
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error("更新用户特定数据失败:", error.message);
    throw error;
  }
}

// 删除用户数据记录
async function deleteUserData(id) {
  try {
    const result = await query("DELETE FROM user_data WHERE id = ?", [id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error("删除用户数据失败:", error.message);
    throw error;
  }
}

// 根据用户ID和记录ID删除数据
async function deleteUserDataByUserIdAndId(userId, dataId) {
  try {
    const result = await query(
      "DELETE FROM user_data WHERE user_id = ? AND id = ?",
      [userId, dataId]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error("删除用户特定数据失败:", error.message);
    throw error;
  }
}

// 删除用户的所有数据
async function deleteAllUserData(userId) {
  try {
    const result = await query("DELETE FROM user_data WHERE user_id = ?", [userId]);
    return result.affectedRows;
  } catch (error) {
    console.error("删除用户所有数据失败:", error.message);
    throw error;
  }
}

// 获取所有用户数据（管理后台使用）
async function getAllUserData(limit = 100, offset = 0) {
  try {
    return await query(
      "SELECT id, user_id, field_name, data, created_at, updated_at FROM user_data ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [limit, offset]
    );
  } catch (error) {
    console.error("获取所有用户数据失败:", error.message);
    throw error;
  }
}

// 获取用户数据统计信息
async function getUserDataStats(userId) {
  try {
    const result = await query(
      "SELECT COUNT(*) as total_records, COUNT(DISTINCT field_name) as unique_fields FROM user_data WHERE user_id = ?",
      [userId]
    );
    return result[0];
  } catch (error) {
    console.error("获取用户数据统计失败:", error.message);
    throw error;
  }
}

module.exports = {
  initTable,
  getUserDataByUserId,
  getUserDataByUserIdAndId,
  createUserData,
  updateUserData,
  updateUserDataByUserIdAndId,
  deleteUserData,
  deleteUserDataByUserIdAndId,
  deleteAllUserData,
  getAllUserData,
  getUserDataStats,
}; 