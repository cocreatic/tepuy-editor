export class ToolTips {
    #properties;
    #host;

    constructor(element) { //All controls must receive the host element as a parameter, if no element or string provided, the element will be created but not added to the DOM
        if (typeof(element) === undefined) {
            element = 'div';
        }
        if (typeof(element) === 'string') {
            element = document.createElement(element);
        }
        //Initialize private properties
        this.#host = element;
        this.#properties = {
            type: '',
            title: ''
        };
        //Initialize public properties
        let $host = $(element).addClass('tooltip');
        this.type = 'content';
        this.$host = $host;
    }

    setProperty(propName, value) {
        let actual = this.#properties[propName];
        this.#properties[propName] = value;

        switch(propName) {
            case 'type':
                this.$host.removeClass(actual).addClass(value);
                return;
            case 'title':
                this.$host.attr('data-title', value);
                return;
            case 'position':
                this.$host.attr('data-position-my',value);
        }
    }

    getProperty(propName) {
        return this.#properties[propName];
    }

    getPropertyList() {
        return [
            { name: 'type', type: 'string' },
            { name: 'title', type: 'string' },
            { name: 'position',type: 'optionList', options: ['(data-position-at','data-position-flipfit']}
        ];
    }
}