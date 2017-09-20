import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/lint/lint.css';
import CodeMirror from 'codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/lint/lint';
import jsonlint from 'jsonlint';

CodeMirror.registerHelper("lint", "json", function(text) {
  var found = [];
  var {parser} = jsonlint;
  parser.parseError = function(str, hash) {
    var loc = hash.loc;
    found.push({
      from: CodeMirror.Pos(loc.first_line - 1, loc.first_column),
      to: CodeMirror.Pos(loc.last_line - 1, loc.last_column),
      message: str
    });
  };
  try {
    jsonlint.parse(text);
  } catch (e) {}
  return found;
});

export default {
  name: 'CodeMirrorEditor',
  props: ['schemaText', 'options'],
  mounted() {
    var textArea = this.$refs.JSONCodemirror;
    this.editor = CodeMirror.fromTextArea(textArea, this.options);
    this.editor.on("change", function(cm, obj) {
      this.editorText = cm.getValue();
    }.bind(this));
  },
  data () {
    return {
      editorText: this.schemaText,
      editor: {}
    };
  },
  watch: {
    schemaText: function(schema) {
      this.editorText = schema;
      this.editor.setValue(schema);
    }
  },
  render() {
    return (
      <div>
        <textarea ref="JSONCodemirror" domProps-value={this.editorText}></textarea>
      </div>
    );
  }
};