export const Validators = (() => {
    const EMAIL_REGEXP =
      /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

    function isEmptyValue(value) {
        return value == null || value === undefined || value.length === 0;
    }

    const required = (ctrl) => {
        return isEmptyValue(ctrl.value) ? { required: true } : null;
    }

    const email = (ctrl) => {
        return (EMAIL_REGEXP.test(ctrl.value)) ? null : { email: true };
    };

    const maxLength = (maxLength) => {
        return (ctrl) => {
            if (isEmptyValue(ctrl.value)) return null;
            return ctrl.value.length <= maxLength ? null : { maxLength: true };
        }
    };

    const sizeUnit = (ctrl) => {
        if (!ctrl.value) return { sizeUnit: true };
        return /^(auto|\d+(?:\.\d+)?%?)$/i.test(''+ctrl.value) ? null : { sizeUnit: true };
    };

    const pattern = (pattern) => {
        if (!(pattern instanceof RegExp)) {
            if (typeof pattern === 'string') {
                pattern = new RegExp(pattern);
            }
            else {
                throw new TypeError('pattern should be either RegExp or valid RegExp string pattern');
            }
        }
        return (ctrl) => {
            return (pattern.test(ctrl.value)) ? null : { pattern: true };
        }
    }

    return {
        required,
        email,
        maxLength,
        sizeUnit,
        pattern
    };
})();
