import theme from '../../preview/constants/theme.json';

/**
 * Theme helper
 */

export function getJSON(agencyId) {
  let name = '';
  switch (agencyId) {
    case '1da3ff5f-d3fc-11eb-8182-065264a181d4': // Raeon Theme
      name = 'raeon';
      break;
    case '1f880948-0097-40a8-b431-978fd59ca321': // OGPS Theme
    case 'f69e636d-6097-4fd3-8cf9-3f06529533db': // OGPS SG Theme
      name = 'ogps';
      break;
    case '2d6bd5e4-a90a-4138-b69c-52ad74dba119': // Lousise Theme
      name = 'louise';
      break;
    case '6d2ed536-369f-4b06-838a-458fac611c21': // EcoWorld Theme
      name = 'eco';
      break;
    case 'ef5ef3a5-f8ff-4a81-8d05-166317741ce1': // Amity Theme
      name = 'amity';
      break;
    case '96daf0fd-267a-4ddb-a72c-39584dfcec70': // Castran Theme
      name = 'castran';
      break;
    case 'cbba9229-4fde-43ad-8ad1-52e78ee6c2bf': // STH Theme
      name = 'sth';
      break;
    case '44545a82-49a5-4912-8da9-a35c658d63f8': // ThreeSixty Group Theme
      name = '360';
      break;
    case '3e09fed6-3538-442a-a458-ef95af682114': // Colliers Theme
      name = 'colliers';
      break;
    case '833704d3-7773-4a85-97f2-084921260fd7': // Republik Theme
      name = 'republik';
      break;
    case '3d1d056d-0a26-4274-bb9b-5b9e1b3e3b70': // Ashton Hawks Theme
      name = 'ashtonhawks';
      break;
    default: // Pave/Default Theme
      name = 'default';
      break;
  }

  return theme[name];
}
