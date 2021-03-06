import { Checkbox, Col, Row, TimePicker } from 'antd';
import moment, { Moment } from 'moment';
import { format, getISODay } from 'date-fns';
import update from 'ramda/es/update';
import * as React from 'react';
import { BusinessHours } from '@bookaquest/interfaces';
import { useI18n, listWeekdays, classNames } from '@bookaquest/utilities';

interface Props {
  value: BusinessHours[];
  onChange: (value: BusinessHours[]) => void;
  onBlur?: (e: React.FocusEvent<HTMLDivElement>) => void;
}

// TODO: use moment/date-fns weekdays to get weekdays and first day of week for locale
export function BusinessHoursInput({ value, onChange, onBlur }: Props) {
  const { dateFnsLocale } = useI18n();
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleCheckWeekday = (day: number) => () => {
    const existingHours = value.find(({ weekday }) => weekday === day);
    if (existingHours) {
      onChange(value.filter(({ weekday }) => weekday !== day));
    } else {
      onChange([...value, { weekday: day, hours: [0, 0] }]);
    }
  };

  const handleChangeHours = (day: number, key: 0 | 1) => (time: Moment) => {
    const existingHours = value.find(({ weekday }) => weekday === day);
    if (existingHours) {
      const adjustedHours = update(
        key,
        time.hours() + time.minutes() / 60,
        existingHours.hours
      ) as [number, number];
      onChange(
        value.map(businessHours =>
          businessHours.weekday === day
            ? { weekday: day, hours: adjustedHours }
            : businessHours
        )
      );
    }
  };

  const weekdaysList = listWeekdays(dateFnsLocale);

  return (
    <div
      ref={containerRef}
      onBlur={e => {
        const isChild = containerRef.current?.contains(
          e.relatedTarget as Node | null
        );
        const isTimepickerPanel = (e.relatedTarget as HTMLDListElement | null)?.classList?.contains(
          'ant-time-picker-panel-input'
        );
        if (!isChild && !isTimepickerPanel) {
          onBlur?.(e);
        }
      }}
    >
      {weekdaysList.map((weekdayDate, i) => {
        const weekday = getISODay(weekdayDate);
        const day = value.find(businessDay => businessDay.weekday === weekday);
        const [open, close] = day ? day.hours : [];
        return (
          <Row
            key={weekday}
            className={classNames(
              'w-full',
              i !== weekdaysList.length - 1 && 'mb-2'
            )}
          >
            <Col span={8}>
              <Checkbox checked={!!day} onChange={handleCheckWeekday(weekday)}>
                {format(weekdayDate, 'cccc')}
              </Checkbox>
            </Col>
            {day && (
              <>
                <Col span={8}>
                  <TimePicker
                    minuteStep={30}
                    format="HH:mm"
                    onChange={handleChangeHours(weekday, 0)}
                    value={moment()
                      .hours(Math.floor(open))
                      .minutes((open % 1) * 60)}
                  />
                </Col>
                <Col span={8}>
                  <TimePicker
                    minuteStep={30}
                    format="HH:mm"
                    onChange={handleChangeHours(weekday, 1)}
                    value={moment()
                      .hours(Math.floor(close))
                      .minutes((close % 1) * 60)}
                  />
                </Col>
              </>
            )}
          </Row>
        );
      })}
    </div>
  );
}
