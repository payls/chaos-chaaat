import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { h } from '../../helpers';
import { api } from '../../api';
import constant from '../../constants/constant.json';

import CategoryLegacyItem from './AutomationListing/CategoryLegacyItem';
import AddNewRule from './AutomationListing/AddNewRule';
import CategoryItem from './AutomationListing/CategoryItem';

export default React.memo(({
  category = null,
  reloadCategories = () => {},
  agency = null,
  setIsCategoryListVisible,
  setRuleCount,
  setLoading,
}) => {
    const router = useRouter();

    const [listRules, setListRules] = useState([]);
    const [rulesResStatus, setRulesResStatus] = useState();
    const [activeTab, setActiveTab] = useState('All');
    const [filteredListRules, setFilteredListRules] = useState([]);

    useEffect(() => {
      (async () => {
        if (h.notEmpty(category)) {
          await getRules();
        }
      })();
    }, [category]);

    setRuleCount(listRules.length);

    /**
    * Asynchronously fetches the rules based on the automation category ID.
    *
    * @async
    * @function getRules
    * @returns {Promise<void>} - A promise that resolves when the rules are fetched and the state is updated.
    *
    * @example
    * // Example usage:
    * await getRules();  // Fetch rules and update state accordingly.
    */
    async function getRules() {
      setRulesResStatus(constant.API_STATUS.PENDING);
      const rulesRes = await api.automation.getRules(
        category?.automation_category_id,
      );

      if (h.cmpStr(rulesRes.status, 'ok')) {
        const rules = h.general.unescapeData(rulesRes.data.rules)
        setListRules(rules);
      }
      setRulesResStatus(constant.API_STATUS.FULLFILLED);
    }

    /*
    Handling of active Tab section
    Handling for Category List - Category List for Legacy should not be visible
    */
    const handleTabClick = (tabName, value) => {
      setActiveTab(tabName);
      setIsCategoryListVisible(value);
    };

    /* Function for tab filteration - all, active & inactive */
    useEffect(() => {
      const _filteredListRules = listRules.filter(item => {
        if (activeTab === 'All') return true;
        if (activeTab === 'Active') return item.status === 'active';
        if (activeTab === 'Inactive') return item.status === 'inactive';
        return false;
      });
      setFilteredListRules(_filteredListRules);
    }, [listRules, activeTab])


    return (
      <div className="category-item">
        <div className="d-flex justify-content-between align-items-center categoryItem-tab-wrapper">
          <div className="d-flex categoryItem-tab-btns">
            <button className={`chip-button tab-btn ${activeTab === 'All' ? 'active' : ''}`} onClick={() => handleTabClick('All', true)}>All</button>
            <button className={`chip-button tab-btn ${activeTab === 'Active' ? 'active' : ''}`} onClick={() => handleTabClick('Active', true)}>Active</button>
            <button className={`chip-button tab-btn ${activeTab === 'Inactive' ? 'active' : ''}`} onClick={() => handleTabClick('Inactive', true)}>Inactive</button>
          </div>
          <div className="d-flex align-items-center">
            <div className="categoryItem-tab-btns">
              <button className={`chip-button tab-btn ${activeTab === 'Legacy' ? 'active' : ''}`} onClick={() => handleTabClick('Legacy')}>Legacy</button>
            </div>
            <AddNewRule category={category} agency={agency}/>
          </div>
        </div>

        {activeTab !== 'Legacy' && (
          <CategoryItem 
            getRules={async () => {
              await getRules(true);
            }}
            rulesResStatus={rulesResStatus} 
            filteredListRules={filteredListRules} 
            agency={agency}
            setLoading={setLoading}
            setFilteredListRules={setFilteredListRules}
          />
        )}

        {activeTab === 'Legacy' && (
          <CategoryLegacyItem agency={agency} />
        )}
      </div>
    );
  },
);
