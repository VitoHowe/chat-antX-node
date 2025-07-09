/**
 * 代理路由
 * 定义转发请求的路由
 */

const Router = require("koa-router");
const proxyController = require("../controllers/proxyController");

// 确保控制器方法存在
console.log("Available controller methods:", Object.keys(proxyController));

const router = new Router();

// 转发模型列表请求
router.get("/models", proxyController.forwardModelsRequest);

// 获取所有模型来源
router.get("/model-sources", proxyController.getModelSources);

// 获取单个模型来源
router.get("/model-sources/:type", proxyController.getModelSourceByType);

module.exports = router;
