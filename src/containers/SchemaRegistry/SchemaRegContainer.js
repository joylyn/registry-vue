import _ from 'lodash';
import Basecontainer from '../Basecontainer.js';
import SchemaREST from '../../rest/SchemaREST';
import FSModal from '../../components/FSModal';
import Utils from '../../utils/Utils';
import SchemaInfoForm from './SchemaInfoForm';
import CodeMirrorEditor from '../../components/CodeMirrorEditor';
import loaderImg from '../../assets/img/start-loader.gif';
import NoData from '../../components/NoData';
import SchemaVersionForm from './SchemaVersionForm';
import SchemaVersionDiff from './SchemaVersionDiff';

export default {
  name: 'SchemaRegContainer',
  created () {
    this.fetchData();
  },
  data () {
    return {
      schemaData: [],
      schemaObj: {},
      sorted: {
        key: 'timestamp',
        text: 'Last Updated'
      },
      filterValue: '',
      options: {
        lineNumbers: true,
        mode: "application/json",
        styleActiveLine: true,
        gutters: ["CodeMirror-lint-markers"],
        lint: false,
        readOnly: true,
        theme: 'default no-cursor schema-editor'
      },
      loading: false,
      dataFound: true
    };
  },
  methods: {
    fetchData () {
      let schemaData = [],
        schemaCount = 0;
      const {key} = this.sorted;
      const sortBy = (key === 'name') ? key+',a' : key+',d';
      SchemaREST.searchAggregatedSchemas(sortBy, this.filterValue)
        .then((schema)=>{
          let schemaEntities = [];
          if (schema.responseMessage !== undefined) {

          } else {
            schema.entities.map((obj, index) => {
              let {name, schemaGroup, type, description, compatibility, evolve} = obj.schemaMetadata;
              let versionsArr = [];
              let currentVersion = 0;

              schemaCount++;
              if(obj.versions.length){
                versionsArr = obj.versions;
                currentVersion = Utils.sortArray(obj.versions.slice(), 'timestamp', false)[0].version;
              }
              schemaData.push({
                id: (index + 1),
                type: type,
                compatibility: compatibility,
                schemaName: name,
                schemaGroup: schemaGroup,
                evolve: evolve,
                collapsed: true,
                renderCodemirror: false,
                versionsArr:  versionsArr,
                currentVersion: currentVersion,
                serDesInfos: obj.serDesInfos
              });
              schemaEntities = schemaData;
            });
            this.schemaData = schemaEntities;
          }
        });
    },
    handleAddSchema () {
      this.$refs.schemaModalRef.show();
    },
    onFilterChange (e){
      this.filterValue = e.target.value;
    },
    onFilterKeyPress (e) {
      if(e.key=='Enter'){
        this.filterValue = e.target.value.trim();
        this.fetchData();
      }
    },
    filterSchema(entities, filterValue){
      let matchFilter = new RegExp(filterValue , 'i');
      return entities.filter(e => !filterValue || matchFilter.test(e.schemaName));
    },
    onSortByClicked(){},
    getIconClass(c) {
      switch(c){
      case 'FORWARD':
        return "fa fa-arrow-right";
      case 'BACKWARD':
        return "fa fa-arrow-left";
      case 'BOTH':
        return "fa fa-exchange";
      case 'NONE':
        return "fa fa-ban";
      default:
        return '';
      }
    },
    getBtnClass(c) {
      switch(c){
      case 'FORWARD':
        return "warning";
      case 'BACKWARD':
        return "backward";
      case 'BOTH':
        return "";
      default:
        return 'default';
      }
    },
    handleSelect(s){
      let schema = _.find(this.schemaData,{id: s.id});
      schema.collapsed = !s.collapsed;
    },
    handleOnShow(s){
      s.renderCodemirror = true;
      this.$forceUpdate();
    },
    handleOnHidden(s){
      s.renderCodemirror = false;
      this.$forceUpdate();
    },
    handleAddVersion(schemaObj){
      let obj = _.find(schemaObj.versionsArr, {version: schemaObj.currentVersion});
      this.schemaObj = {
        schemaName: schemaObj.schemaName,
        description: obj ? obj.description : '',
        schemaText: obj ? obj.schemaText : '',
        versionId: obj ? obj.version : ''
      };
      this.$refs.versionModalRef.show();
    },
    selectVersion(v, s){
      let obj = _.find(this.schemaData, {schemaName: s.schemaName});
      obj.currentVersion = v.version;
    },
    handleCompareVersions(schemaObj){
      this.schemaObj = schemaObj;
      this.$refs.schemaDiffModal.show();
    },
    handleSaveVersion() {
      if (this.$refs.addVersion.validateData()) {
        this.$refs.addVersion.handleSave().then((versions) => {
          if(versions && versions.compatible === false){
            //error
          } else {
            if (versions.responseMessage !== undefined) {
              //error
            } else {
              this.$refs.versionModalRef.hide();
              this.fetchData();
              let msg = "Version added successfully";
              if (this.$refs.versionModalRef.modalTitle === 'Edit Version') {
                msg = "Version updated successfully";
              }
              if(versions === this.schemaObj.versionId) {
                msg = "The schema version is already present";
                //show msg
              } else {
                //show msg
              }
            }
          }
        });
      }
    },
    handleCancel () {
      this.$refs.schemaModalRef.hide();
    },
    handleSave () {
      if (this.$refs.addSchema.validateData()) {
        this.$refs.addSchema.handleSave().then((schemas) => {
          if (schemas.responseMessage !== undefined) {
          } else {
            this.$refs.schemaModalRef.hide();
            this.fetchData();
            let msg = "Schema added successfully";
            if (this.state.id) {
              msg = "Schema updated successfully";
            }
          }
        });
      }
    }
  },
  render () {
    var schemaEntities = this.schemaData;
    if(this.filterValue.trim() !== ''){
      schemaEntities = this.filterSchema(this.schemaData, this.filterValue);
    }
    const sortTitle = <span>Sort:<span class="font-blue-color">&nbsp;{this.sorted.text}</span></span>;
    const panelContent = schemaEntities.map((s, i)=>{
      var btnClass = this.getBtnClass(s.compatibility);
      var iconClass = this.getIconClass(s.compatibility);
      var versionObj = _.find(s.versionsArr, {version: s.currentVersion});
      var totalVersions = s.versionsArr.length;
      var sortedVersions =  Utils.sortArray(s.versionsArr.slice(), 'version', false);
      var header = (
        <div class="panel-header" v-b-toggle={'panel-body-'+i} onClick={this.handleSelect.bind(this, s)}>
        <span class={`hb ${btnClass} schema-status-icon`}><i class={iconClass}></i></span>
        <div class="panel-sections first fluid-width-15">
            <h4 ref="schemaName" class="schema-name" title={s.schemaName}>{s.schemaName}</h4>
            <p class={`schema-status ${s.compatibility.toLowerCase()}`}>{s.compatibility}</p>
        </div>
        <div class="panel-sections">
            <h6 class="schema-th">Type</h6>
            <h4 class={`schema-td ${!s.collapsed ? "font-blue-color" : ''}`}>{s.type}</h4>
        </div>
        <div class="panel-sections">
            <h6 class="schema-th">Group</h6>
            <h4 ref="schemaGroup" class={`schema-td ${!s.collapsed ? "font-blue-color" : ''}`} title={s.schemaGroup}>{s.schemaGroup}</h4>
        </div>
        <div class="panel-sections">
            <h6 class="schema-th">Version</h6>
            <h4 class={`schema-td ${!s.collapsed ? "font-blue-color" : ''}`}>{s.versionsArr.length}</h4>
        </div>
        <div class="panel-sections">
            <h6 class="schema-th">Serializer & Deserializer</h6>
            <h4 class={`schema-td ${!s.collapsed ? "font-blue-color" : ''}`}>0</h4>
        </div>
        <div class="panel-sections" style={{'textAlign': 'right'}}>
            <a class="collapsed collapseBtn" role="button" aria-expanded="false">
              <i class={s.collapsed ? "collapseBtn fa fa-chevron-down" : "collapseBtn fa fa-chevron-up"}></i>
            </a>
        </div>
        </div>
      );

      return (
        <bCard no-body>
          <bCardHeader>{header}</bCardHeader>
          <bCollapse
            id={'panel-body-'+i}
            class="registry-panel-body"
            onShown={this.handleOnShow.bind(this, s)}
            onHidden={this.handleOnHidden.bind(this, s)}
          >
            {
            s.collapsed ?
              ''
              :
              (
                versionObj ?
                (
                  <bCardBody>
                    <div class="row">
                      <div class="col-sm-3">
                        <h6 class="schema-th">Description</h6>
                        <p>{versionObj.description}</p>
                      </div>
                      <div class="col-sm-6">
                        {s.renderCodemirror ?
                        (s.evolve ?
                        (
                          <h6 key="e.1" class="version-number-text">VERSION&nbsp;{versionObj.version}</h6>,
                          <button key="e.2" type="button" class="btn btn-link btn-edit-schema" onClick={this.handleAddVersion.bind(this, s)}>
                            <i class="fa fa-pencil"></i>
                          </button>
                        )
                        : '')
                        : ''
                        }
                        {
                        s.renderCodemirror ?
                        <CodeMirrorEditor schemaText={JSON.stringify(JSON.parse(versionObj.schemaText), null, ' ')} options={this.options} />
                        :
                        (<div class="col-sm-12">
                          <div class="loading-img text-center" style={{marginTop : "50px"}}>
                            <img src={loaderImg} alt="loading" />
                          </div>
                        </div>)
                        }
                      </div>
                      <div class="col-sm-3">
                        <h6 class="schema-th">Change Log</h6>
                        <ul class="version-tree">
                          {
                            sortedVersions.map((v, i)=>{
                              return (
                                  <li onClick={this.selectVersion.bind(this, v, s)} class={s.currentVersion === v.version? "clearfix current" : "clearfix"} key={i}>
                                  <a class={s.currentVersion === v.version? "hb version-number" : "hb default version-number"}>v{v.version}</a>
                                  <p><span class="log-time-text">{Utils.splitTimeStamp(new Date(v.timestamp))}</span> <br/><span class="text-muted">{i === (totalVersions - 1) ? 'CREATED': 'EDITED'}</span></p>
                                  </li>
                              );
                            })
                          }
                        </ul>
                        {sortedVersions.length > 1 ?
                          <a class="compare-version" onClick={this.handleCompareVersions.bind(this, s)}>COMPARE VERSIONS</a> : ''
                        }
                      </div>
                    </div>
                  </bCardBody>
                )
                :
                (
                  <bCardBody>
                    <div class="row">
                      {s.evolve ?
                      ([<div class="col-sm-3" key="v.k.1">
                          <h6 class="schema-th">Description</h6>
                          <p></p>
                        </div>,
                        <div class="col-sm-6" key="v.k.2">
                        {s.renderCodemirror ?
                          <button type="button" class="btn btn-link btn-add-schema" onClick={this.handleAddVersion.bind(this, s)}>
                          <i class="fa fa-pencil"></i>
                          </button>
                          : ''
                        }
                        {s.renderCodemirror ?
                          <CodeMirrorEditor schemaText="" options={this.options} />
                          : (<div class="col-sm-12">
                              <div class="loading-img text-center" style={{marginTop : "50px"}}>
                                <img src={loaderImg} alt="loading" />
                              </div>
                          </div>)
                        }
                        </div>,
                        <div class="col-sm-3" key="v.k.3">
                          <h6 class="schema-th">Change Log</h6>
                        </div>])
                      : <div style={{'textAlign': 'center'}}>NO DATA FOUND</div>
                      }
                    </div>
                  </bCardBody>
                )
              )
            }
          </bCollapse>
        </bCard>
      );
    });
    return (
      <div>
        <Basecontainer>
          <div id="add-schema">
            <bButton class="actionAddSchema hb success lg" onClick={this.handleAddSchema}>
              <i class="fa fa-plus"></i>
            </bButton>
          </div>
          {!this.loading && this.dataFound ?
            <div class="wrapper">
              <div class="page-title-box row no-margin">
                  <div class="col-md-3 text-right">
                    <bFormGroup>
                       <bInputGroup>
                          <input type="text"
                            class="form-control"
                            placeholder="Search by name"
                            domProps-value={this.filterValue}
                            onInput={this.onFilterChange}
                            onChange={this.onFilterKeyPress}
                          />
                           <bInputGroupAddon>
                            <i class="fa fa-search"></i>
                           </bInputGroupAddon>
                         </bInputGroup>
                     </bFormGroup>
                  </div>
                  <div class="col-md-2 text-center">
                    {/*<bDropdown title={sortTitle}
                      id="sortDropdown"
                      class="sortDropdown"
                    >
                        <bDropdownItem
                          active={this.sorted.key == 'name' ? true : false}
                          onClick={this.onSortByClicked.bind(this,"name")}
                        >
                          &nbsp;Name
                        </bDropdownItem>
                        <bDropdownItem
                          active={this.sorted.key == 'timestamp' ? true : false}
                          onClick={this.onSortByClicked.bind(this,"timestamp")}
                        >
                          &nbsp;Last Update
                        </bDropdownItem>
                    </bDropdown>*/}
                  </div>
              </div>
              {!this.loading && schemaEntities.length ?
                (
                <div class="row">
                  <div class="col-md-12">
                    {panelContent}
                  </div>
                </div>
                )
                : (!this.loading ? <NoData /> : null)
              }
            </div>
            : !this.loading ? <NoData /> : null
          }
          {this.loading ?
            <div className="col-sm-12">
              <div className="loading-img text-center" style={{marginTop : "50px"}}>
                <img src={loaderImg} alt="loading" />
              </div>
            </div>
            : null
          }
        </Basecontainer>
        <FSModal
          modalTitle="Add Schema"
          cssClass="lg"
          ref="schemaModalRef"
          onResovle={this.handleSave}
          onReject={this.handleCancel}
          >
            <div slot="mbody">
              <SchemaInfoForm ref="addSchema"></SchemaInfoForm>
            </div>
        </FSModal>
        <FSModal
          modalTitle="Edit Version"
          ref="versionModalRef"
          onResovle={this.handleSaveVersion}
          onReject={()=>{this.$refs.versionModalRef.hide();}}
        >
          <div slot="mbody">
            <SchemaVersionForm ref="addVersion" schemaObj={this.schemaObj}/>
          </div>
        </FSModal>
        <FSModal
          modalTitle="Compare Schema Versions"
          ref="schemaDiffModal"
          hideOkBtn={true}
          cssClass="lg"
          onReject={()=>{this.$refs.schemaDiffModal.hide();}}
        >
          <div slot="mbody">
            <SchemaVersionDiff ref="compareVersionRef" schemaObj={this.schemaObj}/>
          </div>
        </FSModal>
      </div>
    );
  }
};
