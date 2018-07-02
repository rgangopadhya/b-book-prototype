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
    console.log('=== doing multipart ===');
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
export const patchRequest = _makeRequest.bind(null, 'patch');

class APIError extends Error {
  constructor(response, ...params) {
    super(response, ...params);
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, APIError);
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

export async function hasStories() {
  const result = await getRequest('v0/stories/?per_page=1');
  return result.stories.length > 0;
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

export async function getCharacters() {
  const result = await getRequest('v0/characters/');
  return result.characters;
}

export async function getScenesForCharacter(characterId) {
  const url = `v0/scenes/?filter{character}=${characterId}&random=5`;
  const result = await getRequest(url);
  return result.scenes;
}

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

export async function saveStoryRecording(sceneRecordings, character) {
  let formData = new FormData();
  formData.append('scene_order', sceneRecordings.map(s => s.sceneId).join());
  formData.append('durations', sceneRecordings.map(s => s.duration).join());
  formData.append('character', character.id);
  sceneRecordings.forEach(({ sceneId, recordingUri }) => {
    formData.append(sceneId, serializeRecording(sceneId, recordingUri));
  });
  const result = await postRequest('v0/story_recordings/', formData, {
    'Content-Type': 'multipart/form-data'
  });
  return result;
}

export async function saveStory(recordingUri, sceneIds, durations, characterId) {
  let formData = new FormData();
  formData.append('scene_order', sceneIds.join(','));
  const sceneDurations = sceneIds.map((sceneId) => {
    return { scene: sceneId, duration: durations[sceneId] };
  });
  formData.append('durations', JSON.stringify(sceneDurations));
  formData.append('character', characterId);
  let uriParts = recordingUri.split('.');
  let fileType = uriParts[uriParts.length - 1];
  // should consider adding more to the name
  formData.append('recording', {
    uri: recordingUri,
    name: `${characterId}.${fileType}`,
    type: `audio/x-${fileType}`
  });
  console.log('=== in saveStory ===', formData);
  const result = await postRequest('v0/stories/', formData, {
    'Content-Type': 'multipart/form-data'
  });
  console.log('=== got result ===');
  return result;
}

export async function updateStoryWithTitle(storyId, titleRecordingUri) {
  let formData = new FormData();
  let uriParts = titleRecordingUri.split('.');
  let fileType = uriParts[uriParts.length - 1];
  formData.append('title', {
    uri: titleRecordingUri,
    name: `${storyId}.${fileType}`,
    type: `audio/x-${fileType}`
  });
  const result = await patchRequest(`v0/stories/${storyId}/`, formData, {
    'Content-Type': 'multipart/form-data'
  });
  return result.story;
}

export async function getStories() {
  const result = await getRequest('v0/stories/?sort[]=-created_at');
  console.log('=== got stories====', result);
  return result.stories;
}

export async function loadStoryData(storyId) {
  console.log('=== about to load story ===');
  let { story, scenes } = await getRequest(
    `v0/stories/${storyId}/?include[]=scenes.`
  );
  // get durations
  const sceneDurations = story.scene_durations.reduce((acc, el) => {
    acc[el.scene] = el.duration;
    return acc;
  }, {});
  // order scenes
  const sceneOrder = story.scene_durations.map(d => d.scene);
  scenes = scenes.sort((a, b) => {
    return sceneOrder.indexOf(a.id) - sceneOrder.indexOf(b.id);
  });
  scenes = scenes.map((scene) => {
    return {...scene, duration: sceneDurations[scene.id] }
  });
  return { scenes, story };
}
