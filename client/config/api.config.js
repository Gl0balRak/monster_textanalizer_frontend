// client/config/api.config.js

// Используем import.meta.env для Vite вместо process.env
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://127.0.0.1:1001';
const ANALYZER_API_URL = import.meta.env.VITE_ANALYZER_API_URL || 'http://127.0.0.1:1002';

export const API_ENDPOINTS = {
  // Auth endpoints (порт 1001)
  auth: {
    register: `${AUTH_API_URL}/auth/register`,
    login: `${AUTH_API_URL}/auth/login`,
    refresh: `${AUTH_API_URL}/auth/refresh`,
    logout: `${AUTH_API_URL}/auth/logout`,
    me: `${AUTH_API_URL}/auth/me`,
    changePassword: `${AUTH_API_URL}/auth/change-password`,
  },
  // Analyzer endpoints (порт 1002)
  analyzer: {
    base: `${ANALYZER_API_URL}/analyzer`,
    // Основной endpoint для запуска анализа
    start: `${ANALYZER_API_URL}/analyzer/start`,
    // Текстовый анализ
    analyzeATags: `${ANALYZER_API_URL}/analyzer/analyze-a-tags`,
    analyzeATagsProgress: `${ANALYZER_API_URL}/analyzer/analyze-a-tags-progress`,
    analyzeSinglePage: `${ANALYZER_API_URL}/analyzer/analyze-single-page`,
    // LSI анализ
    compareNgrams: `${ANALYZER_API_URL}/analyzer/ngrams/compare`,
    compareNgramsTable: `${ANALYZER_API_URL}/analyzer/ngrams/compare-table`,
    compareNgramsFiltered: `${ANALYZER_API_URL}/analyzer/ngrams/compare-table-filtered`,
    // Анализ ключевых слов
    keywordsAnalyzeFull: `${ANALYZER_API_URL}/analyzer/keywords/analyze-full`,
    countWordsAverage: `${ANALYZER_API_URL}/analyzer/keywords/count-words-average`,
  }
};

export { AUTH_API_URL, ANALYZER_API_URL };
