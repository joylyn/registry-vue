import fetch from 'isomorphic-fetch';
import {baseUrl} from '../utils/Constants';
import {CustomFetch} from '../utils/Overrides';

const SchemaREST = {
  postSchema(options) {
    options = options || {};
    options.method = options.method || 'POST';
    options.headers = options.headers || {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      '_throwErrorIfExists': 'true'
    };
    options.credentials = 'same-origin';
    return fetch(baseUrl + 'schemaregistry/schemas', options)
      .then((response) => {
        return response.json();
      });
  },
  getAllSchemas(sortBy, options) {
    options = options || {};
    options.method = options.method || 'GET';
    options.credentials = 'same-origin';
    let url = baseUrl + 'schemaregistry/schemas';
    if(sortBy){
      url += '/?_orderByFields='+sortBy;
    }
    return fetch(url, options)
      .then((response) => {
        return response.json();
      });
  },
  getAggregatedSchemas(sortBy, options) {
    options = options || {};
    options.method = options.method || 'GET';
    options.credentials = 'same-origin';
    let url = baseUrl + 'schemaregistry/schemas/aggregated';
    if(sortBy){
      url += '/?_orderByFields='+sortBy;
    }
    return fetch(url, options)
      .then((response) => {
        return response.json();
      });
  },
  searchAggregatedSchemas(sortBy, searchStr, options) {
    options = options || {};
    options.method = options.method || 'GET';
    options.credentials = 'same-origin';
    let url = baseUrl + 'schemaregistry/search/schemas/aggregated?';
    const params = [];
    if(sortBy){
      params.push('_orderByFields='+sortBy);
    }
    params.push('name='+searchStr);
    url += params.join('&');
    return fetch(url, options)
      .then((response) => {
        return response.json();
      });
  },
  getSchemaInfo(name, options) {
    options = options || {};
    options.method = options.method || 'GET';
    options.credentials = 'same-origin';
    name = encodeURIComponent(name);
    return fetch(baseUrl + 'schemaregistry/schemas/' + name, options)
      .then((response) => {
        return response.json();
      });
  },
  getSchemaVersions(name, options) {
    options = options || {};
    options.method = options.method || 'GET';
    options.credentials = 'same-origin';
    name = encodeURIComponent(name);
    return fetch(baseUrl + 'schemaregistry/schemas/' + name + '/versions', options)
      .then((response) => {
        return response.json();
      });
  },
  getLatestVersion(name, options) {
    options = options || {};
    options.method = options.method || 'GET';
    options.credentials = 'same-origin';
    name = encodeURIComponent(name);
    return fetch(baseUrl+'schemaregistry/schemas/'+name+'/versions/latest', options)
      .then( (response) => {
        return response.json();
      });
  },
  postVersion(name, options) {
    options = options || {};
    options.method = options.method || 'POST';
    options.headers = options.headers || {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    options.credentials = 'same-origin';
    name = encodeURIComponent(name);
    return fetch(baseUrl + 'schemaregistry/schemas/' + name + '/versions', options)
      .then((response) => {
        return response.json();
      });
  },
  getSchemaProviders(options) {
    options = options || {};
    options.method = options.method || 'GET';
    options.credentials = 'same-origin';
    return fetch(baseUrl + 'schemaregistry/schemaproviders', options)
      .then((response) => {
        return response.json();
      });
  },
  getCompatibility(name, options) {
    options = options || {};
    options.method = options.method || 'POST';
    options.headers = options.headers || {
      'Content-Type' : 'application/json',
      'Accept' : 'application/json'
    };
    options.credentials = 'same-origin';
    name = encodeURIComponent(name);
    return fetch(baseUrl+'schemaregistry/schemas/'+name+'/compatibility', options)
      .then( (response) => {
        return response.json();
      });
  }
};

export default SchemaREST;