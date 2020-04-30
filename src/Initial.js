import PropTypes from 'prop-types';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const DEFUALT_PROPS = {
  name: 'Name',
  color: null,
  seed: 0,
  charCount: 1,
  textColor: '#ffffff',
  height: 100,
  width: 100,
  fontSize: 60,
  fontWeight: 400,
  fontFamily: 'HelveticaNeue-Light, Helvetica Neue Light, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif',
  radius: 0
};

const colors = [
  '#1abc9c',
  '#16a085',
  '#f1c40f',
  '#f39c12',
  '#2ecc71',
  '#27ae60',
  '#e67e22',
  '#d35400',
  '#3498db',
  '#2980b9',
  '#e74c3c',
  '#c0392b',
  '#9b59b6',
  '#8e44ad',
  '#bdc3c7',
  '#34495e',
  '#2c3e50',
  '#95a5a6',
  '#7f8c8d',
  '#ec87bf',
  '#d870ad',
  '#f69785',
  '#9ba37e',
  '#b49255',
  '#b49255',
  '#a94136'
]

const unicodeCharAt = (string, index) => {
  const first = string.charCodeAt(index)
  let second

  if (first >= 0xD800 && first <= 0xDBFF && string.length > index + 1) {
    second = string.charCodeAt(index + 1)

    if (second >= 0xDC00 && second <= 0xDFFF) {
      return string.substring(index, index + 2)
    }
  }

  return string[index]
}

const unicodeSlice = (string, start, end, words) => {
  let accumulator = ''
  let character
  let stringIndex = 0
  let unicodeIndex = 0
  let nextSpace = -1
  let length = string.length

  // Remove any leading/trailing spaces
  string = string.trim()

  while (stringIndex < length) {
    character = unicodeCharAt(string, stringIndex)

    if (unicodeIndex >= start && unicodeIndex < end) {
      accumulator += character
    } else {
      break;
    }

    stringIndex += character.length
    unicodeIndex += 1

    // Find the next space offset from the previous finding
    nextSpace = words ? string.indexOf(' ', nextSpace + 1) : -1
    stringIndex = nextSpace > 0 ? nextSpace + 1 : stringIndex
  }

  return accumulator
}

export const getSvgString = (inProps, buffer) => {
  const props = { ...DEFUALT_PROPS, ...inProps };
  const { width, height, textColor, fontFamily, fontSize, fontWeight, radius: borderRadius } = props
  const initial = unicodeSlice(props.name || 'Name', 0, props.charCount || 1, props.useWords || false).toUpperCase()
  const backgroundColor = props.color !== null
    ? props.color
    : colors[Math.floor((initial.charCodeAt(0) + props.seed) % colors.length)]

  const InitialSvg = () => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      pointerEvents='none'
      {...{
        width,
        height
      }}>
      <rect
        width="100%"
        height="100%"
        fill={backgroundColor}
        border-radius={borderRadius}
      />
      <text
        y='50%'
        x='50%'
        dy='0.35em'
        pointerEvents='none'
        fill={textColor}
        fontFamily={fontFamily}
        textAnchor='middle'
        style={{ fontSize, fontWeight }}
        children={initial} />
    </svg>
  )

  const escaped = unescape(
    encodeURIComponent(
      renderToStaticMarkup(
        <InitialSvg />
      )
    )
  );

  return `data:image/svg+xml;base64,${buffer ? buffer.from(escaped).toString('base64') : btoa(escaped)}`;
}

export const getPngString = (inProps, buffer) => {
  return new Promise((resolve, reject)=>{
    let svgString = getSvgString(inProps, buffer);
    var canvas = document.createElement( "canvas" );
    var ctx = canvas.getContext( "2d" );

    var img = document.createElement( "img" );
    img.setAttribute( "src", svgString );

    img.onload = function() {
        ctx.drawImage( img, 0, 0 );
        resolve(canvas.toDataURL( "image/png" ))
    };

    img.onError = function(err) {
      reject(err);
    }
  });
}

export default function Initial({ alt, ...props }) {
  const svgHtml = getSvgString(props);

  return (
    <img
      src={svgHtml}
      alt={alt || ''}
    />
  )
}

Initial.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  name: PropTypes.string,
  color: PropTypes.string,
  seed: PropTypes.number,
  charCount: PropTypes.number,
  textColor: PropTypes.string,
  height: PropTypes.number,
  width: PropTypes.number,
  fontSize: PropTypes.number,
  fontWeight: PropTypes.number,
  fontFamily: PropTypes.string,
  radius: PropTypes.number,
  alt: PropTypes.string
}