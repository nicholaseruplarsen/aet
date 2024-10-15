# stocks/scripts/dataprocessing.py

import os
import csv
import pandas as pd
import numpy as np
import re
from pathlib import Path

# Define paths
DATA_DIR = Path('./data')

# Function to extract the first column from a CSV file
def get_first_column(csv_file_path):
    first_column = []
    with open(csv_file_path, 'r', newline='', encoding='utf-8') as file:
        csv_reader = csv.reader(file)
        header = next(csv_reader, None)  # Skip header if present
        for row in csv_reader:
            if row:  # Check if the row is not empty
                first_column.append(row[0])
    return first_column

# Function to preprocess quarterly data
def preprocess_quarterly_data(file_path):
    df = pd.read_csv(file_path)
    # Set 'Date' as the index and transpose the DataFrame
    df.set_index('Date', inplace=True)
    df = df.T
    # Reset index to turn the date index into a column
    df.reset_index(inplace=True)
    df.rename(columns={'index': 'Date'}, inplace=True)
    # Remove timezone information from 'Date' column
    df['Date'] = df['Date'].apply(lambda x: re.sub(r'[-+]\d{2}:\d{2}$', '', x))
    # Convert 'Date' column to datetime format
    df['Date'] = pd.to_datetime(df['Date'], errors='coerce')
    # Sort the DataFrame by 'Date'
    df = df.sort_values('Date')

    # Function to clean percentage values
    def clean_percentage(x):
        if isinstance(x, str) and x.endswith('%'):
            try:
                return float(x.strip('%')) / 100
            except ValueError:
                return np.nan
        return x

    # Apply the cleaning function to all columns except 'Date'
    for col in df.columns.drop('Date'):
        df[col] = df[col].apply(clean_percentage)

    # Convert all columns to numeric, coercing errors to NaN
    numeric_cols = df.columns.drop('Date')
    df[numeric_cols] = df[numeric_cols].apply(pd.to_numeric, errors='coerce')

    return df

# Function to safely divide two Series
def safe_divide(numerator, denominator):
    return numerator / denominator.replace({0: np.nan})

# Function to recalculate financial ratios
def recalculate_ratios(df):
    # Prepare a dictionary to hold all new ratio calculations
    new_cols = {
        'PE Ratio': safe_divide(df['Market Capitalization'], df['Net Income']),
        'PS Ratio': safe_divide(df['Market Capitalization'], df['Revenue']),
        'PB Ratio': safe_divide(df['Market Capitalization'], df['Shareholders Equity']),
        'Debt/Equity': safe_divide(df['Total Debt'], df['Shareholders Equity']),
        'Quick Ratio': safe_divide(df['Total Current Assets'] - df['Inventory'], df['Total Current Liabilities']),
        'Current Ratio': safe_divide(df['Total Current Assets'], df['Total Current Liabilities']),
        'Asset Turnover': safe_divide(df['Revenue'], df['Total Assets']),
        'Return on Equity (ROE)': safe_divide(df['Net Income'], df['Shareholders Equity']),
        'Return on Assets (ROA)': safe_divide(df['Net Income'], df['Total Assets']),
        # Calculate Tax Rate, NOPAT, and Invested Capital
        'Tax Rate': safe_divide(df['Income Tax'], df['Pretax Income']).fillna(0),
        'NOPAT': df['Operating Income'] * (1 - safe_divide(df['Income Tax'], df['Pretax Income']).fillna(0)),
        'Invested Capital': df['Total Debt'] + df['Shareholders Equity'] - df['Cash & Cash Equivalents'],
        'Return on Invested Capital (ROIC)': safe_divide(
            df['Operating Income'] * (1 - safe_divide(df['Income Tax'], df['Pretax Income']).fillna(0)),
            df['Total Debt'] + df['Shareholders Equity'] - df['Cash & Cash Equivalents']
        ),
        'Dividend Yield': safe_divide(df['Dividend Per Share'], df['Close']),
        'Payout Ratio': safe_divide(df['Dividends Paid'], df['Net Income']).abs(),
        'Buyback Yield': safe_divide(df['Share Issuance / Repurchase'], df['Market Capitalization']),
    }

    # Create a temporary DataFrame with all new columns
    temp_df = pd.DataFrame(new_cols)

    # Replace infinite values with NaN
    temp_df.replace([np.inf, -np.inf], np.nan, inplace=True)

    # Assign all new columns to the original DataFrame at once to minimize fragmentation
    df = pd.concat([df, temp_df], axis=1)

    return df

# Function to calculate Present Value of Future Cash Flows
def calculate_present_value(df, discount_rate=0.025, growth_rate=0.005):
    """
    Calculates the Present Value of Future Cash Flows using the Gordon Growth Model.

    PV = CF * (1 + g) / (r - g)

    :param df: pandas DataFrame containing 'Operating Cash Flow'
    :param discount_rate: Discount rate per period (quarterly)
    :param growth_rate: Growth rate per period (quarterly)
    :return: pandas Series containing the PV values
    """
    return df['Operating Cash Flow'] * (1 + growth_rate) / (discount_rate - growth_rate)

# Main processing function
def process_data():
    # Get the list of tickers (subdirectories in the DATA_DIR)
    tickers = [d.name for d in DATA_DIR.iterdir() if d.is_dir()]

    for ticker in tickers:
        print(f"Processing data for {ticker}...")
        ticker_dir = DATA_DIR / ticker
        output_dir = ticker_dir  # Save output into the ticker's own folder

        # Step 1: Define file paths for the ticker
        # List of quarterly files to process
        quarterly_files = {
            'income': f'{ticker.lower()}-income-statement-quarterly.csv',
            'balance': f'{ticker.lower()}-balance-sheet-quarterly.csv',
            'cash_flow': f'{ticker.lower()}-cash-flow-statement-quarterly.csv',
            'ratios': f'{ticker.lower()}-ratios-quarterly.csv'
        }

        # Check if all required files exist
        missing_files = [fname for fname in quarterly_files.values() if not (ticker_dir / fname).exists()]
        if missing_files:
            print(f"Missing files for {ticker}: {missing_files}. Skipping...")
            continue  # Skip this ticker if any file is missing

        # Step 2: Load and preprocess the quarterly data
        df_income = preprocess_quarterly_data(ticker_dir / quarterly_files['income'])
        df_balance = preprocess_quarterly_data(ticker_dir / quarterly_files['balance'])
        df_cash_flow = preprocess_quarterly_data(ticker_dir / quarterly_files['cash_flow'])
        df_ratios = preprocess_quarterly_data(ticker_dir / quarterly_files['ratios'])

        # Step 3: Merge the quarterly DataFrames on 'Date'
        df_quarterly = df_income.merge(df_balance, on='Date', how='outer', suffixes=('', '_balance'))
        df_quarterly = df_quarterly.merge(df_cash_flow, on='Date', how='outer', suffixes=('', '_cash_flow'))
        df_quarterly = df_quarterly.merge(df_ratios, on='Date', how='outer', suffixes=('', '_ratios'))
        df_quarterly = df_quarterly.sort_values('Date')

        # Reorder columns: income, balance, cash flow, ratios
        income_cols = df_income.columns.drop('Date')
        balance_cols = df_balance.columns.drop('Date')
        cash_flow_cols = df_cash_flow.columns.drop('Date')
        ratios_cols = df_ratios.columns.drop('Date')
        cols_order = ['Date'] + list(income_cols) + list(balance_cols) + list(cash_flow_cols) + list(ratios_cols)
        cols_order = pd.Index(cols_order).unique().tolist()  # Remove duplicates
        df_quarterly = df_quarterly.reindex(columns=cols_order)

        # Step 4: Handle missing values
        absolute_cols = set(income_cols).union(balance_cols).union(cash_flow_cols)
        ratio_cols = set(ratios_cols)

        # Fill absolute value columns using ffill and bfill
        df_quarterly[list(absolute_cols)] = df_quarterly[list(absolute_cols)].ffill().bfill()
        df_quarterly[list(absolute_cols)] = df_quarterly[list(absolute_cols)].interpolate(method='linear', limit_direction='both')

        # Fill ratio columns using ffill and bfill
        df_quarterly[list(ratio_cols)] = df_quarterly[list(ratio_cols)].ffill().bfill()
        df_quarterly[list(ratio_cols)] = df_quarterly[list(ratio_cols)].interpolate(method='linear', limit_direction='both')

        # Get the earliest date in the quarterly data
        earliest_quarterly_date = df_quarterly['Date'].min()

        # Step 5: Load and preprocess the daily stock data
        daily_file = ticker_dir / f'{ticker}.csv'
        if not daily_file.exists():
            print(f"Daily data file {daily_file} does not exist for {ticker}. Skipping...")
            continue

        df_daily = pd.read_csv(daily_file)

        # Remove timezone information from 'Date' column
        df_daily['Date'] = df_daily['Date'].apply(lambda x: re.sub(r'[-+]\d{2}:\d{2}$', '', x))
        # Convert 'Date' column to datetime format
        df_daily['Date'] = pd.to_datetime(df_daily['Date'], errors='coerce')

        # Check for unparseable dates
        if df_daily['Date'].isnull().any():
            print(f"Found unparseable dates in {daily_file}. Skipping...")
            continue

        df_daily = df_daily.sort_values('Date')

        # Step 6: Delete any rows prior to the earliest date in quarterly data, but include at least one trading date before
        # Find the index of the earliest date in df_daily that is greater than or equal to earliest_quarterly_date
        idx_list = df_daily[df_daily['Date'] >= earliest_quarterly_date].index.tolist()

        if idx_list:
            idx = idx_list[0]
            if idx > 0:
                # Include one trading date before the earliest quarterly date
                start_idx = idx - 1
            else:
                start_idx = idx
            df_daily = df_daily.loc[start_idx:]
        else:
            print(f"No daily data on or after earliest quarterly date for {ticker}. Skipping...")
            continue

        # Step 7: Merge the daily data with the quarterly data
        df_merged = pd.merge_asof(df_daily, df_quarterly, on='Date', direction='backward')

        # Rearrange columns: Date, daily data, quarterly data
        daily_cols = df_daily.columns.tolist()
        quarterly_cols = df_quarterly.columns.drop('Date').tolist()
        final_cols = ['Date'] + daily_cols[1:] + quarterly_cols
        df_merged = df_merged.reindex(columns=final_cols)

        # Step 8: Fill any remaining missing values in the merged DataFrame
        df_merged[list(absolute_cols)] = df_merged[list(absolute_cols)].ffill().bfill()
        df_merged[list(ratio_cols)] = df_merged[list(ratio_cols)].ffill().bfill()

        # Step 9: Compute percentage change from the last quarter for each financial column
        df_quarterly_pct = df_quarterly.copy()
        df_quarterly_pct.set_index('Date', inplace=True)
        financial_cols = df_quarterly.columns.drop('Date')

        # Calculate percentage change
        df_quarterly_pct[financial_cols] = df_quarterly_pct[financial_cols].pct_change(fill_method=None)
        df_quarterly_pct = df_quarterly_pct.reset_index()  # Avoid inplace=True to prevent fragmentation

        # Rename columns to indicate percentage change
        df_quarterly_pct.rename(columns=lambda x: x + ' Pct Change' if x != 'Date' else x, inplace=True)

        # Merge the percentage change columns into the merged DataFrame
        df_merged = pd.merge_asof(df_merged, df_quarterly_pct, on='Date', direction='backward')

        # Fill missing values in percentage change columns using ffill and bfill
        pct_change_cols = [col for col in df_merged.columns if 'Pct Change' in col]
        df_merged[pct_change_cols] = df_merged[pct_change_cols].ffill().bfill()

        # Step 10: Recalculate financial ratios to ensure accuracy
        df_merged = recalculate_ratios(df_merged)

        # Step 11: Calculate Present Value of Future Cash Flows and add to financial statements
        df_merged['Present Value of Future Cash Flows'] = calculate_present_value(df_merged)

        # Handle cases where PV might not be calculable due to missing cash flow data
        df_merged['Present Value of Future Cash Flows'] = df_merged['Present Value of Future Cash Flows'].replace([np.inf, -np.inf], np.nan)
        df_merged['Present Value of Future Cash Flows'] = df_merged['Present Value of Future Cash Flows'].fillna('N/A')

        # Step 12: Save the merged DataFrame to a new CSV file in the ticker's own folder
        final_csv_path = output_dir / f'{ticker}_with_all.csv'
        df_merged.to_csv(final_csv_path, index=False)

        print(f"Merged data for {ticker} saved to {final_csv_path}")

if __name__ == "__main__":
    process_data()
