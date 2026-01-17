import api from './api';

export const analyticsService = {
  async getUserStats(userId) {
    const response = await api.get(`/analytics/user-stats/${userId}`);
    return response.data;
  },

  async getProductivity(userId, startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('start', startDate);
    if (endDate) params.append('end', endDate);

    const response = await api.get(`/analytics/productivity/${userId}?${params.toString()}`);
    return response.data;
  },
};
