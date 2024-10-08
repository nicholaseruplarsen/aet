import yfinance as yf
import pandas as pd
import os

# List of tickers
tickers = ['TSLA', 'GOOGL', 'NVDA', 'AMZN', 'MSFT']

# Create main data folder if it doesn't exist
if not os.path.exists('data'):
    os.makedirs('data')

# Download data for all tickers
for ticker in tickers:
    # Download data
    data = yf.download(ticker, interval='1d', period='max')
    
    # Select only the required columns
    data = data[['Close', 'Volume']]
    data = data.reset_index()
    
    print(f"Downloaded data for {ticker}")

    # Create folder for each ticker
    ticker_folder = os.path.join('data', ticker)
    if not os.path.exists(ticker_folder):
        os.makedirs(ticker_folder)

    # Save data to CSV file in the ticker's folder
    filename = os.path.join(ticker_folder, f"{ticker}.csv")
    data.to_csv(filename, index=False)
    print(f"Saved data for {ticker} to {filename}")

print("Data download and save complete.")