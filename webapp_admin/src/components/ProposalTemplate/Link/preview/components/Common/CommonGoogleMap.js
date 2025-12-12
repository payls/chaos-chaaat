import React, {useEffect, useState} from 'react';
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from '@react-google-maps/api';
import {config} from '../../configs/config';
import {h} from '../../helpers';

const linkStyle = {
  cursor: 'pointer',
  textDecoration: 'underline',
};
const mapLinkCategory = {
  supermarkets: 'supermarkets',
  cafes: 'cafes',
  bars: 'bars',
  schools: 'schools',
  kindergardens: 'kindergardens',
};

export default function CommonGoogleMap({
                                          location = {},
                                          locationMap = [],
                                          showBottomLinks = false,
                                        }) {
  const [selected, setSelected] = useState({});
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    updateSelectedLocations();
  }, [location, locationMap]);

  const updateSelectedLocations = (locations) => {
    let locationsCopy = [];
    locationsCopy.push({
      name: location.name,
      location: {
        lat: location.lat,
        lng: location.lng,
      },
    });
    if (locations && locations.length > 0) {
      for (let i = 0; i < locations.length; i++) {
        const locationsCopyElement = locations[i];
        locationsCopy.push({
          name: locationsCopyElement.name,
          location: {
            lat: locationsCopyElement.lat,
            lng: locationsCopyElement.lng,
          },
        });
      }
    }
    setLocations(locationsCopy);
  };

  const onSelect = (item) => {
    setSelected(item);
  };

  const onMapLinkClick = (slug) => {
    if (locationMap && locationMap.length > 0) {
      for (let i = 0; i < locationMap.length; i++) {
        const locationMapItem = locationMap[i];
        if (h.cmpStr(locationMapItem.slug, slug)) {
          setSelected(locationMapItem);
          updateSelectedLocations(locationMapItem.locations);
        }
      }
    }
  };

  return (
    <div>
      {/*https://medium.com/@allynak/how-to-use-google-map-api-in-react-app-edb59f64ac9d*/}
      <LoadScript googleMapsApiKey={config.google.apiKey}>
        <GoogleMap
          mapContainerStyle={{height: 224, width: '100%'}}
          zoom={13}
          center={{lat: location.lat, lng: location.lng}}
        >
          {locations.map((item) => {
            return (
              <Marker
                key={item.name}
                position={item.location}
                onClick={() => onSelect(item)}
              />
            );
          })}
          {selected.location && (
            <InfoWindow
              position={selected.location}
              clickable={true}
              onCloseClick={() => setSelected({})}
            >
              <p className="text-color1">{selected.name}</p>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>

      {showBottomLinks && (
        <div
          className="row no-gutters justify-content-around"
          style={{
            textDecoration: 'underline',
            fontSize: 10,
            textDecorationColor: '#6a6a6a',
          }}
        >
          <div
            className={`col-12 col-md-2 ${
              h.cmpStr(selected.slug, mapLinkCategory.supermarkets)
                ? 'text-color2'
                : 'text-color5'
            }`}
            style={Object.assign(
              {},
              linkStyle,
              h.cmpStr(selected.slug, mapLinkCategory.supermarkets)
                ? {textDecorationColor: '#ede6dd'}
                : {},
            )}
            onClick={() => onMapLinkClick(mapLinkCategory.supermarkets)}
          >
            Supermarkets
          </div>
          <div
            className={`col-12 col-md-2 text-md-center ${
              h.cmpStr(selected.slug, mapLinkCategory.cafes)
                ? 'text-color2'
                : 'text-color5'
            }`}
            style={Object.assign(
              {},
              linkStyle,
              h.cmpStr(selected.slug, mapLinkCategory.cafes)
                ? {textDecorationColor: '#ede6dd'}
                : {},
            )}
            onClick={() => onMapLinkClick(mapLinkCategory.cafes)}
          >
            Cafes
          </div>
          <div
            className={`col-12 col-md-2 text-md-center ${
              h.cmpStr(selected.slug, mapLinkCategory.bars)
                ? 'text-color2'
                : 'text-color5'
            }`}
            style={Object.assign(
              {},
              linkStyle,
              h.cmpStr(selected.slug, mapLinkCategory.bars)
                ? {textDecorationColor: '#ede6dd'}
                : {},
            )}
            onClick={() => onMapLinkClick(mapLinkCategory.bars)}
          >
            Bars
          </div>
          <div
            className={`col-12 col-md-2 text-md-center ${
              h.cmpStr(selected.slug, mapLinkCategory.schools)
                ? 'text-color2'
                : 'text-color5'
            }`}
            style={Object.assign(
              {},
              linkStyle,
              h.cmpStr(selected.slug, mapLinkCategory.schools)
                ? {textDecorationColor: '#ede6dd'}
                : {},
            )}
            onClick={() => onMapLinkClick(mapLinkCategory.schools)}
          >
            Schools
          </div>
          <div
            className={`col-12 col-md-2 text-md-center ${
              h.cmpStr(selected.slug, mapLinkCategory.kindergardens)
                ? 'text-color2'
                : 'text-color5'
            }`}
            style={Object.assign(
              {},
              linkStyle,
              h.cmpStr(selected.slug, mapLinkCategory.kindergardens)
                ? {textDecorationColor: '#ede6dd'}
                : {},
            )}
            onClick={() => onMapLinkClick(mapLinkCategory.kindergardens)}
          >
            Kindergardens
          </div>
          <div
            className={`col-12 col-md-2 text-color4 text-md-right`}
            style={linkStyle}
          >
            <a
              className="text-color4"
              target="_blank"
              href={location.google_map_url}
            >
              To Google Maps
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
