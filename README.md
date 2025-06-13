# 🎬 CineSync

**CineSync** is a responsive movie and TV show discovery web app built using **React**, **Tailwind CSS**, and the **TMDB API**.
It allows users to search for trending movies or TV shows, preview episode trailers, toggle light/dark mode, and seamlessly switch between movies and TV content.


## 🌟 Features

- 🔍 **Search Functionality**: Find any movie or TV show using real-time search powered by TMDB.
- 🎞 **Trending Section**: Displays the most popular Movies or TV Shows of the week.
- 🎥 **Detailed Cards**: Preview ratings, year, language, and thumbnails for each item.
- 📺 **TV & Movie Toggle**: Seamlessly switch between browsing movies or TV shows.
- 📈 **Search Count Tracking** *(via Appwrite)*: Tracks how many times each movie was searched.
- ⚡ **Responsive UI**: Works perfectly on mobile, tablet, and desktop screens.

---

## 🛠 Tech Stack

- **Frontend**:  
  - React.js  
  - Tailwind CSS  
  - Vite  
  - Appwrite (for tracking search analytics)

- **APIs**:  
  - TMDB API for fetching movie/TV show data.

🧪 Getting Started
1. Clone the Repository
git clone https://github.com/your-username/cinesync.git
cd cinesync

2. Install Dependencies
npm install
3. Setup Environment Variables
Create a .env file in the root directory and add:

env
VITE_TMDB_API_KEY=your_tmdb_movie_api_key
VITE_TMDB_TV_API_KEY=your_tmdb_tv_api_key

💡 You can get these API keys from https://www.themoviedb.org/settings/api

🚀 Run Locally
npm run dev
