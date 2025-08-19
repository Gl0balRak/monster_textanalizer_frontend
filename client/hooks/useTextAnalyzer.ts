import { useState, useCallback, useRef } from 'react';
import { textAnalyzerApi, AnalysisRequest, AnalysisResult, ProgressEvent } from '@/lib/text-analyzer-api';

interface UseTextAnalyzerReturn {
  // State
  isLoading: boolean;
  progress: number;
  results: AnalysisResult | null;
  error: string | null;
  
  // Actions
  startAnalysis: (
    pageUrl: string,
    mainQuery: string,
    additionalQueries: string[],
    excludedWords: string[],
    options: {
      checkAI?: boolean;
      checkSpelling?: boolean;
      checkUniqueness?: boolean;
      searchEngine?: string;
      region?: string;
      topSize?: string;
      excludePlatforms?: boolean;
      parseArchived?: boolean;
      calculateByMedian?: boolean;
    }
  ) => Promise<{ success: boolean; message?: string; task_id?: string }>;
  
  resetResults: () => void;
  loadStopWordsFromFile: () => Promise<string[]>;
}

export const useTextAnalyzer = (): UseTextAnalyzerReturn => {
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const mountedRef = useRef(true);

  // Stop progress simulation
  const stopProgressSimulation = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  // Start progress simulation
  const startProgressSimulation = useCallback(() => {
    setProgress(0);
    
    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        // Slow progress that reaches about 85% before API response
        if (prev < 85) {
          return prev + Math.random() * 2 + 0.5; // Random increment between 0.5-2.5
        }
        return prev;
      });
    }, 1000); // Update every second
  }, []);

  // Complete progress quickly
  const completeProgress = useCallback(() => {
    stopProgressSimulation();
    
    // Quickly complete to 100%
    let currentProgress = progress;
    const completeInterval = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);
      
      if (currentProgress >= 100) {
        clearInterval(completeInterval);
        setProgress(100);
      }
    }, 50); // Very fast completion
  }, [progress, stopProgressSimulation]);

  // Setup SSE connection for real progress
  const setupProgressStream = useCallback((taskId: string) => {
    try {
      eventSourceRef.current = textAnalyzerApi.getProgressStream(taskId);
      
      eventSourceRef.current.onmessage = (event) => {
        try {
          const data: ProgressEvent = JSON.parse(event.data);
          
          // Handle different progress event types
          switch (data.type) {
            case 'stage_start':
              console.log(`Starting stage: ${data.stage}`);
              break;
              
            case 'stage_complete':
              console.log(`Completed stage: ${data.stage}`);
              break;
              
            case 'batch_start':
            case 'url_start':
            case 'url_success':
            case 'url_failed':
              // Real progress from SSE can override simulation
              if (data.progress_percent && data.progress_percent > progress) {
                setProgress(data.progress_percent);
              }
              break;
              
            case 'parsing_complete':
            case 'complete':
              completeProgress();
              break;
              
            case 'error':
              if (mountedRef.current) {
                setError(data.message || 'Ошибка при анализе');
                setIsLoading(false);
              }
              break;
          }
        } catch (e) {
          console.error('Error parsing SSE message:', e);
        }
      };

      eventSourceRef.current.onerror = (error) => {
        console.error('SSE connection error:', error);
        eventSourceRef.current?.close();
        eventSourceRef.current = null;
      };

    } catch (error) {
      console.error('Error setting up progress stream:', error);
    }
  }, [progress, completeProgress]);

  // Cleanup function
  const cleanup = useCallback(() => {
    stopProgressSimulation();
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, [stopProgressSimulation]);

  // Start analysis function
  const startAnalysis = useCallback(async (
    pageUrl: string,
    mainQuery: string,
    additionalQueries: string[],
    excludedWords: string[],
    options: {
      checkAI?: boolean;
      checkSpelling?: boolean;
      checkUniqueness?: boolean;
      searchEngine?: string;
      region?: string;
      topSize?: string;
      excludePlatforms?: boolean;
      parseArchived?: boolean;
      calculateByMedian?: boolean;
    }
  ) => {
    try {
      setError(null);
      setIsLoading(true);
      setResults(null);
      
      // Start progress simulation
      startProgressSimulation();

      // Prepare request
      const request: AnalysisRequest = {
        page_url: pageUrl || undefined,
        main_query: mainQuery,
        additional_queries: additionalQueries.filter(q => q.trim()),
        excluded_words: excludedWords.filter(w => w.trim()),
        check_ai: options.checkAI,
        check_spelling: options.checkSpelling,
        check_uniqueness: options.checkUniqueness,
        search_engine: (options.searchEngine as 'yandex' | 'google') || 'yandex',
        region: options.region || '213',
        top_size: options.topSize ? parseInt(options.topSize) : 10,
        parse_saved_copies: options.parseArchived,
        median_mode: options.calculateByMedian,
      };

      // Start analysis
      const result = await textAnalyzerApi.startAnalysis(request);

      if (!mountedRef.current) return { success: false };

      // Setup progress stream if task_id is available
      if (result.task_id) {
        setupProgressStream(result.task_id);
      }

      // Complete progress and set results
      completeProgress();
      setResults(result);
      setIsLoading(false);

      return {
        success: true,
        message: 'Анализ успешно завершен',
        task_id: result.task_id,
      };

    } catch (err) {
      if (!mountedRef.current) return { success: false };

      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при анализе';
      setError(errorMessage);
      setIsLoading(false);
      stopProgressSimulation();
      setProgress(0);

      return {
        success: false,
        message: errorMessage,
      };
    }
  }, [startProgressSimulation, setupProgressStream, completeProgress, stopProgressSimulation]);

  // Reset results
  const resetResults = useCallback(() => {
    setResults(null);
    setError(null);
    setProgress(0);
    setIsLoading(false);
    cleanup();
  }, [cleanup]);

  // Load stop words from file (mock implementation)
  const loadStopWordsFromFile = useCallback(async (): Promise<string[]> => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.txt,.csv';
      
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const text = e.target?.result as string;
            const words = text
              .split(/[\n,\r\t\s]+/)
              .map(word => word.trim())
              .filter(word => word.length > 0);
            resolve(words);
          };
          reader.readAsText(file);
        } else {
          resolve([]);
        }
      };
      
      input.click();
    });
  }, []);

  return {
    isLoading,
    progress,
    results,
    error,
    startAnalysis,
    resetResults,
    loadStopWordsFromFile,
  };
};
