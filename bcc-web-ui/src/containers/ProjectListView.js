import React from 'react'
import { DeleteOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Table, Breadcrumb, message, Card, Drawer, Tooltip } from 'antd';
import moment from 'moment'
import { useHistory, useRouteMatch, Link } from 'react-router-dom'
import { UserSessionContext } from '../contexts/UserSessionContext'
import api from '../api/index'

import CreateProjectForm from '../components/CreateProjectForm'

export default function ProjectListView() {
  const { session } = React.useContext(UserSessionContext)
  const history = useHistory()
  const { url } = useRouteMatch()
  const [isLoading, setIsLoading] = React.useState(true)
  const [loadFailed, setLoadFailed] = React.useState(false)
  const [projectList, setProjectList] = React.useState([])
  const [showCreateProject, setShowCreateProject] = React.useState(false)


  const fetchProjectList = async () => {
    setIsLoading(true)
    try {
      const list = await api.project.getUserProjectList(session.userId)
      const projectList = list.map(project => {
        return {
          ...project,
          key: project.projectId,
          createdOn: moment(project.createdOn).format()
        }
      })
      setProjectList(projectList)
    } catch (error) {
      console.log(error)
      message.error(error.message)
    }
    setIsLoading(false)
  }

  const createProject = async ({ name }) => {
    try {
      await api.project.createUserProject(session.userId, name)
      setShowCreateProject(false)
      await fetchProjectList()
    } catch (error) {
      console.log(error)
      message.error(error.message)
    }
  }

  const deleteProject = async (projectId)=>{
    await api.project.deleteUserProject(session.userId, projectId)
    await fetchProjectList()
  }

  React.useEffect(() => {
    fetchProjectList()
  }, [])

  return (
    <React.Fragment>
      {/* sub navi --------------------------------------------------------- */}
      <Breadcrumb>
        <Breadcrumb.Item
          onClick={() => {
            history.push('/home')
          }}
        >
          <Link to="/home">Home</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>My Project</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ marginTop: 40, display: 'flex' }}>
        <Tooltip title="Create Project">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setShowCreateProject(true)
            }}
          >
            Create Project
          </Button>
        </Tooltip>
      </div>

      <Card style={{ marginTop: 20 }}>
        <Card.Meta title="Project List" />
        <Table
          dataSource={projectList}
          style={{ marginTop: 20 }}
          pagination={false}
          bordered={false}
          // showHeader={false}
        >
          <Table.Column title="Name" dataIndex="name" />
          <Table.Column title="Files" dataIndex="fileCount" />
          <Table.Column title="Created On" dataIndex="createdOn" />
          <Table.Column
            title="Actions"
            key="action"
            render={(text, record) => (
              <React.Fragment>
                <EyeOutlined
                  style={{ fontSize: 20, marginRight: 10 }}
                  onClick={() => {
                    history.push(`${url}/${record.projectId}`)
                  }} />
                <DeleteOutlined
                  style={{ fontSize: 20, marginRight: 10 }}
                  onClick={async () => {
                    await deleteProject(record.projectId)
                  }} />
              </React.Fragment>
            )}
          />
        </Table>
      </Card>

      <Drawer
        title="Create New Project"
        width={300}
        visible={showCreateProject}
        onClose={() => {
          setShowCreateProject(false)
        }}
      >
        <CreateProjectForm valueCallback={createProject} />
      </Drawer>
    </React.Fragment>
  );
}
