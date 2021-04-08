import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer id="footer">
    <div className="w-full max-w-6xl mx-auto mb-4">
      <div className="flex flex-row space-x-4 justify-center">
        <Link to="/tos" className="text-gray-600">
          Term of Service
        </Link>
        <Link to="/privacy" className="text-gray-600">
          Privacy Policy
        </Link>
      </div>
      <div className="py-2">Coded by Son Nguyen with {'<3'}</div>
    </div>
  </footer>
);

export default Footer;
