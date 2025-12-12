const dashboardStyle = {
  bannerHeader: {
    textAlign: 'center',
    fontFamily: 'Outfit',
    fontSize: '40px',
    fontStyle: 'normal',
    fontWeight: '700',
    margin: '20px',
  },

  bannerSubHeader: {
    textAlign: 'center',
    fontFamily: 'PoppinsSemiBold',
    fontSize: '20px',
    fontStyle: 'normal',
    fontWeight: '700',
    margin: '20px',
  },

  subLine: {
    color: 'var(--gray-text-2)',
    textAlign: 'center',
    fontFamily: 'Montserrat',
    fontSize: '16px',
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 'normal',
    margin: '0px',
  },

  connectBtn: {
    fontFamily: 'Montserrat',
    fontSize: '16px',
    fontStyle: 'normal',
    fontWeight: '400',
    background:
      'linear-gradient(73deg, #29F2BC -79.22%, #4877FF 49.7%, #F945B3 178.62%)',
    borderRadius: '12px',
    border: 'none',
    padding: '10px 34px',
    color: '#ffffff',
    textTransform: 'normal',
    border: 'none',
    transition: '0.3s',
  },

  bannerWrapper: {
    borderRadius: '44px',
    height: '621px',
  },

  bannerWrapperHidden: {
    display: 'none',
  },

  bannerContent: {
    borderRadius: '43px',
  },

  methodOption: {
    borderRadius: '25px',
    background: '#FFF',
    padding: '22px',
    width: '404px',
    marginTop: '56px',
    marginBottom: '50px',
    boxShadow: '0px 4px 15px 0px #f6f6f6',
    zIndex: 1,
  },

  methodHeader: {
    color: 'var(--off-black)',
    fontFamily: 'PoppinsRegular',
    fontSize: '16px',
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: 'normal',
    marginTop: '23px',
  },

  methodDescription: {
    color: 'var(--helper-text)',
    fontFamily: 'Montserrat',
    fontSize: '16px',
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 'normal',
    height: '70px',
    marginBottom: '34px',
  },

  upgradeBtn: {
    borderRadius: '12px',
    border: 'none',
    background:
      'linear-gradient(73deg,#29f2bc -79.22%,#4877ff 49.7%, #f945b3 178.62%)',
    color: '#fff',
    fontFamily: 'Montserrat',
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: 'normal',
    padding: '15px 22px',
    width: '209px',
    marginBottom: '10px',
    textAlign: 'center',
    transition: '0.3s',
  },

  header: {
    borderBottom: '1px solid #E0E0E0',
    padding: '23px 30px',
    marginBottom: '25px',
  },

  activeCount: {
    color: '#646464',
    fontFamily: 'Montserrat',
    fontSize: '16px',
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: 'normal',
  },

  totalCount: {
    color: 'var(--off-black)',
    fontFamily: 'Montserrat',
    fontSize: '16px',
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: 'normal',
  },

  daysLeft: {
    color: 'var(--off-black)',
    fontFamily: 'Poppins',
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: 'normal',
    position: 'absolute',
  },
};

export default dashboardStyle;
