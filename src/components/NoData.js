import backDefault from '../assets/img/back-default.png';

export default {
  'name': 'NoData',
  render () {
    return (
      <div style={{backgroundImage: 'url('+backDefault+')',
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center top",
        backgroundSize: "50%",
        height: window.innerHeight - 124 + 'px'}}
      >
        <p className="noDataFound-text">No Data Found</p>
      </div>
    );
  }
};