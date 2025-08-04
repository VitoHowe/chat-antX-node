/**
 * 用户数据模型
 * 负责用户数据的增删改查操作
 */

const { query } = require("./db");

// 创建用户表的SQL语句
const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100),
    password VARCHAR(255) NOT NULL,
    plain_password VARCHAR(255) NOT NULL COMMENT '明文密码（仅用于管理，极不安全）',
    is_active TINYINT(1) DEFAULT 1 COMMENT '用户状态：1-可用，0-作废',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`;

// 初始化用户表
async function initTable() {
  try {
    await query(CREATE_TABLE_SQL);
    console.log("用户表初始化成功");
    return true;
  } catch (error) {
    console.error("用户表初始化失败:", error.message);
    return false;
  }
}

// 获取所有用户（不返回密码信息）
async function getAllUsers() {
  return await query(
    "SELECT id, username, email, is_active, created_at, updated_at FROM users WHERE is_active = 1"
  );
}

// 根据ID获取用户（不返回密码信息）
async function getUserById(id) {
  const users = await query(
    "SELECT id, username, email, is_active, created_at, updated_at FROM users WHERE id = ? AND is_active = 1",
    [id]
  );
  return users.length > 0 ? users[0] : null;
}

// 根据用户名获取用户（包含加密密码，用于登录验证）
async function getUserByUsername(username) {
  const users = await query(
    "SELECT id, username, email, password, is_active, created_at, updated_at FROM users WHERE username = ? AND is_active = 1",
    [username]
  );
  return users.length > 0 ? users[0] : null;
}

// 管理员专用：获取所有用户（包含明文密码和作废用户）
// ⚠️ 安全警告：此函数包含明文密码，仅供管理员使用
async function getAllUsersForAdmin() {
  return await query(
    "SELECT id, username, email, password, plain_password, is_active, created_at, updated_at FROM users ORDER BY created_at DESC"
  );
}

// 管理员专用：根据ID获取用户详情（包含明文密码）
// ⚠️ 安全警告：此函数包含明文密码，仅供管理员使用
async function getUserByIdForAdmin(id) {
  const users = await query(
    "SELECT id, username, email, password, plain_password, is_active, created_at, updated_at FROM users WHERE id = ?",
    [id]
  );
  return users.length > 0 ? users[0] : null;
}

// 作废用户（软删除）
async function deactivateUser(id) {
  const result = await query("UPDATE users SET is_active = 0 WHERE id = ?", [
    id,
  ]);
  return result.affectedRows > 0;
}

// 恢复用户
async function activateUser(id) {
  const result = await query("UPDATE users SET is_active = 1 WHERE id = ?", [
    id,
  ]);
  return result.affectedRows > 0;
}

// 创建新用户
async function createUser(userData) {
  const { username, email, password, plain_password, is_active = 1 } = userData;
  const result = await query(
    "INSERT INTO users (username, email, password, plain_password, is_active) VALUES (?, ?, ?, ?, ?)",
    [username, email, password, plain_password, is_active]
  );
  return result.insertId;
}

// 更新用户信息
async function updateUser(id, userData) {
  const { username, email, password } = userData;
  const updateFields = [];
  const params = [];

  if (username) {
    updateFields.push("username = ?");
    params.push(username);
  }
  if (email) {
    updateFields.push("email = ?");
    params.push(email);
  }
  if (password) {
    updateFields.push("password = ?");
    params.push(password);
  }

  if (updateFields.length === 0) {
    return false;
  }

  params.push(id);
  const result = await query(
    `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`,
    params
  );
  return result.affectedRows > 0;
}

// 删除用户
async function deleteUser(id) {
  const result = await query("DELETE FROM users WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

module.exports = {
  initTable,
  getAllUsers,
  getUserById,
  getUserByUsername,
  getAllUsersForAdmin,
  getUserByIdForAdmin,
  createUser,
  updateUser,
  deleteUser,
  deactivateUser,
  activateUser,
};
