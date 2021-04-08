import React from 'react';
import { Link } from 'react-router-dom';

const Tos = () => (
  <article className="prose-sm">
    <h1>Terms of Service</h1>
    <p>
      Every time you visit this website (
      <Link to="/" className="text-blue-400">
        https://tugether.vercel.app
      </Link>
      ) or use its services, you accept the following conditions.
    </p>
    <h3>Privacy Policy</h3>
    <p>
      Before you continue using our website we advise you to read our privacy policy{' '}
      <Link to="/privacy" className="text-blue-400">
        https://tugether.vercel.app/privacy
      </Link>{' '}
      regarding our user data collection. It will help you better understand our practices.
    </p>
    <h3>Your Account</h3>
    <p>
      When you create a room, you are responsible for maintaining the security of your room and you
      are fully responsible for all activities that occur in the room and any other actions taken in
      connection with the room. You must immediately notify us of any unauthorized uses of your
      room, your us account, or any other breaches of security. We will not be liable for any acts
      or omissions by you, including any damages of any kind incurred as a result of such acts or
      omissions.
    </p>
    <h3>YouTube API Services</h3>
    <p>
      We use YouTube API Services on our website to provide functionalities for embedded videos.
      YouTube Terms of Service can be found at{' '}
      <a href="https://www.youtube.com/t/terms" className="text-blue-400">
        https://www.youtube.com/t/terms
      </a>
    </p>
  </article>
);

export default Tos;
