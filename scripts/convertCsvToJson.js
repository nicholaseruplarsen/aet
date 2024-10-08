// scripts/convertCsvToJson.js

const fs = require('fs');
const path = require('path');
const csv = require('csvtojson');

// Define the base directories
const DATA_DIR = path.join(__dirname, '../data');
const PUBLIC_DATA_DIR = path.join(__dirname, '../public/data');

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

// Function to round a number to four decimal places
const roundToFour = (num) => {
  return Math.round(num * 10000) / 10000;
};

// Function to round a number to zero decimal places (integer)
const roundToZero = (num) => {
  return Math.round(num);
};

// Function to process a single CSV file and write JSON outputs
const processTickerCsv = async (ticker, csvFilePath, outputDir) => {
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
        console.warn(`[${ticker}] Invalid Close price on ${date}. Skipping entry.`);
        return; // Skip this row if Close price is invalid
      }

      // Round 'Close' to two decimals
      const closePrice = roundToTwo(closePriceRaw);

      // Extract 'Shares Outstanding (Basic)'
      let sharesOutstanding = row['Shares Outstanding (Basic)'];
      if (!sharesOutstanding || sharesOutstanding === 'N/A') {
        console.warn(`[${ticker}] Missing Shares Outstanding on ${date}. Setting to 0.`);
        sharesOutstanding = 0;
      } else {
        // Remove any commas and convert to float
        sharesOutstanding = parseFloat(sharesOutstanding.replace(/,/g, ''));
        if (isNaN(sharesOutstanding)) {
          console.warn(`[${ticker}] Invalid Shares Outstanding on ${date}. Setting to 0.`);
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
            // Check if the field is a ratio and round it appropriately
            if (ratioFields.includes(field)) {
              if (field === 'Gross Margin' || field === 'Profit Margin') {
                numericValue = roundToFour(numericValue);
              } else {
                numericValue = roundToTwo(numericValue);
              }
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
    const stockDataOutputPath = path.join(outputDir, 'stockData.json');
    fs.writeFileSync(stockDataOutputPath, JSON.stringify(stockData, null, 2));
    console.log(`[${ticker}] Successfully written ${stockData.length} entries to stockData.json`);

    // Write financialStatements.json with rounded values
    const financialStatementsOutputPath = path.join(outputDir, 'financialStatements.json');
    fs.writeFileSync(financialStatementsOutputPath, JSON.stringify(financialStatements, null, 2));
    console.log(`[${ticker}] Successfully written financial statements to financialStatements.json`);

  } catch (error) {
    console.error(`[${ticker}] Error converting CSV to JSON:`, error);
  }
};

// Function to retrieve all ticker directories within the data folder
const getAllTickers = () => {
  try {
    const tickers = fs.readdirSync(DATA_DIR).filter(dir => {
      const fullPath = path.join(DATA_DIR, dir);
      return fs.statSync(fullPath).isDirectory();
    });
    return tickers;
  } catch (error) {
    console.error('Error reading data directory:', error);
    return [];
  }
};

// Main conversion function
const convertCsvToJson = async () => {
  const tickers = getAllTickers();

  if (tickers.length === 0) {
    console.warn('No ticker directories found in data folder.');
    return;
  }

  for (const ticker of tickers) {
    const tickerDir = path.join(DATA_DIR, ticker);
    const csvFileName = `${ticker}_with_all.csv`;
    const csvFilePath = path.join(tickerDir, csvFileName);

    if (!fs.existsSync(csvFilePath)) {
      console.warn(`CSV file ${csvFileName} not found for ticker ${ticker}. Skipping...`);
      continue;
    }

    // Define the output directory for the ticker
    const outputDir = path.join(PUBLIC_DATA_DIR, ticker);

    // Create the output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`Created directory ${outputDir}`);
    }

    // Process the CSV and generate JSON files
    await processTickerCsv(ticker, csvFilePath, outputDir);
  }

  console.log('All CSV to JSON conversions completed.');
};

// Execute the conversion
convertCsvToJson();
