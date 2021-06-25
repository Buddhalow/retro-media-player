
export function serializeObject (obj) {
    var str = [];
    for(var p in obj)
      if (p in obj) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      }
    return str.join("&");
}
  
export function strToQuerystring (str) {
    var args = str.substring(0).split('&');
  
    var argsParsed = {};
  
    var i, arg, kvp, key, value;
  
    for (i=0; i < args.length; i++) {

        arg = args[i];

        if (-1 === arg.indexOf('=')) {

            argsParsed[decodeURIComponent(arg).trim()] = true;
        }
        else {

            kvp = arg.split('=');

            key = decodeURIComponent(kvp[0]).trim();

            value = decodeURIComponent(kvp[1]).trim();

            argsParsed[key] = value;
        }
    }
  
    return argsParsed;
}
  
export function stringToHHMMSS (str) {
    var sec_num = parseInt(str, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);
    var strHours = hours, strMinutes = minutes, strSeconds = seconds;
    if (hours   < 10) {strHours   = "0"+hours;}
    if (minutes < 10) {strMinutes = "0"+minutes;}
    if (seconds < 10) {strSeconds = "0"+seconds;}
    return (hours > 0 ? strHours+':' : '') + strMinutes + ':' + strSeconds;
}