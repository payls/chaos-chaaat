import React, { useState, useEffect } from 'react';
import { Header, Body, Footer } from '../../components/Layouts/Layout';
import { h } from '../../helpers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList,
  faPlusCircle,
} from '@fortawesome/free-solid-svg-icons';
import IconSearch from '../../components/Icons/IconSearch';
import SaleListing from '../../components/Sale/SaleListing';
import CommonIconButton from '../../components/Common/CommonIconButton';
import { useRouter } from 'next/router';
import CreateSaleModal from '../../components/Sale/CreateSaleModal';
import { routes } from '../../configs/routes';

export default function DashboardSales() {
  const router = useRouter();
  const [isLoading, setLoading] = useState();
  const [shouldReload, setShouldReload] = useState(false);
  const [contactLinks, setContactLinks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateSaleModal, setShowCreateSaleModal] = useState(false);
  const [formMode, setFormMode] = useState('');
  const [selectedContactId, setSelectedContactId] = useState('');

  useEffect(() => {
    h.auth.isLoggedInElseRedirect();
  }, []);

  useEffect(() => {
    const contact_id = h.general.findGetParameter('contact_id');
    setSelectedContactId(contact_id);
    const form_mode = h.general.findGetParameter('form_mode');
    setFormMode(form_mode);
    if (
      h.cmpStr(form_mode, h.form.FORM_MODE.ADD) ||
      h.cmpStr(form_mode, h.form.FORM_MODE.EDIT)
    ) {
      setShowCreateSaleModal(true);
    }
  }, [router.query]);

  const doneReloading = () => {
    setShouldReload(false);
  };

  return (
    <>
      {/*{showCreateSaleModal && <CreateSaleModal formMode={formMode} contactId={selectedContactId} setLoading={setLoading} onCloseModal={() => {*/}
      {/*    setShowCreateSaleModal(!showCreateSaleModal);*/}
      {/*    setShouldReload(true);*/}
      {/*}} />}*/}
      <div className="sales-root">
        <Header />
        <Body isLoading={isLoading}>
          <div className="container sales-container">
            <div className="mb-5 sales-title">
              <FontAwesomeIcon
                icon={faClipboardList}
                color="#ADC7A6"
                size="2x"
                style={{ width: 20 }}
              />
              <div>
                <h1>Proposals</h1>
                <span>
                  {contactLinks.length} Proposal
                  {contactLinks.length === 1 ? '' : 's'}
                </span>
              </div>
            </div>
            <div className="p-3">
              <div className="row">
                <button
                  className="common-icon-button"
                  style={{ width: 170 }}
                  onClick={async () => {
                    await router.push(
                      h.getRoute(routes.sales.proposal_type_new),
                    );
                  }}
                >
                  New proposal
                  <FontAwesomeIcon
                    icon={faPlusCircle}
                    color="#fff"
                    fontSize="20px"
                    style={{ width: 12 }}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="sales-list-container">
            <div className="bg-white">
              <div className="container">
                <div className="pl-3 pr-3 pb-2">
                  <div className="row">
                    <div className="tab-body">
                      <div className="search-input mt-4 mb-4">
                        <input
                          placeholder="search agent name, buyer name etc."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <IconSearch />
                      </div>
                      <SaleListing
                        searchQuery={searchQuery}
                        shouldReload={shouldReload}
                        doneReloading={doneReloading}
                        updateParentContactLinks={setContactLinks}
                        setLoading={setLoading}
                      />
                    </div>
                  </div>
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
