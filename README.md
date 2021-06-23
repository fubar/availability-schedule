# availability-schedule
A simple availability schedule library for JS

## Installation
```
npm install availability-schedule --save
```

## Import

```javascript
const AvailabilitySchedule = require('availability-schedule');
```

For TypeScript:

```ts
import AvailabilitySchedule = require('availability-schedule');
```

If that throws an error (e.g. `TS1202: Import assignment cannot be used when targeting ECMAScript modules`), try a regular import statement:

```ts
import AvailabilitySchedule from 'availability-schedule';
```

## Usage

```javascript
const schedule = new AvailabilitySchedule('2017-01-09T00:00:00Z', '2017-01-16T00:00:00Z'); // Second week of Jan 2017
schedule.addWeeklyRecurringAvailability('2017-01-04T09:00:00Z', '2017-01-04T17:00:00Z', [1, 2, 3, 4, 5]); // Mon-Fri 9am-5pm UTC, starting on Wed Jan 4th
schedule.addAvailability('2017-01-14T12:00:00Z', '2017-01-14T15:00:00Z'); // Sat Jan 14 12pm-3pm UTC

schedule.getAvailabilities('+0100');
/*
[
  {start: '2017-01-09T10:00:00+01:00', end: '2017-01-09T18:00:00+01:00'},
  {start: '2017-01-10T10:00:00+01:00', end: '2017-01-10T18:00:00+01:00'},
  {start: '2017-01-11T10:00:00+01:00', end: '2017-01-11T18:00:00+01:00'},
  {start: '2017-01-12T10:00:00+01:00', end: '2017-01-12T18:00:00+01:00'},
  {start: '2017-01-13T10:00:00+01:00', end: '2017-01-13T18:00:00+01:00'},
  {start: '2017-01-14T13:00:00+01:00', end: '2017-01-14T16:00:00+01:00'}
]
*/

schedule.isAvailable('2017-01-14T15:00:00+01:00', '2017-01-14T16:00:00+01:00'); // true
```

## Reference

The library is fully timezone-aware. Dates can be provided in any timezone and can be mixed.

Tip: Use the `toISOString` method of the `Date` class or the `moment` library to generate ISO 8601 date strings.

### `constructor (startDate, endDate)`

- `startDate` Start date of the schedule as an ISO 8601 string
- `endDate` End date of the schedule as an ISO 8601 string

### `addAvailability (startDate, endDate)`

- `startDate` ISO 8601 string
- `endDate` ISO 8601 string

### `addWeeklyRecurringAvailability (startDate, endDate, repeatWeekdays)`

- `startDate` ISO 8601 string
- `endDate` ISO 8601 string
- `repeatWeekdays` Array of integers that indicate the weekdays on which the availability is repeated. 1 = Mon, 7 = Sun (in the same time zone as startDate).

Start and end dates may be earlier than the start date passed to the constructor.

### `removeAvailability (startDate, endDate)`

- `startDate` ISO 8601 string
- `endDate` ISO 8601 string

Use this to remove a time range from any existing availabilities. For example, call this for scheduled appointments or meetings.

### `getAvailabilities (timezone = '+0000')`

- `timezone` Accepts just the timezone offset such as "-05:00" as well as a full time stamp that includes the offset (e.g. "2000-01-01T00:00:00-04:00")

Returns all availabilities as an array of {start: date string, end: date string} objects in chronological order.

### `isAvailable (startDate, endDate)`

- `startDate` ISO 8601 string
- `endDate` ISO 8601 string

Returns true if the given time range falls within any availability.
