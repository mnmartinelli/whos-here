//add stuff to delete the user

import { PSDB } from 'planetscale-node';

export default async function handler(req, res) {
    const conn = new PSDB('main', {namedPlaceholders: true});
    const { custom_hash } = req.query;
    var user = {
        custom_hash: custom_hash,
    };

    let deleted_user;

    const auth = await fetch(`${this.authEndpoint}`).then(res => res.json());
    let result1 = auth;
    result1.forEach(node => {
        if(user.custom_hash == node.custom_hash){
            deleted_user = user.custom_hash;

        }
        console.log(`ID: ${node.id} Last Accessed: ${node.last_accessed} Custom Hash: ${node.custom_hash}`);
    });

    const [dbResult] = await conn.execute(
        `DELETE FROM users WHERE custom_hash = ${deleted_user}`
    );

    res.setHeader('Cache-Control', 'max-age=0, s-maxage=300');
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version");

    user.id = dbResult.insertId;
    res.json(user);

    
}