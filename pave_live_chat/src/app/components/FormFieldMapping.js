'use client';
import React from 'react';
import h from '../services/helpers';
import countryCodes from '../services/countryCodes';

import Select from 'react-select';

export default function FormFieldMapping({
  fieldConfig,
  setUser,
  setSelectedCountryCode,
  setTOC,
  showError,
  user,
  style,
  lang,
  step,
  products,
  cities,
  terms,
  countryCode,
  toc = () => {},
  mappedTo = () => {},
}) {
  function fieldValidationClass(field, mapped, value) {
    switch (field) {
      case 'Email Address':
        return showError && !h.validateEmail(value) ? 'error' : '';
      case 'Phone Number':
        return showError && h.validatePhone(user.phone, countryCode)
          ? 'error'
          : '';
      default:
        return (showError && user[mapped] === '') ||
          (!h.validateName(user[mapped]) && user[mapped] !== '')
          ? 'error'
          : '';
    }
  }

  function mappedType(field) {
    switch (field) {
      case 'Email Address':
        return 'email';
      default:
        return 'text';
    }
  }
  return (
    <>
      {step === 1 && (
        <>
          {fieldConfig
            .filter((f) =>
              [
                'First Name',
                'Last Name',
                'Email Address',
                'Phone Number',
              ].includes(f.label),
            )
            .map((field, i) => {
              const mapped = mappedTo(field.label);
              return field.required ? (
                <>
                  <label style={{ color: style.textColor }}>
                    {h.translate(field.label, lang)}
                    {field.required && <span>*</span>}
                  </label>
                  {field.label === 'Phone Number' && (
                    <div className="wpre">
                      <Select
                        defaultValue={{ label: `🇸🇬 SG +65`, value: '+65' }}
                        components={{
                          IndicatorSeparator: () => null,
                        }}
                        value={countryCodes
                          .map((cc, i) => ({
                            value: cc.dial_code,
                            label: `${cc.flag} ${cc.code} ${cc.dial_code}`,
                          }))
                          .find((c) => c.value === countryCode)}
                        options={countryCodes.map((cc, i) => ({
                          value: cc.dial_code,
                          label: `${cc.flag} ${cc.code} ${cc.dial_code}`,
                        }))}
                        onChange={(e) => {
                          setSelectedCountryCode(e.value);
                        }}
                        className="select"
                      />
                      <input
                        type={mappedType(field.label)}
                        placeholder={`${h.translate(
                          `Enter your ${field.label}`,
                          lang,
                        )}`}
                        value={user.phone}
                        className={fieldValidationClass(
                          field.label,
                          mapped,
                          user[mapped],
                        )}
                        style={{
                          color: style.inputBoxTextColor,
                          backgroundColor: style.inputBoxBgColor,
                        }}
                        onChange={(e) => {
                          if (/^[0-9]+$/.test(e.target.value)) {
                            setUser({ ...user, phone: e.target.value });
                          }
                        }}
                      />
                    </div>
                  )}
                  {field.label !== 'Phone Number' && (
                    <input
                      type={mappedType(field.label)}
                      placeholder={`${h.translate(
                        `Enter your ${field.label}`,
                        lang,
                      )}`}
                      value={user[mapped]}
                      className={fieldValidationClass(
                        field.label,
                        mapped,
                        user[mapped],
                      )}
                      style={{
                        color: style.inputBoxTextColor,
                        backgroundColor: style.inputBoxBgColor,
                      }}
                      onChange={(e) =>
                        setUser({ ...user, [mapped]: e.target.value })
                      }
                    />
                  )}
                </>
              ) : (
                ''
              );
            })}
        </>
      )}
      {step === 2 && (
        <>
          {fieldConfig
            .filter((f) =>
              ['Interested Product', 'Interested City'].includes(f.label),
            )
            .map((field, i) => {
              const mapped = mappedTo(field.label);
              return field.required ? (
                <>
                  <label style={{ color: style.textColor }}>
                    {h.translate(field.label, lang)}
                    {field.required && <span>*</span>}
                  </label>

                  {field.label === 'Interested Product' && (
                    <select
                      value={user[mapped]}
                      className={`${
                        showError && user[mapped] === '' ? 'error' : ''
                      }`}
                      onChange={(e) =>
                        setUser({ ...user, [mapped]: e.target.value })
                      }
                      style={{
                        color: style.inputBoxTextColor,
                        backgroundColor: style.inputBoxBgColor,
                      }}
                    >
                      <option>{h.translate('Select Product', lang)}</option>
                      {products.map((product, i) => (
                        <option value={product.value} key={i}>
                          {h.translate(product.label, lang)}
                        </option>
                      ))}
                    </select>
                  )}

                  {field.label === 'Interested City' && (
                    <select
                      value={user[mapped]}
                      className={`${
                        showError && user[mapped] === '' ? 'error' : ''
                      }`}
                      onChange={(e) =>
                        setUser({ ...user, [mapped]: e.target.value })
                      }
                      style={{
                        color: style.inputBoxTextColor,
                        backgroundColor: style.inputBoxBgColor,
                      }}
                    >
                      <option>{h.translate('Select City', lang)}</option>
                      {cities.map((city, i) => (
                        <option value={city.sf_city_id} key={i}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  )}
                </>
              ) : (
                ''
              );
            })}

          {fieldConfig
            .filter((f) =>
              ['Terms and Conditions', 'Allow Marketing Email'].includes(
                f.label,
              ),
            )
            .map((field, i) => {
              return field.required ? (
                <>
                  {field.label === 'Allow Marketing Email' && (
                    <div className="cbox">
                      <div>
                        <input
                          type="checkbox"
                          onClick={() => {
                            setUser({ ...user, marketing: !user.marketing });
                          }}
                          checked={user.marketing}
                        />
                      </div>
                      <span style={{ color: style.textColor }}>
                        {h.translate(
                          'Please send me special offers, exclusive invites and more.',
                          lang,
                        )}
                      </span>
                    </div>
                  )}

                  {field.label === 'Terms and Conditions' && (
                    <div className="cbox">
                      <div>
                        <input
                          type="checkbox"
                          onClick={() => {
                            setTOC(!terms);
                          }}
                          checked={terms}
                        />
                      </div>
                      <span
                        style={{ color: style.textColor }}
                        dangerouslySetInnerHTML={{
                          __html: toc(),
                        }}
                      ></span>
                    </div>
                  )}
                </>
              ) : (
                ''
              );
            })}
        </>
      )}
    </>
  );
}
