import { apiClient } from './client';

export const weatherApi = {
  // 1. Root and health
  getRootStatus: async () => {
    const res = await apiClient.get('/');
    return res.data;
  },

  getHealth: async () => {
    const res = await apiClient.get('/health');
    return res.data;
  },

  // 2. City and dataset metadata
  getCities: async () => {
    const res = await apiClient.get('/cities');
    return res.data;
  },

  getDatasetInfo: async () => {
    const res = await apiClient.get('/dataset-info');
    return res.data;
  },

  getCitiesOverview: async () => {
    const res = await apiClient.get('/cities-overview');
    return res.data;
  },

  // 3. Rainfall prediction
  predictRainfall: async (city, date) => {
    const res = await apiClient.post('/predict', { city, date });
    return res.data;
  },

  // 4. Custom scenario prediction
  predictCustom: async (payload) => {
    const res = await apiClient.post('/predict-custom', payload);
    return res.data;
  },

  // 5. Batch prediction
  predictBatch: async (cities, date) => {
    const res = await apiClient.post('/predict-batch', { cities, date });
    return res.data;
  },

  // 6. City historical weather records
  getCityHistory: async (city, date = null, days = 14) => {
    const params = { city, days };
    if (date) params.date = date;
    const res = await apiClient.get('/city-history', { params });
    return res.data;
  },

  // 7. ML Model metrics
  getModelMetrics: async () => {
    const res = await apiClient.get('/model-metrics');
    return res.data;
  }
};
