require('dotenv').config();
const express = require('express')
const app = express()
const port = process.env.PORT || 3000

const mysql = require('mysql2')


// connection.connect()

// function createUser() {

// }

export default async function handler(req, res) {
    const { username, last_accessed, colors, custom_hash, keep_or_delete } = req.query;

    var user = {
        username: username,
        last_accessed: last_accessed,
        colors: colors,
        custom_hash: custom_hash,
        keep_or_delete: keep_or_delete,
    };

    const connection = mysql.createConnection(process.env.DATABASE_URL);
    
    const [dbResult] = await connection.execute(
        `INSERT INTO users(id, username, last_accessed, colors, custom_hash, keep_or_delete) VALUES ( :username, :last_accessed, :colors, :custom_hash, :keep_or_delete)`, user
    );

    user.id = dbResult.insertId;
    res.json(user);
}



// app.post('/addNewUser', (req, res) => {
//   connection.query('INSERT INTO `users` (id, username, last_accessed, colors, custom_hash, keep_or_delete) VALUES ( :username, :last_accessed, :colors, :custom_hash, :keep_or_delete);', function (err, rows, fields) {
//     if (err) throw err

//     res.send(rows)
//   })
// })

// app.listen(port, () => {
//   console.log(`Example app listening at http://localhost:${port}`)
// })