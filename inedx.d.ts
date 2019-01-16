interface Actions<T> {
  set: (newPresent: T) => void;
  reset: (newPresent: T) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

interface State<T> {
  past: T[];
  present: T;
  future: T[];
}

export default function useUndo<T>(initialPresent: T): [State<T>, Actions<T>];
