import youtube from 'apis/youtube';
import { debounce, unescape } from 'lodash';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import firebase from 'firebase';
import Modal from 'components/Modal';
import RoomContext from 'contexts/RoomContext';

const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;

const Search = ({ playlists, room }) => {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isPlaylistsModalVisible, setIsPlaylistsModalVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [debouncedTerm, setDebouncedTerm] = useState(term);

  const debounceSetTerm = useCallback(debounce(setDebouncedTerm, 500), []);
  const wrapperRef = useRef(null);
  const roomContext = useContext(RoomContext);

  const handleSearch = async () => {
    if (debouncedTerm) {
      setIsLoading(true);
      const response = await youtube.get('/search', {
        params: {
          q: debouncedTerm,
          part: 'snippet',
          type: 'video',
          key: API_KEY,
        },
      });
      // const response = await axios.get(
      //   'https://gist.githubusercontent.com/sonnm/c8027497d5e4237fc0a4195ce4c28550/raw/6f968327529556e558fb51b9d07553f6a77b9951/response.json'
      // );
      setResults(response.data.items);
      setIsLoading(false);
    } else {
      setResults([]);
    }
  };

  const handleTermChange = (event) => {
    setTerm(event.target.value);
    debounceSetTerm(event.target.value);
  };

  const handlePlay = async (video) => {
    roomContext.playVideo(video);
    setIsFocused(false);
    setResults([]);
    setTerm('');
  };

  const onAddToPlaylist = (item) => {
    setSelectedVideo(item);
    setIsPlaylistsModalVisible(true);
  };

  const handleAddToPlaylist = (playlistId) => {
    firebase
      .database()
      .ref(`/playlists/${room.id}/${playlistId}/videos/${selectedVideo.id.videoId}`)
      .set({
        id: selectedVideo.id.videoId,
        title: selectedVideo.snippet.title,
        channelTitle: selectedVideo.snippet.channelTitle,
        url: `https://www.youtube.com/watch?v=${selectedVideo.id.videoId}`,
        thumbnail: selectedVideo.snippet.thumbnails.medium.url,
      });

    setIsPlaylistsModalVisible(false);
  };

  useEffect(() => {
    handleSearch();
  }, [debouncedTerm]);

  useEffect(() => {
    const handleClick = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        // setIsFocused(false);
        // setTerm('');
        // setResults([]);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [wrapperRef]);

  return (
    <>
      <Modal
        visible={isPlaylistsModalVisible}
        close={() => {
          setIsPlaylistsModalVisible(false);
        }}
      >
        <div className="font-bold mb-2 border-b pb-2 text-lg">Add to playlist</div>
        <div className="divide-y divide-gray-100">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="py-2 flex flex-row w-full focus:outline-none items-center"
            >
              <div className="w-12 h-12 bg-gray-100 mr-2">
                {playlist?.videos && (
                  <div
                    className="w-12 h-12 bg-center bg-no-repeat bg-cover"
                    style={{
                      backgroundImage: `url(${Object.values(playlist?.videos)[0].thumbnail})`,
                    }}
                  ></div>
                )}
              </div>
              <div>
                <div className="font-semibold">{playlist.name}</div>
                <div className="text-gray-600 text-xs">
                  {Object.values(playlist?.videos || {}).length || 0} videos
                </div>
              </div>
              <button
                type="button"
                className="focus:outline-none ml-auto border px-3 py-1"
                onClick={() => {
                  handleAddToPlaylist(playlist.id);
                }}
              >
                Add to playlist
              </button>
            </div>
          ))}
        </div>
      </Modal>
      <div className="search-video relative" ref={wrapperRef}>
        <div className="mb-6 relative">
          <input
            className="focus:outline-none px-3 py-2 w-full bg-gray-100 dark:bg-gray-800"
            placeholder="Video Search..."
            value={term}
            onChange={handleTermChange}
            onClick={() => setIsFocused(true)}
          />
          {isFocused && term !== '' && (
            <button
              type="button"
              className="absolute top-2 right-2"
              onClick={() => {
                setTerm('');
                setIsFocused(false);
                setResults([]);
              }}
            >
              Close
            </button>
          )}
        </div>
        {isFocused && (isLoading || results.length > 0) && (
          <div className="search-results-wrapper z-30 shadow-lg">
            <div className="search-results">
              {isLoading && (
                <div className="absolute top-0 left-0 bottom-0 right-0 bg-gray-800 opacity-75 flex items-center justify-center">
                  <div>Loading...</div>
                </div>
              )}
              {results.map((item) => (
                <div key={item.id.videoId} className="flex flex-row mb-4">
                  <div style={{ width: '180px', minWidth: '180px' }} className="mr-4">
                    <img src={item.snippet.thumbnails.medium.url} alt="" />
                  </div>
                  <div>
                    <div className="font-bold mb-1">{unescape(item.snippet.title)}</div>
                    <div className="text-sm mb-2 text-gray-500">{item.snippet.channelTitle}</div>
                    <div className="space-x-2">
                      <button
                        type="button"
                        className="focus:outline-none px-2 py-1 border text-sm"
                        onClick={() => {
                          handlePlay({ id: item.id.videoId, title: item.snippet.title });
                        }}
                      >
                        Play now
                      </button>
                      <button
                        type="button"
                        className="focus:outline-none px-2 py-1 border text-sm"
                        onClick={() => {
                          onAddToPlaylist(item);
                        }}
                      >
                        Add to Playlist
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Search;
