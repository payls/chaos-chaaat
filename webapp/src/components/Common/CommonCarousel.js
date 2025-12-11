import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import dynamic from 'next/dynamic';
import axios from 'axios';

import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import 'lightgallery/css/lg-video.css';
import 'lightgallery/css/lg-fullscreen.css';
import lgZoom from 'lightgallery/plugins/zoom';
import lgFullscreen from 'lightgallery/plugins/fullscreen';
import lgVideo from 'lightgallery/plugins/video';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import { h } from '../../helpers';
import constant from '../../constants/constant.json';
import CommonModalFullScreen from './CommonModalFullScreen';
import IconPhotoVector from '../Icons/IconPhotoVector';
import IconZoomIn from '../Icons/IconZoomIn';
import IconZoomOut from '../Icons/IconZoomOut';

import {
  faExpand,
  faTimes,
  faAngleDown,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import SwiperComponent from './partials/SwiperComponent';

const LightGallery = dynamic(() => import('lightgallery/react'), {
  ssr: false,
});

function CommonCarousel(props) {
  const {
    shouldTrackActivity,
    activityTracker,
    projectLevel = false,
    customStyle,
    translate,
    enabledTags = {
      images: true,
      floor_plan: true,
      video: true,
      brochure: true,
      render_3d: true,
    },
    swiperThumbnails = true,
  } = props;
  const allTag = 'all';
  const specificTagOrdering = [
    allTag,
    constant.PROPERTY.MEDIA.TAG.FLOOR_PLAN,
    constant.PROPERTY.MEDIA.TAG.IMAGE,
    constant.PROPERTY.MEDIA.TAG.VIDEO,
    constant.PROPERTY.MEDIA.TAG.BROCHURE,
    constant.PROPERTY.MEDIA.TAG.FACTSHEET,
    constant.PROPERTY.MEDIA.TAG.RENDER_3D,
  ];

  const lightGallery = useRef(null);
  const [allCarouselItems, setAllCarouselItems] = useState([]);
  const [carouselItems, setCarouselItems] = useState([]);
  const [currentTimerActivity, setCurrentTimerActivity] = useState({
    index: null,
    activityType: '',
    metadata: {},
  });
  const [photoCount, setPhotoCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const containerRef = useRef(null);
  const [currentImageTag, setCurrentImageTag] = useState({
    tag: allTag,
    isCarouselClick: false,
  });

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const swiperSlideRef = useRef(null);
  const photoCountIndicatorRef = useRef(null);
  const [photoCountIndicatorLeft, setPhotoCountIndicatorLeft] = useState(0);
  const [zoomTrigger, setZoomTrigger] = useState(false);
  const [isFs, setIsFS] = useState(false);
  const [currentTag, setCurrentTag] = useState('');

  useEffect(() => {
    loadItems();
  }, [props.items]);

  useEffect(() => {
    const fullscreenChanged = () => {
      setIsFS((prevState) => !prevState);
    };
    window.addEventListener('fullscreenchange', fullscreenChanged, false);

    return () =>
      window.removeEventListener('fullscreenchange', fullscreenChanged);
  }, []);

  useEffect(() => {
    const updateWindowDimensions = () => {
      const newWidth = window.innerWidth;
      setWindowWidth(newWidth);
    };
    window.addEventListener('resize', updateWindowDimensions);

    return () => window.removeEventListener('resize', updateWindowDimensions);
  }, []);

  const getImageTags = () => {
    // safeguard for videos that are not yet tagged with 'video'
    const taggedItems = props.items.map((item) => {
      if (isVideo(item)) {
        return { ...item, tag: [constant.PROPERTY.MEDIA.TAG.VIDEO] };
      } else {
        return { ...item };
      }
    });

    const deduplicateReducer = (prev, curr) => {
      if (!prev.includes(constant.PROPERTY.MEDIA.TAG.VIDEO) && isVideo(curr)) {
        prev.unshift(constant.PROPERTY.MEDIA.TAG.VIDEO);
        return prev;
      }

      const currTags = curr.tag;
      for (const tag of currTags) {
        if (
          !prev.includes(tag) &&
          Object.values(constant.PROPERTY.MEDIA.TAG).includes(tag)
        ) {
          prev.push(tag);
        }
      }
      return prev;
    };
    const imageTags = taggedItems.reduce(deduplicateReducer, []);
    let reorderedImageTags = specificTagOrdering.filter((tag) =>
      imageTags.includes(tag),
    );

    // Reorder floor plan trigger to end on project level
    if (projectLevel && reorderedImageTags.indexOf('floor_plan') !== -1) {
      reorderedImageTags.push(
        reorderedImageTags.splice(
          reorderedImageTags.indexOf('floor_plan'),
          1,
        )[0],
      );
    }

    return reorderedImageTags;
  };

  const isVideo = (item) => {
    const videoTypes = [
      constant.UPLOAD.TYPE.PROJECT_MEDIA_VIDEO,
      constant.UPLOAD.TYPE.PROJECT_MEDIA_YOUTUBE,
      constant.UPLOAD.TYPE.PROJECT_MEDIA_VIMEO,
      constant.UPLOAD.TYPE.PROJECT_MEDIA_WISTIA,
    ];
    if (videoTypes.includes(item.media_type)) return true;
    return false;
  };

  useEffect(() => {
    (async () => {
      await loadItems();
      setZoomTrigger(false);
    })();

    setCurrentTag(currentImageTag.tag);
  }, [currentImageTag]);

  // Reset Zoom status
  useEffect(() => {
    (async () => {
      if (lightGallery && lightGallery.current && !zoomTrigger) {
        lightGallery.current.plugins[2].beginZoom(1);
      }
    })();
  }, [zoomTrigger]);

  useEffect(() => {
    // clicking on tags outside carousel
    if (h.general.cmpBool(currentImageTag.isOutsideTagClick, true)) {
      setShowModal(true);
      lightGallery.current.refresh([...carouselItems]);
      lightGallery.current.openGallery();
    }

    if (
      lightGallery.current &&
      lightGallery.current.lGalleryOn &&
      currentImageTag.tag !== currentTag
    ) {
      lightGallery.current.updateSlides([...carouselItems], 0);
    }

    if (
      (lightGallery.current && lightGallery.current.lGalleryOn) ||
      h.general.cmpBool(currentImageTag.isOutsideTagClick, true)
    ) {
      if (!currentImageTag.isCarouselClick) {
        const index = 0;
        const constantKey = (
          (!projectLevel ? 'tag_clicked_' : 'project_level_tag_clicked_') +
          currentImageTag.tag
        ).toUpperCase();
        const tagActivity = constant.CONTACT.ACTIVITY.TYPE[constantKey];
        const metadata = { url: carouselItems[index].src };
        setCurrentTimerActivity({
          index,
          activityType: tagActivity,
          metadata: metadata,
        });
      }
    }
  }, [carouselItems]);

  async function loadItems() {
    setPhotoCount(0);
    const items = await Promise.all(
      props.items
        .filter((f) => {
          if (projectLevel) {
            return f.tag.includes('project');
          }
          return true;
        })
        .map(async (item, index) => {
          const isYoutube = item.src
            ? item.src.match(
                /\/\/(?:www\.)?youtu(?:\.be|be\.com)\/(?:watch\?v=|embed\/)?([a-z0-9_\-]+)/i,
              )
            : null;
          const isVimeo = item.src
            ? item.src.match(
                /(http|https)?:\/\/(www\.|player\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|video\/|)(\d+)(?:|\/\?)/,
              )
            : null;
          const isWistia = item.src
            ? item.src.match(/(wistia\.net|wi\.st)\/(medias|embed)\/.*/)
            : null;
          let thumb = item.thumbnail_src ?? item.src;

          if (isYoutube) {
            const videoId = item.src.split('/')[item.src.split('/').length - 1];
            thumb = `https://i3.ytimg.com/vi/${videoId}/sddefault.jpg`;
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

            if (response && response.data && response.data.thumbnail_url) {
              thumb = response.data.thumbnail_url;
              return {
                src: `https://home.wistia.com/medias/${videoId}`,
                thumb,
                tag: item.tag,
              };
            } else {
              return null;
            }
          }

          if (!isVideo(item)) {
            setPhotoCount((photoCount) => photoCount + 1);
          }

          const src = item.tag.includes(
            constant.UPLOAD.TYPE.PROJECT_MEDIA_VIDEO,
          )
            ? null
            : item.src;

          const video = item.tag.includes(
            constant.UPLOAD.TYPE.PROJECT_MEDIA_VIDEO,
          )
            ? {
                source: [
                  {
                    src: item.src,
                    type: 'video/mp4',
                  },
                ],
                attributes: { preload: false, controls: true },
              }
            : null;

          const isIframe = item?.media_type?.includes(
            constant.UPLOAD.TYPE.PROJECT_MEDIA_RENDER_3D,
          )
            ? {
                iframe: true,
                thumb: 'https://cdn.yourpave.com/assets/3d.png',
              }
            : {};
          return {
            id: index,
            src,
            thumb,
            // size: '1400-800',
            tag: isVideo(item) ? [constant.PROPERTY.MEDIA.TAG.VIDEO] : item.tag,
            is_hero_image: item.is_hero_image,
            display_order: item.display_order,

            // video mp2 media
            video,

            // iframed media
            ...isIframe,
          };
        }),
    );

    const sortFloorPlanFirst = (a, b) => {
      if (!projectLevel) {
        if (a.tag.includes(constant.PROPERTY.MEDIA.TAG.FLOOR_PLAN)) {
          return -1;
        }
        if (b.tag.includes(constant.PROPERTY.MEDIA.TAG.FLOOR_PLAN)) {
          return 1;
        }
      } else {
        if (a.tag.includes(constant.PROPERTY.MEDIA.TAG.FLOOR_PLAN)) {
          return 1;
        }
        if (b.tag.includes(constant.PROPERTY.MEDIA.TAG.FLOOR_PLAN)) {
          return -1;
        }
      }
      return 0;
    };

    const sortBrochure = (a, b) => {
      if (a.tag.includes(constant.PROPERTY.MEDIA.TAG.BROCHURE)) {
        return 1;
      }
      if (b.tag.includes(constant.PROPERTY.MEDIA.TAG.BROCHURE)) {
        return -1;
      }
      return 0;
    };

    const sortFactsheet = (a, b) => {
      if (a.tag.includes(constant.PROPERTY.MEDIA.TAG.FACTSHEET)) {
        return 1;
      }
      if (b.tag.includes(constant.PROPERTY.MEDIA.TAG.FACTSHEET)) {
        return -1;
      }
      return 0;
    };

    const sortImages = (a, b) => {
      if (
        a.tag.includes(constant.PROPERTY.MEDIA.TAG.IMAGE) &&
        !b.tag.includes(constant.PROPERTY.MEDIA.TAG.IMAGE)
      ) {
        return -1;
      } else if (
        !a.tag.includes(constant.PROPERTY.MEDIA.TAG.IMAGE) &&
        b.tag.includes(constant.PROPERTY.MEDIA.TAG.IMAGE)
      ) {
        return 1;
      } else {
        return a.display_order - b.display_order;
      }
    };

    let allItems = [...items.filter((item) => item)]
      .sort((a, b) => a.display_order - b.display_order)
      .sort(sortImages)
      .sort(sortFloorPlanFirst);

    if (projectLevel) {
      allItems = allItems.sort((a, b) => {
        if (a.is_hero_image) return -1;
        if (b.is_hero_image) return 1;
        return 0;
      });
    }

    setAllCarouselItems(allItems);

    let carouselItems;
    if (h.general.cmpStr(currentImageTag.tag, allTag)) {
      carouselItems = allItems.filter((item) => item);
    } else {
      carouselItems = allItems.filter(
        (item) => item && item.tag.includes(currentImageTag.tag),
      );
    }
    setCarouselItems(carouselItems);
  }

  const handleMaximize = (clickedIndex) => {
    if (clickedIndex >= 0) {
      setShowModal(true);
      setCurrentImageTag({ tag: allTag, isCarouselClick: true });
      lightGallery.current.refresh([...carouselItems]);
      lightGallery.current.openGallery(clickedIndex);
      if (allCarouselItems && allCarouselItems[clickedIndex]) {
        const metaData = {
          media_type: allCarouselItems[clickedIndex].media_type,
          url: allCarouselItems[clickedIndex].src,
        };
        if (shouldTrackActivity) {
          setCurrentTimerActivity({
            index: clickedIndex,
            activityType: !projectLevel
              ? constant.CONTACT.ACTIVITY.TYPE.CAROUSEL_IMAGE_CLICKED
              : constant.CONTACT.ACTIVITY.TYPE.PROJECT_CAROUSEL_IMAGE_CLICKED,
            metadata: metaData,
          });
        }
      }
    }
  };

  const handleSwiperSlideChange = async (event) => {
    if (!event) return;
    const { previousIndex, activeIndex } = event;
    if (previousIndex !== undefined && activeIndex !== undefined) {
      if (previousIndex < activeIndex) {
        if (shouldTrackActivity)
          activityTracker(
            !projectLevel
              ? constant.CONTACT.ACTIVITY.TYPE.CAROUSEL_RIGHT_BUTTON_CLICKED
              : constant.CONTACT.ACTIVITY.TYPE
                  .PROJECT_CAROUSEL_RIGHT_BUTTON_CLICKED,
          );
      }
      if (previousIndex > activeIndex) {
        if (shouldTrackActivity)
          activityTracker(
            !projectLevel
              ? constant.CONTACT.ACTIVITY.TYPE.CAROUSEL_LEFT_BUTTON_CLICKED
              : constant.CONTACT.ACTIVITY.TYPE
                  .PROJECT_CAROUSEL_LEFT_BUTTON_CLICKED,
          );
      }
    }
  };

  useEffect(() => {
    if (currentTimerActivity.index === null) return;

    let timeElapsed = 0;

    const clearTimerAndTrackActivity = async () => {
      clearInterval(intervalId);
      await activityTracker(currentTimerActivity.activityType, {
        ...currentTimerActivity.metadata,
        on_screen_duration: timeElapsed,
      });
    };

    const intervalId = setInterval(() => {
      if (document.hasFocus()) {
        timeElapsed += 1;
      }
    }, 1000);

    return clearTimerAndTrackActivity;
  }, [currentTimerActivity]);

  const handleLightGalleryThumbnailClick = (event) => {
    if (!event || !carouselItems) return;
    const { index, fromThumb } = event;
    // Detect only thumbnail click events
    if (fromThumb) {
      let targetIndex;
      if (fromThumb) targetIndex = index;
      const selectedCarouselItem =
        lightGallery.current.galleryItems[targetIndex];
      if (
        shouldTrackActivity &&
        selectedCarouselItem &&
        selectedCarouselItem.src
      ) {
        setCurrentTimerActivity({
          index: targetIndex,
          activityType: !projectLevel
            ? constant.CONTACT.ACTIVITY.TYPE.CAROUSEL_THUMBNAIL_CLICKED
            : constant.CONTACT.ACTIVITY.TYPE.PROJECT_CAROUSEL_THUMBNAIL_CLICKED,
          metadata: { image_url: selectedCarouselItem.src },
        });
      }
    }
  };

  const handleLightGallerySlideChange = (event, activityType) => {
    const { index } = event;
    const selectedCarouselItem = lightGallery.current.galleryItems[index];
    setZoomTrigger(false);
    if (selectedCarouselItem.tag.includes('video')) {
      let url = selectedCarouselItem.src;
      if (!h.isEmpty(selectedCarouselItem.video)) {
        url = selectedCarouselItem?.video?.source
          ? selectedCarouselItem?.video?.source[0]?.src
          : null;
      }
      setCurrentTimerActivity({
        index: index,
        activityType: constant.CONTACT.ACTIVITY.TYPE.CAROUSEL_PLAY_VIDEO,
        metadata: { video_url: url },
      });
    } else if (selectedCarouselItem.tag.includes('render_3d')) {
      setCurrentTimerActivity({
        index: index,
        activityType: constant.CONTACT.ACTIVITY.TYPE.CAROUSEL_PLAY_3D,
        metadata: { iframe_url: selectedCarouselItem.src },
      });
    } else {
      setCurrentTimerActivity({
        index: index,
        activityType,
        metadata: { image_url: selectedCarouselItem.src },
      });
    }
  };

  const onInit = useCallback(
    (detail) => {
      if (detail && detail.instance) {
        lightGallery.current = detail.instance;
      }
      if (!lightGallery.current) return null;
    },
    [lightGallery],
  );

  const getLgComponent = () => {
    if (carouselItems.length && containerRef.current !== null) {
      return (
        <LightGallery
          container={containerRef.current}
          onInit={onInit}
          preload={3}
          plugins={[lgVideo, lgThumbnail, lgZoom, lgFullscreen]}
          dynamic
          dynamicEl={carouselItems.length > 0 ? carouselItems : []}
          elementClassNames="custom-wrapper-class"
          addClass="property-carousel"
          fullScreen={true}
          // showMaximizeIcon={false}
          download={false}
          counter={false}
          numberOfSlideItemsInDom={1}
          closeOnTap={false}
          licenseKey="0000-0000-000-0000"
          backdropDuration={300}
          mobileSettings={{
            showCloseIcon: true,
            download: false,
            fullScreen: true,
            preload: 2,
          }}
          onAfterOpen={() => {
            // Remove Original Zoom Button
            const oldZoomBtn = document.getElementsByClassName('lg-zoom-in');

            while (oldZoomBtn.length > 0) {
              oldZoomBtn[0].parentNode.removeChild(oldZoomBtn[0]);
            }
          }}
          onBeforeNextSlide={(e) => {
            handleLightGallerySlideChange(
              e,
              !projectLevel
                ? constant.CONTACT.ACTIVITY.TYPE.CAROUSEL_RIGHT_BUTTON_CLICKED
                : constant.CONTACT.ACTIVITY.TYPE
                    .PROJECT_CAROUSEL_RIGHT_BUTTON_CLICKED,
            );
          }}
          onBeforePrevSlide={(e) => {
            handleLightGallerySlideChange(
              e,
              !projectLevel
                ? constant.CONTACT.ACTIVITY.TYPE.CAROUSEL_LEFT_BUTTON_CLICKED
                : constant.CONTACT.ACTIVITY.TYPE
                    .PROJECT_CAROUSEL_LEFT_BUTTON_CLICKED,
            );
          }}
          onBeforeClose={() => {
            setZoomTrigger(false);
            setShowModal(false);
          }}
          onAfterClose={() => {
            // reset carousel state
            setCurrentImageTag({
              tag: allTag,
              isCarouselClick: false,
            });
          }}
          onAfterSlide={(e) => {
            handleLightGalleryThumbnailClick(e);
          }}
        ></LightGallery>
      );
    }
    return null;
  };

  const handleLightGalleryClose = () => {
    setShowModal(false);
    lightGallery.current.closeGallery();
    setCurrentImageTag({
      tag: allTag,
      isCarouselClick: false,
    });
    setCarouselItems([...allCarouselItems]);
    setCurrentTimerActivity({
      index: null,
      activityType: '',
      metadata: {},
    });
  };

  useEffect(() => {
    if (swiperSlideRef.current && photoCountIndicatorRef.current && windowWidth)
      getLeftProperty();
  }, [swiperSlideRef.current, photoCountIndicatorRef.current, windowWidth]);

  const getLeftProperty = () => {
    const slideWidth = swiperSlideRef.current.clientWidth;
    const offsetWidth = photoCountIndicatorRef.current.offsetWidth / 2;
    // Mobile window width threshold
    if (windowWidth <= 480) {
      setPhotoCountIndicatorLeft(slideWidth / 2 - offsetWidth + 'px');
    } else if (allCarouselItems.length >= 3) {
      setPhotoCountIndicatorLeft(
        slideWidth / 2 + slideWidth * 2 - offsetWidth + 'px',
      );
    } else {
      setPhotoCountIndicatorLeft(
        slideWidth / 2 +
          slideWidth * (allCarouselItems.length - 1) -
          offsetWidth +
          'px',
      );
    }
  };

  const zoomOverrideFunc = () => {
    const lg = lightGallery.current;
    const slideIndex = lg.index;
    const gallerySelectedItem = lg.galleryItems[slideIndex];

    if (
      gallerySelectedItem &&
      gallerySelectedItem.tag.includes(constant.PROPERTY.MEDIA.TAG.VIDEO)
    )
      return false;

    const lgZoomPlugin = lg.plugins[2];
    lgZoomPlugin.setZoomStyles({
      x: 5,
      y: 5,
      scale: 5,
    });
    if (!zoomTrigger) {
      lgZoomPlugin.zoomImage(1.75);
      lgZoomPlugin.beginZoom(1.75);
    } else {
      lgZoomPlugin.zoomImage(1);
      lgZoomPlugin.beginZoom(1);
    }

    setZoomTrigger(!zoomTrigger);
  };

  return (
    <div id={projectLevel ? 'project-level-carousel' : ''}>
      <CommonModalFullScreen showModal={showModal}>
        {/* Desktop view image tags bar */}
        {!isFs && (
          <div className="align-items-center image-tags-container">
            <div
              className={
                !h.general.cmpStr(allTag, currentImageTag.tag)
                  ? 'image-tag'
                  : 'image-tag-selected'
              }
              onClick={() => {
                setCurrentImageTag({ tag: allTag, isCarouselClick: false });
              }}
              style={{
                backgroundColor: !h.general.cmpStr(allTag, currentImageTag.tag)
                  ? 'white'
                  : customStyle?.carousel?.tagActiveBgColor,
                border: `1px solid ${customStyle?.carousel?.tagActiveBgColor}`,
                color: !h.general.cmpStr(allTag, currentImageTag.tag)
                  ? customStyle?.carousel?.tagActiveBgColor
                  : customStyle?.carousel?.tagTextColor,
              }}
            >
              {' '}
              {h.translate.localize('all', translate)}{' '}
            </div>
            {getImageTags()
              .filter((f) => enabledTags[f])
              .map((tag, i) => {
                const prettifiedTag = h.general.prettifyConstant(tag);
                return (
                  <div
                    key={i}
                    className={
                      !h.general.cmpStr(tag, currentImageTag.tag)
                        ? 'image-tag'
                        : 'image-tag-selected'
                    }
                    style={{
                      backgroundColor: !h.general.cmpStr(
                        tag,
                        currentImageTag.tag,
                      )
                        ? 'white'
                        : customStyle?.carousel?.tagActiveBgColor,
                      border: `1px solid ${customStyle?.carousel?.tagActiveBgColor}`,
                      color: !h.general.cmpStr(tag, currentImageTag.tag)
                        ? customStyle?.carousel?.tagActiveBgColor
                        : customStyle?.carousel?.tagTextColor,
                    }}
                    onClick={() => {
                      console.log(tag);
                      setCurrentImageTag({ tag: tag, isCarouselClick: false });
                    }}
                  >
                    {' '}
                    {tag === 'render_3d'
                      ? '3D'
                      : h.translate.localize(prettifiedTag, translate)}{' '}
                  </div>
                );
              })}
            {/* Close button on custom bar, leaving it in just in case */}
            {/* <div
            className="carousel-modal-close d-flex flex-row justify-content-end"
            onClick={() => {
              handleLightGalleryClose();
            }}
          >
            x
          </div> */}
          </div>
        )}
        <div
          id={`modal-lightgallery-container-${Math.random()}`}
          style={{
            flexGrow: '1',
          }}
          ref={containerRef}
        >
          {/* Override Zoom button function and element */}
          {/* Begin here */}
          <button className="zoomBtn" onClick={zoomOverrideFunc}>
            {zoomTrigger ? <IconZoomIn /> : <IconZoomOut />}
          </button>
          {getLgComponent()}
        </div>
      </CommonModalFullScreen>

      {/* Desktop view image tags bar */}
      <div
        className="container image-tags-container mb-2"
        style={{ padding: showModal ? '2em 10%' : '1em 17px' }}
      >
        <div
          className="image-tag-selected"
          onClick={() => {
            setCurrentImageTag({
              tag: allTag,
              isCarouselClick: false,
              isOutsideTagClick: true,
            });
            setShowModal(true);
            lightGallery.current.openGallery();
          }}
          style={{
            backgroundColor: customStyle?.carousel?.tagActiveBgColor,
            border: `1px solid ${customStyle?.carousel?.tagActiveBgColor}`,
            color: customStyle?.carousel?.tagTextColor,
          }}
        >
          {' '}
          {h.translate.localize('all', translate)}{' '}
        </div>
        {getImageTags()
          .filter((f) => enabledTags[f])
          .map((tag, i) => {
            const prettifiedTag = h.general.prettifyConstant(tag);
            return (
              <div
                key={i}
                className="image-tag"
                style={{
                  backgroundColor: 'white',
                  border: `1px solid ${customStyle?.carousel?.tagActiveBgColor}`,
                  color: customStyle?.carousel?.tagActiveBgColor,
                }}
                onClick={() => {
                  setCurrentImageTag({
                    tag: tag,
                    isCarouselClick: false,
                    isOutsideTagClick: true,
                  });
                }}
              >
                {' '}
                {tag === 'render_3d'
                  ? '3D'
                  : h.translate.localize(prettifiedTag, translate)}{' '}
              </div>
            );
          })}
      </div>
      {allCarouselItems && (
        <SwiperComponent
          medias={allCarouselItems}
          handleMaximize={handleMaximize}
          showThumbnails={swiperThumbnails}
          projectLevel={projectLevel}
          shouldTrackActivity={shouldTrackActivity}
          activityTracker={activityTracker}
        />
      )}
    </div>
  );
}

export default React.memo(CommonCarousel);
