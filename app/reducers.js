/**
 * Combine all reducers in this file and export the combined reducers.
 */

import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import history from './utils/history';
import homePageReducer from './containers/HomePage/reducer';
import languageProviderReducer from './containers/LanguageProvider/reducer';
import styleProviderReducer from './containers/StyleProvider/reducer';
import raffleWrapperReducer from './components/RaffleWrapper/reducer';

/**
 * Merges the main reducer with the router state and dynamically injected reducers
 */
export default function createReducer(injectedReducers = {}) {
  const rootReducer = combineReducers({
    language: languageProviderReducer,
    theme: styleProviderReducer,
    raffleWrapper: raffleWrapperReducer,
    streamInfo: homePageReducer,
    router: connectRouter(history),
    ...injectedReducers,
  });

  return rootReducer;
}
