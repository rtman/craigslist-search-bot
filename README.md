# craigstlist-search-bot

This is a craigslist search bot powered by google cloud. Currently it is set to search housing.

It's components are:

1. Cloud function to run the search, parse the results, send emails to given addresses
2. Pub Sub Topic to trigger the cloud function and pass the data payload to cloud functions
3. Cloud Scheduler defines the trigger timing and the payload content sent to pub sub. N cloud scheduler jobs can be created with various payloads to do different searches, send to different emails etc.

Here is the data payload that the Cloud Function is expecting, this is set in the Cloud Scheduler:

`{ "city":"vancouver", "area":"van", "query":"full+house", "max_price":"4000", "min_bedrooms":"2", "min_bathrooms":"2", "availabilityMode":"0", "housing_type":[6,9], "sale_date":"all+dates", "emails":["you@gmail.com", "someoneElse@gmail.com"] }`

Potentially this bot could be expanded to search for anything on craigslist but right now its specifically set for housing. Each craiglist category has specific url properties and search criteria, so a more complete understanding of the craigslist API would be necessary.
