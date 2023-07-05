import express from 'express';
import {
  RiderCancelRide,
  RiderPostLocation,
  UserCancelRide,
  UserGetNearbyRides,
  UserRequestRide,
} from './Controller';
import { auth } from '../helpers/CreateToken';
import { validateLatLong } from './Validator';
const riderEdit = [auth, validateLatLong];

const router = express.Router();

router.post('/rider-post-locations/', riderEdit, RiderPostLocation);
router.post('/user-get-nearby-riders/', riderEdit, UserGetNearbyRides);
router.post('/user-request-ride/', UserRequestRide);
router.post('/user-cancel-ride/', UserCancelRide);
router.post('/rider-cancel-ride/', RiderCancelRide);

export default router;
