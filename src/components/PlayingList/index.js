import React from 'react';
import RoomContext from 'contexts/RoomContext';

class PlayingList extends React.PureComponent {
  render() {
    const { player, playVideo } = this.context;
    if (!player) return null;
    return (
      <>
        <div className="bg-white absolute bottom-full right-0 p-4 w-80 mb-4 h-96 flex-col z-40 panel">
          <div className="mb-4 font-semibold">Playing List</div>
          <div className="overflow-y-auto playing-next">
            {player.playlist && (
              <>
                {player.playlist.map((video) => (
                  <button
                    type="button"
                    key={video.id}
                    className={`w-full flex flex-row space-x-4 text-sm p-2 items-center text-left opacity-60 item ${
                      player.videoId === video.id ? 'active' : null
                    }`}
                    onClick={() => {
                      playVideo(video);
                    }}
                  >
                    <div
                      className="w-10 h-10 bg-cover bg-no-repeat flex-shrink-0"
                      style={{ backgroundImage: `url(${video.thumbnail})` }}
                    ></div>
                    <div className="flex-grow min-w-0 text-xs">
                      <div className="font-semibold truncate">{video.title}</div>
                      <div className="truncate">{video.channelTitle}</div>
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      </>
    );
  }
}

PlayingList.contextType = RoomContext;

export default PlayingList;
