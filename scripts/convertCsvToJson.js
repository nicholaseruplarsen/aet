// scripts/convertCsvToJson.js

const fs = require('fs');
const path = require('path');
const csv = require('csvtojson');

// Define the path to the CSV file
const csvFilePath = path.join(__dirname, '../data/AAPL_with_all.csv');

// Define the output paths for JSON files
const stockDataOutputPath = path.join(__dirname, '../public/data/stockData.json');
const financialStatementsOutputPath = path.join(__dirname, '../public/data/financialStatements.json');

// Define the financial fields to extract
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

// List of ratio fields that need to be rounded
const ratioFields = [
  'Gross Margin',
  'Profit Margin',
  'Debt/Equity',
  'PE Ratio',
  'PS Ratio',
  'PB Ratio',
  'P/FCF Ratio',
  'P/OCF Ratio',
  'Quick Ratio',
];

// Function to round a number to two decimal places
const roundToTwo = (num) => {
  return Math.round(num * 100) / 100;
};

// Function to round a number to zero decimal places (integer)
const roundToZero = (num) => {
  return Math.round(num);
};

// Function to convert CSV to JSON
const convertCsvToJson = async () => {
  try {
    // Parse the CSV file into a JSON array
    const jsonArray = await csv().fromFile(csvFilePath);

    const stockData = [];
    const financialStatements = {};

    jsonArray.forEach((row) => {
      const date = row['Date'];

      // Extract 'Close' price
      const closePriceRaw = parseFloat(row['Close']);
      if (isNaN(closePriceRaw)) {
        console.warn(`Invalid Close price on ${date}. Skipping entry.`);
        return; // Skip this row if Close price is invalid
      }

      // Round 'Close' to two decimals
      const closePrice = roundToTwo(closePriceRaw);

      // Extract 'Shares Outstanding (Basic)'
      let sharesOutstanding = row['Shares Outstanding (Basic)'];
      if (!sharesOutstanding || sharesOutstanding === 'N/A') {
        console.warn(`Missing Shares Outstanding on ${date}. Setting to 0.`);
        sharesOutstanding = 0;
      } else {
        // Remove any commas and convert to float
        sharesOutstanding = parseFloat(sharesOutstanding.replace(/,/g, ''));
        if (isNaN(sharesOutstanding)) {
          console.warn(`Invalid Shares Outstanding on ${date}. Setting to 0.`);
          sharesOutstanding = 0;
        }
      }

      // Calculate Market Capitalization
      const marketCapRaw = closePriceRaw * sharesOutstanding;

      // Round 'Market Capitalization' to zero decimals
      const marketCap = roundToZero(marketCapRaw);

      // Extract stock data with rounded values
      stockData.push({
        date: date,
        close: closePrice,
        marketCap: marketCap,
      });

      // Extract financial statements
      const financialData = {};
      financialFields.forEach((field) => {
        let value = row[field];

        // Handle numerical values and percentages
        if (value && value !== 'N/A') {
          // Remove any non-numeric characters (like $ and commas)
          value = value.replace(/[$,]/g, '');

          // Convert to float if possible
          let numericValue = parseFloat(value);
          if (!isNaN(numericValue)) {
            // Check if the field is a ratio and round it
            if (ratioFields.includes(field)) {
              numericValue = roundToTwo(numericValue);
            }
            financialData[field] = numericValue;
          } else {
            financialData[field] = value;
          }
        } else {
          financialData[field] = 'N/A';
        }
      });

      // Extract corresponding 'Pct Change' fields
      pctChangeFields.forEach((pctField) => {
        let value = row[pctField];

        if (value && value !== 'N/A') {
          // Remove percentage sign and handle potential quotes
          value = value.replace(/[%"]/g, '');

          // Convert to float if possible
          let numericValue = parseFloat(value);

          // Handle special cases like 'inf', '-inf', 'N/A'
          if (isNaN(numericValue)) {
            if (value.toLowerCase() === 'inf' || value.toLowerCase() === '+inf') {
              financialData[pctField] = Infinity;
            } else if (value.toLowerCase() === '-inf') {
              financialData[pctField] = -Infinity;
            } else {
              financialData[pctField] = 'N/A';
            }
          } else {
            // Round percentage changes to two decimals
            numericValue = roundToTwo(numericValue);
            financialData[pctField] = numericValue;
          }
        } else {
          financialData[pctField] = 'N/A';
        }
      });

      financialStatements[date] = financialData;
    });

    // Write stockData.json with rounded values
    fs.writeFileSync(stockDataOutputPath, JSON.stringify(stockData, null, 2));
    console.log(`Successfully written ${stockData.length} entries to stockData.json`);

    // Write financialStatements.json with rounded values
    fs.writeFileSync(financialStatementsOutputPath, JSON.stringify(financialStatements, null, 2));
    console.log(`Successfully written financial statements to financialStatements.json`);

  } catch (error) {
    console.error('Error converting CSV to JSON:', error);
  }
};

// Execute the conversion
convertCsvToJson();
