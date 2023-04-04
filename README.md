# TLDR - Less flakey free stock market data
This program provides a more stable method for downloading free stock market data than [yfinance](https://pypi.org/project/yfinance/) which is flakey and not officially supported by Yahoo. Use this tool if you want to trade using stock market data programmatically using your own tools but not ready to shell out $100/month or more.

It includes a command line tool (with managed ETL system) to download / sync all 1day alpaca historical data to your hard drive as CSV files.

```bash
npm i -g alpaca-historical-data-downloader
# cd to your desired directory
export ALPACA_API_KEY=<your alpaca key here>
export ALPACA_API_SECRET=<your alpaca api secret here>
alpaca-historical-data-downloader
```

![image](https://user-images.githubusercontent.com/91979/229888508-50bda22f-0c2e-4dee-81dd-efcf9d05ed08.png)

# Why is this free?
This stock market data comes from a brokerage called Alpaca. They provide historical market data apis for free to encourage users to trade more on their platform as having data will let users make more informed decisions.


## Installation & Usage

By default, this tool syncs all available alpaca data 

The first time the tool runs, it downloads all available 1 day bars which takes about an hour or two. There are some options to focus on specific data types and filters on date ranges so you can get started backtesting sooner rather than later. Or you can pay for a $99/month plan temporarily which will speed up this process.

If the downloader sees that you've already ran and retrieved some data, it will put the data into a staging folder, which gets merged with your existing downloaded CSV files so if there are corrections to the data from Alpaca, these will be handled. By default, this tool assumes whatever is on Alpaca's servers is the correct data.

```bash
npm i -g alpaca-historical-data-downloader
# cd to your desired directory
export ALPACA_API_KEY=<your alpaca key here>
export ALPACA_API_SECRET=<your alpaca api secret here>
alpaca-historical-data-downloader

# or specify a different data directory
alpaca-historical-data-downloader --data-dir=/your/data/folder

# specify a start date 
alpaca-historical-data-downloader --start=2020-01-01

# or an end date 
alpaca-historical-data-downloader --end=2021-01-01

# specific symbols
alpaca-historical-data-downloader --symbols GOOG AAPL MSFT

# combine params
alpaca-historical-data-downloader --start=2020-01-01 --end=2021-01-01 --symbols GOOG AAPL MSFT
# This will download only google, apple and msft symbol information from 2020-01-01 to 2021-01-01 inclusive.
```

This will create a folder called data in the same directory that you ran ahdd in. It will take the next hour (more data types to come!) to download all daily bars for every available non-crypto stock available for trading in the last

Running the tool again will take far less time because it will detect the data folder and see the csv files in the data/1day folder. It will proceed to sync only what it needs to. This command can be ran each day and it will sync yesterday's market data (on the free plan) or today's market data on the paid plan.

## Roadmap & Features

Currently supporting 1 day bars.
Soon other time frames like 1 min, quotes, trades, news and corporate actions.
