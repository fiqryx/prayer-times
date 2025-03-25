/**
 * Degree-Based Math
 */
export class DMath {
    static dtr = (d: number) => (d * Math.PI) / 180.0;
    static rtd = (r: number) => (r * 180.0) / Math.PI;

    static sin = (d: number) => Math.sin(this.dtr(d));
    static cos = (d: number) => Math.cos(this.dtr(d));
    static tan = (d: number) => Math.tan(this.dtr(d));

    static arcsin = (d: number) => this.rtd(Math.asin(d));
    static arccos = (d: number) => this.rtd(Math.acos(d));
    static arctan = (d: number) => this.rtd(Math.atan(d));

    static arccot = (x: number) => this.rtd(Math.atan(1 / x));
    static arctan2 = (y: number, x: number) => this.rtd(Math.atan2(y, x));

    static fixAngle = (a: number) => this.fix(a, 360);
    static fixHour = (a: number) => this.fix(a, 24);

    private static fix = (a: number, b: number) => {
        a = a - b * (Math.floor(a / b));
        return (a < 0) ? a + b : a;
    }
}