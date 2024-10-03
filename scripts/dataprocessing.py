import os
import csv
import pandas as pd
import numpy as np
from pathlib import Path

# Define paths
DATA_DIR = Path('./data')
OUTPUT_DIR = Path('./public/data')
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)  # Create the output directory if it doesn't exist

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
    # Convert 'Date' column to datetime format
    df['Date'] = pd.to_datetime(df['Date'])
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
        'P/FCF Ratio': safe_divide(df['Market Capitalization'], df['Free Cash Flow']),
        'P/OCF Ratio': safe_divide(df['Market Capitalization'], df['Operating Cash Flow']),
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

# Main processing function
def process_data():
    # Step 1: Extract and print the first column from each quarterly CSV file
    quarterly_files = [
        'aapl-balance-sheet-quarterly.csv',
        'aapl-cash-flow-statement-quarterly.csv',
        'aapl-income-statement-quarterly.csv',
        'aapl-ratios-quarterly.csv'
    ]

    for file_name in quarterly_files:
        file_path = DATA_DIR / file_name
        first_col = get_first_column(file_path)
        # Optionally, you can print or log the first column if needed
        # For brevity, it's not printed here

    # Step 2: Load and preprocess the daily stock data
    daily_file = DATA_DIR / 'AAPL.csv'
    df_daily = pd.read_csv(daily_file)
    df_daily['Date'] = pd.to_datetime(df_daily['Date'])
    df_daily = df_daily.sort_values('Date')

    # Step 3: Preprocess all quarterly data files
    df_income = preprocess_quarterly_data(DATA_DIR / 'aapl-income-statement-quarterly.csv')
    df_balance = preprocess_quarterly_data(DATA_DIR / 'aapl-balance-sheet-quarterly.csv')
    df_cash_flow = preprocess_quarterly_data(DATA_DIR / 'aapl-cash-flow-statement-quarterly.csv')
    df_ratios = preprocess_quarterly_data(DATA_DIR / 'aapl-ratios-quarterly.csv')

    # Step 4: Merge the quarterly DataFrames on 'Date'
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

    # Step 5: Handle missing values
    absolute_cols = set(income_cols).union(balance_cols).union(cash_flow_cols)
    ratio_cols = set(ratios_cols)

    # Fill absolute value columns using ffill and bfill
    df_quarterly[list(absolute_cols)] = df_quarterly[list(absolute_cols)].ffill().bfill()
    df_quarterly[list(absolute_cols)] = df_quarterly[list(absolute_cols)].interpolate(method='linear', limit_direction='both')

    # Fill ratio columns using ffill and bfill
    df_quarterly[list(ratio_cols)] = df_quarterly[list(ratio_cols)].ffill().bfill()
    df_quarterly[list(ratio_cols)] = df_quarterly[list(ratio_cols)].interpolate(method='linear', limit_direction='both')

    # Step 6: Merge the daily data with the quarterly data
    df_merged = pd.merge_asof(df_daily, df_quarterly, on='Date', direction='backward')

    # Rearrange columns: Date, daily data, quarterly data
    daily_cols = df_daily.columns.tolist()
    quarterly_cols = df_quarterly.columns.drop('Date').tolist()
    final_cols = ['Date'] + daily_cols[1:] + quarterly_cols
    df_merged = df_merged.reindex(columns=final_cols)

    # Step 7: Fill any remaining missing values in the merged DataFrame
    df_merged[list(absolute_cols)] = df_merged[list(absolute_cols)].ffill().bfill()
    df_merged[list(ratio_cols)] = df_merged[list(ratio_cols)].ffill().bfill()

    # Step 8: Compute percentage change from the last quarter for each financial column
    df_quarterly_pct = df_quarterly.copy()
    df_quarterly_pct.set_index('Date', inplace=True)
    financial_cols = df_quarterly.columns.drop('Date')

    # Calculate percentage change without using the deprecated 'pad' fill_method
    df_quarterly_pct[financial_cols] = df_quarterly_pct[financial_cols].pct_change(fill_method=None)
    df_quarterly_pct = df_quarterly_pct.reset_index()  # Avoid inplace=True to prevent fragmentation

    # Rename columns to indicate percentage change
    df_quarterly_pct.rename(columns=lambda x: x + ' Pct Change' if x != 'Date' else x, inplace=True)

    # Merge the percentage change columns into the merged DataFrame
    df_merged = pd.merge_asof(df_merged, df_quarterly_pct, on='Date', direction='backward')

    # Fill missing values in percentage change columns using ffill and bfill
    pct_change_cols = [col for col in df_merged.columns if 'Pct Change' in col]
    df_merged[pct_change_cols] = df_merged[pct_change_cols].ffill().bfill()

    # Step 9: Recalculate financial ratios to ensure accuracy
    df_merged = recalculate_ratios(df_merged)

    # Step 10: Save the merged DataFrame to a new CSV file
    final_csv_path = DATA_DIR / 'AAPL_with_all.csv'
    df_merged.to_csv(final_csv_path, index=False)

    # Optional: Display the first few rows of the merged DataFrame
    print(f"Merged data saved to {final_csv_path}")

if __name__ == "__main__":
    process_data()
