import youtube, { API_KEY } from 'apis/youtube';
import axios from 'axios';
import { debounce, unescape } from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import firebase from 'firebase';

const Search = () => {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [debouncedTerm, setDebouncedTerm] = useState(term);
  const debounceSetTerm = useCallback(debounce(setDebouncedTerm, 500), []);
  const wrapperRef = useRef(null);

  const handleSearch = async () => {
    if (debouncedTerm) {
      setIsLoading(true);
      // const response = await youtube.get('/search', {
      //   params: {
      //     q: debouncedTerm,
      //     part: 'snippet',
      //     type: 'video',
      //     key: API_KEY,
      //   },
      // });
      const response = await axios.get(
        'https://gist.githubusercontent.com/sonnm/c8027497d5e4237fc0a4195ce4c28550/raw/6f968327529556e558fb51b9d07553f6a77b9951/response.json'
      );
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

  useEffect(() => {
    handleSearch();
  }, [debouncedTerm]);

  useEffect(() => {
    const handleClick = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [wrapperRef]);

  return (
    <div className="search-video relative" ref={wrapperRef}>
      <div className="mb-6">
        <input
          className="focus:outline-none px-3 py-2 w-full"
          placeholder="Video Search..."
          value={term}
          onChange={handleTermChange}
          onClick={() => setIsFocused(true)}
        />
      </div>
      {isFocused && (isLoading || results.length > 0) && (
        <div className="search-results-wrapper">
          <div className="search-results">
            {isLoading && (
              <div className="absolute top-0 left-0 bottom-0 right-0 bg-white opacity-60 flex items-center justify-center">
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
                    <button type="button" className="focus:outline-none px-2 py-1 border text-sm">
                      Play now
                    </button>
                    <button type="button" className="focus:outline-none px-2 py-1 border text-sm">
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
  );
};

export default Search;
