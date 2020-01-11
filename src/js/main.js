(function() {

    function TepuyEditor(el, options) {
        el.innerHTML = "I will become a tepuy editor at sometime... please wait...";
    };

    TepuyEditor.prototype.reload = function (options) {

    };

    function editorFactory(element, options) {
        console.log(typeof(element));
        if (typeof(element) ===  'string') {
            element = document.querySelectorAll(element)[0];
        }

        console.log('creating editor');
        var editor = new TepuyEditor(element, options);

        console.log('editor created');

    }

    var _e = window.tepuy.__editor;
    delete window.tepuy.__editor;
    window.tepuy.editor = editorFactory;

})();
