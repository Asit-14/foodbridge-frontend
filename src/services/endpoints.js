import api from './api';

export const authService = {
  register:        (data) => api.post('/auth/register', data),
  login:           (data) => api.post('/auth/login', data),
  logout:          ()     => api.post('/auth/logout'),
  getMe:           ()     => api.get('/auth/me'),
  updateProfile:   (data) => api.put('/auth/profile', data),
  forgotPassword:  (data) => api.post('/auth/forgot-password', data),
  resetPassword:   (token, data) => api.post(`/auth/reset-password/${token}`, data),
};

export const donationService = {
  create:        (data) => api.post('/donations', data),
  getAll:        (params) => api.get('/donations', { params }),
  getById:       (id) => api.get(`/donations/${id}`),
  getMyDonations:() => api.get('/donations/my-donations'),
  getNearby:     (params) => api.get('/donations/nearby', { params }),
  accept:        (id) => api.put(`/donations/${id}/accept`),
  pickup:        (id, data) => api.put(`/donations/${id}/pickup`, data),
  deliver:       (id, data) => api.put(`/donations/${id}/deliver`, data),
  getMatches:    (id) => api.get(`/donations/${id}/match`),
  getRisk:       (id, params) => api.get(`/donations/${id}/risk`, { params }),
  cancel:        (id) => api.put(`/donations/${id}/cancel`),
  edit:          (id, data) => api.put(`/donations/${id}`, data),
};

export const adminService = {
  getAnalytics:    () => api.get('/admin/analytics'),
  getUsers:        (params) => api.get('/admin/users', { params }),
  updateUserStatus:(id, data) => api.put(`/admin/users/${id}/status`, data),
};

export const analyticsService = {
  getDemandPrediction: (params) => api.get('/analytics/demand-prediction', { params }),
  getHeatmap:          (params) => api.get('/analytics/heatmap', { params }),
  getWastageTrend:     (params) => api.get('/analytics/wastage-trend', { params }),
  getImpact:           () => api.get('/analytics/impact'),
};

export const notificationService = {
  getAll:       (params) => api.get('/notifications', { params }),
  markRead:     (id) => api.put(`/notifications/${id}/read`),
  markAllRead:  () => api.put('/notifications/read-all'),
  getUnreadCount:() => api.get('/notifications/unread-count'),
};
