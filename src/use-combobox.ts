import { useCombobox as useDownshiftCombobox, UseComboboxProps } from 'downshift'

function useCombobox<T>(options: UseComboboxProps<T>) {
  const { itemToString = item => typeof item === 'string' ? item : '', inputValue = '' } = options


  const combobox = useDownshiftCombobox<T>({
    stateReducer(state, { type, changes }) {
      // downshift's default is to select the highlighted item on blur
      // but we don't like that so we're using the state reducer to change
      // that default behavior
      // https://github.com/downshift-js/downshift/issues/1040
      if (type === useDownshiftCombobox.stateChangeTypes.InputBlur) {
        return {
          ...changes,
          highlightedIndex: -1,
          selectedItem: state.selectedItem,
          inputValue: itemToString(state.selectedItem),
        }
      }
      // changing the selection programmatically should also reset the
      // input value by default
      // https://github.com/downshift-js/downshift/issues/1049
      if (type === useDownshiftCombobox.stateChangeTypes.FunctionSelectItem) {
        return {
          ...changes,
          inputValue: '',
        }
      }
      return changes
    },
    inputValue,
    ...options,
  })

  const selectItem = (value: T | null) => {
    if (!value) {
      return
    }

    combobox.selectItem(value)
  }

  return { ...combobox, selectItem }
}

export { useCombobox }
