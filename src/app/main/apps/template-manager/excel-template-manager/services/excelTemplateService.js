// src/services/excelTemplateService.js
import axios from 'axios';

const API_URL = 'https://back.agfo.ir/api/excel-templates';

export const uploadTemplate = async (file, data) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));

  const response = await axios.post(API_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getAllTemplates = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getTemplateById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const updateTemplate = async (id, data) => {
  const response = await axios.put(`${API_URL}/${id}`, data);
  return response.data;
};

export const deleteTemplate = async (id) => {
  await axios.delete(`${API_URL}/${id}`);
};

export const downloadTemplate = async (id) => {
  const response = await axios.get(`${API_URL}/${id}/download`, {
    responseType: 'blob',
  });
  return response.data;
};

export const generateExcel = async (templateId, data) => {
  const response = await axios.post(`${API_URL}/generate`, { templateId, data }, {
    responseType: 'blob',
  });
  return response.data;
};