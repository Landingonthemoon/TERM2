document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/movies')
    .then((response) => response.json())
    .then((data) => {
      const moviesList = document.getElementById('moviesList')
      moviesList.innerHTML = data.results
        .map(
          (movie) => `
      <div class="movie">
        <h3>${movie.title}</h3>
        <img src="${movie.poster}" alt="${movie.title} Poster"> <!-- 수정된 부분: ${movie.poster}를 사용 -->
      </div>
      `
        )
        .join('')
    })
    .catch((error) => console.error('Error:', error))

  // Celebrity 정보 불러오기
  fetch('/api/celebrity')
    .then((response) => response.json())
    .then((data) => {
      const celebrityList = document.getElementById('celebrity')
      celebrityList.innerHTML = data.actors
        .map(
          (actor) => `
      <div class="actor">
        <h3>${actor.name}</h3>
        <p>Height: ${actor.height}</p>
        <p>Birthday: ${actor.birthday}</p>
        <p>Movies: ${actor.movies.join(', ')}</p>
      </div>
    `
        )
        .join('')
    })
    .catch((error) => console.error('Error:', error))
})

// SPAs
document.addEventListener('DOMContentLoaded', () => {
  navigateTo(window.location.hash || '#/') // Hash 기반 경로를 사용하여 초기 경로 설정

  window.addEventListener('hashchange', () => navigateTo(window.location.hash)) // URL의 hash가 변경될 때 마다 navigateTo 함수를 호출
})

// Celebrity 정보를 불러오는 로직 구현
let globalCelebrities = []

function fetchCelebrities () {
  fetch('/api/celebrity')
    .then((response) => response.json())
    .then((data) => {
      globalCelebrities = data.actors // 전역 변수에 저장
      const celebrityList = document.getElementById('celebrity')
      celebrityList.innerHTML = data.actors
        .map(
          (actor) => `
            <div class="actor">
                <h3>${actor.name}</h3>
                <p>Height: ${actor.height}</p>
                <p>Birthday: ${actor.birthday}</p>
                <p>Movies: ${actor.movies.join(', ')}</p>
            </div>
          `
        )
        .join('')
    })
    .catch((error) => console.error('Error:', error))
}

// 영화사이트로 이동
function fetchMovieDetails (movieId) {
  fetch(`/api/movies/${movieId}`)
    .then((response) => response.json())
    .then((movieData) => {
      // 영화 상세 정보 표시
      const moviesList = document.getElementById('moviesList')
      moviesList.innerHTML = `
            <div class="movie-details">
                <h3>${movieData.title}</h3>
                <img src="${movieData.poster}" alt="${movieData.title} Poster">
                <p>${movieData.overview}</p>
            </div>
          `

      // 연관된 연예인 정보 표시
      const relatedCelebrities = globalCelebrities.filter((actor) =>
        actor.movies.includes(movieData.title)
      )
      const celebrityList = document.getElementById('celebrity')
      celebrityList.innerHTML = relatedCelebrities
        .map(
          (actor) => `
            <div class="actor">
                <h3>${actor.name}</h3>
                <p>Height: ${actor.height}</p>
                <p>Birthday: ${actor.birthday}</p>
                <p>Movies: ${actor.movies.join(', ')}</p>
            </div>
          `
        )
        .join('')
    })
    .catch((error) => console.error('Error:', error))
}

// 특정 영화 클릭시 이동하게 해주는코드
function navigateTo(hash) {
  const path = hash.substring(1); // hash에서 '#' 제거
  history.pushState(null, '', hash); // 실제 URL 변경은 필요하지 않으나, 상태 관리를 위해 사용할 수 있음

  // 모든 섹션의 내용을 초기화합니다.
  document.getElementById('moviesList').innerHTML = '';
  document.getElementById('celebrity').innerHTML = '';
  document.getElementById('searchResults').innerHTML = '';
  document.getElementById('actor').style.display = ''; // 'Actor/Actress' 섹션을 다시 표시합니다.

  if (path.startsWith('/movies/') && path.split('/').length === 3) {
      const movieId = path.split('/')[2];
      fetchMovieDetails(movieId);
  } else {
    switch (path) {
      case '/':
        // 홈페이지 로직, 모든 섹션을 표시
        fetchMovies() // 영화 목록을 다시 불러옴
        fetchCelebrities() // 연예인 목록도 불러옴
        break
      case '/movies':
        fetchMovies()
        document.getElementById('celebrity').innerHTML = '' // Celebrity 정보 숨기기
        break
      case '/celebrity':
        // Celebrity 정보를 가져오는 로직
        document.getElementById('moviesList').innerHTML = '' // Movies 정보 숨기기
        fetchCelebrities() // 연예인 목록을 불러오는 함수 호출
        break
      default:
        // 기본 또는 404 페이지 로직
        // 홈페이지 로직을 기본값으로 사용할 수도 있음
        document.getElementById('moviesList').innerHTML = '' // 영화 목록 숨기기
        document.getElementById('celebrity').innerHTML = '' // 연예인 정보 숨기기
        break
    }
  }
}

// 특정 영화 정보를 불러오는코드 (Detail)
function fetchMovies () {
  fetch('/api/movies')
    .then((response) => response.json())
    .then((data) => {
      const moviesList = document.getElementById('moviesList')
      moviesList.innerHTML = data.results
        .map(
          (movie) => `
          <div class="movie" onclick="location.hash='/movies/${movie.id}'">
              <h3>${movie.title}</h3>
              <img src="${movie.poster}" alt="${movie.title} Poster">
          </div>
          `
        )
        .join('')
    })
    .catch((error) => console.error('Error:', error))
}

// Check the server
document.addEventListener('DOMContentLoaded', () => {
  let serverWasDisconnected = false // Flag to track connection status

  // Function to check server connectivity using async/await
  const checkServerConnection = async () => {
    try {
      const response = await fetch('/api/health-check', {
        // Adding a timeout might help in some cases where the request hangs.
        // Note: Fetch API doesn't natively support timeout. This is just illustrative.
        // You might need additional logic to implement timeout for fetch.
      })

      if (!response.ok) {
        throw new Error('Server response not OK')
      }

      const data = await response.json()
      console.log('Server is connected:', data)

      // If the server was previously marked as disconnected but is now connected
      if (serverWasDisconnected) {
        alert('The server is successfully reconnected.')
        serverWasDisconnected = false // Reset flag after reconnection
      }
    } catch (error) {
      console.error('Connection error:', error)
      // If it's the first disconnection detected
      if (!serverWasDisconnected) {
        alert('The server is disconnected. Please try again.')
        serverWasDisconnected = true // Set flag on first disconnection
      }
    }
  }

  // Check the server connection every 5 seconds
  setInterval(checkServerConnection, 5000)
})

// Add new movie
document.getElementById('movieForm').addEventListener('submit', function (e) {
  e.preventDefault() // Form 제출에 의한 페이지 새로고침 방지

  const formData = new FormData(this) // 'this'는 현재 폼을 가리킵니다.

  // FormData를 사용하여 파일 및 기타 폼 데이터를 서버로 전송
  fetch('/movieForm', {
    method: 'POST',
    body: formData // JSON.stringify를 사용하지 않고, 직접 formData 전송
  })
    .then((response) => response.text())
    .then((data) => {
      console.log(data)
      // 처리 후 작업, 예: 폼 리셋, 알림 표시 등
      fetchMovies() // 이 함수는 영화 목록을 서버에서 불러와서 화면에 표시하는 함수입니다.
    })
    .catch((error) => {
      console.error('Error:', error)
    })
})























//영화검색
document.addEventListener('DOMContentLoaded', () => {
  // 초기 로딩 시 'Home' 데이터를 자동으로 불러옵니다.
  navigateTo(window.location.hash || '#/');

  // 영화 검색 버튼 클릭 이벤트
  document.getElementById('searchButton').addEventListener('click', performSearch);

  // 영화 검색 입력 필드에서 Enter 키 이벤트
  document.getElementById('searchInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      performSearch();
    }
  });

  // URL의 hash가 변경될 때마다 새로운 섹션으로 이동 처리
  window.addEventListener('hashchange', () => navigateTo(window.location.hash));
});

async function performSearch() {
  console.log('Performing search...');
  const searchQuery = document.getElementById('searchInput').value.trim();
  if (!searchQuery) {
    alert('Please enter a search query.');
    return;
  }
  
  try {
    const response = await fetch(`/api/movies/search?title=${encodeURIComponent(searchQuery)}`);
    if (!response.ok) throw new Error('Failed to fetch');
    
    const movie = await response.json();
    if (!movie || Object.keys(movie).length === 0) {
      // 영화 정보가 없는 경우, alert 메시지를 표시합니다.
      alert('Your movie cannot be found. Please try searching again.');
      return; // 여기서 함수 실행을 중단합니다.
    }
    displayMovieDetails(movie);

    // 검색 성공 시 다른 섹션 내용 클리어
    clearOtherSectionsExceptSearchResults();
  } catch (error) {
    console.error('Error:', error);
    // 네트워크 오류나 다른 예외 상황에 대한 처리입니다.
    alert('Your movie cannot be found. Please try searching again.');
  }
}

function displayMovieDetails(movie) {
  const detailsContainer = document.getElementById('searchResults');
  const actorSection = document.getElementById('actor');
  actorSection.style.display = 'none';
  
  if (movie) {
    // 영화 상세 정보 HTML 생성
    let detailsHtml = `
      <div id="SEARCHMOVIE" style="display: flex;>
        <span style="flex: 1;">
          <img id="searchimage" src="${movie.poster}" alt="Poster of ${movie.title}" style="width: 100%; max-width: 300px; height: auto;">
        </span>
        <span style="flex: 2; padding-left: 20px;">
          <h3 id = "searchtitle">${movie.title}</h3>
          <p id= "searchoverview">${movie.overview}</p>
        </span>
      </div>`;

    // 연관된 연예인 정보 표시
    const relatedCelebrities = globalCelebrities.filter(actor =>
      actor.movies.includes(movie.title)
    );

    // 연예인 정보가 있다면, HTML에 추가
    if (relatedCelebrities.length > 0) {
      const celebritiesHtml = relatedCelebrities.map(actor => `
        <div class="actor-card">
            <h3>${actor.name}</h3>
            <p>Height: ${actor.height}</p>
            <p>Birthday: ${actor.birthday}</p>
            <p>Movies: ${actor.movies.join(', ')}</p>
        </div>`).join('');

        const celebritiesContainerHtml = `
          <div class="celebrities-container">
            ${celebritiesHtml}
          </div>
        `;
      // 영화 상세 정보에 연예인 정보를 추가
      detailsHtml += `<div class="related-celebrities">${celebritiesHtml}</div>`;
    }

    detailsContainer.innerHTML = detailsHtml;
  } else {
    detailsContainer.innerHTML = '<p>Movie not found.</p>';
  }
}


// 다른 섹션 내용 클리어 함수, 검색 결과 섹션 제외
function clearOtherSectionsExceptSearchResults() {
  document.getElementById('moviesList').innerHTML = '';
  document.getElementById('celebrity').innerHTML = '';
}
