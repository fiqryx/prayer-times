/**
 * Prayer times names
 */
export const Times = {
    imsak: 'Imsak',
    fajr: 'Fajr',
    sunrise: 'Sunrise',
    dhuhr: 'Dhuhr',
    asr: 'Asr',
    sunset: 'Sunset',
    maghrib: 'Maghrib',
    isha: 'Isha',
    midnight: 'Midnight',
} as const;
/**
 * Prayers times method names
 */
export const Method = {
    mwl: 'Muslim World League',
    isna: 'Islamic Society of North America (ISNA)',
    egypt: 'Egyptian General Authority of Survey',
    makkah: 'Umm Al-Qura University, Makkah',
    karachi: 'University of Islamic Sciences, Karachi',
    tehran: 'Institute of Geophysics, University of Tehran',
    jafari: 'Shia Ithna-Ashari, Leva Institute, Qum',
    kemenag: 'Kementerian Agama Republik Indonesia',
    jakim: 'Jabatan Kemajuan Islam Malaysia',
} as const;

/**
 * Prayer calculating methods
 * @references https://praytimes.org/wiki/Calculation_Methods
 */
export const Methods: Methods = {
    mwl: { fajr: 18, isha: 17 },
    isna: { fajr: 15, isha: 15 },
    egypt: { fajr: 19.5, isha: 17.5 },
    makkah: { fajr: 18.5, isha: '90 min' },
    karachi: { fajr: 18, isha: 18 },
    tehran: { fajr: 17.7, isha: 14, maghrib: 4.5, midnight: 'Jafari' },
    jafari: { fajr: 16, isha: 14, maghrib: 4, midnight: 'Jafari' },
    kemenag: { fajr: 20, isha: 18 },
    jakim: { fajr: 18, isha: 18 },
} as const;
/**
 * - Standard  = Shafii, Maliki, Jafari, Hanbali
 * - Hanafi    = Hanafi
 */
export type AsrJuristic = 'Standard' | 'Hanafi'
/**
 * - Standard  = Mid Sunset to Sunrise
 * - Jafari    = Mid Sunset to Fajr
 */
export type MidNight = 'Standard' | 'Jafari'
/**
 * - NightMiddle   = middle of night
 * - AngleBased    = angle/60th of night
 * - OneSeventh    = OneSeventh
 * - None          = None
 */
export type HightLatitude = 'NightMiddle' | 'AngleBased' | 'OneSeventh' | 'None'
export type Method = keyof typeof Method;
export type Times = keyof typeof Times;
export type Params = {
    [K in Times]?: K extends 'midnight' ? MidNight
    : K extends 'asr' ? AsrJuristic : string | number
};
export type Methods = { [k in Method]: Params };
export type TimeFormat = '24h' | '12h' | '12hNS' | 'float' | 'datetime';

export type GetTimeOptions<T> = {
    lat?: number
    lng?: number
    elv?: number
    timezone?: number,
    dst?: number,
    format?: TimeFormat
} & T

export interface PrayerTimesOptions {
    lat: number
    lng: number
    method?: Method
    format?: TimeFormat
}