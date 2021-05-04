import React from 'react';
import firebase from 'firebase';
import Modal from 'components/Modal';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { defaultTo, find, isEmpty, shuffle, unescape } from 'lodash';
import RoomContext from 'contexts/RoomContext';

const PlaylistFormSchema = Yup.object().shape({
  playlistName: Yup.string().required('Playlist name is required'),
});

class Playlists extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      playlistFormModalVisible: false,
      selectedPlaylistId: null,
    };
    this.formikRef = React.createRef();
  }

  componentDidMount() {
    const { room } = this.context;
    this.firebaseRef = firebase.database().ref(`/playlists/${room.id}`);
  }

  componentWillUnmount() {
    this.firebaseRef.off();
  }

  togglePlaylistFormModal = () => {
    const { playlistFormModalVisible } = this.state;
    this.setState({ playlistFormModalVisible: !playlistFormModalVisible });
  };

  onEdit = () => {
    const { selectedPlaylistId } = this.state;
    const { playlists } = this.context;

    const selectedPlaylist = isEmpty(selectedPlaylistId)
      ? playlists?.[0]
      : defaultTo(find(playlists, { id: selectedPlaylistId }), playlists?.[0]);

    this.formikRef.current.setValues({ playlistName: selectedPlaylist.name, isNew: false });
    this.togglePlaylistFormModal();
  };

  onPlaylistFormSubmit = async (values) => {
    const { writeLog } = this.context;
    if (values.isNew) {
      const playlistRef = this.firebaseRef.push();
      const playlistId = playlistRef.key;
      await playlistRef.set({
        id: playlistId,
        name: values.playlistName,
        videos: [],
      });
      writeLog(`created playlist ${values.playlistName}`);
    } else {
      const { playlists } = this.context;
      const { selectedPlaylistId } = this.state;
      const selectedPlaylist = isEmpty(selectedPlaylistId)
        ? playlists?.[0]
        : defaultTo(find(playlists, { id: selectedPlaylistId }), playlists?.[0]);
      this.firebaseRef.update({
        [`/${selectedPlaylist.id}/name`]: values.playlistName,
      });
      writeLog(`updated playlist ${selectedPlaylist.name} to ${values.playlistName}`);
    }
    this.togglePlaylistFormModal();
    setTimeout(() => {
      this.formikRef.current.resetForm();
    }, 200);
  };

  onRemove = (playlist) => {
    const { writeLog } = this.context;
    this.firebaseRef.update({
      [`/${playlist.id}`]: null,
    });
    writeLog(`deleted playlist ${playlist.name}`);
  };

  onRemoveVideo = (videoId, playlistId) => {
    this.firebaseRef.update({
      [`/${playlistId}/videos/${videoId}`]: null,
    });
  };

  onShufflePlay = (playlist) => {
    const { room, playVideo, writeLog } = this.context;
    const videos = shuffle(Object.values(playlist.videos));
    firebase.database().ref(`/players/${room.id}/playlist`).set(videos);
    playVideo(videos[0], false);
    writeLog(`shuffle played ${playlist.name}`);
  };

  render() {
    const { playlistFormModalVisible, selectedPlaylistId } = this.state;
    const { playlists, playVideo } = this.context;

    const selectedPlaylist = isEmpty(selectedPlaylistId)
      ? playlists?.[0]
      : defaultTo(find(playlists, { id: selectedPlaylistId }), playlists?.[0]);

    return (
      <>
        <div className="mb-4 flex flex-row items-baseline justify-between border-b h-8">
          <div className="flex flex-row items-center space-x-2">
            <div className="w-4 h-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="feather feather-list"
              >
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </div>
            <span className="font-semibold">Playlists</span>
          </div>
          <button type="button" onClick={this.togglePlaylistFormModal}>
            Add new playlist
          </button>
        </div>
        <div className="flex flex-wrap">
          {playlists.map((playlist) => (
            <button
              key={`playing-list-video-${playlist.id}`}
              type="button"
              className={`bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full mb-4 mr-4 ${
                selectedPlaylist?.id === playlist.id && 'active bg-blue-100 text-blue-400'
              }`}
              onClick={() => {
                this.setState({ selectedPlaylistId: playlist.id });
              }}
            >
              {playlist.name}
            </button>
          ))}
        </div>
        {selectedPlaylist && (
          <>
            <div className="mb-2 flex flex-row justify-between z-0 items-center">
              <div className="flex flex-row items-center space-x-4">
                {!isEmpty(selectedPlaylist.videos) && (
                  <button
                    type="button"
                    className="border px-3 py-1"
                    onClick={() => this.onShufflePlay(selectedPlaylist)}
                  >
                    Shuffle Play
                  </button>
                )}
                <button type="button" className="border px-3 py-1" onClick={this.onEdit}>
                  Edit
                </button>
                <button
                  type="button"
                  className="border px-3 py-1"
                  onClick={() => this.onRemove(selectedPlaylist)}
                >
                  Delete
                </button>
              </div>
              <span className="text-gray-500">
                {Object.values(defaultTo(selectedPlaylist?.videos, {})).length} videos
              </span>
            </div>
            {!isEmpty(selectedPlaylist.videos) && (
              <div className="playlist divide-y dark:divide-gray-800">
                {Object.values(selectedPlaylist.videos).map((video) => (
                  <div
                    key={video.id}
                    className="w-full flex flex-row space-x-4 text-sm py-2 items-center text-left relative item"
                  >
                    <div
                      className="w-16 h-16 bg-cover bg-center bg-no-repeat flex-shrink-0"
                      style={{ backgroundImage: `url(${video.thumbnail})` }}
                    ></div>
                    <div className="flex-grow min-w-0">
                      <div className="font-semibold truncate">{unescape(video.title)}</div>
                      <div className="truncate">{video.channelTitle}</div>
                    </div>
                    <div className="top-0 bottom-0 right-2 absolute flex flex-row transform transition actions items-center space-x-4">
                      <button
                        type="button"
                        className="p-2 bg-white w-10 h-10 rounded-full border dark:bg-gray-800"
                        onClick={() => {
                          playVideo(video);
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="feather feather-play-circle"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <polygon points="10 8 16 12 10 16 10 8"></polygon>
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="p-2 bg-white w-10 h-10 rounded-full border dark:bg-gray-800"
                        onClick={() => {
                          this.onRemoveVideo(video.id, selectedPlaylist.id);
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="feather feather-trash-2"
                        >
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        <Modal
          visible={playlistFormModalVisible}
          close={() => {
            this.togglePlaylistFormModal();
            setTimeout(() => {
              this.formikRef.current.resetForm();
            }, 200);
          }}
        >
          <Formik
            validationSchema={PlaylistFormSchema}
            initialValues={{ isNew: true, playlistName: '' }}
            onSubmit={this.onPlaylistFormSubmit}
            innerRef={this.formikRef}
          >
            {({ handleChange, handleBlur, handleSubmit, touched, errors, values }) => (
              <form onSubmit={handleSubmit}>
                <div className="font-bold mb-4 border-b pb-2 text-lg">
                  {values.isNew ? 'Add new playlist' : 'Update playlist'}
                </div>
                <div className="mb-1 text-sm">Name</div>
                <div className="mb-4">
                  <input
                    className="px-3 py-2 focus:outline-none bg-gray-100 w-full mb-1 dark:bg-gray-800"
                    placeholder="Enter Playlist Name"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    name="playlistName"
                    autoComplete="off"
                    value={values.playlistName}
                  />
                  {errors.playlistName && touched.playlistName ? (
                    <div className="text-sm text-red-400">{errors.playlistName}</div>
                  ) : null}
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    className="px-3 py-2 focus:outline-none border"
                    onClick={() => {
                      this.togglePlaylistFormModal();
                      setTimeout(() => {
                        this.formikRef.current.resetForm();
                      }, 200);
                    }}
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
  }
}

Playlists.contextType = RoomContext;

export default Playlists;
