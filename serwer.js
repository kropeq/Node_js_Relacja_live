// inicjalizacja zmiennych
var express      = require('express')
var cookieParser = require('cookie-parser')
var session      = require('express-session')

var ejs = require ('ejs');

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

app.use(cookieParser());
app.use(session({
    secret: 'sekretnyKluczuk',
    proxy: true,
    resave: true,
    saveUninitialized: true
      }))

app.set('view engine', 'ejs');

// routes
require('./app/routes')(app);

var User            = require('./app/models/user');
var News            = require('./app/models/news');
var JumperPost          = require('./app/models/jumper');
var ResultsPost     = require('./app/models/results');
var ChatPost     = require('./app/models/chat');
var ResponsePost     = require('./app/models/response');
var PrivateMessagePost     = require('./app/models/privatemessage');

// baza
var mongoose = require('mongoose');
mongoose.connect('mongodb://kropeq:ogameogame2@dbh63.mongolab.com:27637/skoki');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'błąd połączenia z mongodb:'));
db.once('open', function callback () {
  console.log("Mongo - otwarte połączenie");
  });
  

  
// statyczne wystawianie css i js
app.use(express.static(path.join(__dirname, '/public')));

// sockety
io.on('connection', function(socket){
    // ------- Rejestracja uzytkownikow -------- //
    // Sprawdzenie czy nick jest wolny
    socket.on('checkBeforeRegister',function(nick){
	User.findOne({username: nick}, function(err, user) {
	    if (user == null){
		socket.emit('existenceUser',false);
	    } else {
		socket.emit('existenceUser',true);
	    }
	});
    });
    // Zarejestrowanie usera na podany nick
    socket.on('registerUser',function(nick,pass){
	var user = new User({ username: nick, password: pass});
	user.save(function(err){
		if (err) console.log("Błąd zapisu usera do bazy "+err);
	});
    });
    
    // ----------------------------------------- //
    socket.on('loadAdminPosts', function(data)
	{
	ResultsPost.find().limit(50).sort({'result': -1}).exec(function(err, posts) {
	    socket.emit('adminMsgs', posts);
	    });;
	});
    socket.on('loadStartListToAutocomplete', function()
	{
	JumperPost.find().limit(50).sort({'surname': -1}).exec(function(err, jumpers) {
	    socket.emit('jumpersList', jumpers);
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
    
    socket.on('removeThisResult',function(jumper){
	    io.emit('removeResult',jumper);
    });

    socket.on('adminChannel', function(jmpr,nt,jmp1,wnd1,not1,not2,not3,not4,not5,pts1,jmp2,wnd2,not6,not7,not8,not9,not10,pts2,results,jaka_operacja)
	{
	io.emit('adminMsg', {jumper: jmpr, nation: nt,
		jump1: jmp1, wind1: wnd1, nota1: not1, nota2: not2, nota3: not3, nota4: not4, nota5: not5, points1: pts1,
		jump2: jmp2, wind2: wnd2, nota6: not6, nota7: not7, nota8: not8, nota9: not9, nota10: not10, points2: pts2, result: results});
	// zapisujemy do bazy
	if ( jaka_operacja == "update") {
	} else {
	var post = new ResultsPost({ jumper: jmpr, nation: nt,
		jump1: jmp1, wind1: wnd1, nota1: not1, nota2: not2, nota3: not3, nota4: not4, nota5: not5, points1: pts1,
		jump2: jmp2, wind2: wnd2, nota6: not6, nota7: not7, nota8: not8, nota9: not9, nota10: not10, points2: pts2, result: results});
	post.save(function(err){
		if (err) console.log("Błąd zapisu posta admina do bazy "+err);
	});
	}
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
    // Sprawdzania czy istnieje juz wynik tego skoczka ( UPDATE )
    socket.on('checkResultBeforeUpdate', function(skoczek){
	ResultsPost.findOne({jumper: skoczek}, function(err, jumper) {
	    if ( jumper == null) {
		socket.emit('checkedResultBeforeUpdate',{ jumper: 'Brak', nation: 'Brak',
			    jump1: '0', wind1: '0', nota1: '0',nota2: '0',nota3: '0',nota4: '0',nota5: '0',points1: '0',
			    jump2: '0', wind2: '0', nota6: '0',nota7: '0',nota8: '0',nota9: '0',nota10: '0',points2: '0', result: '0'});
	    } else {
		socket.emit('checkedResultBeforeUpdate',jumper);
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
    // Update pojedynczego wyniku skoczka
    socket.on('addUpdateResult',function(name,jnation,jjump1,jwind1,jnota1,jnota2,jnota3,jnota4,jnota5,jump1Points,
				      jjump2,jwind2,jnota6,jnota7,jnota8,jnota9,jnota10,jump2Points,jresult){
	ResultsPost.update({jumper: name}, {$set: { nation: jnation, jump1: jjump1, wind1: jwind1, nota1: jnota1, nota2: jnota2, nota3: jnota3, nota4: jnota4, nota5: jnota5,
			  points1: jump1Points, jump2: jjump2, wind2: jwind2, nota6: jnota6, nota7: jnota7, nota8: jnota8, nota9: jnota9, nota10: jnota10,
			  points2: jump2Points, result: jresult}}, function(err, jumper) {
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
    socket.on('loadResponsePosts', function(data)
	{
	ResponsePost.find().sort({'time': 1}).exec(function(err, posts) {
		socket.emit('responsePosts', posts);
	         });
	});
    socket.on('loadPMPosts', function(data)
	{
	PrivateMessagePost.find().sort({'time': 1}).exec(function(err, posts) {
		socket.emit('PMPosts', posts);
	         });
	});
    
    socket.on('removePM', function(msg){
	var index = msg.indexOf(":");
	var length = msg.length;
	var nickname = msg.substring(0,index);
	var text = msg.substring(index+1,length);
	console.log(nickname);
	console.log(text);
	PrivateMessagePost.remove({ nick: nickname, message: text }, function(err){
	    if (err) console.log("Błąd usuwania prywatnej wiadomosci z bazy "+err);
	});
    });
    
    socket.on('pmToAdmin', function(msg){
	var date = new Date();
	var strippedMsg = msg.message.replace(/(<([^>]+)>)/ig,"").trim();
	if (strippedMsg.length == 0) return;
	console.log(strippedMsg);
	var post = new PrivateMessagePost({ nick: msg.nick, message: strippedMsg, time: date});
	    post.save(function(err){
	    if (err) console.log("Błąd zapisu PM usera do bazy "+err);
	});
	io.emit('showToAdmin',{nick: msg.nick, message: strippedMsg});
	});
    
    socket.on('adminResponse', function(msg){
	var date = new Date();
	var hour = date.getHours();
	hour = (hour < 10 ? "0" : "") + hour;
	var min  = date.getMinutes();
	min = (min < 10 ? "0" : "") + min;
	var strippedMsg = msg.message.replace(/(<([^>]+)>)/ig,"").trim();
	if (strippedMsg.length == 0) return;
	var colorMsg = '<span style="color: red">'+strippedMsg+'</span>';
	// ----- funkcja umożliająca przesunięcie czasowe GMT ----- //
	Date.prototype.addHours = function(h){
	    this.setHours(this.getHours()+h);
	    return this;
	};
	var newDate = new Date().addHours(2);
	// -------------------------------------------------------- //
	var post = new ResponsePost({ nick: msg.nick, message: colorMsg, time: newDate});
	    post.save(function(err){
	    if (err) console.log("Błąd zapisu Response Admina do bazy "+err);
	});
	io.emit('responseToUser',{nick: msg.nick, message: colorMsg, time: hour+':'+min});
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