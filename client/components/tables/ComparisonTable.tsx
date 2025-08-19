import React from 'react';
import { cn } from '@/lib/utils';

interface CompetitorResult {
  url: string;
  word_count_in_a?: number;
  word_count_outside_a?: number;
  text_fragments_count?: number;
  total_visible_words?: number;
}

interface SiteAnalysis {
  word_count_in_a?: number;
  word_count_outside_a?: number;
  text_fragments_count?: number;
  total_visible_words?: number;
}

interface ComparisonTableProps {
  results: CompetitorResult[];
  selectedCompetitors: string[];
  mySiteAnalysis: SiteAnalysis | null;
  medianMode: boolean;
  onGoToLSI: () => void;
  lsiLoading: boolean;
  lsiProgress: number;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  results,
  selectedCompetitors,
  mySiteAnalysis,
  medianMode,
  onGoToLSI,
  lsiLoading,
  lsiProgress
}) => {
  if (!selectedCompetitors.length || !mySiteAnalysis || !results) {
    return null;
  }

  const selectedResults = results.filter(result => 
    selectedCompetitors.includes(result.url)
  );
  
  if (selectedResults.length === 0) return null;

  let targetInA: number;
  let targetOutsideA: number;
  let targetFragments: number;
  let targetTotal: number;

  // Расчет по обычному среднему
  targetInA = Math.round(
    selectedResults.reduce((sum, r) => sum + (r.word_count_in_a || 0), 0) /
    selectedResults.length
  );
  targetOutsideA = Math.round(
    selectedResults.reduce((sum, r) => sum + (r.word_count_outside_a || 0), 0) /
    selectedResults.length
  );
  targetFragments = Math.round(
    selectedResults.reduce((sum, r) => sum + (r.text_fragments_count || 0), 0) /
    selectedResults.length
  );
  targetTotal = Math.round(
    selectedResults.reduce((sum, r) => sum + (r.total_visible_words || 0), 0) /
    selectedResults.length
  );

  const ourInA = mySiteAnalysis.word_count_in_a || 0;
  const ourOutsideA = mySiteAnalysis.word_count_outside_a || 0;
  const ourFragments = mySiteAnalysis.text_fragments_count || 0;
  const ourTotal = mySiteAnalysis.total_visible_words || 0;

  const getDomainFromUrl = (url: string): string => {
    return url
      .replace('https://', '')
      .replace('http://', '')
      .split('/')[0];
  };

  return (
    <div className="mt-8 bg-white rounded-lg border">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="font-medium">Этап оптимизации</h3>
        <p className="text-sm text-gray-600 mt-1">
          Не стремитесь сразу сделать 100%, чтобы осталось место для добавления слов, задающих тематику (LSI)
        </p>
      </div>
      
      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-800 text-white">
                <th className="text-left py-3 px-4 font-medium min-w-[200px]">
                  Конкурент
                </th>
                <th className="text-center py-3 px-4 font-medium min-w-[140px]">
                  Слова в теге &lt;a&gt;
                </th>
                <th className="text-center py-3 px-4 font-medium min-w-[160px]">
                  Слова вне тега &lt;a&gt;
                </th>
                <th className="text-center py-3 px-4 font-medium min-w-[150px]">
                  Текстовые фрагменты
                </th>
                <th className="text-center py-3 px-4 font-medium min-w-[180px]">
                  Общее количество слов
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b bg-blue-50">
                <td className="py-3 px-4 text-sm font-medium text-blue-800">
                  Наш сайт
                </td>
                <td className="py-3 px-4 text-center text-sm font-medium text-blue-800">
                  {ourInA}
                </td>
                <td className="py-3 px-4 text-center text-sm font-medium text-blue-800">
                  {ourOutsideA}
                </td>
                <td className="py-3 px-4 text-center text-sm font-medium text-blue-800">
                  {ourFragments}
                </td>
                <td className="py-3 px-4 text-center text-sm font-medium text-blue-800">
                  {ourTotal}
                </td>
              </tr>

              {selectedResults.map((result, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 whitespace-nowrap overflow-hidden text-ellipsis block max-w-xs"
                      title={result.url}
                    >
                      {getDomainFromUrl(result.url)}
                    </a>
                  </td>
                  <td className="py-3 px-4 text-center text-sm">
                    {result.word_count_in_a || 0}
                  </td>
                  <td className="py-3 px-4 text-center text-sm">
                    {result.word_count_outside_a || 0}
                  </td>
                  <td className="py-3 px-4 text-center text-sm">
                    {result.text_fragments_count || 0}
                  </td>
                  <td className="py-3 px-4 text-center text-sm">
                    {result.total_visible_words || 0}
                  </td>
                </tr>
              ))}

              <tr className="border-b bg-gray-100">
                <td className="py-3 px-4 text-sm font-medium">
                  {medianMode ? 'Усеченное среднее' : 'Среднее'}
                </td>
                <td className="py-3 px-4 text-center text-sm font-medium">
                  {targetInA}
                </td>
                <td className="py-3 px-4 text-center text-sm font-medium">
                  {targetOutsideA}
                </td>
                <td className="py-3 px-4 text-center text-sm font-medium">
                  {targetFragments}
                </td>
                <td className="py-3 px-4 text-center text-sm font-medium">
                  {targetTotal}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="min-w-[200px] px-4"></td>
                  <td className="min-w-[140px] px-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-2 text-center">
                        Слова в теге &lt;a&gt;
                      </div>
                      {medianMode && (
                        <div className="text-xs text-gray-500 mt-1 text-center">
                          (усеч. среднее)
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="min-w-[160px] px-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-2 text-center">
                        Слова вне тега &lt;a&gt;
                      </div>
                      {medianMode && (
                        <div className="text-xs text-gray-500 mt-1 text-center">
                          (усеч. среднее)
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="min-w-[150px] px-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-2 text-center">
                        Текстовые фрагменты
                      </div>
                      {medianMode && (
                        <div className="text-xs text-gray-500 mt-1 text-center">
                          (усеч. среднее)
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="min-w-[180px] px-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-2 text-center">
                        Общее количество слов
                      </div>
                      {medianMode && (
                        <div className="text-xs text-gray-500 mt-1 text-center">
                          (усеч. среднее)
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <button
              onClick={onGoToLSI}
              disabled={lsiLoading || lsiProgress > 0}
              className={cn(
                'px-6 py-3 rounded-md font-medium transition-colors',
                'bg-red-600 text-white hover:bg-red-700',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'inline-flex items-center justify-center gap-2'
              )}
            >
              {lsiLoading || lsiProgress > 0 ? (
                <>
                  <span className="inline-block animate-spin">⏳</span>
                  <span>Анализ LSI...</span>
                </>
              ) : (
                'Перейти к LSI'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};