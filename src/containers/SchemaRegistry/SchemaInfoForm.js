import SchemaREST from '../../rest/SchemaREST';
import Select from '../../components/VueSelect';
import _ from 'lodash';
import {EventBus} from '../../utils/EventBus';
import Utils from '../../utils/Utils';
import CodeMirrorEditor from '../../components/CodeMirrorEditor';

export default {
  name: 'SchemaInfoForm',
  created () {
    this.fetchData();
  },
  mounted () {
    EventBus.$on("handleTypeChange", this.handleTypeChange);
    EventBus.$on("handleCompatibilityChange", this.handleCompatibilityChange);
  },
  updated() {
    this.setCodemirrorSize();
  },
  data () {
    return {
      name: '',
      compatibility: 'BACKWARD',
      compatibilityArr: [
        {
          value: 'BACKWARD',
          text: 'BACKWARD'
        }, {
          value: 'FORWARD',
          text: 'FORWARD'
        }, {
          value: 'BOTH',
          text: 'BOTH'
        }, {
          value: 'NONE',
          text: 'NONE'
        }
      ],
      evolve: true,
      schemaText: '',
      schemaTextFile: null,
      type: 'avro',
      typeArr: [],
      schemaGroup: 'Kafka',
      description: '',
      showCodemirror: false,
      expandCodemirror: false,
      showError: false,
      changedFields: [],
      options: {
        mode:'application/json',
        lineNumbers:true,
        lint: true,
        styleActiveLine: true,
        gutters:['CodeMirror-lint-markers']
      }
    };
  },
  methods: {
    fetchData () {
      SchemaREST.getSchemaProviders().then((results) => {
        results.entities.map((e)=>{
          this.typeArr.push({
            value: e.type,
            text: e.name
          });
        });
      });
    },
    setCodemirrorSize(){
      const {formLeftPanel, browseFileContainer} = this.$refs;
      const height = formLeftPanel.clientHeight - 50;
      var editor = document.getElementsByClassName('CodeMirror')[0];
      if(editor){
        if(!this.expandCodemirror){
          editor.CodeMirror.setSize('100%', height);
        }else{
          editor.CodeMirror.setSize('100%', '450px');
        }
      }else{
        browseFileContainer.style.height = height+'px';
      }
    },
    handleTypeChange (obj) {
      if(!_.isEmpty(obj)) {
        this.type = obj.value;
      }
    },
    handleCompatibilityChange (obj) {
      if(!_.isEmpty(obj)) {
        this.compatibility = obj.value;
      }
    },
    handleOnDrop(e) {
      e.preventDefault();
      e.stopPropagation();
      if (!e.dataTransfer.files.length) {
        this.schemaTextFile = null;
      } else {
        var file = e.dataTransfer.files[0];
        var reader = new FileReader();
        reader.onload = function(e) {
          if(Utils.isValidJson(reader.result)) {
            this.schemaTextFile = file;
            this.schemaText = reader.result;
            this.showCodemirror = true;
          } else {
            this.schemaTextFile = null;
            this.schemaText = '';
            this.showCodemirror = true;
          }
        }.bind(this);
        reader.readAsText(file);
      }
    },
    handleBrowseFile(e){
      e.preventDefault();
      e.stopPropagation();

      var file = e.target.files[0];
      var reader = new FileReader();
      reader.onload = function(e) {
        this.schemaTextFile = file;
        this.schemaText = reader.result;
        this.showCodemirror = true;
      }.bind(this);
      reader.readAsText(file);
    },
    validateData() {
      let {name, type, schemaGroup, description, changedFields} = this;
      let schemaText = this.$refs.CodeMirrorEditorRef.editorText;
      if (name.trim() === '' || schemaGroup === '' || type === '' || description.trim() === '' || schemaText.trim() === '' || !Utils.isValidJson(schemaText.trim())) {
        if (name.trim() === '' && changedFields.indexOf("name") === -1) {
          changedFields.push("name");
        };
        if (schemaGroup.trim() === '' && changedFields.indexOf("schemaGroup") === -1) {
          changedFields.push("schemaGroup");
        }
        if (type.trim() === '' && changedFields.indexOf("type") === -1) {
          changedFields.push("type");
        }
        if (description.trim() === '' && changedFields.indexOf("description") === -1) {
          changedFields.push("description");
        }
        this.showError = true;
        this.changedFields = changedFields;
        this.expandCodemirror = false;
        return false;
      } else {
        this.showError = false;
        return true;
      }
    },
    handleSave() {
      let {name, type, schemaGroup, description, compatibility, evolve} = this;
      let schemaText = this.$ref.CodeMirrorEditorRef.editorText;
      let data = {
        name,
        type,
        schemaGroup,
        description,
        evolve
      };
      if (compatibility !== '') {
        data.compatibility = compatibility;
      }
      return SchemaREST.postSchema({body: JSON.stringify(data)})
        .then((schemaResult)=>{
          if(schemaResult.responseMessage !== undefined){
          } else {
            let versionData = { schemaText, description };
            return SchemaREST.postVersion(name, {body: JSON.stringify(versionData)});
          }
        });
    }
  },
  render () {
    return (
      <div>
        <bForm>
          <div class="row">
            <div hidden={this.expandCodemirror} class={this.expandCodemirror ? "" : "col-md-6"} ref="formLeftPanel">
              <bFormGroup
                label='Name <span class="text-danger">*</span>'
                label-for="name"
              >
                <input type="text"
                  id="name"
                  class={this.showError && this.changedFields.indexOf("name") !== -1 && this.name.trim() === '' ? "form-control invalidInput" : "form-control"}
                  required
                  placeholder="Name"
                  domProps-value={this.name}
                  onInput={(e)=>{
                    this.name = e.target.value;
                  }}
                />
              </bFormGroup>
              <bFormGroup
                label='Description <span class="text-danger">*</span>'
                label-for="description"
              >
                <input type="text"
                  id="description"
                  class={this.showError && this.changedFields.indexOf("description") !== -1 && this.description.trim() === '' ? "form-control invalidInput" : "form-control"}
                  required
                  placeholder="Description"
                  domProps-value={this.description}
                  onInput={(e)=>{
                    this.description = e.target.value;
                  }}
                />
              </bFormGroup>
              <bFormGroup
                label='Type <span class="text-danger">*</span>'
                label-for="type"
              >
                <Select options={this.typeArr} selectedVal={this.type} callBack="handleTypeChange" />
              </bFormGroup>
              <bFormGroup
                label='Schema Group <span class="text-danger">*</span>'
                label-for="group"
              >
                <input type="text"
                  id="group"
                  class={this.showError && this.changedFields.indexOf("schemaGroup") !== -1 && this.schemaGroup === '' ? "form-control invalidInput" : "form-control"}
                  required
                  placeholder="Group"
                  domProps-value={this.schemaGroup}
                  onInput={(e)=>{
                    this.schemaGroup = e.target.value;
                  }}
                />
              </bFormGroup>
              <bFormGroup
                label='Compatibility'
                label-for="compatibility"
              >
                <Select options={this.compatibilityArr} selectedVal={this.compatibility} callBack="handleCompatibilityChange" />
              </bFormGroup>
              <bFormGroup>
                <input
                  type="checkbox"
                  id="evolve"
                  checked={this.evolve}
                  onChange={(e) =>{this.evolve = e.target.checked;}}
                />
                <label> Evolve</label>
                {!this.evolve
                  ?
                  <span class="warning"> <i class="fa fa-exclamation-triangle" aria-hidden="true"></i> New schema versions cannot be added.</span>
                  :
                  null
                }
              </bFormGroup>
            </div>
            <div class={this.expandCodemirror ? "col-md-12" : "col-md-6"}>
              <bFormGroup
              >
                <label>
                  Schema Text <span className="text-danger">*</span>
                </label>
                {this.showCodemirror
                  ? [<a key="1" class="pull-right clear-link" href="javascript:void(0)" onClick={() => { this.schemaText = ''; this.showCodemirror = false; this.expandCodemirror = false; }}> CLEAR </a>,
                    <span key="2" class="pull-right" style={{margin: '-1px 5px 0'}}>|</span>,
                    <a key="3" class="pull-right" href="javascript:void(0)" onClick={() => { this.expandCodemirror = !this.expandCodemirror; }}>
                      {this.expandCodemirror ? <i class="fa fa-compress"></i> : <i class="fa fa-expand"></i>}
                    </a>]
                  : 
                  null
                }
                <div onDrop={this.handleOnDrop.bind(this)} onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                }}
                >
                  {this.showCodemirror
                    ?
                    <CodeMirrorEditor ref="CodeMirrorEditorRef" schemaText={this.schemaText} options={this.options} />
                    :
                    <div ref="browseFileContainer" class={"addSchemaBrowseFileContainer"+(this.showError && !Utils.isValidJson(this.schemaText) ? ' invalidInput' : '')}>
                      <div onClick={(e) => {
                        this.showCodemirror = true;
                      }}>
                        <div class="main-title">Copy & Paste</div>
                        <div class="sub-title m-t-sm m-b-sm">OR</div>
                        <div class="main-title">Drag & Drop</div>
                        <div class="sub-title" style={{"marginTop": "-4px"}}>Files Here</div>
                        <div class="sub-title m-t-sm m-b-sm">OR</div>
                        <div  class="m-t-md">
                          <input type="file" ref="browseFile" class="inputfile" onClick={(e) => {
                            e.stopPropagation();
                          }} onChange={this.handleBrowseFile.bind(this)}/>
                          <label htmlFor="file" class="btn btn-success">BROWSE</label>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </bFormGroup>
            </div>
          </div>
        </bForm>
      </div>
    );
  }
};
