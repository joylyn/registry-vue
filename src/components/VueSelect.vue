<template>
  <select class="form-control" required @click="selectChange">
    <template v-if="options.length !== 0">
      <option  v-for="option in options" :value="valueKey ? option[valueKey] : option.value" :selected="valueKey ? (selectedVal[valueKey] ? selectedVal[valueKey] === option[valueKey] : selectedVal === option[valueKey]): (selectedVal.value ? selectedVal.value === option.value : selectedVal === option.value)" >
        {{ textKey ? option[textKey] : option.text }}
      </option>
    </template>

    <template  v-else>
      <option value="" disabled selected>No record found...</option>
    </template>
  </select>
</template>
<script>
  import { EventBus } from '@/utils/EventBus';

  export default{
    name : "VueSelect",
    props : {
      options : {
        type : Array,
        required : true,
        defaultValue : []
      },
      selectedVal : {
        type : [Object,String],
        required : true,
        defaultValue : {}
      },
      loggerName : String,
      callBack : String,
      valueKey: String,
      textKey: String
    },
    data(){
      return {};
    },
    methods : {
      selectChange(event){
        EventBus.$emit(this.callBack , this.options[event.target.selectedIndex], this.loggerName ? this.loggerName : null);
      }
    }
  };
</script>
<style scope>
select.form-control:not([size]):not([multiple]){
  height: 34px;
}
select:required:invalid {
  color: gray;
}
option[value=""][disabled] {
  display: none;
}
option {
  color: black;
}
</style>
