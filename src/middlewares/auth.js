import fs from 'fs';
import readline from 'readline';
import { google } from 'googleapis';
import open from 'open';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'src/config/token.json';

fs.readFile(TOKEN_PATH, (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);

  authorize(JSON.parse(content), updateSpreadsheet);
});

function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  console.log('Verifying authorization...');

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);

    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('Redirecting to authorize app url...');
  (await open(authUrl))();

  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();

    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        return console.error(
          'Error while trying to retrieve access token',
          err
        );
      }

      oAuth2Client.setCredentials(token);

      console.log('Generating token...');

      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);

        console.log('Token stored to', TOKEN_PATH);
      });

      callback(oAuth2Client);
    });
  });
}

export default { authorize };
