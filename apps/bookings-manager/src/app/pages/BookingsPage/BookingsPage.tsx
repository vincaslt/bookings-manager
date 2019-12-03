import { RouteComponentProps } from '@reach/router';
import { Spin, Button } from 'antd';
import { endOfDay, startOfDay, addWeeks, subDays } from 'date-fns';
import * as React from 'react';
import { useLoading, useI18n } from '@bookaquest/utilities';
import {
  Booking,
  Organization,
  EscapeRoom,
  BookingStatus
} from '@bookaquest/interfaces';
import inc from 'ramda/es/inc';
import dec from 'ramda/es/dec';
import { Time } from '@bookaquest/components';
import * as api from '../../api/application';
import { useUser } from '../../shared/hooks/useUser';
import { PageContent } from '../../shared/layout/PageContent';
import { ResourceScheduler } from '../../shared/components/ResourceScheduler/ResourceScheduler';
import { PendingBookingModal } from './PendingBookingModal';

export function BookingsPage(props: RouteComponentProps) {
  const { t } = useI18n();
  const { memberships } = useUser();
  const [loading, withLoading] = useLoading(true);
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [organization, setOrganization] = React.useState<Organization>();
  const [escapeRooms, setEscapeRooms] = React.useState<EscapeRoom[]>([]);
  const [selectedBooking, selectBooking] = React.useState<Booking>();
  const [weekOffset, setWeekOffset] = React.useState(0);

  const today = new Date();
  const membership = memberships?.[0]; // TODO: use selected, instead of first one

  React.useEffect(() => {
    if (membership) {
      withLoading(
        Promise.all([
          api.getOrganizationBookings(membership.organization),
          api.getOrganization(membership.organization),
          api.getEscapeRooms(membership.organization)
        ]).then(([bkgs, org, esc]) => {
          setBookings(bkgs);
          setOrganization(org);
          setEscapeRooms(esc);
        })
      );
    }
  }, [membership, withLoading]);

  const handleCloseModal = () => selectBooking(undefined);
  const handleSelectBooking = (booking: Booking) => {
    if (booking.status === BookingStatus.Pending) {
      selectBooking(booking);
    }
  };

  const range = {
    start: startOfDay(addWeeks(today, weekOffset)),
    end: endOfDay(subDays(addWeeks(today, weekOffset + 1), 1))
  };

  const timezone =
    organization?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <PageContent>
      <PendingBookingModal
        visible={!!selectedBooking}
        setBookings={setBookings}
        onClose={handleCloseModal}
        selectedBooking={selectedBooking}
      />
      {loading ? (
        <Spin />
      ) : (
        <>
          <div className="flex justify-between items-center mb-2">
            <span>{t`Timezone: ${timezone}`}</span>
            <div className="flex items-center">
              <Button
                className="flex justify-center mr-4"
                shape="circle"
                icon="left"
                disabled={weekOffset === 0}
                onClick={() => setWeekOffset(dec)}
              />
              <div>
                <Time type="date" date={[range.start, range.end]} />
              </div>

              <Button
                className="flex justify-center ml-4"
                shape="circle"
                icon="right"
                onClick={() => setWeekOffset(inc)}
              />
            </div>
          </div>
          <ResourceScheduler
            range={range}
            onClickEvent={handleSelectBooking}
            baseAvailability={organization?.businessHours}
            resources={escapeRooms.map(escapeRoom => ({
              name: escapeRoom.name,
              availability: escapeRoom.businessHours,
              bookings: bookings.filter(
                booking => booking.escapeRoom === escapeRoom._id
              )
            }))}
          />
        </>
      )}
    </PageContent>
  );
}
