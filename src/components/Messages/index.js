import React from 'react';
import RoomContext from 'contexts/RoomContext';
import firebase from 'firebase';
import { isEmpty } from 'lodash';
import SessionSelector from 'slices/session/selector';
import { connect } from 'react-redux';
import dayjs from 'dayjs';

class Messages extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { input: '' };
  }

  handleSendMessage = (e) => {
    e.preventDefault();
    const { session } = this.props;
    const { input } = this.state;
    const { room } = this.context;
    const message = input.trim();
    const displayName = session.displayName || 'Anonymous';
    if (!isEmpty(message)) {
      firebase.database().ref(`/messages/${room.id}`).push().set({
        user: displayName,
        userId: session.id,
        message: input,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
      });
      this.setState({ input: '' });
    }
  };

  render() {
    const { messages } = this.context;
    const { input } = this.state;
    const { session } = this.props;
    return (
      <>
        <div className="bg-white absolute bottom-full right-0 p-4 w-80 mb-4 h-96 flex-col z-40 panel">
          <div className="messages">
            {messages.map((item, index) => (
              <div
                key={item.key}
                className={`message ${session.id === item.userId ? 'self' : null}`}
              >
                {item.userId !== messages?.[index + 1]?.userId && (
                  <div className="meta">
                    <span className="author">{item.user}</span>
                    <span className="time">{dayjs(item.timestamp).format('HH:mm')}</span>
                  </div>
                )}
                <div className="content-wrapper">
                  <div className="content">{item.message}</div>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={this.handleSendMessage}>
            <input
              type="text"
              placeholder="Type a message..."
              onChange={(e) => {
                this.setState({ input: e.target.value });
              }}
              value={input}
              className="px-3 py-2 focus:outline-none bg-gray-100 w-full"
            />
          </form>
        </div>
      </>
    );
  }
}

Messages.contextType = RoomContext;

const mapStateToProps = (state) => ({
  session: SessionSelector.getSession(state),
});

export default connect(mapStateToProps)(Messages);
