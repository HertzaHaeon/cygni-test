import React from 'react';
import Icon from './icon.jsx';

export default class PhotoDisplay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      progress: 'loading',
      loaded: false
    }
  }

  componentWillReceiveProps(props) {
    if (props.photo) {
      this.setState({
        progress: 'loading',
        loaded: false
      });
      this.loadImage(props.photo.image.url)
        .then(() => {
          this.setState({
            progress: 'done',
            loaded: true
          });
        })
        .catch(() => {
          this.setState({
            progress: 'error',
            loaded: false
          });
        });
    }
  }

  loadImage(url) {
    return new Promise(function(resolve, reject) {
      let image = new Image();
      const loadTimeout = setTimeout(() => reject('timeout'), 5000);
      image.onload = () => {
        clearTimeout(loadTimeout);
        resolve(image);
      };
      image.onerror = (error) => {
        clearTimeout(loadTimeout);
        reject(error);
      };
      image.src = url;
    });
  }

  renderIcon(progress) {
    switch (progress) {
      case 'loading':
        return <Icon type="spinner spin" className="info" />;
      case 'error':
        return <Icon type="chain-broken" className="error" />;
      default:
        return null;
    }
  }

  render() {
    if (!this.props.photo) return null;
    return (
      <div className="overlay">
        <div className="close" onClick={() => this.props.onClose()}><Icon type="times" /></div>
        {this.props.onNext ? <div className="next" onClick={() => this.props.onNext()}><Icon type="chevron-right" /></div> : null}
        {this.props.onPrev ? <div className="prev" onClick={() => this.props.onPrev()}><Icon type="chevron-left" /></div> : null}
        <div className="display">
          {this.state.loaded ? <img src={this.props.photo.image.url} alt="" /> : this.renderIcon(this.state.progress)}
        </div>
      </div>
    );
  }
}
