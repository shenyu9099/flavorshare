// ============================================
// Azure Logic Apps API Configuration
// ============================================

export const API_ENDPOINTS = {
  // 用户接口
  USERS: {
    REGISTER: 'https://prod-11.uksouth.logic.azure.com:443/workflows/e4c12810b575419ebde59a8867067d26/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=BOxkagVSRDOd3_sloDqiJBrrI4yTbi9gBIo95I3-X4E',
    LOGIN: 'https://prod-33.uksouth.logic.azure.com:443/workflows/28ffb4958ee540679dfdee184f39364d/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=1bfbPgTZcobUOlqCyXoI5GsFJlcSnDBKerTymXZuDG4',
  },

  // 日记接口
  JOURNALS: {
    CREATE: 'https://prod-60.uksouth.logic.azure.com:443/workflows/76ee5c11badc4f7c98eb9a214318f97b/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=akvjgedkNvewcpQ01nhAG-yO7gqdqTYhF2mZjjld_q0',
    GET_ALL: 'https://prod-06.uksouth.logic.azure.com:443/workflows/7b792a2eca974a6fa99bab284798e664/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=a-mvPqbhhp_X1We-iaMcYS4YK-YSqqs0ka50_gqFbdk',
    GET_BY_ID: 'https://prod-35.uksouth.logic.azure.com:443/workflows/77a857a2eb384cc3afc31751e10eb217/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=8l5M5H4UwevL91PFqUE1_oq8_gcMwmgAvI7JEoGFA0I',
    UPDATE: 'https://prod-47.uksouth.logic.azure.com:443/workflows/da90db9da9264aa7a5685db708bff5b6/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=UnAV32iizTe_AK2AIgRvSFrAHkOUykX1UQ4zZdAzV6Y',
    DELETE: 'https://prod-17.uksouth.logic.azure.com:443/workflows/1489d2319323402fa336a3aadbf0162f/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=v8wPV4oKuo9tqGJQ4gBzUSu--Y2CXp-kY7tgtp3MsK0',
  },

  // 媒体接口
  MEDIA: {
    UPLOAD: 'https://prod-62.uksouth.logic.azure.com:443/workflows/2a318cd19dd7499a9af6d414b0763389/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=QUKoYxDuUeRspTUwn4nnhODm40avmJIcAx86v-1Y4Rc',
  },
};

export default API_ENDPOINTS;
