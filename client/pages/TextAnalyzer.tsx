import React, { useState } from 'react';
import { Input, Select, Checkbox } from '@/components/forms';
import { Button } from '@/components/buttons';
import { AddQuerySection } from '@/components/ui/AddQuerySection';
import { ProgressBar } from '@/components/progress_bars/ProgressBar';
import { ResultsTable } from '@/components/tables/ResultsTable';
import { useTextAnalyzer } from '@/hooks/useTextAnalyzer';

const TextAnalyzerPage: React.FC = () => {
  // Используем наш custom hook
  const {
    isLoading,
    progress,
    results,
    error,
    startAnalysis,
    loadStopWordsFromFile,
    resetResults
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

    // Можно добавить дополнительную логику после получения результата
    if (result && result.success) {
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
    if (!results?.competitors) return;
    
    if (selectedCompetitors.length === results.competitors.length) {
      setSelectedCompetitors([]);
    } else {
      setSelectedCompetitors(results.competitors.map(c => c.url));
    }
  };

  const handleAddUrl = async () => {
    if (!additionalUrl.trim()) return;
    
    setAddingUrl(true);
    try {
      // Here you could implement additional URL analysis
      // For now, just clear the input
      setAdditionalUrl('');
    } catch (error) {
      console.error('Error adding URL:', error);
    } finally {
      setAddingUrl(false);
    }
  };

  // Подготовка данных для таблицы
  const tableResults = results?.competitors?.map(competitor => ({
    url: competitor.url,
    word_count_in_a: competitor.parsed_data?.word_count_in_a,
    word_count_outside_a: competitor.parsed_data?.word_count_outside_a,
    text_fragments_count: competitor.parsed_data?.text_fragments_count,
    total_visible_words: competitor.parsed_data?.total_visible_words,
    parsed_from: competitor.parsed_from,
    fallback_used: competitor.fallback_used,
  })) || [];

  const mySiteAnalysis = results?.my_page?.parsed_data ? {
    word_count_in_a: results.my_page.parsed_data.word_count_in_a,
    word_count_outside_a: results.my_page.parsed_data.word_count_outside_a,
    text_fragments_count: results.my_page.parsed_data.text_fragments_count,
    total_visible_words: results.my_page.parsed_data.total_visible_words,
  } : null;

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

          {/* Прогресс бар */}
          {isLoading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <ProgressBar
                progress={progress}
                label="Прогресс анализа"
                showPercentage={true}
                color="blue"
                className="mb-2"
              />
              <p className="text-blue-700 text-sm">
                Анализ может занять несколько минут...
              </p>
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
                value={excludedWords}
              />
              <Button variant="outline" onClick={handleFileUpload}>
                Загрузить файл
              </Button>
            </div>
          </div>

          {/* Submit Button with loading state */}
          <div className="flex justify-start items-center gap-4">
            <Button
              size="large"
              disabled={!pageUrl || !mainQuery || isLoading}
              onClick={handleGetTop}
            >
              {isLoading ? 'Обработка...' : 'Получить ТОП'}
            </Button>

            {isLoading && (
              <span className="text-gray-600 text-sm animate-pulse">
                Анализ может занять несколько минут...
              </span>
            )}

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

          {/* Results section with summary */}
          {results && !isLoading && (
            <div className="mt-6 space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-bold text-green-900 mb-2">
                  ✓ Анализ завершен успешно
                </h3>
                <div className="text-green-700 space-y-1">
                  <p>ID задачи: <code className="bg-green-100 px-2 py-1 rounded">
                    {results.task_id}
                  </code></p>
                  <p>Анализировано страниц: <strong>{results.summary.total_pages_analyzed}</strong></p>
                  <p>Найдено конкурентов: <strong>{results.summary.competitors_found}</strong></p>
                  {results.summary.my_page_analyzed && (
                    <p>Статус вашей страницы: <strong>
                      {results.summary.my_page_success ? 'Успешно проанализирована' : 'Ошибка анализа'}
                    </strong></p>
                  )}
                </div>
              </div>

              {/* Results Table */}
              <ResultsTable
                results={tableResults}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TextAnalyzerPage;
