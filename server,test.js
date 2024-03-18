const request = require('supertest')
const app = require('./server')
const fs = require('fs');
const path = require('path');
const moviesFilePath = path.join(__dirname, 'movie.json');

//app.get('/api/health-check', (req, res) => { 
test('GET /api/health-check confirms the server is running', async () => {
    const response = await request(app)
      .get('/api/health-check')
      .expect(200); // This code expects a status code of 200, and the test will fail if the status code does not match.

    //   The code below verifies the response body after checking the status code.
    expect(response.body.message).toEqual('Server is up and running');
  });

// app.get('/api/movies/search', (req, res) => { without title	
test('GET /api/movies/search without title should return 400 Bad Request', async () => {
    const response = await request(app)
      .get('/api/movies/search')
      .expect(400)
      .expect('Content-Type', /text/); // 기대하는 Content-Type이 text인지 확인
  
    expect(response.text).toEqual('Title is required');
  });
  
  // app.get('/api/movies/search', (req, res) => { with unknown title
test('GET /api/movies/search with unknown title should return 404 Not Found', async () => {
    const response = await request(app)
      .get('/api/movies/search?title=Unknown%20Title')
      .expect(404)
      .expect('Content-Type', /text/); // check expected Content-Type이 text
  
    expect(response.text).toEqual('Movie not found');
  });
  
  //  app.get('/api/movies/search', (req, res) => { with valid title	
test('GET /api/movies/search with valid title should return the movie in JSON format', async () => {
    const title = encodeURIComponent('The Beekeeper'); // example
    const response = await request(app)
      .get(`/api/movies/search?title=${title}`)
      .expect(200)
      .expect('Content-Type', /json/); // check the response whether Content-Type is application/json not

    expect(response.body).toHaveProperty('title', 'The Beekeeper');
});

// app.get('/api/movies', (req, res) => {	
test('GET /api/movies should return all movies data in JSON format with status 200', async () => {
    const response = await request(app)
      .get('/api/movies')
      .expect(200) //response 200 in http code
      .expect('Content-Type', /json/); //check the response whether Content-Type is application/json

    // Verifies that the response body has the correct structure.
    //  This part may vary depending on the structure of the movie.json file.
    expect(response.body).toBeInstanceOf(Object);
    if (response.body.length > 0) {
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('overview');
    }
});


// 3app.get('/api/celebrity', (req, res) => {
test('/api/celebrity should return celebrity data with status code 200 and content-type application/json', async () => {
    const response = await request(app)
      .get('/api/celebrity')
      .expect('Content-Type', /json/)
      .expect(200);
  });


//app.get('/api/uploads', (req, res)
test('GET /api/uploads should return a list of files', async () => {
    const response = await request(app)
      .get('/api/uploads')
      .expect(200) //response 200 in http code
      .expect('Content-Type', /json/); // Checks if the response is in JSON format.

    //   Verifies that the response is an array (the file list should be in the form of an array).
    expect(Array.isArray(response.body)).toBeTruthy();
    if (response.body.length > 0) {
      expect(typeof response.body[0]).toBe('string');
    }
  });

// app.get('/api/movies/:id', (req, res) => {
test('GET /api/movies/:id should return a movie detail with status 200', async () => {
    // example
    const movieId = 467244;
    const response = await request(app)
      .get(`/api/movies/${movieId}`)
      .expect(200) // response 200 in http code in http
      .expect('Content-Type', /json/); // Checks if the response is in JSON format.
  
    //Verifies that the response body contains movie details.
    expect(response.body).toHaveProperty('id', movieId);
  });
  
  // Tests for the case where the movie cannot be found (HTTP status code 404).
  test('GET /api/movies/:id should return 404 if the movie is not found', async () => {
    const invalidMovieId = 9999;
    const response = await request(app)
      .get(`/api/movies/${invalidMovieId}`)
      .expect(404) // Expects an HTTP status code of 404.
      .expect('Content-Type', /text/); // Checks if the response's Content-Type is text.

  
    //Verifies that the 'Movie not found' message is returned.
    expect(response.text).toEqual('Movie not found');
  });

// app.post('/movieForm', upload.single('movieimage'), (req, res) => {
test('POST /movieForm should add a new movie', async () => {
  const newMovie = {
    title: 'Test Movie',
    overview: 'This is a test movie.'
  };

  await request(app)
    .post('/movieForm')
    .field('title', newMovie.title)
    .field('overview', newMovie.overview)
    // To simulate file upload, use .attach('movieimage', 'path/to/test/image.jpg').
    .expect(200) // Changes according to the correct response message/code
    .then((response) => {
            // Verifies the success response message.
        expect(response.text).toContain('New movie is added successfully');

      // Reads the file to verify that the movie data has actually been added to the file.
      const data = fs.readFileSync(path.join(__dirname, 'movie.json'), 'utf8');
      const database = JSON.parse(data);
      const movieExists = database.results.some(movie => movie.title === newMovie.title && movie.overview === newMovie.overview);

      expect(movieExists).toBeTruthy();
    });
});

//app.post('/movieForm', upload.single('movieimage'), (req, res) => {
    test('POST /movieForm should add a new movie', async () => {
        const newMovie = {
          title: 'Test Movie',
          overview: 'This is a test movie.'
        };
      
        await request(app)
          .post('/movieForm')
          .field('title', newMovie.title)
          .field('overview', newMovie.overview)
          // To simulate file upload, use .attach('movieimage', 'path/to/test/image.jpg').
          .expect(200) // Change according to the correct response message/code.
          .then((response) => {
            // Verifies the success response message.
            expect(response.text).toContain('New movie is added successfully');
      
            // Reads the file to verify that the movie data has actually been added to the file.
            const data = fs.readFileSync(path.join(__dirname, 'movie.json'), 'utf8');
            const database = JSON.parse(data);
            const movieExists = database.results.some(movie => movie.title === newMovie.title && movie.overview === newMovie.overview);
      
            expect(movieExists).toBeTruthy();
          });
      });
// app.post('/api/movies', upload.single('movieImage'), (req, res) => {
test('POST /api/movies adds a new movie without an image', async () => {
    const newMovie = {
      title: 'Test Movie Title',
      overview: 'Test Movie Overview'
    };
  
    const response = await request(app)
      .post('/api/movies')
      .field('title', newMovie.title)
      .field('overview', newMovie.overview)
      // To upload an image file, add `.attach('movieImage', 'path/to/image.jpg')`.
      .expect(201);
  
    expect(response.text).toEqual('The new movie was added successfully.');
  });

// Ensure your app does not listen on a port when in test mode to avoid EADDRINUSE error
if (process.env.NODE_ENV !== 'test') {
  app.listen(8090, () => {
    console.log('Server running at http://127.0.0.1:8090/');
  });
}

