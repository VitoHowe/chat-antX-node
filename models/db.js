/**
 * 数据库连接模块
 * 负责创建和管理MySQL数据库连接池
 */

const mysql = require("mysql2/promise");
const dbConfig = require("../config/db");

// 创建数据库连接池
const pool = mysql.createPool(dbConfig);

// 测试数据库连接
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("数据库连接成功!");
    connection.release();
    return true;
  } catch (error) {
    console.error("数据库连接失败:", error.message);
    return false;
  }
}

// 执行SQL查询的通用函数
async function query(sql, params) {
  try {
    const [rows, fields] = await pool.execute(sql, params || []);
    return rows;
  } catch (error) {
    console.error("SQL执行错误:", error.message);
    throw error;
  }
}

module.exports = {
  pool,
  query,
  testConnection,
};
