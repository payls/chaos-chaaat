import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import Papa from 'papaparse';
import { Header, Body, Footer } from '../../../../components/Layouts/Layout';
import { h } from '../../../../helpers';
import { api } from '../../../../api';
import constant from '../../../../constants/constant.json';
import { routes } from '../../../../configs/routes';
import Swal from 'sweetalert2';
// ICON
import {
  faPlus,
  faInfo,
  faUsers,
  faTrash,
  faSave,
  faFileUpload,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Components
import CommonResponsiveTable from '../../../../components/Common/CommonResponsiveTable';
import IconWhatsApp from '../../../../components/ProposalTemplate/Link/preview/components/Icons/IconWhatsApp';
import IconSMS from '../../../../components/ProposalTemplate/Link/preview/components/Icons/IconSMS';
import IconComments from '../../../../components/ProposalTemplate/Link/preview/components/Icons/IconComments';
import CommonDropdownActions from '../../../../components/Common/CommonDrodownAction';
import CommonTooltip from '../../../../components/Common/CommonTooltip';
import EditField from '../../../dashboard/messaging/EditField';
import CommonSelect from '../../../../components/Common/CommonSelect';
import CommonSearchInput from '../../../../components/Sale/Link/preview/components/Common/CommonSearchInput';

const inputStyle = {
  height: '40px',
  borderColor: '#c5c5c5',
};

const COUNTRIES = [
  { label: 'Australia', value: 'AU' },
  { label: 'Hong Kong', value: 'HK' },
  { label: 'Malaysia', value: 'MY' },
  { label: 'Singapore', value: 'SG' },
  { label: 'United Kingdom', value: 'UK' },
];
let agencyUsersList = [];

export default function CampaignTemplateList() {
  const router = useRouter();
  const { list } = router.query;
  const fileRef = useRef(null);
  const [isLoading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [tempData, setTempData] = useState([]);
  const [listingPageIndex, setListingPageIndex] = useState(0);
  const [searchText, setSearchText] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [agencyUsers, setAgencyUsers] = useState([]);
  const [agencyId, setAgencyId] = useState(null);

  useEffect(() => {
    //Fetch list of agency users
    (async () => {
      const apiRes = await api.agencyUser.getCurrentUserAgency({}, false);
      if (h.cmpStr(apiRes.status, 'ok')) {
        const agencyUsersRes = await api.agencyUser.getAgencyUsers(
          { agency_fk: apiRes.data.agencyUser.agency_fk },
          false,
        );
        agencyUsersList = await handleOptionList(
          agencyUsersRes.data.agency_users,
        );
        setAgencyId(apiRes.data.agencyUser.agency.agency_id);
      }
    })();
  }, [list]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const newData = [...tempData];

      for (let i = 0; i < newData.length; i++) {
        const owner = newData[i].contact_owner;
        if (owner) {
          const lowerCaseOwner = owner.toLowerCase();
          for (const item of agencyUsersList) {
            const lowercaseLabel = item.label.toLowerCase();
            if (lowercaseLabel === lowerCaseOwner) {
              newData[i].contact_owner = item.value;
              break; // Exit the loop if a match is found
            }
          }
        }
      }

      setData(newData);
      setTimeout(() => {
        setListingPageIndex(0);
        setLoading(false);
      }, 25);
    })();
  }, [tempData]);

  // Validate records - mobile
  useEffect(() => {
    if (h.notEmpty(selectedCountry)) {
      setLoading(true);
      const newData = [...tempData];

      for (let i = 0; i < newData.length; i++) {
        const nameValidationResponse = nameChecking(
          newData[i].first_name,
          newData[i].last_name,
        );

        newData[i] = {
          ...newData[i],
          ...nameValidationResponse,
        };
        const phoneValidationResponse = phoneNumberChecking(
          newData[i].phone_number,
          selectedCountry.value,
        );
        newData[i] = {
          ...newData[i],
          ...phoneValidationResponse,
        };
      }

      setData(
        newData.sort((a, b) => {
          if (a.phone_changed === 1 && b.phone_changed !== 1) {
            return -1;
          } else if (a.phone_changed !== 1 && b.phone_changed === 1) {
            return 1;
          }

          return 0;
        }),
      );
      setTimeout(() => {
        setListingPageIndex(0);
        setLoading(false);
      }, 25);
    }
  }, [selectedCountry]);

  const handleOptionList = async (agencyUsersList) => {
    let options = [];
    agencyUsersList.forEach((agencyUser) => {
      let details = {};
      details.value = agencyUser.agency_user_id;
      details.label = agencyUser.user.full_name;
      options.push(details);
    });
    return options;
  };

  const getContactOwner = async (contact_owner) => {
    const apiRes = await api.agencyUser.getAgencyUserByUserFullName(
      contact_owner,
      false,
    );
    if (h.cmpStr(apiRes.status, 'ok')) {
      return apiRes?.data?.agencyUser?.agency_user_id;
    }
  };

  function updateField(
    index,
    newText,
    type,
    rowData,
    pageIndex,
    options = { country: null },
  ) {
    const { country } = options;
    const newData = [...rowData];
    if (type === 'phone_number') {
      if (h.notEmpty(country)) {
        const phoneValidationResponse = phoneNumberChecking(newText, country);
        newData[index] = {
          ...newData[index],
          ...phoneValidationResponse,
          phone_changed: 2,
        };
      } else {
        newData[index][type] = newText;
      }
    } else {
      newData[index][type] = newText;
    }
    setListingPageIndex(pageIndex);
    setData(newData);
  }

  function replaceSpecialChars(input) {
    const pattern = /[.\-,:/]/g;
    if (!h.isEmpty(input)) {
      return input.replace(pattern, '');
    } else {
      return input;
    }
  }

  function nameChecking(first_name, last_name) {
    const response = {
      old_first_name: first_name,
      first_name: first_name,
      first_name_changed: 0,
      old_last_name: last_name,
      last_name: last_name,
      last_name_changed: 0,
    };

    const contact_first_name = replaceSpecialChars(first_name);
    const contact_last_name = replaceSpecialChars(last_name);
    const name_adjustment = h.whatsApp.nameChecker(
      contact_first_name,
      contact_last_name,
    );

    response.first_name_changed = h.cmpStr(
      first_name,
      name_adjustment.adjusted_first_name,
    )
      ? 0
      : 1;
    response.first_name = name_adjustment.adjusted_first_name;

    response.last_name_changed = h.cmpStr(
      last_name,
      name_adjustment.adjusted_last_name,
    )
      ? 0
      : 1;
    response.last_name = name_adjustment.adjusted_last_name;

    return response;
  }

  function phoneNumberChecking(number, country) {
    const response = {
      old_phone_number: number,
      phone_number: number,
      phone_changed: 0,
      country,
    };

    const phone_number = number ? number.replace(' ', '') : number;
    let adjusted_mobile_number = '';
    switch (country) {
      case 'SG':
        adjusted_mobile_number = h.whatsApp.mobileNumberCheckerSG(phone_number);
        break;
      case 'HK':
        adjusted_mobile_number = h.whatsApp.mobileNumberCheckerHK(phone_number);
        break;
      case 'AU':
        adjusted_mobile_number = h.whatsApp.mobileNumberCheckerAU(phone_number);
        break;
      case 'MY':
        adjusted_mobile_number = h.whatsApp.mobileNumberCheckerMY(phone_number);
      case 'UK':
        adjusted_mobile_number = h.whatsApp.mobileNumberCheckerMY(phone_number);
        break;
      default:
        break;
    }

    response.old_phone_number = phone_number;
    response.phone_changed = h.cmpStr(phone_number, adjusted_mobile_number)
      ? 0
      : 1;
    response.phone_number = adjusted_mobile_number;

    return response;
  }

  function uploadCheckingStat() {
    const allDataCount = data.length;
    const noChangeCount = data.filter((f) => f.phone_changed === 0).length;
    const changeCount = data.filter(
      (f) => f.phone_changed === 1 || f.phone_changed === 2,
    ).length;
    const noFirstNameChangeCount = data.filter(
      (f) => f.first_name_changed === 0,
    ).length;
    const noLastNameChangeCount = data.filter(
      (f) => f.last_name_changed === 0,
    ).length;
    const firstNameChangeCount = data.filter(
      (f) => f.first_name_changed === 1 || f.first_name_changed === 2,
    ).length;
    const lastNameChangeCount = data.filter(
      (f) => f.last_name_changed === 1 || f.last_name_changed === 2,
    ).length;

    let stat = `(${allDataCount}) Contacts, `;

    if (firstNameChangeCount > 0 || lastNameChangeCount > 0) {
      if (firstNameChangeCount > 0)
        stat += `(${firstNameChangeCount}) First Name validated, `;
      if (lastNameChangeCount > 0)
        stat += `(${lastNameChangeCount}) Last Name validated, `;
    }

    if (duplicateCount !== 0) {
      stat += `(${duplicateCount}) Duplicate contacts removed, `;
    }

    if (selectedCountry) {
      stat += `(${changeCount}) Phone numbers validated`;
    }

    return stat;
  }

  const [showCreateList, setShowCreateList] = useState(false);

  const initialColumns = [
    {
      id: 'first_name',
      Header: 'First Name',
      headerWidth: '100',
      accessor: 'first_name',
      Cell: (col) => {
        const {
          row: { original, index },
          initialRows,
          initialState,
        } = col;
        const rowData = initialRows.map((f) => f.original);
        const {
          first_name,
          first_name_changed = null,
          old_first_name = null,
        } = original;
        return (
          <EditField
            text={first_name}
            saveAction={({ name }) => {
              updateField(
                index,
                name,
                'first_name',
                rowData,
                initialState.pageIndex,
                {},
              );
            }}
            link={false}
            changed={first_name_changed}
            inputStyle={inputStyle}
            oldValue={`${old_first_name}`}
          />
        );
      },
    },
    {
      id: 'last_name',
      Header: 'Last Name',
      headerWidth: '100',
      accessor: 'last_name',
      Cell: (col) => {
        const {
          row: { original, index },
          initialRows,
          initialState,
        } = col;
        const rowData = initialRows.map((f) => f.original);
        const {
          last_name,
          last_name_changed = null,
          old_last_name = null,
        } = original;
        return (
          <EditField
            text={last_name}
            saveAction={({ name }) => {
              updateField(
                index,
                name,
                'last_name',
                rowData,
                initialState.pageIndex,
                {},
              );
            }}
            link={false}
            changed={last_name_changed}
            inputStyle={inputStyle}
            oldValue={`${old_last_name}`}
          />
        );
      },
    },
    {
      id: 'phone_number',
      Header: 'Phone number',
      headerWidth: '100',
      accessor: 'phone_number',
      Cell: (col) => {
        const {
          row: { original, index },
          initialRows,
          initialState,
        } = col;
        const rowData = initialRows.map((f) => f.original);
        const {
          phone_number,
          phone_changed = null,
          old_phone_number = null,
          country = null,
        } = original;
        return (
          <EditField
            text={phone_number}
            saveAction={({ name }) => {
              const isValid = checkNumber(name, rowData, index);

              if (isValid) {
                updateField(
                  index,
                  name,
                  'phone_number',
                  rowData,
                  initialState.pageIndex,
                  { country },
                );
              }
            }}
            link={false}
            changed={phone_changed}
            inputStyle={inputStyle}
            oldValue={`${old_phone_number}`}
          />
        );
      },
    },
    {
      id: 'email',
      Header: 'Email',
      headerWidth: '100',
      accessor: 'email',
      Cell: (col) => {
        const {
          row: { original, index },
          initialRows,
          initialState,
        } = col;
        const rowData = initialRows.map((f) => f.original);
        const { email } = original;
        return (
          <EditField
            text={email}
            saveAction={({ name }) => {
              updateField(
                index,
                name,
                'email',
                rowData,
                initialState.pageIndex,
              );
            }}
            link={false}
            inputStyle={inputStyle}
          />
        );
      },
    },
    {
      id: 'contact_owner',
      Header: 'Contact Owner',
      headerWidth: '100',
      accessor: 'contact_owner',
      Cell: (col) => {
        const {
          row: { original, index },
          initialRows,
          initialState,
        } = col;
        const rowData = initialRows.map((f) => f.original);
        const { contact_owner } = original;

        const cO = agencyUsersList.filter((f) => f.value === contact_owner);
        return (
          <CommonSelect
            id="contact_owner_select"
            options={agencyUsersList}
            value={cO[0] ?? null}
            isSearchable={true}
            onChange={(v) => changeOwner(v, index, rowData)}
            placeholder="Select Contact Owner"
            className=""
          />
        );
      },
    },
    {
      id: 'contact-actions',
      Header: 'Action',
      accessor: 'action',
      disableSortBy: true,
      headerWidth: '80px',
      style: { overflow: 'inherit' },
      Cell: (col) => {
        const {
          row: { original, index },
          initialRows,
        } = col;
        const rowData = initialRows.map((f) => f.original);
        return (
          <div style={{ display: 'grid', placeItems: 'center' }}>
            <CommonDropdownActions items={getListAction(original, rowData)} />
          </div>
        );
      },
    },
  ];
  const [columns, setColumns] = useState(initialColumns);
  const tableColumns = useMemo(() => columns, [columns]);

  const handleOnChange = (e) => {
    if (e.target.files.length > 0) {
      setLoading(true);
      setTempData([]);
      setData([]);
      Papa.parse(e.target.files[0], {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
          const newArray = [];
          let valid_file = true;
          for (let i = 0; i < results.data.length; i++) {
            newArray.push(convertKeysToSnakeCase(results.data[i]));
          }
          for (let i = 0; i < newArray.length; i++) {
            const csvObj = newArray[i];
            if (
              !csvObj.hasOwnProperty('first_name') &&
              !csvObj.hasOwnProperty('phone_number') &&
              !csvObj.hasOwnProperty('contact_owner')
            ) {
              valid_file = false;
              break;
            }
          }
          if (valid_file) {
            setTimeout(() => {
              const { toUpload, dupCount } = removeDuplicateMobiles(newArray);
              setTempData(toUpload);
              setDuplicateCount(dupCount);
              setData(toUpload);
              setSelectedCountry(null);
              fileRef.current.value = null;
              setLoading(false);
            }, 500);
          } else {
            Swal.fire({
              title: 'Invalid CSV File!',
              icon: 'error',
              html: `CSV file should contain data with following headers: First Name, Phone Number, Contact Owner`,
              confirmButtonColor: '#025146',
              confirmButtonText: 'OK',
            });
            setTimeout(() => {
              setTempData([]);
              setData([]);
              setDuplicateCount(0);
              setSelectedCountry(null);
              fileRef.current.value = null;
              setLoading(false);
            }, 500);
          }
        },
      });
    }
  };

  function checkNumber(newValue, rowData, index) {
    const oldNumber = rowData[index].phone_number.replace(' ', '');
    if (oldNumber === newValue) {
      return true;
    }

    const count = rowData.filter((f) => f.phone_number === newValue).length;
    if (count >= 1) {
      h.general.alert('error', {
        message: 'Phone number already exist.',
        autoCloseInSecs: 1,
      });

      return false;
    }

    return true;
  }

  function getUniqueValues(array) {
    return Array.from(new Set(array));
  }

  function changeOwner(v, index, rawData) {
    const clone = [...rawData];

    clone[index].contact_owner = v.value;

    setData(clone);
  }

  function removeDuplicateMobiles(arr) {
    // const uniqueMobiles = getUniqueValues(arr.map((m) => m.phone_number));
    // return arr.filter((f) => uniqueMobiles.includes(f.phone_number));
    let dupCount = 0;
    const toUpload = arr.reduce((accumulator, contact) => {
      const existingContact = accumulator.find(
        (c) => c.phone_number === contact.phone_number,
      );
      if (!existingContact) {
        accumulator.push(contact);
      } else {
        dupCount++;
      }
      return accumulator;
    }, []);

    return { toUpload, dupCount };
  }

  function convertKeysToSnakeCase(obj) {
    const convertedObj = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const snakeCaseKey = key.toLowerCase().split(' ').join('_');
        convertedObj[snakeCaseKey] = obj[key];
      }
    }

    return convertedObj;
  }

  function getListAction(v, rawData) {
    const listActionsArr = [];

    listActionsArr.push({
      label: 'Delete',
      icon: faTrash,
      className: 'info-red',
      action: () => {
        h.general.prompt(
          {
            message: 'Are you sure you want to delete this contact?',
          },

          async (confirmDelete) => {
            setLoading(true);
            if (confirmDelete) {
              const clone = [...rawData];
              const clone2 = [...rawData];
              const index = clone.findIndex(
                (f) => f.phone_number === v.phone_number,
              );
              const index2 = clone2.findIndex(
                (f) => f.phone_number === v.phone_number,
              );
              clone.splice(index, 1);
              clone2.splice(index2, 1);

              setTimeout(() => {
                setData(clone);
                setTempData(clone2);
                setLoading(false);
              }, 500);
            }
          },
        );
      },
    });
    return listActionsArr;
  }

  async function handleSubmit() {
    if (h.isEmpty(selectedCountry)) {
      h.general.alert('error', {
        message: 'Please choose a country for your list.',
        autoCloseInSecs: 1,
      });
      return;
    }

    h.general.prompt(
      {
        message: 'Are you sure you want to submit uploaded contacts?',
      },

      async (confirmSubmit) => {
        if (confirmSubmit) {
          setLoading(true);
          const contactListSubmitRes =
            await api.contactListUser.createListContacts(
              { contact_list_id: list, contact_list: data },
              false,
            );
          if (h.cmpStr(contactListSubmitRes.status, 'ok')) {
            setLoading(false);
            window.location.href = h.getRoute(
              routes.templates.contact.list_view,
              {
                list_id: list,
              },
            );
          }
          setLoading(false);
        }
      },
    );
  }

  return (
    <>
      <div id="messaging-root" className="layout-v">
        <Header className="common-navbar-header" />
        <Body isLoading={isLoading}>
          <div className="messaging-container modern-style">
            <div
              className="message-body"
              style={{ width: '100%', padding: '10px', overflow: 'auto' }}
            >
              <div className="">
                <div className="pl-3 pr-3 pb-2">
                  <div className="d-flex justify-content-between">
                    <h1
                      style={{
                        fontFamily: 'PoppinsRegular',
                        lineHeight: '1.5',
                        fontSize: '20px',
                      }}
                    >
                      Import contacts
                      <span
                        style={{
                          display: 'block',
                          color: '#5A6264',
                          fontFamily: 'PoppinsLight',
                          fontSize: '14px',
                        }}
                      >
                        Upload file to import in contact list
                      </span>
                    </h1>
                  </div>
                  <div className="d-flex justify-content-between">
                    <div className="d-flex align-items-center">
                      <CommonSearchInput
                        isLoading={isLoading}
                        callback={(e) => {
                          setListingPageIndex(0);
                          setSearchText(e);
                        }}
                        placeholder={'Search contact name'}
                        className={`mr-2`}
                        disabled={h.isEmpty(data)}
                      />
                      <div style={{ width: '350px' }}>
                        <CommonSelect
                          id="select_country"
                          options={COUNTRIES}
                          value={selectedCountry}
                          isSearchable={true}
                          onChange={setSelectedCountry}
                          placeholder="Select Country"
                          className=""
                          control={{
                            height: 40,
                            minHeight: 40,
                            borderRadius: 8,
                          }}
                          isClearable={true}
                          disabled={data.length === 0}
                        />
                      </div>
                    </div>
                    <div className="d-flex justify-content-end align-items-center">
                      <input
                        type={'file'}
                        id={'csvFileInput'}
                        accept={'.csv'}
                        onChange={handleOnChange}
                        style={{ visibility: 'hidden' }}
                        ref={fileRef}
                      />
                      {data.length > 0 && (
                        <>
                          <button
                            type="type"
                            className="chip-button mr-2  c-action-button"
                            onClick={() => {
                              fileRef.current.click();
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faFileUpload}
                              color="#4877ff"
                              style={{ fontSize: '15px' }}
                            />
                            {'Re-Upload File'}
                          </button>
                          <button
                            type="type"
                            className="chip-button mr-2 light-red"
                            disabled={
                              data.length === 0 || h.isEmpty(selectedCountry)
                            }
                            onClick={handleSubmit}
                          >
                            <FontAwesomeIcon
                              icon={faSave}
                              color="#fff"
                              spin={isLoading}
                              style={{ fontSize: '15px' }}
                            />
                            {'Save Contacts'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <h3
                    style={{
                      fontSize: '16px',
                      fontFamily: 'PoppinsSemiBold',
                      marginBottom: '10px',
                    }}
                  >
                    {data.length > 0 && uploadCheckingStat()}
                  </h3>
                  {h.notEmpty(data) && !isLoading ? (
                    <div className="no-oxs new-table">
                      <CommonResponsiveTable
                        columns={tableColumns}
                        data={data}
                        options={{
                          manualPagination: false,
                          scrollable: true,
                          pageIndex: listingPageIndex,
                        }}
                        setListingPageIndex={setListingPageIndex}
                        thHeight="50px"
                        searchString={searchText}
                        modern={true}
                      />
                    </div>
                  ) : (
                    <div className="no-messages-found center-body">
                      <span>
                        <FontAwesomeIcon
                          icon={faInfo}
                          color="#DEE1E0"
                          style={{ fontSize: '40px' }}
                        />
                      </span>
                      <br />
                      Upload your csv to start
                      <br />
                      <button
                        type="type"
                        className="chip-button mt-2"
                        onClick={() => {
                          fileRef.current.click();
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faFileUpload}
                          color="#182327"
                          style={{ fontSize: '15px' }}
                        />
                        {'Upload File'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Body>
        <Footer />
      </div>
    </>
  );
}
