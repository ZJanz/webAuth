require('dotenv').config()

const argon2 = require('argon2');
const readline = require('readline')
const express = require('express');
const path = require('path');
const app = express();
const mysql   = require('mysql');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname, 'public')));






const db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'crimeosucksballs336',
  database : 'userInfo'
});

//Connect
db.connect((err) => {
	if(err){
		throw err;
	}
	console.log("MySql Connected....")
});




// const rl = readline.createInterface({
// 	input: process.stdin,
// 	output: process.stdout
// })

// rl.question("Enter your password:", async (password) => { 
// 	const hash = await argon2.hash(password, {type: argon2.argon2id})
// 	console.log(`Hash: ${hash}`)
// })

// var sql = '';

async function createAccount(email, username, password){
	const hash = await argon2.hash(password, {type: argon2.argon2id})
	console.log(hash)
	let sql = `INSERT INTO accounts VALUES(DEFAULT, '${email}', '${username}', '${hash}')`
	let query = db.query(sql, (err, result)=> {
		if(err) throw err;
		console.log(result);
	});
	
	let sql2 = `INSERT INTO players VALUES(DEFAULT, '${username}', 2000, 2000, 0, 10, null)`
	let query2 = db.query(sql2, (err, result)=> {
		if(err) throw err;
		console.log(result);
	});

}

// app.get('/signup/:email/:username/:password', (req,res) => {
// 	createAccount(req.params.email, req.params.username, req.params.password)
// 	res.send(`${req.params.email}, ${req.params.username}, ${req.params.password}`)
// });

var access=false;
async function signIn(email, username, password, hash){
	
		try {
	  		if (await argon2.verify(hash, password)) {
	    	// password match
	    	access=true;
	    	console.log("Password Matched")
	  			} else {
	    	// password did not match
	    	console.log("Password didn't match")
	    	access=false;
	  			}
			} 
			catch (err) {
	  		// internal failure
	  		throw err;
	} 
}


// app.get('/signin/:email/:username/:password', (req,res) => {
// 	signIn(req.params.email, req.params.username, req.params.password);
// 	res.send("signing in");
// });

app.get("/", function(req,res){
	res.redirect("/login");
})

app.get("/login", (req,res) => {
	res.render("login.ejs");
})

app.post("/signintoaccount", (req,res)=>{
	console.log(req.body.email, req.body.username, req.body.password)
	let sql = `SELECT password FROM accounts WHERE email LIKE '${req.body.email}' `

	let query = db.query(sql, (err, result)=> {
		if(err) {throw err;} else{
			signIn(req.body.email, req.body.username, req.body.password, result[0].password).then(() => {
				if(access===true){
					const username = req.body.username
					const user = {name: username}

					const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
					res.render("loginSuccess.ejs", {accessToken: accessToken})
				} else{
					res.send("wrong password")
				}
			})
			
		}
	});


})

app.get("/signup", (req,res) => {
	res.render("signup.ejs");
})

app.post("/createaccount", (req,res)=>{
	createAccount(req.body.email, req.body.username, req.body.password)
	res.redirect("/getaccounts")
})

app.get("/getaccounts", (req,res) => {
	let sql = 'SELECT * FROM accounts'
	let query = db.query(sql, (err, result) => {
		if(err) throw err;
		console.log(result)
		res.render("accounts.ejs", {accounts:result})
	})
})

app.get("/posts", (req,res)=>{
	let sql = 'SELECT * FROM posts'
	let query = db.query(sql, (err, result) => {
		if(err) throw err;
		console.log(result)
		res.render("posts.ejs", {posts:result})
	})
})

//add authenticateToken
app.post("/createpost", (req,res)=>{
	createPost(req.body.username, req.body.title, req.body.content)
	res.redirect("/posts")
})


function createPost(username, title, content){

}

function authenticateToken(req, res, next) {
	const authHeader = req.headers['authorization']
	const token = authHeader && authHeader.split(' ')[1]
	if (token == null) return res.sendStatus(401)

	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
		if (err) return res.sendStatus(403)
		req.user = user
		next()
	})
}





app.get('/createtable', (req,res) => {
let sql ='CREATE TABLE players(id int AUTO_INCREMENT, username VARCHAR(255), x int, y int, wood int, health int, PRIMARY KEY (id))';
db.query(sql, (err, result) =>{
		if(err) throw err;
		console.log(result);
	});
})



// app.get('/createdb', (req,res) => {
// 	let sql ='CREATE DATABASE userInfo'
// 	db.query(sql, (err, result) =>{
// 			if(err) throw err;
// 			console.log(result);
// 			res.send('database created...')
// 		} 
// 	)
// })


// Example

// db.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
//   if (error) throw error;
//   console.log('The solution is: ', results[0].solution);
// });

// db.end();


app.listen('3000', () => {
	console.log('Server started on port 3000')
})


