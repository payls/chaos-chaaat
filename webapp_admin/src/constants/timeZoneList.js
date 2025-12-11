const timeZoneList = [
  {
    label: 'Pacific Time - US & Canada',
    value: 'America/Los_Angeles',
  },
  {
    label: 'Mountain Time - US & Canada',
    value: 'America/Denver',
  },
  {
    label: 'Central Time - US & Canada',
    value: 'America/Chicago',
  },
  {
    label: 'Eastern Time - US & Canada',
    value: 'America/New_York',
  },
  {
    label: 'Alaska Time',
    value: 'America/Anchorage',
  },
  {
    label: 'Arizona, Yukon Time',
    value: 'America/Phoenix',
  },
  {
    label: 'Newfoundland Time',
    value: 'America/St_Johns',
  },
  {
    label: 'Hawaii Time',
    value: 'Pacific/Honolulu',
  },
  {
    label: 'America/Adak',
    value: 'America/Adak',
  },
  {
    label: 'Asia/Hong Kong',
    value: 'Asia/Hong_Kong',
  },
  {
    label: 'Buenos Aires Time',
    value: 'America/Argentina/Buenos_Aires',
  },
  {
    label: 'Asuncion Time',
    value: 'America/Asuncion',
  },
  {
    label: 'Bogota, Jamaica, Lima Time',
    value: 'America/Bogota',
  },
  {
    label: 'America/Campo Grande',
    value: 'America/Campo_Grande',
  },
  {
    label: 'Caracas Time',
    value: 'America/Caracas',
  },
  {
    label: 'America/Godthab',
    value: 'America/Godthab',
  },
  {
    label: 'Atlantic Time',
    value: 'America/Halifax',
  },
  {
    label: 'Saskatchewan, Guatemala, Costa Rica Time',
    value: 'America/Regina',
  },
  {
    label: 'America/Havana',
    value: 'America/Havana',
  },
  {
    label: 'America/Mazatlan',
    value: 'America/Mazatlan',
  },
  {
    label: 'Mexico City Time',
    value: 'America/Mexico_City',
  },
  {
    label: 'Montevideo Time',
    value: 'America/Montevideo',
  },
  {
    label: 'America/Miquelon',
    value: 'America/Miquelon',
  },
  {
    label: 'America/Noronha',
    value: 'America/Noronha',
  },
  {
    label: 'Santiago Time',
    value: 'America/Santiago',
  },
  {
    label: 'America/Santa Isabel',
    value: 'America/Santa_Isabel',
  },
  {
    label: 'Atlantic Standard Time',
    value: 'America/Port_of_Spain',
  },
  {
    label: 'Brasilia Time',
    value: 'America/Sao_Paulo',
  },
  {
    label: 'Africa/Cairo',
    value: 'Africa/Cairo',
  },
  {
    label: 'Central Africa Time',
    value: 'Africa/Lubumbashi',
  },
  {
    label: 'West Africa Time',
    value: 'Africa/Lagos',
  },
  {
    label: 'Africa/Windhoek',
    value: 'Africa/Windhoek',
  },
  {
    label: 'Jordan Time',
    value: 'Asia/Amman',
  },
  {
    label: 'Baghdad, East Africa Time',
    value: 'Asia/Baghdad',
  },
  {
    label: 'Asia/Baku',
    value: 'Asia/Baku',
  },
  {
    label: 'Lebanon Time',
    value: 'Asia/Beirut',
  },
  {
    label: 'Syria Time',
    value: 'Asia/Damascus',
  },
  {
    label: 'Asia/Dhaka',
    value: 'Asia/Dhaka',
  },
  {
    label: 'Dubai Time',
    value: 'Asia/Dubai',
  },
  {
    label: 'Asia/Gaza',
    value: 'Asia/Gaza',
  },
  {
    label: 'Asia/Irkutsk',
    value: 'Asia/Irkutsk',
  },
  {
    label: 'Indochina Time',
    value: 'Asia/Bangkok',
  },
  {
    label: 'Israel Time',
    value: 'Asia/Jerusalem',
  },
  {
    label: 'Kabul Time',
    value: 'Asia/Kabul',
  },
  {
    label: 'Pacific/Majuro',
    value: 'Pacific/Majuro',
  },
  {
    label: 'Pakistan, Maldives Time',
    value: 'Asia/Karachi',
  },
  {
    label: 'Kathmandu Time',
    value: 'Asia/Kathmandu',
  },
  {
    label: 'India, Sri Lanka Time',
    value: 'Asia/Kolkata',
  },
  {
    label: 'Krasnoyarsk Time',
    value: 'Asia/Krasnoyarsk',
  },
  {
    label: 'Asia/Omsk',
    value: 'Asia/Omsk',
  },
  {
    label: 'Asia/Rangoon',
    value: 'Asia/Yangon',
  },
  {
    label: 'China, Singapore, Perth',
    value: 'Asia/Shanghai',
  },
  {
    label: 'Tehran Time',
    value: 'Asia/Tehran',
  },
  {
    label: 'Japan, Korea Time',
    value: 'Asia/Tokyo',
  },
  {
    label: 'Asia/Vladivostok',
    value: 'Asia/Vladivostok',
  },
  {
    label: 'Asia/Yakutsk',
    value: 'Asia/Yakutsk',
  },
  {
    label: 'Yekaterinburg Time',
    value: 'Asia/Yekaterinburg',
  },
  {
    label: 'Asia/Yerevan',
    value: 'Asia/Yerevan',
  },
  {
    label: 'India Standard Time',
    value: 'Asia/Kolkata',
  },
  {
    label: 'Azores Time',
    value: 'Atlantic/Azores',
  },
  {
    label: 'Cape Verde Time',
    value: 'Atlantic/Cape_Verde',
  },
  {
    label: 'Adelaide Time',
    value: 'Australia/Adelaide',
  },
  {
    label: 'Brisbane Time',
    value: 'Australia/Brisbane',
  },
  {
    label: 'Australia/Darwin',
    value: 'Australia/Darwin',
  },
  {
    label: 'Australia/Eucla',
    value: 'Australia/Eucla',
  },
  {
    label: 'Australia/Lord Howe',
    value: 'Australia/Lord_Howe',
  },
  {
    label: 'Australia/Perth',
    value: 'Australia/Perth',
  },
  {
    label: 'Sydney, Melbourne Time',
    value: 'Australia/Sydney',
  },
  {
    label: 'UTC Time',
    value: 'UTC',
  },
  {
    label: 'Central European Time',
    value: 'Europe/Berlin',
  },
  {
    label: 'Eastern European Time',
    value: 'Europe/Athens',
  },
  {
    label: 'UK, Ireland, Lisbon Time',
    value: 'Europe/London',
  },
  {
    label: 'Minsk Time',
    value: 'Europe/Minsk',
  },
  {
    label: 'Moscow Time',
    value: 'Europe/Moscow',
  },
  {
    label: 'Turkey Time',
    value: 'Europe/Istanbul',
  },
  {
    label: 'Pacific/Apia',
    value: 'Pacific/Apia',
  },
  {
    label: 'Auckland Time',
    value: 'Pacific/Auckland',
  },
  {
    label: 'Pacific/Chatham',
    value: 'Pacific/Chatham',
  },
  {
    label: 'Pacific/Easter',
    value: 'Pacific/Easter',
  },
  {
    label: 'Pacific/Fiji',
    value: 'Pacific/Fiji',
  },
  {
    label: 'Pacific/Gambier',
    value: 'Pacific/Gambier',
  },
  {
    label: 'Pacific/Kiritimati',
    value: 'Pacific/Kiritimati',
  },
  {
    label: 'Pacific/Majuro',
    value: 'Pacific/Majuro',
  },
  {
    label: 'Pacific/Marquesas',
    value: 'Pacific/Marquesas',
  },
  {
    label: 'Pacific/Norfolk',
    value: 'Pacific/Norfolk',
  },
  {
    label: 'Pacific/Noumea',
    value: 'Pacific/Noumea',
  },
  {
    label: 'Pacific/Pago Pago',
    value: 'Pacific/Pago_Pago',
  },
  {
    label: 'Pacific/Pitcairn',
    value: 'Pacific/Pitcairn',
  },
  {
    label: 'Pacific/Tarawa',
    value: 'Pacific/Tarawa',
  },
  {
    label: 'Pacific/Tongatapu',
    value: 'Pacific/Tongatapu',
  }
];

export default timeZoneList;