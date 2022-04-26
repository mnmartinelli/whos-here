import { PSDB } from 'planetscale-node';

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'max-age=0, s-maxage=300');
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version");

    //ask how to do two different requests in this endpoint
    //need to get all from db, match this user with one from db, change the timestamp for this user

    const auth = await fetch(`${this.authEndpoint}`).then(res => res.json());
    let result = auth;
    // result.forEach(node => {
    //   console.log(`ID: ${node.id} Last Accessed: ${node.last_accessed} Custom Hash: ${node.custom_hash}`);
    // });

    const conn = new PSDB('main', {namedPlaceholders: true});
    const { last_accessed } = req.query;
    var user = {
        last_accessed: last_accessed,
    };

    const [dbResult] = await conn.execute(`INSERT INTO users(id, last_accessed) VALUES (:id :last_accessed)`, user);
    

    user.id = dbResult.insertId;
    res.json(user);
}