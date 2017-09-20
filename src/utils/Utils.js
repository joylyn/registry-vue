import moment from 'moment';

const sortArray = function(sortingArr, keyName, ascendingFlag){
  if (ascendingFlag){
    return sortingArr.sort(function(a, b) {
      if(a[keyName] < b[keyName]){ return -1; }
      if(a[keyName] > b[keyName]){ return 1; }
      return 0;
    });
  }
  else {
    return sortingArr.sort(function(a, b) {
      if(b[keyName] < a[keyName]){ return -1; }
      if(b[keyName] > a[keyName]) { return 1; }
      return 0;
    });
  }
};

const ellipses = function(string, tagWidth) {
  if (!string || tagWidth === undefined) {
    return;
  }
  return string.length > (tagWidth/10) ? `${string.substr(0, tagWidth/10)}...` : string;
};

const isValidJson = function(obj) {
  try {
    const valid = JSON.parse(obj);
    return true;
  } catch (e) {
    return false;
  }
};

const splitTimeStamp = function(date){
  const currentDT = moment(new Date());
  const createdDT = moment(date);
  const dateObj = moment.duration(currentDT.diff(createdDT));
  return  ((dateObj._data.days === 0)
    ? '': dateObj._data.days+'d ')
     +((dateObj._data.days === 0 && dateObj._data.hours === 0 )
       ? '' : dateObj._data.hours+'h ')
        + ((dateObj._data.days === 0 && dateObj._data.hours === 0 && dateObj._data.minutes === 0)
          ? '' : dateObj._data.minutes+'m ')
            + dateObj._data.seconds+'s ago';
};

const getDateTimeLabel = function(date){
  const time = date.toLocaleTimeString();
  const arr = date.toString().split(' ');
  return (arr[1]+'-'+arr[2]+'-'+arr[3]+' at ' + time);
};

export default {
  sortArray,
  ellipses,
  isValidJson,
  splitTimeStamp,
  getDateTimeLabel
};