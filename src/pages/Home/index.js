import { Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import firebase from 'firebase';
import Modal from 'components/Modal';
import * as Yup from 'yup';

const CreateRoomSchema = Yup.object().shape({
  roomName: Yup.string()
    .min(5, 'Room name must be longer than 5 characters')
    .required('Room name is required'),
  roomPassword: Yup.string(),
});

const Home = () => {
  const history = useHistory();
  const [roomId, setRoomId] = useState('');
  const [createRoomModalVisible, setCreateRoomModalVisible] = useState(false);

  const toggleCreateRoomModal = () => {
    setCreateRoomModalVisible((prevState) => !prevState);
  };

  const onSubmit = (values) => {
    firebase
      .database()
      .ref(`/rooms/${values.roomId}`)
      .once('value')
      .then((snapshot) => {
        if (snapshot.exists()) history.push(`/room/${values.roomId}`);
        else {
          setRoomId(values.roomId);
          toggleCreateRoomModal();
        }
      });
  };

  const onCreateRoomSubmit = async (values) => {
    await firebase
      .database()
      .ref(`/rooms/${roomId}`)
      .set({
        id: roomId,
        name: values.roomName,
        password: values.roomPassword,
      })
      .then(() => {
        history.push(`/room/${roomId}`);
      });
  };

  return (
    <>
      <div className="h-96 flex flex-col items-center justify-center">
        <h1 className="leading-tight text-4xl font-bold mb-4">Create or join a room</h1>
        <p className="max-w-xl mb-5">Watch Youtube video&apos;s together in realtime.</p>
        <div>
          <Formik
            initialValues={{ roomId: '' }}
            validate={(values) => {
              const errors = {};
              if (!values.roomId) {
                errors.roomId = 'Required';
              } else if (!/^[A-Z0-9.-]+$/i.test(values.roomId)) {
                errors.roomId = 'Invalid room ID';
              }
              return errors;
            }}
            onSubmit={onSubmit}
          >
            {({ handleChange, handleBlur, handleSubmit, values }) => (
              <form onSubmit={handleSubmit}>
                <input
                  className="px-4 py-3 focus:outline-none bg-white mr-3 w-64 dark:bg-gray-800"
                  placeholder="Room ID"
                  value={values.roomId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="roomId"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="px-4 py-3 focus:outline-none font-bold bg-gray-200 dark:bg-gray-800"
                >
                  Submit
                </button>
              </form>
            )}
          </Formik>
        </div>
      </div>
      <Modal visible={createRoomModalVisible}>
        <Formik
          validationSchema={CreateRoomSchema}
          initialValues={{ roomName: '', roomPassword: '' }}
          onSubmit={onCreateRoomSubmit}
        >
          {({ handleChange, handleBlur, handleSubmit, touched, errors }) => (
            <form onSubmit={handleSubmit}>
              <div className="font-bold mb-4 border-b pb-2 text-lg">Create new room</div>
              <div className="mb-1 text-sm">Room ID *</div>
              <div className="mb-5">
                <input
                  className="px-3 py-2 focus:outline-none bg-gray-100 w-full dark:bg-gray-800"
                  value={roomId}
                  disabled
                />
              </div>
              <div className="mb-1 text-sm">Room Name *</div>
              <div className="mb-4">
                <input
                  className="px-3 py-2 focus:outline-none bg-gray-100 w-full mb-1 dark:bg-gray-800"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="roomName"
                  autoComplete="off"
                />
                {errors.roomName && touched.roomName ? (
                  <div className="text-sm text-red-600">{errors.roomName}</div>
                ) : null}
              </div>
              <div className="mb-1 text-sm">Room Password</div>
              <div className="mb-4">
                <input
                  className="px-3 py-2 focus:outline-none bg-gray-100 w-full dark:bg-gray-800"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="roomPassword"
                  autoComplete="off"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-3 py-2 focus:outline-none border"
                  onClick={toggleCreateRoomModal}
                >
                  Cancel
                </button>
                <button type="submit" className="px-3 py-2 focus:outline-none border">
                  Submit
                </button>
              </div>
            </form>
          )}
        </Formik>
      </Modal>
    </>
  );
};

export default Home;
