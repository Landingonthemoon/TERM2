const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const cors = require('cors');
const multer = require('multer'); // Upload a poster
const uploadsDir = path.join(__dirname, 'uploads');
const moviesFilePath = path.join(__dirname, 'movie.json');

// multer 설정 부분이 이미 잘 설정되어 있습니다.
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // 파일이 저장될 경로
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// // multer 설정
const upload = multer({ storage });

// Search Movies
app.get('/api/movies/search', (req, res) => {
  const { title } = req.query;
  if (!title) {
    return res.status(400).send('Title is required');
  }

  fs.readFile(path.join(__dirname, 'movie.json'), 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error reading movie data');
    }

    const parsedData = JSON.parse(data);
    const movie = parsedData.results.find(movie => movie.title.toLowerCase() === decodeURIComponent(title).toLowerCase());

    if (movie) {
      // 영화를 찾은 경우, 로그를 출력하고 200 상태 코드와 함께 영화 데이터를 JSON 형태로 반환
      console.log(`Found movie: ${movie.title}`);
      res.status(200).json(movie);
    } else {
      // 영화를 찾지 못한 경우, 로그를 출력하고 404 상태 코드와 메시지를 반환
      console.log(`No movie found matching the title: ${decodeURIComponent(title)}`);
      res.status(404).send('Movie not found');
    }
  });
});

app.use(cors());

// 정적 파일 제공을 위해 client 디렉토리를 사용
app.use(express.static('client'));

// 영화 데이터를 반환하는 API 엔드포인트
app.get('/api/movies', (req, res) => {
  fs.readFile(path.join(__dirname, 'movie.json'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading movie data.');
    }
    res.json(JSON.parse(data));
  });
});

// Celebrity 가져오기
app.get('/api/celebrity', (req, res) => {
  fs.readFile(path.join(__dirname, 'celebrity.json'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).type('text/plain').send('Error reading celebrity data.');
    }
    res.json(JSON.parse(data));
  });
});

// Health check endpoint (server.js)
app.get('/api/health-check', (req, res) => {
  res.status(200).json({ message: 'Server is up and running' });
});

// 업로드된 파일 목록을 제공하는 API
app.get('/api/uploads', (req, res) => {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      res.status(500).send('Server error');
      return;
    }
    res.json(files);
  });
});

app.use('/uploads', express.static('uploads'));

// 새로운 영화 추가
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Route to update entities (새로운 영화 추가)
app.post('/movieForm', upload.single('movieimage'), (req, res) => {
  fs.readFile(path.join(__dirname, 'movie.json'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading movie data.');
    }

    const database = JSON.parse(data);
    // 'results' 배열에 접근
    if (!Array.isArray(database.results)) {
      database.results = []; // 'results'가 배열이 아니라면 빈 배열로 초기화
    }

    const movieInfo = {
      id: Date.now(), // 새 영화에 대한 고유 ID 생성
      title: req.body.title,
      overview: req.body.overview,
      poster: req.file ? `/uploads/${req.file.filename}` : '' // 파일이 업로드 되었다면 경로 저장
    };

    database.results.push(movieInfo); // 새 영화 정보를 'results' 배열에 추가

    fs.writeFile(
      path.join(__dirname, 'movie.json'),
      JSON.stringify(database, null, 2),
      'utf8',
      (err) => {
        if (err) {
          return res.status(500).send('Error saving movie data.');
        }
        res.send('New movie is added successfully');
      }
    );
  });
});

// movie detail
// 영화 상세 정보를 제공하는 API 엔드포인트 추가
app.get('/api/movies/:id', (req, res) => {
  fs.readFile(path.join(__dirname, 'movie.json'), 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Server error');
      return;
    }
    const movies = JSON.parse(data).results;
    const movie = movies.find((movie) => movie.id === parseInt(req.params.id)); // 영화 ID로 찾기
    if (movie) {
      res.json(movie);
    } else {
      res.status(404).send('Movie not found');
    }
  });
});

// Add new movie - asynchoronous updates
app.post('/api/movies', upload.single('movieImage'), (req, res) => {
  fs.readFile(moviesFilePath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('An error occurred while reading movie data from the server.');
      return;
    }
    const moviesData = JSON.parse(data);
    const newMovie = {
      id: Date.now(),
      title: req.body.title,
      overview: req.body.overview,
      poster: req.file ? `/uploads/${req.file.filename}` : ''
    };
    moviesData.results.push(newMovie);

    fs.writeFile(moviesFilePath, JSON.stringify(moviesData, null, 2), 'utf8', err => {
      if (err) {
        res.status(500).send('An error occurred while saving the new movie data.');
        return;
      }
      res.status(201).send('The new movie was added successfully.');
    });
  });
});

// Start the server
app.listen(8090, () => {
  console.log('Server running at http://127.0.0.1:8090/');
});

module.exports = app;








