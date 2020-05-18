import { templates } from './templates';

const empty = {
    id:'0',
    preview:'',
    description: "Plantilla en blanco",
    createdAt: '',
    name:'En blanco',
    category:'',
    license:'GPL',
    createdBy:"",
    url: ""
};

const store = window.localStorage;
const categories = ['Category 1', 'Category 2', 'Category 3'];
const collections = {};

function getCollection(name, defaultValue) {
    if (!collections[name]) {
        collections[name] = readStoreKey(name, defaultValue);
    }
    return collections[name];
}

function readStoreKey(key, defaultValue = null) {
    let value = store.getItem(key);
    if (!value && defaultValue) {
        value = defaultValue;
        store.setItem(key, JSON.stringify(defaultValue));
    }
    else {
        value = JSON.parse(value);
    }
    return value;
}

export class StorageLocal {
    constructor(app) {
        this.app = app;
        this.name = 'LocalStorage';
        //initialize store
        this.initializeStore();
    }

    initializeStore() {
    }

    getTemplateCategories() {
        return categories;
    }

    getTemplates(filter) {
        return [empty, ...templates.filter(item => {
            var matchCat = null;
            if (filter.categories && filter.categories.length) {
                matchCat = filter.categories.indexOf(item.category) >= 0;
            }

            var matchKeyword = null;
            if (filter.keyword && filter.keyword != '') {
                var re = new RegExp(filter.keyword, 'i');
                matchKeyword = re.test(item.description) || re.test(item.name)  || re.test(item.category);
            }

            return (matchKeyword == null || matchKeyword) && (matchCat == null || matchCat);
        })];
    }

    getObjects(filter) {
        return getCollection('objects', []);
    }

    save(dco) {
        let objects = getCollection('objects');
        if (!dco.id) {
            dco.id = 'dco_' + (new Date().getTime());
        }

        let index = objects.findIndex(o => o.id == dco.id);
        if (index >= 0) {
            objects[index] = dco;
        }
        else {
            objects.push(dco);
        }
        store.setItem('objects', JSON.stringify(objects));
        return Promise.resolve(dco);
    }

    download(dco) {
    }

    addResource(res) {
    }

    deleteResource(res) {
    }

    share(dco) {
    }

    /*
    Object resources methods
    */
    /*
    List all resouces (files and folder) at an specified path of the object e.g (/, /content)
    returns: Array with the list of objects in the given path. 
    */
    getResources(dco, path) {
        const resources = getCollection('res_'+dco.id, []);
        return Promise.resolve(resources.filter(r => r.path.substr(0, r.path.lastIndexOf('/')+1) == path));
    }
    /*
    Will rename a file in the object directory structure
    returns: { succeed: true | false, message: string };
    */
    renameResource(dco, res, newName) {
        const key = 'res_'+dco.id;
        const resources = getCollection(key, []);
        const newPath = res.path.substr(0, res.path.lastIndexOf('/')+1) + newName;
        if (resources.find(r => r.path == newPath)) return Promise.reject('An item with the same path already exists');
        const item = resources.find(r => r.path == res.path);
        if (!item) Promise.reject('Resource not found');
        item.name = newName;
        item.path = newPath;
        store.setItem(key, JSON.stringify(resources));
        return Promise.resolve(true);
    }
    /*º
    Will delete a file in the object directory structure
    returns: { succeed: true | false, message: string };
    */
    deleteResource(dco, path) {
        const key = 'res_'+dco.id;
        const resources = getCollection(key, []);
        let index = resources.findIndex(r => r.path == path);
        if (index >= 0) {
            resources.splice(index, 1);
        }
        store.setItem(key, JSON.stringify(resources));
        return Promise.resolve(true);
    }
    /*
    Will add a new resource in the directory structure at the given path
    resouce: { type: F|D, name: string, file: Blob | null }
    returns: { succeed: true | false, message: string };
    */
    addResource(dco, res, basepath){
        const key = 'res_'+dco.id;
        const resources = getCollection(key, []);
        const { type, name, size, createdAt, extension } = res;
        if (!/\/$/.test(basepath)) basepath += '/';
        const path = [basepath, name].join('');

        let item = resources.find(r => r.path == path);
        if (item) {
            return Promise.reject('An item with the same path already exists');
        }
        item = {type, path, name, size, createdAt, extension };
        resources.push(item);
        store.setItem(key, JSON.stringify(resources));
        return Promise.resolve(item);
    }
}