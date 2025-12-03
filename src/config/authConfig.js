// ============================================
// Azure Entra ID (Azure AD) Configuration
// ============================================
// TODO: 在 Azure Portal 中创建 App Registration 后，填入以下信息
// 步骤：Azure Portal → Entra ID → App registrations → New registration

export const msalConfig = {
  auth: {
    // TODO: 替换为你的 Application (client) ID
    clientId: "YOUR_CLIENT_ID_HERE",
    
    // TODO: 替换为你的 Directory (tenant) ID，或使用 "common" 支持多租户
    authority: "https://login.microsoftonline.com/YOUR_TENANT_ID_HERE",
    
    // 登录后重定向地址（需要在 Azure 中配置）
    redirectUri: "http://localhost:3000",
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

// 请求的权限范围
export const loginRequest = {
  scopes: ["User.Read", "openid", "profile", "email"],
};

// API 权限（如果后端 Functions 需要验证 Token）
export const apiRequest = {
  // TODO: 替换为你的 API scope
  scopes: ["api://YOUR_CLIENT_ID_HERE/access_as_user"],
};

