import React from 'react';
import config from '../config';
import Icon from './icon.jsx';

export default class GalleryDisplay extends React.Component {
  constructor(props) {
    super(props);
    this.element = undefined;
    this.state = {
      width: 0
    }
  }

  componentDidMount() {
    this.resizeListener = window.addEventListener('resize', (event) => {
      this.setState({
        width: event.target.innerWidth
      });
    });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeListener);
  }

  renderMessage(type, text) {
    const icons = {
      loading: <Icon type="spinner spin" className="info" />,
      slow: <Icon type="hourglass" className="warning slow-spin" />,
      error: <Icon type="exclamation-triangle" className="error" />
    };
    return <span>{type in icons ? icons[type] : null} {text}</span>;
  }

  render() {
    const rowHeight = config.gallery.rowBaseHeight;
    const {message, photos, onPhotoClick} = this.props;
    const galleryWidth = this.element ? this.element.clientWidth : 0;
    let rows = [], row = {photos: [], width: 0, height: 0};

    // Order photos into rows if gallery element is ready and has width
    if (galleryWidth) {
      for (let p = 0 ; p < photos.length ; p++) {
        let finalPhoto = p == photos.length - 1;
        photos[p].index = p;
        // Finish photo row when max width or end of photo list reached
        if (row.width + photos[p].thumbnail.width > config.gallery.rowPackWidth || finalPhoto) {
          // Final row's height is same as previous row to avoid quirks due to potentially unfilled row
          if (finalPhoto) {
            row.photos.push(photos[p]);
            row.height = rows.length > 0 ? rows[rows.length - 1].height : rowHeight;
          } else {
            // Scale row height so that CSS scaling of the row width is equal to the gallery width
            row.height = rowHeight * (galleryWidth / row.width);
          }
          rows.push(row);
          row = {photos: [], width: 0, height: 0};
        }
        // Add photo to row and calculate row width the photos scaled width added
        row.photos.push(photos[p]);
        row.width += photos[p].thumbnail.width * (rowHeight / photos[p].thumbnail.height);
      }
    }

    return (
      <div className="gallery" ref={element => this.element = element}>
        {message.text ? (<div className="message">{this.renderMessage(message.type, message.text)}</div>) : null}
        {rows.map((row, rowIndex) => {
          return (
            <div key={rowIndex} className="row" style={{'height': row.height + 'px'}}>
              {row.photos.map(photo => {
                return <img
                  key={photo.id}
                  src={photo.thumbnail.url}
                  alt=""
                  onClick={() => onPhotoClick(photo.index)}
                />
              })}
            </div>
          )
        })}
      </div>
    );
  }
}
