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
    
    if (typeof fileref!="undefined") {
        return new Promise((resolve, reject) => {
            fileref.onload = () => resolve(true);
            fileref.onerror = () => resolve(false);
            document.getElementsByTagName("head")[0].appendChild(fileref)
        });
    }
    return Promise.resolve(false);
}
