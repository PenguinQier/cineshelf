const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Fetches movies from the API based on search criteria
 * @param {string} searchQuery - The search query (searches across title, description, genres, and IMDb ID)
 * @param {number} page - The page number for pagination
 * @param {number} limit - The number of results per page
 * @returns {Object} - Object containing movies array, totalResults, totalPages, and currentPage
 */
export const fetchMovies = async (searchQuery = '', page = 1, limit = 3) => {
  try {
    const url = `${API_BASE_URL}/movies?search=${encodeURIComponent(searchQuery)}&page=${page}&limit=${limit}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching movies:', error);
    return {
      movies: [],
      totalResults: 0,
      totalPages: 0,
      currentPage: 1
    };
  }
};