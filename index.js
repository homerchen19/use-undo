import { useReducer, useCallback } from 'react';

const UNDO = 'UNDO';
const REDO = 'REDO';
const SET = 'SET';
const RESET = 'RESET';

const initialState = {
  past: [],
  present: null,
  future: [],
};

const reducer = (state, action) => {
  const { past, present, future } = state;

  switch (action.type) {
    case UNDO: {
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);

      return {
        past: newPast,
        present: previous,
        future: [present, ...future],
      };
    }

    case REDO: {
      const next = future[0];
      const newFuture = future.slice(1);

      return {
        past: [...past, present],
        present: next,
        future: newFuture,
      };
    }

    case SET: {
      let { newPresent } = action;
      if (typeof newPresent === 'function') {
        newPresent = newPresent(present);
      }

      if (newPresent === present) {
        return state;
      }
      return {
        past: [...past, present],
        present: newPresent,
        future: [],
      };
    }

    case RESET: {
      let { newPresent } = action;
      if (typeof newPresent === 'function') {
        newPresent = newPresent(present);
      }

      return {
        past: [],
        present: newPresent,
        future: [],
      };
    }
  }
};

const useUndo = initialPresent => {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    present: initialPresent,
  });

  const canUndo = state.past.length !== 0;
  const canRedo = state.future.length !== 0;
  const undo = useCallback(() => {
    if (canUndo) {
      dispatch({ type: UNDO });
    }
  }, [canUndo]);
  const redo = useCallback(() => {
    if (canRedo) {
      dispatch({ type: REDO });
    }
  }, [canRedo]);
  const set = useCallback(
    newPresent => dispatch({ type: SET, newPresent }),
    []
  );
  const reset = useCallback(
    newPresent => dispatch({ type: RESET, newPresent }),
    []
  );

  return [state, { set, reset, undo, redo, canUndo, canRedo }];
};

export default useUndo;
