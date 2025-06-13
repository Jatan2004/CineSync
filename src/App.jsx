import { useEffect, useState } from 'react'
import Search from './components/Search.jsx'
import Spinner from './components/Spinner.jsx'
import MovieCard from './components/MovieCard.jsx'
import TVCard from './components/TVCard.jsx'
import { useDebounce } from 'react-use'
import { getTrendingMovies, updateSearchCount } from './appwrite.js'

const API_BASE_URL = 'https://api.themoviedb.org/3';

const MOVIE_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TV_API_KEY = import.meta.env.VITE_TMDB_TV_API_KEY;

const getApiOptions = (key) => ({
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${key}`
  }
});

const App = () => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [searchTerm, setSearchTerm] = useState('');

  const [movieList, setMovieList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingTV, setTrendingTV] = useState([]); // new

  const [isTVMode, setIsTVMode] = useState(false);

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  const fetchContent = async (query = '', isTV = false) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const type = isTV ? 'tv' : 'movie';
      const key = isTV ? TV_API_KEY : MOVIE_API_KEY;
      const options = getApiOptions(key);

      const endpoint = query
        ? `${API_BASE_URL}/search/${type}?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/${type}?sort_by=popularity.desc`;

      const response = await fetch(endpoint, options);

      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }

      const data = await response.json();

      if (data.Response === 'False') {
        setErrorMessage(data.Error || 'Failed to fetch content');
        setMovieList([]);
        return;
      }

      setMovieList(data.results || []);

      if (query && data.results.length > 0 && !isTV) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error(`Error fetching content: ${error}`);
      setErrorMessage('Error fetching content. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  }

  const loadTrendingTV = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/trending/tv/week`, getApiOptions(TV_API_KEY));
      const data = await res.json();

      if (data?.results?.length > 0) {
        const formatted = data.results.map(tv => ({
          id: tv.id,
          name: tv.name,
          poster_url: `https://image.tmdb.org/t/p/w300${tv.poster_path}`
        }));
        setTrendingTV(formatted);
      }
    } catch (error) {
      console.error('Error fetching trending TV shows:', error);
    }
  }

  useEffect(() => {
    fetchContent(debouncedSearchTerm, isTVMode);
  }, [debouncedSearchTerm, isTVMode]);

  useEffect(() => {
    loadTrendingMovies();
    loadTrendingTV();
  }, []);

  return (
    <main>
      <div className="pattern" />

      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1>Find <span className="text-gradient">{isTVMode ? 'TV Shows' : 'Movies'}</span> You'll Enjoy Without the Hassle</h1>

          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

          <div className="toggle-buttons mt-4 flex gap-4">
            <button
              className={`px-4 py-2 rounded ${!isTVMode ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}
              onClick={() => setIsTVMode(false)}
            >
              Movies
            </button>
            <button
              className={`px-4 py-2 rounded ${isTVMode ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}
              onClick={() => setIsTVMode(true)}
            >
              TV Shows
            </button>
          </div>
        </header>

        {/* Trending Movies */}
        {trendingMovies.length > 0 && !isTVMode && (
          <section className="trending">
            <h2>Trending Movies</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Trending TV */}
        {trendingTV.length > 0 && isTVMode && (
          <section className="trending">
            <h2>Trending TV Shows</h2>
            <ul>
              {trendingTV.map((tv, index) => (
                <li key={tv.id}>
                  <p>{index + 1}</p>
                  <img src={tv.poster_url} alt={tv.name} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* All Content */}
        <section className="all-movies">
          <h2>{isTVMode ? 'All TV Shows' : 'All Movies'}</h2>

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((item) =>
                isTVMode ? (
                  <TVCard key={item.id} movie={item} apiToken={TV_API_KEY} />
                ) : (
                  <MovieCard key={item.id} movie={item} apiToken={MOVIE_API_KEY} />
                )
              )}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}

export default App
