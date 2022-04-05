// @feedback
// aside from being in express, this looks like a simple way of interacting w/ your database
// just check on if you actually need all these fields vs being able to generate them
// off of the hash. I'd also be curious the difference in structure between username and custom_hash
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