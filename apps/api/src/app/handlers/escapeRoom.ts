import { createError } from 'micro';
import { get, post, put, del, AugmentedRequestHandler } from 'microrouter';
import { prop, uniqBy } from 'ramda';
import { CreateEscapeRoomDTO } from '../dto/CreateEscapeRoomDTO';
import { STATUS_ERROR } from '../lib/constants';
import { isBetween } from '../helpers/number';
import { UpdateEscapeRoomDTO } from '../dto/UpdateEscapeRoomDTO';
import { EscapeRoomModel, EscapeRoomInitFields } from '../models/EscapeRoom';
import {
  requireBelongsToOrganization,
  requireOwnerOfOrganization,
  requireOrganization
} from '../helpers/organization';
import { getParams } from '../lib/utils/getParams';
import { getBody } from '../lib/utils/getBody';
import { getAuth } from '../lib/utils/getAuth';
import { requireEscapeRoom } from '../helpers/escapeRoom';

const createEscapeRoom: AugmentedRequestHandler = async (req, res) => {
  const { userId } = getAuth(req);
  const { organizationId } = getParams(req, ['organizationId']);
  const dto = await getBody(req, CreateEscapeRoomDTO);

  await requireBelongsToOrganization(organizationId, userId);

  const hasDuplicateWeekday =
    uniqBy(prop('weekday'), dto.businessHours).length !==
    dto.businessHours.length;
  const badHoursFormat = dto.businessHours.some(
    ({ hours, weekday }) =>
      hours.some(hour => !isBetween(hour, [0, 24])) ||
      !isBetween(weekday, [1, 7])
  );

  if (hasDuplicateWeekday || badHoursFormat) {
    throw createError(STATUS_ERROR.BAD_REQUEST, 'Invalid business hours');
  }

  const escapeRoomFields: EscapeRoomInitFields = {
    ...dto,
    organization: organizationId
  };
  const escapeRoom = await EscapeRoomModel.create(escapeRoomFields);

  return escapeRoom;
};

const updateEscapeRoom: AugmentedRequestHandler = async (req, res) => {
  const { userId } = getAuth(req);
  const { escapeRoomId } = getParams(req, ['escapeRoomId']);
  const dto = await getBody(req, UpdateEscapeRoomDTO);

  const escapeRoom = await requireEscapeRoom(escapeRoomId);
  await requireBelongsToOrganization(escapeRoom.organization, userId);

  const updatedEscapeRoom = await EscapeRoomModel.findOneAndUpdate(
    { _id: escapeRoomId, deleted: false },
    dto,
    {
      runValidators: true,
      new: true
    }
  );

  if (!updatedEscapeRoom) {
    throw createError(STATUS_ERROR.NOT_FOUND, 'Escape room not found');
  }

  return updatedEscapeRoom;
};

const getEscapeRoom: AugmentedRequestHandler = async (req, res) => {
  const { escapeRoomId } = getParams(req, ['escapeRoomId']);
  const escapeRoom = await requireEscapeRoom(escapeRoomId);
  return escapeRoom;
};

const listEscapeRooms: AugmentedRequestHandler = async (req, res) => {
  const { organizationId } = getParams(req, ['organizationId']);

  const organization = await requireOrganization(organizationId);

  const escapeRooms = await EscapeRoomModel.find({
    organization: organization.id,
    deleted: false
  });

  return escapeRooms;
};

const deleteEscapeRoom: AugmentedRequestHandler = async (req, res) => {
  const { userId } = getAuth(req);
  const { escapeRoomId } = getParams(req, ['escapeRoomId']);

  const escapeRoom = await requireEscapeRoom(escapeRoomId);
  await requireOwnerOfOrganization(escapeRoom.organization, userId);

  escapeRoom.deleted = true;
  await escapeRoom.save();
};

export const escapeRoomHandlers = [
  get('/organization/:organizationId/escape-room', listEscapeRooms), // TODO mark as public? No auth required
  post('/organization/:organizationId/escape-room', createEscapeRoom),
  get('/escape-room/:escapeRoomId', getEscapeRoom), // TODO mark as public?
  put('/escape-room/:escapeRoomId', updateEscapeRoom),
  del('/escape-room/:escapeRoomId', deleteEscapeRoom)
];
