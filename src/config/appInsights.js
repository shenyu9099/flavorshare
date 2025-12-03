import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';

// 创建 React 插件实例
const reactPlugin = new ReactPlugin();

// Application Insights 配置
const appInsights = new ApplicationInsights({
  config: {
    connectionString: 'InstrumentationKey=523127c0-0349-4df4-9fca-d4b7dbfb9875;IngestionEndpoint=https://uksouth-1.in.applicationinsights.azure.com/;LiveEndpoint=https://uksouth.livediagnostics.monitor.azure.com/;ApplicationId=b524a90d-59b5-4c3b-b09e-818de317562a',
    
    extensions: [reactPlugin],
    enableAutoRouteTracking: true, // 自动跟踪路由变化
    autoTrackPageVisitTime: true,  // 自动跟踪页面访问时间
    enableCorsCorrelation: true,   // 启用跨域关联
    enableRequestHeaderTracking: true,
    enableResponseHeaderTracking: true,
    
    // 采样率 (100 = 100%, 50 = 50%)
    samplingPercentage: 100,
  }
});

// 加载 Application Insights
appInsights.loadAppInsights();

// 设置用户上下文（可选）
// appInsights.setAuthenticatedUserContext('userId');

// 导出实例供其他组件使用
export { reactPlugin, appInsights };

// ============================================
// 日志记录辅助函数
// ============================================

/**
 * 记录自定义事件
 * @param {string} name - 事件名称
 * @param {object} properties - 自定义属性
 */
export const trackEvent = (name, properties = {}) => {
  appInsights.trackEvent({ name }, properties);
};

/**
 * 记录页面浏览
 * @param {string} name - 页面名称
 */
export const trackPageView = (name) => {
  appInsights.trackPageView({ name });
};

/**
 * 记录异常
 * @param {Error} error - 错误对象
 * @param {object} properties - 自定义属性
 */
export const trackException = (error, properties = {}) => {
  appInsights.trackException({ exception: error, properties });
};

/**
 * 记录自定义指标
 * @param {string} name - 指标名称
 * @param {number} value - 指标值
 */
export const trackMetric = (name, value) => {
  appInsights.trackMetric({ name, average: value });
};

/**
 * 记录用户操作追踪
 * @param {string} action - 操作类型
 * @param {string} target - 操作目标
 * @param {object} data - 附加数据
 */
export const trackUserAction = (action, target, data = {}) => {
  appInsights.trackEvent({
    name: 'UserAction'
  }, {
    action,
    target,
    timestamp: new Date().toISOString(),
    ...data
  });
};

/**
 * 设置当前用户
 * @param {string} userId - 用户ID
 * @param {string} accountId - 账户ID（可选）
 */
export const setUser = (userId, accountId = null) => {
  if (userId) {
    appInsights.setAuthenticatedUserContext(userId, accountId, true);
  } else {
    appInsights.clearAuthenticatedUserContext();
  }
};

