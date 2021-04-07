import React from 'react';
import RoomContext from 'contexts/RoomContext';

class Users extends React.PureComponent {
  render() {
    const { users } = this.context;
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
                  className="feather feather-users"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <span className="font-semibold">Online Users</span>
            </div>
            <span className="text-gray-400">{users.length}</span>
          </div>
          <div className="overflow-y-auto playing-next text-sm space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex flex-row justify-between">
                <span className="text-gray-700">{user.name || 'Anonymous'}</span>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }
}

Users.contextType = RoomContext;

export default Users;
