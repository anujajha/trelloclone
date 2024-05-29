const express = require('express')
const app = express()
const port = 3000
const fs = require('fs');
const bodyParser = require('body-parser')

const path = require('path');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

//add the routes specific to the trello project
var trelloRouter = require('./trello-backend');



app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
    //res.send('Hello World!')
})

app.get('/getExample', (req, res) => {
  res.sendFile(path.join(__dirname, '/get.html'));
})

app.get('/homepage', (req, res) => {
  res.sendFile(path.join(__dirname, '/homePage.html'));
})

app.get('/trelloclone', (req, res) => {
  res.sendFile(path.join(__dirname, '/trello.html'));
})

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '/login.html'));
})

app.post('/login/post', (req, res) => {
  console.log('POST parameter received are: ', req.body);
  let email = req.body.email;
  let userpass = req.body.userpassword;

  fs.readFile(path.join(__dirname, '/users.json'), 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    let users = JSON.parse (data).users;
    let user = users.find(u => u.email == email);

    if (!user) {
      let errorMessage = {error: "User not found"};
      res.setHeader('Content-Type', 'application/json');
      res.status(404).send(JSON.stringify(errorMessage)); // Send a 404 Not Found status code
    } else if (String(user.password) !== String(userpass)) {
      let errorMessage = {error: "Invalid password"};
      res.setHeader('Content-Type', 'application/json');
      res.status(401).send(JSON.stringify(errorMessage)); // Send a 401 Unauthorized status code
    } else {
      let successMessage = {success: "User logged in successfully"};
      console.log(successMessage);
      res.setHeader('Content-Type', 'application/json');
      //res.send(JSON.stringify(successMessage));
      res.redirect('/trelloclone');
    }
  });
});


app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '/user-registration.html'));
})

app.post('/register/post', (req, res) => {
  console.log ('form post has arrived');
  console.log('POST parameter received are: ',req.body) 
  let userName = req.body.usersname;
  let phone = req.body.phone;
  let email = req.body.email;
  let userpass = req.body.userpassword;

  //we open the local file where we will hold the names of the users for now
  //this part will get replaced with some database at a later stage
  fs.readFile(path.join(__dirname, '/users.json'), 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    //console.log(data);

    let users = JSON.parse (data).users;
    //constraint:
    //a user cannot have a phone number & an email address similar to an existing user
    //check first before adding this user to the database
    var existsEmail = users.filter(u => u.email == email);
    var existsPhone = users.filter(u => u.phone == phone);

    let errorMessage = "";
      
    if (existsEmail.length > 0 || existsPhone.length > 0) {
      errorMessage = {error: "This user already exists!"}
      res.setHeader('Content-Type', 'application/json');
      //res.send (JSON.stringify(errorMessage));
      res.status(409).send(JSON.stringify(errorMessage)); // Send a 409 Conflict status code
    } else {
      users.push ({name:userName, email:email, phone:phone, password:userpass})
      //call function to save this users file
      saveUsersDatabase (users);
      console.log('New user registered.')
      //res.sendStatus(201); // Send a 201 Created status code
      res.redirect('/login');
    }


  });
});


//this function becomes a general function for any route to save thse users file
//the input to this function is the array of updated users
function saveUsersDatabase (users) {
  fs.writeFile (path.join(__dirname, '/users.json'), JSON.stringify({users:users}), function(err) {
    if (err){
      console.log(err);
      return;
    }
    console.log('Users database updated.');
    }
  );

}

app.get('/resume', (req, res) => {
  res.send('resume')
})


//an example to print the server request object
app.get('/request', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send('hello');
  res.send(JSON.stringify(req));
})

//an example to print the server response object
app.get('/response', (req, res) => {
  console.log (req);
  //res.setHeader('Content-Type', 'application/json');
  res.send('hello');
})


app.get('/js', (req, res) => {
    res.sendFile(path.join(__dirname, '/script.html'));
    //res.send('Hello World!')
})

app.get('/css', (req, res) => {
  res.sendFile(path.join(__dirname, '/css.html'));
  //res.send('Hello World!')
})

app.get('/fetch', (req, res) => {
  res.sendFile(path.join(__dirname, '/async.html'));
  //res.send('Hello World!')
})


//an example to demonstrate querystrings
//and how they are used to establish parameterized communication between client & server
app.get('/testq', (req, res) => {
  console.log (JSON.stringify(req.query));

  //check if the variable user is there in the querystring
  if (req.query.user) {
    res.send('user param exists in the url'); 
  }
  else {
    res.send('user param does NOT exist in the url'); 
  }
})


//self investigate .... form POST
app.post('/testq', (req, res) => {
  console.log (JSON.stringify(req.query));
  
  //check if the variable user is there in the querystring
  if (req.query.user) {
    res.send('user param exists in the url'); 
  }
  else {
    res.send('user param does NOT exist in the url'); 
  }
})

//this is an example of an entire data set delivered to the user
//e.g. the entire emails.json
app.get('/api/getEmails', (req, res) => {

  const emailsPath = path.join(__dirname, 'emails.json');

  fs.readFile(emailsPath, (err, data) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    const emails = JSON.parse(data);
  
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(emails));
  });
});


//this is an example of an entire data set delivered to the user
//e.g. the entire emails.json
app.get('/api/email/fetch/:uname', (req, res) => {

  var userName = req.params.uname;

  const emailsPath = path.join(__dirname, 'emails.json');

  fs.readFile(emailsPath, (err, data) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    const emails = JSON.parse(data);

    var filtered = emails.filter(e => e.to == userName);
  
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(filtered));
  });
});

// use this trello rouetr
app.use('/', trelloRouter);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})