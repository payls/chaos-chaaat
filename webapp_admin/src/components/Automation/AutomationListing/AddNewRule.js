import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { h } from '../../../helpers';
import { api } from '../../../api';
import { routes } from '../../../configs/routes';
import constant from '../../../constants/constant.json';

import CommonDrodownAction from '../../Common/CommonDrodownAction';
import IconPlus from '../../ProposalTemplate/Link/preview/components/Icons/IconPlus';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';

export default React.memo(({ category = null, agency = null }) => {
  const router = useRouter();

  const [categoryResStatus, setCategoryResStatus] = useState(
    constant.API_STATUS.PENDING,
  );

  // This dropdown menu helps user to add new rule as well as new legacy rules/automation
  function downdropRuleActions() {
    const actions = [];

    if (category) {
      actions.push({
        label: 'Add New Rule',
        className: 'addNewRule',
        icon: faPlusCircle,
        action: () => { navigateToCategoryForm(category?.automation_category_id) }
      });
    }

    actions.push({
      label: 'Legacy Mindbody',
      icon: false,
      action: () => {handleLegacy('MINDBODY', 'Legacy Mindbody')},
    });

    actions.push({
      label: 'Legacy HubSpot',
      icon: false,
      action: () => {handleLegacy('HUBSPOT', 'Legacy Hubspot')}
    });

    actions.push({
      label: 'Messaging Channels',
      icon: false,
      action: () => {handleLegacy('OTHER', 'Legacy Messaging Channel')}
    });

    return actions;
  }
  
  // Navigate to the Category Rule Form within the category identified by the given category ID
  function navigateToCategoryForm(categoryId) {
    router.push(
      h.getRoute(routes.automation.form_add, {
        category: categoryId,
      }),
      undefined,
      {
        shallow: true,
      }
    );
  }

  /* Create default Legacy Category (Legacy Hubspot, Legacy Hubspot & Legacy Messaging Channel) 
    if category does not exist
  */
  async function createLegacyCategory(platform, title) {
    const formData = {
      agency_id: agency?.agency_id,
      title: title,
      description: '',
      platform,
    };
    const apiRes = await api.automation.createCategory(formData, true);
    if (h.cmpStr(apiRes.status, 'ok')) {
      await createLegacyRule(platform, title);
    }
  }

  /* Check for category if it exists & navigate to Create Legacy Rule */
  async function createLegacyRule(platform, title) {
    setCategoryResStatus(constant.API_STATUS.PENDING);
    const categoryRes = await api.automation.getCategories({
      agency_id: agency?.agency_id,
      platform,
      title
    });
    if (h.cmpStr(categoryRes.status, 'ok')) {
      const categoriesData = categoryRes.data.categories;
      if (categoriesData.length === 0) {
        createLegacyCategory(platform, title);
      } else {
        const categoryId = categoriesData[0]?.automation_category_id;
        navigateToCategoryForm(categoryId)
      }
    }
    setCategoryResStatus(constant.API_STATUS.FULLFILLED);
  }

  const handleLegacy = (platform, title) => {
    createLegacyRule(platform, title);
  }

  return (
    <CommonDrodownAction 
      className="chip-button c-action-button"
      items={downdropRuleActions()} 
      icon={false} 
      html={<IconPlus color="#ffffff" width="20px" />}
    />
  )
})