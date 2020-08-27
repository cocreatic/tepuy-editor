//import { v4 as uuidv4 } from 'uuid';
export const privateMap = new WeakMap();

export const _ = (instance) => {
    return privateMap.get(instance);
}

export const checkImplementation = (instance, method) => {
    let priv = _(instance);
    if (!(method in priv.impl)) {
        throw { message: 'Unsupported method', method: method, plugin: priv.implName };
    }
}

export function sortInsert(array, item, comparer) {
    let low = 0,
        high = array.length;

    while (low < high) {
        let mid = (low + high) >>> 1;
        if (comparer(array[mid], item) <= 0) low = mid + 1;
        else high = mid;
    }
    array.splice(low, 0, item);
}

export const getSafe = (obj, property, defValue) => {
    if (!obj) return defValue;
    return obj[property] || defValue;
}

export function loadFile(filename, filetype) {
    if (filetype=="js"){ //if filename is a external JavaScript file
        var fileref=document.createElement('script')
        fileref.setAttribute("type","text/javascript")
        fileref.setAttribute("src", filename)
    }
    else if (filetype=="css"){ //if filename is an external CSS file
        var fileref=document.createElement("link")
        fileref.setAttribute("rel", "stylesheet")
        fileref.setAttribute("type", "text/css")
        fileref.setAttribute("href", filename)
    }
    else if (filetype == 'json') {
        return new Promise((resolve, reject) => {
            $.getJSON(filename).done((json) => {
                resolve(json);
            })
            .fail((jqxhr, statusText, error) => {
                console.log(`Failed to load ${filename}. ${statusText} - ${error}`);
                resolve(undefined);
            });
        });
    }
    
    if (typeof fileref!="undefined") {
        return new Promise((resolve, reject) => {
            fileref.onload = () => resolve(true);
            fileref.onerror = () => resolve(false);
            document.getElementsByTagName("head")[0].appendChild(fileref)
        });
    }
    return Promise.resolve(false);
}

export function newid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    //return uuidv4();// ''+(new Date().getTime());
}

export function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode(parseInt(p1, 16))
    }))
}

export function b64DecodeUnicode(str) {
    return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
}

export function checkAbstractImplementation(instance, classDefinition, method) {
    if (instance[method] === classDefinition.prototype[method]) {
        throw new TypeError('Please implement abstract method ' + method);
    }
}

export function camelCaseToDash(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export function capitalize(string) {
    return string[0].toUpperCase()+string.slice(1);
}

export function formatDuration(time) {
    if (isNaN(time) || time < 1) return '00:00';
    const sec = Math.floor(time % 60);
    time = Math.floor(time / 60);
    let min = time % 60;
    time = Math.floor(time / 60);
    let result = '';
    if (time > 0) {
        result += time + ':';
    }

    if (min < 10) result += '0';
    result += min + ':';
    if (sec < 10) result += '0';
    result += sec;
    return result;
}

export function durationToNumber(duration) { //duration in seconds
    const matches = /^(?:(\d)+\.)?(?:(\d{1,2})\:)?(?:(\d{1,2})\:)(\d{1,2})$/.exec(duration);
    if (!matches) return 0;
    const [days, hours, min, sec] = matches.slice(1).map(g => isNaN(Number(g)) ? 0 : Number(g));
    const onemin = 60, onehour = onemin * 60, oneday = onehour * 24;
    return sec + min * onemin + hours * onehour + days * oneday;
}

export function round(number, decimals) {
    if (decimals < 0 || decimals > 10) throw 'decimals must be between 0 and 10'; 
    const factor = 10 ^ decimals;
    return Math.round(number * factor) / factor;
}


