import Header from '../components/Header.js';

export default {
  name: 'Basecontainer',
  data () {
    return {
      headerContent: 'All Schemas'
    };
  },
  render () {
    return (
      <div>
        <Header headerContent={this.headerContent}></Header>
        <div class="container wrapper">{this.$slots.default}</div>
      </div>
    );
  }
};
