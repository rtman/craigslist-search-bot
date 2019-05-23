"# craigstlist-search-bot"

This is a craigslist search bot powered by google cloud.

It's components are:

1. Cloud function to run the search, parse the results, send emails to given addresses
2. Pub Sub Topic to trigger the cloud function and pass the data payload to cloud functions
3. Cloud Scheduler defines the trigger timing and the payload content sent to pub sub. N cloud scheduler jobs can be created with various payloads to do different searches, send to different emails etc.

Potentially this bot could be expanded to search for anything on craigslist but right now its specifically housing. Each craiglist category has specific url properties and search criteria, so a more complete understanding of the craigslist API would be necessary.
