import Modal from 'components/Modal';
import RoomContext from 'contexts/RoomContext';
import { Formik } from 'formik';
import React, { useContext, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { updateDisplayName } from 'slices/session';
import SessionSelector from 'slices/session/selector';
import * as Yup from 'yup';
import firebase from 'firebase';

const UserSettingsFormSchema = Yup.object().shape({
  displayName: Yup.string().required('Display name is required'),
});

const Header = () => {
  const [userModalVisible, setUserModalVisible] = useState(false);
  const session = useSelector(SessionSelector.getSession);
  const formikRef = useRef();
  const dispatch = useDispatch();
  const roomContext = useContext(RoomContext);

  const toggleUserModal = () => {
    setUserModalVisible((prevState) => !prevState);
  };

  return (
    <>
      <header id="header">
        <div className="w-full max-w-6xl mx-auto">
          <div className="px-4 flex flex-row items-center">
            <Link className="logo mr-4" to="/">
              Tugether
            </Link>
            {roomContext.room && (
              <span className="text-gray-600">Room: {roomContext.room.name}</span>
            )}
            <div className="ml-auto">
              <button
                type="button"
                onClick={toggleUserModal}
                className="focus:outline-none flex flex-row space-x-2 items-center"
              >
                <div className="h-4 w-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-settings"
                  >
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                </div>
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <Modal visible={userModalVisible} close={toggleUserModal}>
        <Formik
          validationSchema={UserSettingsFormSchema}
          initialValues={{ displayName: session.displayName || '' }}
          innerRef={formikRef}
          onSubmit={(values) => {
            if (roomContext.room) {
              firebase
                .database()
                .ref(`/users/${roomContext.room.id}/${session.id}`)
                .update({ name: values.displayName });
              roomContext.writeLog(`renamed to ${values.displayName}`);
            }
            dispatch(updateDisplayName(values.displayName));
            toggleUserModal();
          }}
        >
          {({ handleChange, handleBlur, handleSubmit, touched, errors, values }) => (
            <form onSubmit={handleSubmit}>
              <div className="font-bold mb-4 border-b pb-2 text-lg">Update Settings</div>
              <div className="mb-1 text-sm">Display Name</div>
              <div className="mb-4">
                <input
                  className="px-3 py-2 focus:outline-none bg-gray-100 w-full"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="displayName"
                  autoComplete="off"
                  value={values.displayName}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-3 py-2 focus:outline-none border"
                  onClick={toggleUserModal}
                >
                  Cancel
                </button>
                <button type="submit" className="px-3 py-2 focus:outline-none border">
                  Save
                </button>
              </div>
            </form>
          )}
        </Formik>
      </Modal>
    </>
  );
};

export default Header;
