# Manual tests

This file contains a set of tests to ensure the app is working (somehow) correctly.

### Test boilerplate - here goes title

Use this when creating a new test.  
Here goes explanation of what the test is and why are we doing it (optional)

**Setup**

1. steps
2. to
3. do in app

**Outcome**

1. What should happen in app,
2. should we look into db?

**Clean up**

1. what
2. should be done in order to clean up after test

## Auth

### User can log in

### Correct message is displayed when user does not exist

### All tabs/windows are synchronized

### When user logs out from google account Fillo also logs him out

## Customer picker

### When user has only one customer it is picked automatically

### When user has multiple customers he gets to choose on login

### When customer selected only data of that customer are displayed

## Blueprint

### Creating - user is able to create blueprint. Fields are automatically created

### Creating - when blueprint for *user - google doc* combination already exists, display descriptive error message

### Editing - User can edit blueprint fields

### Editing - text

### Editing - date

### Editing - number

### Editing - options

### Removing - blueprint can be removed

### When removing blueprint that has blueprint groups assigned to it, those blueprint groups are removed also

### When removing blueprint that has blueprint groups assigned to it, number of blueprint groups to be deleted is displayed

### User can not see blueprints that was not created by him

## Blueprint groups

### Creating - user can pick only from those blueprints he hass access to

### Submitting - values - text

### Submitting - values - date

### Submitting - values - number

### Submitting - values - options

### Submitting - google docs can not be accessed

### Submitting - user can not access blueprint

### Submitting - Remove google documents when they should not be generated

### Submitting - Do not remove google documents when they should be generated

### Submitting - options - folder picker

### Submitting - options - generating pdfs

### Submitting - options - generating master pdf

## Sentry

We use sentry to report errors and crashes. So it is crucial to ensure it is working correctly.

### Ensure errors are reported from FE

**Setup**

1. Go to dev screen - e.x `https://filloapp.com/dev`
2. Click on `test sentry` button
3. App will crash

**Outcome**

1. Frontend project in sentry
    1. There should be 4 events generated
    2. ensure correct environment is set (local, stage or prod)
    3. ensure correct user
    4. ensure correct version is set. Should be the same as the one displayed in app.
2. Backend project in sentry
    1. There should be 4 events generated
    2. ensure correct trace id
    3. ensure correct user
    4. ensure correct environment
    5. ensure correct version (client and server)

**Clean up**
Resolve all generated errors in sentry
