/**
 * 数据库字段迁移脚本
 * 添加 plain_password 和 is_active 字段
 */

const { query } = require("../models/db");

async function migrateDatabase() {
  try {
    console.log("开始数据库迁移...");

    // 检查字段是否已存在
    try {
      await query("SELECT plain_password FROM users LIMIT 1");
      console.log("plain_password 字段已存在");
    } catch (error) {
      console.log("添加 plain_password 字段...");
      await query(
        "ALTER TABLE users ADD COLUMN plain_password VARCHAR(255) DEFAULT '' COMMENT 'Plain text password for admin use only'"
      );
      console.log("✅ plain_password 字段添加成功");
    }

    try {
      await query("SELECT is_active FROM users LIMIT 1");
      console.log("is_active 字段已存在");
    } catch (error) {
      console.log("添加 is_active 字段...");
      await query(
        "ALTER TABLE users ADD COLUMN is_active TINYINT(1) DEFAULT 1 COMMENT 'User status: 1-active, 0-deactivated'"
      );
      console.log("✅ is_active 字段添加成功");
    }

    // 更新现有用户状态
    console.log("更新现有用户状态...");
    const result = await query(
      "UPDATE users SET is_active = 1 WHERE is_active IS NULL OR is_active = 0"
    );
    console.log(`✅ 更新了 ${result.affectedRows} 个用户的状态`);

    console.log("🎉 数据库迁移完成！");
    process.exit(0);
  } catch (error) {
    console.error("❌ 数据库迁移失败:", error);
    process.exit(1);
  }
}

// 执行迁移
migrateDatabase();
