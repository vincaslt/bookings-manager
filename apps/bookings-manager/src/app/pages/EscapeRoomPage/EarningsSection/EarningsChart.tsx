import { isToday } from 'date-fns';
import { green, blue, orange } from '@ant-design/colors';
import AspectRatio from 'react-aspect-ratio';
import { zonedTimeToUtc } from 'date-fns-tz';
import * as React from 'react';
import { Booking } from '@bookaquest/interfaces';
import { listWeekdays, useI18n } from '@bookaquest/utilities';
import {
  AreaChart,
  XAxis,
  Tooltip,
  Area,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { Time } from '@bookaquest/components';
import { completedEarnings, projectedEarnings, pendingEarnings } from './utils';

interface Props {
  weeklyBookings: Booking[];
  week: Date;
  timeZone: string;
}

export function EarningsChart({ weeklyBookings, week, timeZone }: Props) {
  const { t, dateFnsLocale } = useI18n();

  // No need to convert weekdays to timezone, because it's only for labels and they represent timezone already
  const weekdays = listWeekdays(dateFnsLocale, week);

  const chartData = weekdays.map(weekdayDate => {
    return {
      day: weekdayDate.getTime(),
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
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip
            labelFormatter={day => (
              <Time
                type={{ format: 'cccc' }}
                date={zonedTimeToUtc(new Date(day), timeZone)}
                timeZone={timeZone}
              />
            )}
            formatter={(value, key, { payload }) =>
              key === 'pending'
                ? [payload.pending - payload.projected, axisNames[key]]
                : [value, axisNames[key]]
            }
          />
          <XAxis
            interval={0}
            dataKey="day"
            tick={({ payload, x, y }) => {
              const date = zonedTimeToUtc(new Date(payload.value), timeZone);
              return (
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dy="0.7em"
                  className={isToday(date) ? 'font-bold' : undefined}
                >
                  <Time type={{ format: 'MM-dd' }} date={date} />
                </text>
              );
            }}
          />

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
