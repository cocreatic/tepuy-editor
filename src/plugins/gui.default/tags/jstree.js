export const jstree = {
// ============================= JSTREE =============================
  argDefault: false, // Do not default missing arg to #data
  mainElement: ".tpe-jstree",
  widgetName: 'jstree',
  template: '<div class="tpe-jstree"></div>',
  init: function(tagCtx) {
    var content, elemType,
      tag = this;
  },
  onBind: function(tagCtx) {
    var mainElem, prop, i, optionKey, plugin,
      tag = this,
      widgetName = tag.widgetName,
      options = tag.options,     // hash (or function returning hash) of option settings
      presetsHash = {};

    const plugins = [];
    const config = tagCtx.props.config || {};

    if (config.core) {
      presetsHash.core = config.core;
    }

    if (config.wholerow || config.toolbar) {
      plugins.push('wholerow');
    }

    if (config.types) {
      plugins.push('types');
      presetsHash.types = config.types;
    }

    if (config.contextmenu) {
      const contextmenu = config.contextmenu;
      plugins.push('contextmenu');
      presetsHash.contextmenu = {
        items: (node) => {
          if (typeof contextmenu.items == 'function') {
            return contextmenu.items(node, tag.widget);
          }
          return contextmenu.items;
        }
      }
    }

    if (config.dnd) {
      plugins.push('dnd');
      presetsHash.dnd = {};
    }

    presetsHash.plugins = plugins;

    const data = tagCtx.args[0] || tagCtx.props['_data'];

    presetsHash.core = Object.assign({}, presetsHash.core, { data: data });

    mainElem = tag.mainElem;
    if (!mainElem || !mainElem[0]) {
      // This may be due to using {{myWidget}} No element found here {{/myWidget}} 
      throw "No element found for tag '" + tag.tagName +"'";
    }

    if (tagCtx.props.id && !mainElem[0].id) {
      mainElem[0].id = tagCtx.props.id;
    }

    // Instantiate widget
    mainElem[widgetName](presetsHash);


    // Register toolbar
    if (config.toolbar) {
      const template = $.templates('<div class="tpe-jstree-node-toolbar">' +
        '{{props items}}' +
        '<span data-action="{{:prop.id}}"><i class="{{:prop.icon}}" style="pointer-events:none"></i></span>' +
        '{{/props}}' +
        '</div>');

      mainElem.on('hover_node.jstree', function(ev, data) {
        const node = data.node;
        const $nodeEl = mainElem.find('.jstree-node[id='+node.id+']');
        const $anchor = $nodeEl.find('.jstree-anchor');

        if ($nodeEl.is('.tpe-toolbar-active')) return;

        $nodeEl.addClass('tpe-toolbar-active');
        const items = config.toolbar.items(node);
        const pos = $anchor.position();
        const height = $anchor.outerHeight();
        
        $(template({items})).appendTo($nodeEl).on('click', '[data-action]', function(ev) {
          ev.preventDefault();
          ev.stopPropagation();
          const action = $(this).data().action;
          const menu = items[action];
          menu && menu.action({
            item: menu,
            reference: node,
            element: this,
          });
        })
        .css({top: pos.top, height: height});
        return;
      });

      mainElem.on('dehover_node.jstree', function(ev, data) {
        const $nodeEl = mainElem.find('.jstree-node[id='+data.node.id+']');
        $nodeEl.removeClass('tpe-toolbar-active')
          .find('.tpe-jstree-node-toolbar').remove();
      });
    }

    //Register event handlers
    if (config.events) {
      for(const event in config.events) {
        mainElem.on(event, config.events[event]);
      }
    }

    mainElem.on('create_node.jstree', (ev, data) => {
      const parent = tag.widget.get_node(data.parent);
      tag.widget.open_node(parent);
    });

    mainElem.on('delete_node.jstree', (ev, data) => {
      const parent = tag.widget.get_node(data.parent);
      if (parent.children.length == 0)
        tag.widget.close_node(parent);
    });

    // Store widget instance
    tag.widget = mainElem.data(widgetName);

    if (!tag.widget) {
      // Widget failed to load, or is not a valid widget factory type
      throw "widget '" + widgetName + "' failed";
    }
  },
  onAfterLink: function(tagCtx) {
  },
  onUpdate: false, // Don't rerender whole tag on update
  dataBoundOnly: true,
  attr: "html"
};
