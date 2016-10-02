import React from 'react';
import ReactDOM from 'react-dom';
import Gallery from './components/gallery.jsx';

// Extract query string parameters for gallery
const props = (function(search) {
  let props = {};
  search
    .replace(/^\?(.?)/, '$1')
    .split('&')
    .forEach(pair => {
      const [key, value] = pair.split('=');
      props[key] = value;
    });
  return props;
})(window.location.search);

ReactDOM.render(React.createElement(Gallery, props), document.getElementById('gallery'));