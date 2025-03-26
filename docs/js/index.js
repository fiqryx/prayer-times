import {a,b,d}from'./chunk-BEYFYZQA.js';var e=class{static{a(this,"DMath");}static dtr=a(t=>t*Math.PI/180,"dtr");static rtd=a(t=>t*180/Math.PI,"rtd");static sin=a(t=>Math.sin(this.dtr(t)),"sin");static cos=a(t=>Math.cos(this.dtr(t)),"cos");static tan=a(t=>Math.tan(this.dtr(t)),"tan");static arcsin=a(t=>this.rtd(Math.asin(t)),"arcsin");static arccos=a(t=>this.rtd(Math.acos(t)),"arccos");static arctan=a(t=>this.rtd(Math.atan(t)),"arctan");static arccot=a(t=>this.rtd(Math.atan(1/t)),"arccot");static arctan2=a((t,s)=>this.rtd(Math.atan2(t,s)),"arctan2");static fixAngle=a(t=>this.fix(t,360),"fixAngle");static fixHour=a(t=>this.fix(t,24),"fixHour");static fix=a((t,s)=>(t=t-s*Math.floor(t/s),t<0?t+s:t),"fix")};var l=class{static{a(this,"PrayerTimes");}times=b;methods=d;default={maghrib:"0 min",midnight:"Standard"};params={imsak:"10 min",dhuhr:"0 min",asr:"Standard"};method;format;highLats="NightMiddle";iterations=1;suffixes=["AM","PM"];offset={};lat;lng;elv=0;timezone=0;jDate=0;constructor({lat:t,lng:s,method:i,format:n="24h"}){if(typeof t!="number"||t<-90||t>90)throw new Error(`Invalid latitude: ${t}. Must be between -90 and 90`);if(typeof s!="number"||s<-180||s>180)throw new Error(`Invalid longitude: ${s}. Must be between -180 and 180`);if(i&&!Object.keys(d).includes(i))throw new Error(`Invalid method: ${i}`);this.lat=t,this.lng=s,this.format=n,this.method=i??this.getDefaultMethod();for(let r in this.methods){let a=this.methods[r];for(let c in this.default){let f=c;a[f]||(a[f]=this.default[f]);}}let o=this.methods[this.method];for(let r in o){let a=r;this.params[a]=o[a];}for(let r in this.times)this.offset[r]=0;}setMethod(t){this.methods[t]&&(this.adjust(this.methods[t]),this.method=t);}adjust(t){for(let s in t){let i=s;this.params[i]=t[i];}}tune(t){for(let s in t)this.offset[s]=t[s];}getMethod=a(()=>this.method,"getMethod");getParams=a(()=>this.params,"getParams");getOffsets=a(()=>this.offset,"getOffsets");getDefaults=a(()=>this.methods,"getDefaults");getTimes({date:t,dst:s,lat:i=this.lat,lng:n=this.lng,elv:o=this.elv,format:r=this.format,timezone:a}){this.lat=i,this.lng=n,this.elv=o,this.format=r;let c=[t.getFullYear(),t.getMonth()+1,t.getDate()];a||(a=this.getTimeZone(c)),s||(s=this.getDst(c)),this.timezone=1*a+(1*s?1:0),this.jDate=this.julian(c[0],c[1],c[2])-this.lng/(15*24);let f=this.computeTimes();return this.format==="datetime"?Object.fromEntries(Object.entries(f).map(([d,M])=>[d,this.toDate(M,t).toLocaleString("en-GB")])):f}getTimesByDate(t){let s={};for(;t.from<t.to;){let i=t.from.toLocaleDateString("en-GB");s[i]=this.getTimes({date:t.from,...t}),t.from.setDate(t.from.getDate()+1);}return s}getFormattedTime(t,s,i){if(isNaN(t))return "-----";if(s==="float")return t.toString();i=i||this.suffixes,t=e.fixHour(t+.5/60);let n=Math.floor(t),o=Math.floor((t-n)*60),r=s==="12h"?i[n<12?0:1]:"";return (s==="24h"||s==="datetime"?this.twoDigitsFormat(n):(n+12-1)%12+1)+":"+this.twoDigitsFormat(o)+(r?" "+r:"")}midDay(t){let s=this.sunPosition(this.jDate+t).equation;return e.fixHour(12-s)}sunAngleTime(t,s,i){let n=this.sunPosition(this.jDate+s).declination,o=this.midDay(s),r=1/15*e.arccos((-e.sin(t)-e.sin(n)*e.sin(this.lat))/(e.cos(n)*e.cos(this.lat)));return o+(i==="ccw"?-r:r)}asrTime(t,s){let i=this.sunPosition(this.jDate+s).declination,n=-e.arccot(t+e.tan(Math.abs(this.lat-i)));return this.sunAngleTime(n,s)}sunPosition(t){let s=t-2451545,i=e.fixAngle(357.529+.98560028*s),n=e.fixAngle(280.459+.98564736*s),o=e.fixAngle(n+1.915*e.sin(i)+.02*e.sin(2*i)),r=23.439-36e-8*s,a=e.arctan2(e.cos(r)*e.sin(o),e.cos(o))/15;return {declination:e.arcsin(e.sin(r)*e.sin(o)),equation:n/15-e.fixHour(a)}}julian(t,s,i){s<=2&&(t-=1,s+=12);let n=Math.floor(t/100),o=2-n+Math.floor(n/4);return Math.floor(365.25*(t+4716))+Math.floor(30.6001*(s+1))+i+o-1524.5}getDefaultMethod(){return this.lat>=21&&this.lat<=39&&this.lng>=34&&this.lng<=60?"makkah":this.lat>=-11&&this.lat<=6&&this.lng>=95&&this.lng<=141?"kemenag":this.lng>=-125&&this.lng<=-65?"isna":"mwl"}compute(t){let s=this.params,i=this.dayPortion(t);return {imsak:this.sunAngleTime(this.eval(s.imsak),i.imsak,"ccw"),fajr:this.sunAngleTime(this.eval(s.fajr),i.fajr,"ccw"),sunrise:this.sunAngleTime(this.riseSetAngle(),i.sunrise,"ccw"),dhuhr:this.midDay(i.dhuhr),asr:this.asrTime(this.asrFactor(s.asr),i.asr),sunset:this.sunAngleTime(this.riseSetAngle(),i.sunset),maghrib:this.sunAngleTime(this.eval(s.maghrib),i.maghrib),isha:this.sunAngleTime(this.eval(s.isha),i.isha)}}computeTimes(){let t={imsak:5,fajr:5,sunrise:6,dhuhr:12,asr:13,sunset:18,maghrib:18,isha:18};for(let n=1;n<=this.iterations;n++)t=this.compute(t);let s=this.adjustTimes(t);s.midnight=this.params.midnight==="Jafari"?s.sunset+this.timeDiff(s.sunset,s.fajr)/2:s.sunset+this.timeDiff(s.sunset,s.sunrise)/2;let i=this.tuneTimes(s);return this.modifyFormats(i)}adjustTimes(t){let s=this.params;for(let i in t)t[i]+=this.timezone-this.lng/15;return this.highLats!=="None"&&(t=this.adjustHighLats(t)),this.isMin(s.imsak)&&(t.imsak=t.fajr-this.eval(s.imsak)/60),this.isMin(s.maghrib)&&(t.maghrib=t.sunset+this.eval(s.maghrib)/60),this.isMin(s.isha)&&(t.isha=t.maghrib+this.eval(s.isha)/60),t.dhuhr+=this.eval(s.dhuhr)/60,t}asrFactor(t){return {Standard:1,Hanafi:2}[t]||this.eval(t)}riseSetAngle(){return .833+.0347*Math.sqrt(this.elv)}tuneTimes(t){for(let s in t)t[s]+=this.offset[s]/60;return t}modifyFormats(t){let s={};for(let i in t)s[i]=this.getFormattedTime(t[i],this.format);return s}adjustHighLats(t){let s=this.params,i=this.timeDiff(t.sunset,t.sunrise);return t.imsak=this.adjustHLTime(t.imsak,t.sunrise,this.eval(s.imsak),i,"ccw"),t.fajr=this.adjustHLTime(t.fajr,t.sunrise,this.eval(s.fajr),i,"ccw"),t.isha=this.adjustHLTime(t.isha,t.sunset,this.eval(s.isha),i),t.maghrib=this.adjustHLTime(t.maghrib,t.sunset,this.eval(s.maghrib),i),t}adjustHLTime(t,s,i,n,o){let r=this.nightPortion(i,n),a=o==="ccw"?this.timeDiff(t,s):this.timeDiff(s,t);return (isNaN(t)||a>r)&&(t=s+(o==="ccw"?-r:r)),t}nightPortion(t,s){let i=this.highLats,n=1/2;return i==="AngleBased"?n=1/60*t:i==="OneSeventh"&&(n=1/7),n*s}dayPortion(t){let s={};for(let i in t)s[i]=t[i]/24;return s}getTimeZone(t){let s=t[0],i=this.gmtOffset([s,0,1]),n=this.gmtOffset([s,6,1]);return Math.min(i,n)}getDst(t){return 1*+(this.gmtOffset(t)!==this.getTimeZone(t))}gmtOffset(t){let s=new Date(t[0],t[1]-1,t[2],12,0,0,0),i=s.toUTCString(),n=new Date(i.substring(0,i.lastIndexOf(" ")-1));return (s.getTime()-n.getTime())/(1e3*60*60)}eval=a(t=>1*Number((t+"").split(/[^0-9.+-]/)[0]),"eval");isMin=a(t=>(t+"").indexOf("min")!==-1,"isMin");timeDiff=a((t,s)=>e.fixHour(s-t),"timeDiff");twoDigitsFormat=a(t=>t<10?"0"+t:t.toString(),"twoDigitsFormat");toDate(t,s){let i=s?typeof s=="string"?new Date(s):new Date(s):new Date,n=new Date(i);n.setHours(0,0,0,0);let o=t.match(/^(\d{1,2}):(\d{2})$/);if(o){let a=parseInt(o[1]),c=parseInt(o[2]);if(a>=0&&a<=23&&c>=0&&c<=59)return n.setHours(a,c),n}let r=t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);if(r){let a=parseInt(r[1]),c=parseInt(r[2]),f=r[3].toUpperCase();if(a>=1&&a<=12&&c>=0&&c<=59)return f==="PM"&&a!==12&&(a+=12),f==="AM"&&a===12&&(a=0),n.setHours(a,c),n}throw new Error("Invalid time format. Use HH:MM or HH:MM AM/PM")}};export{l as PrayerTimes};