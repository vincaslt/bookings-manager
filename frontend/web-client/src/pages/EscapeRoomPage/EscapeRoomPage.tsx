import { RouteComponentProps } from '@reach/router'
import { Button, Col, Icon, List, PageHeader, Radio, Rate, Row, Switch } from 'antd'
import * as React from 'react'
import AspectRatio from 'react-aspect-ratio'
import WorkHours from '~/../commons/components/WorkHours'
import { Booking } from '~/../commons/interfaces/booking'
import { EscapeRoom, PricingType } from '~/../commons/interfaces/escapeRoom'
import { useI18n } from '~/../commons/utils/i18n'
import * as api from '../../api/application'
import DetailsItem from '../../shared/components/DetailsList/DetailsItem'
import DetailsList from '../../shared/components/DetailsList/DetailsList'
import EditableText from '../../shared/components/EditableText'
import Link from '../../shared/components/Link'
import SectionTitle from '../../shared/components/SectionTitle'
import PageContent from '../../shared/layout/PageContent'
import Section from '../../shared/layout/Section'
import ParticipantsEditableText from './ParticipantsEditableText'

interface UrlParams {
  escapeRoomId: string
}

function EscapeRoomPage(props: RouteComponentProps<UrlParams>) {
  const { t } = useI18n()
  const { escapeRoomId } = props
  const [escapeRoom, setEscapeRoom] = React.useState<EscapeRoom>()
  const [bookings, setBookings] = React.useState<Booking[]>()

  React.useEffect(() => {
    if (escapeRoomId) {
      Promise.all([api.getEscapeRoom(escapeRoomId), api.getEscapeRoomBookings(escapeRoomId)]).then(
        ([room, roomBookings]) => {
          setEscapeRoom(room)
          setBookings(roomBookings)
        }
      )
    }
  }, [escapeRoomId])

  const updateParticipants = ([min, max]: [number?, number?]) =>
    escapeRoomId &&
    typeof min !== 'undefined' &&
    typeof max !== 'undefined' &&
    api.updateEscapeRoom(escapeRoomId, { participants: [min, max] })

  // TODO: proper URL for booking page
  // TODO: correct inputs for difficulty and interval
  // TODO: not show payment details (only info message) if no paymentDetails from org
  return (
    <PageContent
      header={
        escapeRoom && (
          <PageHeader
            title={escapeRoom.name}
            extra={
              <Link
                href={`http://localhost:3000/${escapeRoom.organizationId}/${escapeRoomId}`}
                newTab
              >
                <Button type="link">{t`Go to booking page`}</Button>
              </Link>
            }
          />
        )
      }
      noBackground
      loading={!escapeRoom}
    >
      {escapeRoom && (
        <Row gutter={16}>
          <Col span={16}>
            <Section>
              <Row gutter={16}>
                <Col span={12}>
                  <DetailsList title={t`Details`}>
                    <DetailsItem label={t`Name:`}>
                      <EditableText>{escapeRoom.name}</EditableText>
                    </DetailsItem>
                    <DetailsItem label={t`Difficulty:`}>
                      <Rate value={escapeRoom.difficulty} character={<Icon type="lock" />} />
                    </DetailsItem>
                    <DetailsItem label={t`Interval:`}>
                      <EditableText inputProps={{ type: 'number' }}>
                        {escapeRoom.interval}
                      </EditableText>
                    </DetailsItem>
                    <DetailsItem label={t`Participants:`}>
                      <ParticipantsEditableText
                        participants={escapeRoom.participants}
                        onChange={updateParticipants}
                      />
                    </DetailsItem>
                    <DetailsItem label={t`Location:`}>
                      <EditableText>{escapeRoom.location}</EditableText>
                    </DetailsItem>
                    <DetailsItem label={t`Description:`}>
                      <EditableText multiline>{escapeRoom.description}</EditableText>
                    </DetailsItem>
                  </DetailsList>
                  <DetailsList className="mt-8" title={t`Pricing`}>
                    <DetailsItem label={t`Price:`}>
                      <EditableText inputProps={{ type: 'number' }}>
                        {escapeRoom.price}
                      </EditableText>
                    </DetailsItem>
                    <DetailsItem label={t`Pricing type:`}>
                      <Radio.Group
                        disabled={!escapeRoom.price}
                        name="pricingType"
                        defaultValue={PricingType.FLAT}
                      >
                        <Radio.Button value={PricingType.FLAT}>{t`Flat`}</Radio.Button>
                        <Radio.Button value={PricingType.PER_PERSON}>{t`Per-person`}</Radio.Button>
                      </Radio.Group>
                    </DetailsItem>
                    <DetailsItem label={t`Payment enabled:`}>
                      <Switch checked={escapeRoom.paymentEnabled} />
                    </DetailsItem>
                  </DetailsList>
                </Col>
                <Col span={12}>
                  <div className="mb-8">
                    <SectionTitle>{t`Images`}</SectionTitle>
                    <AspectRatio ratio="532/320">
                      <img
                        className="object-cover"
                        src={escapeRoom.images[0]}
                        alt={`${escapeRoom.name} cover image`}
                      />
                    </AspectRatio>
                  </div>
                  <SectionTitle>{t`Business hours`}</SectionTitle>
                  <WorkHours businessHours={escapeRoom.businessHours} />
                </Col>
              </Row>
            </Section>
          </Col>
          <Col span={8}>
            <Section title={t`Bookings`}>
              <List
                loading={!bookings}
                itemLayout="horizontal"
                dataSource={bookings}
                renderItem={booking => (
                  <List.Item>
                    <List.Item.Meta
                      title={booking.name}
                      description={booking.startDate.toLocaleString()}
                    />
                  </List.Item>
                )}
              />
            </Section>
          </Col>
        </Row>
      )}
    </PageContent>
  )
}

export default EscapeRoomPage