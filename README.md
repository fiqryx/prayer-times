# Prayer Times
Calculate **prayer times** for any location around the world, based on a variety of calculation methods currently used in Muslim communities.

## General Usage
The first step for using PrayTimes import a line like this:

```js
import { PrayerTimes } from '@/class/prayer-times'

const prayerTimes = new PrayerTimes({ lat: 43, lng: -80 });
```
the following constructor is used, The input parameters are described below:

- **lat**       : Latitude coordinate (required)
- **lng**       : Longitude coordinate (required)
- **method**    : Prayer calculating methods (optional)

    default is based by coordinates, method can be one of the followings:

    | Method   | Description                                   |
    |----------|-----------------------------------------------|
    | MWL      | Muslim World League                           |
    | ISNA     | Islamic Society of North America              |
    | Egypt    | Egyptian General Authority of Survey          |
    | Makkah   | Umm al-Qura University, Makkah                |
    | Karachi  | University of Islamic Sciences, Karachi       |
    | Tehran   | Institute of Geophysics, University of Tehran |
    | Jafari   | Shia Ithna Ashari (Ja`fari)                   |

- **format**    : Output time format (optional)

    default is **24-hour time format**, according to the following table:
    
    | Format     | Description                     | Example                   |
    |------------|---------------------------------|---------------------------|
    | 24h        | 24-hour time format             | 16:45                     |
    | 12h        | 12-hour time format             | 4:45 pm                   |
    | 12hNS      | 12-hour format with no suffix   | 4:45                      |
    | float      | Floating point number           | 16.75                     |
    | datetime   | Datetime format                 | 01/01/2001, 16:45:00      |


### Get Prayer Times
The following function is used to retrieve prayer times for a given date:

```js
prayerTimes.getTimes({ date: new Date() });
```

### Get Prayer Times by Dates
The following function is used to retrieve prayer times for a given date from & date to:

```js
prayerTimes.getTimesByDate({ 
    from: new Date('2001-05-01'),
    to: new Date('2001-05-31') 
});
```

return an associative array containing 9 prayer times stored in an object.

| Time     | Definition |
|----------|------------|
| Fajr     | When the sky begins to lighten (dawn). |
| Sunrise  | The time at which the first part of the Sun appears above the horizon. |
| Dhuhr    | When the Sun begins to decline after reaching its highest point in the sky. |
| Asr      | The time when the length of any object's shadow reaches a factor (usually 1 or 2) of the length of the object itself plus the length of that object's shadow at noon. |
| Sunset   | The time at which the Sun disappears below the horizon. |
| Maghrib  | Soon after sunset. |
| Isha     | The time at which darkness falls and there is no scattered light in the sky. |
| Midnight | The mean time from sunset to sunrise (or from sunset to Fajr, in some schools of thought). |


---
Original sources [PrayTimes.org](https://praytimes.org/code/)