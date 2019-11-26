import { format } from 'date-fns';
import { green, blue, orange } from '@ant-design/colors';
import AspectRatio from 'react-aspect-ratio';
import * as React from 'react';
import { Booking } from '@bookaquest/interfaces';
import { listWeekdays, useI18n } from '@bookaquest/utilities';
import { AreaChart, XAxis, Tooltip, Area, ResponsiveContainer } from 'recharts';
import { completedEarnings, projectedEarnings, pendingEarnings } from './utils';

interface Props {
  weeklyBookings: Booking[];
  week: Date;
}

export function EarningsChart({ weeklyBookings, week }: Props) {
  const { t, dateFnsLocale } = useI18n();

  const weekdays = listWeekdays(dateFnsLocale, week);

  const chartData = weekdays.map(weekdayDate => {
    return {
      day: format(weekdayDate, 'MM-dd', { locale: dateFnsLocale }),
      completed: completedEarnings(weekdayDate)(weeklyBookings),
      projected: projectedEarnings(weekdayDate)(weeklyBookings),
      pending: pendingEarnings(weekdayDate)(weeklyBookings)
    };
  });

  const axisNames: { [key: string]: string } = {
    completed: t`Completed`,
    projected: t`Projected`,
    pending: t`Pending`
  };

  return (
    <AspectRatio ratio="5/3" style={{ width: '100%' }}>
      <ResponsiveContainer>
        <AreaChart margin={{ left: 20, right: 20 }} data={chartData}>
          <Tooltip
            formatter={(value, key, { payload }) =>
              key === 'pending'
                ? [payload.pending - payload.projected, axisNames[key]]
                : [value, axisNames[key]]
            }
          />
          <XAxis interval={0} dataKey="day" />

          <Area
            animationDuration={300}
            type="monotone"
            dataKey="projected"
            stackId="2"
            fill={blue[3]}
            stroke="none"
          />
          <Area
            animationDuration={300}
            type="monotone"
            dataKey="completed"
            stackId="1"
            fill={green[5]}
            stroke="none"
          />
          <Area
            animationDuration={300}
            type="monotone"
            dataKey="pending"
            stackId="3"
            stroke={orange[6]}
            strokeDasharray="5,5"
            fill="none"
          />
        </AreaChart>
      </ResponsiveContainer>
    </AspectRatio>
  );
}