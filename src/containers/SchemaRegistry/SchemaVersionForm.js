import SchemaREST from '../../rest/SchemaREST';
import Utils from '../../utils/Utils';
import {statusCode} from '../../utils/Constants';
import loaderImg from '../../assets/img/start-loader.gif';
import CodeMirrorEditor from '../../components/CodeMirrorEditor';

export default {
  name: 'SchemaVersionForm',
  props: ['schemaObj'],
  created() {},
  data () {
    return {
      schemaText: this.schemaObj.schemaText || '',
      schemaTextFile: this.schemaObj.schemaTextFile || null,
      description: '',
      showError: false,
      changedFields: [],
      showCodemirror: true,
      schemaTextCompatibility: statusCode.Ok,
      options: {
        lineNumbers: true,
        mode: "application/json",
        styleActiveLine: true,
        gutters: ["CodeMirror-lint-markers"],
        lint: true
      }
    };
  },
  methods: {
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
    handleBrowseFile(e) {
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
      let {schemaText, description, changedFields} = this;
      if (schemaText.trim() === '' || !Utils.isValidJson(schemaText.trim()) || description.trim() === '') {
        if (description.trim() === '' && changedFields.indexOf("description") === -1) {
          changedFields.push('description');
        }
        this.showError = true;
        return false;
      } else {
        this.showError = false;
        return true;
      }
    },
    handleSave () {
      let schemaText = this.$refs.CodeMirrorEditorRef.editorText;
      let {description} = this;
      let data = {
        schemaText,
        description
      };
      return SchemaREST.getCompatibility(this.schemaObj.schemaName, {body: JSON.stringify(JSON.parse(schemaText))})
        .then((result)=>{
          if(result.compatible){
            return SchemaREST.postVersion(this.schemaObj.schemaName, {body: JSON.stringify(data)});
          } else {
            return result;
          }
        });
    },
    validateSchemaCompatibility () {
      try{
        const schemaTextStr = JSON.stringify(JSON.parse(this.$refs.CodeMirrorEditorRef.editorText));
        this.schemaTextCompatibility = statusCode.Processing;
        SchemaREST.getCompatibility(this.schemaObj.schemaName, {body: schemaTextStr})
          .then((result)=>{
            if(result.compatible){
              this.schemaTextCompatibility = statusCode.Success;
            }else{
              this.schemaTextCompatibility = result.errorMessage || result.responseMessage;
            }
          });
      }
      catch(err){
        console.log(err);
      }
    }
  },
  render() {
    return (
      <div>
        <bForm>
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
          <bFormGroup class="">
            <label>Schema Text <span class="text-danger">*</span></label>
            {this.showCodemirror
              ? [<a key="1" class="pull-right clear-link" href="javascript:void(0)" onClick={() => { this.schemaText = '';this.showCodemirror = false;this.schemaTextCompatibility = statusCode.Ok; }}> CLEAR </a>,
                <span key="2" class="pull-right" style={{margin: '-1px 5px 0'}}>|</span>,
                <a key="3" class="pull-right validate-link" href="javascript:void(0)" onClick={this.validateSchemaCompatibility}>
                  VALIDATE
                </a>]
              :
              null
            }
            <div onDrop={this.handleOnDrop.bind(this)} onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              return false;
            }} style={{"width":"100%"}}>
              {this.showCodemirror
                ?
                <div style={{"width":"100%", position: 'relative'}}>
                  {this.schemaTextCompatibility === statusCode.Processing
                  ?
                  <div class="loading-img text-center schema-validating">
                    <img src={loaderImg} alt="loading" />
                  </div>
                  :
                  this.schemaTextCompatibility === statusCode.Ok
                    ?
                    ''
                    :
                    <div class={this.schemaTextCompatibility === statusCode.Success ? "compatibility-alert success" : "compatibility-alert danger"}>
                      {this.schemaTextCompatibility === statusCode.Success ? <span class="success">Schema is valid</span> : <span className="danger">{this.schemaTextCompatibility}</span>}
                      <span class="alert-close"><i class="fa fa-times" onClick={() => this.schemaTextCompatibility = statusCode.Ok}></i></span>
                    </div>
                  }
                  <CodeMirrorEditor ref="CodeMirrorEditorRef" schemaText={this.schemaText} options={this.options} />
                </div>
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
                      <label class="btn btn-success">BROWSE</label>
                    </div>
                  </div>
                </div>
              }
            </div>
          </bFormGroup>
        </bForm>
      </div>
    );
  }
};