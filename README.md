# alpaca-historical-data-downloader
Command line tool (with managed ETL system) to download / sync all alpaca historical data to your hard drive as CSV files.

Alpaca https://alpaca.markets/ is an API-first stock / crypto brokerage. They provide api access to download trades, quotes, news, corporate actions and bars https://alpaca.markets/docs/api-references/market-data-api/. This tool syncs all of this available data from Alpaca to your hard drive as CSV files so you can create a professional backtesting and stock / crypto exploration environment.

The first time the tool runs, by default it downloads everything which can take a very very long time (potentially months on a free plan). There are some options to focus on specific data types and filters on date ranges so you can get started backtesting sooner rather than later. Or you can pay for a $99/month plan temporarily which will speed up this process.

If ahdd sees that you've already ran and retrieved some data, it will put the data into a staging folder, which gets merged with your existing downloaded CSV files so if there are corrections to the data from Alpaca, these will be handled. By default, this tool assumes whatever is on Alpaca's servers is the correct data.

## Roadmap & Features

[x] 1 day bars
[ ] 1 min bars
[ ] 5 min bars
[ ] Quotes
[ ] Trades
[ ] News
[ ] Corporate actions

This tool does not handle stock splits. It merely replicates exactly what is on Alpaca's historical api servers to your hard drive.

@TODO put git linter / status badges here.

## Installation & Usage

By default, this tool syncs all available alpaca data 

```
npm i -g alpaca-historical-data-downloader
# cd to your desired directory
export ALPACA_API_KEY=<your alpaca key here>
export ALPACA_API_SECRET=<your alpaca api secret here>
ahdd
```

This will create a folder called data in the same directory that you ran ahdd in. It will take the next hour (more data types to come!) to download all daily bars for every available non-crypto stock available for trading in the last

Running the tool again will take far less time because it will detect the data folder and see the csv files in the data/1day folder. It will proceed to sync only what it needs to. This command can be ran each day and it will sync yesterday's market data (on the free plan) or today's market data on the paid plan.

## Options

Specifying a different folder to store your data
```
# Make sure you have read-write access to this folder.
ahdd --data-dir=/your/path/to/data/dir
```

Specifying a start date to download data from. This will download data from the start date (inclusive) to today's date (exclusive if free plan, inclusive if paid)
```
ahdd --start-date=YYYY-MM-DD
```

Specifying an end date to download data to. This will download all available data from the start (roughly 5-6 years ago) up until end date (exclusive if free plan, inclusive if paid)
```
ahdd --end-date=YYYY-MM-DD
```

You can combine start & end dates to download data in a range
```
ahdd --start-date=YYYY-MM-DD --end-date=YYYY-MM-DD
```

Restricting by data type
```
# will download only 1day bars
ahdd --data-type=1day
# will download only 1day and 1min bars
ahdd --data-type=1day,1min
# willl download news and corporate actions
ahdd --data-type=news,corporate-actions

# complete list of types are 1day, 1min, 5min, quotes, trades, news, corporate-actions
```
