import { alfredTip } from '@kentcdodds/react-workshop-app/test-utils'
import { render } from '@testing-library/react'
import * as React from 'react'
import App from '../final/07'
import reportProfile from '../report-profile'
// import App from '../exercise/07'

jest.mock('react', () => {
  const actualReact = jest.requireActual('react')
  return {
    ...actualReact,
    Profiler: jest.fn(),
  }
})

const mockedReactProfiler = jest.mocked(React.Profiler)

beforeEach(() => {
  mockedReactProfiler.mockImplementation(({ children }) => <>{children}</>)
})

test('uses the Profiler correctly', async () => {
  render(<App />)

  alfredTip(
    () =>
      expect(React.Profiler).toHaveBeenLastCalledWith(
        {
          children: expect.any(Object),
          id: 'counter',
          onRender: reportProfile,
        },
        expect.any(Object),
      ),
    'The React.Profiler component must be used with the correct props',
  )
})
