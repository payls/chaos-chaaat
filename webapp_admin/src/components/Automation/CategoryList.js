import React, { useState } from 'react';
import constant from '../../constants/constant.json';
import { h } from '../../helpers';
import { api } from '../../api';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CommonTooltip from '../Common/CommonTooltip';
import CategoryCreate from './CategoryCreate';
import ListLoading from '../Sale/Link/preview/components/Common/CommonLoading/ListLoading';
import IconPlus from '../ProposalTemplate/Link/preview/components/Icons/IconPlus';
import IconTrash from '../Icons/IconTrash';

export default React.memo(
  ({
    selected = null,
    setSelected,
    data = [],
    agency,
    reloadCategories,
    status,
    platform,
    ruleCount
  }) => {
    const [showCategoryCreate, setShowCategoryCreate] = useState(false);
  
  /**
  * Deletes the current automation category after user confirmation.
  *
  * @function deleteCurrentCategory
  * @param {number|string} automation_category_id - The ID of the automation category to be deleted.
  * @returns {void}
  *
  * @example
  * // Example usage:
  * deleteCurrentCategory(123);  // Deletes the category with ID 123 after confirmation.
  */
  const deleteCurrentCategory = (automation_category_id) => {
    h.general.prompt(
      {
        message: 'Are you sure you want to delete this category?',
      },

      async (status) => {
        if (status) {
          const deleteRes = await api.automation.deleteCategory(
            {
              id: automation_category_id,
            },
            true,
          );
          if (h.cmpStr(deleteRes.status, 'ok')) {
            reloadCategories();
          }
        }
      },
    );
  }

  function getRuleCount(ruleCount) {
    // Convert ruleCount to a string and pad with leading zero if necessary
    if (ruleCount === 0) {
      return '0';
    } else {
      return ruleCount.toString().padStart(2, '0');
    }
  }

    return (
      <>
        {showCategoryCreate && (
          <CategoryCreate
            agencyId={agency?.agency_id}
            handleCloseModal={() => setShowCategoryCreate(false)}
            reloadCategories={reloadCategories}
            platform={platform}
          />
        )}
        <div className="category-list">
          <h1 className="d-flex justify-content-between align-items-center">
            <span>Categories</span>
            <CommonTooltip tooltipText="Add new Category">
              <button
                type="type"
                className="chip-button mb-0 noText c-action-button"
                onClick={() => setShowCategoryCreate(true)}
              >
                <IconPlus color="#4877ff" width="15px" />
              </button>
            </CommonTooltip>
          </h1>
          <div className="category-list-items">
            {status === constant.API_STATUS.PENDING && (
              <ListLoading className="mt-2" count={8} height="30px" />
            )}
            {status === constant.API_STATUS.FULLFILLED && data.length !== 0 && (
              <ul>
                {data.map((item, i) => (
                  <li
                    key={i}
                    className={`animate-fadeIn ${
                      selected &&
                      selected.automation_category_id ===
                        item.automation_category_id
                        ? 'active'
                        : ''
                    }`}
                    onClick={() => {
                      setSelected(item);
                    }}
                  >
                    {item.title}
                    {selected.automation_category_id === item.automation_category_id && (
                      <div className="d-flex align-items-center">
                      <span className="category-list-count">{getRuleCount(ruleCount)}</span>
                      <CommonTooltip tooltipText="Delete category">
                        <button
                          type="type"
                          className="chip-button"
                          onClick={() => deleteCurrentCategory(item.automation_category_id)}
                        >
                          <IconTrash color="#4877ff" width="15px" />
                        </button>
                      </CommonTooltip>
                    </div>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {status === constant.API_STATUS.FULLFILLED && data.length === 0 && (
              <div className="no-messages-found text-left">
                No category yet.
              </div>
            )}
          </div>
        </div>
      </>
    );
  },
);
