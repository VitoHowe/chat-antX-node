/**
 * 管理员控制器
 * ⚠️ 安全警告：此控制器包含明文密码操作，仅供管理员使用
 */

const UserModel = require("../models/user");

// 获取所有用户（管理员专用，包含明文密码）
async function getAllUsersForAdmin(ctx) {
  try {
    console.log("🔍 管理员查询所有用户信息");
    const users = await UserModel.getAllUsersForAdmin();

    ctx.body = {
      success: true,
      message: "获取用户列表成功",
      data: users,
      warning: "⚠️ 包含明文密码信息，请谨慎处理",
    };

    console.log(`✅ 返回 ${users.length} 个用户的详细信息`);
  } catch (error) {
    console.error("❌ 获取用户列表失败:", error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "获取用户列表失败",
      error: error.message,
    };
  }
}

// 获取单个用户详情（管理员专用，包含明文密码）
async function getUserByIdForAdmin(ctx) {
  try {
    const userId = ctx.params.id;
    console.log("🔍 管理员查询用户详情, ID:", userId);

    const user = await UserModel.getUserByIdForAdmin(userId);

    if (!user) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: `找不到ID为${userId}的用户`,
      };
      return;
    }

    ctx.body = {
      success: true,
      message: "获取用户详情成功",
      data: user,
      warning: "⚠️ 包含明文密码信息，请谨慎处理",
    };

    console.log(`✅ 返回用户 ${user.username} 的详细信息`);
  } catch (error) {
    console.error("❌ 获取用户详情失败:", error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "获取用户详情失败",
      error: error.message,
    };
  }
}

// 禁用用户
async function deactivateUser(ctx) {
  try {
    const userId = ctx.params.id;
    console.log("🚫 管理员禁用用户, ID:", userId);

    const success = await UserModel.deactivateUser(userId);

    if (!success) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: `禁用失败，找不到ID为${userId}的用户`,
      };
      return;
    }

    ctx.body = {
      success: true,
      message: "用户已被禁用",
    };

    console.log(`✅ 用户 ID:${userId} 已被禁用`);
  } catch (error) {
    console.error("❌ 禁用用户失败:", error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "禁用用户失败",
      error: error.message,
    };
  }
}

// 激活用户
async function activateUser(ctx) {
  try {
    const userId = ctx.params.id;
    console.log("✅ 管理员激活用户, ID:", userId);

    const success = await UserModel.activateUser(userId);

    if (!success) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: `激活失败，找不到ID为${userId}的用户`,
      };
      return;
    }

    ctx.body = {
      success: true,
      message: "用户已被激活",
    };

    console.log(`✅ 用户 ID:${userId} 已被激活`);
  } catch (error) {
    console.error("❌ 激活用户失败:", error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "激活用户失败",
      error: error.message,
    };
  }
}

module.exports = {
  getAllUsersForAdmin,
  getUserByIdForAdmin,
  deactivateUser,
  activateUser,
};
