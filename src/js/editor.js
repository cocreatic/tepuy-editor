function TepuyEditor(el, options) {
    el.innerHTML = "I will become a tepuy editor at sometime... Please wait...";
    console.log(options);
}

export function editorFactory(element, options) {
    console.log(typeof(element));
    if (typeof(element) ===  'string') {
        element = document.querySelectorAll(element)[0];
    }

    console.log('creating editor');
    var editor = new TepuyEditor(element, options);
    console.log('editor created');
    console.log(editor);
}
