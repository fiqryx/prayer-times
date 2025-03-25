import { expect, test, describe } from "bun:test";
import { PrayerTimes } from "../class/prayer-times";

describe("prayer-times", () => {
    const testDate = new Date();
    const testConfig = {
        lat: -6.200000,
        lng: 106.816666,
        // method: 'kemenag',
        format: '12h'
    };

    test("should create instance with correct configuration", () => {
        const prayer = new PrayerTimes(testConfig);
        expect(prayer).toBeInstanceOf(PrayerTimes);
        expect(prayer.getMethod()).toBe('kemenag');
    });

    test("should return daily prayer times", () => {
        const prayer = new PrayerTimes(testConfig);
        const daily = prayer.getTimes({ date: testDate });

        expect(daily).toBeObject();
        expect(daily).toContainKeys(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']);
        expect(daily.fajr).toMatch(/^\d{1,2}:\d{2}\s(AM|PM)$/); // 12h format
    });

    test("should return monthly prayer times", () => {
        const prayer = new PrayerTimes(testConfig);
        const from = new Date(testDate.getFullYear(), testDate.getMonth(), 1);
        const to = new Date(testDate.getFullYear(), testDate.getMonth() + 1, 1);
        const monthly = prayer.getTimesByDate({ from, to });

        const firstDateKey = Object.keys(monthly)[0];
        const daysInMonth = new Date(testDate.getFullYear(), testDate.getMonth() + 1, 0).getDate();

        expect(monthly).toBeObject();
        expect(firstDateKey).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
        expect(monthly[firstDateKey]).toContainKeys(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']);
        expect(Object.keys(monthly).length).toBe(daysInMonth);
    });

    test("should handle 24h format", () => {
        const prayer24h = new PrayerTimes({ ...testConfig, format: '24h' });
        const daily = prayer24h.getTimes({ date: testDate });

        expect(daily.fajr).toMatch(/^\d{1,2}:\d{2}$/); // 24h format
        expect(daily.fajr).not.toContain('AM');
    });

    test("should throw error for invalid coordinates", () => {
        expect(() => new PrayerTimes({ ...testConfig, lat: 100 })).toThrow();
        expect(() => new PrayerTimes({ ...testConfig, lng: 200 })).toThrow();
    });
})