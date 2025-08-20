import React, { useState, useMemo } from 'react';
import { Input, Select, Checkbox } from '@/components/forms';
import { Button } from '@/components/buttons';
import { AddQuerySection } from '@/components/ui/AddQuerySection';
import { ProgressBar } from '@/components/progress_bars/ProgressBar';
import { ResultsTable } from '@/components/tables/ResultsTable';
import { ComparisonTable } from '@/components/tables/ComparisonTable';
import { LSIResults } from '@/components/tables/LSIResults';
import { KeywordsResults } from '@/components/tables/KeywordsResults';
import { useTextAnalyzer } from '@/hooks/useTextAnalyzer';

const TextAnalyzerPage: React.FC = () => {
  // Используем наш custom hook
  const {
    isLoading,
    progress,
    results,
    error,
    lsiLoading,
    lsiProgress,
    lsiResults,
    lsiError,
    keywordsLoading,
    keywordsProgress,
    keywordsResults,
    keywordsError,
    startAnalysis,
    loadStopWordsFromFile,
    resetResults,
    analyzeSinglePage,
    startLSIAnalysis,
    startKeywordsAnalysis
  } = useTextAnalyzer();

  // Состояния формы
  const [checkAI, setCheckAI] = useState(false);
  const [checkSpelling, setCheckSpelling] = useState(false);
  const [checkUniqueness, setCheckUniqueness] = useState(false);
  const [pageUrl, setPageUrl] = useState('');
  const [mainQuery, setMainQuery] = useState('');
  const [additionalQueries, setAdditionalQueries] = useState<string[]>([]);
  const [excludedWords, setExcludedWords] = useState<string[]>([]);
  const [excludePlatforms, setExcludePlatforms] = useState(false);
  const [parseArchived, setParseArchived] = useState(false);
  const [searchEngine, setSearchEngine] = useState('yandex');
  const [region, setRegion] = useState('msk');
  const [topSize, setTopSize] = useState('10');
  const [calculateByMedian, setCalculateByMedian] = useState(false);

  // Состояния для таблицы результатов
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([]);
  const [additionalUrl, setAdditionalUrl] = useState('');
  const [addingUrl, setAddingUrl] = useState(false);
  
  // Дополнительные результаты от анализа отдельных страниц
  const [additionalResults, setAdditionalResults] = useState<Array<{
    url: string;
    word_count_in_a?: number;
    word_count_outside_a?: number;
    text_fragments_count?: number;
    total_visible_words?: number;
    parsed_from?: string;
    fallback_used?: boolean;
  }>>([]);

  // Обработчик отправки формы
  const handleGetTop = async () => {
    const result = await startAnalysis(
      pageUrl,
      mainQuery,
      additionalQueries,
      excludedWords,
      {
        checkAI,
        checkSpelling,
        checkUniqueness,
        searchEngine,
        region,
        topSize,
        excludePlatforms,
        parseArchived,
        calculateByMedian,
      }
    );

    // Очищаем дополнительные результаты при новом анализе
    if (result && result.success) {
      setAdditionalResults([]);
      setSelectedCompetitors([]);
      console.log('Анализ успешно запущен');
    }
  };

  // Обработчик загрузки файла
  const handleFileUpload = async () => {
    const words = await loadStopWordsFromFile();
    if (words.length > 0) {
      setExcludedWords(words);
    }
  };

  // Обработчики для таблицы результатов
  const handleToggleCompetitor = (url: string) => {
    setSelectedCompetitors(prev => 
      prev.includes(url) 
        ? prev.filter(u => u !== url)
        : [...prev, url]
    );
  };

  const handleSelectAll = () => {
    if (!combinedResults) return;
    
    if (selectedCompetitors.length === combinedResults.length) {
      setSelectedCompetitors([]);
    } else {
      setSelectedCompetitors(combinedResults.map(c => c.url));
    }
  };

  const handleAddUrl = async () => {
    if (!additionalUrl.trim()) return;
    
    setAddingUrl(true);
    try {
      const result = await analyzeSinglePage(additionalUrl);
      
      if (result.error) {
        // Показываем ошибку пользователю
        alert(`Ошибка: ${result.error}`);
      } else {
        // Добавляем результат в дополнительные результаты
        const newResult = {
          url: additionalUrl,
          word_count_in_a: result.word_count_in_a,
          word_count_outside_a: result.word_count_outside_a,
          text_fragments_count: result.text_fragments_count,
          total_visible_words: result.total_visible_words,
          parsed_from: 'additional',
          fallback_used: false,
        };
        
        setAdditionalResults(prev => [...prev, newResult]);
        setAdditionalUrl('');
      }
    } catch (error) {
      console.error('Error adding URL:', error);
      alert(`Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setAddingUrl(false);
    }
  };

  // Обработчик LSI анализа
  const handleGoToLSI = async () => {
    if (!results?.my_page?.url || selectedCompetitors.length === 0) {
      alert('Для LSI анализа необходимо выбрать конкурентов и иметь анализ собственной страницы');
      return;
    }

    await startLSIAnalysis(
      selectedCompetitors,
      results.my_page.url,
      mainQuery,
      additionalQueries,
      calculateByMedian
    );
  };

  // Обработчик анализа ключевых слов
  const handleKeywordsAnalysis = async () => {
    if (!results?.my_page?.url || selectedCompetitors.length === 0) {
      alert('Для анализа ключевых слов необходимо выбрать конкурентов и иметь анализ собственной страницы');
      return;
    }

    await startKeywordsAnalysis(
      selectedCompetitors,
      results.my_page.url,
      mainQuery,
      additionalQueries,
      searchEngine
    );
  };

  // Объединяем результаты из основного анализа и дополнительные
  const combinedResults = useMemo(() => {
    const mainResults = results?.competitors?.map(competitor => ({
      url: competitor.url,
      word_count_in_a: competitor.parsed_data?.word_count_in_a,
      word_count_outside_a: competitor.parsed_data?.word_count_outside_a,
      text_fragments_count: competitor.parsed_data?.text_fragments_count,
      total_visible_words: competitor.parsed_data?.total_visible_words,
      parsed_from: competitor.parsed_from,
      fallback_used: competitor.fallback_used,
    })) || [];

    return [...mainResults, ...additionalResults];
  }, [results?.competitors, additionalResults]);

  // Подготовка данных для ComparisonTable
  const selectedResults = combinedResults.filter(result => 
    selectedCompetitors.includes(result.url)
  );

  const mySiteAnalysis = results?.my_page?.parsed_data ? {
    word_count_in_a: results.my_page.parsed_data.word_count_in_a,
    word_count_outside_a: results.my_page.parsed_data.word_count_outside_a,
    text_fragments_count: results.my_page.parsed_data.text_fragments_count,
    total_visible_words: results.my_page.parsed_data.total_visible_words,
  } : null;

  // Преобразуем LSI результаты для компонента LSIResults
  const formattedLSIResults = useMemo(() => {
    if (!lsiResults?.ngrams) return null;

    // Преобразуем в формат для LSITable (использует другой интерфейс)
    const lsiTableData = lsiResults.ngrams.map(item => ({
      ngram: item.ngram,
      competitors: item.competitors,
      avg_count: item.avg_count,
      my_count: item.my_count,
      coverage_percent: item.coverage_percent,
    }));

    return {
      bigrams: lsiTableData
    };
  }, [lsiResults]);

  return (
    <div className="flex-1 bg-gray-0 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg p-6 space-y-6">
          {/* Заголовок страницы */}
          <div className="border-b pb-4">
            <h1 className="text-2xl font-bold text-gray-900">Анализ текста</h1>
            <p className="text-gray-600 mt-1">Проверка страницы и получение ТОП результатов</p>
          </div>

          {/* Показываем ошибку если есть */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Показываем LSI ошибку если есть */}
          {lsiError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <strong>Ошибка LSI анализа:</strong> {lsiError}
            </div>
          )}

          {/* Показываем Keywords ошибку если есть */}
          {keywordsError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <strong>Ошибка анализа ключевых слов:</strong> {keywordsError}
            </div>
          )}

          {/* Analysis Options */}
          <div className="flex flex-wrap gap-6">
            <Checkbox
              label="Проверка на ИИ"
              checked={checkAI}
              onChange={setCheckAI}
            />
            <Checkbox
              label="Проверка на орфографию"
              checked={checkSpelling}
              onChange={setCheckSpelling}
            />
            <Checkbox
              label="Проверка уникальности"
              checked={checkUniqueness}
              onChange={setCheckUniqueness}
            />
          </div>

          {/* URL and Query */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Input
              label="Адрес страницы"
              placeholder="Введите URL"
              value={pageUrl}
              onChange={setPageUrl}
              type="url"
              required
            />
            <Input
              label="Основной запрос"
              placeholder="Введите значение"
              value={mainQuery}
              onChange={setMainQuery}
              required
            />
          </div>

          {/* Additional Queries Section */}
          <AddQuerySection
            label="Дополнительные запросы"
            maxCount={5}
            onChange={setAdditionalQueries}
            buttonText="+ Добавить запрос"
            placeholder="Запрос"
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Select
              label="Поисковая система"
              placeholder="Выберите..."
              value={searchEngine}
              onChange={setSearchEngine}
              options={[
                { value: 'yandex', label: 'Яндекс' },
                { value: 'google', label: 'Google' },
              ]}
            />
            <Select
              label="Регион"
              placeholder="Выберите или введите текст"
              value={region}
              onChange={setRegion}
              options={[
                { value: 'msk', label: 'Москва' },
                { value: 'spb', label: 'Санкт-Петербург' },
                { value: 'ekb', label: 'Екатеринбург' },
              ]}
              allowCustomValue={true}
            />
            <Select
              label="Размер топа"
              placeholder="Не выбрано"
              value={topSize}
              onChange={setTopSize}
              options={[
                { value: '10', label: 'ТОП-10' },
                { value: '20', label: 'ТОП-20' },
                { value: '50', label: 'ТОП-50' },
              ]}
            />
          </div>

          {/* Parsing Settings */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-black font-['Open_Sans',-apple-system,Roboto,Helvetica,sans-serif]">
              Настройки парсинга
            </h2>

            <Checkbox
              label="Исключать площадки (Avito, Яндекс.Услуги, справочники)"
              checked={excludePlatforms}
              onChange={setExcludePlatforms}
            />
            <Checkbox
              label="Парсить сохраненные копии"
              checked={parseArchived}
              onChange={setParseArchived}
            />
            <Checkbox
              label="Считать по медиане"
              checked={calculateByMedian}
              onChange={setCalculateByMedian}
            />

            <div className="flex items-end gap-4">
              <AddQuerySection
                label="Не учитывать слова"
                maxCount={10}
                onChange={setExcludedWords}
                buttonText="+ Добавить стоп-слово"
                placeholder="Стоп-слово"
                initialQueries={excludedWords}
              />
              <Button variant="outline" onClick={handleFileUpload}>
                Загрузить файл
              </Button>
            </div>
          </div>

          {/* Submit Button with loading state */}
          <div className="space-y-4">
            <div className="flex justify-start items-center gap-4">
              <Button
                size="large"
                disabled={!pageUrl || !mainQuery || isLoading}
                onClick={handleGetTop}
              >
                {isLoading ? 'Обработка...' : 'Получить ТОП'}
              </Button>

              {results && (
                <Button
                  variant="outline"
                  size="medium"
                  onClick={resetResults}
                >
                  Очистить результаты
                </Button>
              )}
            </div>

            {/* Красный прогресс бар под кнопкой */}
            {isLoading && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <ProgressBar
                  progress={progress}
                  label="Прогресс анализа"
                  showPercentage={true}
                  color="red"
                  className="mb-2"
                />
                <p className="text-red-700 text-sm">
                  Анализ может занять несколько минут...
                </p>
              </div>
            )}
          </div>

          {/* Results Table */}
          {combinedResults.length > 0 && !isLoading && (
            <ResultsTable
              results={combinedResults}
              mySiteAnalysis={mySiteAnalysis}
              selectedCompetitors={selectedCompetitors}
              onToggleCompetitor={handleToggleCompetitor}
              onSelectAll={handleSelectAll}
              parseSavedCopies={parseArchived}
              additionalUrl={additionalUrl}
              setAdditionalUrl={setAdditionalUrl}
              onAddUrl={handleAddUrl}
              addingUrl={addingUrl}
            />
          )}

          {/* Comparison Table - показываем только если есть выбранные конкуренты */}
          {selectedCompetitors.length > 0 && mySiteAnalysis && !isLoading && (
            <ComparisonTable
              results={selectedResults}
              selectedCompetitors={selectedCompetitors}
              mySiteAnalysis={mySiteAnalysis}
              medianMode={calculateByMedian}
              onGoToLSI={handleGoToLSI}
              lsiLoading={lsiLoading}
              lsiProgress={lsiProgress}
            />
          )}

          {/* LSI Progress Bar */}
          {lsiLoading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <ProgressBar
                progress={lsiProgress}
                label="Прогресс LSI анализа"
                showPercentage={true}
                color="red"
                className="mb-2"
              />
              <p className="text-red-700 text-sm">
                Анализ LSI может занять несколько минут...
              </p>
            </div>
          )}

          {/* LSI Results */}
          {formattedLSIResults && !lsiLoading && (
            <LSIResults
              lsiResults={formattedLSIResults}
              selectedCompetitors={selectedCompetitors}
              mySiteAnalysis={mySiteAnalysis}
              results={combinedResults}
              medianMode={calculateByMedian}
              onKeywordsAnalysis={handleKeywordsAnalysis}
              keywordsLoading={keywordsLoading}
              keywordsProgress={keywordsProgress}
            />
          )}

          {/* Keywords Progress Bar */}
          {keywordsLoading && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <ProgressBar
                progress={keywordsProgress}
                label="Прогресс анализа ключевых слов"
                showPercentage={true}
                color="green"
                className="mb-2"
              />
              <p className="text-green-700 text-sm">
                Анализ ключевых слов может занять несколько минут...
              </p>
            </div>
          )}

          {/* Keywords Results */}
          {keywordsResults && !keywordsLoading && (
            <KeywordsResults
              keywordsData={keywordsResults.table}
              keywordsTotalWords={keywordsResults.total_words}
              searchEngine={keywordsResults.search_engine}
              onBack={() => {
                // Можно добавить логику возврата если нужно
                console.log('Back to previous step');
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TextAnalyzerPage;
