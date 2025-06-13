import React, { useState } from 'react';

const MovieCard = ({ movie }) => {
  const {
    title,
    vote_average,
    poster_path,
    release_date,
    original_language,
    overview,
    genre_names,
    id,
  } = movie;

  const [isFavorite, setIsFavorite] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const toggleOpen = () => setIsOpen(open => !open);
  const toggleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorite(fav => !fav);
  };

  const fetchTrailer = async (e) => {
    e.stopPropagation();

    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${id}/videos`,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`,
            accept: 'application/json',
          },
        }
      );

      const data = await res.json();

      const trailer = data.results.find(
        (video) => video.type === 'Trailer' && video.site === 'YouTube'
      );

      if (trailer) {
        setTrailerKey(trailer.key);
        setShowModal(true);
      } else {
        alert('Trailer not available');
      }
    } catch (err) {
      console.error('Error fetching trailer:', err);
    }
  };

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
        {/* Poster */}
        <img
          className="w-full rounded-lg object-cover"
          src={
            poster_path
              ? `https://image.tmdb.org/t/p/w300/${poster_path}`
              : '/no-movie.png'
          }
          srcSet={
            poster_path
              ? `https://image.tmdb.org/t/p/w300/${poster_path} 300w, https://image.tmdb.org/t/p/w500/${poster_path} 500w, https://image.tmdb.org/t/p/w780/${poster_path} 780w`
              : ''
          }
          sizes="(max-width: 400px) 100vw, 200px"
          loading="lazy"
          alt={title}
        />

        {/* Title + Favorite */}
        <div className="mt-4 flex justify-between items-center">
          <h3 className="text-white font-bold text-base line-clamp-1">{title}</h3>
          <button
            type="button"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            onClick={toggleFavorite}
            className="text-xl focus:outline-none text-light-200"
          >
            {isFavorite ? '💖' : '🤍'}
          </button>
        </div>

        {/* Overlay Details */}
        {isOpen && (
          <div className="absolute inset-0 bg-[#AB8BFF]/30 backdrop-blur-lg p-5 rounded-2xl transition-transform duration-300 ease-in-out overflow-y-auto">
            <div className="space-y-3 max-h-full">
              <p className="text-sm text-white">
                <span className="font-semibold">Year:</span> {release_date?.split('-')[0] || 'N/A'}
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
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#000000] text-white rounded-lg shadow-lg focus:outline-none"
              >
                ▶️ Watch Trailer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && trailerKey && (
        <div
        className="fixed inset-0 flex items-center justify-center z-50 bg-cover bg-center backdrop-blur"
        style={{ backgroundImage: `url('/hero-bg.png')` }}
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
            <div className="aspect-video w-full">
              <iframe
                className="w-full h-full rounded-lg"
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                title={`${title} Trailer`}
                frameBorder="0"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MovieCard;
