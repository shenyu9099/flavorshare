import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { trackEvent, trackException } from '../config/appInsights';

// 创建 axios 实例
const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 默认60秒
});

// 创建用于上传的 axios 实例（更长超时）
const uploadClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 300000, // 上传操作5分钟超时
});

// 请求拦截器 - 记录 API 调用
const addRequestInterceptor = (client) => {
  client.interceptors.request.use(
    (config) => {
      config.metadata = { startTime: new Date() };
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  client.interceptors.response.use(
    (response) => {
      const duration = new Date() - response.config.metadata.startTime;
      trackEvent('APICallSuccess', {
        url: response.config.url,
        method: response.config.method,
        status: response.status,
        duration: duration,
      });
      return response;
    },
    (error) => {
      const duration = error.config?.metadata ? new Date() - error.config.metadata.startTime : 0;
      trackException(error, {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        duration: duration,
        message: error.message,
      });
      trackEvent('APICallFailed', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        duration: duration,
        error: error.message,
      });
      return Promise.reject(error);
    }
  );
};

// 应用拦截器
addRequestInterceptor(apiClient);
addRequestInterceptor(uploadClient);

// ============================================
// User API Service
// ============================================
export const userService = {
  // 用户注册
  register: async (name, email, password) => {
    const response = await apiClient.post(API_ENDPOINTS.USERS.REGISTER, {
      name,
      email,
      password,
    });
    return response.data;
  },

  // 用户登录
  login: async (email, password) => {
    const response = await apiClient.post(API_ENDPOINTS.USERS.LOGIN, {
      email,
      password,
    });
    return response.data;
  },
};

// ============================================
// Journals API Service
// ============================================
export const journalService = {
  // 创建日记（使用uploadClient因为可能包含媒体文件）
  create: async (journalData) => {
    const response = await uploadClient.post(API_ENDPOINTS.JOURNALS.CREATE, journalData);
    return response.data;
  },

  // 获取所有日记
  getAll: async (userId = null) => {
    const url = userId 
      ? `${API_ENDPOINTS.JOURNALS.GET_ALL}&userId=${userId}`
      : API_ENDPOINTS.JOURNALS.GET_ALL;
    const response = await apiClient.get(url);
    return response.data;
  },

  // 获取单个日记
  getById: async (id, userId) => {
    const url = `${API_ENDPOINTS.JOURNALS.GET_BY_ID}&id=${id}&userId=${userId}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  // 更新日记（使用uploadClient因为可能包含媒体文件）
  update: async (journalData) => {
    const response = await uploadClient.put(API_ENDPOINTS.JOURNALS.UPDATE, journalData);
    return response.data;
  },

  // 删除日记
  delete: async (id, userId) => {
    const url = `${API_ENDPOINTS.JOURNALS.DELETE}&id=${id}&userId=${userId}`;
    const response = await apiClient.delete(url);
    return response.data;
  },
};

// ============================================
// Media API Service
// ============================================
export const mediaService = {
  // 上传媒体文件
  upload: async (file, journalId, userId, mediaType) => {
    // 将文件转换为 Base64
    const fileContent = await fileToBase64(file);
    
    const response = await uploadClient.post(API_ENDPOINTS.MEDIA.UPLOAD, {
      journalId,
      userId,
      fileName: file.name,
      fileContent,
      mediaType, // 'photos', 'videos', 'audio'
      contentType: file.type,
    });
    return response.data;
  },

  // 上传封面图（不关联日记，只返回 URL）
  uploadCoverImage: async (file) => {
    const fileContent = await fileToBase64(file);
    
    const response = await uploadClient.post(API_ENDPOINTS.MEDIA.UPLOAD, {
      journalId: 'cover-temp', // 临时ID
      userId: 'guest-user-001',
      fileName: `cover-${Date.now()}-${file.name}`,
      fileContent,
      mediaType: 'photos',
      contentType: file.type,
      isCoverImage: true, // 标记为封面图
    });
    return response.data;
  },
};

// 辅助函数：将文件转换为 Base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // 移除 data:xxx;base64, 前缀
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};
