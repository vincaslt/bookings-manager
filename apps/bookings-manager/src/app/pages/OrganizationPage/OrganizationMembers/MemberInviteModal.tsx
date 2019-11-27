import { Modal, Button, notification } from 'antd';
import { Formik, FormikHelpers } from 'formik';
import { Form, Input, FormItem } from 'formik-antd';
import * as React from 'react';
import * as Yup from 'yup';
import { useI18n } from '@bookaquest/utilities';
import { InviteOrganizationMember } from '../../../interfaces/organizationMember';
import { createOrganizationInvitation } from '../../../api/application';

interface FormModalProps {
  loading: boolean;
  visible: boolean;
  close: () => void;
  resetForm: () => void;
  submitForm: () => void;
}

function FormModal({
  visible,
  close,
  loading,
  resetForm,
  submitForm
}: FormModalProps) {
  const { t } = useI18n();

  React.useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [resetForm, visible]);

  return (
    <Modal
      title={t`Invite member`}
      visible={visible}
      footer={[
        <Button key="back" onClick={close}>
          {t`Cancel`}
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={submitForm}
        >
          {t`Invite`}
        </Button>
      ]}
      onOk={submitForm}
      onCancel={close}
    >
      <Form>
        <FormItem name="email" hasFeedback label={t`Email`}>
          <Input name="email" />
        </FormItem>
      </Form>
    </Modal>
  );
}

interface MemberInviteModalProps {
  organizationId: string;
  visible: boolean;
  close: () => void;
}

export function MemberInviteModal({
  close,
  organizationId,
  ...rest
}: MemberInviteModalProps) {
  const { t } = useI18n();

  const validationSchema = Yup.object().shape<InviteOrganizationMember>({
    email: Yup.string()
      .email()
      .required()
  });

  const initialValues: InviteOrganizationMember = {
    email: ''
  };

  const handleSubmit = async (
    values: InviteOrganizationMember,
    helpers: FormikHelpers<InviteOrganizationMember>
  ) => {
    try {
      await createOrganizationInvitation(organizationId, values);
      close();
    } catch (e) {
      console.log(e.response);
      notification.error({
        message:
          e.response.data?.message || t`Invitation failed, try again later`
      });
      // notification
      helpers.setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ submitForm, resetForm, isSubmitting }) => (
        <FormModal
          close={close}
          submitForm={submitForm}
          resetForm={resetForm}
          loading={isSubmitting}
          {...rest}
        />
      )}
    </Formik>
  );
}