import React from 'react';
import firebase from 'firebase';
import { connect } from 'react-redux';
import SessionSelector from 'slices/session/selector';

const RoomContext = React.createContext();

class Provider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      room: null,
      player: null,
      playlists: [],
      messages: [],
      users: [],
      logs: [],
    };
  }

  setRoom = (value) => {
    this.setState({ room: value });
  };

  setPlayer = (value) => {
    this.setState({ player: value });
  };

  setPlaylists = (value) => {
    this.setState({ playlists: value });
  };

  setMessages = (value) => {
    this.setState({ messages: value });
  };

  setUsers = (value) => {
    this.setState({ users: value });
  };

  setLogs = (value) => {
    this.setState({ logs: value });
  };

  writeLog = (message) => {
    const { room } = this.state;
    const { session } = this.props;
    const displayName = session.displayName || 'Anonymous';
    firebase
      .database()
      .ref(`/logs/${room.id}`)
      .push()
      .set({
        message: `${displayName} ${message}`,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
      });
  };

  playVideo = async (video, log = true) => {
    const { room } = this.state;
    await firebase
      .database()
      .ref()
      .update(
        {
          [`/players/${room.id}/videoId`]: video.id,
          [`/players/${room.id}/title`]: video.title,
          [`/players/${room.id}/played`]: 0,
          [`/players/${room.id}/playing`]: true,
        },
        (error) => {
          if (!error && log) {
            this.writeLog(`play ${video.title}`);
          }
        }
      );
  };

  reset = () => {
    this.setState({
      room: null,
      player: null,
      playlists: [],
      messages: [],
      users: [],
      logs: [],
    });
  };

  render() {
    const { children } = this.props;
    return (
      <RoomContext.Provider
        value={{
          ...this.state,
          setRoom: this.setRoom,
          setPlayer: this.setPlayer,
          setPlaylists: this.setPlaylists,
          setMessages: this.setMessages,
          setUsers: this.setUsers,
          setLogs: this.setLogs,
          writeLog: this.writeLog,
          playVideo: this.playVideo,
          reset: this.reset,
        }}
      >
        {children}
      </RoomContext.Provider>
    );
  }
}

const mapStateToProps = (state) => ({
  session: SessionSelector.getSession(state),
});

export const RoomContextProvider = connect(mapStateToProps)(Provider);

export default RoomContext;
