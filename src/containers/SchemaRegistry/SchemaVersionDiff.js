import _ from 'lodash';
import Utils from '../../utils/Utils';
import Select from '../../components/VueSelect';
import {EventBus} from '../../utils/EventBus';
import {diffview} from '../../libs/jsdifflib/diffview';
import {difflib} from '../../libs/jsdifflib/difflib';

export default {
  name: 'SchemaVersionDiff',
  props: ['schemaObj'],
  mounted () {
    EventBus.$on("handleBaseVersionChange", this.handleBaseVersionChange);
    EventBus.$on("handleNewVersionChange", this.handleNewVersionChange);
    this.getSchemaDiff();
  },
  updated () {
    this.getSchemaDiff();
  },
  data () {
    let versionsArr = Utils.sortArray(this.schemaObj.versionsArr.slice(), 'version', false);
    return {
      baseText: versionsArr[1].schemaText,
      newText: versionsArr[0].schemaText,
      baseTextVersion: versionsArr[1],
      baseTextOptions: versionsArr,
      newTextVersion: versionsArr[0],
      newTextOptions: versionsArr,
      diffOutputText: '',
      versionsArr: _.clone(versionsArr),
      inlineView: true
    };
  },
  methods: {
    handleBaseVersionChange(obj){
      let {versionsArr, newTextVersion, newText, baseTextOptions} = this;
      if(!_.isEmpty(obj)) {
        let s = _.find(baseTextOptions, {version: obj.version});
        this.baseText = s.schemaText;
        this.baseTextVersion = s;
      }
    },
    handleNewVersionChange(obj){
      let {newTextOptions, baseTextVersion, baseText, versionsArr} = this;
      if(!_.isEmpty(obj)) {
        let s = _.find(newTextOptions, {version: obj.version});
        this.newText = s.schemaText;
        this.newTextVersion = s;
      }
    },
    toggleDiffView(e) {
      this.inlineView = e.target.dataset.name === "inlineDiff" ? true : false;
    },
    getSchemaDiff () {
      let {baseText, newText, baseTextVersion, newTextVersion, inlineView} = this;
      // get the baseText and newText values and split them into lines
      var base = difflib.stringAsLines(baseText);
      var newtxt = difflib.stringAsLines(newText);
      // create a SequenceMatcher instance that diffs the two sets of lines
      var sm = new difflib.SequenceMatcher(base, newtxt);
      // get the opcodes from the SequenceMatcher instance
      // opcodes is a list of 3-tuples describing what changes should be made to the base text
      // in order to yield the new text
      var opcodes = sm.get_opcodes();

      var diffoutputdiv = document.getElementsByClassName('diffoutputdiv')[0];
      while (diffoutputdiv.firstChild) {diffoutputdiv.removeChild(diffoutputdiv.firstChild);}

      // build the diff view and add it to the current DOM
      diffoutputdiv.appendChild(diffview.buildView({
        baseTextLines: base,
        newTextLines: newtxt,
        opcodes: opcodes,
        baseTextName: baseTextVersion ? ("V " + baseTextVersion.version) : '',
        newTextName: newTextVersion ?  ("V " + newTextVersion.version) : '',
        viewType: inlineView ? 1 : 0
      }));
    }
  },
  render () {
    return (
      <div>
      <div class="form-horizontal">
        <div class="form-group version-diff-labels m-b-sm">
            <label class="control-label col-sm-2">Base Version</label>
            <div class="col-sm-2">
              <Select options={this.baseTextOptions} selectedVal={this.baseTextVersion} callBack="handleBaseVersionChange" valueKey="version" textKey="version" />
            </div>
            <label class="control-label col-sm-offset-2 col-sm-2">New Version</label>
            <div class="col-sm-2">
              <Select options={this.newTextOptions} selectedVal={this.newTextVersion} callBack="handleNewVersionChange" valueKey="version" textKey="version" />
            </div>
        </div>
        <div class="row">
          <div class="col-sm-6">
            <label class="bold">Description</label>
            <p class="version-description">{this.baseTextVersion ? this.baseTextVersion.description : ''}</p>
          </div>
          <div class="col-sm-6">
            <label class="bold">Description</label>
            <p class="version-description">{this.newTextVersion ? this.newTextVersion.description : ''}</p>
          </div>
        </div>
      <hr />
      <div class="row">
        <div class="col-sm-12">
          {this.inlineView ?
          (<div class="table-header-custom unified">{"V " + (this.baseTextVersion ? this.baseTextVersion.version : '') + " vs. V " + (this.newTextVersion ? this.newTextVersion.version : '')}
              <bButtonGroup size="sm">
                <bButton
                  class={this.inlineView ? "diffViewBtn btn selected" : "diffViewBtn btn"}
                  data-name="inlineDiff"
                  onClick={this.toggleDiffView.bind(this)}
                >
                  Unified
                </bButton>
                <bButton
                  class={this.inlineView ? "diffViewBtn btn" : "diffViewBtn btn selected"}
                  data-name="sideBySideDiff"
                  onClick={this.toggleDiffView.bind(this)}
                >
                  Split
                </bButton>
            </bButtonGroup>
          </div>)
          :
          (<div class="table-header-custom split">
            <div class="col-sm-6">{"V " + (this.baseTextVersion ? this.baseTextVersion.version : '')}</div>
            <div>{"V " + (this.newTextVersion ? this.newTextVersion.version : '')}</div>
            <bButtonGroup size="sm">
                <bButton
                  class={this.inlineView ? "diffViewBtn btn selected" : "diffViewBtn btn"}
                  data-name="inlineDiff"
                  onClick={this.toggleDiffView.bind(this)}
                >
                  Unified
                </bButton>
                <bButton
                  class={this.inlineView ? "diffViewBtn btn" : "diffViewBtn btn selected"}
                  data-name="sideBySideDiff"
                  onClick={this.toggleDiffView.bind(this)}
                >
                  Split
                </bButton>
            </bButtonGroup>
          </div>)
          }
          <div class="diffoutputdiv"></div>
        </div>
      </div>
      </div>
      </div>
    );
  }
};