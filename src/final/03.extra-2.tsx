// React.memo for reducing unnecessary re-renders
// 💯 pass only primitive values
// http://localhost:3000/isolated/final/03.extra-2.js

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

type TListItem = UseComboboxGetItemPropsOptions<Item> & Pick<UseComboboxReturnValue<Item>, 'getItemProps'> & {
  isHighlighted: boolean
}

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
          isSelected={selectedItem?.id === item.id}
          isHighlighted={highlightedIndex === index}
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
  isHighlighted,
  isSelected,
  ...props
}) => {
  return (
    <li
      {...getItemProps({
        index,
        item,
        style: {
          backgroundColor: isHighlighted ? 'lightgray' : 'inherit',
          fontWeight: isSelected ? 'bold' : 'normal',
        },
        ...props,
      })}
    />
  )
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
