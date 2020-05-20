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

    if (config.wholerow) {
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

//    if (options) {
//      if ($.isFunction(options)) {
//        options = tag.options();
//      }
//      mainElem[widgetName]("option", options); // initialize options
//    }
  },
  onAfterLink: function(tagCtx) { /*
    var mainElem,
      tag = this,
      options = tag.options, // hash (or function returning hash) of option settings
      props = tagCtx.props,
      widgetName = tag.widgetName.split("-").pop();
    if ($.isFunction(options)) {
      options = tag.options();
    }
    mainElem = tag.mainElem;
    $.each(props, function(key, prop) {
      var option;
      if (key.charAt(0) === "_") {
        key = key.slice(1);
        option = options && options[key];
        if (mainElem[widgetName]("option", key) != prop) { // != so undefined and null are considered equivalent
          mainElem[widgetName]("option", key,
            option && $.isFunction(option) && prop && $.isFunction(prop)
              ? function() {
                // If the same event function option is overridden on the tagDef options
                // (or in a _create override) and the tagCtx.props, call first the one on
                // the tagDef options, and then the one declared on the tag properties.
                option.apply(mainElem[0], arguments);
                return prop.apply(mainElem[0], arguments);
              }
              : prop
            );
        }
      }
    });*/
  },
  onUpdate: false, // Don't rerender whole tag on update
  dataBoundOnly: true,
  attr: "html"
};
