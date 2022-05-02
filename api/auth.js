// @feedback I'd collaborate w/ the comment team to see how they are handling auth
// and if you are both thinking of it in similar ways

import { PSDB } from 'planetscale-node';

export default async function handler(req, res) {
  const conn = new PSDB('main');
  const [dbResult] = await conn.query('select custom_hash, last_accessed from users');
  // res.setHeader('Cache-Control', 'max-age=0, s-maxage=30');
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version");
  res.json(await dbResult);
}