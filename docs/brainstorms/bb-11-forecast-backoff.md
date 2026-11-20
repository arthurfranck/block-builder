# BB-11: forecast refetch after a failure

**Problem.** Today redraws on every plan change and calls `wxLoad(false)`. With no forecast data after a failed request, each redraw fired a new request to Open-Meteo: a tap-heavy session offline or with the API blocked meant dozens of requests.

**Options.** Never retry automatically (only on Change): simplest, but a forecast that failed once on a flaky connection would stay missing all day. A fixed wait: still regular requests while offline. A growing wait (backoff): chosen.

**Chosen.** After a failure, automatic loads wait 30 s, doubling with each further failure, capped at 30 min (the same as the normal refresh interval). Success resets it, and so does a new city or location. Choosing a city or the location always tries at once (force).
