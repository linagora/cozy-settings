import React, { useState } from 'react'
import { useI18n } from 'twake-i18n'

import { Dialog as DialogComponent } from 'cozy-ui/transpiled/react/CozyDialogs'
import Divider from 'cozy-ui/transpiled/react/Divider'
import Icon from 'cozy-ui/transpiled/react/Icon'
import RightIcon from 'cozy-ui/transpiled/react/Icons/Right'
import RiseIcon from 'cozy-ui/transpiled/react/Icons/Rise'
import ListItem from 'cozy-ui/transpiled/react/ListItem'
import ListItemIcon, {
  smallSize,
  mediumSize
} from 'cozy-ui/transpiled/react/ListItemIcon'
import ListItemSecondaryAction from 'cozy-ui/transpiled/react/ListItemSecondaryAction'
import ListItemText from 'cozy-ui/transpiled/react/ListItemText'
import { NavigationListSection } from 'cozy-ui/transpiled/react/NavigationList'
import Typography from 'cozy-ui/transpiled/react/Typography'
import useBreakpoints from 'cozy-ui/transpiled/react/providers/Breakpoints'

import withAllLocales from '../../../lib/withAllLocales'
import { sortDataByDate } from '../helpers/permissionsHelper'

const LatestOutgoingDataHistory = ({
  queryResultRemoteRequests,
  slugName,
  t
}) => {
  const [modalOpened, setModalOpened] = useState(false)
  const [modalData, setModalData] = useState()
  const { f } = useI18n()
  const { isDesktop } = useBreakpoints()

  const openModal = data => {
    setModalOpened(true)
    let formatedData = { ...data }
    delete formatedData._id
    delete formatedData._rev
    setModalData(formatedData)
  }

  const formatDate = ({ f, date }) => {
    return f(date, 'dd LLLL yyyy')
  }

  const handleClose = () => setModalOpened(false)

  return (
    <>
      {!isDesktop && (
        <Divider
          style={{
            height: '0.75rem',
            backgroundColor: 'var(--defaultBackgroundColor)'
          }}
        />
      )}
      <NavigationListSection>
        <ListItem ellipsis={false}>
          <Typography variant="h5">
            {t('Permissions.latest_data_releases')}
          </Typography>
        </ListItem>
        <Divider />
        {sortDataByDate(queryResultRemoteRequests).map((data, index) => {
          return (
            <div key={data.id}>
              <ListItem button onClick={() => openModal(data)} ellipsis={false}>
                <ListItemIcon>
                  <Icon
                    icon={RiseIcon}
                    size={mediumSize}
                    color="var(--warningColor)"
                    rotate={90}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={t(`CozyPermissions.${data.doctype}`)}
                  secondary={formatDate({
                    f,
                    date: new Date(data.created_at)
                  })}
                />
                <ListItemSecondaryAction>
                  <Icon
                    icon={RightIcon}
                    size={smallSize}
                    className="u-mr-1"
                    style={{ color: 'var(--secondaryTextColor)' }}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              {index !==
                sortDataByDate(queryResultRemoteRequests).length - 1 && (
                <Divider variant="inset" />
              )}
            </div>
          )
        })}
      </NavigationListSection>
      <DialogComponent
        open={modalOpened}
        onClose={handleClose}
        title={t('Permissions.monthly_statistics')}
        content={
          <>
            <p>
              {modalData &&
                t('Permissions.monthly_stats_phrase', {
                  app: slugName.toUpperCase(),
                  date: formatDate({
                    f,
                    date: new Date(modalData.created_at)
                  })
                })}
            </p>
            <code>
              <pre>{modalData && JSON.stringify(modalData, null, 2)}</pre>
            </code>
          </>
        }
      />
    </>
  )
}

export default withAllLocales(LatestOutgoingDataHistory)
