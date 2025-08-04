/**
 * 用户数据控制器
 * 处理用户自定义数据相关的HTTP请求
 * 所有操作都基于当前登录用户的权限进行数据隔离
 */

const UserDataModel = require("../models/userData");

// 获取当前用户的所有数据
async function getUserData(ctx) {
  try {
    const userId = ctx.user.userId;
    const userData = await UserDataModel.getUserDataByUserId(userId);
    
    ctx.body = {
      success: true,
      data: userData,
      total: userData.length,
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "获取用户数据失败",
      error: error.message,
    };
  }
}

// 根据记录ID获取当前用户的特定数据
async function getUserDataById(ctx) {
  try {
    const userId = ctx.user.userId;
    const dataId = ctx.params.id;

    // 参数验证
    if (!dataId || dataId.trim().length === 0) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "无效的数据记录ID",
      };
      return;
    }

    const userData = await UserDataModel.getUserDataByUserIdAndId(userId, dataId.trim());
    
    if (!userData) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: `找不到ID为${dataId}的数据记录`,
      };
      return;
    }

    ctx.body = {
      success: true,
      data: userData,
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "获取数据记录失败",
      error: error.message,
    };
  }
}

// 创建新的用户数据记录
async function createUserData(ctx) {
  try {
    const userId = ctx.user.userId;
    const { key, field_name, data } = ctx.request.body;

    // 基本验证
    if (!key || !field_name || data === undefined) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "key、字段名称和数据内容为必填项",
      };
      return;
    }

    // 验证key格式（可以是字符串，但不能为空或只包含空白字符）
    if (typeof key !== 'string' || key.trim().length === 0) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "key必须是非空字符串",
      };
      return;
    }

    // 验证key长度
    if (key.length > 255) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "key长度不能超过255个字符",
      };
      return;
    }

    // 验证key格式：只允许字母、数字、下划线、连字符和点号
    const safeKeyPattern = /^[a-zA-Z0-9_\-\.]+$/;
    if (!safeKeyPattern.test(key)) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "key只能包含字母、数字、下划线、连字符和点号",
      };
      return;
    }

    // 验证字段名称长度
    if (field_name.length > 100) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "字段名称长度不能超过100个字符",
      };
      return;
    }

    // 验证数据是否为有效的JSON结构（允许空对象）
    let jsonData;
    try {
      // 如果data是字符串，尝试解析；如果已经是对象，直接使用
      jsonData = typeof data === 'string' ? JSON.parse(data) : data;
      // 允许空对象、空数组等有效JSON值
    } catch (e) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "数据内容必须是有效的JSON格式",
      };
      return;
    }

    const userDataRecord = {
      id: key.trim(),
      user_id: userId,
      field_name: field_name.trim(),
      data: jsonData,
    };

    const dataId = await UserDataModel.createUserData(userDataRecord);
    
    ctx.status = 201;
    ctx.body = {
      success: true,
      message: "数据记录创建成功",
      data: {
        id: dataId,
        field_name: userDataRecord.field_name,
      },
    };
  } catch (error) {
    if (error.message.includes("已存在")) {
      ctx.status = 409;
      ctx.body = {
        success: false,
        message: error.message,
      };
    } else {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: "创建数据记录失败",
        error: error.message,
      };
    }
  }
}

// 更新用户数据记录
async function updateUserData(ctx) {
  try {
    const userId = ctx.user.userId;
    const dataId = ctx.params.id;
    const { field_name, data } = ctx.request.body;

    // 参数验证
    if (!dataId || dataId.trim().length === 0) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "无效的数据记录ID",
      };
      return;
    }

    if (!field_name && data === undefined) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "至少需要提供字段名称或数据内容中的一项进行更新",
      };
      return;
    }

    // 验证记录是否存在且属于当前用户
    const existingData = await UserDataModel.getUserDataByUserIdAndId(userId, dataId.trim());
    if (!existingData) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: `找不到ID为${dataId}的数据记录`,
      };
      return;
    }

    const updateData = {};
    
    if (field_name) {
      if (field_name.length > 100) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: "字段名称长度不能超过100个字符",
        };
        return;
      }
      updateData.field_name = field_name.trim();
    }

    if (data !== undefined) {
      // 验证数据是否为有效的JSON结构
      try {
        updateData.data = typeof data === 'string' ? JSON.parse(data) : data;
      } catch (e) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: "数据内容必须是有效的JSON格式",
        };
        return;
      }
    }

    const success = await UserDataModel.updateUserDataByUserIdAndId(userId, dataId.trim(), updateData);
    
    if (!success) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: "更新数据记录失败",
      };
      return;
    }

    ctx.body = {
      success: true,
      message: "数据记录更新成功",
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "更新数据记录失败",
      error: error.message,
    };
  }
}

// 删除特定的用户数据记录
async function deleteUserData(ctx) {
  try {
    const userId = ctx.user.userId;
    const dataId = ctx.params.id;

    // 参数验证
    if (!dataId || dataId.trim().length === 0) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "无效的数据记录ID",
      };
      return;
    }

    // 验证记录是否存在且属于当前用户
    const existingData = await UserDataModel.getUserDataByUserIdAndId(userId, dataId.trim());
    if (!existingData) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: `找不到ID为${dataId}的数据记录`,
      };
      return;
    }

    const success = await UserDataModel.deleteUserDataByUserIdAndId(userId, dataId.trim());
    
    if (!success) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: "删除数据记录失败",
      };
      return;
    }

    ctx.body = {
      success: true,
      message: "数据记录删除成功",
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "删除数据记录失败",
      error: error.message,
    };
  }
}

// 删除当前用户的所有数据记录
async function deleteAllUserData(ctx) {
  try {
    const userId = ctx.user.userId;
    const deletedCount = await UserDataModel.deleteAllUserData(userId);
    
    ctx.body = {
      success: true,
      message: `成功删除${deletedCount}条数据记录`,
      data: {
        deletedCount: deletedCount,
      },
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "删除用户数据失败",
      error: error.message,
    };
  }
}

// 获取当前用户的数据统计信息
async function getUserDataStats(ctx) {
  try {
    const userId = ctx.user.userId;
    const stats = await UserDataModel.getUserDataStats(userId);
    
    ctx.body = {
      success: true,
      data: {
        totalRecords: stats.total_records,
        uniqueFields: stats.unique_fields,
        userId: userId,
      },
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "获取数据统计失败",
      error: error.message,
    };
  }
}

module.exports = {
  getUserData,
  getUserDataById,
  createUserData,
  updateUserData,
  deleteUserData,
  deleteAllUserData,
  getUserDataStats,
}; 