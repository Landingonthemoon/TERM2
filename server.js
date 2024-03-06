const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const cors = require('cors');
const multer = require('multer'); //사진 업로드 할때 쓰임

app.use(cors());



// 파일을 저장할 디렉토리 설정 -> mutler 설저
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // 파일이 저장될 경로
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
});

// multer 설정
const upload = multer({ storage: storage });
const port = 8090;


// 정적 파일 제공을 위해 client 디렉토리를 사용
app.use(express.static("client"));


// 영화 데이터를 반환하는 API 엔드포인트
app.get('/api/movies', (req, res) => {
    fs.readFile(path.join(__dirname, 'movie.json'), 'utf8', (err, data) => {
      if (err) {
        return res.status(500).send("Error reading movie data.");
      }
      res.json(JSON.parse(data));
    });
  });


  
// Celebrity 가져오기
app.get('/api/celebrity', (req, res) => {
  fs.readFile(path.join(__dirname, 'celebrity.json'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send("Error reading celebrity data.");
    }
    res.json(JSON.parse(data));
  });
});



// Health check endpoint (server.js)
app.get("/api/health-check", (req, res) => {
  res.status(200).json({ message: "Server is up and running" });
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





//새로운 영화 추가
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Route to update entities (새로운 영화 추가)
app.post('/movieForm', upload.single('movieimage'), (req, res) => {
  fs.readFile(path.join(__dirname, 'movie.json'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send("Error reading movie data.");
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
      poster: req.file ? `/uploads/${req.file.filename}` : '', // 파일이 업로드 되었다면 경로 저장
    };

    database.results.push(movieInfo); // 새 영화 정보를 'results' 배열에 추가

    fs.writeFile(path.join(__dirname, 'movie.json'), JSON.stringify(database, null, 2), 'utf8', (err) => {
      if (err) {
        return res.status(500).send("Error saving movie data.");
      }
      res.send("New movie is added successfully");
    });
  });
});







// Start the server
app.listen(8090, () => {
	console.log("Server running at http://127.0.0.1:8090/");
});










// 영화 detail
// 영화 상세 정보를 제공하는 API 엔드포인트 추가
app.get('/api/movies/:id', (req, res) => {
  fs.readFile(path.join(__dirname, 'movie.json'), 'utf8', (err, data) => {
      if (err) {
          res.status(500).send("Server error");
          return;
      }
      const movies = JSON.parse(data).results;
      const movie = movies.find(movie => movie.id == req.params.id); // 영화 ID로 찾기
      if (movie) {
          res.json(movie);
      } else {
          res.status(404).send('Movie not found');
      }
  });
});









