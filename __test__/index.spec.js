import React from 'react';
import { render, cleanup, fireEvent } from 'react-testing-library';

import useUndo from '../index';

const UndoComponent = React.memo(({ disabled }) => {
  const [
    countState,
    { set: setCount, undo: undoCount, redo: redoCount, canUndo, canRedo },
  ] = useUndo(0);
  const { present: presentCount } = countState;

  return (
    <div>
      <p>count: {presentCount}</p>
      <button key="unchange" onClick={() => setCount(presentCount)}>
        unchange
      </button>
      <button key="increment" onClick={() => setCount(presentCount + 1)}>
        +
      </button>
      <button key="decrement" onClick={() => setCount(presentCount - 1)}>
        -
      </button>
      <button key="undo" onClick={undoCount} disabled={disabled && !canUndo}>
        undo
      </button>
      <button key="redo" onClick={redoCount} disabled={disabled && !canRedo}>
        redo
      </button>
    </div>
  );
});

const setup = (defaultDisabled = true) => {
  const { getByText } = render(<UndoComponent disabled={defaultDisabled} />);

  const count = getByText('count:', { exact: false });
  const unchangeButton = getByText('unchange');
  const incrementButton = getByText('+');
  const decrementButton = getByText('-');
  const undoButton = getByText('undo');
  const redoButton = getByText('redo');

  return {
    count,
    unchangeButton,
    incrementButton,
    decrementButton,
    undoButton,
    redoButton,
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
