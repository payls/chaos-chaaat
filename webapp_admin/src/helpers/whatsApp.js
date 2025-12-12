import Axios from 'axios';
import { h } from './index';

/**
 * Default filter method for react-table
 * @param {{pivotId?:string, id?:string, value?:string}} filter
 * @param {object} row
 * @param {object} column
 * @returns {boolean}
 */
export function getWhatsAppToken(agency) {
  const { agency_whatsapp_api_token, agency_whatsapp_api_secret } = agency;

  return Buffer.from(
    agency_whatsapp_api_token + ':' + agency_whatsapp_api_secret,
    'utf8',
  ).toString('base64');
}

export function mobileNumberCheckerAU(mobile_number = '') {
  let adjusted_mobile_number = mobile_number.replaceAll('+', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll(' ', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll('(', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll(')', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll('-', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll('.', '');
  if (
    adjusted_mobile_number.length === 11 &&
    adjusted_mobile_number.startsWith('61') &&
    adjusted_mobile_number.substring(0, 2) === '61'
  ) {
    return adjusted_mobile_number;
  } else if (adjusted_mobile_number.length >= 9) {
    if (
      adjusted_mobile_number.length === 10 &&
      adjusted_mobile_number.startsWith('0') &&
      adjusted_mobile_number.substring(0, 1) === '0'
    ) {
      return '61' + adjusted_mobile_number.slice(1);
    } else if (
      adjusted_mobile_number.length === 11 &&
      adjusted_mobile_number.startsWith('61') &&
      adjusted_mobile_number.substring(0, 2) === '61'
    ) {
      return adjusted_mobile_number;
    } else if (adjusted_mobile_number.length === 9) {
      return '61' + adjusted_mobile_number;
    } else {
      return adjusted_mobile_number;
    }
  } else {
    return adjusted_mobile_number;
  }
}

export function mobileNumberCheckerSG(mobile_number = '') {
  let adjusted_mobile_number = mobile_number.replaceAll('+', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll(' ', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll('(', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll(')', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll('-', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll('.', '');
  if (
    adjusted_mobile_number.length === 10 &&
    adjusted_mobile_number.startsWith('65') &&
    adjusted_mobile_number.substring(0, 2) === '65'
  ) {
    return adjusted_mobile_number;
  } else if (adjusted_mobile_number.length >= 8) {
    if (
      adjusted_mobile_number.length === 9 &&
      adjusted_mobile_number.startsWith('0') &&
      adjusted_mobile_number.substring(0, 1) === '0'
    ) {
      return '65' + adjusted_mobile_number.slice(1);
    } else if (
      adjusted_mobile_number.length === 10 &&
      adjusted_mobile_number.startsWith('65') &&
      adjusted_mobile_number.substring(0, 2) === '65'
    ) {
      return adjusted_mobile_number;
    } else if (adjusted_mobile_number.length === 8) {
      return '65' + adjusted_mobile_number;
    } else {
      return adjusted_mobile_number;
    }
  } else {
    return adjusted_mobile_number;
  }
}

export function mobileNumberCheckerHK(mobile_number = '') {
  let adjusted_mobile_number = mobile_number.replaceAll('+', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll(' ', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll('(', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll(')', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll('-', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll('.', '');
  if (
    adjusted_mobile_number.length === 11 &&
    adjusted_mobile_number.startsWith('852') &&
    adjusted_mobile_number.substring(0, 3) === '852'
  ) {
    return adjusted_mobile_number;
  } else if (adjusted_mobile_number.length >= 8) {
    if (
      adjusted_mobile_number.length === 9 &&
      adjusted_mobile_number.startsWith('0') &&
      adjusted_mobile_number.substring(0, 1) === '0'
    ) {
      return '852' + adjusted_mobile_number.slice(1);
    } else if (
      adjusted_mobile_number.length === 11 &&
      adjusted_mobile_number.startsWith('852') &&
      adjusted_mobile_number.substring(0, 3) === '852'
    ) {
      return adjusted_mobile_number;
    } else if (adjusted_mobile_number.length === 8) {
      return '852' + adjusted_mobile_number;
    } else {
      return adjusted_mobile_number;
    }
  } else {
    return adjusted_mobile_number;
  }
}

export function mobileNumberCheckerMY(mobile_number = '') {
  let adjusted_mobile_number = mobile_number.replaceAll('+', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll(' ', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll('(', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll(')', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll('-', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll('.', '');
  if (
    adjusted_mobile_number.length === 11 &&
    adjusted_mobile_number.startsWith('60') &&
    adjusted_mobile_number.substring(0, 2) === '60'
  ) {
    return adjusted_mobile_number;
  } else if (
    adjusted_mobile_number.length === 12 &&
    adjusted_mobile_number.startsWith('60') &&
    adjusted_mobile_number.substring(0, 2) === '60'
  ) {
    return adjusted_mobile_number;
  } else if (adjusted_mobile_number.length >= 10) {
    if (
      adjusted_mobile_number.length === 10 &&
      adjusted_mobile_number.startsWith('0') &&
      adjusted_mobile_number.substring(0, 1) === '0'
    ) {
      return '60' + adjusted_mobile_number.slice(1);
    } else if (
      adjusted_mobile_number.length === 11 &&
      adjusted_mobile_number.startsWith('0') &&
      adjusted_mobile_number.substring(0, 1) === '0'
    ) {
      return '60' + adjusted_mobile_number.slice(1);
    } else if (
      adjusted_mobile_number.length === 11 &&
      adjusted_mobile_number.startsWith('60') &&
      adjusted_mobile_number.substring(0, 2) === '60'
    ) {
      return adjusted_mobile_number;
    } else if (adjusted_mobile_number.length === 9) {
      return '60' + adjusted_mobile_number;
    } else if (
      adjusted_mobile_number.length === 10 &&
      !adjusted_mobile_number.startsWith('0') &&
      !adjusted_mobile_number.substring(0, 1) === '0'
    ) {
      return '60' + adjusted_mobile_number;
    } else {
      return adjusted_mobile_number;
    }
  } else if (adjusted_mobile_number.length === 9) {
    return '60' + adjusted_mobile_number;
  } else {
    return adjusted_mobile_number;
  }
}

export function mobileNumberCheckerUK(mobile_number = '') {
  let adjusted_mobile_number = mobile_number.replaceAll('+', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll(' ', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll('(', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll(')', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll('-', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll('.', '');
  if (
    adjusted_mobile_number.length === 12 &&
    adjusted_mobile_number.startsWith('44') &&
    adjusted_mobile_number.substring(0, 2) === '44'
  ) {
    return adjusted_mobile_number;
  } else if (adjusted_mobile_number.length > 9) {
    if (
      adjusted_mobile_number.length === 13 &&
      adjusted_mobile_number.startsWith('440') &&
      adjusted_mobile_number.substring(0, 3) === '440'
    ) {
      return '44' + adjusted_mobile_number.slice(3);
    } else if (
      adjusted_mobile_number.length === 11 &&
      adjusted_mobile_number.startsWith('0') &&
      adjusted_mobile_number.substring(0, 1) === '0'
    ) {
      return '44' + adjusted_mobile_number.slice(1);
    } else if (
      adjusted_mobile_number.length === 10 &&
      adjusted_mobile_number.startsWith('44') &&
      adjusted_mobile_number.substring(0, 2) === '44'
    ) {
      return adjusted_mobile_number;
    } else if (adjusted_mobile_number.length === 10) {
      return '44' + adjusted_mobile_number;
    } else {
      return adjusted_mobile_number;
    }
  } else {
    return adjusted_mobile_number;
  }
}

export function nameChecker(first_name = '', last_name = '') {
  first_name = first_name ? first_name.trim() : first_name;
  last_name = last_name ? last_name.trim() : last_name;
  let adjusted_first_name = '';
  let adjusted_last_name = '';

  const honorifics = [
    'Mr.',
    'Mrs.',
    'Ms.',
    'Miss',
    'Dr.',
    'Prof.',
    'Rev.',
    'Sir',
    'Madam',
    'Mx.',
    'Mdm.',
    'Mr',
    'Ms',
    'Mrs',
    'Dr',
    'Prof',
    'Rev',
  ];

  const lowercaseHonorifics = honorifics.map((honorific) =>
    honorific.toLowerCase(),
  );

  if (!h.isEmpty(first_name) && h.isEmpty(last_name)) {
    const name_parts = first_name.split(' ');
    if (name_parts.length > 1) {
      const first_part = name_parts[0];
      if (lowercaseHonorifics.includes(first_part.toLowerCase())) {
        if (name_parts.length === 2) {
          adjusted_first_name = first_name;
        } else {
          const extractedNames = name_parts.slice(1, name_parts.length - 1);
          adjusted_first_name = extractedNames.join(' ');
          adjusted_last_name = name_parts[name_parts.length - 1];
        }
      } else {
        const extractedNames = name_parts.slice(0, name_parts.length - 1);
        adjusted_first_name = extractedNames.join(' ');
        adjusted_last_name = name_parts[name_parts.length - 1];
      }
    } else {
      adjusted_first_name = first_name;
    }
    // } else if (h.isEmpty(first_name) && !h.isEmpty(last_name)) {
    //   const name_parts = last_name.split(' ');
    //   if (name_parts.length > 1) {
    //     const first_part = name_parts[0];
    //     if (lowercaseHonorifics.includes(first_part.toLowerCase())) {
    //       if (name_parts.length === 2) {
    //         adjusted_first_name = first_name;
    //       } else {
    //         const extractedNames = name_parts.slice(1, name_parts.length - 1);
    //         adjusted_first_name = extractedNames.join(' ');
    //         adjusted_last_name = name_parts[name_parts.length - 1];
    //       }
    //     } else {
    //       const extractedNames = name_parts.slice(0, name_parts.length - 1);
    //       adjusted_first_name = extractedNames.join(' ');
    //       adjusted_last_name = name_parts[name_parts.length - 1];
    //     }
    //   } else {
    //     adjusted_first_name = first_name;
    //   }
    // } else {
  } else {
    adjusted_first_name = first_name;
    adjusted_last_name = last_name;
  }

  return {
    adjusted_first_name: adjusted_first_name,
    adjusted_last_name: adjusted_last_name,
  };
}
