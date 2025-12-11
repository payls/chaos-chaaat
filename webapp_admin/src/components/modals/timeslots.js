import crossIcon from '../../../public/assets/images/cross.svg';
import dropdownIcon from '../../../public/assets/images/dropdown.svg';
import tickIcon from '../../../public/assets/images/tick.svg';
import minusIcon from '../../../public/assets/images/minus.svg';
import deleteIcon from '../../../public/assets/images/delete.svg';
import addIcon from '../../../public/assets/images/add.svg';
import initialTimeslots from '../../constants/timeSlot';
import { useEffect, useState, useCallback } from 'react';
import CommonSelect from '../Common/CommonSelect';
import timePickerDropdownValues from '../../constants/timePickerDropdownValues';
import timeZoneList from '../../constants/timeZoneList';
import { api } from '../../api';
import { h } from '../../helpers';

export default function TimeslotSettings(props) {
  const { setTimeslot, timeslot, setTimeslotFor, agencyUserData: agencyUser } = props;
  const [timeslotSettingData, setTimeslotSettingData] = useState(initialTimeslots.timeslots);
  const [crmTimeslotSettings, setCrmTimeslotSettings] = useState(null);
  const [timePickerDropdown, setTimePickerDropdownValues] = useState(timePickerDropdownValues);
  const [timeZone, setTimeZone] = useState({value: initialTimeslots.timeZone, label: initialTimeslots.timeZone});
  const [timeSlots, setTimeSlots] = useState([]);
  const closeModal = () => {
    setTimeslot(!timeslot)
  }

  useEffect(() => {
    (async () => {
      if (!crmTimeslotSettings && agencyUser?.agency_fk != '' && agencyUser?.agency_user_id != '') {
        await getAgencyOauthTimeslog();
      }
    })();
  }, [agencyUser, crmTimeslotSettings]);

  useEffect(() => {
    if (!crmTimeslotSettings) return;

    if (crmTimeslotSettings.timeZone) {
      setTimeZone(crmTimeslotSettings.timeZone);
    }
    if (crmTimeslotSettings.timeSlots && Array.isArray(crmTimeslotSettings.timeSlots)) {
      setTimeSlots(crmTimeslotSettings.timeSlots);
    }
  }, [crmTimeslotSettings])



  const getAgencyOauthTimeslog = async () => {
    const agencyId = agencyUser?.agency_fk;
    const source = setTimeslotFor;
    const apiRes = await api.agencyOauth.getAgencyOauthTimeslot({ source, agencyId }, true);
    if (apiRes?.data?.crm_timeslot_settings) {
      setCrmTimeslotSettings(apiRes?.data?.crm_timeslot_settings)
    }
  };

  const addTimeSlot = (i, j) => {
    let slots = [...timeSlots];
    let value
    let previousLastSlot = slots[i].availableSlots[slots[i].availableSlots.length - 1];
    if (previousLastSlot.startTime == -1) {
      slots[i].availableSlots[j].startTime = 540;
      slots[i].availableSlots[j].endTime = 1020;
      slots[i].availableSlots[j]['errorMessage'] = '';
      setTimeSlots(slots);
    } else {
      let startTime = previousLastSlot.endTime;
      let endTime = previousLastSlot.endTime+30;
      if (startTime > 1440 || endTime > 1440) {
        alert('Time will overlap with another set of time')
      } else {
        value = {
          "startTime": startTime,
          "endTime": endTime
        }
        let errorMessage = validateSelectedSlots([...slots[i].availableSlots], value.startTime, value.endTime, slots[i].availableSlots.length - 1);
        value['errorMessage'] = errorMessage;
        slots[i].availableSlots.push(value)
        setTimeSlots(slots);
      }
    }
  }

  const deleteTimeSlot = (i, j) => {
    let slots = [...timeSlots];
    if (slots[i].availableSlots.length == 1) {
      slots[i].availableSlots[j].startTime = -1;
      slots[i].availableSlots[j].endTime = -1;
      slots[i].availableSlots[j]['errorMessage'] = '';
    } else {
      slots[i].availableSlots.splice(j, 1);
    }
    setTimeSlots(slots)
  }

  const startTimeValue = (value, i, j) => {
    let slots = [...timeSlots];
    let errorMessage = validateSelectedSlots([...slots[i].availableSlots], value, slots[i].availableSlots[j].endTime, j);
    if (slots[i].availableSlots[j].endTime == value) {
      errorMessage = 'Start time and end time can not be same.'
    }
    slots[i].availableSlots[j].startTime = value;
    slots[i].availableSlots[j]['errorMessage'] = errorMessage;
    setTimeSlots(slots);
  }

  const endTimeValue = (value, i, j) => {
    let slots = [...timeSlots];
    let errorMessage = validateSelectedSlots([...slots[i].availableSlots], slots[i].availableSlots[j].startTime, value, j);
    if (slots[i].availableSlots[j].startTime == value) {
      errorMessage = 'Start time and end time can not be same.'
    }
    slots[i].availableSlots[j].endTime = value;
    slots[i].availableSlots[j]['errorMessage'] = errorMessage;
    setTimeSlots(slots);
  }

  const validateSelectedSlots = (selectedSlots, startTimeValue, endTimeValue, indexNotToCheck) => {
    let errorMessage =''
    for (let i = 0; i < selectedSlots.length; i++) {
      if ((i != indexNotToCheck) && (startTimeValue > selectedSlots[i].startTime) && (startTimeValue < selectedSlots[i].endTime)) {
        errorMessage = 'Start time overlaps with another slot range.';
      }
      if ((i != indexNotToCheck) && (endTimeValue > selectedSlots[i].startTime) && (endTimeValue < selectedSlots[i].endTime)) {
        errorMessage = 'End time overlaps with another slot range.';
      }
    }
    return errorMessage;
  }

  const updateTimeZone = (value) => {
    setTimeZone(value);
  }

  const saveAgencyOauthTimeslotSettings = useCallback(async () => {
    if (agencyUser.agency_fk && timeZone && timeSlots) {
      await api.agencyOauth.updateAgencyOauthTimeslot({
        source: setTimeslotFor,
        agencyId: agencyUser.agency_fk,
        crm_timeslot_settings: {
          timeZone,
          timeSlots,
        },
      }, true);
    }
  }, [setTimeslotFor, timeZone, timeSlots, agencyUser]);

  return (
    <div
      class="modal setting_modal fade align-items-lg-start align-content-md-start align-content-start justify-content-center show"
      id="exampleModal" tabIndex="-1"
      aria-labelledby="exampleModalLabel" aria-modal="true" role="dialog">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-body p-0 pb-lg-5 pb-m-d-4 pb-3">
            <div class="row py-lg-4 py-md-3 py-3">
              <div
                class="col-12 d-flex align-items-center justify-content-between">
                <div class="sect_heading">
                  <h2>Setting </h2>
                </div>
                <div data-bs-dismiss="modal" aria-label="Close">
                  <img role="button" src={crossIcon.src} width="38px" height="38px" onClick={() => closeModal()}/>
                </div>
              </div>
            </div>
            <div class="row pt-1 g-4">
              <div
                class="col-xl-6 col-lg-12 col-md-12 col-sm-12 col-12">
                <div class="setting_card">
                  <div class="sect_heading mb-4 pb-1">
                    <h2 class="mb-2">Time Zone</h2>
                    <p class="m-0">Triggered by Outgoing
                      message
                      sent</p>
                  </div>
                  <div class="selectForm">
                    <div
                      class="select_div position-relative">
                      <CommonSelect
                        id={`time_zone`}
                        options={timeZoneList}
                        value={timeZone}
                        isSearchable={true}
                        onChange={(v) => {updateTimeZone(v)}}
                        placeholder="Select Time Zone"
                        className=""
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div
                class="col-xl-6 col-lg-12 col-md-12 col-sm-12 col-12">
                <div class="setting_card">
                  <div class="sect_heading mb-4 pb-1">
                    <h2 class="mb-3">Weekly
                      Availability</h2>
                  </div>
                  <form>
                    {
                      timeSlots && timeSlots.length > 0 && (
                        <>
                        {timeSlots.map((weekData, i) => (
                          <>
                            {
                              weekData.availableSlots && weekData.availableSlots.length > 0 && (
                                weekData.availableSlots.map((availableSlot, j) => (
                                  <>
                                    {
                                      <div
                                        className={`d-flex justify-content-between gap-lg-4 gap-md-3 gap-3 align-items-center flex-lg-nowrap flex-wrap ${i>0 ? 'mt-xl-4 mt-md-4 mt-md-4 mt-4 pt-xl-3' :  ''} ${j > 0 ? 'mt-4 pt-xl-3' : ''}`}>
                                        <div
                                          class="d-flex align-items-center gap-xl-5 gap-lg-4 gap-md-4 gap-4 flex-md-nowrap flex-wrap">
                                          <div
                                            class={`avilabilityCheckOuter d-flex align-items-center gap-4 ${j > 0 ? 'avilabilityCheckOuterNodata mr-2 pr-2' : ' mr-4'}`}>
                                            {
                                              j == 0
                                              ?
                                              <>
                                                <div
                                                  class="avilabilityCheck d-flex mr-4 align-items-center justify-content-center">
                                                  <input role="button" type="checkbox" checked={(availableSlot.startTime > -1 && availableSlot.endTime > -1)}/>
                                                  <label>
                                                    <img src={tickIcon.src} width="20px" height="20px" />
                                                  </label>
                                                </div>
                                                <label className='m-0'>{weekData.weekDay}</label>
                                              </>
                                              :''
                                            }
                                          </div>
                                          <div
                                            class="time_input d-flex align-items-cneter gap-lg-4 gap-md-3 gap-2 mw92">
                                            {
                                              (availableSlot.startTime > -1 && availableSlot.endTime > -1)
                                              ?
                                              <>
                                                <div class="time_input mr-4">
                                                  <div>
                                                    <CommonSelect
                                                      id={`start_time${i}${j}`}
                                                      options={[
                                                        ...timePickerDropdown.map((m) => ({
                                                          value: m.value,
                                                          label: m.label,
                                                        })),
                                                      ]}
                                                      value={timePickerDropdown.filter((dropdown) => {
                                                        return dropdown.value == availableSlot.startTime
                                                      })}
                                                      isSearchable={true}
                                                      onChange={(v) => startTimeValue(v.value, i, j)}
                                                      placeholder="Start Time"
                                                      className=""
                                                    />
                                                  </div>
                                                </div>
                                                <div
                                                  class="d-flex align-items-center mr-4">
                                                  <img src={minusIcon.src} width="18px" height="2px" />
                                                </div>
                                                <div class="time_input">
                                                  <div>
                                                    <CommonSelect
                                                      id={`end_time${i}${j}`}
                                                      options={[
                                                        ...timePickerDropdown.map((m) => ({
                                                          value: m.value,
                                                          label: m.label,
                                                        })),
                                                      ]}
                                                      value={timePickerDropdown.filter((dropdown) => {
                                                        return dropdown.value == availableSlot.endTime
                                                      })}
                                                      isSearchable={true}
                                                      onChange={(v) => endTimeValue(v.value, i, j)}
                                                      placeholder="Start Time"
                                                      className=""
                                                    />
                                                  </div>
                                                </div>
                                              </>
                                              : <label>Unavailable</label>
                                            }
                                          </div>
                                        </div>
                                        <div
                                          class="d-flex aling-items-center gap-4">
                                            {
                                              availableSlot.startTime != -1 && availableSlot.endTime != -1
                                              ?
                                              <>
                                                <div class={`addDeleterOuter ${j > 0 ? '': 'mr-4'}`}>
                                                  <div class="addDeleter">
                                                    <div
                                                      class="addDeleterInner">
                                                      <img role="button" src={deleteIcon.src} width="20px" height="20px" onClick={() => {deleteTimeSlot(i, j)}}/>
                                                    </div>
                                                  </div>
                                                </div>
                                              </>
                                              :
                                              <>
                                              </>
                                            }
                                          {
                                            j == 0
                                            ?
                                            <>
                                              <div class="addDeleterOuter">
                                                <div class="addDeleter">
                                                  <div
                                                    class="addDeleterInner">
                                                    <img role="button" src={addIcon.src} width="24px" height="24px" onClick={() => {addTimeSlot(i, j)}}/>
                                                  </div>
                                                </div>
                                              </div>
                                            </>
                                            :''
                                          }
                                        </div>
                                      </div>
                                    }
                                    {
                                      (availableSlot?.errorMessage)
                                      ?
                                        <div className='errorcls'>
                                          <span>{availableSlot?.errorMessage}</span>
                                        </div>
                                      : ''
                                    }
                                  </>

                                ))
                              )
                            }
                          </>
                        ))}
                        </>
                      )
                    }
                  </form>
                </div>
              </div>
              <div class="tsb_save">
                <button class="tsb_button" onClick={() => {saveAgencyOauthTimeslotSettings()}}>Save</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}