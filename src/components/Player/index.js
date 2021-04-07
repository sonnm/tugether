/* eslint-disable react/sort-comp */
/* eslint-disable no-underscore-dangle */
/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import ReactPlayer from 'react-player';
import Slider from 'components/Slider';
import firebase from 'firebase';
import timeHelper from 'utils/timeHelper';
import { debounce, findIndex, isEmpty } from 'lodash';
import SessionSelector from 'slices/session/selector';
import { connect } from 'react-redux';
import screenfull from 'screenfull';
import { findDOMNode } from 'react-dom';
import RoomContext from 'contexts/RoomContext';

class Player extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      duration: 0,
      volume: 0.8,
      muted: false,
    };
    this.playerRef = React.createRef();
  }

  componentDidMount() {
    const { session } = this.props;
    const { room, setPlayer } = this.context;
    this.firebaseRef = firebase.database().ref(`/players/${room.id}`);
    this.firebaseRef.on('value', (snapshot) => {
      if (!snapshot.exists()) {
        // no player
        setPlayer(null);
      } else {
        const player = snapshot.val();
        if (isEmpty(player.hostId)) {
          this.firebaseRef.update({ hostId: session.id }, (error) => {});
          this.firebaseRef.onDisconnect().update({ hostId: null }, (error) => {});
        }
        if (
          this.playerRef.current !== null &&
          Math.abs(this.playerRef.current.getCurrentTime() - player.played) > 1
        )
          this.playerRef.current.seekTo(player.played, 'seconds');
        setPlayer(player);
      }
    });
  }

  componentWillUnmount() {
    const { session } = this.props;
    const { player } = this.context;
    if (player && player.hostId === session.id) this.firebaseRef.update({ hostId: null });
    this.firebaseRef.off();
  }

  onVolumeChange = (value) => {
    this.setState({ volume: value / 100 });
  };

  onDuration = (value) => {
    this.setState({ duration: value });
  };

  onProgress = (state) => {
    const { session } = this.props;
    const { player } = this.context;
    if (player.hostId === session.id) {
      this.firebaseRef.update({ played: state.playedSeconds });
    }
  };

  onProgressChange = (value) => {
    const { duration } = this.state;
    this.firebaseRef.update({
      played: (value / 100) * duration,
    });
  };

  onProgressChangeDebounced = debounce(this.onProgressChange, 100);

  onEnded = () => {
    const { session } = this.props;
    const { player, playVideo } = this.context;
    const { playlist } = player;
    if (player.hostId === session.id) {
      if (player.loop) {
        this.firebaseRef.update({ playing: true });
      } else {
        // Next
        const index = findIndex(playlist, { id: player.videoId });
        let nextIndex = index + 1;
        if (index < 0 || index === playlist.length - 1) nextIndex = 0;
        const video = playlist[nextIndex];
        playVideo(video);
      }
    }
  };

  onPrev = () => {
    const { player, playVideo } = this.context;
    const { playlist } = player;

    const index = findIndex(playlist, { id: player.videoId });
    let prevIndex = index - 1;
    if (index === 0 || index < 0) prevIndex = playlist.length - 1;
    const video = playlist[prevIndex];
    playVideo(video);
  };

  onNext = () => {
    const { player, playVideo } = this.context;
    const { playlist } = player;

    const index = findIndex(playlist, { id: player.videoId });
    let nextIndex = index + 1;
    if (index < 0 || index === playlist.length - 1) nextIndex = 0;
    const video = playlist[nextIndex];
    playVideo(video);
  };

  onFullscreen = () => {
    // eslint-disable-next-line react/no-find-dom-node
    screenfull.request(findDOMNode(this.playerRef.current));
  };

  togglePlay = () => {
    const { player } = this.context;
    this.firebaseRef.update({ playing: !player.playing }, (error) => {
      // Log here
      const { writeLog } = this.context;
      if (!error) writeLog(`${player.playing ? 'pause' : 'play'} the video`);
    });
  };

  toggleMuted = () => {
    const { muted } = this.state;
    this.setState({ muted: !muted });
  };

  render() {
    const { volume, muted, duration } = this.state;
    const { player } = this.context;
    if (!player) return null;

    return (
      <div className="bg-white">
        <div className="font-bold mb-2">{player.title}</div>
        <ReactPlayer
          ref={this.playerRef}
          url={`https://www.youtube.com/watch?v=${player.videoId}`}
          playing={player.playing}
          onReady={() => {
            this.playerRef.current.seekTo(player.played, 'seconds');
          }}
          onDuration={this.onDuration}
          onProgress={this.onProgress}
          onEnded={this.onEnded}
          volume={volume}
          muted={muted}
          width="100%"
          height={360}
          config={{ youtube: { playerVars: { autoplay: 1, disablekb: 1 } } }}
          style={{ pointerEvents: 'none' }}
          pip
        />
        <div className="p-4 flex flex-row items-center space-x-4">
          <button type="button" className="w-6 h-6" onClick={this.onPrev}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-skip-back"
            >
              <polygon points="19 20 9 12 19 4 19 20"></polygon>
              <line x1="5" y1="19" x2="5" y2="5"></line>
            </svg>
          </button>
          <button type="button" className="w-6 h-6 focus:outline-none" onClick={this.togglePlay}>
            {player.playing ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="feather feather-pause"
              >
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="feather feather-play"
              >
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            )}
          </button>
          <button type="button" className="w-6 h-6" onClick={this.onNext}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-skip-forward"
            >
              <polygon points="5 4 15 12 5 20 5 4"></polygon>
              <line x1="19" y1="5" x2="19" y2="19"></line>
            </svg>
          </button>
          <div>{timeHelper.secondsToHms(player.played)}</div>
          <div className="flex-grow">
            <Slider
              value={duration === 0 ? 0 : (player.played / duration) * 100}
              onChange={this.onProgressChangeDebounced}
            />
          </div>
          <div>{duration === 0 ? '0:00' : timeHelper.secondsToHms(duration - player.played)}</div>
          <button type="button" className="w-6 h-6 focus:outline-none" onClick={this.toggleMuted}>
            {muted ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="feather feather-volume-x"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <line x1="23" y1="9" x2="17" y2="15"></line>
                <line x1="17" y1="9" x2="23" y2="15"></line>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="feather feather-volume-2"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
            )}
          </button>
          <div className="w-20">
            <Slider value={volume * 100} onChange={this.onVolumeChange} />
          </div>
          <button type="button" className="w-6 h-6 focus:outline-none" onClick={this.onFullscreen}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-maximize"
            >
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
            </svg>
          </button>
        </div>
      </div>
    );
  }
}

Player.contextType = RoomContext;

const mapStateToProps = (state) => ({
  session: SessionSelector.getSession(state),
});

export default connect(mapStateToProps)(Player);
