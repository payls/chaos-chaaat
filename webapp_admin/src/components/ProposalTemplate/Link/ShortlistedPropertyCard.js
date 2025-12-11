import React, { useEffect, useState } from 'react';
import { h } from '../../../helpers';
import { api } from '../../../api';
import ShortlistedPropertyComment from './ShortlistedPropertyComment';
import ShortlistedPropertyCommentTextArea from './ShortlistedPropertyCommentTextArea';

export default function ShortlistedPropertyCard(props) {
  const { project, unit, shortlisted_property_id, setLoading } = props;

  const [comments, setComments] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [currentModal, setCurrentModal] = useState('');

  useEffect(() => {
    (async () => {
      await reloadComments(shortlisted_property_id);
    })();
  }, [shortlisted_property_id]);

  const reloadComments = async (shortlisted_property_id) => {
    const apiRes = await api.shortlistedPropertyComment.findAll(
      { shortlisted_property_id },
      false,
    );
    if (h.cmpStr(apiRes.status, 'ok')) {
      setComments(apiRes.data.shortlisted_property_comments);
    }
  };

  const handleModal = (e, attachment) => {
    if (e) e.preventDefault();
    if (showModal) {
      setShowModal(false);
      setCurrentModal('');
    } else {
      setShowModal(true);
      setCurrentModal(attachment.shortlisted_property_comment_attachment_id);
    }
  };

  return (
    <div>
      {h.notEmpty(unit) && (
        <>
          <div>
            <div className="row pt-4 mb-5">
              <div className="col-12">
                <div className="d-flex">
                  <div className="p-2">
                    <h1
                      className="display-4"
                      style={{ fontSize: '24px', fontWeight: '500' }}
                    >
                      {project.project_name}
                    </h1>
                    <p
                      className="text-color2"
                      style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        textDecoration: 'none',
                      }}
                    >
                      {h.notEmpty(project.location_address) ? (
                        <a
                          href={`https://www.google.com.sg/maps/place/${project.location_address}`}
                          className="text-color5"
                          target="_blank"
                        >
                          {project.location_address}
                        </a>
                      ) : (
                        <span className="text-color5">
                          {project.location_address}
                        </span>
                      )}
                    </p>
                    {h.notEmpty(unit) && (
                      <span>
                        #{unit.unit_number || 0} |{' '}
                        {h.general.customFormatDecimal(unit.bed) || 0} bed |{' '}
                        {h.general.customFormatDecimal(unit.bath) || 0} bath |{' '}
                        {h.currency.format(unit.start_price)}{' '}
                        {unit.currency?.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="col-12 mt-5">
              <div className="row">
                <div className="col-12">
                  {h.notEmpty(comments) &&
                    comments.map((comment) => {
                      return h.isEmpty(comment.message) ? null : (
                        <ShortlistedPropertyComment
                          comment={comment}
                          handleModal={handleModal}
                          showModal={showModal}
                          currentModal={currentModal}
                          project={project}
                          shortlisted_property_id={shortlisted_property_id}
                          setLoading={setLoading}
                          reloadComments={reloadComments}
                        />
                      );
                    })}
                </div>
                {/* TextArea for new comments that are not replies */}
                <ShortlistedPropertyCommentTextArea
                  project={project}
                  shortlisted_property_id={shortlisted_property_id}
                  setLoading={setLoading}
                  reloadComments={reloadComments}
                />
              </div>
            </div>
          </div>
        </>
      )}
      <hr />
    </div>
  );
}
