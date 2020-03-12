import React, { Component } from 'react'
import { Icon, Typography } from 'antd'
import { blue } from '@ant-design/colors';

const { Title } = Typography

export default class Logo extends Component {
  render() {
    const { showTitle, dark } = this.props
    return (
      <div style={{ marginTop: 30, marginBottom: 20}}>
        <div
          style={{
            width: '100%',
            
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon
            type="rocket"
            style={{ fontSize: '50px', color: dark ? blue.primary : 'white' }}
          />
        </div>
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {showTitle ? (
            <Title
              level={4}
              style={{ color: dark ? blue.primary : 'white', margin: 10, padding: 5 }}
            >
              {showTitle ? 'BCCloud' : ''}
            </Title>
          ) : null}
        </div>
      </div>
    )
  }
}
