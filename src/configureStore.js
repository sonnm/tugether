import { configureStore, getDefaultMiddleware, applyMiddleware, compose } from '@reduxjs/toolkit';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { persistStore, FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE } from 'redux-persist';
import history from 'utils/history';
import sessionReducer from 'slices/session';

const middlewares = [routerMiddleware(history)];

const store = configureStore({
  reducer: {
    router: connectRouter(history),
    session: sessionReducer,
  },
  middleware: [
    ...getDefaultMiddleware({
      thunk: true,
      immutableCheck: true,
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
    ...middlewares,
  ],
  enhancers: [compose(applyMiddleware(...middlewares))],
});

export const persistor = persistStore(store);
export default store;
