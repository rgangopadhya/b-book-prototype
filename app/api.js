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
    console.log('=== error ==', response);
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

export async function register(username, email, pw1, pw2) {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  const payload = {
    method: 'post',
    headers,
    body: JSON.stringify({ username, password1: pw1, password2: pw2, email })
  };
  const response = await fetch(getUrl('rest-auth/registration/'), payload);
  if (response.ok) {
    const { key } = await response.json();
    console.log('=== setting key', key);
    setUserToken(key);
  } else {
    throw new APIError(response);
  }
}

export async function checkLogin() {
  try {
    const result = await getRequest('v0/users/me/');
    return result.user;
  } catch(error) {
    if (error.isAPIError && error.response.status_code === 401) {
      return false;
    }
  }
}

export async function logout() {
  await postRequest('rest-auth/logout/');
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

export async function saveSceneRecording(storyId, sceneId, recordingUri, duration, order) {
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
  formData.append('order', order);
  formData.append('duration', duration);
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

function serializeRecording(sceneId, recordingUri) {
  let uriParts = recordingUri.split('.');
  let fileType = uriParts[uriParts.length - 1];
  return {
    uri: recordingUri,
    name: `${sceneId}.${fileType}`,
    type: `audio/x-${fileType}`
  }
}

export async function saveStoryRecording(sceneRecordings) {
  let formData = new FormData();
  formData.append('scene_order', sceneRecordings.map(s => s.sceneId).join());
  formData.append('durations', sceneRecordings.map(s => s.duration).join());
  sceneRecordings.forEach(({ sceneId, recordingUri }) => {
    formData.append(sceneId, serializeRecording(sceneId, recordingUri));
  });
  const result = await postRequest('v0/story_recordings/', formData, {
    'Content-Type': 'multipart/form-data'
  });
  return result;
}

export async function getStories() {
  const result = await getRequest('v0/stories/');
  console.log('=== got stories====', result);
  return result.stories;
}

export async function loadStoryData(storyId) {
  console.log('=== about to load story ===');
  let { story, scenes, scene_recordings } = await getRequest(
    `v0/stories/${storyId}/?include[]=recordings.scene.`
  );
  // order scene_recordings and scenes by order
  const sceneRecordings = scene_recordings.sort((a, b) => a.order - b.order);
  scenes = scenes.sort((a, b) => {
    const aRecording = sceneRecordings.find(r => r.scene === a.id);
    const bRecording = sceneRecordings.find(r => r.scene === b.id);
    return aRecording.order - bRecording.order;
  });
  return { scenes, sceneRecordings };
}
