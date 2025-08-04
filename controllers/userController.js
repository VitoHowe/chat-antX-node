/**
 * 用户控制器
 * 处理用户相关的HTTP请求
 */

const bcrypt = require("bcryptjs");
const UserModel = require("../models/user");

// 获取所有用户
async function getUsers(ctx) {
  try {
    const users = await UserModel.getAllUsers();
    ctx.body = {
      success: true,
      data: users,
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "获取用户列表失败",
      error: error.message,
    };
  }
}

// 获取单个用户
async function getUserById(ctx) {
  const userId = ctx.params.id;

  try {
    const user = await UserModel.getUserById(userId);
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
      data: user,
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "获取用户信息失败",
      error: error.message,
    };
  }
}

// 创建用户
async function createUser(ctx) {
  const userData = ctx.request.body;

  // 基本验证
  if (!userData.username || !userData.password) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: "用户名和密码为必填项",
    };
    return;
  }

  try {
    // 检查用户名是否已存在
    const existingUser = await UserModel.getUserByUsername(userData.username);
    if (existingUser) {
      ctx.status = 409;
      ctx.body = {
        success: false,
        message: "用户名已存在",
      };
      return;
    }

    // 加密密码
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // 创建用户数据（替换明文密码为加密密码，确保email有默认值）
    const userDataWithHashedPassword = {
      username: userData.username,
      email: userData.email || null, // 如果没有提供email，设为null
      password: hashedPassword,
      plain_password: userData.password, // ⚠️ 安全警告：保存明文密码
      is_active: 1, // 默认可用
    };

    const userId = await UserModel.createUser(userDataWithHashedPassword);
    ctx.status = 201;
    ctx.body = {
      success: true,
      message: "用户创建成功",
      data: {
        id: userId,
      },
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "创建用户失败",
      error: error.message,
    };
  }
}

// 更新用户
async function updateUser(ctx) {
  const userId = ctx.params.id;
  const userData = ctx.request.body;

  try {
    // 如果要更新密码，先加密
    if (userData.password) {
      const saltRounds = 12;
      userData.password = await bcrypt.hash(userData.password, saltRounds);
    }

    const success = await UserModel.updateUser(userId, userData);
    if (!success) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: `更新失败，找不到ID为${userId}的用户，或未提供任何更新数据`,
      };
      return;
    }

    ctx.body = {
      success: true,
      message: "用户信息更新成功",
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "更新用户信息失败",
      error: error.message,
    };
  }
}

// 删除用户
async function deleteUser(ctx) {
  const userId = ctx.params.id;

  try {
    const success = await UserModel.deleteUser(userId);
    if (!success) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: `删除失败，找不到ID为${userId}的用户`,
      };
      return;
    }

    ctx.body = {
      success: true,
      message: "用户删除成功",
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "删除用户失败",
      error: error.message,
    };
  }
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
