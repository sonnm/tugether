import React from 'react';
import firebase from 'firebase';
import Player from 'components/Player';
import { Formik } from 'formik';
import { connect } from 'react-redux';
import SessionSelector from 'slices/session/selector';
import Playlists from 'components/Playlists';
import Search from 'components/Search';
import RoomContext from 'contexts/RoomContext';
import PlayingList from 'components/PlayingList';
import Messages from 'components/Messages';
import Logs from 'components/Logs';
import Users from 'components/Users';

const messageAudio = new Audio('/hiccup.mp3');
const daucatmoiAudio = new Audio('/daucatmoi.mp3');

class Room extends React.Component {
  constructor(props) {
    super(props);
    const { match } = this.props;
    this.roomId = match.params.roomId;
    this.state = {
      isLoading: true,
      isAuthenticated: false,
      isExist: false,
      isMessagePanelVisible: false,
      isPlayingListPanelVisible: false,
    };
  }

  componentDidMount() {
    const { history, session } = this.props;
    const { setRoom } = this.context;

    firebase
      .database()
      .ref(`/users/${this.roomId}/${session.id}`)
      .once('value')
      .then((snapshot) => {
        if (snapshot.exists()) this.setState({ isExist: true });
      });

    firebase
      .database()
      .ref(`/rooms/${this.roomId}`)
      .once('value')
      .then((snapshot) => {
        if (!snapshot.exists()) history.push('/404');
        else {
          const room = snapshot.val();
          setRoom(room);
          this.setState({ isLoading: false }, () => {
            const { isExist, isAuthenticated } = this.state;
            if (!isExist) {
              if (!(!isAuthenticated && room.password.length > 0)) this.initRoom();
            }
          });
        }
      });
  }

  componentWillUnmount() {
    const { session } = this.props;
    const { writeLog, reset } = this.context;
    const displayName = session.displayName || 'Anonymous';
    if (this.firebaseUserRef !== undefined) this.firebaseUserRef.remove();
    if (this.firebaseLogRef !== undefined) {
      this.firebaseLogRef.set({
        message: `${displayName} disconnected`,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
      });
      this.firebaseLogRef.off();
    }
    if (this.usersRef !== undefined) this.usersRef.off();
    if (this.logsRef !== undefined) this.logsRef.off();
    if (this.messagesRef !== undefined) this.messagesRef.off();
    if (this.playlistsRef !== undefined) this.playlistsRef.off();
    reset();
  }

  initRoom = () => {
    const { session } = this.props;
    const { writeLog, setPlaylists, setMessages, setLogs, setUsers } = this.context;
    const displayName = session.displayName || 'Anonymous';
    const connectedRef = firebase.database().ref('.info/connected');
    connectedRef.on('value', (snapshot) => {
      if (snapshot.val() === true) {
        this.firebaseUserRef = firebase.database().ref(`/users/${this.roomId}/${session.id}`);
        this.firebaseUserRef.set({ id: session.id, name: session.displayName || null });
        this.firebaseUserRef.onDisconnect().remove();

        writeLog(`joined the room`);

        this.firebaseLogRef = firebase.database().ref(`/logs/${this.roomId}`).push();
        this.firebaseLogRef.onDisconnect().set({
          message: `${displayName} disconnected`,
          timestamp: firebase.database.ServerValue.TIMESTAMP,
        });
      }
    });

    this.usersRef = firebase.database().ref(`/users/${this.roomId}`);
    this.usersRef.on('value', (snapshot) => {
      const users = snapshot.val();
      setUsers(users ? Object.values(users) : []);
    });

    this.playlistsRef = firebase.database().ref(`/playlists/${this.roomId}`);
    this.playlistsRef.on('value', (snapshot) => {
      const playlists = snapshot.val();
      setPlaylists(playlists ? Object.values(playlists) : []);
    });

    this.messagesRef = firebase.database().ref(`/messages/${this.roomId}`);
    this.messagesRef
      .orderByChild('timestamp')
      .startAt(Date.now() - 600000)
      .on('child_added', (snapshot) => {
        const { messages } = this.context;
        const message = snapshot.val();
        setMessages([
          {
            key: snapshot.key,
            ...message,
          },
          ...messages,
        ]);
        if (message.message === 'daucatmoi') daucatmoiAudio.play();
        else if (message.userId !== session.id) messageAudio.play();
      });

    this.logsRef = firebase.database().ref(`/logs/${this.roomId}`);
    this.logsRef
      .orderByChild('timestamp')
      .startAt(Date.now())
      .on('child_added', (snapshot) => {
        const { logs } = this.context;
        setLogs([snapshot.val(), ...logs]);
      });
  };

  render() {
    const { playlists, room } = this.context;
    const {
      isLoading,
      isAuthenticated,
      isExist,
      isMessagePanelVisible,
      isPlayingListPanelVisible,
    } = this.state;

    if (isLoading)
      return (
        <div className="h-96 flex justify-center items-center">
          <div className="animate-bounce h-16">Loading ...</div>
        </div>
      );

    if (isExist)
      return (
        <div className="h-96 flex justify-center items-center">
          <h1 className="leading-tight text-4xl font-bold">You are already joined this room</h1>
        </div>
      );

    if (!isLoading && room.password.length > 0 && !isAuthenticated)
      return (
        <div className="h-96 flex flex-col justify-center items-center">
          <h1 className="leading-tight text-4xl font-bold mb-4">This room is private</h1>
          <p className="max-w-xl mb-5">Enter room password to enter</p>
          <Formik
            initialValues={{ roomPassword: '' }}
            validate={(values) => {
              const errors = {};
              if (values.roomPassword !== room.password) {
                errors.roomPassword = 'Invalid password';
              }
              return errors;
            }}
            onSubmit={() => {
              this.setState({ isAuthenticated: true });
              this.initRoom();
            }}
          >
            {({ handleChange, handleBlur, handleSubmit }) => (
              <form onSubmit={handleSubmit}>
                <input
                  className="px-4 py-3 focus:outline-none bg-white mr-3 w-64"
                  placeholder="Room Password"
                  name="roomPassword"
                  autoComplete="off"
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <button
                  type="submit"
                  className="px-4 py-3 focus:outline-none font-bold border bg-gray-200"
                >
                  Submit
                </button>
              </form>
            )}
          </Formik>
        </div>
      );

    if (room)
      return (
        <>
          <div className="fixed bottom-10 right-10 space-x-4 flex flex-row z-30">
            <div className={`relative toggle-panel ${isMessagePanelVisible ? 'active' : null}`}>
              <Messages />
              <button
                type="button"
                className="rounded-full w-12 h-12 p-3 shadow-md"
                onClick={() => {
                  this.setState({
                    isMessagePanelVisible: !isMessagePanelVisible,
                    isPlayingListPanelVisible: false,
                  });
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
                  className="feather feather-message-circle"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              </button>
            </div>
            <div className={`relative toggle-panel ${isPlayingListPanelVisible ? 'active' : null}`}>
              <PlayingList />
              <button
                type="button"
                className="rounded-full w-12 h-12 p-3 shadow-md"
                onClick={() => {
                  this.setState({
                    isPlayingListPanelVisible: !isPlayingListPanelVisible,
                    isMessagePanelVisible: false,
                  });
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
            </div>
          </div>
          <div className="p-4 bg-white grid grid-cols-6 gap-6">
            <div className="col-span-6 md:col-span-4">
              <Search room={room} playlists={playlists} />
              <div className="mb-6">
                <Player />
              </div>
              <div className="mb-6">
                <Playlists />
              </div>
            </div>
            <div className="col-span-6 md:col-span-2">
              <Users />
              <Logs />
            </div>
          </div>
        </>
      );

    return null;
  }
}

Room.contextType = RoomContext;

const mapStateToProps = (state) => ({
  session: SessionSelector.getSession(state),
});

export default connect(mapStateToProps)(Room);
