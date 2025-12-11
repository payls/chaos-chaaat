import React, { useRef, useState, useEffect } from 'react';
import { h } from '../../helpers';
import { useRouter } from 'next/router';
import UserProfilePicture from '../UserProfile/UserProfilePicture';
import IconUser from '../Icons/IconUser';

export default React.memo(
  ({
    Component,
    title = '',
    link = '',
    handleLogout = null,
    active = false,
    subMenus = [],
    profile = false,
    profileData = {},
    agency = {},
  }) => {
    const router = useRouter();
    const dropdownRef = useRef(null);
    const [toggle, setToggle] = useState(false);
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setToggle(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [dropdownRef]);

    function action() {
      if (h.notEmpty(subMenus)) {
        setToggle(!toggle);
      } else {
        router.push(link);
      }
    }

    return (
      <div>
        <div
          style={{zIndex:99999}}
          href={''}
          className={`a-lnk ${active ? 'active' : ''} `}
          onClick={action}
        >
          {!profile ? (
            <>
              <span>
                <Component width={20} />
              </span>
              <label>{title}</label>
            </>
          ) : (
            <UserProfilePicture
              src={profileData.userProfilePic}
              alt={profileData.userName}
              height="40px"
              width="40px"
              firstname={profileData.firstname}
              lastname={profileData.lastname}
              style={{}}
              handleOnClick={() => {}}
            />
          )}

          {h.notEmpty(subMenus) && toggle && (
            
            <div
              className={`vertical-navbar-item-submenu  ${
                profile ? 'is-profile' : 'is-sub-option'
              }`}
              ref={dropdownRef}
            >
              <ul>
                {profile && (
                  <li id="account">
                    <IconUser style={{ marginRight: '5px' }} />
                    {profileData.firstname} {profileData.lastname}
                    <br/>
                    <div style={{ marginLeft: '20px' }}>{agency?.agency_name}</div>
                  </li>
                )}
                {subMenus.map((menu, i) => (
                  <li
                    key={i}
                    onClick={() => {
                      if (menu.type && h.cmpStr(menu.type, 'logout')) {
                        return handleLogout();
                      } else {
                        window.location = menu.link;
                      }
                    }}
                  >
                    {menu.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  },
);
