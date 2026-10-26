import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import Tab from 'cozy-ui/transpiled/react/Tab'
import Tabs from 'cozy-ui/transpiled/react/Tabs'
import useBreakpoints from 'cozy-ui/transpiled/react/providers/Breakpoints'

import withAllLocales from '../../lib/withAllLocales'
import AppList from './AppList/AppList'
import DataList from './DataList/DataList'

import Page from '@/components/Page'
import PageTitle from '@/components/PageTitle'
import { routes } from '@/constants/routes'

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  }
}
const TabPanel = props => {
  const { isMobile, isTablet } = useBreakpoints()
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      className={isMobile || isTablet ? undefined : 'u-maw-7'}
      {...other}
    >
      {value === index && children}
    </div>
  )
}

const PermissionsTab = ({ t }) => {
  const { page } = useParams()
  const navigate = useNavigate()
  const { isMobile, isTablet } = useBreakpoints()
  const handleChange = (event, value) => {
    return navigate(`/permissions/${value}`)
  }

  return (
    <Page
      className={isMobile || isTablet ? '' : undefined}
      withoutMargin={isMobile || isTablet}
    >
      <div
        className={
          isMobile || isTablet
            ? 'u-ta-center u-flex u-flex-column u-flex-items-center'
            : 'u-flex u-mb-2'
        }
      >
        <PageTitle>{t('Permissions.permissions')}</PageTitle>
        <Tabs
          value={page}
          onChange={handleChange}
          segmented
          style={{ width: '20rem' }}
          className={isMobile || isTablet ? 'u-mh-half u-mt-1' : 'u-mh-1'}
        >
          <Tab
            value="slug"
            label={t('Permissions.applications')}
            href={`#${routes.appList}`}
            {...a11yProps(0)}
          />
          <Tab
            value="data"
            label={t('Permissions.data')}
            href={`#${routes.dataList}`}
            {...a11yProps(1)}
          />
        </Tabs>
      </div>
      <TabPanel value={page} index="slug">
        <AppList />
      </TabPanel>
      <TabPanel value={page} index="data">
        <DataList />
      </TabPanel>
    </Page>
  )
}

export default withAllLocales(PermissionsTab)
