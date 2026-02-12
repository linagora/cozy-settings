import cx from 'classnames'
import React, { useCallback, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useI18n } from 'twake-i18n'

import { useClient } from 'cozy-client'
import Button from 'cozy-ui/transpiled/react/Buttons'
import Card from 'cozy-ui/transpiled/react/Card'
import CardContent from 'cozy-ui/transpiled/react/CardContent'
import CardHeader from 'cozy-ui/transpiled/react/CardHeader'
import Checkbox from 'cozy-ui/transpiled/react/Checkbox'
import { FixedDialog } from 'cozy-ui/transpiled/react/CozyDialogs'
import FormControl from 'cozy-ui/transpiled/react/FormControl'
import FormControlLabel from 'cozy-ui/transpiled/react/FormControlLabel'
import Icon from 'cozy-ui/transpiled/react/Icon'
import IconButton from 'cozy-ui/transpiled/react/IconButton'
import FileTypeFolderIcon from 'cozy-ui/transpiled/react/Icons/FileTypeFolder'
import RadioGroup from 'cozy-ui/transpiled/react/RadioGroup'
import Radio from 'cozy-ui/transpiled/react/Radios'
import Spinner from 'cozy-ui/transpiled/react/Spinner'
import Typography from 'cozy-ui/transpiled/react/Typography'
import { Media, Img } from 'cozy-ui/transpiled/react/deprecated/Media'
import { useAlert } from 'cozy-ui/transpiled/react/providers/Alert'

import { TreeItem, TreeView } from '@/components/CozyTreeView'
import {
  ROOT_FOLDER_ID,
  updateDirectoriesExclusions,
  useFolders
} from '@/lib/deviceConfigurationHelper'
import logger from '@/lib/logger'

const isNotSynchronized = (folder, device) =>
  folder.not_synchronized_on != null &&
  folder.not_synchronized_on.some(({ id }) => id === device._id)

const findMixedAncestors = (level, areMixed) => {
  if (
    level.parent == null ||
    !level.parent.isSelected ||
    areMixed.includes(level.parent)
  ) {
    return []
  } else {
    return findMixedAncestors(level.parent, areMixed).concat(level.parent)
  }
}

const initializeHierarchy = (folders, device) => {
  let areMixed = []

  const hierarchy = new Map([
    [
      ROOT_FOLDER_ID,
      {
        _id: ROOT_FOLDER_ID,
        children: [],
        isSelected: true,
        wasExcluded: false
      }
    ]
  ])
  for (const folder of folders) {
    if (folder._id === ROOT_FOLDER_ID) continue

    const parent = hierarchy.get(folder.dir_id)
    if (!parent) {
      throw new Error('Parents must come before their children')
    }

    const wasExcluded = isNotSynchronized(folder, device)
    const level = {
      _id: folder._id,
      children: [],
      parent,
      wasExcluded,
      isSelected:
        !wasExcluded &&
        !parent.wasExcluded &&
        ancestors(parent).every(a => !a.wasExcluded),
      folder
    }
    hierarchy.set(level._id, level)

    parent.children.push(level)

    if (!level.isSelected) {
      areMixed = areMixed.concat(findMixedAncestors(level, areMixed))
    }
  }

  // Return root folders
  return {
    areMixed,
    hierarchy
  }
}

const levels = hierarchy => Array.from(hierarchy.values())

const ancestors = level =>
  level.parent != null ? [level.parent].concat(ancestors(level.parent)) : []
const descendants = level =>
  level.children.concat(...level.children.map(child => descendants(child)))
const isMixed = level =>
  level.isSelected && descendants(level).some(d => !d.isSelected)

const FoldersLoading = () => (
  <div className="u-ta-center">
    <Spinner size="xxlarge" />
  </div>
)

const FolderCheckbox = ({ onClick, checked, mixed, disabled, ...props }) => (
  <IconButton size="small" onClick={onClick}>
    <Checkbox
      checked={checked}
      mixed={mixed}
      disabled={disabled}
      disableRipple={true}
      {...props}
    />
  </IconButton>
)

const FolderLevel = ({
  level,
  checked,
  mixed,
  disabled,
  isExpanded,
  isLast,
  toggleSelection
}) => {
  const labelStyle = useMemo(
    () => ({
      overflow: 'unset',
      paddingRight: '1rem'
    }),
    []
  )

  return (
    <TreeItem
      divider={!isLast || isExpanded}
      nodeId={level._id}
      label={
        <Media>
          <Img className="u-pr-half">
            <FolderCheckbox
              data-testid={`toggle-${level.folder.name}-inclusion`}
              checked={checked}
              mixed={mixed}
              disabled={disabled}
              onClick={event => {
                event.stopPropagation()
                toggleSelection(level)
              }}
            />
          </Img>
          <Img className="u-pr-1">
            <Icon icon={FileTypeFolderIcon} width="16" height="16" />
          </Img>
          <Typography
            noWrap
            variant="body1"
            display="inline"
            style={labelStyle}
          >
            {level.folder.name}
          </Typography>
        </Media>
      }
    >
      {level.children.map((child, index) => (
        <FolderLevel
          key={child._id}
          level={child}
          checked={child.isSelected}
          mixed={isMixed(child)}
          disabled={disabled}
          isLast={isLast && index === level.children.length - 1}
          toggleSelection={toggleSelection}
        />
      ))}
    </TreeItem>
  )
}

const countChecked = levels =>
  levels.reduce(
    (count, level) =>
      count + (level.isSelected ? 1 : 0) + countChecked(level.children),
    0
  )

const FoldersTree = ({
  disabled,
  rootLevels,
  defaultExpanded,
  setPartialSync
}) => {
  const { t } = useI18n()

  const hasLevels = useMemo(() => rootLevels.length > 0, [rootLevels])
  // XXX: The checkedLevels state is used to force a re-render when an inclusion
  // toggle is clicked. Otherwise, just updating the levels' data won't be
  // enough.
  const [checkedLevels, setCheckedLevels] = useState(countChecked(rootLevels))
  const [expanded, setExpanded] = useState(defaultExpanded)

  const noneSelected = useMemo(
    () => rootLevels.every(level => !level.isSelected) || checkedLevels === 0,
    [checkedLevels, rootLevels]
  )

  const toggleAllSelection = useCallback(() => {
    if (noneSelected) {
      rootLevels.forEach(level => {
        level.isSelected = true
        descendants(level).forEach(d => {
          d.isSelected = true
        })
      })
      setCheckedLevels(count => count - rootLevels.length)
    } else {
      rootLevels.forEach(level => {
        level.isSelected = false
        descendants(level).forEach(d => {
          d.isSelected = false
        })
      })
      setCheckedLevels(count => count + rootLevels.length)
    }
    setPartialSync(true)
  }, [noneSelected, rootLevels, setPartialSync])
  const toggleSelection = useCallback(
    level => {
      if (level.isSelected) {
        level.isSelected = false
        descendants(level).forEach(d => {
          d.isSelected = false
        })
        setCheckedLevels(count => count - 1)
      } else {
        level.isSelected = true
        ancestors(level).forEach(a => {
          a.isSelected = true
        })
        descendants(level).forEach(d => {
          d.isSelected = true
        })
        setCheckedLevels(count => count + 1)
      }
      setPartialSync(true)
    },
    [setPartialSync]
  )

  const headerClasses = useMemo(
    () => ({
      root: cx('u-pv-0 u-pl-0 u-pr-1-half'),
      action: 'u-mv-0 u-mr-0'
    }),
    []
  )
  const headerStyle = useMemo(
    () => ({
      backgroundColor: 'var(--defaultBackgroundColor)',
      flexDirection: 'row-reverse'
    }),
    []
  )

  return (
    <Card className="u-mt-1 u-p-0">
      <CardHeader
        title={
          <Typography
            variant="subtitle1"
            display="inline"
            color="textSecondary"
          >
            {t('configureDevice.my_cozy')}
          </Typography>
        }
        action={
          hasLevels && (
            <FolderCheckbox
              data-testid="toggle-all-inclusion"
              checked={!noneSelected}
              mixed={
                !noneSelected &&
                rootLevels.some(level => !level.isSelected || isMixed(level))
              }
              disabled={disabled}
              onClick={toggleAllSelection}
            />
          )
        }
        classes={headerClasses}
        style={headerStyle}
      />
      {hasLevels ? (
        <CardContent className="u-p-0 u-ov-auto">
          <TreeView
            defaultExpanded={defaultExpanded}
            onNodeToggle={(event, nodeIds) => setExpanded(nodeIds)}
          >
            {rootLevels.map((level, index) => (
              <FolderLevel
                key={level._id}
                level={level}
                checked={level.isSelected}
                mixed={isMixed(level)}
                disabled={disabled}
                isExpanded={expanded.includes(level._id)}
                isLast={index === rootLevels.length - 1}
                toggleSelection={toggleSelection}
              />
            ))}
          </TreeView>
        </CardContent>
      ) : (
        <CardContent className="u-ta-center">
          <Icon
            icon={FileTypeFolderIcon}
            width="64"
            height="64"
            className="u-o-50"
          />
          <Typography variant="body1" color="textSecondary">
            {t('configureDevice.no_folders')}
          </Typography>
        </CardContent>
      )}
    </Card>
  )
}

const ConfigureDeviceSyncDialog = ({
  device,
  cancelAction,
  onDeviceConfigured
}) => {
  const { t } = useI18n()
  const client = useClient()

  const [partialSync, setPartialSync] = useState(false)
  const [expanded, setExpanded] = useState([])
  const { folders, loading, failed } = useFolders(client)
  const [hierarchy, setHierarchy] = useState(new Map())
  const hasFolders = useMemo(() => folders.length > 0, [folders])
  const { showAlert } = useAlert()

  useMemo(() => {
    if (failed) {
      showAlert({
        message: t('configureDevice.load_error'),
        type: 'error'
      })
    } else if (!loading) {
      const { areMixed, hierarchy } = initializeHierarchy(folders, device)

      setHierarchy(hierarchy)

      if (levels(hierarchy).some(level => !level.isSelected)) {
        setExpanded(areMixed.map(({ _id }) => _id))
        setPartialSync(true)
      }
    }
  }, [device, failed, folders, loading, showAlert, t])

  const onPartialSyncChange = useCallback(
    event => setPartialSync(event.target.value === 'true'),
    [setPartialSync]
  )

  const configureDevice = useCallback(async () => {
    let foldersToInclude = []
    let foldersToExclude = []

    if (partialSync) {
      levels(hierarchy).forEach(level => {
        if (level.isSelected) {
          // Re-include folders that were re-selected
          if (level.wasExcluded) foldersToInclude.push(level.folder)
        } else if (level.wasExcluded) {
          // Re-include folders whose ancestor was un-selected
          if (ancestors(level).some(a => !a.isSelected)) {
            foldersToInclude.push(level.folder)
          }
        } else {
          // Exlude folders that were un-selected
          if (ancestors(level).every(a => a.isSelected)) {
            foldersToExclude.push(level.folder)
          }
        }
      })
    } else {
      // Re-include all exluded folders
      foldersToInclude = levels(hierarchy)
        .filter(level => level.wasExcluded)
        .map(level => level.folder)
    }

    try {
      await updateDirectoriesExclusions({
        device,
        foldersToInclude,
        foldersToExclude,
        client
      })
      onDeviceConfigured()
      showAlert({
        message: t('configureDevice.configure_success'),
        type: 'success'
      })
    } catch (err) {
      logger.warn(err)
      return showAlert({
        message: t('configureDevice.configure_error'),
        type: 'error'
      })
    }
  }, [partialSync, hierarchy, onDeviceConfigured, device, client, showAlert, t])

  return (
    <FixedDialog
      open
      title={device.client_name}
      actions={
        <>
          <Button
            label={t('configureDevice.cancel')}
            variant="secondary"
            onClick={cancelAction}
          />
          <Button
            label={t('configureDevice.validate')}
            onClick={configureDevice}
          />
        </>
      }
      onClose={cancelAction}
      content={
        loading ? (
          <FoldersLoading />
        ) : (
          <>
            <ReactMarkdown source={t('configureDevice.description')} />
            <FormControl className="u-pl-half">
              <RadioGroup
                name="partialSync"
                value={String(partialSync)}
                onChange={onPartialSyncChange}
              >
                <FormControlLabel
                  value="false"
                  control={<Radio />}
                  label={t('configureDevice.partialSync.disable')}
                />
                <FormControlLabel
                  value="true"
                  disabled={!hasFolders}
                  control={<Radio />}
                  label={t('configureDevice.partialSync.enable')}
                />
              </RadioGroup>
            </FormControl>
            <FoldersTree
              disabled={!partialSync}
              rootLevels={
                hierarchy.has(ROOT_FOLDER_ID)
                  ? hierarchy.get(ROOT_FOLDER_ID).children
                  : []
              }
              defaultExpanded={expanded}
              setPartialSync={setPartialSync}
            />
          </>
        )
      }
    />
  )
}

export default ConfigureDeviceSyncDialog
