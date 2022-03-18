import React from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';

import useUndo from '../index';

const UndoComponent = ({
  disabled,
  manualCheckpoints,
}: {
  disabled: boolean;
  manualCheckpoints: boolean;
}) => {
  const [
    countState,
    {
      set: setCount,
      reset: resetCount,
      undo: undoCount,
      redo: redoCount,
      canUndo,
      canRedo,
    },
  ] = useUndo(0, { useCheckpoints: manualCheckpoints });
  const { present: presentCount } = countState;
  const doubleRedoCount = () => {
    redoCount();
    redoCount();
  };
  const doubleUndoCount = () => {
    undoCount();
    undoCount();
  };

  return (
    <div>
      <p data-testid="count">count: {presentCount}</p>
      <button
        key="withcheck-increment"
        data-testid="withcheck-increment"
        onClick={() => setCount(presentCount + 1, true)}
      >
        Checkpoint+
      </button>
      <button
        key="withcheck-decrement"
        data-testid="withcheck-decrement"
        onClick={() => setCount(presentCount - 1, true)}
      >
        Checkpoint-
      </button>
      <button
        key="unchange"
        data-testid="unchange"
        onClick={() => setCount(presentCount)}
      >
        unchange
      </button>
      <button
        key="nocheckincrement"
        data-testid="nocheckincrement"
        onClick={() => setCount(presentCount + 1)}
      >
        NoCheckpoint+
      </button>
      <button
        key="nocheckdecrement"
        data-testid="nocheckdecrement"
        onClick={() => setCount(presentCount - 1)}
      >
        NoCheckpoint-
      </button>
      <button
        key="undo"
        data-testid="undo"
        onClick={undoCount}
        disabled={disabled && !canUndo}
      >
        undo
      </button>
      <button
        key="redo"
        data-testid="redo"
        onClick={redoCount}
        disabled={disabled && !canRedo}
      >
        redo
      </button>
      <button
        key="double undo"
        data-testid="double undo"
        onClick={doubleUndoCount}
        disabled={disabled && !canUndo}
      >
        double undo
      </button>
      <button
        key="double redo"
        data-testid="double redo"
        onClick={doubleRedoCount}
        disabled={disabled && !canRedo}
      >
        double redo
      </button>
      <button key="reset" data-testid="reset" onClick={() => resetCount(0)}>
        reset to 0
      </button>
    </div>
  );
};

type SetupArg = {
  defaultDisabled: boolean;
  manualCheckpoints: boolean;
};

const setup = (opts: Partial<SetupArg> = {}) => {
  const { defaultDisabled, manualCheckpoints }: Partial<SetupArg> = {
    defaultDisabled: true,
    manualCheckpoints: false,
    ...opts,
  };
  const { getByTestId } = render(
    <UndoComponent
      disabled={defaultDisabled}
      manualCheckpoints={manualCheckpoints}
    />
  );

  const count = getByTestId('count');
  const unchangeButton = getByTestId('unchange') as HTMLButtonElement;

  const withcheckincrementButton = getByTestId(
    'withcheck-increment'
  ) as HTMLButtonElement;
  const withcheckdecrementButton = getByTestId(
    'withcheck-decrement'
  ) as HTMLButtonElement;
  const nocheckincrementButton = getByTestId(
    'nocheckincrement'
  ) as HTMLButtonElement;
  const nocheckdecrementButton = getByTestId(
    'nocheckdecrement'
  ) as HTMLButtonElement;
  const undoButton = getByTestId('undo') as HTMLButtonElement;
  const redoButton = getByTestId('redo') as HTMLButtonElement;
  const doubleUndoButton = getByTestId('double undo') as HTMLButtonElement;
  const doubleRedoButton = getByTestId('double redo') as HTMLButtonElement;
  const resetButton = getByTestId('reset') as HTMLButtonElement;

  return {
    count,
    unchangeButton,
    nocheckincrementButton,
    nocheckdecrementButton,
    withcheckincrementButton,
    withcheckdecrementButton,
    undoButton,
    redoButton,
    doubleUndoButton,
    doubleRedoButton,
    resetButton,
  };
};

describe('use-undo', () => {
  afterEach(cleanup);

  it('should exist', () => {
    expect(useUndo).toBeDefined();
  });

  it('should work with checkpoints', () => {
    const {
      count,
      unchangeButton,
      withcheckincrementButton,
      withcheckdecrementButton,
      undoButton,
      redoButton,
      resetButton,
    } = setup({ manualCheckpoints: true });

    // with checkpoints test cases
    expect(count.textContent).toBe('count: 0');
    expect(undoButton.disabled).toBe(true);
    expect(redoButton.disabled).toBe(true);

    fireEvent.click(withcheckincrementButton);
    fireEvent.click(withcheckincrementButton);
    fireEvent.click(withcheckincrementButton);

    expect(count.textContent).toBe('count: 3');
    expect(undoButton.disabled).toBe(false);
    expect(redoButton.disabled).toBe(true);

    fireEvent.click(unchangeButton);

    expect(count.textContent).toBe('count: 3');
    expect(undoButton.disabled).toBe(false);
    expect(redoButton.disabled).toBe(true);

    fireEvent.click(withcheckdecrementButton);
    fireEvent.click(withcheckdecrementButton);
    fireEvent.click(withcheckdecrementButton);

    expect(count.textContent).toBe('count: 0');
    expect(undoButton.disabled).toBe(false);
    expect(redoButton.disabled).toBe(true);

    fireEvent.click(undoButton);
    fireEvent.click(undoButton);
    fireEvent.click(undoButton);

    expect(count.textContent).toBe('count: 3');
    expect(undoButton.disabled).toBe(false);
    expect(redoButton.disabled).toBe(false);

    fireEvent.click(redoButton);
    fireEvent.click(redoButton);
    fireEvent.click(redoButton);

    expect(count.textContent).toBe('count: 0');
    expect(undoButton.disabled).toBe(false);
    expect(redoButton.disabled).toBe(true);

    fireEvent.click(undoButton);
    fireEvent.click(undoButton);
    fireEvent.click(undoButton);
    fireEvent.click(undoButton);
    fireEvent.click(undoButton);
    fireEvent.click(undoButton);

    expect(count.textContent).toBe('count: 0');
    expect(undoButton.disabled).toBe(true);
    expect(redoButton.disabled).toBe(false);

    fireEvent.click(withcheckincrementButton);
    fireEvent.click(withcheckincrementButton);
    fireEvent.click(resetButton);

    expect(count.textContent).toBe('count: 0');
    expect(undoButton.disabled).toBe(true);
    expect(redoButton.disabled).toBe(true);
  });

  it('should work without checkpoints', () => {
    const {
      count,
      unchangeButton,
      nocheckincrementButton,
      nocheckdecrementButton,
      undoButton,
      redoButton,
      resetButton,
    } = setup({ manualCheckpoints: true });

    // without checkpoints test cases
    expect(count.textContent).toBe('count: 0');
    expect(undoButton.disabled).toBe(true);
    expect(redoButton.disabled).toBe(true);

    fireEvent.click(nocheckincrementButton);
    fireEvent.click(nocheckincrementButton);
    fireEvent.click(nocheckincrementButton);

    expect(count.textContent).toBe('count: 3');
    expect(undoButton.disabled).toBe(true);
    expect(redoButton.disabled).toBe(true);

    fireEvent.click(unchangeButton);

    expect(count.textContent).toBe('count: 3');
    expect(undoButton.disabled).toBe(true);
    expect(redoButton.disabled).toBe(true);

    fireEvent.click(nocheckdecrementButton);
    fireEvent.click(nocheckdecrementButton);
    fireEvent.click(nocheckdecrementButton);

    expect(count.textContent).toBe('count: 0');
    expect(undoButton.disabled).toBe(true);
    expect(redoButton.disabled).toBe(true);

    fireEvent.click(nocheckincrementButton);
    fireEvent.click(nocheckincrementButton);
    fireEvent.click(resetButton);

    expect(count.textContent).toBe('count: 0');
    expect(undoButton.disabled).toBe(true);
    expect(redoButton.disabled).toBe(true);
  });

  it('present count should not be changed when canUndo or canRedo is false', () => {
    const { count, undoButton, redoButton } = setup({ defaultDisabled: false });

    expect(count.textContent).toBe('count: 0');
    expect(undoButton.disabled).toBe(false);
    expect(redoButton.disabled).toBe(false);

    fireEvent.click(undoButton);

    expect(count.textContent).toBe('count: 0');

    fireEvent.click(redoButton);

    expect(count.textContent).toBe('count: 0');
  });

  describe('when it can undo once', () => {
    describe('when calling undo multiple times in succession', () => {
      it('should return to the initial state', () => {
        const { count, doubleUndoButton, withcheckincrementButton } = setup();

        fireEvent.click(withcheckincrementButton);

        fireEvent.click(doubleUndoButton);

        expect(count.textContent).toBe('count: 0');
      });
    });
  });

  describe('when it can redo once', () => {
    describe('when calling redo multiple times in succession', () => {
      it('should return to the last state', () => {
        const {
          count,
          undoButton,
          doubleRedoButton,
          withcheckincrementButton,
        } = setup();

        fireEvent.click(withcheckincrementButton);
        fireEvent.click(undoButton);

        fireEvent.click(doubleRedoButton);

        expect(count.textContent).toBe('count: 1');
      });
    });
  });
});
