import { useReducer } from 'react';

const UNDO = 'UNDO';
const REDO = 'REDO';
const SET = 'SET';

const initialState = {
  past: [],
  present: null,
  future: [],
};

const reducer = (state, action) => {
  const { past, present, future } = state;

  switch (action.type) {
    case UNDO:
      const previous = past.pop();
      return {
        past,
        present: previous,
        future: [present, ...future],
      };
    case REDO:
      const next = future.shift();
      return {
        past: [...past, present],
        present: next,
        future,
      };
    case SET:
      const { newPresent } = action;
      if (newPresent === present) {
        return state;
      }
      return {
        past: [...past, present],
        present: newPresent,
        future: [],
      };
  }
};

const useUndo = initialPresent => {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    present: initialPresent,
  });

  const canUndo = state.past.length !== 0;
  const canRedo = state.future.length !== 0;
  const undo = () => {
    if (canUndo) {
      dispatch({ type: UNDO });
    }
  };
  const redo = () => {
    if (canRedo) {
      dispatch({ type: REDO });
    }
  };
  const set = newPresent => dispatch({ type: SET, newPresent });

  return [state, { set, undo, redo, canUndo, canRedo }];
};

export default useUndo;
