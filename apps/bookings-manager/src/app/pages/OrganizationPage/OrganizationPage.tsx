import { RouteComponentProps } from '@reach/router';
import { Col, Row, message, PageHeader } from 'antd';
import * as React from 'react';
import { Organization } from '@bookaquest/interfaces';
import { useLoading, useI18n } from '@bookaquest/utilities';
import * as api from '../../api/application';
import { useUser } from '../../shared/hooks/useUser';
import { PageContent } from '../../shared/layout/PageContent';
import { environment } from '../../../environments/environment';
import { OrganizationDetails } from './OrganizationDetails';
import { OrganizationMembers } from './OrganizationMembers/OrganizationMembers';
import { OrganizationSchedule } from './OrganizationSchedule';
import { Payments } from './Payments/Payments';
import OrganizationContacts from './OrganizationContacts';

// TODO: let user pick organizations / multiple organizations support
export function OrganizationPage(props: RouteComponentProps) {
  const { t } = useI18n();
  const { memberships } = useUser();

  const membership = memberships?.[0];
  const organizationId = membership?.organization;

  const [organization, setOrganization] = React.useState<Organization>();
  const [loading, withLoading] = useLoading(true);

  React.useEffect(() => {
    if (organizationId) {
      withLoading(api.getOrganization(organizationId).then(setOrganization));
    }
  }, [organizationId, withLoading]);

  const handleOrganizationUpdate = (org: Organization) => {
    message.success(t`Organization details updated`);
    setOrganization(org);
  };

  if (!membership) {
    return null;
  }

  return (
    <PageContent
      header={
        <PageHeader
          title={
            organization
              ? t`Organization "${organization.name}"`
              : t`Organization`
          }
        />
      }
      noBackground
    >
      <Row gutter={24}>
        <Col xxl={8} xl={12}>
          <OrganizationDetails
            loading={loading}
            organization={organization}
            onUpdateOrganization={handleOrganizationUpdate}
          />

          <OrganizationContacts
            organization={organization}
            loading={loading}
            setOrganization={setOrganization}
          />
          {environment.paymentEnabled && (
            <Payments
              organization={organization}
              setOrganization={setOrganization}
            />
          )}
        </Col>
        <Col xxl={8} xl={12}>
          <OrganizationMembers organizationId={membership.organization} />
        </Col>
        <Col xxl={8} xl={12}>
          <OrganizationSchedule
            organization={organization}
            loading={loading}
            setOrganization={setOrganization}
          />
        </Col>
      </Row>
    </PageContent>
  );
}
