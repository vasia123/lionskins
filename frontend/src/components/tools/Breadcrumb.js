import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withTranslation } from 'react-i18next'
import { Breadcrumb as SemanticUIBreadcrumb } from 'semantic-ui-react'
import PropTypes from 'prop-types'

class Breadcrumb extends Component {
  render () {
    const { items, t } = this.props
    return (
      <SemanticUIBreadcrumb>
        <SemanticUIBreadcrumb.Section><Link to='/'>{t('breadcrumb.home')}</Link></SemanticUIBreadcrumb.Section>
        {items.map((item) => [
          <SemanticUIBreadcrumb.Divider key='divider' icon='right angle' />,
          <SemanticUIBreadcrumb.Section key={item.name}>
            {item.link ? <Link to={item.link}>{item.name}</Link> : item.name}
          </SemanticUIBreadcrumb.Section>
        ])
        }
      </SemanticUIBreadcrumb>
    )
  }
}

Breadcrumb.propTypes = {
  t: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      link: PropTypes.string
    })
  )
}

export default withTranslation()(Breadcrumb)
