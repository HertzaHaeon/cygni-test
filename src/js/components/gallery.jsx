import React from 'react';
import FlickrService from '../services/flickr';
import PhotoDisplay from './photoDisplay.jsx';
import GalleryDisplay from './galleryDisplay.jsx';

export default class Gallery extends React.Component {
  constructor(props) {
    super(props);
    this.displayPhoto = this.displayPhoto.bind(this);
    this.state = {
      gallery: {
        tags: props.tags,
        user: props.user
      },
      progress: 'init',
      photos: [],
      currentPhotoIndex: undefined,
      currentPhoto: undefined
    };
  }

  componentWillMount() {
    let slowLoadTimer = setTimeout(() => {
      this.setState({
        progress: 'slow'
      });
    }, 3000);
    this.setState({
      progress: 'loading'
    });

    let flickrGalleryLoader;
    if (this.state.gallery.tags) {
      flickrGalleryLoader = FlickrService.loadTagGallery(this.state.gallery.tags);
    } else if (this.state.gallery.user) {
      flickrGalleryLoader = FlickrService.loadUserGallery(this.state.gallery.user);
    } else {
      flickrGalleryLoader = FlickrService.loadInterestingGallery();
    }

    flickrGalleryLoader
      .then(response => {
        clearTimeout(slowLoadTimer);
        this.setState({
          photos: response.photo,
          progress: 'done'
        })
      })
      .catch(error => {
        clearTimeout(slowLoadTimer);
        this.setState({
          progress: 'error'
        });
      });
  }

  componentDidMount() {
    this.keyListener = window.addEventListener('keydown', (event) => {
      // Key controls for photo display
      if (this.state.currentPhotoIndex) {
        event.preventDefault();
        // Escape for close
        if (event.keyCode == 27) {
          this.displayPhoto(null);
        // Left for previous
        } else if (event.keyCode == 37) {
          if (this.state.currentPhotoIndex > 0) this.displayPhoto(this.state.currentPhotoIndex - 1);
        // Right/space for next
        } else if (event.keyCode == 39 || event.keyCode == 32) {
          if (this.state.currentPhotoIndex < this.state.photos.length - 1) this.displayPhoto(this.state.currentPhotoIndex + 1);
        }
      }
    });
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.keyListener);
  }

  displayPhoto(index) {
    if (index !== undefined && index !== null && this.state.photos[index]) {
      this.setState({
        currentPhotoIndex: index,
        currentPhoto: this.state.photos[index]
      });
    // Clear photo and close display
    } else {
      this.setState({
        currentPhotoIndex: undefined,
        currentPhoto: undefined
      });
    }
  }

  render() {
    const messages = {
      init: null,
      loading: 'Loading...',
      slow: 'Loooaaaadingggg... sooo... slowwwly...',
      done: null,
      error: 'Error'
    };
    return (
      <div className="cygniGallery">
        <PhotoDisplay
          photo={this.state.currentPhoto}
          onClose={() => this.displayPhoto(null)}
          onPrev={this.state.currentPhotoIndex > 0 ? (() => this.displayPhoto(this.state.currentPhotoIndex - 1)) : null}
          onNext={this.state.currentPhotoIndex < this.state.photos.length - 1 ? (() => this.displayPhoto(this.state.currentPhotoIndex + 1)) : null}
        />
        <GalleryDisplay
          message={{type: this.state.progress, text: messages[this.state.progress]}}
          photos={this.state.photos}
          onPhotoClick={index => this.displayPhoto(index)}
        />
      </div>
    );
  }
}