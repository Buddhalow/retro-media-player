import fs from 'fs'
import jwt from 'jsonwebtoken'

const privateKey = fs.readFileSync("AuthKey.p8").toString();
const teamId     = process.env.APPLE_MUSIC_TEAM_ID;
const keyId      = process.env.APPLE_MUSIC_KEY_ID;

const jwtToken = jwt.sign({}, privateKey, {
  algorithm: "ES256",
  expiresIn: "180d",
  issuer: teamId,
  header: {
    alg: "ES256",
    kid: keyId
  }
});

console.log(jwtToken);
