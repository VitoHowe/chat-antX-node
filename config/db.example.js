/**
 * 数据库配置文件（示例）
 * 请复制此文件为 db.js 并填入您的实际数据库信息
 */

module.exports = {
  host: "localhost",
  port: 3306,
  user: "root",
  password: "your_password",
  database: "your_database",
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
};
