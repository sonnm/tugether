import React, { useEffect } from 'react';
import Footer from 'components/Footer';
import Header from 'components/Header';
import Home from 'pages/Home';
import PageNotFound from 'pages/PageNotFound';
import { Redirect, Route, Switch } from 'react-router-dom';
import Room from 'pages/Room';
import config from 'firebase/config';
import firebase from 'firebase';

import './styles/tailwind.scss';
import './styles/main.scss';
import SessionSelector from 'slices/session/selector';
import { generateId } from 'slices/session';
import { connect } from 'react-redux';
import Privacy from 'pages/Privacy';
import Tos from 'pages/Tos';
import { RoomContextProvider } from 'contexts/RoomContext';

firebase.initializeApp(config);

const App = (props) => {
  const { session, dispatch } = props;

  useEffect(() => {
    if (!session.id) dispatch(generateId());
  }, []);

  useEffect(() => {
    if (session.darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [session.darkMode]);

  return (
    <RoomContextProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div
          id="content"
          className="w-full max-w-6xl mx-auto flex-grow flex flex-row items-stretch"
        >
          <div className="px-4 w-full">
            <Switch>
              <Route exact path="/" component={Home} />
              <Route exact path="/room/:roomId" component={Room} />
              <Route exact path="/privacy" component={Privacy} />
              <Route exact path="/tos" component={Tos} />
              <Route exact path="/404" component={PageNotFound} />
              <Redirect from="*" to="/404" />
            </Switch>
          </div>
        </div>
        <Footer />
      </div>
    </RoomContextProvider>
  );
};

const mapStateToProps = (state) => ({
  session: SessionSelector.getSession(state),
});

export default connect(mapStateToProps)(App);
