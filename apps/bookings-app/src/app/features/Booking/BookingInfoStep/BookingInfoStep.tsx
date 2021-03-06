import 'react-phone-number-input/style.css';
import { Form, FormItem, Input, SubmitButton } from 'formik-antd';
import { Col, Row, Icon } from 'antd';
import { Formik } from 'formik';
import * as React from 'react';
import { useI18n } from '@bookaquest/utilities';
import { CreateBooking } from '@bookaquest/interfaces';
import Phone from 'react-phone-number-input';
import * as Yup from 'yup';
import * as LibPhoneNumber from 'google-libphonenumber';

const phoneUtil = LibPhoneNumber.PhoneNumberUtil.getInstance();

export type BookingInfo = Pick<CreateBooking, 'name' | 'phoneNumber' | 'email'>;

interface Props {
  bookingInfo?: BookingInfo;
  onSubmit: (info: BookingInfo) => void;
}

export function BookingInfoStep({ onSubmit, bookingInfo }: Props) {
  const { t } = useI18n();

  const validationSchema = Yup.object().shape<BookingInfo>({
    name: Yup.string()
      .required()
      .matches(/^((\w|\.|,)+(\s(?!$)|$))+$/, t`Invalid full name`),
    email: Yup.string()
      .required()
      .email(),
    phoneNumber: Yup.string()
      .required()
      .test('phoneNumberTest', t`Invalid phone number`, (value: string) => {
        if (!value) {
          return false;
        }
        try {
          const phoneNum = phoneUtil.parseAndKeepRawInput(value, 'ZZ');
          return phoneUtil.isValidNumber(phoneNum);
        } catch (e) {
          return false;
        }
      })
  });

  const initialValues: BookingInfo = bookingInfo || {
    name: '',
    phoneNumber: '',
    email: ''
  };

  // ! TODO: use another phone input library
  return (
    <Row>
      <Col sm={14} md={18} lg={14}>
        <Formik
          initialValues={initialValues}
          onSubmit={onSubmit}
          validationSchema={validationSchema}
        >
          {({ setFieldValue, values, handleBlur }) => (
            <Form>
              <FormItem name="name" label={t`Full name`}>
                <Input prefix={<Icon type="user" />} name="name" />
              </FormItem>
              <FormItem name="email" label={t`Email`}>
                <Input
                  prefix={<Icon type="mail" />}
                  type="email"
                  name="email"
                />
              </FormItem>
              <FormItem name="phoneNumber" label={t`Phone number`}>
                <Phone
                  flagUrl="https://flag.pk/flags/4x3/{xx}.svg"
                  name="phoneNumber"
                  onBlur={e => handleBlur('phoneNumber')(e)}
                  numberInputProps={{ className: 'ant-input' }}
                  onChange={value => setFieldValue('phoneNumber', value)}
                  value={values.phoneNumber}
                />
              </FormItem>
              <div className="mt-8">
                <SubmitButton>{t`Continue`}</SubmitButton>
              </div>
            </Form>
          )}
        </Formik>
      </Col>
    </Row>
  );
}
