# Manual tests
This file contains a set of tests to ensure the app is working (somehow) correctly.

## Test boilerplate - here goes title
Use this when creating a new test. Here goes explanation of what the test is and why are we doing it (optional)  

**Setup**  
1. steps
2. to
3. do in app   

**Outcome**
1. What should happen in app,
2. should we look into db?
   
## Sentry
We use sentry to report errors and crashes. So it is crucial to ensure it is working correctly.

### Ensure errors are reported from FE

**Setup**
1. Go to  dev screen - e.x `https://filloapp.com/dev` 
2. Click on `test sentry` button
3. App will crash

**Outcome**  
There should be 4 events generated in sentry console. 
1. ensure correct environment is set (local, stage or prod)
2. ensure correct user is set. `userId` - user's email, `selectedCustomer` - customer's id
3. ensure correct version is set. Should be the same as the one displayed in app.
