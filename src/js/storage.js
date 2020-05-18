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

    getObjects(filter) {
        this._checkImplementation('getObjects');
        return this._impl.getObjects(filter);
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

    addResource(dco, res, path) {
        this._checkImplementation('addResource');
        return this._impl.addResource(dco, res, path);
    }

    renameResource(dco, res, newName) {
        this._checkImplementation('renameResource');
        return this._impl.renameResource(dco, res, newName);
    }

    deleteResource(dco, path) {
        this._checkImplementation('deleteResource');
        return this._impl.deleteResource(dco, path);
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