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

// 获取所有用户
async function getAllUsers() {
  return await query(
    "SELECT id, username, email, created_at, updated_at FROM users"
  );
}

// 根据ID获取用户
async function getUserById(id) {
  const users = await query(
    "SELECT id, username, email, created_at, updated_at FROM users WHERE id = ?",
    [id]
  );
  return users.length > 0 ? users[0] : null;
}

// 根据用户名获取用户（包含密码，用于登录验证）
async function getUserByUsername(username) {
  const users = await query(
    "SELECT id, username, email, password, created_at, updated_at FROM users WHERE username = ?",
    [username]
  );
  return users.length > 0 ? users[0] : null;
}

// 创建新用户
async function createUser(userData) {
  const { username, email, password } = userData;
  const result = await query(
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
    [username, email, password]
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
  createUser,
  updateUser,
  deleteUser,
};
