import React, { useEffect, useState } from 'react';
import { Accordion, Card } from 'react-bootstrap';
import { h } from '../../helpers';
import { api } from '../../api';
import IconEntypoBarGreen from '../Icons/IconEntypoBarGreen';
import IconEntypoBarOrange from '../Icons/IconEntypoBarOrange';
import IconParkingLot from '../Icons/IconParkingLot';
import IconDirectionFacing from '../Icons/IconDirectionFacing';
import IconBlackShare from '../Icons/IconBlackShare';
import IconBlackHeart from '../Icons/IconBlackHeart';
import IconTabItemArrowUp from '../Icons/IconTabItemArrowUp';
import IconTabItemArrowDown from '../Icons/IconTabItemArrowDown';
import CopyToClipboard from 'react-copy-to-clipboard';
import Carousel from '../../components/Common/Carousel';
import SignUpModal from '../../components/SignUp/SignUpModal';
import IconFilledBlackHeart from '../Icons/IconFilledBlackHeart';

export default function ProjectAvailableUnitDetails(props) {
  const { project, units } = props;
  const [activeProperty, setActiveProperty] = useState(false);
  const [isPropertySaved, setIsPropertySaved] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const project_slug = project && project.slug ? project.slug : '';

  const [showSignUpModal, setShowSignUpModal] = useState(false);

  useEffect(() => {
    if (currentIndex) {
      setIsPropertySaved(false);
      fetchProperty();
    }
  }, [currentIndex]);

  const fetchProperty = async () => {
    if (h.auth.isAuthenticated()) {
      const property_id = units[currentIndex].property_id;
      if (property_id && currentIndex) {
        const apiResponse = await api.userSavedProperty.findOne(
          { property_fk: property_id },
          false,
        );
        if (
          h.cmpStr(apiResponse.status, 'ok') &&
          h.notEmpty(apiResponse.data.user_saved_property)
        ) {
          setIsPropertySaved(true);
        }
      }
    }
  };

  const saveProperty = async (property_id) => {
    if (isPropertySaved) {
      const apiResponse = await api.userSavedProperty.destroy(
        { property_fk: property_id },
        false,
      );
      if (h.cmpStr(apiResponse.status, 'ok')) {
        h.general.alert('success', {
          message: 'Property unsaved successfully',
          autoCloseInSecs: 2,
        });
        setIsPropertySaved(false);
      } else {
        h.general.alert('error', {
          message: 'Error when trying to unsave property',
          autoCloseInSecs: 2,
        });
      }
    } else {
      const apiResponse = await api.userSavedProperty.create(
        { property_fk: property_id },
        false,
      );
      if (h.cmpStr(apiResponse.status, 'ok')) {
        h.general.alert('success', {
          message: 'Property saved successfully',
          autoCloseInSecs: 2,
        });
        setIsPropertySaved(true);
      } else {
        h.general.alert('error', {
          message: 'Error when trying to save property',
          autoCloseInSecs: 2,
        });
      }
    }
  };

  const handleSavePropertyOnButtonClick = async (property_id) => {
    setActiveProperty(property_id);
    if (h.auth.isAuthenticated()) {
      await saveProperty(property_id);
    } else {
      setShowSignUpModal(true);
    }
  };

  const handleSavePropertyAfterLogin = async () => {
    setShowSignUpModal(false);
    await saveProperty(activeProperty);
  };

  const getRentalYield = (numOfBed, rental_yield) => {
    if (h.cmpStr(project_slug, 'yarra-one')) {
      switch (numOfBed) {
        case 1:
          return 5.5;
        case 2:
          return 4.0;
        case 3:
          return 4.0;
        default:
          return 4.0;
      }
    } else {
      return rental_yield;
    }
  };

  return (
    <>
      {showSignUpModal && (
        <SignUpModal
          showModal={showSignUpModal}
          handleCloseModal={() => setShowSignUpModal(false)}
          onSuccessfullyLogin={handleSavePropertyAfterLogin}
        />
      )}
      <div>
        <div className="container h-100 mt-5" style={{ color: '#1c1c1c' }}>
          {h.notEmpty(units) && (
            <Accordion
              defaultActiveKey="0"
              onSelect={(e) => setCurrentIndex(e)}
            >
              <div className="row justify-content-center">
                {units.map((data, index) => {
                  return (
                    <div className="col-12" key={`${index}`}>
                      <Card className="available-units-card">
                        <Accordion.Toggle
                          as={Card.Header}
                          eventKey={`${index}`}
                          style={{ height: '80px' }}
                        >
                          <div className="row mt-3">
                            <div className="col-10 col-sm-10 col-md-10 col-lg-8 col-xl-8 text-left">
                              <div className="row mt-1 mb-1">
                                <span className="col-3 col-sm-3">
                                  <p className="available-units-header-stats">
                                    {data.floor}
                                  </p>
                                  <p className="available-units-header-text ml-2">
                                    {' '}
                                    floor
                                  </p>
                                </span>
                                <span className="col-3 col-sm-3">
                                  <p className="available-units-header-stats">
                                    {data.sqm}
                                  </p>
                                  <p className="available-units-header-text ml-2">
                                    {' '}
                                    sqm
                                  </p>
                                </span>
                                <span className="col-3 col-sm-3">
                                  <p className="available-units-header-stats">
                                    {data.bed}
                                  </p>
                                  <p className="available-units-header-text ml-2">
                                    {' '}
                                    bed
                                  </p>
                                </span>
                                <span className="col-3 col-sm-3">
                                  <p className="available-units-header-stats">
                                    {data.bath}
                                  </p>
                                  <p className="available-units-header-text ml-2">
                                    {' '}
                                    bath
                                  </p>
                                </span>
                              </div>
                            </div>
                            <div
                              className="col-2 col-sm-2 col-md-2 col-lg-4 col-xl-4 text-right"
                              style={{
                                marginTop: h.cmpStr(currentIndex, index)
                                  ? '1rem'
                                  : 0,
                              }}
                            >
                              {h.cmpStr(currentIndex, index) ? (
                                <IconTabItemArrowUp />
                              ) : (
                                <IconTabItemArrowDown />
                              )}
                            </div>
                          </div>
                        </Accordion.Toggle>

                        <Accordion.Collapse
                          onSelect={() => console.log('')}
                          eventKey={`${index}`}
                        >
                          <Card.Body>
                            <div className="row pb-5">
                              <div className="col-12 col-lg-6">
                                {h.notEmpty(data.images) && (
                                  <Carousel
                                    isProjectUnit
                                    items={data.images.map((img) => {
                                      return { src: img, alt: '' };
                                    })}
                                  />
                                )}
                                {/*{h.notEmpty(data.images) &&*/}
                                {/*<Carousel*/}
                                {/*    controls={false}*/}
                                {/*    className="available-units-carousel"*/}
                                {/*    interval={null}*/}
                                {/*    nextLabel={"Next"}*/}
                                {/*    prevLabel={"Previous"}*/}
                                {/*>*/}
                                {/*	{data.images.map((image) => {*/}
                                {/*		return <Carousel.Item>*/}
                                {/*			<img className="d-block w-100" src={image}/>*/}
                                {/*		</Carousel.Item>*/}
                                {/*	})}*/}
                                {/*</Carousel>}*/}
                              </div>

                              <div
                                className="col-12 col-lg-6 pt-5"
                                style={{ color: '#1c1c1c' }}
                              >
                                {/* <div className="row mb-3">
                                                                <div className="col"> */}
                                {/* { isPropertySaved ? <IconFilledBlackHeart style={{cursor: 'pointer', maxWidth: 20}} alt="Black Heart Icon" onClick={ async () => {
                                                                        await handleSavePropertyOnButtonClick(data.property_id)}} />  : <IconBlackHeart style={{cursor: 'pointer', maxWidth: 20}} alt="Black Heart Icon" onClick={ async () => {
                                                                        await handleSavePropertyOnButtonClick(data.property_id) }
                                                                    }/> } */}
                                {/*<CopyToClipboard*/}
                                {/*	onCopy={() => h.general.alert('success', `Copied ${project.name} Link`)}*/}
                                {/*	text={window.location.href}>*/}
                                {/*	<IconBlackShare style={{maxWidth: 20}} alt="Black Share Icon"/>*/}
                                {/*</CopyToClipboard>*/}
                                {/* <IconMessageSquareEdit className="ml-3" style={{maxWidth:20}} alt="Edit Icon"/> */}
                                {/* </div>
                                                            </div> */}
                                {/* <div className="row">
                                                                <div className="col">
                                                                    <IconInfoCircleFilled className="mr-2" style={{maxWidth: 20}}/>
                                                                    <span style={{color: "#DADADA"}}>Save this property to learn and access live chat with a cunsultant</span>
                                                                </div>
                                                            </div> */}
                                <div className="row text-left no-gutters">
                                  <div className="col-12 col-sm-12 col-md-4 col-xl-3">
                                    <p className="mb-0 number-stats">
                                      {data.floor}
                                    </p>
                                    <p className="pricing-stats">floor</p>
                                  </div>
                                  <div className="col-12 col-sm-12 col-md-4 col-xl-3">
                                    <p className="mb-0 number-stats">
                                      {h.currency.format(data.sqm, 1)}
                                    </p>
                                    <p className="pricing-stats">sqm</p>
                                  </div>
                                  <div className="col-12 col-sm-12 col-md-4 col-xl-3">
                                    <p className="mb-0 number-stats">
                                      {data.bed}
                                    </p>
                                    <p className="pricing-stats">bed</p>
                                  </div>
                                </div>

                                <div className="row">
                                  <div className="col-12 col-sm-6 col-md-12 col-lg-6">
                                    <IconEntypoBarOrange alt="Start Price Icon" />
                                    <p
                                      className="mb-0 ml-2 pricing-stats"
                                      style={{ color: '#F2C4AB' }}
                                    >
                                      {data.currency}{' '}
                                      {h.currency.format(data.start_price, 0)}
                                    </p>
                                    <p className="stats-description">price</p>
                                  </div>
                                </div>
                                <div className="row">
                                  {/*{!h.cmpStr(project_slug, 'yarra-one') &&*/}
                                  {/*<div className="col-6 col-sm-4 col-md-4 col-lg-4">*/}
                                  {/*    <div>*/}
                                  {/*        <IconEntypoBarGreen alt="Annual Rent Icon"/>*/}
                                  {/*        <p className="mb-0 ml-2 pricing-stats" style={{color:'#ADC7A6'}}>{h.currency.format(data.weekly_rent, 0)}</p>*/}
                                  {/*    </div>*/}
                                  {/*    <p className="stats-description">weekly rent</p>*/}
                                  {/*</div>}*/}
                                  <div className="col-12">
                                    <p
                                      className="mb-0 pricing-stats"
                                      style={{ color: '#ADC7A6' }}
                                    >
                                      {h.currency.format(
                                        getRentalYield(
                                          data.bed,
                                          data.rental_yield,
                                        ),
                                        1,
                                      )}
                                      %
                                    </p>
                                    <p className="stats-description">
                                      forecast rental yield
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  {!h.isEmpty(data.direction_facing) && (
                                    <div>
                                      <IconDirectionFacing
                                        style={{ maxWidth: 20 }}
                                        alt="Direction Icon"
                                      />
                                      <p className="amenities-stats ml-2">
                                        facing {data.direction_facing}
                                      </p>
                                    </div>
                                  )}

                                  <div>
                                    <IconParkingLot
                                      style={{ maxWidth: 20 }}
                                      alt="Parking Lots Icon"
                                    />
                                    <p className="amenities-stats ml-2">
                                      /{data.parking_lots} parking lots
                                    </p>
                                  </div>
                                </div>

                                <div className="row mb-3">
                                  <div className="col">{data.unit_info}</div>
                                </div>
                              </div>
                            </div>
                          </Card.Body>
                        </Accordion.Collapse>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </Accordion>
          )}
        </div>
      </div>
    </>
  );
}
