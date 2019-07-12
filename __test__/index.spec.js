import React from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';

import useUndo from '../index';

const UndoComponent = React.memo(({ disabled }) => {
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
      <button key="reset" data-testid="reset" onClick={() => resetCount(0)}>
        reset to 0
      </button>
    </div>
  );
});

const setup = (defaultDisabled = true) => {
  const { getByTestId } = render(<UndoComponent disabled={defaultDisabled} />);

  const count = getByTestId('count');
  const unchangeButton = getByTestId('unchange');
  const incrementButton = getByTestId('increment');
  const decrementButton = getByTestId('decrement');
  const undoButton = getByTestId('undo');
  const redoButton = getByTestId('redo');
  const resetButton = getByTestId('reset');

  return {
    count,
    unchangeButton,
    incrementButton,
    decrementButton,
    undoButton,
    redoButton,
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
    const {
      count,
      unchangeButton,
      incrementButton,
      decrementButton,
      undoButton,
      redoButton,
    } = setup(false);

    expect(count.textContent).toBe('count: 0');
    expect(undoButton.disabled).toBe(false);
    expect(redoButton.disabled).toBe(false);

    fireEvent.click(undoButton);

    expect(count.textContent).toBe('count: 0');

    fireEvent.click(redoButton);

    expect(count.textContent).toBe('count: 0');
  });
});
