import React, { useState, useEffect } from 'react';

const fallbackTypes = ['Trailer', 'Teaser', 'Clip', 'Featurette', 'Behind the Scenes'];

const TVCard = ({ movie, apiToken }) => {
  const {
    name,
    vote_average,
    poster_path,
    first_air_date,
    original_language,
    overview,
    genre_names,
    id,
  } = movie;

  const [isFavorite, setIsFavorite] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [seasons, setSeasons] = useState([]);
  const [trailerOptions, setTrailerOptions] = useState([]);
  const [selectedTrailerKey, setSelectedTrailerKey] = useState(null);

  const toggleOpen = () => setIsOpen((prev) => !prev);
  const toggleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorite((fav) => !fav);
  };

  const getFallbackTrailer = (videos) => {
    for (let type of fallbackTypes) {
      const video = videos.find((v) => v.type === type && v.site === 'YouTube');
      if (video) return video;
    }
    return null;
  };

  const fetchTrailer = async (e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`https://api.themoviedb.org/3/tv/${id}/videos`, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          accept: 'application/json',
        },
      });
      const data = await res.json();
      const videos = data.results.filter((v) => v.site === 'YouTube');
      const bestMatch = getFallbackTrailer(videos);

      if (bestMatch) {
        setTrailerOptions(videos);
        setSelectedTrailerKey(bestMatch.key);
        setShowModal(true);
      } else {
        alert('No video available');
      }
    } catch (err) {
      console.error('Error fetching trailer:', err);
    }
  };

  const fetchSeasonTrailer = async (e, seasonNumber) => {
    e.stopPropagation();
    try {
      const res = await fetch(`https://api.themoviedb.org/3/tv/${id}/season/${seasonNumber}/videos`, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          accept: 'application/json',
        },
      });
      const data = await res.json();
      const videos = data.results.filter((v) => v.site === 'YouTube');
      const bestMatch = getFallbackTrailer(videos);

      if (bestMatch) {
        setTrailerOptions(videos);
        setSelectedTrailerKey(bestMatch.key);
        setShowModal(true);
      } else {
        alert(`No trailer available for season ${seasonNumber}`);
      }
    } catch (err) {
      console.error(`Error fetching trailer for season ${seasonNumber}:`, err);
    }
  };

  const fetchSeasons = async () => {
    try {
      const res = await fetch(`https://api.themoviedb.org/3/tv/${id}`, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          accept: 'application/json',
        },
      });
      const data = await res.json();
      setSeasons(data.seasons || []);
    } catch (error) {
      console.error('Error fetching seasons:', error);
    }
  };

  useEffect(() => {
    if (isOpen && seasons.length === 0) {
      fetchSeasons();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = showModal ? 'hidden' : 'auto';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [showModal]);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={toggleOpen}
        onKeyDown={(e) => e.key === 'Enter' && toggleOpen()}
        className={`relative bg-gradient-to-br from-[#030014] to-[#1C0331] p-5 rounded-2xl shadow-inner shadow-light-100/10 transition-transform transform ${
          isOpen ? 'scale-105' : 'scale-100'
        }`}
      >
        <img
          className="w-full rounded-lg object-cover"
          src={
            poster_path
              ? `https://image.tmdb.org/t/p/w300/${poster_path}`
              : '/no-movie.png'
          }
          alt={name}
          loading="lazy"
        />

        <div className="mt-4 flex justify-between items-center">
          <h3 className="text-white font-bold text-base line-clamp-1">{name}</h3>
          <button
            type="button"
            onClick={toggleFavorite}
            className="text-xl focus:outline-none text-light-200"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? '💖' : '🤍'}
          </button>
        </div>

        {isOpen && (
          <div className="absolute inset-0 bg-[#AB8BFF]/30 backdrop-blur-lg p-5 rounded-2xl overflow-y-auto z-20">
            <div className="space-y-3 max-h-full">
              <p className="text-sm text-white">
                <span className="font-semibold">Year:</span> {first_air_date?.split('-')[0] || 'N/A'}
              </p>
              <p className="text-sm text-white flex items-center">
                <span className="font-semibold mr-1">Rating:</span>
                <img src="/star.svg" alt="Star" className="inline-block w-4 h-4 mr-1" />
                {vote_average?.toFixed(1) || 'N/A'}
              </p>
              <p className="text-sm text-white capitalize">
                <span className="font-semibold">Lang:</span> {original_language || 'N/A'}
              </p>
              {genre_names && (
                <p className="text-sm text-white">
                  <span className="font-semibold">Genres:</span> {genre_names.join(', ')}
                </p>
              )}
              <p className="text-sm text-white line-clamp-3">
                {overview || 'No description available.'}
              </p>

              <button
                type="button"
                onClick={fetchTrailer}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-[#000000] text-white rounded-lg shadow-lg"
              >
                ▶️ Watch Trailer
              </button>

              {seasons.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-white font-bold text-lg mb-4 border-b border-white/20 pb-1">
                    📺 Seasons
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2">
                    {seasons.map((season) => (
                      <div
                        key={season.id}
                        className="rounded-xl p-3 bg-white/10 backdrop-blur-md border border-white/20 hover:scale-105 transition-transform"
                      >
                        <p className="text-white font-semibold text-sm mb-2">{season.name}</p>
                        {season.poster_path && (
                          <img
                            src={`https://image.tmdb.org/t/p/w200${season.poster_path}`}
                            alt={season.name}
                            className="rounded-md w-full mb-2"
                          />
                        )}
                        <div className="flex flex-col text-xs text-white/80 space-y-1">
                          <span className="bg-black/30 rounded-full px-2 py-0.5 inline-block">
                            🎞 {season.episode_count} Episodes
                          </span>
                          <span>📅 {season.air_date || 'No Air Date'}</span>
                        </div>
                        <button
                          onClick={(e) => fetchSeasonTrailer(e, season.season_number)}
                          className="mt-3 w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs px-3 py-1 rounded-full shadow hover:shadow-md"
                        >
                          ▶️ Watch Season Trailer
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showModal && selectedTrailerKey && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-[#111] p-4 rounded-xl shadow-xl w-[90%] max-w-3xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-white text-2xl"
            >
              ✖
            </button>
            <div className="aspect-video w-full mb-4">
              <iframe
                className="w-full h-full rounded-lg"
                src={`https://www.youtube.com/embed/${selectedTrailerKey}?autoplay=1`}
                title={`${name} Trailer`}
                frameBorder="0"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
            {trailerOptions.length > 1 && (
              <select
                onChange={(e) => setSelectedTrailerKey(e.target.value)}
                className="w-full bg-black text-white px-3 py-2 rounded-md text-sm"
                value={selectedTrailerKey}
              >
                {trailerOptions.map((trailer) => (
                  <option key={trailer.id} value={trailer.key}>
                    {trailer.type} - {trailer.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default TVCard;
