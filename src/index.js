import credentials from './config/credentials.json';
import auth from './middlewares/auth.js';
import SpreadsheetController from './controller/SpreadsheetController.js';

auth.authorize(credentials, SpreadsheetController.updateSpreadsheet);
