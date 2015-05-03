// inicjalizacja zmiennych
var express      = require('express')
var cookieParser = require('cookie-parser')
var session      = require('express-session')
var bodyParser      = require('body-parser')
var ejs = require ('ejs');

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(cookieParser());
app.use(session({
    secret: 'sekretnyKluczuk',
    proxy: true,
    resave: true,
    saveUninitialized: true
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

var resultsSchema = new mongoose.Schema({
    jumper: String,
    nation: String,
    jump1: Number,
    wind1: Number,
    nota1: Number,
    nota2: Number,
    nota3: Number,
    nota4: Number,
    nota5: Number,
    points1: Number,
    jump2: Number,
    wind2: Number,
    nota6: Number,
    nota7: Number,
    nota8: Number,
    nota9: Number,
    nota10: Number,
    points2: Number,
    result: Number
});

var chatSchema = new mongoose.Schema({
    nick: String,
    message: String,
    time: Date
    });

var jumperSchema = new mongoose.Schema({
    bib: Number,
    name: String,
    surname: String
});

// kompilacja do modelu
var News = mongoose.model('News', newsSchema);
var ResultsPost = mongoose.model('Resultspost', resultsSchema);
var ChatPost = mongoose.model('Chatpost', chatSchema);
var JumperPost = mongoose.model('Jumperpost', jumperSchema);

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
app.get('/startlist', function(req, res){
    if (req.session.admin) {
	res.render('startlist.ejs', {
	    isAdminLogged: req.session.admin
	});
    };
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

app.post('/deleteNews/:id', urlencodedParser, function(req, res){
    News.remove({ _id:req.params.id }, function(err){
	if (!err) { res.send('removed'); 
	    console.log("Niby usunął");
	}
	else console.log("Nie udało się usunąć");
    });
    
});

app.post('/editNews', urlencodedParser, function(req, res){
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

app.post('/loginUser', urlencodedParser, function(req, res){
    var nick = req.body.nick;
    req.session.nick = nick.replace(/(<([^>]+)>)/ig,"");
    req.session.user = true;
    res.send('logged');
});
app.post('/login', urlencodedParser, function(req, res){
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

app.get('/relacja', function(req, res){
    if (req.session.user || req.session.admin) {
	res.render('relacja.ejs', {
	    isAdminLogged: req.session.admin,
	    userNick: req.session.admin ? 'Admin' : req.session.nick
	    });
	}
    else res.redirect("/login");
  });
  
// statyczne wystawianie css i js
app.use(express.static(path.join(__dirname, '/public')));

// sockety
io.on('connection', function(socket){
    socket.on('loadAdminPosts', function(data)
	{
	ResultsPost.find().limit(50).sort({'result': -1}).exec(function(err, posts) {
	    socket.emit('adminMsgs', posts);
	    });;
	});
    socket.on('loadChatPosts', function(data)
	{
	ChatPost.find().limit(10).sort({'time': -1}).exec(function(err, posts) {
		socket.emit('chatPosts', posts);
	         });
	});
    
    socket.on('destroyTable',function(){
	ResultsPost.remove({},function(err){
	    io.emit('truncateTable');
	});
    });

    socket.on('adminChannel', function(jmpr,nt,jmp1,wnd1,not1,not2,not3,not4,not5,pts1,jmp2,wnd2,not6,not7,not8,not9,not10,pts2,results)
	{
	io.emit('adminMsg', {jumper: jmpr, nation: nt,
		jump1: jmp1, wind1: wnd1, nota1: not1, nota2: not2, nota3: not3, nota4: not4, nota5: not5, points1: pts1,
		jump2: jmp2, wind2: wnd2, nota6: not6, nota7: not7, nota8: not8, nota9: not9, nota10: not10, points2: pts2, result: results});
	// zapisujemy do bazy
	var post = new ResultsPost({ jumper: jmpr, nation: nt,
		jump1: jmp1, wind1: wnd1, nota1: not1, nota2: not2, nota3: not3, nota4: not4, nota5: not5, points1: pts1,
		jump2: jmp2, wind2: wnd2, nota6: not6, nota7: not7, nota8: not8, nota9: not9, nota10: not10, points2: pts2, result: results});
	post.save(function(err){
		if (err) console.log("Błąd zapisu posta admina do bazy "+err);
	});
    });
    // Znajdowanie wyników konkretnego skoczka ( FIND )
    socket.on('findResultJumper', function(findJumper){
	ResultsPost.findOne({jumper: findJumper}, function(err, jumper){
	    if (jumper ==null){
		socket.emit('showResultJumper',{jumper: 'Brak', nation: 'Brak',
			    jump1: '0', wind1: '0', nota1: '0',nota2: '0',nota3: '0',nota4: '0',nota5: '0',points1: '0',
			    jump2: '0', wind2: '0', nota6: '0',nota7: '0',nota8: '0',nota9: '0',nota10: '0',points2: '0', result: '0'});
	    } else {
		socket.emit('showResultJumper',jumper);
	    }
	});
    });
    //---------------------------------------------------------------------------//
    ///-------------------------- C R U D ---------------------------------------//
    //---------------------------------------------------------------------------//
    // Dodanie nowego skoczka do listy startowej
    socket.on('addNewJumper', function(number,jname,jsurname){
	var post = new JumperPost({bib: number, name: jname, surname: jsurname});
	post.save(function(err){
		if (err) console.log("Błąd zapisu skoczka do bazy "+err);
	    });
    });
    // Znajdowanie konkretnego skoczka ( FIND )
    socket.on('findOneJumper', function(number){
	JumperPost.findOne({bib: number}, function(err, jumper) {
	    if ( jumper == null) {
		socket.emit('foundOneJumper',{ bib : '0', name : 'Brak danych', surname : 'Brak danych' });
	    } else {
		socket.emit('foundOneJumper',jumper);
	    }
	});
    });
    // Sprawdzania czy istnieje juz pozycja z tym numerem startowym ( ADD )
    socket.on('checkBibBeforeAdd', function(number){
	JumperPost.findOne({bib: number}, function(err, jumper) {
	    if ( jumper == null) {
		socket.emit('checkedBibBeforeAdd',{ bib : '0', name : 'Brak danych', surname : 'Brak danych' });
	    } else {
		socket.emit('checkedBibBeforeAdd',jumper);
	    }
	});
    });
    // Sprawdzania czy istnieje juz wynik tego skoczka ( ADD )
    socket.on('checkResultBeforeAdd', function(skoczek){
	ResultsPost.findOne({jumper: skoczek}, function(err, jumper) {
	    if ( jumper == null) {
		socket.emit('checkedResultBeforeAdd',{ jumper: 'Brak', nation: 'Brak',
			    jump1: '0', wind1: '0', nota1: '0',nota2: '0',nota3: '0',nota4: '0',nota5: '0',points1: '0',
			    jump2: '0', wind2: '0', nota6: '0',nota7: '0',nota8: '0',nota9: '0',nota10: '0',points2: '0', result: '0'});
	    } else {
		socket.emit('checkedResultBeforeAdd',jumper);
	    }
	});
    });
    // Sprawdzania czy istnieje juz pozycja z tym numerem startowym ( UPDATE )
    socket.on('checkBibBeforeUpdate', function(number){
	JumperPost.findOne({bib: number}, function(err, jumper) {
	    if ( jumper == null) {
		socket.emit('checkedBibBeforeUpdate',{ bib : '0', name : 'Brak danych', surname : 'Brak danych' });
	    } else {
		socket.emit('checkedBibBeforeUpdate',jumper);
	    }
	});
    });
    
    // Sprawdzania czy istnieje juz pozycja z tym numerem startowym ( DELETE )
    socket.on('checkBibBeforeDelete', function(number){
	JumperPost.findOne({bib: number}, function(err, jumper) {
	    if ( jumper == null) {
		socket.emit('checkedBibBeforeDelete',{ bib : '0', name : 'Brak danych', surname : 'Brak danych' });
	    } else {
		socket.emit('checkedBibBeforeDelete',jumper);
	    }
	});
    });
    // Sprawdzania czy istnieje juz wynik tego skoczka ( DELETE )
    socket.on('checkResultBeforeDelete', function(skoczek){
	ResultsPost.findOne({jumper: skoczek}, function(err, result) {
	    if ( result == null) {
		socket.emit('checkedResultBeforeDelete',{ jumper: 'Brak', nation: 'Brak',
			    jump1: '0', wind1: '0', nota1: '0',nota2: '0',nota3: '0',nota4: '0',nota5: '0',points1: '0',
			    jump2: '0', wind2: '0', nota6: '0',nota7: '0',nota8: '0',nota9: '0',nota10: '0',points2: '0', result: '0'});
	    } else {
		socket.emit('checkedResultBeforeDelete',result);
	    }
	});
    });
    // Usuwanie pojedynczego skoczka z listy startowej
    socket.on('deleteJumper',function(number){
	JumperPost.remove({ bib:number }, function(err){
	    if ( err ){
		console.log("Błąd podczas usuwania skoczka z bazy "+err);
	    }
	});
    });
    // Usuwanie pojedynczych wynikow skoczka z listy startowej
    socket.on('deleteResult',function(skoczek){
	ResultsPost.remove({ jumper: skoczek }, function(err){
	    if ( err ){
		console.log("Błąd podczas usuwania skoczka z bazy "+err);
	    }
	});
    });
    // Update pojedynczego skoczka z listy startowej
    socket.on('updateJumper',function(number,jname,jsurname){
	JumperPost.update({bib: number}, {$set: { name: jname, surname: jsurname}}, function(err, jumper) {
	    if (err) {
		console.log("Błąd podczas edycji skoczka w bazie "+err);
	    }
	});
    });
    // Usuwanie wszystkich skoczkow z listy startowej
    socket.on('removeJumpers', function(){
	JumperPost.remove({},function(err){
	    if (err) console.log("Błąd usuwania skoczkow z bazy "+err);
	});
    });
    // Ladowanie listy startowej
    socket.on('loadStartList', function(data)
	{
	JumperPost.find().limit(50).sort({'bib': 1}).exec(function(err, listaStartowa) {
	    socket.emit('StartList', listaStartowa);
	    });;
	});
    
    //---------------------------------------------------------------------------//
    //----------------------------- Private Message -----------------------------//
    //---------------------------------------------------------------------------//
    socket.on('pmToAdmin', function(msg){
	var strippedMsg = msg.message.replace(/(<([^>]+)>)/ig,"").trim();
	if (strippedMsg.length == 0) return;
	console.log(strippedMsg);
	io.emit('showToAdmin',{nick: msg.nick, message: strippedMsg});
	});
    
    socket.on('adminResponse', function(msg){
	var date = new Date();
	var hour = date.getHours();
	hour = (hour < 10 ? "0" : "") + hour;
	var min  = date.getMinutes();
	min = (min < 10 ? "0" : "") + min;
	io.emit('responseToUser',{nick: msg.nick, message: '<span style="color: red">'+msg.message+'</span>', time: hour+':'+min});
	});
    
    socket.on('usersChannel', function(msg)
	{
	var date = new Date();
	var hour = date.getHours();
	hour = (hour < 10 ? "0" : "") + hour;
	var min  = date.getMinutes();
	min = (min < 10 ? "0" : "") + min;
	
	var strippedMsg = msg.message.replace(/(<([^>]+)>)/ig,"").trim();
	if (strippedMsg.length == 0) return;
	var colorMsg = strippedMsg;
	if (msg.nick == 'Admin') colorMsg = '<span style="color: red">'+strippedMsg+'</span>';


	io.emit('userMsg', {nick: msg.nick, message: colorMsg, time: hour+':'+min});
	
	// zapisujemy do bazy
	var post = new ChatPost({ nick: msg.nick, message: colorMsg, time: Date.now() });
	post.save(function(err){
		if (err) console.log("Błąd zapisu posta admina do bazy "+err);
	});
    });
    
});

// odpalenie serwera
http.listen(3000, function(){
    console.log('listening on *:3000');
    });