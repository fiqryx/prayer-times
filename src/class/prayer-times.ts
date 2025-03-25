import { DMath } from "./dmath";
import {
    Times,
    Params,
    Method,
    Methods,
    GetTimeOptions,
    PrayerTimesOptions,
    TimeFormat,
    HightLatitude,
} from "@/types/prayer-times";

/**
 * Prayer times calculate for any location around the world, 
 * based on a variety of calculation methods currently used in Muslim communities.
 */
export class PrayerTimes {
    private times = Times;
    private methods: Methods = Methods;
    private default: Params = { maghrib: '0 min', midnight: 'Standard' };
    private params: Params = { imsak: '10 min', dhuhr: '0 min', asr: 'Standard' };

    private method: Method;
    private format: TimeFormat;
    private highLats: HightLatitude = 'NightMiddle';
    private iterations: number = 1;
    private suffixes: string[] = ['AM', 'PM'];
    private offset: Record<string, number> = {};

    private lat: number;
    private lng: number;
    private elv: number = 0;
    private timezone: number = 0;
    private jDate: number = 0;

    /**
     * @soon add method get next prayer times
     */
    constructor({ lat, lng, method, format = '24h' }: PrayerTimesOptions) {
        // Validate lat
        if (typeof lat !== 'number' || lat < -90 || lat > 90) {
            throw new Error(`Invalid latitude: ${lat}. Must be between -90 and 90`);
        }

        // Validate lng
        if (typeof lng !== 'number' || lng < -180 || lng > 180) {
            throw new Error(`Invalid longitude: ${lng}. Must be between -180 and 180`);
        }

        // Validate method
        if (method && !Object.keys(Methods).includes(method)) {
            throw new Error(`Invalid method: ${method}`);
        }

        this.lat = lat;
        this.lng = lng;
        this.format = format;
        this.method = method ?? this.getDefaultMethod();

        // set methods with default
        for (const x in this.methods) {
            const params = this.methods[x as Method];
            for (const y in this.default) {
                const key = y as keyof typeof params;
                if (!params[key]) {
                    params[key] = this.default[key] as any;
                }
            }
        }

        // init state with method
        const params = this.methods[this.method];
        for (const id in params) {
            const key = id as keyof typeof params;
            this.params[key] = params[key] as any;
        }

        // init offsets
        for (const i in this.times) {
            this.offset[i] = 0;
        }
    }

    setMethod(value: Method) {
        if (this.methods[value]) {
            this.adjust(this.methods[value]);
            this.method = value;
        }
    }

    adjust(params: Params) {
        for (const id in params) {
            const key = id as keyof typeof params;
            this.params[key] = params[key] as any;
        }
    }

    tune(timeOffsets: Record<string, number>) {
        for (const i in timeOffsets) {
            this.offset[i] = timeOffsets[i];
        }
    }

    getMethod = () => this.method;
    getParams = () => this.params;
    getOffsets = () => this.offset;
    getDefaults = () => this.methods;

    getTimes({
        date,
        dst,
        lat = this.lat,
        lng = this.lng,
        elv = this.elv,
        format = this.format,
        timezone,
    }: GetTimeOptions<{ date: Date }>) {
        this.lat = lat;
        this.lng = lng;
        this.elv = elv;
        this.format = format;
        const dateArray = [date.getFullYear(), date.getMonth() + 1, date.getDate()];

        if (!timezone) timezone = this.getTimeZone(dateArray);
        if (!dst) dst = this.getDst(dateArray);

        this.timezone = 1 * (timezone as number) + (1 * (dst as number) ? 1 : 0);
        this.jDate = this.julian(dateArray[0], dateArray[1], dateArray[2]) - this.lng / (15 * 24);

        const result = this.computeTimes();

        if (this.format === 'datetime') {
            return Object.fromEntries(
                Object.entries(result).map(([key, value]) => [
                    key,
                    this.toDate(value, date).toLocaleString('en-GB')
                ])
            );
        }

        return result;
    }

    getTimesByDate(options: GetTimeOptions<{ from: Date, to: Date }>) {
        const result: Record<string, Object> = {}
        while (options.from < options.to) {
            const key = options.from.toLocaleDateString('en-GB');
            result[key] = this.getTimes({ date: options.from, ...options })
            options.from.setDate(options.from.getDate() + 1)
        }
        return result
    }

    getFormattedTime(time: number, format?: TimeFormat, suffixes?: string[]) {
        if (isNaN(time)) {
            return '-----';
        }
        if (format === 'float') return time.toString();
        suffixes = suffixes || this.suffixes;

        time = DMath.fixHour(time + 0.5 / 60);  // add 0.5 minutes to round
        const hours = Math.floor(time);
        const minutes = Math.floor((time - hours) * 60);
        const suffix = (format === '12h') ? suffixes[hours < 12 ? 0 : 1] : '';
        const hour = (format === '24h' || format === 'datetime')
            ? this.twoDigitsFormat(hours) : ((hours + 12 - 1) % 12 + 1);

        return hour + ':' + this.twoDigitsFormat(minutes) + (suffix ? ' ' + suffix : '');
    }

    /**
     * compute mid-day time
     */
    private midDay(time: number) {
        const eqt = this.sunPosition(this.jDate + time).equation;
        const noon = DMath.fixHour(12 - eqt);
        return noon;
    }

    /**
     * compute the time at which sun reaches a specific angle below horizon
     */
    private sunAngleTime(angle: number, time: number, direction?: string) {
        const decl = this.sunPosition(this.jDate + time).declination;
        const noon = this.midDay(time);
        const t = 1 / 15 * DMath.arccos((-DMath.sin(angle) - DMath.sin(decl) * DMath.sin(this.lat)) /
            (DMath.cos(decl) * DMath.cos(this.lat)));
        return noon + (direction === 'ccw' ? -t : t);
    }

    /**
     * compute asr time
     */
    private asrTime(factor: number, time: number) {
        const decl = this.sunPosition(this.jDate + time).declination;
        const angle = -DMath.arccot(factor + DMath.tan(Math.abs(this.lat - decl)));
        return this.sunAngleTime(angle, time);
    }

    /**
     * compute declination angle of sun and equation of time
     * @link https://gist.github.com/bougyman/1307536
     */
    private sunPosition(jd: number) {
        const D = jd - 2451545.0;
        const g = DMath.fixAngle(357.529 + 0.98560028 * D);
        const q = DMath.fixAngle(280.459 + 0.98564736 * D);
        const L = DMath.fixAngle(q + 1.915 * DMath.sin(g) + 0.020 * DMath.sin(2 * g));
        // const R = 1.00014 - 0.01671 * DMath.cos(g) - 0.00014 * DMath.cos(2 * g);

        const e = 23.439 - 0.00000036 * D;
        const RA = DMath.arctan2(DMath.cos(e) * DMath.sin(L), DMath.cos(L)) / 15;

        return {
            declination: DMath.arcsin(DMath.sin(e) * DMath.sin(L)),
            equation: q / 15 - DMath.fixHour(RA)
        };
    }

    /**
     * convert gregorian date to julian day
     */
    private julian(year: number, month: number, day: number) {
        if (month <= 2) {
            year -= 1;
            month += 12;
        }
        const A = Math.floor(year / 100);
        const B = 2 - A + Math.floor(A / 4);

        return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
    }

    /**
     * get default method by coordinates
     * @returns Method
     */
    private getDefaultMethod(): Method {
        // Default method based on location
        if (this.lat >= 21 && this.lat <= 39 && this.lng >= 34 && this.lng <= 60) {
            return 'makkah'; // Middle East region
        }
        if (this.lat >= -11 && this.lat <= 6 && this.lng >= 95 && this.lng <= 141) {
            return 'kemenag'; // Indonesia region
        }
        if (this.lng >= -125 && this.lng <= -65) {
            return 'isna'; // North America
        }
        return 'mwl'; // Default to Muslim World League
    }

    /**
     * compute at given julian date
     */
    private compute(times: Record<Times, number>) {
        const params = this.params;
        const adjustedTimes = this.dayPortion(times);

        return {
            imsak: this.sunAngleTime(this.eval(params.imsak as string), adjustedTimes.imsak, 'ccw'),
            fajr: this.sunAngleTime(this.eval(params.fajr as string), adjustedTimes.fajr, 'ccw'),
            sunrise: this.sunAngleTime(this.riseSetAngle(), adjustedTimes.sunrise, 'ccw'),
            dhuhr: this.midDay(adjustedTimes.dhuhr),
            asr: this.asrTime(this.asrFactor(params.asr as string), adjustedTimes.asr),
            sunset: this.sunAngleTime(this.riseSetAngle(), adjustedTimes.sunset),
            maghrib: this.sunAngleTime(this.eval(params.maghrib as string), adjustedTimes.maghrib),
            isha: this.sunAngleTime(this.eval(params.isha as string), adjustedTimes.isha),
        };
    }

    /**
     * compute prayer times
     */
    private computeTimes() {
        // default times
        let times: Record<string, number> = {
            imsak: 5, fajr: 5, sunrise: 6, dhuhr: 12,
            asr: 13, sunset: 18, maghrib: 18, isha: 18
        };

        // main iterations
        for (let i = 1; i <= this.iterations; i++) {
            times = this.compute(times);
        }

        let adjustedTimes = this.adjustTimes(times);

        // add midnight time
        adjustedTimes.midnight = (this.params.midnight === 'Jafari') ?
            adjustedTimes.sunset + this.timeDiff(adjustedTimes.sunset, adjustedTimes.fajr) / 2 :
            adjustedTimes.sunset + this.timeDiff(adjustedTimes.sunset, adjustedTimes.sunrise) / 2;

        const tunedTimes = this.tuneTimes(adjustedTimes);
        return this.modifyFormats(tunedTimes);
    }

    /**
     * adjust times
     */
    private adjustTimes(times: Record<Times, number>) {
        const params = this.params;
        for (const i in times) {
            (times as any)[i] += this.timezone - this.lng / 15;
        }

        if (this.highLats !== 'None') {
            times = this.adjustHighLats(times);
        }

        if (this.isMin(params.imsak as string)) {
            times.imsak = times.fajr - this.eval(params.imsak as string) / 60;
        }
        if (this.isMin(params.maghrib as string)) {
            times.maghrib = times.sunset + this.eval(params.maghrib as string) / 60;
        }
        if (this.isMin(params.isha as string)) {
            times.isha = times.maghrib + this.eval(params.isha as string) / 60;
        }
        times.dhuhr += this.eval(params.dhuhr as string) / 60;

        return times;
    }

    /**
     * get asr shadow factor
     */
    private asrFactor(asrParam: string) {
        const factor: Record<string, number> = { Standard: 1, Hanafi: 2 };
        return factor[asrParam] || this.eval(asrParam);
    }

    /**
     * @return sun angle for sunset/sunrise
     */
    private riseSetAngle() {
        const angle = 0.0347 * Math.sqrt(this.elv);
        return 0.833 + angle;
    }

    /**
     * apply offsets to the times
     */
    private tuneTimes(times: Record<Times, number>) {
        for (const i in times) {
            times[i as Times] += this.offset[i as Times] / 60;
        }
        return times;
    }

    /**
     * convert times to given time format
     */
    private modifyFormats(times: Record<Times, number>) {
        const result: Record<string, string> = {};
        for (const i in times) {
            result[i] = this.getFormattedTime(times[i as Times], this.format);
        }
        return result;
    }

    /**
     * adjust times for locations in higher latitudes
     */
    private adjustHighLats(times: Record<Times, number>) {
        const params = this.params;
        const nightTime = this.timeDiff(times.sunset, times.sunrise);

        times.imsak = this.adjustHLTime(times.imsak, times.sunrise, this.eval(params.imsak as string), nightTime, 'ccw');
        times.fajr = this.adjustHLTime(times.fajr, times.sunrise, this.eval(params.fajr as string), nightTime, 'ccw');
        times.isha = this.adjustHLTime(times.isha, times.sunset, this.eval(params.isha as string), nightTime);
        times.maghrib = this.adjustHLTime(times.maghrib, times.sunset, this.eval(params.maghrib as string), nightTime);

        return times;
    }

    /**
     * adjust a time for higher latitudes
     */
    private adjustHLTime(time: number, base: number, angle: number, night: number, direction?: string): number {
        const portion = this.nightPortion(angle, night);
        const timeDiff = (direction === 'ccw') ?
            this.timeDiff(time, base) :
            this.timeDiff(base, time);
        if (isNaN(time) || timeDiff > portion) {
            time = base + (direction === 'ccw' ? -portion : portion);
        }
        return time;
    }

    /**
     * the night portion used for adjusting times in higher latitudes
     */
    private nightPortion(angle: number, night: number) {
        const method = this.highLats;
        let portion = 1 / 2; // MidNight
        if (method === 'AngleBased') {
            portion = 1 / 60 * angle;
        } else if (method === 'OneSeventh') {
            portion = 1 / 7;
        }
        return portion * night;
    }

    /**
     * convert hours to day portions 
     */
    private dayPortion(times: Record<Times, number>) {
        const result: Object = {};
        for (const i in times) {
            (result as any)[i] = (times as any)[i] / 24;
        }
        return result as Record<Times, number>;
    }

    /**
     * get local time zone
     */
    private getTimeZone(date: number[]) {
        const year = date[0];
        const t1 = this.gmtOffset([year, 0, 1]);
        const t2 = this.gmtOffset([year, 6, 1]);
        return Math.min(t1, t2);
    }

    /**
     * get daylight saving for a given date
     */
    private getDst(date: number[]) {
        return 1 * Number(this.gmtOffset(date) !== this.getTimeZone(date));
    }

    /**
     * GMT offset for a given date
     */
    private gmtOffset(date: number[]) {
        const localDate = new Date(date[0], date[1] - 1, date[2], 12, 0, 0, 0);
        const GMTString = localDate.toUTCString();
        const GMTDate = new Date(GMTString.substring(0, GMTString.lastIndexOf(' ') - 1));

        return (localDate.getTime() - GMTDate.getTime()) / (1000 * 60 * 60);
    }

    /**
     * convert given string into a number
     */
    private eval = (str: string) => 1 * Number((str + '').split(/[^0-9.+-]/)[0]);
    /**
     * detect if input contains 'min'
     */
    private isMin = (arg: string) => (arg + '').indexOf('min') !== -1;
    /**
     * compute the difference between two times
     */
    private timeDiff = (time1: number, time2: number) => DMath.fixHour(time2 - time1);
    /**
     * add a leading 0 if necessary
     */
    private twoDigitsFormat = (num: number) => (num < 10) ? '0' + num : num.toString();

    /**
     * convert time string to date.
     * @param timeStr HH:MM or HH:MM AM/PM
     */
    private toDate(timeStr: string, date?: Date | string) {
        // Use provided date or current date
        const baseDate = date
            ? typeof date === 'string' ? new Date(date) : new Date(date)
            : new Date();

        // Reset time components
        const resultDate = new Date(baseDate);
        resultDate.setHours(0, 0, 0, 0);

        // Try 24-hour format first (HH:MM)
        const time24Match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
        if (time24Match) {
            const hours = parseInt(time24Match[1]);
            const minutes = parseInt(time24Match[2]);

            if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
                resultDate.setHours(hours, minutes);
                return resultDate;
            }
        }

        // Try 12-hour format (HH:MM AM/PM)
        const time12Match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (time12Match) {
            let hours = parseInt(time12Match[1]);
            const minutes = parseInt(time12Match[2]);
            const period = time12Match[3].toUpperCase();

            if (hours >= 1 && hours <= 12 && minutes >= 0 && minutes <= 59) {
                if (period === 'PM' && hours !== 12) hours += 12;
                if (period === 'AM' && hours === 12) hours = 0;

                resultDate.setHours(hours, minutes);
                return resultDate;
            }
        }

        throw new Error('Invalid time format. Use HH:MM or HH:MM AM/PM');
    }
}