/**
 * 路由索引文件
 * 集中管理所有API路由
 */

const Router = require("koa-router");
const userRoutes = require("./userRoutes");

const router = new Router();

// 首页路由
router.get("/", async (ctx) => {
  ctx.body = {
    status: "success",
    message: "Koa API服务器运行正常",
    version: "1.0.0",
    apiRoot: "/api",
  };
});

// 组合所有路由
router.use(userRoutes.routes());
router.use(userRoutes.allowedMethods());

module.exports = router;
