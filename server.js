const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const {check, validationResult} = require('express-validator');


const app = express();

//Middleware

app.use(express.static(__dirname));
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({extended:true}));
app.use(bodyParser.urlencoded({extended:true}));
dotenv.config();

app.use(session({
    secret:'hftrvh4573gv',
    resave:false,
    saveUninitialized: false
}));



//Create connection
const connection = mysql.createConnection({
    host:process.env.HOST,
    user:process.env.USER,
    password:process.env.PASSWORD
});


///Check connection //Connect to database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database: ' + err.stack);
        return;
    }
    console.log('Connected to the database successfully!');
});


//Create database
connection.query('CREATE DATABASE if not exists logistics', (err, result) => {
    if (err) throw (err)
    console.log('Database created successfully');
});


//Access database
connection.query('USE logistics', (err, result) => {
    if(err) throw (err)
        console.log('Database accessed successfully');
});


//Create Tables
const user = `CREATE TABLE user (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL
)`;  

const trackers = `CREATE TABLE trackers (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    userid INT NOT NULL,
    vehicle_type VARCHAR(200) NOT NULL,
    number_plate VARCHAR(50) NOT NULL,
    item_transported VARCHAR(255) NOT NULL,
    quantity_kgs INT NOT NULL,
    departure_location VARCHAR(255) NOT NULL,
    destination VARCHAR(255),
    date DATE NOT NULL,
    FOREIGN KEY (userid) REFERENCES user(id) ON DELETE CASCADE
)`;

connection.query(user, (err, result) => {
    if (err) {
        console.error('Error creating Users Table:', err);
        return;
    }
    console.log('User Table created successfully');
});

connection.query(trackers, (err, result) => {
    if (err) {
        console.error('Error creating Tracker Table:', err);
        return;
    }
    console.log('Tracker Table created successfully');
});




//Display routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
  
app.get('/signin',(req, res) => {
    res.sendFile(path.join(__dirname, 'signin.html'));
});


app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'signup.html'));
});



app.get('/tracker', (req, res) => {
    res.sendFile(path.join(__dirname, 'tracker.html'));
});




//Create user
const User = {
    tableName: 'user', 
    createUser: function(newUser, callback) {
        connection.query('INSERT INTO ' + this.tableName + ' SET ?', newUser, callback);
    },  

    getUserByEmail: function(email, callback) {
        connection.query('SELECT * FROM ' + this.tableName + ' WHERE email = ?', email, callback);
    },
    getUserByUsername: function(username, callback) {
        connection.query('SELECT * FROM ' + this.tableName + ' WHERE username = ?', username, callback);
    }
};




//Routes
//Signup Route
app.post('/signup', [
    check('email').isEmail().withMessage('Please provide a valid email address'),
    check('username').isAlphanumeric().withMessage('Username must be alphanumeric'),

    
    check('email').custom(async (value) => {
        const user = await User.getUserByEmail(value);
        if (user) {
            throw new Error('Email already exists!');
        }
    }),
    check('username').custom(async (value) => {
        const user = await User.getUserByUsername(value);
        if (user) {
            throw new Error('Username already exists!');
        }
    })

    
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()});
    }
   
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

   
    const newUser = {
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
    };

  
    User.createUser(newUser, (error, results, fields) => {
        if (error) {
            console.error('Error inserting user record: ' + error.message);
            return res.status(500).json({ error: error.message });
        }

        console.log('Inserted a new user successfully');
        res.redirect('/signin');
      });
});




//Signin Route
app.post('/signin', (req,res) => {
    const { username, password} = req.body;
    
    connection.query('SELECT * FROM user WHERE username = ?', [username], (err, results) => {
        if (err) throw err;

        if (results.length === 0) {
            console.log('No user found');
            res.status(401).send('Invalid username or password');
        } else {
            const user = results[0];
                    
                bcrypt.compare(password, user.password,  (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                    req.session.user = user;
                    console.log('User authenticated successfully:' , username);
                    res.redirect('/tracker');
                } else {
                    res.status(401).send('Invalid username or password');
                }
            });
        }
        
       
    });
});



//Logout route
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Session destruction error:', err);
            return res.status(500).send('Logout failed');
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        res.status(200).send('Logged out');
    });
});



app.post('/tracker', (req, res) => { 
    const {userid, vehicle_type, number_plate, item_transported, quantity_kgs, departure_location, destination, date } = req.body;    

    // Ensure all required fields are available
    if (!userid || !vehicle_type || !number_plate || !item_transported || !quantity_kgs || !departure_location || !destination || !date) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const query = 'INSERT INTO trackers (`userid`, `vehicle_type`, `number_plate`, `item_transported`, `quantity_kgs`, `departure_location`, `destination`, `date`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    console.log('SQL Query:', query);
    console.log('Values:', [userid, vehicle_type, number_plate, item_transported, quantity_kgs, departure_location, destination, date]);

    connection.query(query, [userid, vehicle_type, number_plate, item_transported, quantity_kgs, departure_location, destination, date], (err, result) => {
        if (err) {    
            return res.status(500).json({ error: err.message });    
        }
         res.redirect('/tracker');
    });
});


app.listen(2400, () => {
    console.log('Server running at port 2400')
});