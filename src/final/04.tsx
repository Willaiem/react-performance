// Window large lists with react-virtual
// http://localhost:3000/isolated/final/04.js

import { UseComboboxGetItemPropsOptions, UseComboboxReturnValue } from 'downshift'
import * as React from 'react'
import { useVirtual } from 'react-virtual'
import { Unwrap } from 'types'
import { getItems } from '../getWorkerizedFilterCities'
import { useCombobox } from '../use-combobox'
import { useAsync, useForceRerender } from '../utils'

type Items = ReturnType<typeof getItems>
type Item = Unwrap<Items>

type TMenu = Pick<UseComboboxReturnValue<Item>, 'getMenuProps' | 'getItemProps' | 'selectedItem' | 'highlightedIndex'> & {
  items: Items
  listRef: React.Ref<HTMLDivElement>
  virtualRows: { index: number, size: number, start: number }[]
  totalHeight: number
}

type TListItem = UseComboboxGetItemPropsOptions<Item> & Pick<UseComboboxReturnValue<Item>, 'getItemProps'> & {
  isHighlighted: boolean
}


const getVirtualRowStyles = ({ size, start }: { size: number, start: number }): React.CSSProperties => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: size,
  transform: `translateY(${start}px)`,
})

function Menu({
  items,
  getMenuProps,
  getItemProps,
  highlightedIndex,
  selectedItem,
  listRef,
  virtualRows,
  totalHeight,
}: TMenu) {
  return (
    <ul {...getMenuProps({ ref: listRef })}>
      <li style={{ height: totalHeight }} />
      {virtualRows.map(({ index, size, start }) => {
        const item = items[index]
        if (!item) return null
        return (
          <ListItem
            key={item.id}
            getItemProps={getItemProps}
            item={item}
            index={index}
            isSelected={selectedItem?.id === item.id}
            isHighlighted={highlightedIndex === index}
            style={getVirtualRowStyles({ size, start })}
          >
            {item.name}
          </ListItem>
        )
      })}
    </ul>
  )
}

function ListItem({
  getItemProps,
  item,
  index,
  isHighlighted,
  isSelected,
  style,
  ...props
}: TListItem) {
  return (
    <li
      {...getItemProps({
        index,
        item,
        style: {
          backgroundColor: isHighlighted ? 'lightgray' : 'inherit',
          fontWeight: isSelected ? 'bold' : 'normal',
          ...style,
        },
        ...props,
      })}
    />
  )
}

function App() {
  const forceRerender = useForceRerender()
  const [inputValue, setInputValue] = React.useState('')

  const { data, run } = useAsync<Items>({ data: [], status: 'pending' })
  React.useEffect(() => {
    run(Promise.resolve(getItems(inputValue)))
  }, [inputValue, run])

  const items = data ?? []

  const listRef = React.useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtual({
    size: items.length,
    parentRef: listRef,
    estimateSize: React.useCallback(() => 20, []),
    overscan: 10,
  })

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
    items: items,
    inputValue,
    onInputValueChange: ({ inputValue: newValue }) => setInputValue(newValue ?? ''),
    onSelectedItemChange: ({ selectedItem }) =>
      alert(
        selectedItem
          ? `You selected ${selectedItem.name}`
          : 'Selection Cleared',
      ),
    itemToString: item => (item ? item.name : ''),
    scrollIntoView: () => { },
    onHighlightedIndexChange: ({ highlightedIndex }) =>
      highlightedIndex !== -1 && rowVirtualizer.scrollToIndex(highlightedIndex ?? 0),
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
          listRef={listRef}
          virtualRows={rowVirtualizer.virtualItems}
          totalHeight={rowVirtualizer.totalSize}
        />
      </div>
    </div>
  )
}

export default App
