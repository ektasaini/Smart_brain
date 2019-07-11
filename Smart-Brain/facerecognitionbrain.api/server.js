const express= require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors= require('cors');
const knex = require('knex');

const db=knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : '1234',
    database : 'postgres'
  }
});

/*body parser is a middleware therefor to user it we need app.use*/



const app = express();
app.use(bodyParser.json());
app.use(cors());


/*----------home----------*/


app.get('/',(req,res)=>{
	res.send(database.users);

})

/*-----------signin--------*/

app.post('/signin',(req,res)=>{
 db.select('email','hash').from('login')
 .where('email','=',req.body.email)
 .then(data=>{
 	const isValid = bcrypt.compareSync(req.body.password,data[0].hash);
 	if (isValid){
 		return db.select('*').from('users')
 		.where('email','=',req.body.email)
 		.then(user=>{
 			
 			res.json(user[0])
 		})
 		.catch(err=>res.status(400).json('unabe to get user'))
 	}
 	else
 	{res.status(400).json('wrong credentials')}
 })
.catch(err=>res.status(400).json('wrong credentials'))
})

// 	bcrypt.compare("apples", '$2a$10$Y3LC6w0EBTHcwl7TX3hMJOO4kpnM9MV2XrhQ.b9dVdgOTyhW4w9Ri', function(err, res) {
//     // res == true
//     console.log('firstguess', res);
// });
// bcrypt.compare("veggies", '$2a$10$Y3LC6w0EBTHcwl7TX3hMJOO4kpnM9MV2XrhQ.b9dVdgOTyhW4w9Ri', function(err, res) {
//     // res = false
//     console.log('secondguess',res);
// });

// 	/*for it to know req.body we need body-parser*/
//     if (req.body.email === database.users[0].email &&
//     	req.body.password===database.users[0].password)
// 	{res.json(database.users[0]);}
// else{
// 	res.status(200).json('error logging in');
// }
// 	/*.json is similar to .send but with some additional features
// 	json returns a string and send returns normal text*/
// })

/*----------register-----------*/

app.post('/register',(req,res)=>{
	const{email, password, name}= req.body;
    const hash= bcrypt.hashSync(password);
	// bcrypt.hash(password, null, null, function(err, hash) {
 //    console.log(hash);
 //     });

	/*adding new user to database*/

	db.transaction(trx=>{
		trx.insert({
			hash:hash,
			email:email
		})
		.into('login')
		.returning('email')
		.then(loginEmail=>{

			return trx('users')
	.returning('*')
	.insert({
		email:loginEmail[0],
		name:name,
		joined:new Date()
	}).then(user=>{
      res.json(user[0]);
	})
		})

		.then(trx.commit)
		.catch(trx.rollback)
	})
	
	.catch(err=>res.status(400).json('unable to register'))
})

/*----------profile---------------*/


app.get('/profile/:id',(req,res)=>{
	const{id}=req.params;
	/*let as we are reasigning it */
	

	db.select('*').from('users').where({id})
	.then(user=>{
		
		if(user.length){
			res.json(user[0])
		}
		else{
			res.status(400).json('not found')
		}
		
	})
	.catch(err=> res.status(400).json('not found'))

})

/*-------------image------------*/

app.put('/image',(req,res)=>{
	const{id}=req.body;
	db('users').where('id','=',id)
	.increment('enteries',1)
	.returning('enteries')
	.then(enteries=>{
		res.json(enteries[0]);
	})
	.catch(err=> res.status(400).json('unable to get enteries'))
})
/*----------bcrypt npm ----------*/

// bcrypt.hash("bacon", null, null, function(err, hash) {
//     // Store hash in your password DB.
// });

// // Load hash from your password DB.
// bcrypt.compare("bacon", hash, function(err, res) {
//     // res == true
// });
// bcrypt.compare("veggies", hash, function(err, res) {
//     // res = false
// });


/*------------------------*/

app.listen(3000,()=>{
	console.log('app is running on port 3000');
})