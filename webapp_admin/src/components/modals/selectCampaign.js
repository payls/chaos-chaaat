import { Header, Body, Footer } from '../Layouts/Layout';

export default function SelectCampaign({ isOpen, onClose, onSelectCampaignType, selectedCampaignType }) {

  if (!isOpen) {
    return null;
  }

  const handleCategoryClick = (campaignType) => {
    onSelectCampaignType(campaignType);
  };

  return (
    <div
      className="contacts-root layout-v"
      style={{ height: '100%', background: '#fff' }}
    >
      <Header className="common-navbar-header" />
      <Body>
        <div className="n-banner">
          <div className="container dashboard-contacts-container contacts-container">
            <div className="mb-2 contacts-title d-flex justify-content-between pt-3 pb-3">
              <div>
                <h1>Campaign</h1>
              </div>
            </div>
          </div>
        </div>
        <div style={{ background: '#FAFAFA', height: '100%' }} className="pt-5">
          <div
            style={{
              textAlign: 'center',
              fontFamily: 'PoppinsBold',
              fontSize: '40px',
            }}
          >
            launching a campaign that
            <br /> makes a difference
          </div>

          <div
            className="d-flex justify-content-center mt-5"
            style={{ gap: '3em' }}
          >
            <div
              style={{
                background: '#CFF1ED',
                height: '250px',
                width: '500px',
                padding: '60px',
              }}
            >
              <div
                style={{
                  background: '#fff',
                  width: '100%',
                  height: '420px',
                  padding: '30px',
                }}
              >
                <h3
                  style={{
                    fontFamily: 'PoppinsSemiBold',
                    color: 'var(--off-black)',
                    fontSize: '18px',
                  }}
                  className="mb-3"
                >
                  Templates
                </h3>
                <p
                  style={{
                    fontFamily: 'PoppinsLight',
                    color: 'gray',
                    fontSize: '16px',
                    height: '50px',
                  }}
                  className="mb-5"
                >
                  Launch a campaign in minutes
                </p>
                <div
                  style={{
                    background: '#CFF1ED',
                    padding: '20px',
                    width: '100%',
                    textAlign: 'center',
                  }}
                >
                  <img src="../../assets/images/campaigns/templates.svg" />
                </div>
                <div
                  style={{
                    textAlign: 'center',
                  }}
                >
                  <button
                    className="chaaat-lgtBlue-button more-round"
                    style={{
                      padding: '20px 40px',
                      border: '1px solid #4096EE',
                      color: '#4096EE',
                      backgroundColor: 'white',
                      marginTop: '45px',
                    }}
                    type="button"
                    onClick={() => handleCategoryClick('templates')}
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
            <div
              style={{
                background: '#C8DBF0',
                height: '250px',
                width: '500px',
                padding: '60px',
              }}
            >
              <div
                style={{
                  background: '#fff',
                  width: '100%',
                  height: '420px',
                  padding: '30px',
                }}
              >
                <h3
                  style={{
                    fontFamily: 'PoppinsSemiBold',
                    color: 'var(--off-black)',
                    fontSize: '18px',
                  }}
                  className="mb-3"
                >
                  Automation
                </h3>
                <p
                  style={{
                    fontFamily: 'PoppinsLight',
                    color: 'gray',
                    fontSize: '16px',
                    height: '50px',
                  }}
                  className="mb-5"
                >
                  Set up automations that personalize your marketing and
                  save you time
                </p>
                <div
                  style={{
                    background: '#C8DBF0',
                    padding: '20px',
                    width: '100%',
                    textAlign: 'center',
                  }}
                >
                  <img src="../../assets/images/campaigns/automation.svg" />
                </div>
                <div
                  style={{
                    textAlign: 'center',
                  }}
                >
                  <button
                    className="chaaat-lgtBlue-button more-round"
                    style={{
                      padding: '20px 40px',
                      border: '1px solid #4096EE',
                      color: '#4096EE',
                      backgroundColor: 'white',
                      marginTop: '45px',
                    }}
                    type="button"
                    onClick={() => handleCategoryClick('automation')}
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Body>
      <Footer />
    </div>
  );
}