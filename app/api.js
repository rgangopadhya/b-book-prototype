import {
  AsyncStorage
} from 'react-native';
import env from './environment';

const ENV = env();
const USER_TOKEN = '@BBookStore:session:token';

function getUrl(path) {
  return `${ENV.API_HOST}/${path}`;
}

export async function _makeRequest(method, path, body=null, addedHeaders={}) {
  const requestUrl = getUrl(path);
  const token = await getUserToken();
  const headers = new Headers(Object.assign(
    {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    addedHeaders
  ));
  const options = {
    method,
    headers
  };
  if (body && headers.get('Content-Type') === 'application/json') {
    options.body = JSON.stringify(body);
  } else if (body && headers.get('Content-Type') == 'multipart/form-data') {
    options.body = body;
  }

  console.log('Request', method, requestUrl, options);

  const response = await fetch(requestUrl, options);
  if (response.ok) {
    const body = await response.json();
    return body;
  } else {
    throw new APIError(response);
  }
}

export const postRequest = _makeRequest.bind(null, 'post');
export const getRequest = _makeRequest.bind(null, 'get');

class APIError extends Error {
  constructor(response, ...params) {
    super(...params);
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }
    this.response = response;
    this.isAPIError = true;
  }
}

export async function login(username, password) {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  const payload = {
    method: 'post',
    headers,
    body: JSON.stringify({ username, password })
  };
  const response = await fetch(getUrl('api-token-auth/'), payload);
  if (response.ok) {
    const { token } = await response.json();
    setUserToken(token);
  } else {
    throw new APIError(response);
  }
}

async function getFromStorage(key) {
  const result = await AsyncStorage.getItem(key);
  return result;
}

async function setInStorage(key, value) {
  const result = await AsyncStorage.setItem(key, value);
  return result;
}

const getUserToken = getFromStorage.bind(null, USER_TOKEN);
const setUserToken = setInStorage.bind(null, USER_TOKEN);

export async function makeNewStory() {
  const result = await postRequest('v0/stories/');
  return result.story;
}

export async function saveSceneRecording(storyId, sceneId, recordingUri) {
  let formData = new FormData();
  let uriParts = recordingUri.split('.');
  let fileType = uriParts[uriParts.length - 1];
  formData.append('recording', {
    uri: recordingUri,
    name: `${storyId}-${sceneId}.${fileType}`,
    type: `audio/x-${fileType}`
  });
  formData.append('story', storyId);
  formData.append('scene', sceneId);
  const result = await postRequest('v0/scene_recordings/', formData, {
    'Content-Type': 'multipart/form-data'
  });
  return result;
}

export async function getScenes() {
  // eventually we will have some more involved API
  // filtering by character, randomized
  const result = await getRequest('v0/scenes/?per_page=5');
  return result.scenes;
}
