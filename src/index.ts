import { PrayerTimes } from "./class/prayer-times";

const date = new Date();
const from = new Date(date.getFullYear(), date.getMonth(), 1);
const to = new Date(date.getFullYear(), date.getMonth() + 1, 1);

const prayer = new PrayerTimes({
    lat: -6.200000,
    lng: 106.816666,
    format: '24h'
});

const method = prayer.getMethod()
const daily = prayer.getTimes({ date });
// const monthly = prayer.getTimesByDate({ from, to });

console.log("calculation methods:", method);
console.log(daily);
// console.log(monthly);