# ♻️ use-undo

undo/redo functionality with React [Hooks](https://reactjs.org/docs/hooks-intro.html).

<p>
  <a target="_blank" href="https://npmjs.org/package/use-undo" title="NPM version"><img src="https://img.shields.io/npm/v/use-undo.svg"></a>
  <a target="_blank" href="http://makeapullrequest.com" title="PRs Welcome"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg"></a>
</p>

<p align="center">
<img width="1280" alt="screensho" src="https://user-images.githubusercontent.com/12113222/47952303-3c690d80-dfc1-11e8-9df3-7d00443a4487.gif" />
</p>

## Requirement ⚠️

To use `useUndo`, you have to use at minimum `react@16.7.0-alpha.0`. React Hooks is currently at **[RFC](https://github.com/reactjs/rfcs/pull/68)** stage.

## Installation

```sh
yarn add use-undo
```

## Usage

<a href="https://codesandbox.io/s/5v9yoz7xn4" target="_blank">
  <img alt="Edit 5v9yoz7xn4" src="https://codesandbox.io/static/img/play-codesandbox.svg">
</a>

```js
import React from 'react';
import ReactDOM from 'react-dom';
import useUndo from 'use-undo';

const App = () => {
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
      <p>You clicked {presentCount} times</p>
      <button key="increment" onClick={() => setCount(presentCount + 1)}>
        +
      </button>
      <button key="decrement" onClick={() => setCount(presentCount - 1)}>
        -
      </button>
      <button key="undo" onClick={undoCount} disabled={!canUndo}>
        undo
      </button>
      <button key="redo" onClick={redoCount} disabled={!canRedo}>
        redo
      </button>
      <button key="reset" onClick={() => resetCount(0)}>
        reset to 0
      </button>
    </div>
  );
};

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
```

## API

### useUndo

```js
const [state, actions] = useUndo(initialState);
```

#### state

##### Type: `Object`

| Key     |  Type   | Description        |
| ------- | :-----: | ------------------ |
| past    | `Array` | The undo stack.    |
| present |  `Any`  | The present state. |
| future  | `Array` | The redo stack.    |

#### actions

##### Type: `Object`

| Key     |    Type    | Description                                                                              |
| ------- | :--------: | ---------------------------------------------------------------------------------------- |
| set     | `function` | Assign a new value to `present`.                                                         |
| reset   | `function` | Clear `past` array and `future` array. Assign a new value to `present`.                  |
| undo    | `function` | See [handling-undo](https://redux.js.org/recipes/implementingundohistory#handling-undo). |
| redo    | `function` | See [handling-redo](https://redux.js.org/recipes/implementingundohistory#handling-redo). |
| canUndo | `boolean`  | Check whether `state.undo.length` is `0`.                                                |
| canRedo | `boolean`  | Check whether `state.redo.length` is `0`.                                                |

## How does it work?

Refer to [_Redux Implementing Undo History_](https://redux.js.org/recipes/implementingundohistory), `use-undo` implements the same concect with [`useReducer`](https://reactjs.org/docs/hooks-reference.html#usereducer).  
The state structure looks like:

```js
{
  past: Array<T>,
  present: <T>,
  future: Array<T>
}
```

It stores all states we need. To operate on this state, there are three functions in [`actions`](#actions) (`set`, `undo` and `redo`) that dispatch defined types and necessary value.

## Related repo

- [omnidan/redux-undo](https://github.com/omnidan/redux-undo)

## License

MIT © [xxhomey19](https://github.com/xxhomey19)
