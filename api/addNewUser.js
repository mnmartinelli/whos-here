require('dotenv').config();
const express = require('express')
const app = express()
const port = process.env.PORT || 3000

const mysql = require('mysql2')

const connection = mysql.createConnection(process.env.DATABASE_URL);

//is the connection.execute() essentially doing this already?
connection.connect()

app.post('/addNewUser', (req, res) => {
    const { username, last_accessed, colors, custom_hash, keep_or_delete } = req.query;

    var user = {
        username: username,
        last_accessed: last_accessed,
        colors: colors,
        custom_hash: custom_hash,
        keep_or_delete: keep_or_delete,
    };

    const [dbResult] = await connection.execute(
        `INSERT INTO users(id, username, last_accessed, colors, custom_hash, keep_or_delete) VALUES ( :username, :last_accessed, :colors, :custom_hash, :keep_or_delete)`, user
    );

    user.id = dbResult.insertId;
    res.json(user);
})