import { Button, Typography } from 'antd';
import * as React from 'react';
import styled from 'styled-components';
import { useI18n } from '@bookaquest/utilities';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const NewEscapeRoomImage = styled.img`
  max-width: 256px;
  margin: 16px;
`;

const StyledButton = styled(Button)`
  margin-top: 16px;
`;

interface Props {
  onClickCTA: () => void;
}

export function NoEscapeRooms({ onClickCTA }: Props) {
  const { t } = useI18n();

  return (
    <Container>
      <NewEscapeRoomImage
        src="/assets/start-building.svg"
        alt="new escape room image"
      />

      <Typography.Title>{t`Escape Rooms`}</Typography.Title>
      <Typography.Text type="secondary">
        {t`You don't yet have any escape rooms in your organization.
          Add your first escape room to start accepting bookings.`}
      </Typography.Text>

      <StyledButton type="primary" onClick={onClickCTA}>
        {t`Add Escape Room`}
      </StyledButton>
    </Container>
  );
}
