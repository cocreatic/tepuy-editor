const _private = new WeakMap();
const _ = (instance) => {
    return _private.get(instance);
}
const checkImplementation = (instance, method) => {
    let priv = _(instance);
    if (!(method in priv.impl)) {
        throw { message: 'Unsupported method', method: method, plugin: priv.implName };
    }
}

export class Auth {
    constructor(impl) {
        //Set private properties
        _private.set(this, {
            impl,
            implName: impl.name||''
        });
    }

    authenticate() {
        checkImplementation(this, 'authenticate');
        return _(this).impl.authenticate();
    }

    getUserInfo() {
        checkImplementation(this, 'getUserInfo');
        return _(this).impl.getUserInfo();
    }
}