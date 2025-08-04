/**
 * 管理员路由
 * ⚠️ 安全警告：这些接口包含敏感信息，应该有严格的权限控制
 */

const Router = require("koa-router");
const adminController = require("../controllers/adminController");

const router = new Router();

// 获取所有用户详情（包含明文密码）
router.get("/admin/users", adminController.getAllUsersForAdmin);

// 获取单个用户详情（包含明文密码）
router.get("/admin/users/:id", adminController.getUserByIdForAdmin);

// 禁用用户
router.post("/admin/users/:id/deactivate", adminController.deactivateUser);

// 激活用户
router.post("/admin/users/:id/activate", adminController.activateUser);

module.exports = router;
