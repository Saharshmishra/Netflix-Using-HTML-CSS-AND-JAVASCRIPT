// home.js
const search = document.getElementById('search');
const form = document.getElementById('form');
const main = document.querySelector('.main');

// ✅ Search Event: Listen for Enter key on form submit
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const searchTerm = search.value.trim();
    if (searchTerm) {
        try {
            const res = await fetch(searchURL + '&query=' + encodeURIComponent(searchTerm));
            const data = await res.json();

            main.innerHTML = ''; // Clear previous content
            if (data.results.length > 0) {
                makeMovieSection(data.results, `Search results for "${searchTerm}"`);
            } else {
                const noResults = document.createElement('p');
                noResults.textContent = `No results found for "${searchTerm}"`;
                noResults.classList.add('no-results');
                main.appendChild(noResults);
            }
        } catch (err) {
            console.error("Error searching movies:", err);
        }
    }
});



// Fetch and display all genres
const loadGenres = async () => {
    try {
        const res = await fetch(genres_list_http + new URLSearchParams({ api_key }));
        const data = await res.json();

        data.genres.forEach(genre => {
            fetchMoviesByGenre(genre.id, genre.name);
        });
    } catch (err) {
        console.error("Error loading genres:", err);
    }
};

const fetchMoviesByGenre = async (id, genre) => {
    try {
        const res = await fetch(movie_genres_http + new URLSearchParams({
            api_key: api_key,
            with_genres: id,
            page: Math.floor(Math.random() * 3) + 1
        }));
        const data = await res.json();

        makeMovieSection(data.results, genre);
    } catch (err) {
        console.error(`Error fetching movies for genre ${genre}:`, err);
    }
};

const makeMovieSection = (movies, genre) => {
    const section = document.createElement('div');
    section.classList.add('movie-list');

    const title = document.createElement('h2');
    title.classList.add('heading');
    title.textContent = genre;

    // Scroll buttons
    const leftBtn = document.createElement('button');
    leftBtn.classList.add('scroll-btn', 'left');
    leftBtn.innerHTML = '&#10094;';

    const rightBtn = document.createElement('button');
    rightBtn.classList.add('scroll-btn', 'right');
    rightBtn.innerHTML = '&#10095;';

    const container = document.createElement('div');
    container.classList.add('movie-container');

    movies.forEach(movie => {
        if (!movie.backdrop_path) return;

        const div = document.createElement('div');
        div.classList.add('movie');
        div.innerHTML = `
            <img src="${img_url + movie.backdrop_path}" alt="">
            <p class="movie-title">${movie.title}</p>
        `;
        div.addEventListener('click', () => {
            location.href = `about.html?id=${movie.id}`;
        });

        container.appendChild(div);
    });

    // Scroll functionality
    leftBtn.addEventListener('click', () => {
        container.scrollBy({ left: -600, behavior: 'smooth' });
    });
    rightBtn.addEventListener('click', () => {
        container.scrollBy({ left: 600, behavior: 'smooth' });
    });

    section.appendChild(title);
    section.appendChild(leftBtn);
    section.appendChild(container);
    section.appendChild(rightBtn);
    document.querySelector('.main').appendChild(section);
};


// Initialize
loadGenres();
