export const tooltip = {
  baseTag: "widget",
  widgetName: "tooltip",
  init: function(tagCtx) {
      var tag = this;
      tag.jqcontent = tagCtx.props.jqcontent;
      tag.content = tagCtx.props.content;
      tag.contentid = tagCtx.props.contentid;
      tag.baseApply(arguments);
  },
  onBind: function() {
    var tag = this;
    tag.baseApply(arguments);
    var content;
    if (tag.jqcontent) {
        content = $(tag.jqcontent);
    }
    else if (tag.content) {
        content = tag.content;
    }
    else if (tag.contentid) {
        content = document.getElementById(tag.contentid);
    }
    content && tag.mainElem.tooltip("option", "content", content); 
  }
};
