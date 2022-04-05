// @feedback - you'll have to sell me on the need for this endpoint at all
require('dotenv').config();
const express = require('express')
const app = express()
const port = process.env.PORT || 3000

const mysql = require('mysql2')

//
//
//needs some work
export default async function handler(req, res) {
    const { oldUsername, newUsername } = req.query;

    var updatedUser = {
        username: newUsername,
    };

    const connection = mysql.createConnection(process.env.DATABASE_URL);
    
    //get the ID somewhere up here to compare below
    //updateUser.id = dbResult.insertId;

    //is this how updates work?
    const [dbResult] = await connection.execute(
        `UPDATE users
            SET
                username = :newUsername
            WHERE
                username = :oldUsername`
    );

    res.json(user);
}