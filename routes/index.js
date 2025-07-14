/*
 * @Description:
 * @Version: 2.0
 * @Autor: MyStery
 * @Date: 2025-07-08 23:58:56
 * @LastEditors: MyStery
 * @LastEditTime: 2025-07-14 21:47:12
 */
/**
 * 路由索引文件
 * 集中管理所有API路由
 */

const Router = require("koa-router");
const userRoutes = require("./userRoutes");
const proxyRoutes = require("./proxyRoutes");
const authRoutes = require("./authRoutes");

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

// 注册认证路由（使用 /api/auth 前缀）
router.use(authRoutes.routes());
router.use(authRoutes.allowedMethods());

// 组合所有路由
router.use(userRoutes.routes());
router.use(userRoutes.allowedMethods());

// 注册代理路由
router.use(proxyRoutes.routes());
router.use(proxyRoutes.allowedMethods());

module.exports = router;
