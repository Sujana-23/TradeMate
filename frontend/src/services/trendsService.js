
import api from './api';

export const getHistoricalRates = async (params) => {
  const response = await api.get('/trends/historical', {
    params
  });

  return response.data;
};
