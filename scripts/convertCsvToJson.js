// scripts/convertCsvToJson.js

const fs = require('fs');
const path = require('path');
const csv = require('csvtojson');

// Define the path to the CSV file
const csvFilePath = path.join(__dirname, '../data/AAPL_with_all.csv');

// Define the output paths for JSON files
const stockDataOutputPath = path.join(__dirname, '../public/data/stockData.json');
const financialStatementsOutputPath = path.join(__dirname, '../public/data/financialStatements.json');

const financialFields = [
  'Market Capitalization',
  'Revenue',
  'Gross Profit',
  'Gross Margin',
  'Net Income',
  'Profit Margin',
  'EPS (Diluted)',
  'Debt/Equity',
  'Operating Cash Flow',
  'Research & Development',
  'PE Ratio',
  'PS Ratio',
  'PB Ratio',
  'P/FCF Ratio',
  'P/OCF Ratio',
  'Quick Ratio',
];

// Define the corresponding 'Pct Change' fields
const pctChangeFields = financialFields.map(field => `${field} Pct Change`);

// Function to convert CSV to JSON
const convertCsvToJson = async () => {
  try {
    // Parse the CSV file into a JSON array
    const jsonArray = await csv().fromFile(csvFilePath);

    const stockData = [];
    const financialStatements = {};

    jsonArray.forEach((row) => {
      const date = row['Date'];

      // Extract stock data
      stockData.push({
        date: date,
        close: parseFloat(row['Close']),
      });

      // Extract financial statements
      const financialData = {};
      financialFields.forEach((field) => {
        let value = row[field];

        // Handle numerical values and percentages
        if (value) {
          // Remove any non-numeric characters (like $)
          value = value.replace(/[$]/g, '');

          // Convert to float if possible
          const numericValue = parseFloat(value);
          financialData[field] = isNaN(numericValue) ? value : numericValue;
        } else {
          financialData[field] = 'N/A';
        }
      });

      // Extract corresponding 'Pct Change' fields
      pctChangeFields.forEach((pctField) => {
        let value = row[pctField];

        if (value) {
          // Remove percentage sign and handle potential quotes
          value = value.replace(/[%"]/g, '');

          // Convert to float if possible
          const numericValue = parseFloat(value);

          // Handle special cases like 'inf', '-inf', 'N/A'
          if (isNaN(numericValue)) {
            if (value.toLowerCase() === 'inf' || value.toLowerCase() === '+inf') {
              financialData[pctField] = Infinity;
            } else if (value.toLowerCase() === '-inf') {
              financialData[pctField] = -Infinity;
            } else if (value.toLowerCase() === 'n/a') {
              financialData[pctField] = 'N/A';
            } else {
              financialData[pctField] = 'N/A';
            }
          } else {
            financialData[pctField] = numericValue;
          }
        } else {
          financialData[pctField] = 'N/A';
        }
      });

      financialStatements[date] = financialData;
    });

    // Write stockData.json
    fs.writeFileSync(stockDataOutputPath, JSON.stringify(stockData, null, 2));
    console.log(`Successfully written ${stockData.length} entries to stockData.json`);

    // Write financialStatements.json
    fs.writeFileSync(financialStatementsOutputPath, JSON.stringify(financialStatements, null, 2));
    console.log(`Successfully written financial statements to financialStatements.json`);

  } catch (error) {
    console.error('Error converting CSV to JSON:', error);
  }
};

// Execute the conversion
convertCsvToJson();
