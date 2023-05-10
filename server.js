var config = require('./config');
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://"+config.db.user+":"+config.db.password+"@cluster0.mibncjb.mongodb.net/?retryWrites=true&w=majority";

const dotenv = require('dotenv').config()
const request = require('request');
const express = require('express')
const app = express();
// const port = 3000;
//const app = express()
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
//app.set('views', __dirname + '/views');
app.set("view engine", "ejs");
app.use(express.static('assets'));

// Import the functions you need from the SDKs you need
const { initializeApp } = require('firebase/app');
//const { getAnalytics } = require('firebase/analytics');
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const apiKey = process.env.API_KEY
const firebaseConfig = {
  apiKey: apiKey,
  authDomain: "starmovies-c55e6.firebaseapp.com",
  projectId: "starmovies-c55e6",
  storageBucket: "starmovies-c55e6.appspot.com",
  messagingSenderId: "883468338795",
  appId: "1:883468338795:web:28264d0285fb44ced2d32e",
  measurementId: "G-Z5MCDLN4WT"

};
// Initialize Firebase

//const analytics = getAnalytics(app);
const firebase = require('firebase');
//const firebaseui = require('firebaseui');


app.get("/", (req, res) => {
  res.render("index", { activePage: "index" });
});

app.get('/welcome', function(req, res) {//route for addStudent.ejs
  res.render('welcome', { activePage: "welcome" });
});

app.get('/signup', function(req, res) {//route for displayStudent.ejs
  res.render('signup', { activePage: "signup" });
}); 

app.get('/userlogin', function(req, res) {//route for listStudents.ejs
  res.render('userlogin', { activePage: "userlogin" });
});

app.get('/favorites', function(req, res) {
  res.render('favorites', { activePage: "favorites" });
});

app.get('/displayMovie', function(req, res) {
  res.render('displayMovie', { activePage: "displayMovie" });
});

app.get('/addMovie', function(req, res) {
  res.render('addMovie', { activePage: "addMovie" });
});

app.get('/deleteMovie', function(req, res) {
  res.render('deleteMovie', { activePage: "deleteMovie" });
});

app.get('/toprated', function(req, res) {
  res.render('toprated', { activePage: "toprated"});
})

/**   *  POST - Method for adding a student record.
  *  @method Post
  *  @type  {Request}
  *  @param {number} record_id Student Record ID
  *  @param {string} movie_title Movie Title
  * 
  *  @param {string} first_name First Name
  *  @param {string} last_name  Last Name
  *  @param {number} gpa GPA
  *  @param {string} enrolled Enrolled
  *  @returns Adds a student record to the server.
  */
app.post('/moviez', async function(req, res) {

  var record_id = new Date().getTime();
  var rsp_obj = {};
  var movieTitle = req.body.movie_title;
  const fetch = require('node-fetch');
  const url = `https://api.themoviedb.org/3/search/movie?api_key=5bb29652cf62dbfbebc5b63624ef5f53&query=${movieTitle}`;
  let releaseDate = '';
  let voteAverage = '';
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.results.length > 0) {
        releaseDate = data.results[0].release_date;
        voteAverage = data.results[0].vote_average;
      }
      const movie = {//store parameters collected from the front end and stores inside movie obj
        "_id": record_id,
        "record_id": record_id,
        "movie_title": movieTitle,
        "release_date": releaseDate,
        "vote_average": voteAverage
      };
      console.log("the data inside the movie object inside the post function is: ");
      console.dir(movie);
      const client = new MongoClient(uri);//connects to mongodb

      try {
        console.log("connecting to uri:" + uri)
      }
      catch (e) {
        console.error(e);
      }

      //const client = new MongoClient(uri, {useUnifiedTopology: true }, function (err, client) {
      try{
        var dbo = client.db(config.db.name);//database name
        dbo.collection(config.db.collection).insertOne(movie, function (err, results) {//mongodb method for adding
          if (err) throw err;
          console.log("inserted document!");
          console.log(results);
          rsp_obj.message = "Movie added to favorites!";
          client.close();
          // res.status(200).send(rsp_obj.message);
          console.log("The data inside the response objct inside the post function is: ");
          console.dir(rsp_obj);
          res.redirect('/addMovie'); // redirects back to the page
        })
      }
      catch (e) {
        console.log(e);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      res.status(500).send('Error');
    });
});

/** 
  *  DELETE - Method for deleting one student record.
  *  @method DELETE
  *  @type {Request}
  *  @param {number} record_id Student Record ID
  *  @returns Deletes a single student record from the server using record_id.
  */
app.delete('/deleteStudent/:record_id', async function(req, res) {

  const client = new MongoClient(uri);//connect to database
  const id = parseInt(req.params.record_id);// collect record_id from front-end and convert to int

  console.log("The id inside of filterByID is: ");
  console.dir(id);
  let conn;

  try {
    console.log("connecting to uri:" + uri)
    conn = await client.connect();//syncronous connection try/catch
  }
  catch (e) {
    console.error(e);
  }

  var dbo = client.db(config.db.name);//database name

  var query = {"_id": parseInt(id)};

  dbo.collection(config.db.collection).deleteOne(query, function (err, result) {//mongodb delete method 
    if (err) throw err;
    console.log(result)
    res.status(200).send("Student Deleted Successfully!");
    client.close();//closes connection to database

  });
    

});

/** 
  *  PUT - Method for updating a single student record.
  *  @method PUT
  *  @type {Request}
  *  @param {number} record_id Student Record ID
  *  @param {string} first_name First Name
  *  @param {string} last_name  Last Name
  *  @param {number} gpa GPA
  *  @param {string} enrolled Enrolled
  *  @returns Updates a student record in the server.
  */
app.put('/updateStudent/:record_id', async function(req, res) {
  
  var record_id = parseInt(req.params.record_id);//saves record_id collected from front end
  var rsp_obj = {};
  
  var student = {//student object
    "record_id": record_id,
    "first_name": req.body.first_name,
    "last_name": req.body.last_name,
    "gpa": req.body.gpa,
    "enrolled": req.body.enrolled
  };

  const client = new MongoClient(uri);//connect to database

  try {
    console.log("connecting to uri:" + uri)
    conn = await client.connect();//asyncronous connection
  }
  catch (e) {
    console.error(e);
  }
  
  try{
    var dbo = client.db(config.db.name);
    var query = { "record_id": parseInt(record_id) };//convert record_id to int 

    dbo.collection(config.db.collection).updateOne(query, {$set: student}, function (err, result) {//mongodb updateOne function 
      if (err) throw err;
      console.log(result)
      res.status(200).send("Student Updated Successfully!");
      client.close();//close connection
    })
  }
  catch (e){
    console.log(e);
  }
  

}); //end put method

/** 
  *  GET - Method for searching for movie titles.
  *  @method GET
  *  @type {Request}
  *  @returns 
  */

// Handle POST request to /getMovie endpoint
app.post('/getMovie', function(req, res) {
  // Extract the search term from the request body
  const searchTerm = req.body.searchTerm;
  // Construct the URL for the API request using the search term and API key
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.API_KEY}&query=${searchTerm}`;

  // Make a request to the API using the constructed URL
  request(url, function(error, response, body) {
    // Check if there was no error and the response status code is 200 (OK)
    if (!error && response.statusCode == 200) {
      // Parse the response body into a JavaScript object
      const data = JSON.parse(body);
      // Log the received data to the console for debugging purposes
      console.log(data);
      // Send the received data back to the client as a JSON object
      res.json(data);
    } else {
      // Log the error to the console for debugging purposes
      console.log(error);
      // Send an error response back to the client with the error message
      res.json({ error: error });
    }
  });
});


/** 
  *  GET - Method for retreiving movies from themoviedb.
  *  @method GET
  *  @type {Request}
  *  @returns Retreives top 20 rated movies.
  */
// Import the node-fetch package
app.get('/movies', async function(req, res) {
  const fetch = require('node-fetch');

  // Define the API endpoint URL and append_to_response parameter
  const url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${process.env.API_KEY}&append_to_response=images,videos`;

  // Fetch the data from the API endpoint
  fetch(url)
    .then(response => response.json())
    .then(data => {
      // Map the response to create an array of movie objects
      const movies = data.results.map(movie => {
        // Define the base URL for the movie posters
        const baseUrl = 'https://image.tmdb.org/t/p/w500';
        // Construct the full URL for the movie poster, or an empty string if no poster is available
        const posterUrl = movie.poster_path ? baseUrl + movie.poster_path : '';
        // Return an object with the movie title, release date, rating, and poster URL
        return {
          title: movie.title,
          release_date: movie.release_date,
          vote_average: movie.vote_average,
          poster_url: posterUrl
        };
      });
      // Log the JSON response to the console
      console.log(JSON.stringify(movies));
      // Send the array of movie objects as the response to the client
      res.send(movies);
    })
    .catch(error => {
      // Log and send an error response if the API request fails
      console.error('Error:', error);
      res.status(500).send('Error');
    });
});

app.get('/moviez', async function(req, res) {
  const client = new MongoClient(uri);
  try {
    conn = await client.connect();
    var dbo = client.db(config.db.name);
    var results = await dbo.collection(config.db.collection).find({}).toArray();
    res.send(results);
  } catch (e) {
    console.error(e);
  } finally {
    client.close();
  }
})

port = process.env.PORT || 5678
app.listen(port); //start the server
console.log('Server is running...');

// app.listen(port, () => {
//   console.log(`Listening on port ${port}`);
// });
