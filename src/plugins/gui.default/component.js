import { App } from '../../js/index';

export class GuiDefault {

    constructor() {
        console.log('building gui');
        App.registerHook('gui_initialize', this.initialize);
    }

    initialize() {

        var html = document.querySelector("script#gui-default");
        console.log(html);
        console.log('I will register menu entries here');

        App.container.innerHTML = html && html.innerHTML || '';
    }
}