// Optimize context value
// http://localhost:3000/isolated/final/05.js

import * as React from 'react';
import {
  AppGrid, exhaustiveCheck, updateGridCellState, updateGridState, useDebouncedState, useForceRerender
} from '../utils';

type AppState = {
  grid: number[][]
  dogName: string
}
type AppAction =
  | {
    type: "TYPED_IN_DOG_INPUT"
    dogName: string
  }
  | {
    type: "UPDATE_GRID_CELL"
    row: number
    column: number
  }
  | {
    type: "UPDATE_GRID"
  }

type TAppStateContext = readonly [AppState, React.Dispatch<AppAction>]

const AppStateContext = React.createContext<TAppStateContext | null>(null)

const initialGrid = Array.from({ length: 100 }, () =>
  Array.from({ length: 100 }, () => Math.random() * 100),
)

function appReducer(state: AppState, action: AppAction) {
  switch (action.type) {
    case 'TYPED_IN_DOG_INPUT': {
      return { ...state, dogName: action.dogName }
    }
    case 'UPDATE_GRID_CELL': {
      return { ...state, grid: updateGridCellState(state.grid, action) }
    }
    case 'UPDATE_GRID': {
      return { ...state, grid: updateGridState(state.grid) }
    }
    default: {
      exhaustiveCheck(action, 'action.type')
    }
  }
}

function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(appReducer, {
    dogName: '',
    grid: initialGrid,
  })
  const value = React.useMemo(() => [state, dispatch] as const, [state])
  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  )
}

function useAppState() {
  const context = React.useContext(AppStateContext)
  if (!context) {
    throw new Error('useAppState must be used within the AppProvider')
  }
  return context
}

const Grid = React.memo(() => {
  const [, dispatch] = useAppState()
  const [rows, setRows] = useDebouncedState(50)
  const [columns, setColumns] = useDebouncedState(50)
  const updateGridData = () => dispatch({ type: 'UPDATE_GRID' })
  return (
    <AppGrid
      onUpdateGrid={updateGridData}
      rows={rows}
      handleRowsChange={setRows}
      columns={columns}
      handleColumnsChange={setColumns}
      Cell={Cell}
    />
  )
})

const Cell = React.memo<{ row: number, column: number }>(({ row, column }) => {
  const [state, dispatch] = useAppState()
  const cell = state.grid[row][column]
  const handleClick = () => dispatch({ type: 'UPDATE_GRID_CELL', row, column })
  return (
    <button
      className="cell"
      onClick={handleClick}
      style={{
        color: cell > 50 ? 'white' : 'black',
        backgroundColor: `rgba(0, 0, 0, ${cell / 100})`,
      }}
    >
      {Math.floor(cell)}
    </button>
  )
})

function DogNameInput() {
  const [state, dispatch] = useAppState()
  const { dogName } = state

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newDogName = event.target.value
    dispatch({ type: 'TYPED_IN_DOG_INPUT', dogName: newDogName })
  }

  return (
    <form onSubmit={e => e.preventDefault()}>
      <label htmlFor="dogName">Dog Name</label>
      <input
        value={dogName}
        onChange={handleChange}
        id="dogName"
        placeholder="Toto"
      />
      {dogName ? (
        <div>
          <strong>{dogName}</strong>, I've a feeling we're not in Kansas anymore
        </div>
      ) : null}
    </form>
  )
}

function App() {
  const forceRerender = useForceRerender()
  return (
    <div className="grid-app">
      <button onClick={forceRerender}>force rerender</button>
      <AppProvider>
        <div>
          <DogNameInput />
          <Grid />
        </div>
      </AppProvider>
    </div>
  )
}

export default App

/*
eslint
  no-func-assign: 0,
*/
