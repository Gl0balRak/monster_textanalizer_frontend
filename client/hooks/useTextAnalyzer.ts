// hooks/useTextAnalyzer.ts

import { useState, useCallback } from 'react';
import analyzerService from '@/services/analyzer.service';
// import { useToast } from '@/hooks/use-toast';

interface TextAnalyzerFormData {
  url: string;
  main_query: string;
  additional_queries: string[];
  excluded_words: string[];
  settings: {
    check_ai: boolean;
    check_spelling: boolean;
    check_uniqueness: boolean;
    search_engine: string;
    region: string;
    top_size: number;
    exclude_platforms: boolean;
    parse_archived: boolean;
    calculate_by_median: boolean;
  };
}

interface AnalysisResult {
  success: boolean;
  message: string;
  task_id: string;
  data: any;
}

export const useTextAnalyzer = () => {
  // const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Функция валидации данных
  const validateFormData = (pageUrl: string, mainQuery: string): boolean => {
    if (!pageUrl || !mainQuery) {
      const errorMessage = 'Заполните обязательные поля: адрес страницы и основной запрос';
      setError(errorMessage);

      // Если есть toast, используем его, иначе alert
      // toast?.({
      //   title: "Ошибка валидации",
      //   description: errorMessage,
      //   variant: "destructive",
      // });
      alert(errorMessage);
      return false;
    }
    return true;
  };

  // Подготовка данных для отправки
  const prepareRequestData = (
    pageUrl: string,
    mainQuery: string,
    additionalQueries: string[],
    excludedWords: string[],
    settings: {
      checkAI: boolean;
      checkSpelling: boolean;
      checkUniqueness: boolean;
      searchEngine: string;
      region: string;
      topSize: string;
      excludePlatforms: boolean;
      parseArchived: boolean;
      calculateByMedian: boolean;
    }
  ): TextAnalyzerFormData => {
    return {
      url: pageUrl,
      main_query: mainQuery,
      additional_queries: additionalQueries.filter(q => q && q.trim() !== ''),
      excluded_words: excludedWords.filter(w => w && w.trim() !== ''),
      settings: {
        check_ai: settings.checkAI,
        check_spelling: settings.checkSpelling,
        check_uniqueness: settings.checkUniqueness,
        search_engine: settings.searchEngine || 'yandex',
        region: settings.region || 'msk',
        top_size: parseInt(settings.topSize) || 10,
        exclude_platforms: settings.excludePlatforms,
        parse_archived: settings.parseArchived,
        calculate_by_median: settings.calculateByMedian,
      }
    };
  };

  // Основная функция анализа
  const startAnalysis = useCallback(async (
    pageUrl: string,
    mainQuery: string,
    additionalQueries: string[],
    excludedWords: string[],
    settings: {
      checkAI: boolean;
      checkSpelling: boolean;
      checkUniqueness: boolean;
      searchEngine: string;
      region: string;
      topSize: string;
      excludePlatforms: boolean;
      parseArchived: boolean;
      calculateByMedian: boolean;
    }
  ) => {
    // Валидация
    if (!validateFormData(pageUrl, mainQuery)) {
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Подготавливаем данные
      const requestData = prepareRequestData(
        pageUrl,
        mainQuery,
        additionalQueries,
        excludedWords,
        settings
      );

      console.log('Отправка данных:', JSON.stringify(requestData, null, 2));

      // === РЕАЛЬНЫЙ API ВЫЗОВ ===
      // Используем analyzePageWithProgress вместо startAnalysis
      const response = await analyzerService.analyzePageWithProgress(requestData, (progress) => {
        console.log('Прогресс анализа:', progress);
      });

      const analysisResult: AnalysisResult = {
        success: true,
        message: 'Анализ запущен',
        task_id: 'task_' + Date.now(),
        data: responseData.results || responseData
      };

      console.log('Ответ сервера:', analysisResult);
      setResults(analysisResult);

      // Уведомление об успехе
      // toast?.({
      //   title: "Успех",
      //   description: `Анализ начат! ID задачи: ${mockResponse.task_id}`,
      // });
      alert(`Анализ начат! ID задачи: ${analysisResult.task_id}`);

      return analysisResult;

    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Произошла ошибка при отправке запроса';

      console.error('Ошибка при отправке:', error);
      setError(errorMessage);

      // toast?.({
      //   title: "Ошибка",
      //   description: errorMessage,
      //   variant: "destructive",
      // });
      alert(errorMessage);

      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Функция загрузки файла со стоп-словами
  const loadStopWordsFromFile = useCallback((): Promise<string[]> => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.txt,.csv';

      input.onchange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];

        if (file) {
          const reader = new FileReader();

          reader.onload = (e) => {
            const text = e.target?.result as string;
            const words = text
              .split(/[\n,;]+/)
              .map(w => w.trim())
              .filter(w => w.length > 0);

            console.log(`Загружено стоп-слов: ${words.length}`);

            // toast?.({
            //   title: "Файл загружен",
            //   description: `Загружено ${words.length} стоп-слов`,
            // });

            resolve(words);
          };

          reader.onerror = () => {
            console.error('Ошибка чтения файла');
            // toast?.({
            //   title: "Ошибка",
            //   description: "Не удалось прочитать файл",
            //   variant: "destructive",
            // });
            resolve([]);
          };

          reader.readAsText(file);
        } else {
          resolve([]);
        }
      };

      // Если пользователь отменил выбор файла
      input.oncancel = () => {
        resolve([]);
      };

      input.click();
    });
  }, []);

  // Функция сброса результатов
  const resetResults = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  // Функция получения статуса задачи (для будущего использования)
  const getTaskStatus = useCallback(async (taskId: string) => {
    try {
      // const status = await analyzerService.getTaskStatus(taskId);
      // return status;

      // Заглушка
      return {
        task_id: taskId,
        status: 'processing',
        progress: 45,
      };
    } catch (error) {
      console.error('Ошибка получения статуса:', error);
      return null;
    }
  }, []);

  return {
    // Состояния
    isLoading,
    results,
    error,

    // Методы
    startAnalysis,
    loadStopWordsFromFile,
    resetResults,
    getTaskStatus,
  };
};