import React from 'react';
import { Card } from 'react-bootstrap';
import { h } from '../../helpers';

import Carousel from '../Common/Carousel';
import IconBlackShare from '../Icons/IconBlackShare';
import IconEntypoBarGreen from '../Icons/IconEntypoBarGreen';
import IconEntypoBarOrange from '../Icons/IconEntypoBarOrange';
import IconDirectionFacing from '../Icons/IconDirectionFacing';
import IconParkingLot from '../Icons/IconParkingLot';
import IconMessageSquareEdit from '../Icons/IconMessageSquareEdit';
import IconOrangeHeart from '../Icons/IconOrangeHeart';

/**
 * Saved properties cards
 * @returns {JSX.Element}
 * @constructor
 */
export default function SavedPropertyCards(props) {
  const { savedProperties } = props;

  return (
    <>
      {!h.isEmpty(savedProperties)
        ? savedProperties.map((card, index) => {
            const getRentalYield = (numOfBed, rental_yield) => {
              if (h.cmpStr(card.project.project_slug, 'yarra-one')) {
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
              <div className="row h-100" key={index}>
                <Card
                  className="col-12 mt-4 mb-5 your-properties-card"
                  key={index}
                >
                  <Card.Title className="row mt-2">
                    <div className="col-12 text-left mt-2 your-properties-card-header">
                      <h4 className="mb-0 pl-4">{card.project.name}</h4>
                      <a className="pl-4" href="" style={{ fontSize: '10px' }}>
                        {card.project.location.address}
                      </a>
                    </div>
                  </Card.Title>
                  <Card.Body>
                    <div className="row pb-5">
                      <div className="col-12 col-lg-6">
                        {h.notEmpty(card.images) && (
                          <Carousel
                            isProjectUnit
                            items={card.images.map((img) => {
                              return { src: img, alt: '' };
                            })}
                          />
                        )}
                      </div>

                      <div
                        className="col-12 col-lg-6 pt-5"
                        style={{ color: '#1c1c1c' }}
                      >
                        <div className="row mb-3">
                          <div className="col">
                            <IconOrangeHeart
                              style={{ maxWidth: 20 }}
                              alt="Orange Heart Icon"
                            />
                            <IconBlackShare
                              className="ml-3"
                              style={{ maxWidth: 20 }}
                              alt="Black Share Icon"
                            />
                            <IconMessageSquareEdit
                              className="ml-3"
                              style={{ maxWidth: 20 }}
                              alt="Edit Icon"
                            />
                          </div>
                        </div>
                        <div className="row text-left no-gutters">
                          <div className="col-12 col-sm-12 col-md-4 col-xl-3">
                            <p className="mb-0 number-stats">{card.floor}</p>
                            <p className="pricing-stats">floor</p>
                          </div>
                          <div className="col-12 col-sm-12 col-md-4 col-xl-3">
                            <p className="mb-0 number-stats">
                              {h.currency.format(card.sqm, 1)}
                            </p>
                            <p className="pricing-stats">sqm</p>
                          </div>
                          <div className="col-12 col-sm-12 col-md-4 col-xl-3">
                            <p className="mb-0 number-stats">{card.bed}</p>
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
                              {card.currency}{' '}
                              {h.currency.format(card.start_price, 0)}
                            </p>
                            <p className="stats-description">price</p>
                          </div>
                        </div>
                        <div className="row">
                          {/*{!h.cmpStr(card.project.project_slug, 'yarra-one') &&*/}
                          {/*<div className="col-6 col-sm-4 col-md-4 col-lg-4">*/}
                          {/*    <div>*/}
                          {/*        <IconEntypoBarGreen alt="Annual Rent Icon"/>*/}
                          {/*        <p className="mb-0 ml-2 pricing-stats" style={{color:'#ADC7A6'}}>{h.currency.format(card.weekly_rent, 0)}</p>*/}
                          {/*    </div>*/}
                          {/*    <p className="stats-description">weekly rent</p>*/}
                          {/*</div>}*/}
                          <div className="col-12">
                            <p
                              className="mb-0 pricing-stats"
                              style={{ color: '#ADC7A6' }}
                            >
                              {h.currency.format(
                                getRentalYield(card.bed, card.rental_yield),
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
                          {!h.isEmpty(card.direction_facing) && (
                            <div>
                              <IconDirectionFacing
                                style={{ maxWidth: 20 }}
                                alt="Direction Icon"
                              />
                              <p className="amenities-stats ml-2">
                                facing {card.direction_facing}
                              </p>
                            </div>
                          )}

                          <div>
                            <IconParkingLot
                              style={{ maxWidth: 20 }}
                              alt="Parking Lots Icon"
                            />
                            <p className="amenities-stats ml-2">
                              /{card.parking_lots} parking lots
                            </p>
                          </div>
                        </div>
                        <div className="row mb-3">
                          <div className="col">{card.unit_info}</div>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                  <Card.Footer
                    className="mb-3"
                    style={{ borderTop: 'none', background: 'none' }}
                  ></Card.Footer>
                </Card>
              </div>
            );
          })
        : ''}
    </>
  );
}
