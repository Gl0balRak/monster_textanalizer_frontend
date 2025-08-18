// client/services/analyzer.service.js

import { API_ENDPOINTS } from '../config/api.config';
import authService from './auth.service';

class AnalyzerService {
  constructor() {
    this.abortController = null;
  }

  // Получить заголовки с авторизацией
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    const token = authService.token;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Анализ страницы с прогрессом через SSE
  async analyzePageWithProgress(data, onProgress) {
    try {
      // Сначала запускаем анализ
      const response = await fetch(API_ENDPOINTS.analyzer.analyzeATags, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const result = await response.json();
      const taskId = result.task_id;

      // Подключаемся к SSE для получения прогресса
      if (taskId && onProgress) {
        const eventSource = new EventSource(
          `${API_ENDPOINTS.analyzer.analyzeATagsProgress}?task_id=${taskId}`
        );

        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          onProgress(data);

          if (data.type === 'complete') {
            eventSource.close();
          }
        };

        eventSource.onerror = (error) => {
          console.error('SSE error:', error);
          eventSource.close();
        };
      }

      return result;
    } catch (error) {
      console.error('Analysis error:', error);
      throw error;
    }
  }

  // Простой запуск анализа (без прогресса)
  async startAnalysis(data) {
    try {
      const response = await fetch(API_ENDPOINTS.analyzer.start, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Start analysis failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Start analysis error:', error);
      throw error;
    }
  }

  // LSI анализ n-грамм
  async compareNgrams(data) {
    try {
      const response = await fetch(API_ENDPOINTS.analyzer.compareNgrams, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Compare ngrams failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Compare ngrams error:', error);
      throw error;
    }
  }

  // Анализ ключевых слов
  async analyzeKeywords(data) {
    try {
      const response = await fetch(API_ENDPOINTS.analyzer.keywordsAnalyzeFull, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Keywords analysis failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Keywords analysis error:', error);
      throw error;
    }
  }

  // Подсчет среднего количества слов
  async countWordsAverage(competitorUrls) {
    try {
      const response = await fetch(API_ENDPOINTS.analyzer.countWordsAverage, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          competitor_urls: competitorUrls,
        }),
      });

      if (!response.ok) {
        throw new Error(`Count words failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Count words error:', error);
      throw error;
    }
  }

  // Анализ одной страницы
  async analyzeSinglePage(url) {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.analyzer.analyzeSinglePage}?url=${encodeURIComponent(url)}`,
        {
          method: 'POST',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Single page analysis failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Single page analysis error:', error);
      throw error;
    }
  }

  // Отмена текущего запроса
  cancelRequest() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}

// Создаем единственный экземпляр
const analyzerService = new AnalyzerService();

export default analyzerService;