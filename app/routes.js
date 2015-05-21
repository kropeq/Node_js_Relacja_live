var User            = require('./models/user');
var News            = require('./models/news.js');
var JumperPost          = require('./models/jumper');
var ResultsPost     = require('./models/results');
var ChatPost     = require('./models/chat');
var ResponsePost     = require('./models/response');
var PrivateMessagePost     = require('./models/privatemessage');

var bodyParser      = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({ extended: false })

module.exports = function(app){
    
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
	    console.log("Niby usun¹³");
	}
	else console.log("Nie uda³o siê usun¹æ");
    });
    
});

app.post('/editNews', urlencodedParser, function(req, res){
	if (!req.body.id) {
	    var news = new News({ content: req.body.content,title: req.body.title, time: Date.now() });
		news.save(function(err){
		if (err) {
		    console.log("B³¹d zapisu newsa do bazy "+err);
		    res.send('B³¹d zapisu do bazy '+err);
		    }
		else res.send('saved');
		});
	    }
	else {
	    News.update({_id: req.body.id}, {$set: { title: req.body.title, content: req.body.content}}, function(err, news) { 
		if (err) {
		    console.log("B³¹d zapisu newsa do bazy "+err);
		    res.send('B³¹d zapisu do bazy '+err);
		    }
		else res.send('saved');

		});
	    
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
app.post('/login', urlencodedParser, function(req, res){
    var login = req.body.login;
    var pass = req.body.pass;
    console.log(login + " " + pass);
    User.findOne({username: login, password: pass}, function(err,callback){
	if (callback == null){
		res.send('incorrect data');
	    } else {
		if (login == 'master' && pass == 'of disaster')
		{
		    req.session.admin = true;
		    req.session.user = false;
		    req.session.nick = "Admin";
		    console.log("Master admin logged");
		    res.send('logged');
		}
		else if ( login != 'master' ){
		    req.session.admin = false;
		    req.session.user = true;
		    req.session.nick = login.replace(/(<([^>]+)>)/ig,"");;
		    console.log("User logged");
		    res.send(login);
		} else {
		    res.send('incorrect password for master');
		}
	    }
    });
    
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
}
