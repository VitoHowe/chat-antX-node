/**
 * 认证控制器
 * 处理用户登录、注册等认证相关的HTTP请求
 */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/user");

// JWT密钥（生产环境应该放在环境变量中）
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-2025";
const JWT_EXPIRES_IN = "24h"; // Token过期时间：24小时

/**
 * 用户登录接口
 * 接收账户（用户名）和密码，验证后返回JWT token
 */
async function login(ctx) {
  try {
    const { username, password } = ctx.request.body;

    // 输入验证
    if (!username || !password) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "请提供用户名和密码",
      };
      return;
    }

    // 查找用户
    const user = await UserModel.getUserByUsername(username);
    if (!user) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        message: "用户名或密码错误",
      };
      return;
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        message: "用户名或密码错误",
      };
      return;
    }

    // 生成JWT token
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // 返回成功响应（不返回密码）
    ctx.body = {
      success: true,
      message: "登录成功",
      data: {
        token: token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.created_at,
        },
        expiresIn: JWT_EXPIRES_IN,
      },
    };

    console.log(`用户 ${username} 登录成功`);
  } catch (error) {
    console.error("登录失败:", error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "服务器内部错误",
      error: error.message,
    };
  }
}

/**
 * 用户注册接口（使用加密密码）
 * 创建新用户时自动加密密码
 */
async function register(ctx) {
  // 添加请求日志
  console.log("=== 注册请求开始 ===");
  console.log("请求方法:", ctx.method);
  console.log("请求路径:", ctx.path);
  console.log("请求URL:", ctx.url);
  console.log("请求体:", JSON.stringify(ctx.request.body, null, 2));
  console.log("请求头:", JSON.stringify(ctx.headers, null, 2));

  try {
    const { username, email, password } = ctx.request.body;

    console.log("解析后的参数:");
    console.log("- username:", username);
    console.log("- email:", email);
    console.log("- password:", password ? "已提供" : "未提供");

    // 输入验证 - 用户名、邮箱和密码都是必填项
    if (!username || !password || !email) {
      console.log("❌ 输入验证失败 - 缺少必填项");
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "用户名、邮箱和密码为必填项",
      };
      return;
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("❌ 邮箱格式验证失败:", email);
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "邮箱格式不正确",
      };
      return;
    }

    console.log("✅ 输入验证通过");

    // 检查用户名是否已存在
    console.log("🔍 检查用户名是否已存在:", username);
    const existingUser = await UserModel.getUserByUsername(username);
    if (existingUser) {
      console.log("❌ 用户名已存在:", username);
      ctx.status = 409;
      ctx.body = {
        success: false,
        message: "用户名已存在",
      };
      return;
    }

    console.log("✅ 用户名可用");

    // 加密密码
    console.log("🔐 开始加密密码...");
    const saltRounds = 12; // 加密强度（推荐值：12）
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log("✅ 密码加密完成");

    // 创建用户
    console.log("👤 开始创建用户...");
    const userId = await UserModel.createUser({
      username,
      email,
      password: hashedPassword,
    });
    console.log("✅ 用户创建成功，ID:", userId);

    // 生成JWT token（注册成功后自动登录）
    console.log("🎫 生成JWT token...");
    const tokenPayload = {
      userId: userId,
      username: username,
      email: email,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    console.log("✅ JWT token 生成成功");

    ctx.status = 201;
    ctx.body = {
      success: true,
      message: "注册成功",
      data: {
        token: token,
        user: {
          id: userId,
          username: username,
          email: email,
        },
        expiresIn: JWT_EXPIRES_IN,
      },
    };

    console.log(`✅ 新用户 ${username} 注册成功，返回状态码: 201`);
    console.log("=== 注册请求结束 ===");
  } catch (error) {
    console.error("❌ 注册失败:", error);
    console.error("错误堆栈:", error.stack);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "注册失败",
      error: error.message,
    };
    console.log("=== 注册请求结束（错误） ===");
  }
}

/**
 * 验证Token中间件
 * 用于保护需要登录的接口
 */
async function verifyToken(ctx, next) {
  try {
    const authHeader = ctx.headers.authorization;
    if (!authHeader) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        message: "未提供认证token",
      };
      return;
    }

    const token = authHeader.split(" ")[1]; // 格式：Bearer <token>
    if (!token) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        message: "Token格式错误",
      };
      return;
    }

    // 验证token
    const decoded = jwt.verify(token, JWT_SECRET);
    ctx.user = decoded; // 将用户信息添加到上下文

    await next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      ctx.status = 401;
      ctx.body = {
        success: false,
        message: "Token已过期",
      };
    } else if (error.name === "JsonWebTokenError") {
      ctx.status = 401;
      ctx.body = {
        success: false,
        message: "无效的Token",
      };
    } else {
      console.error("Token验证失败:", error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: "Token验证失败",
      };
    }
  }
}

module.exports = {
  login,
  register,
  verifyToken,
};
