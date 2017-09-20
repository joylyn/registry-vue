import img from '../assets/img/logo.png';

export default {
  name: 'Header',
  props: ['headerContent'],
  render () {
    return (
      <bNavbar type="inverse">
        <bCollapse visible is-nav id="nav_collapse">
          <bNavbarBrand href="javascript:void(0);">
          <img src={img} class="logo-image"/>
          <div class="logo-text"><strong>SCHEMA</strong>REGISTRY</div>
          </bNavbarBrand>
          <bNav is-nav-bar>
            <bNavText>{this.headerContent}</bNavText>
          </bNav>
        </bCollapse>
      </bNavbar>
    );
  }
};
