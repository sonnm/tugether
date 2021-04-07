import React from 'react';
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
import Search from 'pages/Search';
import { RoomContextProvider } from 'contexts/RoomContext';

class App extends React.Component {
  constructor(props) {
    super(props);
    firebase.initializeApp(config);
    const { session, dispatch } = props;
    if (!session.id) dispatch(generateId());
  }

  render() {
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
                <Route exact path="/search" component={Search} />
                <Route exact path="/room/:roomId" component={Room} />
                <Route exact path="/404" component={PageNotFound} />
                <Redirect from="*" to="/404" />
              </Switch>
            </div>
          </div>
          <Footer />
        </div>
      </RoomContextProvider>
    );
  }
}

const mapStateToProps = (state) => ({
  session: SessionSelector.getSession(state),
});

export default connect(mapStateToProps)(App);
