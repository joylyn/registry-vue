<template>
  <transition name="modal">
    <div class="modal-mask" v-if="showModal">
      <div class="modal-wrapper">
        <div class="modal-container" :class="computedClass">
          <!-- Modal Header -->
          <div class="modal-header" v-if="hideHeader !== true">
            <h4>
              {{ getTitle }}
            </h4>
            <button class="close-btn pull-right" @click="reject"><span aria-hidden="true">×</span></button>
          </div>

          <!-- Modal body -->
          <div class="modal-body" v-if="!confirmBox">
            <slot name="mbody"></slot>
          </div>

          <!-- Modal footer -->
          <div class="modal-footer" v-if="hideFoot !== true">
            <button v-show="hideClose !== true" class="btn " :class="[confirmBox ? 'btn-danger': 'btn-default']" @click="reject">
              {{getCloseTxt}}
            </button>
            <button v-show="hideOk !== true" class="btn btn-success" @click="resovle">
              {{getOkTxt}}
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
  export default{
    name : "FSModal",
    props : ["modalTitle","reference","okLabel","closeLabel",
      "hideOkBtn","hideCloseBtn","hideFooter","confirmBox","cssClass","hideHead"],
    data(){
      return{
        showModal :false
      };
    },

    computed : {
      computedClass(){
        return this.cssClass ? this.cssClass : 'xm';
      },
      getTitle(){
        return this.modalTitle;
      },
      getOkTxt(){
        return this.okLabel ? this.okLabel :  "Ok";
      },
      getCloseTxt(){
        return this.closeLabel ? this.closeLabel : "Close";
      },
      hideClose(){
        return this.hideCloseBtn ? this.hideCloseBtn : false;
      },
      hideOk(){
        return this.hideOkBtn ? this.hideOkBtn : false;
      },
      hideFoot(){
        return this.hideFooter ? this.hideFooter : false;
      },
      hideHeader(){
        return this.hideHead ? this.hideHead : false;
      }
    },

    methods: {
      hide(){
        document.querySelector('body').setAttribute('class','');
        this.showModal = false;
      },
      show() {
        document.querySelector('body').setAttribute('class','modal-open');
        this.showModal = true;
      },
      resovle(){
        this.$emit("resovle");
      },
      reject(){
        this.$emit("reject");
      }
    }
  };
</script>
<style scope>
/*.modal-wrapper {
  display: table-cell;
  vertical-align: top;
}*/

.modal-container {
  width: 100%;
  margin: 30px auto;
  padding: 10px 3px;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
  transition: all .3s ease;
  font-family: inherit;
}

.modal-container.xl{width :900px}
.modal-container.lg{width : 800px}
.modal-container.sm{width : 600px}
.modal-container.xm{width : 500px}

.modal-header{
  position : relative !important;
  display: block;
  text-align: left;
}
h4 {
  justify-content: left;
  margin-top: 0;
  font-size: 18px;
}
.modal-container{
  padding: 0 10px;
}
.modal-enter .modal-container{
  -webkit-transform: translate(0, -25%);
  -ms-transform: translate(0, -25%);
  -o-transform: translate(0, -25%);
  transform: translate(0, -25%);
  -webkit-transition: -webkit-transform 0.3s ease-out;
  -o-transition: -o-transform 0.3s ease-out;
  transition: transform 0.3s ease-out;
}
.modal-leave-active .modal-container {
  -webkit-transform: translate(0, -25%);
  -ms-transform: translate(0, -25%);
  -o-transform: translate(0, -25%);
  transform: translate(0, -25%);
  -webkit-transition: -webkit-transform 0.3s ease-out;
  -o-transition: -o-transform 0.3s ease-out;
  transition: transform 0.3s ease-out;
}

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.close-btn{
  position: absolute;
  right: 0;
  top:10px;
  background: none;
  border: none;
  opacity: 0.2;
  text-align: center;
  text-indent: 0;
  letter-spacing: 0;
  font-size:21px;
  font-weight: bold;
}
.close-btn:hover{
  opacity: 1;
}
</style>
