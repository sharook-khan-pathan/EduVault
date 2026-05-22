import { useState, useCallback } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { EmptyState } from '../../components/common/UI';
import MaterialCard from '../../components/common/MaterialCard';
import { materialApi } from '../../api/services';
import { FiSearch } from 'react-icons/fi';

function useDebounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = async (q) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true);
    setSearched(true);
    try {
      const res = await materialApi.search(q);
      setResults(res.data.data?.content || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    (() => {
      let timer;
      return (q) => {
        clearTimeout(timer);
        timer = setTimeout(() => doSearch(q), 400);
      };
    })(),
    []
  );

  const handleChange = (e) => {
    setQuery(e.target.value);
    debouncedSearch(e.target.value);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Search Materials</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Find any study material instantly</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            className="input pl-12 py-4 text-lg"
            placeholder="Search by title, description, subject..."
            value={query}
            onChange={handleChange}
            autoFocus
          />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          )}
        </div>

        {/* Results */}
        {!searched ? (
          <div className="text-center py-16">
            <FiSearch className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
            <p className="text-gray-500 dark:text-gray-400">Start typing to search materials</p>
            <p className="text-sm text-gray-400 mt-1">Search by title, description, or subject name</p>
          </div>
        ) : results.length === 0 && !loading ? (
          <EmptyState icon={FiSearch} title="No results found"
            description={`No materials found for "${query}". Try different keywords.`} />
        ) : (
          <div>
            {results.length > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
              </p>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              {results.map(m => <MaterialCard key={m.id} material={m} />)}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
