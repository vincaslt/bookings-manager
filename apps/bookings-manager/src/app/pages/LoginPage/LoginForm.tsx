import { Form, FormItem, Input, SubmitButton } from 'formik-antd';
import { Formik, FormikHelpers } from 'formik';
import { message } from 'antd';
import * as React from 'react';
import * as Yup from 'yup';
import { useI18n } from '@bookaquest/utilities';
import { SignIn } from '../../interfaces/auth';
import { useUser } from '../../shared/hooks/useUser';

const initialValues: SignIn = {
  email: '',
  password: ''
};

const validationSchema = Yup.object().shape<SignIn>({
  email: Yup.string()
    .email()
    .required(),
  password: Yup.string().required()
});

export function LoginForm() {
  const { t } = useI18n();
  const { login } = useUser();

  const handleSubmit = async (
    values: SignIn,
    actions: FormikHelpers<SignIn>
  ) => {
    await login(values)
      .catch(e => {
        console.log(e);
        message.error(t`Invalid credentials`);
      })
      .finally(() => {
        actions.setSubmitting(false);
      });
  };

  return (
    <Formik
      validationSchema={validationSchema}
      initialValues={initialValues}
      onSubmit={handleSubmit}
    >
      <Form>
        <FormItem name="email" hasFeedback label={t`Email`}>
          <Input name="email" type="email" />
        </FormItem>

        <FormItem name="password" hasFeedback label={t`Password`}>
          <Input type="password" name="password" />
        </FormItem>
        <SubmitButton>{t`Sign in`}</SubmitButton>
      </Form>
    </Formik>
  );
}
