import React from 'react';
import Svg, { Path } from 'react-native-svg';

const EditIcon = ({ color = "#292B32" }: { color?: string }) => (
  <Svg width="18" height="18" viewBox="0 0 18 18" fill="none" >
    <Path
      d="M10.0625 3.9375L1.375 12.625L1 16.1875C0.9375 16.6562 1.34375 17.0625 1.8125 17L5.375 16.625L14.0625 7.9375L10.0625 3.9375ZM16.5312 3.34375L14.6562 1.46875C14.0938 0.875 13.125 0.875 12.5312 1.46875L10.7812 3.21875L14.7812 7.21875L16.5312 5.46875C17.125 4.875 17.125 3.90625 16.5312 3.34375Z"
      fill={color}
    />
  </Svg>
);

export default EditIcon;