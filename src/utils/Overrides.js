import fetch from 'isomorphic-fetch';

export function CustomFetch() {
  // pace.start()
  const _promise = fetch.apply(this, arguments);
  _promise.then(function() {
    // pace.stop()
  }, function() {
    // pace.stop()
  });
  return _promise;
};