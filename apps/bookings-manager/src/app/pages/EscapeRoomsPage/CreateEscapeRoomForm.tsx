import {
  Form,
  FormItem,
  Input,
  InputNumber,
  Radio,
  Rate,
  ResetButton,
  SubmitButton,
  Switch,
  Select
} from 'formik-antd';
import { Col, Icon, Row, message } from 'antd';
import { Formik, FormikHelpers } from 'formik';
import * as currencies from 'currency-codes/data';
import { code } from 'currency-codes';
import { listTimeZones } from 'timezone-support';
import * as React from 'react';
import styled from 'styled-components';
import * as Yup from 'yup';
import {
  Organization,
  EscapeRoom,
  CreateEscapeRoom,
  PricingType,
  BusinessHours
} from '@bookaquest/interfaces';
import { useI18n } from '@bookaquest/utilities';
import { EscapeRoomCard } from '@bookaquest/components';
import { RangeNumberInput } from '../../shared/components/RangeNumberInput';
import { BusinessHoursInput } from '../../shared/components/BusinessHoursInput';
import * as api from '../../api/application';
import { environment } from '../../../environments/environment';

const timezoneOptions = listTimeZones();

const StyledResetButton = styled(ResetButton)`
  margin-right: 16px;
`;

interface Props {
  organization: Organization;
  onCreateDone: (escapeRoom: EscapeRoom) => void;
  onCancel: () => void;
}

// TODO: image upload, validation
// TODO: translated validation messages for forms
export function CreateEscapeRoomForm({
  organization,
  onCreateDone,
  onCancel
}: Props) {
  const { t } = useI18n();

  const initialValues: CreateEscapeRoom = {
    name: '',
    description: '',
    location: organization.location ?? '',
    price: 0,
    image: '',
    interval: 60,
    participants: [2, 4],
    currency: 'EUR', // TODO: get from organization or user location
    timezone:
      organization.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
    businessHours: organization.businessHours ?? [],
    difficulty: 1,
    paymentEnabled: false,
    pricingType: PricingType.FLAT
  };

  const validationSchema = Yup.object().shape<CreateEscapeRoom>({
    name: Yup.string().required(),
    description: Yup.string().required(),
    location: Yup.string().required(),
    pricingType: Yup.string()
      .oneOf(Object.values(PricingType))
      .required() as Yup.Schema<PricingType>,
    price: Yup.number()
      .required()
      .positive(),
    image: Yup.string().required(),
    participants: Yup.array()
      .of(Yup.number().min(1))
      .required()
      .test(
        'rangeTest',
        t`Invalid range`,
        ([from, to]: [number, number]) => from <= to
      ),
    interval: Yup.number()
      .required()
      .min(10),
    difficulty: Yup.number()
      .required()
      .min(1)
      .max(5),
    timezone: Yup.string().required(),
    paymentEnabled: Yup.boolean().required(),
    businessHours: Yup.array()
      .of(
        Yup.object<BusinessHours>({
          weekday: Yup.number().required(),
          hours: Yup.array()
            .of(Yup.number())
            .required()
        })
      )
      .required(),
    currency: Yup.string().required()
  });

  const handleSubmit = (
    values: CreateEscapeRoom,
    actions: FormikHelpers<CreateEscapeRoom>
  ) => {
    api
      .createEscapeRoom(organization._id, values)
      .then(escapeRoom => {
        message.success(t`Escape room has been created`);
        onCreateDone(escapeRoom);
      })
      .catch(() => {
        actions.setSubmitting(false);
        message.error(t`Please try again in a moment`);
      });
  };

  // TODO: validate accept payments in backend - to have payment codes first
  return (
    <Formik
      isInitialValid={false}
      validationSchema={validationSchema}
      initialValues={initialValues}
      onSubmit={handleSubmit}
    >
      {({ values, setFieldValue, handleBlur }) => (
        <Row gutter={24}>
          <Col xxl={10} xl={12} md={14}>
            <Form layout="vertical">
              <FormItem name="name" hasFeedback label={t`Name`}>
                <Input name="name" />
              </FormItem>

              <FormItem name="location" hasFeedback label={t`Location`}>
                <Input name="location" />
              </FormItem>

              <FormItem name="description" label={t`Description`}>
                <Input.TextArea name="description" rows={4} />
              </FormItem>

              <FormItem name="difficulty" hasFeedback label={t`Difficulty`}>
                <Rate
                  allowClear={false}
                  name="difficulty"
                  character={<Icon type="lock" theme="filled" />}
                />
              </FormItem>

              <FormItem name="interval" hasFeedback label={t`Interval`}>
                <InputNumber name="interval" min={10} />
              </FormItem>

              <FormItem name="participants" label={t`Participants`}>
                <RangeNumberInput
                  name="participants"
                  value={values.participants as [number?, number?]}
                  onChange={value => setFieldValue('participants', value)}
                  onBlur={e => handleBlur('participants')(e)}
                  placeholder={[t`From`, t`To`]}
                />
              </FormItem>

              <FormItem name="image" hasFeedback label={t`Image`}>
                <Input
                  name="image"
                  placeholder="https://placehold.it/532x320"
                />
              </FormItem>

              <FormItem name="timezone" hasFeedback label={t`Timezone`}>
                <Select name="timezone" showSearch optionFilterProp="children">
                  {timezoneOptions.map(option => (
                    <Select.Option key={option} value={option}>
                      {option}
                    </Select.Option>
                  ))}
                </Select>
              </FormItem>
              <FormItem name="businessHours" label={t`Weekdays`}>
                <BusinessHoursInput
                  value={values.businessHours}
                  onChange={value => {
                    setFieldValue('businessHours', value);
                  }}
                  onBlur={e => handleBlur('businessHours')(e)}
                />
              </FormItem>

              <FormItem name="price" hasFeedback label={t`Price`}>
                <InputNumber
                  name="price"
                  precision={code(values.currency)?.digits ?? 2}
                />
              </FormItem>
              <FormItem
                name="currency"
                hasFeedback
                label={t`Currency`}
                className="flex-grow"
              >
                <Select
                  name="currency"
                  showSearch
                  onChange={val =>
                    setFieldValue(
                      'price',
                      values.price.toFixed(code(val as string)?.digits ?? 2)
                    )
                  }
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option.props.children as string[])
                      .join()
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {currencies
                    .filter(currency => currency.countries.length)
                    .map(currency => (
                      <Select.Option key={currency.code} value={currency.code}>
                        {currency.currency} ({currency.code})
                      </Select.Option>
                    ))}
                </Select>
              </FormItem>

              <FormItem name="pricingType" hasFeedback label={t`Pricing type`}>
                <Radio.Group
                  disabled={values.price === 0}
                  name="pricingType"
                  defaultValue={PricingType.FLAT}
                >
                  <Radio.Button
                    value={PricingType.FLAT}
                  >{t`Flat`}</Radio.Button>
                  <Radio.Button
                    value={PricingType.PER_PERSON}
                  >{t`Per-person`}</Radio.Button>
                </Radio.Group>
              </FormItem>

              {environment.paymentEnabled && (
                <FormItem
                  name="paymentsEnabled"
                  hasFeedback
                  label={t`Accept payments`}
                >
                  <Switch
                    name="paymentEnabled"
                    disabled={!organization.paymentDetails}
                  />
                </FormItem>
              )}

              <FormItem name="action">
                <StyledResetButton onClick={onCancel} disabled={false}>
                  {t`Cancel`}
                </StyledResetButton>
                <SubmitButton>{t`Create`}</SubmitButton>
              </FormItem>
            </Form>
          </Col>
          <Col md={10} xl={6}>
            <EscapeRoomCard
              escapeRoom={{
                ...values,
                images: [values.image]
              }}
            />
          </Col>
        </Row>
      )}
    </Formik>
  );
}
