/**
 * 用户数据相关路由
 * 定义用户数据API的路由，所有接口都需要登录权限校验
 */

const Router = require("koa-router");
const userDataController = require("../controllers/userDataController");
const { verifyToken } = require("../controllers/authController");

const router = new Router({
  prefix: "/api/user-data",
});

// 所有路由都需要登录权限校验
router.use(verifyToken);

// 获取用户数据统计信息（需要放在 /:id 路由之前，避免路由冲突）
router.get("/stats", userDataController.getUserDataStats);

// 获取当前用户的所有数据
router.get("/", userDataController.getUserData);

// 根据记录ID获取当前用户的特定数据
router.get("/:id", userDataController.getUserDataById);

// 创建新的数据记录
router.post("/", userDataController.createUserData);

// 更新特定的数据记录
router.put("/:id", userDataController.updateUserData);

// 删除特定的数据记录
router.delete("/:id", userDataController.deleteUserData);

// 删除当前用户的所有数据记录
router.delete("/", userDataController.deleteAllUserData);

module.exports = router; 