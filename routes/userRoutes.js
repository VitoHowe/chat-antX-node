/**
 * 用户相关路由
 * 定义用户API的路由
 */

const Router = require("koa-router");
const userController = require("../controllers/userController");

const router = new Router({
  prefix: "/api/users",
});

// 获取所有用户
router.get("/", userController.getUsers);

// 获取单个用户
router.get("/:id", userController.getUserById);

// 创建新用户
router.post("/", userController.createUser);

// 更新用户
router.put("/:id", userController.updateUser);

// 删除用户
router.delete("/:id", userController.deleteUser);

module.exports = router;
