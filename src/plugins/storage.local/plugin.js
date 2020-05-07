import { templates } from './templates';
import { resources } from './resources';

export class StorageLocal {
    constructor() {
        this.name = 'LocalStorage';
    }

    getTemplateCategories() {
        return ['Category 1', 'Category 2', 'Category 3'];
    }

    getTemplates(filter) {
        return templates.filter(item => {
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
        });
    }

    save(dco) {
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
        return resources.filter(item => {
            var matchPath = null;
            if(path && path != ''){
                var res = new RegExp(path,'i');
                matchPath = res.test(item.path);
            }
            return(matchPath == null|| matchPath);
        });
    }
    /*
    Will rename a file in the object directory structure
    returns: { succeed: true | false, message: string };
    */
    renameResource(resource, newpath) {
        return { succeed: true | false, message: '' };
    }
    /*
    Will delete a file in the object directory structure
    returns: { succeed: true | false, message: string };
    */
    deleteResource(resource) {
        return { succeed: true | false, message: '' };
    }
    /*
    Will add a new resource in the directory structure at the given path
    resouce: { type: F|D, name: string, file: Blob | null }
    returns: { succeed: true | false, message: string };
    */
    addResource(resource, path){

    }
}