import { Audio } from 'expo';

export async function startRecording(onCreate, onStart, onStatusUpdate) {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
  });

  const recording = new Audio.Recording();
  onCreate(recording);
  const recordingSettings = {
    ios: Object.assign({}, Expo.Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY.ios, {
      extension: '.mp4',
      outputFormat: Expo.Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC
    }),
    android: Object.assign({}, Expo.Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY.android, {
      extension: '.mp4',
      outputFormat: Expo.Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4
    })
  };
  try {
    await recording.prepareToRecordAsync(recordingSettings);
    recording.setOnRecordingStatusUpdate(onStatusUpdate);
    await recording.startAsync();
    onStart();
  } catch (error) {
    console.log('error!!', error);
  }
}
