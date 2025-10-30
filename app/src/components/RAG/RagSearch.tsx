import { useState } from 'react';
import { Card } from '@solai/app/components/ui/Card';
import { Button } from '@solai/app/components/ui/Button';
import { searchRagDocuments, RagDocument } from '@solai/app/lib/api-client';
import { Search, FileText, ExternalLink, Loader2 } from 'lucide-react';

interface RagSearchProps {
  className?: string;
}

export const RagSearch = ({ className }: RagSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RagDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setSearched(true);
      const data = await searchRagDocuments({ query, top_k: 5 });
      setResults(data.results);
    } catch (err: any) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const highlightText = (text: string, query: string): string => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-emerald-500/30 text-emerald-300">$1</mark>');
  };

  const handleQuickSearch = (quickQuery: string) => {
    setQuery(quickQuery);
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  const quickSearches = [
    'How to provide liquidity on Raydium?',
    'Jupiter swap fees',
    'Marinade staking rewards',
    'DeFi yield farming strategies',
  ];

  return (
    <Card className={className}>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            Documentation Search
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Search through DeFi protocol documentation using AI-powered RAG
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask anything about Solana DeFi protocols..."
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Search'
              )}
            </Button>
          </div>
        </form>

        {/* Quick Searches */}
        {!searched && (
          <div className="mb-6">
            <p className="text-sm text-[var(--text-secondary)] mb-3">Try these:</p>
            <div className="flex flex-wrap gap-2">
              {quickSearches.map((qs, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickSearch(qs)}
                  className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-sm text-slate-300 hover:text-white transition-colors border border-slate-700 hover:border-slate-600"
                >
                  {qs}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-4" />
            <p className="text-slate-400">Searching documentation...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-4 rounded-lg bg-red-900/20 border border-red-700 text-red-400">
            <p className="font-medium mb-1">Search failed</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* No Results */}
        {searched && !loading && !error && results.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No results found</p>
            <p className="text-sm text-slate-500 mt-2">Try a different search query</p>
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[var(--text-secondary)]">
                Found {results.length} result{results.length !== 1 ? 's' : ''}
              </p>
            </div>

            {results.map((result, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 hover:border-slate-600 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      {result.metadata.title && (
                        <h3 className="font-semibold text-white">
                          {result.metadata.title}
                        </h3>
                      )}
                      {result.metadata.source && (
                        <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300">
                          {result.metadata.source}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-slate-400">
                      {(result.score * 100).toFixed(0)}% match
                    </div>
                    {result.metadata.url && (
                      <a
                        href={result.metadata.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                <div
                  className="text-sm text-slate-300 leading-relaxed line-clamp-3"
                  dangerouslySetInnerHTML={{
                    __html: highlightText(result.content, query),
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
