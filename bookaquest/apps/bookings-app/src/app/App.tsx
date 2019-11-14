import { Layout, Spin } from 'antd';
import * as React from 'react';
import styled from 'styled-components';
import { createGlobalStyle } from 'styled-components';
import { Route, Switch } from 'wouter';
import { useI18n } from '@bookaquest/utilities';
import { BookingItinerary } from './features/BookingItinerary/BookingItinerary';
import { Booking } from './features/Booking/Booking';
import { EscapeRoomSelect } from './features/EscapeRoomSelect/EscapeRoomSelect';

const AppSpinnerContainer = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80vh;
`;

const GlobalStyle = createGlobalStyle`
  .ant-steps-item-custom .ant-steps-item-icon > .ant-steps-icon {
    width: auto;
    display: flex;
    align-items: center;
  }
`;

const ContentContainer = styled(Layout)`
  min-height: 100vh;
  padding: 24px;
`;

const Footer = styled(Layout.Footer)`
  text-align: center;
  color: rgba(0, 0, 0, 0.45);

  & > a {
    color: rgba(0, 0, 0, 0.65);

    &:hover,
    &:focus {
      text-decoration: underline;
    }
  }
`;

// TODO: footer link
// TODO: load stripe keys from api (DB)
export function App() {
  const { ready } = useI18n(undefined, { useSuspense: false });

  if (!ready) {
    return (
      <AppSpinnerContainer>
        <Spin size="large" />
      </AppSpinnerContainer>
    );
  }
  return (
    <ContentContainer>
      <GlobalStyle />
      <Switch>
        <Route path="/booking/:organizationId" component={BookingItinerary} />
        <Route
          path="/:organizationId/:escapeRoomId/:step?"
          component={Booking}
        />
        <Route path="/:organizationId" component={EscapeRoomSelect} />
      </Switch>
      <Footer>
        Powered by <a href="https://bookaquest.com">BookaQuest</a>
      </Footer>
    </ContentContainer>
  );
}