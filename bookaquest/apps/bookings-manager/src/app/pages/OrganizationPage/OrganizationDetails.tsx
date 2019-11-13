import { Typography } from 'antd';
import * as React from 'react';
import * as api from '../../api/application';
import { DetailsItem } from '../../shared/components/DetailsList/DetailsItem';
import { DetailsList } from '../../shared/components/DetailsList/DetailsList';
import { EditableText } from '../../shared/components/EditableText';
import { Organization } from '@bookaquest/interfaces';
import { useI18n } from '@bookaquest/utilities';

const { Text } = Typography;

interface Props {
  loading: boolean;
  organization?: Organization;
  onUpdateOrganization: (organization: Organization) => void;
}

export function OrganizationDetails({
  loading,
  organization,
  onUpdateOrganization
}: Props) {
  const { t } = useI18n();

  const handleChange = (key: 'name' | 'website' | 'location') => (
    value: string
  ) =>
    organization &&
    api
      .updateOrganization(organization.id, { [key]: value })
      .then(onUpdateOrganization);

  // !FIXME: ?
  return (
    <DetailsList title={t`Organization details`} loading={loading}>
      <DetailsItem label={t`ID:`}>
        <Text copyable>{organization && organization.id}</Text>
      </DetailsItem>
      <DetailsItem label={t`Name:`}>
        <EditableText
          className="inline-flex items-center"
          onChange={handleChange('name')}
        >
          {organization && organization.name}
        </EditableText>
      </DetailsItem>
      <DetailsItem label={t`Website:`}>
        <EditableText onChange={handleChange('website')}>
          {organization && organization.website}
        </EditableText>
      </DetailsItem>
      <DetailsItem label={t`Location:`}>
        <EditableText onChange={handleChange('location')}>
          {organization && organization.location}
        </EditableText>
      </DetailsItem>
    </DetailsList>
  );
}
