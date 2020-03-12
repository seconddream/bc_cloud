import React from 'react'
import {
  Breadcrumb,
  Icon,
  Menu,
  Button,
  message,
  Row,
  Col,
  Empty,
  Modal,
  Tag,
  Skeleton,
  Drawer,
  Typography,
  Form,
  Input,
  Select
} from 'antd'
import {
  useParams,
  useHistory,
  useRouteMatch,
  Link,
  Switch,
  Route,
  useLocation,
  Redirect
} from 'react-router-dom'
import Editor, { monaco } from '@monaco-editor/react'

import { UserSessionContext } from '../contexts/UserSessionContext'
import api from '../api/index'

import CreateContractForm from '../components/CreateContractForm'
import TaskConsolePopUp from '../components/TaskConsolePopUp'
import DeployArtifactForm from '../components/DeployArtifactForm'

const TagColor = {
  error: 'red',
  warning: 'orange'
}

const SeverityLevel = {
  error: 8,
  warning: 4
}

const formItemLayout = {
  labelCol: {
    sm: { span: 4, offset: 1 }
  },
  wrapperCol: {
    sm: { span: 15, offset: 1 }
  }
}

const compilerVersionList = [
  'v0.6.3-nightly.2020.2.7+commit.462cd432',
  'v0.6.2+commit.bacdbe57',
  'v0.6.1+commit.e6f7d5a4',
  'v0.6.0+commit.26b70077',
  'v0.5.16+commit.9c3226ce',
  'v0.5.15+commit.6a57276f',
  'v0.5.14+commit.1f1aaa4',
  'v0.5.13+commit.5b0b510c',
  'v0.5.12+commit.7709ece9',
  'v0.5.11+commit.c082d0b4',
  'v0.5.10+commit.5a6ea5b1',
  'v0.5.9+commit.e560f70d',
  'v0.5.8+commit.23d335f2',
  'v0.5.7+commit.6da8b019',
  'v0.5.6+commit.b259423e',
  'v0.5.4+commit.9549d8ff',
  'v0.5.3+commit.10d17f24',
  'v0.5.2+commit.1df8f40c',
  'v0.5.1+commit.c8a2cb62',
  'v0.5.0+commit.1d4f565a'
]

export default function ProjectView(props) {
  const { session } = React.useContext(UserSessionContext)
  const monacoRef = React.useRef()
  const editorRef = React.useRef()
  const [project, setProject] = React.useState(null)
  const [monitorTask, setMonitorTask] = React.useState(null)
  const [showCreateFile, setShowCreateFile] = React.useState(false)
  const [unsavedChanges, setUnsafedChanges] = React.useState(false)
  const [selectedItem, setSelectedItem] = React.useState(null)
  const [showDeploy, setShowDeploy] = React.useState(false)
  const [compilerVersion, setCompilerVersion] = React.useState(
    'v0.5.0+commit.1d4f565a'
  )
  const params = useParams()
  const history = useHistory()

  const fetchProject = async () => {
    try {
      const project = await api.project.getUserProject(
        session.userId,
        params.projectId
      )
      setProject(project)
      const monacoInstance = monacoRef.current
      if (monacoInstance) renderErrors(project.compileErrors)
      return project
    } catch (error) {
      console.log(error)
      message.error(error.message)
    }
  }

  const clearAllModel = () => {
    const monacoInstance = monacoRef.current
    if (!monacoInstance) return
    monacoInstance.editor.getModels().forEach(model => {
      model.dispose()
    })
  }

  const createCodeModel = (filename, sourceCode) => {
    const monacoInstance = monacoRef.current
    // create model
    try {
      const model = monacoInstance.editor.createModel(
        sourceCode,
        'sol',
        monacoInstance.Uri.file(filename)
      )
      setUnsafedChanges(true)
      // bind update call back
      model.onDidChangeContent(async e => {
        setUnsafedChanges(true)
      })
    } catch (error) {
      console.log(error)
      message.error(error.message)
    }
  }

  const createFile = values => {
    try {
      const { name } = values
      let filename = name.split('.')[0] + '.sol'
      if (project.files[filename] !== undefined) {
        message.error('Filename used.')
        return
      }
      createCodeModel(filename, '')
      const files = { ...project.files, [filename]: '' }
      setProject({ ...project, files })
    } catch (error) {
      console.log(error)
      message.error(error.message)
    }
    setShowCreateFile(false)
  }

  const deleteFile = () => {
    try {
      const monacoInstance = monacoRef.current
      if (!selectedItem || selectedItem[0] !== 'file') return
      const filename = selectedItem[1]
      const model = monacoInstance.editor.getModel(
        monacoInstance.Uri.file(filename)
      )
      model.dispose()
      const files = { ...project.files }
      delete files[filename]
      setProject({ ...project, files })
    } catch (error) {
      console.log(error)
      message.error(error.message)
    }
  }

  const save = async () => {
    try {
      const monacoInstance = monacoRef.current
      const fileModels = monacoInstance.editor.getModels()
      const files = {}
      for (const fileModel of fileModels) {
        const filename = fileModel.uri.path.split('/')[1]
        console.log(filename)
        files[filename] = fileModel.getValue()
      }
      await api.project.updateUserProjectFiles(
        session.userId,
        params.projectId,
        files
      )
      message.success('Project saved.')
    } catch (error) {
      console.log(error)
      message.error('Unable to save!')
    }
  }

  const handleFileSelect = ({ key }) => {
    setSelectedItem(['file', key])
    const editor = editorRef.current
    if (editor) {
      const monacoInstance = monacoRef.current
      const selectModel = monacoInstance.editor.getModel(
        monacoInstance.Uri.file(key)
      )
      editor.setModel(selectModel)
    }
  }

  const handleArtifactSelect = ({ key }) => {
    setSelectedItem(['artifact', key])
  }

  const clearErrorMarkers = () => {
    const monacoInstance = monacoRef.current
    const models = monacoInstance.editor.getModels()
    models.forEach(model => {
      monacoInstance.editor.setModelMarkers(model, 'owner', [])
    })
  }

  const renderErrors = errors => {
    const monacoInstance = monacoRef.current
    clearErrorMarkers()
    const modelMarkers = {}
    for (const compileError of errors) {
      const filename = compileError.sourceLocation.file
      const startLineNumber = parseInt(
        compileError.formattedMessage.split(':')[1]
      )
      const endLineNumber = parseInt(
        compileError.formattedMessage.split(':')[1]
      )
      const startColumn = parseInt(compileError.formattedMessage.split(':')[2])
      const endColumn =
        startColumn +
        (compileError.sourceLocation.end - compileError.sourceLocation.start)
      const message = compileError.formattedMessage
      const severity = SeverityLevel[compileError.severity]
      const modelMarker = {
        startLineNumber,
        startColumn,
        endLineNumber,
        endColumn,
        message,
        severity
      }
      if (!modelMarkers[filename]) {
        modelMarkers[filename] = []
      }
      modelMarkers[filename].push(modelMarker)
    }
    for (const [filename, markers] of Object.entries(modelMarkers)) {
      monacoInstance.editor.setModelMarkers(
        monacoInstance.editor.getModel(monacoInstance.Uri.file(filename)),
        'owner',
        markers
      )
    }
  }

  const handleEditorDidMount = (_, editor) => {
    const monacoInstance = monacoRef.current
    const selectedModel = monacoInstance.editor.getModel(
      monacoInstance.Uri.file(selectedItem[1])
    )
    editorRef.current = editor
    editor.setModel(selectedModel)
  }

  const compileProject = async () => {
    await api.project.updateUserProjectCompilerVersion(session.userId, project.projectId, compilerVersion)
    await fetchProject()
    const { taskId } = await api.project.compileUserProject(
      session.userId,
      params.projectId
    )
    setMonitorTask(taskId)
  }
  const deployArtifact = async values => {
    try {
      const { chainId, args } = values
      const chain = await api.chain.getUserChain(session.userId, chainId)
      const artifactName = selectedItem[1]
      const projectId = params.projectId
      const userId = session.userId

      if (chain.config.expose) {
        message.error(`Deploy artifact to exposed chain not supported.`)
      } else {
        const { taskId } = await api.chain.deployProjectArtifactToUserChain(
          userId,
          chainId,
          projectId,
          artifactName,
          args
        )
        setMonitorTask(taskId)
      }
    } catch (error) {
      console.log(error)
      message.error('Failed to create task: ' + error.message)
    }
    setShowDeploy(false)
  }

  React.useEffect(() => {
    async function initLoad() {
      const monacoInstance = await monaco.init()
      monacoRef.current = monacoInstance
      // fetch project
      const project = await fetchProject()
      // init monaco

      clearAllModel()
      // load file models into monaco
      for (const [filename, sourceCode] of Object.entries(project.files)) {
        createCodeModel(filename, sourceCode)
      }
      renderErrors(project.compileErrors)
    }
    initLoad()
  }, [])

  if (!project || !monacoRef.current) return <Skeleton loading />
  const { files, compileErrors, artifacts } = project
  return (
    <React.Fragment>
      {/* task monitor ----------------------------------------------------- */}
      {monitorTask ? (
        <TaskConsolePopUp
          taskId={monitorTask}
          onClose={async () => {
            setMonitorTask(null)
            await fetchProject()
          }}
        />
      ) : null}

      {/* breadcrumb navi -------------------------------------------------- */}
      <Breadcrumb>
        <Breadcrumb.Item
          onClick={() => {
            history.push('/home')
          }}
        >
          <Link to="/home">Home</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/home/project">My Project</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <span>{project.name}</span>
        </Breadcrumb.Item>
      </Breadcrumb>

      {/* tool bar ------------------------------------------------------- */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          marginTop: 40
        }}
      >
        <Button
          icon="file-add"
          type="primary"
          style={{ marginRight: 10 }}
          onClick={() => {
            setShowCreateFile(true)
          }}
        >
          New File
        </Button>
        <Button
          icon="save"
          type="primary"
          style={{ marginRight: 10 }}
          onClick={save}
        >
          Save Project
        </Button>
        <Button
          icon="thunderbolt"
          type="primary"
          style={{ marginRight: 10 }}
          onClick={compileProject}
        >
          Compile Project
        </Button>
        <div style={{ flex: 1 }}></div>
        <Select
          style={{ marginRight: 10 }}
          value={compilerVersion}
          onSelect={version => {
            setCompilerVersion(version)
          }}
        >
          {compilerVersionList.map(v => (
            <Select.Option key={v} value={v}>
              {v}
            </Select.Option>
          ))}
        </Select>
        <Button icon="delete" type="danger" onClick={deleteFile}>
          Delete File
        </Button>
      </div>

      {/* code  ------------------------------------------------------------ */}

      <Row
        gutter={0}
        style={{ marginTop: 40, height: '70vh', marginBottom: 40 }}
      >
        {/* code expolore -------------------------------------------------- */}
        <Col
          span={6}
          style={{
            height: '100%',
            background: 'white',
            borderRight: '1px solid lightgray',
            overflowY: 'auto'
          }}
        >
          <Menu
            mode="inline"
            defaultOpenKeys={['file']}
            onSelect={handleFileSelect}
            selectedKeys={selectedItem}
          >
            <Menu.SubMenu
              key="file"
              title={
                <Typography.Text type="secondary" strong>
                  FILES
                </Typography.Text>
              }
            >
              {Object.keys(files).map(filename => (
                <Menu.Item
                  key={filename}
                  style={
                    compileErrors.filter(
                      error => error.sourceLocation.file === filename
                    ).length > 0
                      ? { color: 'red' }
                      : null
                  }
                >
                  {filename}
                </Menu.Item>
              ))}
            </Menu.SubMenu>
          </Menu>
          <Menu
            mode="inline"
            defaultOpenKeys={['artifact']}
            onSelect={handleArtifactSelect}
            selectedKeys={selectedItem}
          >
            <Menu.SubMenu
              key="artifact"
              title={
                <Typography.Text type="secondary" strong>
                  ARTIFACTS
                </Typography.Text>
              }
            >
              {Object.keys(artifacts).map(artifactName => (
                <Menu.Item key={artifactName}>{artifactName}</Menu.Item>
              ))}
            </Menu.SubMenu>
          </Menu>
        </Col>
        <Col
          span={18}
          style={{ height: '100%', background: 'white', overflowY: 'auto' }}
        >
          {selectedItem ? (
            selectedItem[0] === 'file' ? (
              <div style={{ height: '100%', paddingTop: 20 }}>
                {/* editor --------------------------------------------------- */}
                <Editor editorDidMount={handleEditorDidMount} />
              </div>
            ) : (
              <div style={{ height: '100%', paddingTop: 40 }}>
                <Form {...formItemLayout} colon={false}>
                  <Form.Item label="Aritfact Name">
                    <Input value={selectedItem[1]} />
                  </Form.Item>
                  <Form.Item label="Aritfact Type">
                    <Input
                      value={
                        project.artifacts[
                          selectedItem[1]
                        ].evm.assembly.includes('contract')
                          ? 'Contract'
                          : 'N/A'
                      }
                    />
                  </Form.Item>
                  <Form.Item label="Compiler Version">
                    <Input
                      value={
                        JSON.parse(project.artifacts[selectedItem[1]].metadata)
                          .compiler.version
                      }
                    />
                  </Form.Item>
                  <Form.Item label="Gas Estimation">
                    <Input
                      value={
                        project.artifacts[selectedItem[1]].evm.gasEstimates
                          .creation.totalCost
                      }
                    />
                  </Form.Item>
                  <Form.Item label="ABI">
                    <Input.TextArea
                      rows={4}
                      value={JSON.stringify(
                        project.artifacts[selectedItem[1]].abi
                      )}
                    />
                  </Form.Item>
                  <Form.Item label="Bytecode">
                    <Input.TextArea
                      rows={4}
                      value={
                        project.artifacts[selectedItem[1]].evm.bytecode.object
                      }
                    />
                  </Form.Item>
                  <Form.Item label="Opcodes">
                    <Input.TextArea
                      rows={4}
                      value={
                        project.artifacts[selectedItem[1]].evm.bytecode.opcodes
                      }
                    />
                  </Form.Item>
                  <Form.Item label=" ">
                    <Button
                      type="default"
                      icon="database"
                      onClick={() => {
                        setShowDeploy(true)
                      }}
                    >
                      Deploy
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            )
          ) : (
            <Empty description="Please select..." style={{ paddingTop: 200 }} />
          )}
        </Col>
      </Row>

      <Drawer
        title="Create New File"
        visible={showCreateFile}
        onClose={() => {
          setShowCreateFile(false)
        }}
      >
        <CreateContractForm valueCallback={createFile} />
      </Drawer>

      <Drawer
        title="Deploy Artifact"
        visible={showDeploy}
        onClose={() => {
          setShowDeploy(false)
        }}
        width={500}
      >
        <DeployArtifactForm
          valueCallback={deployArtifact}
          abi={
            selectedItem
              ? selectedItem[0] === 'artifact'
                ? project.artifacts[selectedItem[1]].abi
                : []
              : []
          }
        />
      </Drawer>
    </React.Fragment>
  )
}
