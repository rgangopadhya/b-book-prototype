import React from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  TouchableOpacity
} from 'react-native';

const standardWidth = 1024;
const standardHeight = 768;

// component should take in base dimensions
// (assume for some size)
// and adjust based on actual dimensions
// our standard will be... 1024x768
function getScaledDimensions(baseWidth, baseHeight) {
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const width = Math.ceil((baseWidth / standardWidth) * screenWidth);
  const height = Math.ceil((baseHeight / standardHeight) * screenHeight);
  return { width, height };
}

export const ResponsiveImage = (props) => {
  const { baseWidth, baseHeight, style = {}, ...rest } = props;
  const { width, height } = getScaledDimensions(baseWidth, baseHeight);
  return (
    <Image
      style={[style, { height, width }]}
      {...rest}
    />
  );
};

export const ResponsiveImageBackground = (props) => {
  const { baseWidth, baseHeight, style = {}, children, ...rest } = props;
  const { width, height } = getScaledDimensions(baseWidth, baseHeight);
  return (
    <ImageBackground
      style={[style, { height, width }]}
      {...rest}
    >
      {children}
    </ImageBackground>
  );
};

export const ResponsiveButton = (props) => {
  const { baseWidth, baseHeight, style = {}, children, ...rest } = props;
  const { width, height } = getScaledDimensions(baseWidth, baseHeight);
  return (
    <TouchableOpacity
      style={[style, { height, width }]}
      {...rest}
    >
      {children}
    </TouchableOpacity>
  );
}
