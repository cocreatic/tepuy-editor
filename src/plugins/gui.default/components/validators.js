import { durationToNumber, formatDuration } from '../../../js/utils';

export const Validators = (() => {
    const P_HTML_ID = /^[a-zA-Z][\w\.-]*$/;
    const P_HTML_CLASSNAME = /^-?[_a-zA-Z]+[_a-zA-Z0-9-]*$/;
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
        };
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

    const duration = (ctrl) => {
        if (isEmptyValue(ctrl.value)) return null;

        const matches = /^(\d+:)?(\d\d):(\d\d)$/g.exec(ctrl.value);
        if (!matches) return { duration: true };
        const min = parseInt(matches[2]);
        const sec = parseInt(matches[3]);

        if (isNaN(min) || isNaN(sec) || min > 60 || sec > 60 || min < 0 || sec < 0 ) {
            return { duration: true };
        }
        return null;
    }

    const maxDuration = (maxDuration) => {
        return (ctrl) => {
            if (isEmptyValue(ctrl.value)) return null;
            const value = durationToNumber(ctrl.value);
            if (value == 0) {
                console.log(ctrl.value);
            }
            return value > maxDuration ? { maxDuration: true, data: { maxDuration: formatDuration(maxDuration) } } : null;
        };
    };

    const greatherThan = (controlName) => {
        return (ctrl) => {
            if (isEmptyValue(ctrl.value)) return null;
            const refCtrl = ctrl.parent && ctrl.parent.controls && ctrl.parent.controls[controlName] && ctrl.parent.controls[controlName];
            return refCtrl && ctrl.value <= refCtrl.value ? { greatherThan: true, data: { refCtrl } } : null;
        }
    }

    return {
        required,
        email,
        maxLength,
        sizeUnit,
        duration,
        maxDuration,
        greatherThan,
        pattern,
        patterns: {
            HTMLID: P_HTML_ID,
            HTMLCLASSNAME: P_HTML_CLASSNAME
        }
    };
})();
