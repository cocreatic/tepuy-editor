export const selectableList = {
    argDefault: false,
    bindTo: ["selectedIndex"],
    bindFrom: [0],
    linkedCtxParam: ["items"],
    ctx: { selectedIndex: -1 },
    init: function(tagCtx) {
        this.listTag = tagCtx.props.elem || 'ul';
        this.itemTag = /^(ul|ol)$/.test(this.listTag) ? 'li' : 'div';
        this.displayElement = this.listTag;
        this.template = [
            '{^{if ~tagCtx.index === 0}}<', this.listTag, '>',
            '{^{for ~items}}',
            '<', this.itemTag, ' class="tpy-list-item" ',
            'data-link="{class{merge:!!(#getIndex()%2) toggle=\'item-alt\'}{class{merge:(~selectedIndex==#index) toggle=\'ui-selected\'}">',
            '{^{include tmpl=#content/}}</', this.itemTag, '>',
            '{{/for}}',
            '</', this.listTag, '>',
            '{{/if}}',
        ].join('');
    },
    onBind: function(tagCtx) {
        const displayElem = tagCtx.displayElem;
        const tag = this;
        const selectedIndex = +(tag.ctxPrm("selectedIndex"));
        if (selectedIndex < 0 && tagCtx.args[0].length) this.setSelected(0);
        displayElem.attr('tabindex', '0') //Required so key events are received during focus
        .on('click', '.tpy-list-item', function() {
            const view = $.view(this);
            const index = view.index;
            if (tag.selected != index) {
                tag.setSelected(index);
                this.focus();
            }
        }).on('keyup', this.onKeyUp.bind(this));
    },
    //Methods
    setSelected: function(index){
        index = index || 0;
        //Update two-way binding
        this.ctxPrm("selectedIndex", ""+index);
        this.updateValues(index, true);
    },
    onUpdate: false,
    dataBoundOnly: true,
    onKeyUp: function(e) {
        var tag=this;
        let selectedIndex;
        switch(e.which) {
            case 38: //Arrow up
                selectedIndex = +(tag.ctxPrm("selectedIndex"));
                if (selectedIndex > 0) tag.setSelected(selectedIndex-1);
                break;
            case 40: //Arrow down
                selectedIndex = +tag.ctxPrm("selectedIndex");
                const items = tag.tagCtx.args[0];
                if (selectedIndex < items.length-1) tag.setSelected(selectedIndex+1);
                break;
        }
    }
};
