/**
 * 数据库配置文件
 * 包含MySQL数据库连接信息和连接池设置
 */

module.exports = {
  host: "43.133.12.24",
  port: 3306,
  user: "root",
  password: "wyx19960412",
  database: "chat_antx",
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
};
