import { createSelector } from 'reselect';
import { initialState } from './reducer';

/**
 * Direct selector to the RaffleWrapper state domain
 */
const selectRaffle = state => state.raffleWrapper || initialState;

const makeSelectAnimation = () =>
  createSelector(
    selectRaffle,
    raffleState => raffleState.animationType,
  );

const makeSelectVisibility = () =>
  createSelector(
    selectRaffle,
    raffleState => raffleState.isOpen,
  );

export { selectRaffle, makeSelectAnimation, makeSelectVisibility };
