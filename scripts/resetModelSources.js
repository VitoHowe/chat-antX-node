/**
 * 重置模型来源表的脚本
 */

const { query } = require("../models/db");
const modelSourceModel = require("../models/modelSource");

async function resetModelSourcesTable() {
  try {
    // 删除现有表
    console.log("正在删除现有的模型来源表...");
    await query("DROP TABLE IF EXISTS model_sources");
    console.log("模型来源表已删除");

    // 重新创建表并初始化数据
    console.log("正在重新创建模型来源表...");
    const result = await modelSourceModel.initTable();

    if (result) {
      console.log("模型来源表重置成功！");
    } else {
      console.error("模型来源表重置失败！");
    }

    process.exit(0);
  } catch (error) {
    console.error("重置模型来源表时出错:", error);
    process.exit(1);
  }
}

// 连接数据库并执行重置
const { testConnection } = require("../models/db");

async function run() {
  try {
    const connected = await testConnection();
    if (!connected) {
      console.error("无法连接到数据库");
      process.exit(1);
    }

    await resetModelSourcesTable();
  } catch (error) {
    console.error("执行脚本时出错:", error);
    process.exit(1);
  }
}

run();
