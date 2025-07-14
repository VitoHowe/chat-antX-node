/*
 * @Description:
 * @Version: 2.0
 * @Autor: MyStery
 * @Date: 2025-07-14 20:16:18
 * @LastEditors: MyStery
 * @LastEditTime: 2025-07-14 21:14:42
 */
/**
 * 认证相关路由
 * 定义用户登录、注册等认证API的路由
 */

const Router = require("koa-router");
const authController = require("../controllers/authController");

const router = new Router();

// 用户登录接口
router.post("/login", authController.login);

// 用户注册接口
router.post("/register", authController.register);

module.exports = router;
