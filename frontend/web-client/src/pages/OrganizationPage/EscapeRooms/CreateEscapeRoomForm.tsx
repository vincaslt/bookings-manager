import {
  Form,
  FormItem,
  Input,
  InputNumber,
  ResetButton,
  SubmitButton
} from '@jbuschke/formik-antd'
import { Col, notification, Row } from 'antd'
import { Formik, FormikActions } from 'formik'
import * as React from 'react'
import styled from 'styled-components'
import * as Yup from 'yup'
import EscapeRoomCard from '~/../commons/components/EscapeRoomCard'
import { BusinessHours } from '~/../commons/interfaces/businessHours'
import { CreateEscapeRoom, EscapeRoom } from '~/../commons/interfaces/escapeRoom'
import { Organization } from '~/../commons/interfaces/organization'
import { useI18n } from '~/../commons/utils/i18n'
import * as api from '../../../api/application'

const StyledResetButton = styled(ResetButton)`
  margin-right: 16px;
`

interface Props {
  organization: Organization
  onCreateDone: (escapeRoom: EscapeRoom) => void
  onCancel: () => void
}

// TODO: image upload, validation
// TODO: location same as organization location
// TODO: translated validation messages for forms
function CreateEscapeRoomForm({ organization, onCreateDone, onCancel }: Props) {
  const { t } = useI18n()

  const initialValues: CreateEscapeRoom = {
    name: '',
    description: '',
    location: '',
    price: 0,
    images: [],
    interval: 60, // TODO: add input
    timezone: organization.timezone!,
    businessHours: organization.businessHours!
  }

  const validationSchema = Yup.object().shape<CreateEscapeRoom>({
    name: Yup.string().required(),
    description: Yup.string().required(),
    location: Yup.string().required(),
    price: Yup.number()
      .positive()
      .required(),
    images: Yup.array()
      .of(Yup.string())
      .required(),
    interval: Yup.number()
      .min(10)
      .required(),
    timezone: Yup.string().required(),
    businessHours: Yup.array()
      .of(
        Yup.object<BusinessHours>({
          weekday: Yup.number().required(),
          hours: Yup.array()
            .of(Yup.number())
            .required()
        })
      )
      .required()
  })

  const handleSubmit = (values: CreateEscapeRoom, actions: FormikActions<CreateEscapeRoom>) => {
    api
      .createEscapeRoom(organization.id, values)
      .then(escapeRoom => {
        notification.open({
          message: t`Success`,
          type: 'success',
          description: t`Escape room has been created`
        })
        onCreateDone(escapeRoom)
      })
      .catch(() => {
        actions.setSubmitting(false)
        notification.open({
          message: t`Error`,
          type: 'error',
          description: t`Please try again in a moment`
        })
      })
  }

  return (
    <Formik
      validationSchema={validationSchema}
      initialValues={initialValues}
      onSubmit={handleSubmit}
    >
      {({ values }) => (
        <Row gutter={24}>
          <Col span={10}>
            <Form layout="vertical">
              <FormItem name="name" hasFeedback label={t`Name`}>
                <Input name="name" />
              </FormItem>

              <FormItem name="location" hasFeedback label={t`Location`}>
                <Input name="location" />
              </FormItem>

              <FormItem name="description" hasFeedback label={t`Description`}>
                <Input.TextArea name="description" rows={4} />
              </FormItem>

              <FormItem name="price" hasFeedback label={t`Price`}>
                <InputNumber name="price" min={0} />
              </FormItem>

              <FormItem name="images" hasFeedback label={t`Images`}>
                <Input name="images[0]" />
              </FormItem>

              <FormItem name="action">
                <StyledResetButton onClick={onCancel} disabled={false}>
                  {t`Cancel`}
                </StyledResetButton>
                <SubmitButton>{t`Create`}</SubmitButton>
              </FormItem>
            </Form>
          </Col>
          <Col span={6}>
            <EscapeRoomCard
              escapeRoom={{
                ...values,
                images: values.images.length > 0 ? values.images : ['https://placehold.it/532x320']
              }}
            />
          </Col>
        </Row>
      )}
    </Formik>
  )
}

export default CreateEscapeRoomForm