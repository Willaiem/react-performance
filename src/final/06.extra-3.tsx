// Fix "perf death by a thousand cuts"
// 💯 write an HOC to get a slice of app state
// http://localhost:3000/isolated/final/06.extra-3.js

import * as React from 'react'
import {
  AppGrid, exhaustiveCheck, updateGridCellState, updateGridState, useDebouncedState, useForceRerender
} from '../utils'

type AppState = {
  grid: number[][]
}
type AppAction =
  | {
    type: "UPDATE_GRID_CELL"
    row: number
    column: number
  }
  | {
    type: "UPDATE_GRID"
  }
type DogState = {
  dogName: string
}
type DogAction = {
  type: "TYPED_IN_DOG_INPUT"
  dogName: string
}

type TDogContext = readonly [
  DogState,
  React.Dispatch<DogAction>
]

type TAppStateContext = AppState
type TAppDispatchContext = React.Dispatch<AppAction>

const AppStateContext = React.createContext<TAppStateContext | null>(null)
const AppDispatchContext = React.createContext<TAppDispatchContext | null>(null)
const DogContext = React.createContext<TDogContext | null>(null)

const initialGrid = Array.from({ length: 100 }, () =>
  Array.from({ length: 100 }, () => Math.random() * 100),
)

function appReducer(state: AppState, action: AppAction) {
  switch (action.type) {
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
    grid: initialGrid,
  })
  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
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

function useAppDispatch() {
  const context = React.useContext(AppDispatchContext)
  if (!context) {
    throw new Error('useAppDispatch must be used within the AppProvider')
  }
  return context
}

function dogReducer(state: DogState, action: DogAction) {
  switch (action.type) {
    case 'TYPED_IN_DOG_INPUT': {
      return { ...state, dogName: action.dogName }
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

function DogProvider(props: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(dogReducer, { dogName: '' })
  const value = [state, dispatch] as const
  return <DogContext.Provider value={value} {...props} />
}

function useDogState() {
  const context = React.useContext(DogContext)
  if (!context) {
    throw new Error('useDogState must be used within the DogStateProvider')
  }
  return context
}

const Grid = React.memo(() => {
  const dispatch = useAppDispatch()
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

const withStateSlice = <S, P extends { state?: S }>(Comp: React.ComponentType<P>, slice: (state: AppState, props: P) => S) => {
  const MemoComp = React.memo(Comp)
  function Wrapper(props: any, ref: React.Ref<any>) {
    const state = useAppState()
    return <MemoComp ref={ref} state={slice(state, props)} {...props} />
  }
  Wrapper.displayName = `withStateSlice(${Comp.displayName || Comp.name})`
  return React.memo(React.forwardRef(Wrapper))
}

type ICell = {
  state?: number
  row: number
  column: number
}

const Cell = withStateSlice(({ state: cell = 0, row, column }: ICell) => {
  const dispatch = useAppDispatch()
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
}, (state, { row, column }) => state.grid[row][column])

function DogNameInput() {
  const [state, dispatch] = useDogState()
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
      <div>
        <DogProvider>
          <DogNameInput />
        </DogProvider>
        <AppProvider>
          <Grid />
        </AppProvider>
      </div>
    </div>
  )
}

export default App

/*
eslint
  no-func-assign: 0,
*/
