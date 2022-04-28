import { PSDB } from 'planetscale-node';

export default async function handler(req, res) {
  const conn = new PSDB('main', {namedPlaceholders: true});
    const { last_accessed, custom_hash } = req.query;
    var user = {
        last_accessed: last_accessed,
        custom_hash: custom_hash,
    };

  const [dbResult] = await conn.execute(
    `UPDATE users SET last_accessed = '${user.last_accessed}' WHERE custom_hash='${user.custom_hash}'`
  );

  // res.setHeader('Cache-Control', 'max-age=0, s-maxage=30');
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version");
}