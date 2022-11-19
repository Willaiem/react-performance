import '@kentcdodds/react-workshop-app/setup-tests'

let mockedAlert = jest.spyOn(window, 'alert').mockImplementation(() => { })

beforeAll(() => {
  mockedAlert = jest.spyOn(window, 'alert').mockImplementation(() => { })
})

beforeEach(() => {
  mockedAlert.mockClear()
})

afterAll(() => {
  mockedAlert.mockRestore()
})
