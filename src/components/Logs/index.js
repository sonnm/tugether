import React from 'react';
import RoomContext from 'contexts/RoomContext';
import dayjs from 'dayjs';

class Logs extends React.PureComponent {
  render() {
    const { logs } = this.context;
    return (
      <>
        <div className="mb-6">
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
                  className="feather feather-file-text"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <span className="font-semibold">Activity Logs</span>
            </div>
          </div>
          <div className="overflow-y-auto space-y-4 playing-next text-sm">
            {logs.map((log) => (
              <div key={log.timestamp} className="flex flex-row justify-between">
                <span className="mr-8 text-gray-700">{log.message}</span>
                <span className="text-gray-400">{dayjs(log.timestamp).format('HH:mm')}</span>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }
}

Logs.contextType = RoomContext;

export default Logs;
