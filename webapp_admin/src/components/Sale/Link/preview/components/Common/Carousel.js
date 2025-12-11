import { Modal } from 'react-bootstrap';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactImageGallery from 'react-image-gallery';
import constant from '../../constants/constant.json';
import dynamic from 'next/dynamic';
import axios from 'axios';

import IconArrowLeft from '../Icons/IconArrowLeft';
import IconArrowRight from '../Icons/IconArrowRight';

const LightGallery = dynamic(() => import('lightgallery/react'), {
  ssr: false,
});

import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import 'lightgallery/css/lg-video.css';

import lgZoom from 'lightgallery/plugins/zoom';
import lgVideo from 'lightgallery/plugins/video';
import lgThumbnail from 'lightgallery/plugins/thumbnail';

export default function Carousel(props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modal, setModal] = useState({ visibility: false, data: { img: '' } });
  const [showVideo, setShowVideo] = useState(null);
  const { thumbnailPosition, activityTracker } = props;

  const lightGallery = useRef(null);
  const [container, setContainer] = useState(null);

  const [isFullScreen, setFullScreen] = useState(false);

  const [carouselItems, setCarouselItems] = useState([]);

  const [clickedThumb, setClickedThumb] = useState(false);

  const [carouselIndex, setCarouselIndex] = useState(0);

  function handleCloseModal() {
    setModal({ visibility: false, data: { img: '' } });
  }

  function handleOpenModal(img) {
    setModal({ visibility: true, data: { img } });
  }

  function onSlide() {
    resetVideo();
  }

  function resetVideo() {
    setShowVideo(null);
  }

  function renderLeftNav(onClick, disabled) {
    return (
      <button
        style={{ width: 50, height: 50 }}
        className="image-gallery-custom-left-nav rounded-circle"
        disabled={disabled}
        onClick={() => {
          onClick();
          activityTracker(
            constant.CONTACT.ACTIVITY.TYPE.CAROUSEL_LEFT_BUTTON_CLICKED,
          );
        }}
      >
        <IconArrowLeft style={{ width: 10, height: 'auto' }} />
      </button>
    );
  }

  function renderRightNav(onClick, disabled) {
    return (
      <button
        style={{ width: 50, height: 50 }}
        className="image-gallery-custom-right-nav rounded-circle"
        disabled={disabled}
        onClick={() => {
          onClick();
          activityTracker(
            constant.CONTACT.ACTIVITY.TYPE.CAROUSEL_RIGHT_BUTTON_CLICKED,
          );
        }}
      >
        <IconArrowRight style={{ width: 10, height: 'auto' }} />
      </button>
    );
  }

  // Light Gallery
  const onInit = useCallback((detail) => {
    if (detail && detail.instance) {
      lightGallery.current = detail.instance;
      lightGallery.current.openGallery();
    }
  }, []);

  // Light Gallery
  const setContainerRef = useCallback((node) => {
    if (node !== null) {
      setContainer(node);
    }
  }, []);

  useEffect(() => {
    if (isFullScreen) {
      document.body.style.overflow = 'hidden';
      if (props.items.length > 0) {
        const currentItem = props.items[carouselIndex];
        if (currentItem && currentItem.media_type && currentItem.src) {
          const metaData = {
            media_type: currentItem.media_type,
            url: currentItem.src,
          };
          activityTracker(
            constant.CONTACT.ACTIVITY.TYPE.CAROUSEL_IMAGE_CLICKED,
            metaData,
          );
        }
      }
    }

    if (!isFullScreen) {
      document.body.style.overflow = 'unset';
    }
  }, [isFullScreen]);

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    const items = await Promise.all(
      props.items.map(async (item) => {
        const isYoutube = item.src.match(
          /\/\/(?:www\.)?youtu(?:\.be|be\.com)\/(?:watch\?v=|embed\/)?([a-z0-9_\-]+)/i,
        );
        const isVimeo = item.src.match(
          /(http|https)?:\/\/(www\.|player\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|video\/|)(\d+)(?:|\/\?)/,
        );
        const isWistia = item.src.match(
          /(wistia\.net|wi\.st)\/(medias|embed)\/.*/,
        );

        let thumb = item.src;
        if (isYoutube) {
          const videoId = item.src.split('/')[item.src.split('/').length - 1];
          thumb = `https://i3.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
        }

        if (isVimeo) {
          const videoId = item.src.split('/')[item.src.split('/').length - 1];
          thumb = `https://vumbnail.com/${videoId}.jpg`;
        }

        if (isWistia) {
          const videoId = item.src.split('/')[item.src.split('/').length - 1];

          const response = await axios.get(
            `http://fast.wistia.net/oembed?url=https%3A%2F%2Fsupport.wistia.com%2Fmedias%2F${videoId}&embedType=async`,
          );

          thumb = response.data.thumbnail_url;

          return { src: `https://home.wistia.com/medias/${videoId}`, thumb };
        }

        return { src: item.src, thumb };
      }),
    );

    setCarouselItems(items);
  }

  useEffect(() => {
    if (clickedThumb) {
      if (
        props &&
        props.items &&
        props.items[clickedThumb] &&
        props.items[clickedThumb].src
      ) {
        activityTracker(
          constant.CONTACT.ACTIVITY.TYPE.CAROUSEL_THUMBNAIL_CLICKED,
          { image_url: props.items[clickedThumb].src },
        );
      }
    }
  }, [clickedThumb]);

  const afterAppendSlide = () => {
    if (document && document.body) {
      document.body.addEventListener('click', (event) => {
        if (!!event.target.getAttribute('data-lg-item-id')) {
          const thumbAttribute = event.target.getAttribute('data-lg-item-id');
          setClickedThumb(thumbAttribute);
          setCarouselIndex(Number(thumbAttribute));
        }
      });
    }
  };

  const afterOpen = () => {
    const maximizeButton = document.querySelector('.lg-maximize');
    const leftButton = document.querySelector('.lg-prev');
    const rightButton = document.querySelector('.lg-next');

    if (maximizeButton) {
      maximizeButton.addEventListener('click', () => {
        setFullScreen((prevState) => !prevState);
      });
    }

    if (leftButton) {
      leftButton.addEventListener('click', (event) => {
        event.stopImmediatePropagation();
        setCarouselIndex((prevState) => prevState - 1);
        activityTracker(
          constant.CONTACT.ACTIVITY.TYPE.CAROUSEL_LEFT_BUTTON_CLICKED,
        );
      });
    }

    if (rightButton) {
      rightButton.addEventListener('click', (event) => {
        event.stopImmediatePropagation();
        setCarouselIndex((prevState) => prevState + 1);
        activityTracker(
          constant.CONTACT.ACTIVITY.TYPE.CAROUSEL_RIGHT_BUTTON_CLICKED,
        );
      });
    }
  };

  // Light Gallery
  const getLgComponent = () => {
    if (container !== null) {
      if (carouselItems.length > 0) {
        return (
          <LightGallery
            plugins={[lgVideo, lgZoom, lgThumbnail]}
            dynamic
            dynamicEl={carouselItems.length > 0 ? carouselItems : null}
            onInit={onInit}
            closable={false}
            showMaximizeIcon
            autoplay
            container={container}
            onAfterAppendSlide={() => {
              afterAppendSlide();
              afterOpen();
            }}
            addClass="property-carousel"
          ></LightGallery>
        );
      }
    }

    return null;
  };

  // Light Gallery
  if (props.isBuyerPage) {
    return (
      <div className="App">
        <div className="lightgallery-container" ref={setContainerRef}></div>
        {getLgComponent()}
      </div>
    );
  }

  return (
    <>
      {props.isProjectUnit && (
        <Modal
          size="xl"
          show={modal.visibility}
          onHide={handleCloseModal}
          onEntered={() =>
            activityTracker(
              constant.CONTACT.ACTIVITY.TYPE.CAROUSEL_IMAGE_CLICKED,
              { image_url: modal.data.img },
            )
          }
        >
          <Modal.Header closeButton></Modal.Header>
          <Modal.Body>
            <img className="img-fluid" src={modal.data.img} />
          </Modal.Body>
        </Modal>
      )}
      <div>
        {props && props.items && (
          <ReactImageGallery
            items={
              (props &&
                props.items &&
                props.items.map((item, index) => ({
                  original: item.src,
                  description: item.description,
                  alt: item.alt,
                  index,
                  media_type: item.media_type,
                }))) ||
              []
            }
            lazyLoad
            showPlayButton={false}
            showFullscreenButton={false}
            onSlide={onSlide}
            renderItem={(item, index) => {
              if (item.media_type === 'image') {
                return (
                  <>
                    <img
                      key={index}
                      className="d-block w-100 p-1"
                      style={props.isProjectUnit ? { cursor: 'zoom-in' } : {}}
                      src={item.original}
                      alt={item.alt}
                      onClick={() => handleOpenModal(item.original)}
                    />
                    {props.showDescription && item.description && (
                      <span
                        className="image-gallery-description"
                        style={{ right: '0', left: 'initial' }}
                      >
                        {item.description}
                      </span>
                    )}
                  </>
                );
              }

              const videoId =
                item.original.split('/')[item.original.split('/').length - 1];

              return (
                <div>
                  {showVideo === item.original ? (
                    <div className="carousel-video-wrapper">
                      <a
                        className="carousel-close-video"
                        onClick={() => setShowVideo(null)}
                      ></a>
                      <iframe
                        width="560"
                        height="315"
                        src={`${item.original}?autoplay=1`}
                        frameBorder="0"
                        allowFullScreen
                        allow="autoplay"
                      ></iframe>
                    </div>
                  ) : (
                    <a
                      onClick={() => {
                        setShowVideo(item.original);
                      }}
                    >
                      <div className="carousel-play-button"></div>
                      <img
                        className="image-gallery-image"
                        src={`https://i3.ytimg.com/vi/${videoId}/maxresdefault.jpg`}
                      />
                      {props.showDescription && item.description && (
                        <span
                          className="image-gallery-description"
                          style={{ right: '0', left: 'initial' }}
                        >
                          {item.description}
                        </span>
                      )}
                    </a>
                  )}
                </div>
              );
            }}
            renderThumbInner={(item) => {
              const videoId =
                item.original.split('/')[item.original.split('/').length - 1];
              return (
                <img
                  key={item.index}
                  className="d-block"
                  style={{
                    height: 'auto',
                    width: '100%',
                    border:
                      currentIndex === item.index
                        ? '3px solid #141414'
                        : 'none',
                  }}
                  src={
                    item.media_type === 'video'
                      ? `https://i3.ytimg.com/vi/${videoId}/maxresdefault.jpg`
                      : item.original
                  }
                  alt={item.alt}
                  onClick={() => {
                    let metaData = {};
                    if (item.media_type === 'video') {
                      (metaData.media_type = 'video'),
                        (metaData.url = `https://i3.ytimg.com/vi/${videoId}/maxresdefault.jpg`);
                    } else {
                      metaData.media_type = 'image';
                      metaData.url = item.original;
                    }
                    activityTracker(
                      constant.CONTACT.ACTIVITY.TYPE.CAROUSEL_THUMBNAIL_CLICKED,
                      metaData,
                    );
                  }}
                />
              );
            }}
            renderLeftNav={renderLeftNav}
            renderRightNav={renderRightNav}
            onBeforeSlide={(index) => setCurrentIndex(index)}
            thumbnailPosition={thumbnailPosition ? thumbnailPosition : 'bottom'}
          />
        )}
      </div>
    </>
  );
}
