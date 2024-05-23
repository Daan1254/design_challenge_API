const express = require('express');
const cors = require("cors");
const bodyParser = require('body-parser');
const app = express(); 


const port =  3000; 

const mysql = require('mysql')

const connection = mysql.createConnection({ 
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'eco_steps'
})

connection.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
  
    console.log('connected as id ' + connection.threadId);
});


app.use(cors());

app.use(bodyParser.json());
// 404 not found
// 400 bad request 
// 200 success
// 201 created & edited

function fetchDataFromDatabase(query, cb) {
    try {
        connection.query(query, (err, rows, fields) => { // Database request
            if (err) throw err;
          
           cb(rows);
        });
        console.log(data)
    } catch(e) {
        console.error("Something went wrong");
    }
}

app.get('/user', (req, res) => {
    fetchDataFromDatabase("SELECT * FROM user", (data) => {
        res.json(data);
    });
});


app.get("/test", (req, res) => {
    console.log("Request received");
    res.json({
        ok: true
    })
})

app.get('/product', (req, res) => {
    fetchDataFromDatabase(`SELECT * FROM product`, (data) => {
        res.json(data);
    });
});

app.get('/gym', (req, res) => {
    fetchDataFromDatabase(`SELECT * FROM gym`, (data) => {
        res.json(data);
    });
});

app.get('/user/:id', (req, res) => {

    const id = req.params.id;

    if (!id || isNaN(id)) {
        res.json({
            statusCode: 400,
            message: "Invalid parameter id"
        })
        
    } else {
        fetchDataFromDatabase(`
        SELECT 
            user.*, 
            user.name AS user_name, 
            gym.*, 
            gym.name AS gym_name, 
            points_history.*,
            points_history.id as points_history_id
        FROM 
            user
        INNER JOIN 
            gym ON user.gym_id = gym.id
        LEFT JOIN 
            points_history ON user.id = points_history.userId
        WHERE 
            user.id = ${req.params.id}
    `, (data) => {
        // Prepare response object
        const userData = {
            id: data[0].id,
            name: data[0].user_name,
            date_of_birth: data[0].date_of_birth,
            sex: data[0].sex,
            points: data[0].points,
            goal: data[0].goal,
            start_membership: data[0].start_membership,
            gym: {
                id: data[0].gym_id,
                name: data[0].gym_name,
                website: data[0].website,
                address: data[0].address
            },
            points_history: []
        };
    
        // Loop through each row of points_history and add to userData
        data.forEach(row => {
            if (row.points_history_id) {
                // Assuming points_history_id is the primary key of points_history
                userData.points_history.push({
                    id: row.points_history_id,
                    user_id: row.userId,
                    points_earned: row.amount,
                    date: row.date,
                    kcal_burned: row.kcal_burned
                    // Add more fields from points_history as needed
                });
            }
        });
    
        // Send the response
        res.json(userData);
    });
    
    }
});

app.get('/product/:id', (req, res) => {
    fetchDataFromDatabase(`SELECT * FROM product WHERE id = ${req.params.id}`, (data) => {
        res.json(data[0]);
    });
});

app.get('/gym/:id', (req, res) => {
    fetchDataFromDatabase(`SELECT * FROM gym WHERE id = ${req.params.id}`, (data) => {
        res.json(data[0]);
    });
});

app.post("/user", (req, res) => {
    const body = req.body;
    const amount = body.amount;
    const userId = body.userId;
    const kcalBurned = body.kcal_burned;
    
    // Insert query using parameterized query and proper syntax
    const query = "INSERT INTO points_history (amount, userId, kcal_burned, date) VALUES (?, ?, ?, NOW())";
    
    connection.query(query, [amount, userId, kcalBurned], (error, results, fields) => {
        if (error) {
            console.error("Error inserting into points_history:", error);
            // Handle error appropriately (e.g., return error response)
        } else {
            console.log("Successfully inserted into points_history");
            // Handle success appropriately (e.g., return success response)
        }
    });
})

// GET request die 1 user ophaald opgeven id (table: user)
// GET alle producten ophalen (table: product)
// GET 1 product ophalen (table: product)
// GET 1 gym (table: gym)
// GET alle gyms (table: gym)

// res.json
// res.text



app.listen(port, () => {
    console.log(`API Running at port ${port}`) // Start applicatie
})
