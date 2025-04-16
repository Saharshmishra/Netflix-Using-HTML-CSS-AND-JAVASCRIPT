const movie_id = new URLSearchParams(window.location.search).get("id");

// ✅ Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    init();

    // ✅ Set up search form listener
    const form = document.getElementById("form");
    form?.addEventListener("submit", (e) => {
        e.preventDefault();
        const query = document.getElementById("search").value.trim();
        if (query) {
            fetchSearchResults(query);
        }
    });
});

const init = async () => {
    if (!movie_id) {
        console.warn("No movie ID in URL.");
        document.querySelector('.movie-name').textContent = "Movie Not Found";
        document.querySelector('.des').textContent = "Please select a movie from the homepage.";
        return;
    }

    try {
        const [movieRes, creditsRes, videosRes, recsRes] = await Promise.all([
            fetch(`${movie_detail_http}/${movie_id}?` + new URLSearchParams({ api_key })),
            fetch(`${movie_detail_http}/${movie_id}/credits?` + new URLSearchParams({ api_key })),
            fetch(`${movie_detail_http}/${movie_id}/videos?` + new URLSearchParams({ api_key })),
            fetch(`${movie_detail_http}/${movie_id}/recommendations?` + new URLSearchParams({ api_key }))
        ]);

        const movieData = await movieRes.json();
        const creditsData = await creditsRes.json();
        const videosData = await videosRes.json();
        const recsData = await recsRes.json();

        setupMovieInfo(movieData);
        setupCast(creditsData.cast);
        setupVideos(videosData.results);
        setupRecommendations(recsData.results);

    } catch (err) {
        console.error("Error loading movie data:", err);
    }
};

const setupMovieInfo = (data) => {
    const title = document.querySelector('title');
    const movieName = document.querySelector('.movie-name');
    const genres = document.querySelector('.genres');
    const des = document.querySelector('.des');
    const backdrop = document.querySelector('.movie-info');

    title.innerText = movieName.innerText = data.title;
    genres.innerText = `${data.release_date?.split('-')[0]} | ${data.genres.map(g => g.name).join(', ')}`;
    if (data.adult) genres.innerText += ' | +18';

    des.innerText = data.overview?.substring(0, 200) + '...';
    backdrop.style.backgroundImage = `url(${original_img_url}${data.backdrop_path || data.poster_path})`;
};

const setupCast = (castData) => {
    const cast = document.querySelector('.starring');
    const topCast = castData.slice(0, 5).map(c => c.name).join(', ');
    cast.innerHTML = `<strong>Starring: </strong>${topCast}`;
};

const setupVideos = (videos) => {
    const container = document.querySelector('.trailer-container');
    if (!videos.length) {
        container.innerHTML = `<p>No trailers available.</p>`;
        return;
    }
    const topVideos = videos.slice(0, 4);
    topVideos.forEach(video => {
        container.innerHTML += `
            <iframe src="https://www.youtube.com/embed/${video.key}" 
                    title="YouTube video player" frameborder="0" 
                    allow="autoplay; encrypted-media" allowfullscreen></iframe>
        `;
    });
};

const setupRecommendations = (movies) => {
    const container = document.querySelector('.recommendations-container');
    container.innerHTML = ''; // Clear if reloaded
    let count = 0;
    let i = 0;
    while (count < 16 && i < movies.length) {
        const movie = movies[i++];
        if (!movie.backdrop_path) continue;

        container.innerHTML += `
            <div class="movie" onclick="location.href='about.html?id=${movie.id}'">
                <img src="${img_url}${movie.backdrop_path}" alt="">
                <p class="movie-title">${movie.title}</p>
            </div>
        `;
        count++;
    }
};

// Optional: Smooth scroll for recs
function scrollRecommendations(direction) {
    const container = document.querySelector('.recommendations-container');
    const scrollAmount = 300;
    container.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
    });
}

// ✅ Search functionality
const fetchSearchResults = async (query) => {
    try {
        const res = await fetch(`${search_http}?` + new URLSearchParams({
            api_key,
            query
        }));
        const data = await res.json();
        showSearchResults(data.results);
    } catch (err) {
        console.error("Search fetch error:", err);
    }
};

const showSearchResults = (results) => {
    let section = document.querySelector(".search-results-section");
    let container = document.querySelector(".search-results-container");

    if (!section) {
        section = document.createElement("div");
        section.classList.add("search-results-section");
        section.innerHTML = `
            <h1 class="heading">Search Results</h1>
            <div class="search-results-container"></div>
        `;
        document.body.appendChild(section);
        container = section.querySelector(".search-results-container");
    }

    section.style.display = "block";
    container.innerHTML = "";

    if (!results.length) {
        container.innerHTML = "<p>No results found.</p>";
        return;
    }

    results.forEach(movie => {
        if (!movie.backdrop_path) return;
        container.innerHTML += `
            <div class="movie" onclick="location.href='about.html?id=${movie.id}'">
                <img src="${img_url}${movie.backdrop_path}" alt="${movie.title}">
                <p class="movie-title">${movie.title}</p>
            </div>
        `;
    });
};
