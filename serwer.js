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
    isLoggedAdmin: req.session.admin,
    isLoggedUser: req.session.user,
    userNick: req.session.admin ? "Admin" : req.session.nick
  });
  });
app.get('/main', function(req, res){
    // pobieramy z bazy ostatnie 5 newsow
    News.find().limit(5).sort({'time': -1}).exec(function(err, news) {
	res.render('main.ejs', {
	    newsList: news,
	    isAdminLogged: req.session.admin
	    });
	});
    
    });
app.get('/news', function(req, res){
    // pobieramy z bazy ostatnie 5 newsow
    News.find().sort({'id': -1}).exec(function(err, news) {
	res.render('history.ejs', {
	    newsList: news,
	    isAdminLogged: req.session.admin
	});
    });
});
app.get('/news/:id/:prev', function(req, res){
    // pobieramy z bazy ostatnie 5 newsow
    News.findOne({_id: req.params.id}).exec(function(err, news) {
	res.render('singleNews.ejs', {
	    news: news,
	    prev: req.params.prev,
	    isAdminLogged: req.session.admin
	    });
	});
    });

app.get('/editNews/:prev', function(req, res){
    res.render('editNews.ejs', {prev: req.params.prev});
});
app.get('/editNews/:id/:prev', function(req, res){
    News.findOne({_id: req.params.id}).exec(function(err, news) {
	res.render('editNews.ejs', {
	    news: news,
	    prev: req.params.prev,
	    isAdminLogged: req.session.admin
	    });
	});
});

app.post('/deleteNews/:id', function(req, res){
    News.remove({ _id:req.params.id }, function(err){
	if (!err) { res.send('removed'); 
	    console.log("Niby usunął");
	}
	else console.log("Nie udało się usunąć");
    });
    
});

app.post('/editNews', function(req, res){
	if (!req.body.id) {
	    var news = new News({ content: req.body.content,title: req.body.title, time: Date.now() });
		news.save(function(err){
		if (err) {
		    console.log("Błąd zapisu newsa do bazy "+err);
		    res.send('Błąd zapisu do bazy '+err);
		    }
		else res.send('saved');
		});
	    }
	else {
	    News.update({_id: req.body.id}, {$set: { title: req.body.title, content: req.body.content}}, function(err, news) { 
		if (err) {
		    console.log("Błąd zapisu newsa do bazy "+err);
		    res.send('Błąd zapisu do bazy '+err);
		    }
		else res.send('saved');

		});
	    
	    }
    
});

app.post('/loginUser', function(req, res){
    var nick = req.body.nick;
    req.session.nick = nick.replace(/(<([^>]+)>)/ig,"");
    req.session.user = true;
    res.send('logged');
});
app.post('/login', function(req, res){
    var login = req.body.login;
    var pass = req.body.pass;
    console.log(login + " " + pass);
    if (login == 'master' && pass == 'of disaster')
	{
	req.session.admin = true;
	console.log("Master admin logged");
	res.send('logged');
	}
});
app.get('/logout', function(req, res){
    req.session.admin=false;
    req.session.user=false;
    req.session.nick=null;
    res.sendfile('logout.html');
});

app.get('/login', function(req, res){
    res.sendfile('login.html');
});
  
// statyczne wystawianie css i js
app.use(express.static(path.join(__dirname, '/public')));

// odpalenie serwera
http.listen(3000, function(){
    console.log('listening on *:3000');
    });