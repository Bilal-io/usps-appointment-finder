# USPS Passport appointment finder

## USAGE:
Inside main.js specify a range of ZIP_CODES and number of DAYS to search 

Then run
```
npm i
node ./main.js
```

This will look up appointments across all USPS locations for each day.
Results will be saved in a json file `appointments.json` with `{zip, location, date, list of appointments}`.

Example:
```JSON
{"zip":77001,"location":{"fdbId":1367481,"name":"HOUSTON"},"date":"20250127","appointments":[{"appointmentId":5,"schedulingType":"PASSPORT","appointmentStatus":"Available","startTime":"09:45 AM","startDateTime":"2025-01-27T09:45:00","endTime":"10:00 AM","endDateTime":"2025-01-27T10:00:00","selectable":false},{"appointmentId":6,"schedulingType":"PASSPORT","appointmentStatus":"Available","startTime":"10:00 AM","startDateTime":"2025-01-27T10:00:00","endTime":"10:15 AM","endDateTime":"2025-01-27T10:15:00","selectable":false},{"appointmentId":10,"schedulingType":"PASSPORT","appointmentStatus":"Available","startTime":"11:15 AM","startDateTime":"2025-01-27T11:15:00","endTime":"11:30 AM","endDateTime":"2025-01-27T11:30:00","selectable":false},{"appointmentId":11,"schedulingType":"PASSPORT","appointmentStatus":"Available","startTime":"11:30 AM","startDateTime":"2025-01-27T11:30:00","endTime":"11:45 AM","endDateTime":"2025-01-27T11:45:00","selectable":false},{"appointmentId":12,"schedulingType":"PASSPORT","appointmentStatus":"Available","startTime":"11:45 AM","startDateTime":"2025-01-27T11:45:00","endTime":"12:00 PM","endDateTime":"2025-01-27T12:00:00","selectable":false},{"appointmentId":14,"schedulingType":"PASSPORT","appointmentStatus":"Available","startTime":"12:30 PM","startDateTime":"2025-01-27T12:30:00","endTime":"12:45 PM","endDateTime":"2025-01-27T12:45:00","selectable":false},{"appointmentId":15,"schedulingType":"PASSPORT","appointmentStatus":"Available","startTime":"12:45 PM","startDateTime":"2025-01-27T12:45:00","endTime":"01:00 PM","endDateTime":"2025-01-27T13:00:00","selectable":false},{"appointmentId":16,"schedulingType":"PASSPORT","appointmentStatus":"Available","startTime":"01:00 PM","startDateTime":"2025-01-27T13:00:00","endTime":"01:15 PM","endDateTime":"2025-01-27T13:15:00","selectable":false},{"appointmentId":18,"schedulingType":"PASSPORT","appointmentStatus":"Available","startTime":"01:30 PM","startDateTime":"2025-01-27T13:30:00","endTime":"01:45 PM","endDateTime":"2025-01-27T13:45:00","selectable":false},{"appointmentId":20,"schedulingType":"PASSPORT","appointmentStatus":"Available","startTime":"02:00 PM","startDateTime":"2025-01-27T14:00:00","endTime":"02:15 PM","endDateTime":"2025-01-27T14:15:00","selectable":false},{"appointmentId":21,"schedulingType":"PASSPORT","appointmentStatus":"Available","startTime":"02:15 PM","startDateTime":"2025-01-27T14:15:00","endTime":"02:30 PM","endDateTime":"2025-01-27T14:30:00","selectable":false},{"appointmentId":22,"schedulingType":"PASSPORT","appointmentStatus":"Available","startTime":"02:30 PM","startDateTime":"2025-01-27T14:30:00","endTime":"02:45 PM","endDateTime":"2025-01-27T14:45:00","selectable":false},{"appointmentId":23,"schedulingType":"PASSPORT","appointmentStatus":"Available","startTime":"02:45 PM","startDateTime":"2025-01-27T14:45:00","endTime":"03:00 PM","endDateTime":"2025-01-27T15:00:00","selectable":false}]}
```