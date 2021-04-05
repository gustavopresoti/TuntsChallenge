import { google } from 'googleapis';

const spreadsheetId = process.env.SPREADSHEET_ID;

function updateSpreadsheet(auth) {
  const sheets = google.sheets({ version: 'v4', auth });

  sheets.spreadsheets.values.get(
    {
      spreadsheetId,
      range: 'A4:F',
    },
    (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);

      console.log('Accessing spreadsheet data...');

      const rows = res.data.values;

      if (rows.length) {
        let values = [];

        rows.map((row) => {
          let rowValue = [];

          if (row[2] > 0.25 * 60) {
            rowValue.push('Reprovado por Falta');
            rowValue.push(0);
            values.push(rowValue);
          } else {
            const media =
              (parseInt(row[3]) + parseInt(row[4]) + parseInt(row[5])) / 30;

            const naf = media >= 5 ? Math.floor(10 - media) : 0;

            if (media >= 7) {
              rowValue.push('Aprovado');
              rowValue.push(naf);
              values.push(rowValue);
            } else if (media < 5) {
              rowValue.push('Reprovado por Nota');
              rowValue.push(naf);
              values.push(rowValue);
            } else {
              rowValue.push('Exame Final');
              rowValue.push(naf);
              values.push(rowValue);
            }
          }
        });

        const data = [
          {
            range: '!G4:H',
            values,
          },
        ];

        const resource = {
          data,
          valueInputOption: 'RAW',
        };

        sheets.spreadsheets.values.batchUpdate(
          {
            spreadsheetId,
            resource,
          },
          (err, result) => {
            if (err) {
              console.log(err);
            } else {
              console.log(`${result.data.totalUpdatedCells} grades updated.`);
            }
          }
        );
      } else {
        console.log('Data not found!');
      }
    }
  );
}

export default { updateSpreadsheet };
