import React from 'react';
import { h } from './';
import ReactHtmlParser from 'react-html-parser';

/**
 * Display text from translation object and does string replacement with data specified in translation object
 * @param {{ text:string, data?:object, options?:object }} translateObject
 * @returns {JSX.Element}
 */
export function displayText(translateObject) {
  let {
    text,
    data = {},
    options = { should_translate: true },
  } = translateObject;
  let finalText = null;
  if (h.notEmpty(text)) {
    //Contains HTML data
    if (h.notEmpty(data)) {
      finalText = [];
      for (let key in data) {
        text = text.replaceAll(`[${key}]`, data[key]);
      }
      finalText.push(ReactHtmlParser(text));
    } else {
      finalText = text;
    }
  }
  return finalText;
}

export function localize(text, locale) {
  if (locale && locale[h.general.camelize(text)]) {
    return locale[h.general.camelize(text)];
  }

  const defaultLocale = require('../constants/locale/en.json');

  if (defaultLocale[h.general.camelize(text)]) {
    return defaultLocale[h.general.camelize(text)];
  }

  return text;
}
