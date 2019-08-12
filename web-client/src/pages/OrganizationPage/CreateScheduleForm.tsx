import { Form, FormItem, Slider, SubmitButton, TreeSelect } from '@jbuschke/formik-antd'
import { Col, InputNumber, Row, TreeSelect as antdTreeSelect } from 'antd'
import { Formik, FormikActions } from 'formik'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import * as api from '../../api/application'
import { CreateSchedule } from '../../interfaces/schedule'

const { TreeNode } = antdTreeSelect

const initialValues: CreateSchedule = {
  weekDays: [],
  workHours: [9, 17]
}

// TODO: use moment weekdays
// TODO: divide work hours by interval */
function CreateScheduleForm() {
  const { t } = useTranslation()

  const handleSubmit = (schedule: CreateSchedule, actions: FormikActions<CreateSchedule>) =>
    api.createSchedule(schedule).then(() => actions.setSubmitting(false))

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      <Form layout="vertical">
        <Row gutter={16}>
          <Col span={8}>
            <FormItem name="weekDays" hasFeedback label={t('Weekdays')}>
              <TreeSelect name="weekDays" treeCheckable placeholder={t('Weekdays')}>
                <TreeNode value={1} title="Monday" />
                <TreeNode value={2} title="Tuesday" />
                <TreeNode value={3} title="Wednesday" />
                <TreeNode value={4} title="Thursday" />
                <TreeNode value={5} title="Friday" />
                <TreeNode value={6} title="Saturday" />
                <TreeNode value={7} title="Sunday" />
              </TreeSelect>
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem name="interval" hasFeedback label={t('Interval')}>
              <InputNumber name="interval" placeholder={t('Interval')} />
            </FormItem>
          </Col>
        </Row>
        <FormItem name="fullName" hasFeedback label={t('Work hours')}>
          <Slider
            name="workHours"
            marks={{
              0: '0',
              1: '1',
              2: '2',
              3: '3',
              4: '4',
              5: '5',
              6: '6',
              7: '7',
              8: '8',
              9: '9',
              10: '10',
              11: '11',
              12: '12',
              13: '13',
              14: '14',
              15: '15',
              16: '16',
              17: '17',
              18: '18',
              19: '19',
              20: '20',
              21: '21',
              22: '22',
              23: '23',
              24: '24'
            }}
            range
            max={24}
            step={0.5}
            defaultValue={[9, 17]}
          />
        </FormItem>
        <FormItem name="action">
          <SubmitButton>{t('Submit')}</SubmitButton>
        </FormItem>
      </Form>
    </Formik>
  )
}

export default CreateScheduleForm