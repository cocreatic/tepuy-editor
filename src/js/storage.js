export class Storage {
    constructor(impl) {
        this._name = impl.name ||'';
        this._impl = impl;
    }

    getTemplateCategories() {
        this._checkImplementation('getTemplateCategories');
        return this._impl.getTemplateCategories();
    }
    
    getTemplates(filter) {
        this._checkImplementation('getTemplates');
        return this._impl.getTemplates(filter);
    }

    save(dco) {
        this._checkImplementation('save');
        return this._impl.save(dco);
    }

    download(dco) {
        this._checkImplementation('download');
        return this._impl.download(dco);
    }

    getResources(dco, path) {
        this._checkImplementation('getResources');
        return this._impl.getResources(dco, path);
    }

    addResource(res) {
        this._checkImplementation('addResource');
        return this._impl.addResource(dco);
    }

    deleteResource(res) {
        this._checkImplementation('deleteResource');
        return this._impl.deleteResource(dco);
    }

    share(dco) {
        this._checkImplementation('share');
        return this._impl.share(dco);
    }

     /*
    "Private" methods
    */
    _checkImplementation(method){
        if (!(method in this._impl)) {
            throw this._name + 'storage plugin is missing ' + method + ' method';
        }
    }

}