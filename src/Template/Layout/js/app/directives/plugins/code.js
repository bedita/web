import CodeMirror from 'codemirror';
import 'codemirror/mode/htmlmixed/htmlmixed';

function format(html) {
    let tab = '\t';
    let result = '';
    let indent= '';

    html.split(/>\s*</).forEach((element) => {
        if (element.match( /^\/\w/ )) {
            indent = indent.substring(tab.length);
        }

        result += indent + '<' + element + '>\r\n';

        if (element.match( /^<?\w[^>]*[^\/]$/ )) {
            indent += tab;
        }
    });

    return result.substring(1, result.length-3);
}

const setContent = (editor, html) => {
    editor.focus();
    editor.undoManager.transact(function () {
        editor.setContent(html);
    });
    editor.selection.setCursorLocation();
    editor.nodeChanged();
};

const getContent = (editor) => editor.getContent({ source_view: true });

const open = async (editor) => {
    const editorContent = getContent(editor);
    editor.windowManager.open({
        title: 'Source Code',
        size: 'large',
        body: {
            type: 'panel',
            items: [{
                type: 'textarea',
                name: 'code',
                id: 'codemirror',
            }],
        },
        buttons: [
            {
                type: 'cancel',
                name: 'cancel',
                text: 'Cancel'
            },
            {
                type: 'submit',
                name: 'save',
                text: 'Save',
                primary: true,
            }
        ],
        initialData: { code: editorContent },
        onSubmit: (api) => {
            setContent(editor, api.getData().code);
            api.close();
        },
    });

    let textarea = document.querySelector('.tox-textarea');
    textarea.value = format(editor.getContent());
    let codemirror = CodeMirror.fromTextArea(textarea, {
        mode: 'text/html',
        lineNumbers: true,
        theme: 'monokai',
    });

    codemirror.on('change', () => {
        textarea.value = codemirror.getValue();
    });
};

tinymce.util.Tools.resolve('tinymce.PluginManager').add('code', function(editor) {
    editor.addCommand('mceCodeEditor', () => {
        open(editor);
    });

    editor.ui.registry.addButton('code', {
        icon: 'sourcecode',
        tooltip: 'Source code',
        onAction: () => open(editor),
    });

    editor.ui.registry.addMenuItem('code', {
        icon: 'sourcecode',
        text: 'Source code',
        onAction: () => open(editor),
    });
});
