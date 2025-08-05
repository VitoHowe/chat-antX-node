/*
 * @Description:
 * @Version: 2.0
 * @Autor: MyStery
 * @Date: 2025-07-08 23:59:22
 * @LastEditors: MyStery
 * @LastEditTime: 2025-07-14 20:15:43
 */
/**
 * Koa服务器主文件
 * 服务器入口，配置和启动服务器
 */

const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const cors = require("@koa/cors");
const router = require("./routes");
const { testConnection } = require("./models/db");
const userModel = require("./models/user");
const modelSourceModel = require("./models/modelSource");
const userDataModel = require("./models/userData");

// 创建Koa应用实例
const app = new Koa();
const PORT = process.env.PORT || 3000;

// 错误处理中间件
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error("服务器错误:", err);
    ctx.status = err.status || 500;
    ctx.body = {
      success: false,
      message: err.message || "服务器内部错误",
    };
    ctx.app.emit("error", err, ctx);
  }
});

// 请求日志中间件
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// 注册中间件
app.use(
  cors({
    origin: "*", // 允许所有来源访问
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // 允许的HTTP方法
    allowHeaders: ["Content-Type", "Authorization", "Accept"], // 允许的HTTP头
    exposeHeaders: ["WWW-Authenticate", "Server-Authorization"], // 暴露的HTTP头
  })
);
app.use(bodyParser());

// 注册路由
app.use(router.routes());
app.use(router.allowedMethods());

// 应用启动函数
async function startServer() {
  try {
    // 测试数据库连接
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error("无法连接到数据库，服务器启动失败");
      process.exit(1);
    }

    // 初始化数据库表
    // await userModel.initTable();
    // await modelSourceModel.initTable();
    // await userDataModel.initTable();

    // 启动HTTP服务
    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("服务器启动失败:", error);
    process.exit(1);
  }
}

// 启动服务器
startServer();