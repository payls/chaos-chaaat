import React, { useState, useEffect } from 'react';
import {
  faTimes,
  faCommentSlash,
  faTrash,
  faPen,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { h } from '../../helpers';
import { api } from '../../api';
import constants from '../../constants/constant.json';
import CommonTextAreaEditor from '../Common/CommonTextAreaEditor';
import SmallSpinner from '../Inbox/SmallSpinner';
import CommonTooltip from '../Common/CommonTooltip';

export default function NotesModal({
  contactId = 'a07a2437-08a9-498c-b25b-981c0b1ba07',
  agencyUserId = 'c935ab44-a068-4596-89c0-36c6bc9256fe',
  handleCloseModal,
}) {
  const [notes, setNotes] = useState([]);
  const [formMode, setFormMode] = useState('view');
  const [newNote, setNewNote] = useState('');
  const [noteToEdit, setNoteToEdit] = useState(null);
  const [status, setStatus] = useState(constants.API_STATUS.PENDING);

  useEffect(() => {
    (async () => {
      if (h.notEmpty(contactId)) {
        await getNotes();
      }
    })();
  }, [contactId]);

  async function submit() {
    setStatus(constants.API_STATUS.PENDING);
    const notesRes = await api.contact.createNote(
      {
        contact_id: contactId,
        agency_user_id: agencyUserId,
        note: newNote,
      },
      true,
    );

    if (h.cmpStr(notesRes.status, 'ok')) {
      await getNotes();
      setFormMode('view');
    }
    setStatus(constants.API_STATUS.FULLFILLED);
  }

  async function getNotes() {
    setStatus(constants.API_STATUS.PENDING);
    const notesRes = await api.contact.getNotes(contactId);

    if (h.cmpStr(notesRes.status, 'ok')) {
      setNotes(
        notesRes.data.contactNote.sort((a, b) => {
          const dateA = new Date(a.created_date_raw);
          const dateB = new Date(b.created_date_raw);
          return dateB - dateA;
        }),
      );
    }

    setStatus(constants.API_STATUS.FULLFILLED);
  }

  async function deleteNote(noteId) {
    h.general.prompt(
      {
        message: `Are you sure you want to delete this to note?`,
      },

      async (status) => {
        if (status) {
          setStatus(constants.API_STATUS.PENDING);
          const notesRes = await api.contact.deleteNote(noteId, true);

          if (h.cmpStr(notesRes.status, 'ok')) {
            await getNotes();
          }

          setStatus(constants.API_STATUS.FULLFILLED);
        }
      },
    );
  }

  async function update() {
    h.general.prompt(
      {
        message: `Are you sure you want to update this to note?`,
      },

      async (status) => {
        if (status) {
          setStatus(constants.API_STATUS.PENDING);
          const notesRes = await api.contact.updateNote(
            noteToEdit.contact_note_id,
            { note: noteToEdit.note },
            true,
          );

          if (h.cmpStr(notesRes.status, 'ok')) {
            await getNotes();
            setFormMode('view');
          }

          setStatus(constants.API_STATUS.FULLFILLED);
        }
      },
    );
  }

  function editNote(note) {
    setNoteToEdit(note);
    setFormMode('edit');
  }

  return (
    <div className="modern-modal-wrapper">
      <div
        className="modern-modal-body md"
        style={{ minHeight: '400px', maxWidth: '40vw' }}
      >
        <div className=" d-flex justify-content-between mb-4">
          <h1>Contact Notes</h1>
          <span
            onClick={handleCloseModal}
            style={{
              cursor: 'pointer',
              fontSize: '1em',
              marginLeft: '3em',
            }}
          >
            <FontAwesomeIcon
              icon={faTimes}
              color="#182327"
              style={{ fontSize: '15px' }}
            />
          </span>
        </div>

        <div style={{ overflow: 'auto', height: '380px' }}>
          {formMode === 'view' && (
            <>
              {notes.length > 0 &&
                status !== constants.API_STATUS.PENDING &&
                notes.map((note) => (
                  <>
                    <div className="contact-note">
                      <div className="contact-note-head d-flex justify-content-between">
                        <label>
                          Note by{' '}
                          <span>{note?.agency_user?.user?.full_name}</span>
                        </label>
                        <div>
                          <CommonTooltip tooltipText="Edit note">
                            <FontAwesomeIcon
                              icon={faPen}
                              color="#2a5245"
                              className="mr-2"
                              style={{ cursor: 'pointer' }}
                              onClick={() => editNote(note)}
                            />
                          </CommonTooltip>
                          <CommonTooltip tooltipText="Delete note">
                            <FontAwesomeIcon
                              icon={faTrash}
                              color="#2a5245"
                              style={{ cursor: 'pointer' }}
                              onClick={() => deleteNote(note.contact_note_id)}
                            />
                          </CommonTooltip>
                        </div>
                      </div>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: note.note,
                        }}
                        className="contact-note-wrap"
                      ></div>
                    </div>
                  </>
                ))}

              {notes.length === 0 &&
                status !== constants.API_STATUS.PENDING && (
                  <div className="no-messages-found mt-5">
                    <span>
                      <FontAwesomeIcon
                        icon={faCommentSlash}
                        color="#DEE1E0"
                        style={{ fontSize: '40px' }}
                      />
                    </span>
                    <br />
                    No notes yet
                  </div>
                )}

              {status === constants.API_STATUS.PENDING && <SmallSpinner />}
            </>
          )}

          {formMode === 'create' && (
            <>
              <label style={{ display: 'block' }}>
                  Enter your notes below
                </label>
              <textarea
                style={{ width: '-webkit-fill-available', resize: 'none' }}
                className="nodrag"
                value={newNote}
                rows={20}
                onChange={(e) => setNewNote(e.target.value)}
                disabled={status === constants.API_STATUS.PENDING}
              />
            </>
          )}

          {formMode === 'edit' && (
            <>
              <label style={{ display: 'block' }}>
                  Enter your notes below
                </label>
              <textarea
                style={{ width: '-webkit-fill-available', resize: 'none' }}
                className="nodrag"
                value={noteToEdit.note}
                rows={20}
                onChange={(e) => setNoteToEdit((n) => ({ ...n, note: e.target.value }))}
                disabled={status === constants.API_STATUS.PENDING}
              />
            </>
          )}
        </div>
        <div className="d-flex modern-modal-actions justify-content-between pt-2">
          <div style={{ flex: '50%' }}>
            <button
              type="type"
              className="modern-button fullw"
              onClick={() => {
                if (formMode === 'view') {
                  handleCloseModal();
                } else {
                  setFormMode('view');
                }
              }}
            >
              {formMode === 'view' ? 'Close' : 'Back to Notes'}
            </button>
          </div>
          <div style={{ flex: '50%' }}>
            <button
              type="type"
              className="modern-button common fullw"
              onClick={() => {
                if (formMode === 'view') {
                  setFormMode('create');
                  setNewNote('');
                }
                if (formMode === 'create') {
                  submit();
                }
                if (formMode === 'edit') {
                  update();
                }
              }}
              disabled={status === constants.API_STATUS.PENDING}
            >
              {formMode === 'view' ? 'Add Note' : ''}
              {formMode === 'create' ? 'Submit' : ''}
              {formMode === 'edit' ? 'Update Note' : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
