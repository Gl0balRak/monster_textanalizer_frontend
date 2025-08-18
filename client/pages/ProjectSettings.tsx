import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Input, Textarea, Select, Checkbox } from '@/components/forms';
import { Button, IconButton, ActionButton } from '@/components/buttons';
import { FileUpload } from '@/components/ui/FileUpload';
import { SortableTable, TableColumn, TableRow } from '@/components/tables/SortableTable.tsx';
import { colors, commonClasses, typography } from '@/lib/design-system';

const ProjectSettingsPage: React.FC = () => {
  // Настройки парсинга
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [competitors, setCompetitors] = useState(['']);
  const [region, setRegion] = useState('');
  const [selectedServices, setSelectedServices] = useState({
    keyso: false,
    bukvarix: false,
    yandexMetrika: false,
    yandexWebmaster: false,
    gsc: false,
  });

  // Ручное добавление запросов
  const [manualQueries, setManualQueries] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Настройки кластеризации
  const [searchEngine, setSearchEngine] = useState('yandex');
  const [groupingMethod, setGroupingMethod] = useState('hard');
  const [groupingDegree, setGroupingDegree] = useState('3');
  const [checkDepth, setCheckDepth] = useState('10');
  const [excludeMain, setExcludeMain] = useState(false);

  // Настройки выгрузки поисковых подсказок
  const [parsingMethod, setParsingMethod] = useState('phrase');
  const [suggestionsSearchEngine, setSuggestionsSearchEngine] = useState('yandex');
  const [parsingDepth, setParsingDepth] = useState('1');
  const [excludePorno, setExcludePorno] = useState(false);
  const [excludeNews, setExcludeNews] = useState(false);

  // Настройки чистки
  const [stopWords, setStopWords] = useState('');
  const [cityExclusions, setCityExclusions] = useState('');
  const [cleaningParams, setCleaningParams] = useState({
    duplicates: false,
    numbers: false,
    adult: false,
    stopWords: false,
    singleWords: false,
    citiesRF: false,
    latin: false,
    otherSymbols: false,
    wordRepeats: false,
  });
  const [allSelected, setAllSelected] = useState(false);

  // Управление таблицей
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState('25');
  const [selectedTableRows, setSelectedTableRows] = useState<string[]>([]);

  // Фильтры и поиск
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBasket, setShowBasket] = useState(true);
  const [filters, setFilters] = useState({
    relevantPage: '',
    group: '',
    position: '',
    competition: '',
    commerce: '',
  });

  const addCompetitor = () => {
    if (competitors.length < 10) {
      setCompetitors([...competitors, '']);
    }
  };

  const updateCompetitor = (index: number, value: string) => {
    const newCompetitors = [...competitors];
    newCompetitors[index] = value;
    setCompetitors(newCompetitors);
  };

  const handleServiceChange = (service: string, checked: boolean) => {
    setSelectedServices(prev => ({
      ...prev,
      [service]: checked,
    }));
  };

  const handleCleaningParamChange = (param: string, checked: boolean) => {
    setCleaningParams(prev => ({
      ...prev,
      [param]: checked,
    }));
  };

  const toggleAllCleaning = () => {
    const newValue = !allSelected;
    setAllSelected(newValue);
    const updatedParams = Object.keys(cleaningParams).reduce((acc, key) => ({
      ...acc,
      [key]: newValue
    }), {});
    // @ts-ignore
    setCleaningParams(updatedParams);
  };

  // Функции для работы с фильтрами
  const resetFilters = () => {
    setFilters({
      relevantPage: '',
      group: '',
      position: '',
      competition: '',
      commerce: '',
    });
    setSearchQuery('');
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleBasket = () => {
    setShowBasket(!showBasket);
  };

  const tableColumns: TableColumn[] = [
    { key: 'query', label: 'Запрос', sortable: true },
    { key: 'relevantPage', label: 'Релевантная страница', sortable: true },
    { key: 'group', label: 'Группа', sortable: true },
    { key: 'position', label: 'Позиция', sortable: true },
    { key: 'w', label: 'W', sortable: true },
    { key: 'wQuotes', label: '"W"', sortable: true },
    { key: 'wNot', label: '!W', sortable: true },
    { key: 'demand', label: 'Спрос', sortable: true },
    { key: 'clicks', label: 'Клики', sortable: true },
    { key: 'competition', label: 'Конкурентность', sortable: true },
    { key: 'commerce', label: 'Коммерция', sortable: true },
  ];

  const baseTableRows: TableRow[] = [
    {
      id: '1',
      query: 'купить телефон',
      relevantPage: '/catalog/phones',
      group: 'Коммерческие',
      position: '3',
      w: '1200',
      wQuotes: '890',
      wNot: '310',
      demand: '15000',
      clicks: '450',
      competition: 'Высокая',
      commerce: '85%'
    },
    {
      id: '2',
      query: 'смартфон цена',
      relevantPage: '/catalog/smartphones',
      group: 'Коммерческие',
      position: '7',
      w: '850',
      wQuotes: '600',
      wNot: '250',
      demand: '8500',
      clicks: '255',
      competition: 'Средняя',
      commerce: '92%'
    },
    {
      id: '3',
      query: 'обзор мобильного телефона',
      relevantPage: '/reviews/phones',
      group: 'Информационные',
      position: '12',
      w: '420',
      wQuotes: '380',
      wNot: '40',
      demand: '3200',
      clicks: '96',
      competition: 'Низкая',
      commerce: '15%'
    },
    {
      id: '4',
      query: 'планшет купить недорого',
      relevantPage: '/catalog/tablets',
      group: 'Корзина',
      position: '5',
      w: '650',
      wQuotes: '520',
      wNot: '130',
      demand: '4800',
      clicks: '192',
      competition: 'Средняя',
      commerce: '78%'
    },
    {
      id: '5',
      query: 'ноутбук характеристики',
      relevantPage: '/catalog/laptops',
      group: 'Информационные',
      position: '8',
      w: '380',
      wQuotes: '350',
      wNot: '30',
      demand: '2900',
      clicks: '87',
      competition: 'Низкая',
      commerce: '45%'
    }
  ];

  // Фильтрация таблицы
  const filteredTableRows = React.useMemo(() => {
    let filtered = [...baseTableRows];

    // Фильтр по поисковому запросу
    if (searchQuery) {
      filtered = filtered.filter(row =>
        row.query.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Фильтр корзины
    if (!showBasket) {
      filtered = filtered.filter(row => row.group !== 'Корзина');
    }

    // Применение других фильтров
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(row => {
          const rowValue = row[key as keyof TableRow];
          return rowValue?.toString().toLowerCase().includes(value.toLowerCase());
        });
      }
    });

    return filtered;
  }, [searchQuery, showBasket, filters]);

  return (
    <div className="flex-1 bg-gray-0 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* 1. Блок «Настройки парсинга» */}
        <div className="bg-white rounded-lg p-6">
          <h2 className={cn(typography.blockTitle, 'mb-6')}>
            Настройки парсинга
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <Input
              label="Адрес сайта"
              required
              placeholder="https://example.com"
              value={websiteUrl}
              onChange={setWebsiteUrl}
            />
            <Select
              label="Регион"
              value={region}
              onChange={setRegion}
              options={[
                { value: 'moscow', label: 'Москва' },
                { value: 'spb', label: 'Санкт-Петербург' },
              ]}
            />
          </div>

          <div className="mb-6">
            <h3 className={cn(typography.fieldLabel, 'mb-4')}>
              Конкуренты (до 10 сайтов)
            </h3>
            <div className="space-y-3">
              {competitors.map((competitor, index) => (
                <div key={index} className="lg:w-1/2">
                  <Input
                    placeholder="https://competitor1.com"
                    value={competitor}
                    onChange={(value) => updateCompetitor(index, value)}
                  />
                </div>
              ))}
              {competitors.length < 10 && (
                <button 
                  onClick={addCompetitor}
                  className={cn('text-red-9 font-normal text-base hover:text-red-700', commonClasses.font)}
                >
                  + Добавить конкурента
                </button>
              )}
            </div>
          </div>

          <div>
            <h3 className={cn(typography.fieldLabel, 'mb-4')}>
              Сервисы для сбора семантики
            </h3>
            <div className="flex flex-wrap gap-6">
              <Checkbox
                label="Keys.so"
                checked={selectedServices.keyso}
                onChange={(checked) => handleServiceChange('keyso', checked)}
              />
              <Checkbox
                label="Букварикс"
                checked={selectedServices.bukvarix}
                onChange={(checked) => handleServiceChange('bukvarix', checked)}
              />
              <Checkbox
                label="Яндекс.Метрика (необходима авторизация)"
                checked={selectedServices.yandexMetrika}
                onChange={(checked) => handleServiceChange('yandexMetrika', checked)}
              />
              <Checkbox
                label="Яндекс.Вебмастер (необходима авторизация)"
                checked={selectedServices.yandexWebmaster}
                onChange={(checked) => handleServiceChange('yandexWebmaster', checked)}
              />
              <a href="#" className={cn('text-red-9 font-normal text-base', commonClasses.font)}>
                Ahrefs
              </a>
              <Checkbox
                label="GSC (необходима авторизация)"
                checked={selectedServices.gsc}
                onChange={(checked) => handleServiceChange('gsc', checked)}
              />
            </div>
          </div>
        </div>

        {/* 2. Блок «Ручное добавление запросов» */}
        <div className="bg-white rounded-lg p-6">
          <h2 className={cn(typography.blockTitle, 'mb-6')}>
            Ручное добавление запросов
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className={cn('text-base font-normal text-black block mb-2', commonClasses.font)}>
                Запросы (через запятую или по одному в строке):
              </label>
              <Textarea
                placeholder="купить телефон, смартфон, цена мобильный телефон, планшет, ноутбук"
                value={manualQueries}
                onChange={setManualQueries}
                rows={4}
              />
            </div>
            
            <div>
              <h3 className={cn(typography.fieldLabel, 'mb-3')}>
                Загрузить из файла (.xlsx, .csv):
              </h3>
              <FileUpload
                onFileSelect={setSelectedFile}
                acceptedTypes=".xlsx,.csv"
                selectedFileName={selectedFile?.name}
              />
            </div>

            <Button variant="filled" size="large" className="bg-red-600 hover:bg-red-700 text-white border-red-600">
              + Добавить запросы
            </Button>
          </div>
        </div>

        {/* 3. Блок «Настройки кластеризации» */}
        <div className="bg-white rounded-lg p-6">
          <h2 className={cn(typography.blockTitle, 'mb-6')}>
            Настройки кластеризации
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
            <Select
              label="Поисковая система"
              value={searchEngine}
              onChange={setSearchEngine}
              options={[
                { value: 'yandex', label: 'Яндекс' },
                { value: 'google', label: 'Google' },
              ]}
            />
            <Select
              label="Метод группировки"
              value={groupingMethod}
              onChange={setGroupingMethod}
              options={[
                { value: 'hard', label: 'Хард (для коммерции)' },
                { value: 'soft', label: 'Мягкий' },
              ]}
            />
            <Select
              label="Степень группировки (2-10)"
              value={groupingDegree}
              onChange={setGroupingDegree}
              options={[
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4' },
                { value: '5', label: '5' },
                { value: '6', label: '6' },
                { value: '7', label: '7' },
                { value: '8', label: '8' },
                { value: '9', label: '9' },
                { value: '10', label: '10' },
              ]}
            />
            <Select
              label="Глубина проверки"
              value={checkDepth}
              onChange={setCheckDepth}
              options={[
                { value: '10', label: 'Топ 10' },
                { value: '20', label: 'Топ 20' },
                { value: '30', label: 'Топ 30' },
              ]}
            />
          </div>
          
          <Checkbox
            label="Исключить главные"
            checked={excludeMain}
            onChange={setExcludeMain}
          />
        </div>

        {/* 4. Блок «Настро��ки выгрузки поисковых подсказок» */}
        <div className="bg-white rounded-lg p-6">
          <h2 className={cn(typography.blockTitle, 'mb-6')}>
            Настройки выгрузки поисковых подсказок
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <Select
              label="Метод парсинга"
              value={parsingMethod}
              onChange={setParsingMethod}
              options={[
                { value: 'phrase', label: 'Фраза' },
                { value: 'word', label: 'Слово' },
                { value: 'combination', label: 'Комбинация' },
              ]}
            />
            <Select
              label="Поисковая система"
              value={suggestionsSearchEngine}
              onChange={setSuggestionsSearchEngine}
              options={[
                { value: 'yandex', label: 'Яндекс' },
                { value: 'google', label: 'Google' },
              ]}
            />
            <Select
              label="Глубина парсинга"
              value={parsingDepth}
              onChange={setParsingDepth}
              options={[
                { value: '1', label: '1' },
                { value: '2', label: '2' },
                { value: '3', label: '3' },
              ]}
            />
          </div>
          
          <div className="space-y-3">
            <Checkbox
              label="Исключить порно-подсказки"
              checked={excludePorno}
              onChange={setExcludePorno}
            />
            <Checkbox
              label="Исключить новостные подсказки"
              checked={excludeNews}
              onChange={setExcludeNews}
            />
          </div>
        </div>

        {/* 5. Блок «Настройки чистки» */}
        <div className="bg-white rounded-lg p-6">
          <h2 className={cn(typography.blockTitle, 'mb-6')}>
            Настройки чистки
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Textarea
              label="Стоп-слова"
              placeholder="Введите стоп-слова через запятую или с новой строки"
              value={stopWords}
              onChange={setStopWords}
              rows={4}
            />
            <Textarea
              label="Исключение городов"
              placeholder="Новосибирск, Москва, Санкт-Петербург&#10;Казань, Самара"
              value={cityExclusions}
              onChange={setCityExclusions}
              rows={4}
            />
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className={cn(typography.fieldLabel)}>
                Параметры очистки результатов парсинга
              </h3>
              <Button 
                variant="outline" 
                size="medium"
                onClick={toggleAllCleaning}
              >
                {allSelected ? 'Снять все' : 'Выбрать все'}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <Checkbox
                label="Дубли (удаляет полные дубли фраз)"
                checked={cleaningParams.duplicates}
                onChange={(checked) => handleCleaningParamChange('duplicates', checked)}
              />
              <Checkbox
                label="Цифры (удаляет фразы с цифрами)"
                checked={cleaningParams.numbers}
                onChange={(checked) => handleCleaningParamChange('numbers', checked)}
              />
              <Checkbox
                label="18+ (удаляет adult контент)"
                checked={cleaningParams.adult}
                onChange={(checked) => handleCleaningParamChange('adult', checked)}
              />
              <Checkbox
                label="Стоп-слова (поиск вхождения)"
                checked={cleaningParams.stopWords}
                onChange={(checked) => handleCleaningParamChange('stopWords', checked)}
              />
              <Checkbox
                label="Однословники (удаляет фразы из 1 слова)"
                checked={cleaningParams.singleWords}
                onChange={(checked) => handleCleaningParamChange('singleWords', checked)}
              />
              <Checkbox
                label="Города РФ (чистка по городам России)"
                checked={cleaningParams.citiesRF}
                onChange={(checked) => handleCleaningParamChange('citiesRF', checked)}
              />
              <Checkbox
                label="Латиница (удаляет фразы с латиницей)"
                checked={cleaningParams.latin}
                onChange={(checked) => handleCleaningParamChange('latin', checked)}
              />
              <Checkbox
                label="Прочие символы (знаки препинания)"
                checked={cleaningParams.otherSymbols}
                onChange={(checked) => handleCleaningParamChange('otherSymbols', checked)}
              />
              <Checkbox
                label="Повторы слов (статистика по повторам)"
                checked={cleaningParams.wordRepeats}
                onChange={(checked) => handleCleaningParamChange('wordRepeats', checked)}
              />
            </div>
          </div>
        </div>

        {/* 6. Панель действий */}
        <div className="bg-white rounded-lg p-6">
          <div className="flex flex-wrap gap-3">
            <ActionButton icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" /></svg>} color="red">
              Парсинг
            </ActionButton>
            <ActionButton icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2L3 7v11a1 1 0 001 1h3v-6h6v6h3a1 1 0 001-1V7l-7-5z"/></svg>} color="purple">
              Чистка
            </ActionButton>
            <ActionButton icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>} color="green">
              Выгрузить поисковые подсказки
            </ActionButton>
            <ActionButton icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"/></svg>} color="darkBlue">
              Парсинг частот
            </ActionButton>
            <ActionButton icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/></svg>} color="cyan">
              Загрузка спроса и кликов
            </ActionButton>
            <ActionButton icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"/><path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z"/></svg>} color="orange">
              Проверка конкурентности
            </ActionButton>
            <ActionButton icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/></svg>} color="pink">
              Проверка коммерциализации
            </ActionButton>
            <ActionButton icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"/></svg>} color="teal">
              Кластеризация
            </ActionButton>
            <ActionButton icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/></svg>} color="red">
              Очистить все данные
            </ActionButton>
            <ActionButton icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/></svg>} color="blue">
              Выгрузить сокращенную таблицу в MS Excel
            </ActionButton>
            <ActionButton icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>} color="emerald">
              Выгрузить все данные в MS Excel
            </ActionButton>
          </div>
        </div>

        {/* 7. Блок «Управление таблицей» */}
        <div className="bg-white rounded-lg p-6">
          <h2 className={cn(typography.blockTitle, 'mb-4')}>
            Управление таблицей
          </h2>
          
          <div className="space-y-4 mb-6">
            {/* Перв��й ряд: поиск и основные кнопки */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[250px]">
                <Input
                  placeholder="Поиск по запросу..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                  rightIcon={
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                    </svg>
                  }
                />
              </div>

              <Button
                variant="outline"
                size="medium"
                className="bg-white text-black border-gray-300"
                onClick={() => setShowFilters(!showFilters)}
                leftIcon={
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.628 1.601C2.22 1.601 1.89 1.93 1.89 2.334v1.98c0 .172.06.337.169.465l4.436 5.209v6.781c0 .14.047.278.133.39.173.225.499.264.728.091l2.963-2.226c.197-.148.314-.381.314-.629V9.988l4.436-5.209c.108-.128.169-.293.169-.465v-1.98c0-.404-.331-.735-.735-.735H2.628zM3.628 3.335h12.744v1.09L12.2 9.013c-.108.127-.169.292-.169.464v5.423l-1.963 1.472V9.477c0-.172-.06-.337-.169-.464L5.628 4.425v-1.09z" clipRule="evenodd" />
                  </svg>
                }
              >
                Фильтры
              </Button>

              <Button
                variant="outline"
                size="medium"
                className="bg-gray-200 text-black border-gray-300"
                onClick={resetFilters}
                leftIcon={
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                }
              >
                Сбросить
              </Button>
            </div>

            {/* Второй ряд: действия с выбранными */}
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="medium"
                className="bg-white text-black border-gray-300"
                onClick={toggleBasket}
                leftIcon={
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                }
              >
                {showBasket ? 'Скрыть корзину' : 'Показать корзину'}
              </Button>

              <Button
                variant="outline"
                size="medium"
                className="bg-white text-black border-gray-300"
                leftIcon={
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                }
              >
                В корзину ({selectedTableRows.length})
              </Button>

              <Button
                variant="outline"
                size="medium"
                className="bg-white text-black border-gray-300"
                leftIcon={
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                  </svg>
                }
              >
                В группу ({selectedTableRows.length})
              </Button>
            </div>
          </div>

          {/* Панель фильтров */}
          {showFilters && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 border">
              <h3 className={cn(typography.fieldLabel, 'mb-4')}>
                Фильтры по столбцам
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Input
                  label="Релевантная страница"
                  placeholder="Фильтр..."
                  value={filters.relevantPage}
                  onChange={(value) => handleFilterChange('relevantPage', value)}
                />
                <Input
                  label="Группа"
                  placeholder="Фильтр..."
                  value={filters.group}
                  onChange={(value) => handleFilterChange('group', value)}
                />
                <Input
                  label="Позиция"
                  placeholder="Фильтр..."
                  value={filters.position}
                  onChange={(value) => handleFilterChange('position', value)}
                />
                <Select
                  label="Конкурентность"
                  value={filters.competition}
                  onChange={(value) => handleFilterChange('competition', value)}
                  options={[
                    { value: '', label: 'Все' },
                    { value: 'Низкая', label: 'Низкая' },
                    { value: 'Средняя', label: 'Средняя' },
                    { value: 'Высокая', label: 'Высокая' },
                  ]}
                />
                <Input
                  label="Коммерция"
                  placeholder="Фильтр..."
                  value={filters.commerce}
                  onChange={(value) => handleFilterChange('commerce', value)}
                />
              </div>
            </div>
          )}

          {/* Таблица */}
          <SortableTable
            columns={tableColumns}
            rows={filteredTableRows}
            selectedRows={selectedTableRows}
            onRowSelectionChange={setSelectedTableRows}
          />

          {/* Пагинация */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
            <div className="flex items-center gap-3">
              <span className={cn(typography.bodyText)}>
                Показать по:
              </span>
              <div className="min-w-[80px]">
                <Select
                  value={itemsPerPage}
                  onChange={setItemsPerPage}
                  options={[
                    { value: '25', label: '25' },
                    { value: '50', label: '50' },
                    { value: '100', label: '100' },
                    { value: '500', label: '500' },
                  ]}
                />
              </div>
              <span className={cn(typography.bodyText)}>
                строк на странице
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="medium"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                leftIcon={
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                }
              >
                Назад
              </Button>
              <div className={cn('flex items-center justify-center min-w-[40px] px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded', commonClasses.font)}>
                {currentPage}
              </div>
              <Button
                variant="outline"
                size="medium"
                disabled={filteredTableRows.length === 0}
                onClick={() => setCurrentPage(currentPage + 1)}
                rightIcon={
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                }
              >
                Вперед
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSettingsPage;
