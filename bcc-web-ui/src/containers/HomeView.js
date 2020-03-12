import React, { useContext, useState } from 'react'
import {
  Switch,
  Route,
  Redirect,
  useRouteMatch,
  useHistory,
  useLocation
} from 'react-router-dom'
import { Layout, Menu, Icon } from 'antd'

import { UserSessionContext } from '../contexts/UserSessionContext'
import Logo from '../components/Logo'

import ProfileHeader from '../components/ProfileHeader'
import ChainListView from './ChainListView'
import ChainView from './ChainView'
import ProjectListView from './ProjectListView'
import ProjectView from './ProjectView'
import ServiceListView from './ServiceListView'
import DatastoreListView from './DatastoreListView'
import DatastoreView from './DatastoreView'

const { Sider, Content } = Layout

export default function HomeView() {
  const { session } = useContext(UserSessionContext)
  const { path, url } = useRouteMatch()
  const history = useHistory()
  const { pathname } = useLocation()
  const [menuCollapsed, setMenuCollapsed] = useState(false)
  if (!session) {
    return <Redirect to="/login" />
  } else {
    return (
      <Layout style={{ height: '100vh' }}>
        <Sider
          collapsible
          collapsed={menuCollapsed}
          onCollapse={setMenuCollapsed}
        >
          <Logo showTitle={false} />
          <Menu
            theme="dark"
            mode="inline"
            onClick={({ key }) => {
              history.push(`${url}/${key}`)
            }}
            selectedKeys={pathname.split('/').filter(name => name !== 'home')}
          >
            <Menu.Item key="dashboard">
              <Icon type="dashboard" />
              <span>Dashboard</span>
            </Menu.Item>
            <Menu.Item key="chain">
              <Icon type="cluster" />
              <span>My Chain</span>
            </Menu.Item>
            <Menu.Item key="project">
              <Icon type="picture" />
              <span>My Project</span>
            </Menu.Item>
            <Menu.Item key="service">
              <Icon type="cloud-server" />
              <span>My Service</span>
            </Menu.Item>
            <Menu.Item key="datastore">
              <Icon type="database" />
              <span>My Datastore</span>
            </Menu.Item>
          </Menu>
        </Sider>
        {/* content -------------------------------------------------- */}
        <Layout style={{ height: '100vh' }}>
          <ProfileHeader />
          <Content style={{ padding: 50 }}>
            <Switch>
              <Route path={`${path}/dashboard`}>
                {/* <DashboardView /> */}
              </Route>
              <Route path={`${path}/chain/:chainId`}>
                <ChainView />
              </Route>
              <Route path={`${path}/chain`}>
                <ChainListView />
              </Route>
              <Route path={`${path}/project/:projectId`}>
                <ProjectView />
              </Route>
              <Route path={`${path}/project`}>
                <ProjectListView />
              </Route>
              <Route path={`${path}/service`}>
                <ServiceListView />
              </Route>
              <Route path={`${path}/datastore/:datastoreId`}>
                <DatastoreView />
              </Route>
              <Route path={`${path}/datastore`}>
                <DatastoreListView />
              </Route>

              <Route exact path={`${path}/`}>
                <Redirect to="/home/dashboard" />
              </Route>
            </Switch>
          </Content>
        </Layout>
      </Layout>
    )
  }
}
