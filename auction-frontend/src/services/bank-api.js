import api from './api';
import API_CONFIG from './apiConfig';

export const getAllBanks = async () => {
    const res = await api.get(API_CONFIG.BANK_SERVICE);
    return res.data;
};
