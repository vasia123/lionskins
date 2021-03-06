import React, { Component } from 'react'
import { Helmet } from 'react-helmet'
import gql from 'graphql-tag'
import { withApollo } from 'react-apollo'
import { connect } from 'react-redux'
import * as actions from '../../actions'
import { Container, Header } from 'semantic-ui-react'
import { Qualities, Weapons } from '../../components/csgo/enums'
import SkinSummary from '../../components/csgo/SkinSummary'
import SkinPrices from '../../components/csgo/SkinPrices'
import Img from 'react-image'
import slugify from 'slugify'
import PropTypes from 'prop-types'
import Breadcrumb from '../../components/tools/Breadcrumb'
import PageNotFound from '../PageNotFound'
import { withTranslation } from 'react-i18next'

const importAll = (r) => {
  let images = {}
  r.keys().forEach((item) => { images[item.replace('./', '')] = r(item) })
  return images
}

const defaultWeaponImages = importAll(require.context('../../assets/images/csgo/', false, /default_skin_\w+\.png/))

class SkinPage extends Component {
  rootName = 'csgo'
  query = gql`
    query ($weapon: CSGOWeapons, $slug: String, $currency: TypeCurrency) {
      csgo (weapon: $weapon, slug: $slug) {
        edges {
          node {
            id
            name
            slug
            imageUrl
            statTrak
            quality
            rarity
            souvenir
            weapon {
              name
              category
            }
            prices (currency: $currency) {
              price
              currency
              provider
            }
          }
        }
      }
    }
  `

  constructor (props) {
    super(props)
    this.state = {
      breadcrumb: [
        { name: 'Counter-Strike: Global Offensive', link: '/counter-strike-global-offensive/' }
      ],
      skins: [],
      images: {},
      quality: 'factory_new',
      notFound: false
    }
  }

  componentDidMount () {
    this.executeQuery()
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.currency !== this.props.currency) {
      this.setState({
        breadcrumb: [this.state.breadcrumb[0]],
        skins: [],
        notFound: false
      }, this.executeQuery)
    }
  }

  async executeQuery () {
    const { currency, t } = this.props
    const { weapon, slug } = this.props.match.params
    const result = await this.props.client.query({
      query: this.query,
      variables: {
        weapon: Object.keys(Weapons).find(e => slugify(e.replace('_', '-'), { lower: true }) === weapon),
        currency,
        slug
      }
    })

    const skins = result.data[this.rootName].edges.map(e => e.node)
    if (!skins.length) {
      this.setState({ notFound: true })
      return
    }

    const images = {}
    const breadcrumb = [
      ...this.state.breadcrumb,
      { name: t(Weapons[skins[0].weapon.name]) },
      { name: skins[0].name }
    ]

    Object.keys(Qualities).forEach(quality => {
      let defaultSkin = skins.find(s => s.quality === quality && s.imageUrl)
      let imageUrl = defaultWeaponImages[`default_skin_${skins[0].weapon.name}.png`]
      if (defaultSkin) {
        imageUrl = defaultSkin.imageUrl
      }
      images[quality] = imageUrl
    })

    this.setState({
      breadcrumb,
      skins,
      images
    })
  }

  render () {
    const { t } = this.props
    const { notFound, breadcrumb, skins, images, quality } = this.state

    if (notFound) {
      return <PageNotFound />
    } else if (!skins.length) {
      return <div />
    }

    const skin = skins[0]
    const weapon = t(Weapons[skin.weapon.name])
    const skinName = skin.name
    const hasStatTrak = skins.some(s => s.statTrak)
    const hasSouvenir = skins.some(s => s.souvenir)

    return (
      <Container className='skin-page'>
        <Helmet
          title={`${t('csgo.skin.page_title')} - ${t(Weapons[skin.weapon.name])} - ${skin.name}`}
        />

        <Breadcrumb items={breadcrumb} />
        <Header as='h1'>{weapon} - {skinName}</Header>

        <div className='main-content'>

          <div className='left-panel'>

            <Header as='h3' key='header'>{t('csgo.skin.summary')}</Header>
            <SkinSummary skins={skins} />

            <div className='skin-image'>
              <div className='placeholder'>
                <Img src={defaultWeaponImages[`default_skin_${skin.weapon.name}.png`]} alt='' />
              </div>
              <div className='effective'>
                <Img src={images[quality]} alt={`${weapon} - ${skin.name}`} />
              </div>
            </div>

            <div className='select-quality'>
              {['factory_new', 'minimal_wear', 'field_tested', 'well_worn', 'battle_scarred'].map(key => (
                <div
                  key={key}
                  className={quality === key ? 'active' : ''}
                  onClick={() => this.setState({ quality: key })}>
                  {t(Qualities[key])}
                </div>
              ))}
            </div>
          </div>

          <div className='right-panel'>
            <div className='skin-prices'>
              <Header as='h3'>{t('csgo.skin.vanilla')}</Header>
              <SkinPrices skins={skins} statTrak={false} souvenir={false} />

              {hasStatTrak && [
                <Header as='h3' key='header'>{t('csgo.skin.stat_trak')}</Header>,
                <SkinPrices skins={skins} statTrak souvenir={false} key='prices' />
              ]}
              {hasSouvenir && [
                <Header as='h3' key='header'>{t('csgo.skin.souvenir')}</Header>,
                <SkinPrices skins={skins} statTrak={false} souvenir key='prices' />
              ]}
            </div>
          </div>

        </div>

        <div style={{ clear: 'both' }} />

      </Container>
    )
  }
}

SkinPage.propTypes = {
  t: PropTypes.func.isRequired,
  client: PropTypes.object.isRequired,
  currency: PropTypes.string.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      weapon: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired
    })
  })
}

const mapStateToProps = state => {
  return {
    currency: state.main.currency
  }
}

export default withApollo(
  withTranslation()(
    connect(
      mapStateToProps,
      actions
    )(SkinPage)
  )
)
