import React, { useState } from "react";
import { Input, Select, Checkbox } from "@/components/forms";
import { Button } from "@/components/buttons";
import { AddQuerySection } from "@/components/ui/AddQuerySection";
import { ProgressBar } from "@/components/progress_bars/ProgressBar";
import { useTextAnalyzer } from "@/hooks/useTextAnalyzer";

const TextAnalyzerPage: React.FC = () => {
  // Используем наш custom hook
  const {
    isLoading,
    progress,
    results,
    error,
    startAnalysis,
    loadStopWordsFromFile,
    resetResults,
  } = useTextAnalyzer();

  // Состояния формы
  const [checkAI, setCheckAI] = useState(false);
  const [checkSpelling, setCheckSpelling] = useState(false);
  const [checkUniqueness, setCheckUniqueness] = useState(false);
  const [pageUrl, setPageUrl] = useState("");
  const [mainQuery, setMainQuery] = useState("");
  const [additionalQueries, setAdditionalQueries] = useState<string[]>([]);
  const [excludedWords, setExcludedWords] = useState<string[]>([]);
  const [excludePlatforms, setExcludePlatforms] = useState(false);
  const [parseArchived, setParseArchived] = useState(false);
  const [searchEngine, setSearchEngine] = useState("");
  const [region, setRegion] = useState("");
  const [topSize, setTopSize] = useState("");
  const [calculateByMedian, setCalculateByMedian] = useState(false);

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
      },
    );

    // Можно добавить дополнительную логику после получения результата
    if (result && result.success) {
      // Например, очистить форму или перенаправить пользователя
      console.log("Анализ успешно запущен");
    }
  };

  // Обработчик загрузки файла
  const handleFileUpload = async () => {
    const words = await loadStopWordsFromFile();
    if (words.length > 0) {
      setExcludedWords(words);
    }
  };

  return (
    <div className="flex-1 bg-gray-0 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg p-6 space-y-6">
          {/* Заголовок страницы */}
          <div className="border-b pb-4">
            <h1 className="text-2xl font-bold text-gray-900">Анализ текста</h1>
            <p className="text-gray-600 mt-1">
              Проверка страницы и получение ТОП результатов
            </p>
          </div>

          {/* Показываем ошибку если есть */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
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
                { value: "google", label: "Google" },
                { value: "yandex", label: "Яндекс" },
              ]}
            />
            <Select
              label="Регион"
              placeholder="Выберите или введите текст"
              value={region}
              onChange={setRegion}
              options={[
                { value: "msk", label: "Москва" },
                { value: "spb", label: "Санкт-Петербург" },
                { value: "ekb", label: "Екатеринбург" },
              ]}
              allowCustomValue={true}
            />
            <Select
              label="Размер топа"
              placeholder="Не выбрано"
              value={topSize}
              onChange={setTopSize}
              options={[
                { value: "10", label: "ТОП-10" },
                { value: "20", label: "ТОП-20" },
                { value: "50", label: "ТОП-50" },
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
              {isLoading ? "Обработка..." : "��олучить ТОП"}
            </Button>

            {isLoading && (
              <span className="text-gray-600 text-sm animate-pulse">
                Анализ может занять несколько минут...
              </span>
            )}
          </div>

          {/* Progress Bar */}
          {isLoading && (
            <div className="space-y-2">
              <ProgressBar
                progress={progress}
                label="Прогресс анализа"
                color="red"
                showPercentage={true}
                className="w-full"
              />
            </div>
          )}

          {results && (
            <Button variant="outline" size="medium" onClick={resetResults}>
              Очистить результаты
            </Button>
          )}

          {/* Results section */}
          {results && !isLoading && (
            <div className="mt-6 space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-bold text-green-900 mb-2">
                  ✓ {results.message}
                </h3>
                <p className="text-green-700">
                  ID задачи:{" "}
                  <code className="bg-green-100 px-2 py-1 rounded">
                    {results.task_id}
                  </code>
                </p>
              </div>

              {results.data && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Детали задачи:</h4>
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    <dt className="text-gray-600">URL:</dt>
                    <dd className="font-mono">{results.data.url}</dd>
                    <dt className="text-gray-600">Запрос:</dt>
                    <dd>{results.data.query}</dd>
                    <dt className="text-gray-600">Статус:</dt>
                    <dd className="capitalize">{results.data.status}</dd>
                    {results.data.estimated_time && (
                      <>
                        <dt className="text-gray-600">Время:</dt>
                        <dd>{results.data.estimated_time}</dd>
                      </>
                    )}
                  </dl>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TextAnalyzerPage;
