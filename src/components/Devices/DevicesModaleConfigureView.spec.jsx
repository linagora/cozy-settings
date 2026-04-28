import React from 'react'
import { fireEvent, getByRole, render, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import cloneDeep from 'lodash/cloneDeep'

import { createMockClient } from 'cozy-client'
import { useAlert } from 'cozy-ui/transpiled/react/providers/Alert'

import DevicesModaleConfigureView from './DevicesModaleConfigureView'

import {
  ROOT_FOLDER_ID,
  updateDirectoriesExclusions,
  useFolders
} from '@/lib/deviceConfigurationHelper'
import AppLike from '@/test/AppLike'

jest.mock('cozy-ui/transpiled/react/Collapse', () => {
  // Make sure the Collapse transition renders instantly so its children appear
  // in the rendered test DOM.
  const FakeCollapse = ({ children }) => <>{children}</>
  return FakeCollapse
})

jest.mock('cozy-ui/transpiled/react/providers/Alert', () => ({
  __esModule: true,
  default: ({ children }) => children,
  useAlert: jest.fn()
}))

jest.mock('@/lib/deviceConfigurationHelper', () => {
  const original = jest.requireActual('@/lib/deviceConfigurationHelper') // Step 2.
  return {
    ...original,
    updateDirectoriesExclusions: jest.fn(),
    useFolders: jest.fn()
  }
})

const sortByPath = folders =>
  folders.sort((a, b) => a.path.localeCompare(b.path, 'en'))

// The device is not fully stored in the `not_synchronized_on` attribute of
// excluded folders and it is not normalized as an OAuth client document.
// This method translates a device into its exclusion form.
const excludedDevice = ({ _id, _type }) => ({
  id: _id,
  type: _type
})

describe('DevicesModaleConfigureView', () => {
  const mockClient = createMockClient({})
  const mockDevice = {
    _id: 'mock-device-id',
    _type: 'io.cozy.oauth.clients',
    client_kind: 'desktop',
    client_name: 'Mock Device'
  }
  const includedFolders = [
    {
      _id: 'Administrative',
      dir_id: ROOT_FOLDER_ID,
      name: 'Administrative',
      path: '/Administrative',
      not_synchronized_on: []
    },
    {
      _id: 'Konnectors',
      dir_id: ROOT_FOLDER_ID,
      name: 'Konnectors',
      path: '/Konnectors',
      not_synchronized_on: null
    },
    {
      _id: 'Accounts',
      dir_id: ROOT_FOLDER_ID,
      name: 'Accounts',
      path: '/Accounts',
      not_synchronized_on: undefined
    },
    {
      _id: 'Ciphers',
      dir_id: ROOT_FOLDER_ID,
      name: 'Ciphers',
      path: '/Ciphers'
    }
  ]
  const excludedFolders = [
    {
      _id: 'Photos',
      dir_id: ROOT_FOLDER_ID,
      name: 'Photos',
      path: '/Photos',
      not_synchronized_on: [excludedDevice(mockDevice)]
    },
    {
      _id: 'Videos',
      dir_id: ROOT_FOLDER_ID,
      name: 'Videos',
      path: '/Videos',
      not_synchronized_on: [excludedDevice(mockDevice)]
    }
  ]
  const childFolders = {
    included: [
      {
        _id: 'Ameli',
        dir_id: 'Konnectors',
        name: 'Ameli',
        path: '/Konnectors/Ameli'
      },
      {
        _id: 'Claude',
        dir_id: 'Ameli',
        name: 'Claude',
        path: '/Konnectors/Ameli/Claude'
      }
    ],
    excluded: [
      {
        _id: 'Movies',
        dir_id: 'Videos',
        name: 'Movies',
        path: '/Videos/Movies'
      },
      {
        _id: 'Comedy',
        dir_id: 'Movies',
        name: 'Comedy',
        path: '/Videos/Movies/Comedy'
      }
    ]
  }
  const mockCancelAction = jest.fn()
  const mockOnDeviceConfigured = jest.fn()

  const partialSyncSelector = root =>
    root.getByLabelText('Unselect folders which should not be synchronized:')
  const completeSyncSelector = root =>
    root.getByLabelText('Synchronize my whole Twake')
  const cancelButton = root => root.getByRole('button', { name: 'Cancel' })
  const validateButton = root => root.getByRole('button', { name: 'Validate' })
  const allFoldersToggle = root =>
    getByRole(root.getByTestId('toggle-all-inclusion'), 'checkbox')
  const folderToggle = (root, folder) =>
    getByRole(root.getByTestId(`toggle-${folder.name}-inclusion`), 'checkbox')

  const setup = () => {
    const showAlert = jest.fn()
    useAlert.mockReturnValue({ showAlert })

    const root = render(
      <AppLike client={mockClient}>
        <DevicesModaleConfigureView
          device={mockDevice}
          cancelAction={mockCancelAction}
          onDeviceConfigured={mockOnDeviceConfigured}
        />
      </AppLike>
    )
    return { root, showAlert }
  }
  beforeEach(() => {
    // eslint-disable-next-line no-console
    console.error = jest.fn()
  })
  afterEach(() => {
    updateDirectoriesExclusions.mockClear()
    mockOnDeviceConfigured.mockClear()
    mockCancelAction.mockClear()
  })

  describe('when the folders query is still loading', () => {
    beforeEach(() => {
      useFolders.mockReturnValue({
        loading: true,
        failed: false,
        folders: []
      })
    })

    it('should render an loading spinner', () => {
      const { root } = setup()
      expect(
        root.queryByText(
          'Select the folders to synchronize with your computer:'
        )
      ).not.toBeInTheDocument()
      expect(root.getByRole('progressbar')).toBeVisible()
    })

    describe('and the dialog is validated', () => {
      const run = () => {
        const { root } = setup()
        fireEvent.click(validateButton(root))
      }

      it('should call updateDirectoriesExclusions without folders', async () => {
        run()

        expect(updateDirectoriesExclusions).toHaveBeenCalledTimes(1)
        expect(updateDirectoriesExclusions).toHaveBeenCalledWith({
          client: mockClient,
          device: mockDevice,
          foldersToInclude: [],
          foldersToExclude: []
        })
        await waitFor(() =>
          expect(mockOnDeviceConfigured).toHaveBeenCalledTimes(1)
        )
      })
    })
  })

  describe('when the folders query failed', () => {
    beforeEach(() => {
      useFolders.mockReturnValue({
        loading: false,
        failed: true,
        folders: sortByPath(cloneDeep(includedFolders.concat(excludedFolders))) // XXX: just checking that this has no effects on the UI
      })
    })

    it('should render an alert notification', () => {
      const { showAlert } = setup()
      expect(showAlert).toHaveBeenCalledTimes(1)
    })

    describe('and the dialog is validated', () => {
      const run = () => {
        const { root } = setup()
        fireEvent.click(validateButton(root))
      }

      it('should call updateDirectoriesExclusions without folders', async () => {
        run()

        expect(updateDirectoriesExclusions).toHaveBeenCalledTimes(1)
        expect(updateDirectoriesExclusions).toHaveBeenCalledWith({
          client: mockClient,
          device: mockDevice,
          foldersToInclude: [],
          foldersToExclude: []
        })
        await waitFor(() =>
          expect(mockOnDeviceConfigured).toHaveBeenCalledTimes(1)
        )
      })
    })
  })

  describe('when the folders query yields no folders', () => {
    beforeEach(() => {
      useFolders.mockReturnValue({
        loading: false,
        failed: false,
        folders: []
      })
    })

    it('should render an Empty-like warning', () => {
      const { root } = setup()
      expect(
        root.getByText("You don't have any folders in your Twake.")
      ).toBeVisible()
    })

    it('should render a disabled partial sync selector', () => {
      const { root } = setup()
      expect(partialSyncSelector(root)).toBeDisabled()
      expect(completeSyncSelector(root)).toBeChecked()
    })

    describe('and the dialog is validated', () => {
      const run = () => {
        const { root } = setup()
        fireEvent.click(validateButton(root))
      }

      it('should call updateDirectoriesExclusions without folders', async () => {
        run()

        expect(updateDirectoriesExclusions).toHaveBeenCalledTimes(1)
        expect(updateDirectoriesExclusions).toHaveBeenCalledWith({
          client: mockClient,
          device: mockDevice,
          foldersToInclude: [],
          foldersToExclude: []
        })
        await waitFor(() =>
          expect(mockOnDeviceConfigured).toHaveBeenCalledTimes(1)
        )
      })
    })
  })

  describe('when the folders query yields only included folders', () => {
    beforeEach(() => {
      useFolders.mockReturnValue({
        loading: false,
        failed: false,
        folders: cloneDeep(includedFolders)
      })
    })

    it('should render a checked whole Cozy sync selector', () => {
      const { root } = setup()
      expect(completeSyncSelector(root)).toBeChecked()
      expect(partialSyncSelector(root)).toBeEnabled()
    })

    it('should render a list of checked and disabled folder toggles', () => {
      const { root } = setup()
      const folderToggles = root.getAllByRole('checkbox')
      for (const folderToggle of folderToggles) {
        expect(folderToggle).toBeChecked()
        expect(folderToggle).toBeDisabled()
      }
    })

    describe('and partial sync is enabled', () => {
      const run = () => {
        const { root } = setup()

        fireEvent.click(partialSyncSelector(root))

        return { root }
      }

      it('should render a checked partial sync selector', () => {
        const { root } = run()

        expect(partialSyncSelector(root)).toBeChecked()
      })

      it('should render a list of checked and enabled folder toggles', () => {
        const { root } = run()

        const folderToggles = root.getAllByRole('checkbox')
        for (const folderToggle of folderToggles) {
          expect(folderToggle).toBeChecked()
          expect(folderToggle).toBeEnabled()
        }
      })
    })

    describe('and the all folders toggle is clicked', () => {
      const run = () => {
        const { root } = setup()

        fireEvent.click(allFoldersToggle(root))

        return { root }
      }

      it('should render a checked partial sync selector', () => {
        const { root } = run()

        expect(partialSyncSelector(root)).toBeChecked()
      })

      it('should render a list of unchecked and enabled folder toggles', () => {
        const { root } = run()

        const folderToggles = root.getAllByRole('checkbox')
        for (const folderToggle of folderToggles) {
          expect(folderToggle).not.toBeChecked()
          expect(folderToggle).toBeEnabled()
        }
      })
    })

    describe('and a folder is excluded', () => {
      const folderToExclude = includedFolders[0]
      const run = () => {
        const { root } = setup()

        fireEvent.click(folderToggle(root, folderToExclude))

        return { root }
      }

      it('should render a checked partial sync selector', () => {
        const { root } = run()

        expect(partialSyncSelector(root)).toBeChecked()
      })

      it('should render a mixed checked and enabled all folders toggle', () => {
        const { root } = run()

        expect(allFoldersToggle(root)).toBePartiallyChecked()
        expect(allFoldersToggle(root)).toBeEnabled()
      })

      it('should render a list of enabled folder toggles, checked except the clicked one', () => {
        const { root } = run()

        for (const includedFolder of includedFolders) {
          const toggle = folderToggle(root, includedFolder)
          expect(toggle).toBeEnabled()
          if (includedFolder === folderToExclude) {
            expect(toggle).not.toBeChecked()
          } else {
            expect(toggle).toBeChecked()
          }
        }
      })
    })

    describe('and the dialog is validated', () => {
      const run = () => {
        const { root } = setup()
        fireEvent.click(validateButton(root))
      }

      it('should call updateDirectoriesExclusions without folders', async () => {
        run()

        expect(updateDirectoriesExclusions).toHaveBeenCalledTimes(1)
        expect(updateDirectoriesExclusions).toHaveBeenCalledWith({
          client: mockClient,
          device: mockDevice,
          foldersToInclude: [],
          foldersToExclude: []
        })
        await waitFor(() =>
          expect(mockOnDeviceConfigured).toHaveBeenCalledTimes(1)
        )
      })
    })
  })

  describe('when the folders query yields only excluded folders', () => {
    beforeEach(() => {
      useFolders.mockReturnValue({
        loading: false,
        failed: false,
        folders: cloneDeep(excludedFolders)
      })
    })

    it('should render a checked partial sync selector', () => {
      const { root } = setup()
      expect(partialSyncSelector(root)).toBeChecked()
    })

    it('should render a list of unchecked and enabled folder toggles', () => {
      const { root } = setup()
      const folderToggles = root.getAllByRole('checkbox')
      for (const folderToggle of folderToggles) {
        expect(folderToggle).not.toBeChecked()
        expect(folderToggle).toBeEnabled()
      }
    })

    describe('and partial sync is disabled', () => {
      const run = () => {
        const { root } = setup()

        fireEvent.click(completeSyncSelector(root))

        return { root }
      }

      it('should render a checked whole Cozy sync selector', () => {
        const { root } = run()

        expect(completeSyncSelector(root)).toBeChecked()
      })

      it('should render a list of unchecked and disabled folder toggles', () => {
        const { root } = run()

        const folderToggles = root.getAllByRole('checkbox')
        for (const folderToggle of folderToggles) {
          expect(folderToggle).not.toBeChecked()
          expect(folderToggle).toBeDisabled()
        }
      })
    })

    describe('and the all folders toggle is clicked', () => {
      const run = () => {
        const { root } = setup()

        fireEvent.click(allFoldersToggle(root))

        return { root }
      }

      it('should render a checked partial sync selector', () => {
        const { root } = run()

        expect(partialSyncSelector(root)).toBeChecked()
      })

      it('should render a list of checked and enabled folder toggles', () => {
        const { root } = run()

        const folderToggles = root.getAllByRole('checkbox')
        for (const folderToggle of folderToggles) {
          expect(folderToggle).toBeChecked()
          expect(folderToggle).toBeEnabled()
        }
      })
    })

    describe('and a folder is included', () => {
      const folderToInclude = excludedFolders[0]
      const run = () => {
        const { root } = setup()

        fireEvent.click(folderToggle(root, folderToInclude))

        return { root }
      }

      it('should render a checked partial sync selector', () => {
        const { root } = run()

        expect(partialSyncSelector(root)).toBeChecked()
      })

      it('should render a mixed checked and enabled all folders toggle', () => {
        const { root } = run()

        expect(allFoldersToggle(root)).toBePartiallyChecked()
        expect(allFoldersToggle(root)).toBeEnabled()
      })

      it('should render a list of enabled folder toggles, unchecked except the clicked one', () => {
        const { root } = run()

        for (const excludedFolder of excludedFolders) {
          const toggle = folderToggle(root, excludedFolder)
          expect(toggle).toBeEnabled()
          if (excludedFolder === folderToInclude) {
            expect(toggle).toBeChecked()
          } else {
            expect(toggle).not.toBeChecked()
          }
        }
      })
    })

    describe('and the dialog is validated', () => {
      const run = () => {
        const { root } = setup()
        fireEvent.click(validateButton(root))
      }

      it('should call updateDirectoriesExclusions without folders', async () => {
        run()

        expect(updateDirectoriesExclusions).toHaveBeenCalledTimes(1)
        expect(updateDirectoriesExclusions).toHaveBeenCalledWith({
          client: mockClient,
          device: mockDevice,
          foldersToInclude: [],
          foldersToExclude: []
        })
        await waitFor(() =>
          expect(mockOnDeviceConfigured).toHaveBeenCalledTimes(1)
        )
      })
    })
  })

  describe('when the folders query yields both included and excluded folders', () => {
    beforeEach(() => {
      useFolders.mockReturnValue({
        loading: false,
        failed: false,
        folders: sortByPath(cloneDeep(includedFolders.concat(excludedFolders)))
      })
    })

    it('should render an enabled and checked partial sync selector', () => {
      const { root } = setup()
      expect(completeSyncSelector(root)).toBeEnabled()
      expect(partialSyncSelector(root)).toBeEnabled()
      expect(partialSyncSelector(root)).toBeChecked()
    })

    it('should render a mixed checked and enabled all folders toggle', () => {
      const { root } = setup()
      expect(allFoldersToggle(root)).toBePartiallyChecked()
      expect(allFoldersToggle(root)).toBeEnabled()
    })

    it('should render a list of enabled folder toggles, checked for included folders', () => {
      const { root } = setup()

      for (const includedFolder of includedFolders) {
        const toggle = folderToggle(root, includedFolder)
        expect(toggle).toBeEnabled()
        expect(toggle).toBeChecked()
      }
      for (const excludedFolder of excludedFolders) {
        const toggle = folderToggle(root, excludedFolder)
        expect(toggle).toBeEnabled()
        expect(toggle).not.toBeChecked()
      }
    })

    describe('and partial sync is disabled', () => {
      const run = () => {
        const { root } = setup()

        fireEvent.click(completeSyncSelector(root))

        return { root }
      }

      it('should render a checked whole Cozy sync selector', () => {
        const { root } = run()

        expect(completeSyncSelector(root)).toBeChecked()
      })

      it('should render a list of disabled folder toggles, checked for included ones', () => {
        const { root } = run()

        for (const includedFolder of includedFolders) {
          const toggle = folderToggle(root, includedFolder)
          expect(toggle).toBeDisabled()
          expect(toggle).toBeChecked()
        }
        for (const excludedFolder of excludedFolders) {
          const toggle = folderToggle(root, excludedFolder)
          expect(toggle).toBeDisabled()
          expect(toggle).not.toBeChecked()
        }
      })
    })

    describe('and all folders are excluded', () => {
      const run = () => {
        const { root } = setup()
        for (const folderToExclude of includedFolders) {
          fireEvent.click(folderToggle(root, folderToExclude))
        }

        return { root }
      }

      it('should render a checked partial sync selector', () => {
        const { root } = run()

        expect(partialSyncSelector(root)).toBeChecked()
      })

      it('should render a list of unchecked and enabled folder toggles', () => {
        const { root } = run()

        const folderToggles = root.getAllByRole('checkbox')
        for (const folderToggle of folderToggles) {
          expect(folderToggle).not.toBeChecked()
          expect(folderToggle).toBeEnabled()
        }
      })
    })

    describe('and all folders are included', () => {
      const run = () => {
        const { root } = setup()
        for (const folderToInclude of excludedFolders) {
          fireEvent.click(folderToggle(root, folderToInclude))
        }

        return { root }
      }

      it('should render a checked partial sync selector', () => {
        const { root } = run()

        expect(partialSyncSelector(root)).toBeChecked()
      })

      it('should render a list of checked and enabled folder toggles', () => {
        const { root } = run()

        const folderToggles = root.getAllByRole('checkbox')
        for (const folderToggle of folderToggles) {
          expect(folderToggle).toBeChecked()
          expect(folderToggle).toBeEnabled()
        }
      })
    })

    describe('and the dialog is validated', () => {
      const run = () => {
        const { root } = setup()
        fireEvent.click(validateButton(root))
      }

      it('should call updateDirectoriesExclusions without folders', async () => {
        run()

        expect(updateDirectoriesExclusions).toHaveBeenCalledTimes(1)
        expect(updateDirectoriesExclusions).toHaveBeenCalledWith({
          client: mockClient,
          device: mockDevice,
          foldersToInclude: [],
          foldersToExclude: []
        })
        await waitFor(() =>
          expect(mockOnDeviceConfigured).toHaveBeenCalledTimes(1)
        )
      })
    })

    describe('and some folder inclusions are changed and saved', () => {
      const folderToInclude = excludedFolders[0]
      const folderToExclude = includedFolders[0]

      const run = () => {
        const { root } = setup()

        fireEvent.click(folderToggle(root, folderToInclude))
        fireEvent.click(folderToggle(root, folderToExclude))

        fireEvent.click(validateButton(root))
      }

      it('should call updateDirectoriesExclusions with the changed folders', async () => {
        run()

        expect(updateDirectoriesExclusions).toHaveBeenCalledTimes(1)
        expect(updateDirectoriesExclusions).toHaveBeenCalledWith({
          client: mockClient,
          device: mockDevice,
          foldersToInclude: [folderToInclude],
          foldersToExclude: [folderToExclude]
        })
        await waitFor(() =>
          expect(mockOnDeviceConfigured).toHaveBeenCalledTimes(1)
        )
      })
    })

    describe('and some folder inclusions are changed and cancelled', () => {
      const folderToInclude = excludedFolders[0]
      const folderToExclude = includedFolders[0]

      const run = () => {
        const { root } = setup()

        fireEvent.click(folderToggle(root, folderToInclude))
        fireEvent.click(folderToggle(root, folderToExclude))

        fireEvent.click(cancelButton(root))
      }

      it('should not call updateDirectoriesExclusions', async () => {
        run()

        expect(updateDirectoriesExclusions).toHaveBeenCalledTimes(0)
        await waitFor(() =>
          expect(mockOnDeviceConfigured).toHaveBeenCalledTimes(0)
        )
        expect(mockCancelAction).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('when the folders query yields folders with hierarchies', () => {
    const folders = sortByPath(
      cloneDeep(
        includedFolders
          .concat(excludedFolders)
          .concat(childFolders.included)
          .concat(childFolders.excluded)
      )
    )
    beforeEach(() => {
      useFolders.mockReturnValue({
        loading: false,
        failed: false,
        folders
      })
    })

    it('should render a tree view of the hierarchies', async () => {
      const { root } = setup()
      expect(root).toMatchSnapshot()
      for (const folder of folders) {
        expect(folderToggle(root, folder)).toBeInTheDocument()
      }
    })

    describe('and the all folders toggle is clicked', () => {
      const run = () => {
        const { root } = setup()

        fireEvent.click(allFoldersToggle(root))

        return { root }
      }

      it('should render unchecked and enabled toggles for all folders', async () => {
        const { root } = run()

        const folderToggles = root.getAllByRole('checkbox')
        for (const folderToggle of folderToggles) {
          expect(folderToggle).not.toBeChecked()
          expect(folderToggle).toBeEnabled()
        }
      })

      describe('and changes are saved', () => {
        const run = () => {
          const { root } = setup()

          fireEvent.click(allFoldersToggle(root))
          fireEvent.click(validateButton(root))
        }

        it('should call updateDirectoriesExclusions with the root folders', async () => {
          run()

          expect(updateDirectoriesExclusions).toHaveBeenCalledTimes(1)
          expect(updateDirectoriesExclusions).toHaveBeenCalledWith({
            client: mockClient,
            device: mockDevice,
            foldersToInclude: [],
            foldersToExclude: sortByPath(cloneDeep(includedFolders))
          })
          await waitFor(() =>
            expect(mockOnDeviceConfigured).toHaveBeenCalledTimes(1)
          )
        })
      })
    })

    describe('and an exluded parent folder is included', () => {
      const folderToInclude = excludedFolders[1]

      const run = () => {
        const { root } = setup()

        fireEvent.click(folderToggle(root, folderToInclude))

        return { root }
      }

      it('should render checked toggles for the folder and its descendants', async () => {
        const { root } = run()

        expect(folderToggle(root, folderToInclude)).toBeChecked()
        for (const child of childFolders.excluded) {
          expect(folderToggle(root, child)).toBeChecked()
        }
      })
    })

    describe('and an exluded child folder is included', () => {
      const folderToInclude = childFolders.excluded[1]

      const run = () => {
        const { root } = setup()

        fireEvent.click(folderToggle(root, folderToInclude))

        return { root }
      }

      it('should render checked toggles for the folder and its ancestors', async () => {
        const { root } = run()

        expect(folderToggle(root, excludedFolders[1])).toBeChecked()
        for (const child of childFolders.excluded) {
          expect(folderToggle(root, child)).toBeChecked()
        }
      })
    })

    describe('and an included parent folder is excluded', () => {
      const folderToExclude = includedFolders[1]

      const run = () => {
        const { root } = setup()

        fireEvent.click(folderToggle(root, folderToExclude))

        return { root }
      }

      it('should render unchecked toggles for the folder and its descendants', async () => {
        const { root } = run()

        expect(folderToggle(root, folderToExclude)).not.toBeChecked()
        for (const child of childFolders.included) {
          expect(folderToggle(root, child)).not.toBeChecked()
        }
      })
    })

    describe('and an included child folder is excluded', () => {
      const folderToExclude = childFolders.included[1]

      const run = () => {
        const { root } = setup()

        fireEvent.click(folderToggle(root, folderToExclude))

        return { root }
      }

      it('should render an unchecked toggle for the folder and checked toggles for its ancestors', async () => {
        const { root } = run()

        expect(folderToggle(root, includedFolders[1])).toBeChecked()
        expect(folderToggle(root, childFolders.included[0])).toBeChecked()
        expect(folderToggle(root, childFolders.included[1])).not.toBeChecked()
      })
    })

    describe('when saving', () => {
      const run = toChange => {
        const { root } = setup()

        for (const folder of toChange) {
          fireEvent.click(folderToggle(root, folder))
        }
        fireEvent.click(validateButton(root))
      }

      describe('top parents changes', () => {
        it('should call updateDirectoriesExclusions with the top folders', async () => {
          run([includedFolders[1], excludedFolders[1]])

          expect(updateDirectoriesExclusions).toHaveBeenCalledTimes(1)
          expect(updateDirectoriesExclusions).toHaveBeenCalledWith({
            client: mockClient,
            device: mockDevice,
            foldersToInclude: [excludedFolders[1]],
            foldersToExclude: [includedFolders[1]]
          })
          await waitFor(() =>
            expect(mockOnDeviceConfigured).toHaveBeenCalledTimes(1)
          )
        })
      })

      describe('bottom children changes', () => {
        it('should call updateDirectoriesExclusions with the first impacted folder or ancestor', async () => {
          run([childFolders.included[1], childFolders.excluded[1]])

          expect(updateDirectoriesExclusions).toHaveBeenCalledTimes(1)
          expect(updateDirectoriesExclusions).toHaveBeenCalledWith({
            client: mockClient,
            device: mockDevice,
            foldersToInclude: [excludedFolders[1]],
            foldersToExclude: [childFolders.included[1]]
          })
          await waitFor(() =>
            expect(mockOnDeviceConfigured).toHaveBeenCalledTimes(1)
          )
        })
      })

      describe('whole hierarchy exlusion from bottom child to top parent', () => {
        it('should call updateDirectoriesExclusions with the top parent', async () => {
          run([
            childFolders.included[1],
            childFolders.included[0],
            includedFolders[1]
          ])

          expect(updateDirectoriesExclusions).toHaveBeenCalledTimes(1)
          expect(updateDirectoriesExclusions).toHaveBeenCalledWith({
            client: mockClient,
            device: mockDevice,
            foldersToInclude: [],
            foldersToExclude: [includedFolders[1]]
          })
          await waitFor(() =>
            expect(mockOnDeviceConfigured).toHaveBeenCalledTimes(1)
          )
        })
      })
    })
  })
})
