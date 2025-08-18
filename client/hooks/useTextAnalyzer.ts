// hooks/useTextAnalyzer.ts

import { useState, useCallback, useRef, useEffect } from "react";
import { API_ENDPOINTS } from "@/config/api.config.js";
// import { useToast } from '@/hooks/use-toast';

interface AnalysisRequest {
  check_ai: boolean;
  check_spelling: boolean;
  check_uniqueness: boolean;
  page_url: string | null;
  main_query: string;
  additional_queries: string[];
  parse_saved_copies: boolean;
  search_engine: "yandex" | "google";
  region: string;
  top_size: number;
  excluded_words: string[];
  auto_update: boolean;
  update_interval_sec: number;
  median_mode: boolean;
}

interface AnalysisResult {
  task_id: string;
  my_page: any;
  competitors: any[];
  analysis_data: {
    main_query: string;
    additional_queries: string[];
  };
  summary?: any;
  error?: string;
}

interface ProgressStatus {
  progress: number;
  status: string;
  running: boolean;
}

export const useTextAnalyzer = () => {
  // const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs for polling
  const pollingRef = useRef<EventSource | NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const taskIdRef = useRef<string | null>(null);

  // Функция валидации данных
  const validateFormData = (pageUrl: string, mainQuery: string): boolean => {
    if (!pageUrl || !mainQuery) {
      const errorMessage =
        "Заполните обязательные поля: адрес страницы и основной запрос";
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
    },
  ): AnalysisRequest => {
    return {
      check_ai: settings.checkAI,
      check_spelling: settings.checkSpelling,
      check_uniqueness: settings.checkUniqueness,
      page_url: pageUrl || null,
      main_query: mainQuery,
      additional_queries: additionalQueries.filter((q) => q && q.trim() !== ""),
      parse_saved_copies: settings.parseArchived,
      search_engine: (settings.searchEngine || "yandex") as "yandex" | "google",
      region: settings.region || "213", // Москва по умолчанию
      top_size: parseInt(settings.topSize) || 10,
      excluded_words: excludedWords.filter((w) => w && w.trim() !== ""),
      auto_update: false,
      update_interval_sec: 60,
      median_mode: settings.calculateByMedian,
    };
  };

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      if (pollingRef.current instanceof EventSource) {
        pollingRef.current.close();
      } else {
        clearInterval(pollingRef.current);
      }
      pollingRef.current = null;
    }
  }, []);

  // Start polling progress using SSE
  const startPolling = useCallback(
    (taskId: string) => {
      if (pollingRef.current) return; // Already polling

      console.log("Starting SSE polling for task:", taskId);

      try {
        const eventSource = new EventSource(
          `${API_ENDPOINTS.analyzer.analyzeATagsProgress}?task_id=${taskId}`
        );

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("SSE Progress update:", data);

            if (!mountedRef.current) {
              eventSource.close();
              return;
            }

            // Handle different message types
            switch (data.type) {
              case 'stage_start':
                console.log(`Starting stage: ${data.stage}`);
                break;
              case 'stage_complete':
                console.log(`Completed stage: ${data.stage}`);
                break;
              case 'parsing_complete':
                console.log('Parsing completed:', data);
                setProgress(100);
                break;
              case 'complete':
                console.log("Analysis completed!");
                setProgress(100);
                setIsLoading(false);
                eventSource.close();
                
                // Выводим финальные результаты в консоль
                console.log("=== РЕЗУЛЬТАТЫ АНАЛИЗА ===");
                console.log("Task ID:", taskId);
                if (results) {
                  console.log("Final results:", results);
                }
                break;
              case 'error':
                console.error('Analysis error:', data.message);
                setError(data.message);
                setIsLoading(false);
                eventSource.close();
                break;
              case 'heartbeat':
                // Keep connection alive
                break;
              default:
                // Update progress if available
                if (data.progress_percent !== undefined) {
                  setProgress(data.progress_percent);
                }
                break;
            }
          } catch (parseError) {
            console.error('Error parsing SSE data:', parseError);
          }
        };

        eventSource.onerror = (error) => {
          console.error('SSE Error:', error);
          if (mountedRef.current) {
            setError("Ошибка соединения с сервером прогресса");
            setIsLoading(false);
          }
          eventSource.close();
        };

        // Store reference for cleanup
        pollingRef.current = eventSource;
      } catch (error) {
        console.error('Error starting SSE:', error);
        setError("Ошибка при подключении к серверу прогресса");
        setIsLoading(false);
      }
    },
    [stopPolling, results, mountedRef]
  );

  // Основная функция анализа
  const startAnalysis = useCallback(
    async (
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
      },
    ) => {
      // Валидация
      if (!validateFormData(pageUrl, mainQuery)) {
        return null;
      }

      setIsLoading(true);
      setProgress(0);
      setError(null);
      setResults(null);

      try {
        // Подготавливаем данные
        const requestData = prepareRequestData(
          pageUrl,
          mainQuery,
          additionalQueries,
          excludedWords,
          settings,
        );

        console.log(
          "Отправка данных на анализ:",
          JSON.stringify(requestData, null, 2),
        );

        // === РЕАЛЬНЫЙ API ВЫЗОВ к API_ENDPOINTS.analyzer.start ===
        const response = await fetch(API_ENDPOINTS.analyzer.start, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Add auth headers if needed
          },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log("Ответ сервера от /start:", responseData);
        console.log("=== ДАННЫЕ ДЛЯ ТАБЛИЦЫ ===");
        console.log(JSON.stringify(responseData, null, 2));

        // Сохраняем результаты
        setResults(responseData);
        taskIdRef.current = responseData.task_id;

        // Запускаем поллинг прогресса
        startPolling(responseData.task_id);

        // Уведомление об успехе
        alert(`Анализ начат! ID задачи: ${responseData.task_id}`);

        return responseData;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Произошла ошибка при отправке запроса";

        console.error("Ошибка при отправке:", error);
        setError(errorMessage);
        alert(errorMessage);
        setIsLoading(false);

        return null;
      }
    },
    [startPolling],
  );

  // Функция загрузки файла со стоп-словами
  const loadStopWordsFromFile = useCallback((): Promise<string[]> => {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".txt,.csv";

      input.onchange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];

        if (file) {
          const reader = new FileReader();

          reader.onload = (e) => {
            const text = e.target?.result as string;
            const words = text
              .split(/[\n,;]+/)
              .map((w) => w.trim())
              .filter((w) => w.length > 0);

            console.log(`Загружено стоп-слов: ${words.length}`);

            // toast?.({
            //   title: "Файл загружен",
            //   description: `Загружено ${words.length} стоп-слов`,
            // });

            resolve(words);
          };

          reader.onerror = () => {
            console.error("Ошибка чтения файла");
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
    stopPolling();
    setResults(null);
    setError(null);
    setProgress(0);
    setIsLoading(false);
    taskIdRef.current = null;
  }, [stopPolling]);

  // Функция получения статуса задачи (для будущего использования)
  const getTaskStatus = useCallback(async (taskId: string) => {
    try {
      // const status = await analyzerService.getTaskStatus(taskId);
      // return status;

      // Заглушка
      return {
        task_id: taskId,
        status: "processing",
        progress: 45,
      };
    } catch (error) {
      console.error("Ошибка получения статуса:", error);
      return null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopPolling();
    };
  }, [stopPolling]);

  return {
    // Состояния
    isLoading,
    progress,
    results,
    error,

    // Методы
    startAnalysis,
    loadStopWordsFromFile,
    resetResults,
    getTaskStatus,
  };
};
