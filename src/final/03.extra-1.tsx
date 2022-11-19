// React.memo for reducing unnecessary re-renders
// 💯 Use a custom comparator function
// http://localhost:3000/isolated/final/03.extra-1.js

import { UseComboboxGetItemPropsOptions, UseComboboxReturnValue } from 'downshift'
import * as React from 'react'
import { Unwrap } from 'types'
import { getItems } from '../getWorkerizedFilterCities'
import { useCombobox } from '../use-combobox'
import { useAsync, useForceRerender } from '../utils'

type Items = ReturnType<typeof getItems>
type Item = Unwrap<Items>

type TMenu = Pick<UseComboboxReturnValue<Item>, 'getMenuProps' | 'getItemProps' | 'selectedItem' | 'highlightedIndex'> & {
  items: Items
}

type TListItem = UseComboboxGetItemPropsOptions<Item> & Pick<UseComboboxReturnValue<Item>, 'getItemProps' | 'selectedItem' | 'highlightedIndex'>

const Menu = React.memo<TMenu>(({
  items,
  getMenuProps,
  getItemProps,
  highlightedIndex,
  selectedItem,
}) => {
  return (
    <ul {...getMenuProps()}>
      {items.map((item, index) => (
        <ListItem
          key={item.id}
          getItemProps={getItemProps}
          item={item}
          index={index}
          selectedItem={selectedItem}
          highlightedIndex={highlightedIndex}
        >
          {item.name}
        </ListItem>
      ))}
    </ul>
  )
})

const ListItem = React.memo<TListItem>(({
  getItemProps,
  item,
  index,
  selectedItem,
  highlightedIndex,
  ...props
}) => {
  const isSelected = selectedItem?.id === item.id
  const isHighlighted = highlightedIndex === index
  return (
    <li
      {...getItemProps({
        index,
        item,
        style: {
          fontWeight: isSelected ? 'bold' : 'normal',
          backgroundColor: isHighlighted ? 'lightgray' : 'inherit',
        },
        ...props,
      })}
    />
  )
}, (prevProps, nextProps) => {
  // true means do NOT rerender
  // false means DO rerender

  // these ones are easy if any of these changed, we should re-render
  if (prevProps.getItemProps !== nextProps.getItemProps) return false
  if (prevProps.item !== nextProps.item) return false
  if (prevProps.index !== nextProps.index) return false
  if (prevProps.selectedItem !== nextProps.selectedItem) return false

  // this is trickier. We should only re-render if this list item:
  // 1. was highlighted before and now it's not
  // 2. was not highlighted before and now it is
  if (prevProps.highlightedIndex !== nextProps.highlightedIndex) {
    const wasPrevHighlighted = prevProps.highlightedIndex === prevProps.index
    const isNowHighlighted = nextProps.highlightedIndex === nextProps.index
    return wasPrevHighlighted === isNowHighlighted
  }
  return true
})

function App() {
  const forceRerender = useForceRerender()
  const [inputValue, setInputValue] = React.useState('')

  const { data: allItems, run } = useAsync<Items>({ data: [], status: 'pending' })
  React.useEffect(() => {
    run(Promise.resolve(getItems(inputValue)))
  }, [inputValue, run])
  const items = allItems?.slice(0, 100) ?? []

  const {
    selectedItem,
    highlightedIndex,
    getComboboxProps,
    getInputProps,
    getItemProps,
    getLabelProps,
    getMenuProps,
    selectItem,
  } = useCombobox({
    items,
    inputValue,
    onInputValueChange: ({ inputValue: newValue }) => setInputValue(newValue ?? ''),
    onSelectedItemChange: ({ selectedItem }) =>
      alert(
        selectedItem
          ? `You selected ${selectedItem.name}`
          : 'Selection Cleared',
      ),
    itemToString: item => (item ? item.name : ''),
  })

  return (
    <div className="city-app">
      <button onClick={forceRerender}>force rerender</button>
      <div>
        <label {...getLabelProps()}>Find a city</label>
        <div {...getComboboxProps()}>
          <input {...getInputProps({ type: 'text' })} />
          <button onClick={() => selectItem(null)} aria-label="toggle menu">
            &#10005;
          </button>
        </div>
        <Menu
          items={items}
          getMenuProps={getMenuProps}
          getItemProps={getItemProps}
          highlightedIndex={highlightedIndex}
          selectedItem={selectedItem}
        />
      </div>
    </div>
  )
}

export default App

/*
eslint
  no-func-assign: 0,
*/
