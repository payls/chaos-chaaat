import React, { useState, useEffect } from 'react';
import { Header, Body, Footer } from '../components/Layouts/Layout';
import { h } from '../helpers';
import { useRouter } from 'next/router';
import { routes } from '../configs/routes';
import constant from '../constants/constant.json';

export default function GetStarted() {
  const router = useRouter();

  const buttonStyle = {
    minHeight: 200,
  };
  const buttonClass = 'w-100';
  const buttonSelectedStyle = {
    color: '#fff',
    backgroundColor: '#08443d',
    borderColor: '#08443d',
  };

  const [noneCheckboxValue, setNoneCheckboxValue] = useState(1);
  const [selectedBuyerTypes, setSelectedBuyerTypes] = useState([]);

  useEffect(() => {
    h.route.redirectToHome();
  }, []);

  const handleSubmit = async (buyer_type) => {
    let selectedBuyerTypesCopy = Object.assign([], selectedBuyerTypes);
    setSelectedBuyerTypes([]);
    selectedBuyerTypesCopy = [];
    selectedBuyerTypesCopy.push(buyer_type);
    // if (!selectedBuyerTypesCopy.includes(buyer_type)) selectedBuyerTypesCopy.push(buyer_type);
    // else {
    // 	const inBuyerTypeIndex = selectedBuyerTypesCopy.indexOf(buyer_type);
    // 	selectedBuyerTypesCopy.splice(inBuyerTypeIndex, 1);
    // }
    setSelectedBuyerTypes(selectedBuyerTypesCopy);
    if (h.notEmpty(selectedBuyerTypesCopy)) setNoneCheckboxValue(0);
  };

  return (
    <div>
      <Header title="Get Started" />
      <Body className="pl-4 pr-4">
        <div className="row justify-content-center mt-5">
          <div className="col-12 col-sm-7">
            <h3>
              Which of the following would best describe the motivation behind
              your next property purchase. This helps us best tailor the content
              and properties we prioritise for you.
            </h3>
          </div>
        </div>
        <div className="row justify-content-center mt-3">
          <div className="col-12 col-sm-6 col-md-4 col-lg-6">
            <div className="row justify-content-center">
              <div className="col-12 col-sm-6 col-md-6 mt-3">
                <h.form.CustomButton
                  variant="outline-primary"
                  className={buttonClass}
                  style={Object.assign(
                    {},
                    buttonStyle,
                    selectedBuyerTypes.includes(
                      constant.USER.BUYER_TYPE.INVESTMENT,
                    )
                      ? buttonSelectedStyle
                      : {},
                  )}
                  onClick={() =>
                    handleSubmit(constant.USER.BUYER_TYPE.INVESTMENT)
                  }
                >
                  <h4>Investment</h4>
                </h.form.CustomButton>
              </div>
              <div className="col-12 col-sm-6 col-md-6 mt-3">
                <h.form.CustomButton
                  variant="outline-primary"
                  className={buttonClass}
                  style={Object.assign(
                    {},
                    buttonStyle,
                    selectedBuyerTypes.includes(
                      constant.USER.BUYER_TYPE.LIFESTYLE,
                    )
                      ? buttonSelectedStyle
                      : {},
                  )}
                  onClick={() =>
                    handleSubmit(constant.USER.BUYER_TYPE.LIFESTYLE)
                  }
                >
                  <h4>Lifestyle</h4>
                </h.form.CustomButton>
              </div>
              <div className="col-12 col-sm-6 col-md-6 mt-3">
                <h.form.CustomButton
                  variant="outline-primary"
                  className={buttonClass}
                  style={Object.assign(
                    {},
                    buttonStyle,
                    selectedBuyerTypes.includes(
                      constant.USER.BUYER_TYPE.COLLEGE_ACCOMODATION,
                    )
                      ? buttonSelectedStyle
                      : {},
                  )}
                  onClick={() =>
                    handleSubmit(constant.USER.BUYER_TYPE.COLLEGE_ACCOMODATION)
                  }
                >
                  <h4>College Accomodation</h4>
                </h.form.CustomButton>
              </div>
              <div className="col-12 col-sm-6 col-md-6 mt-3">
                <h.form.CustomButton
                  variant="outline-primary"
                  className={buttonClass}
                  style={Object.assign(
                    {},
                    buttonStyle,
                    selectedBuyerTypes.includes(
                      constant.USER.BUYER_TYPE.INVESTOR_VISA,
                    )
                      ? buttonSelectedStyle
                      : {},
                  )}
                  onClick={() =>
                    handleSubmit(constant.USER.BUYER_TYPE.INVESTOR_VISA)
                  }
                >
                  <h4>Investor Visa</h4>
                </h.form.CustomButton>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center text-center mt-5 mb-5">
          <div className="col-12 col-sm-7">
            <h.form.CustomCheckbox
              label="None of the above. I'm just here to check out the platform for now."
              name="none_checkbox"
              data={{ value: noneCheckboxValue }}
              onChange={() => {
                const newValue = Math.abs(noneCheckboxValue - 1);
                setNoneCheckboxValue(newValue);
                if (h.cmpInt(newValue, 1)) setSelectedBuyerTypes([]);
              }}
            />
            <h.form.CustomButton
              variant="outline-primary"
              className="float-center mt-3"
              onClick={async (e) => {
                e.preventDefault();
                await router.push(
                  h.getRoute(routes.create_account, {
                    buyer_type: h.cmpInt(noneCheckboxValue, 1)
                      ? 'none'
                      : selectedBuyerTypes.join(','),
                  }),
                );
              }}
            >
              Continue
            </h.form.CustomButton>
          </div>
        </div>
      </Body>
      <Footer />
    </div>
  );
}
