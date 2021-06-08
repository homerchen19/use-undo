import React from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';

import useUndo from '../index';

const UndoComponent = ({ disabled }: { disabled: boolean }) => {
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
  ] = useUndo(0);
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
        key="unchange"
        data-testid="unchange"
        onClick={() => setCount(presentCount)}
      >
        unchange
      </button>
      <button
        key="increment"
        data-testid="increment"
        onClick={() => setCount(presentCount + 1)}
      >
        +
      </button>
      <button
        key="decrement"
        data-testid="decrement"
        onClick={() => setCount(presentCount - 1)}
      >
        -
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

const setup = (defaultDisabled = true) => {
  const { getByTestId } = render(<UndoComponent disabled={defaultDisabled} />);

  const count = getByTestId('count');
  const unchangeButton = getByTestId('unchange') as HTMLButtonElement;
  const incrementButton = getByTestId('increment') as HTMLButtonElement;
  const decrementButton = getByTestId('decrement') as HTMLButtonElement;
  const undoButton = getByTestId('undo') as HTMLButtonElement;
  const redoButton = getByTestId('redo') as HTMLButtonElement;
  const doubleUndoButton = getByTestId('double undo') as HTMLButtonElement;
  const doubleRedoButton = getByTestId('double redo') as HTMLButtonElement;
  const resetButton = getByTestId('reset') as HTMLButtonElement;

  return {
    count,
    unchangeButton,
    incrementButton,
    decrementButton,
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

  it('should work', () => {
    const {
      count,
      unchangeButton,
      incrementButton,
      decrementButton,
      undoButton,
      redoButton,
      resetButton,
    } = setup();

    expect(count.textContent).toBe('count: 0');
    expect(undoButton.disabled).toBe(true);
    expect(redoButton.disabled).toBe(true);

    fireEvent.click(incrementButton);
    fireEvent.click(incrementButton);
    fireEvent.click(incrementButton);

    expect(count.textContent).toBe('count: 3');
    expect(undoButton.disabled).toBe(false);
    expect(redoButton.disabled).toBe(true);

    fireEvent.click(unchangeButton);

    expect(count.textContent).toBe('count: 3');
    expect(undoButton.disabled).toBe(false);
    expect(redoButton.disabled).toBe(true);

    fireEvent.click(decrementButton);
    fireEvent.click(decrementButton);
    fireEvent.click(decrementButton);

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

    fireEvent.click(incrementButton);
    fireEvent.click(incrementButton);
    fireEvent.click(resetButton);

    expect(count.textContent).toBe('count: 0');
    expect(undoButton.disabled).toBe(true);
    expect(redoButton.disabled).toBe(true);
  });

  it('present count should not be changed when canUndo or canRedo is false', () => {
    const { count, undoButton, redoButton } = setup(false);

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
        const { count, doubleUndoButton, incrementButton } = setup();

        fireEvent.click(incrementButton);

        fireEvent.click(doubleUndoButton);

        expect(count.textContent).toBe('count: 0');
      });
    });
  });

  describe('when it can redo once', () => {
    describe('when calling redo multiple times in succession', () => {
      it('should return to the last state', () => {
        const { count, undoButton, doubleRedoButton, incrementButton } =
          setup();

        fireEvent.click(incrementButton);
        fireEvent.click(undoButton);

        fireEvent.click(doubleRedoButton);

        expect(count.textContent).toBe('count: 1');
      });
    });
  });
});
