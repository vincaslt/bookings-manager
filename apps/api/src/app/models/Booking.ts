import { prop, Ref, getModelForClass } from '@typegoose/typegoose';
import { EscapeRoom } from './EscapeRoom';

export enum BookingStatus {
  Accepted = 'ACCEPTED',
  Pending = 'PENDING',
  Rejected = 'REJECTED',
  Canceled = 'CANCELED'
}

export interface BookingInitFields {
  startDate: Date;
  endDate: Date;
  name: string;
  email: string;
  participants: number;
  phoneNumber: string;
  escapeRoom: string;
  status: BookingStatus;
  price: number;
  currency: string;
  comment?: string;
}

export class Booking {
  @prop({ required: true })
  startDate: Date;

  @prop({ required: true })
  endDate: Date;

  @prop({ required: true })
  name: string;

  @prop({ required: true })
  email: string;

  @prop({ required: true })
  participants: number;

  @prop({ required: true })
  phoneNumber: string;

  @prop()
  comment?: string;

  @prop({ required: true, ref: 'EscapeRoom', index: true })
  escapeRoom: Ref<EscapeRoom>;

  @prop({ required: true })
  status: BookingStatus;

  @prop({ required: true })
  price: number;

  @prop({ required: true })
  currency: string;
}

export const BookingModel = getModelForClass(Booking, {
  schemaOptions: { timestamps: true }
});
