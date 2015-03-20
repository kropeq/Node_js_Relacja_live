// inicjalizacja zmiennych
var express      = require('express')
var cookieParser = require('cookie-parser')
var session      = require('express-session')
var bodyParser      = require('body-parser')
var ejs = require ('ejs');

var app = require('express')();
var http = require('http').Server(app);
var path = require('path');


app.use(bodyParser());
app.use(cookieParser());
app.use(session({
    secret: 'sekretnyKluczuk'
      , proxy: true
      }))

app.set('view engine', 'ejs');

// baza
var mongoose = require('mongoose');
mongoose.connect('mongodb://kropeq:ogameogame2@dbh63.mongolab.com:27637/skoki');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'błąd połączenia z mongodb:'));
db.once('open', function callback () {
  console.log("Mongo - otwarte połączenie");
  });
  
// deklaracja schematow danych
var newsSchema = new mongoose.Schema({
    title: String,
    content: String,
    time: Date
    });

// kompilacja do modelu
var News = mongoose.model('News', newsSchema);

// nawigacja
app.get('/', function(req, res){
  res.render('index.ejs', {
  });
  });
app.get('/main', function(req, res){
    // pobieramy z bazy ostatnie 5 newsow
    News.find().limit(5).sort({'time': -1}).exec(function(err, news) {
	res.render('main.ejs', {
	    newsList: news,
	    });
	});
    
    });
app.get('/news', function(req, res){
    // pobieramy z bazy ostatnie 5 newsow
    News.find().sort({'id': -1}).exec(function(err, news) {
	res.render('history.ejs', {
	    newsList: news,
	});
    });
});
app.get('/news/:id/:prev', function(req, res){
    // pobieramy z bazy ostatnie 5 newsow
    News.findOne({_id: req.params.id}).exec(function(err, news) {
	res.render('singleNews.ejs', {
	    news: news,
	    prev: req.params.prev,
	    });
	});
    });

  
// statyczne wystawianie css i js
app.use(express.static(path.join(__dirname, '/public')));

// odpalenie serwera
http.listen(3000, function(){
    console.log('listening on *:3000');
    });