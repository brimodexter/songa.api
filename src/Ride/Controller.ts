import { Request, Response } from 'express';
import s2 from '@radarlabs/s2';

export const GeoHarsh = (req: Request, res: Response) => {
  const user1LongLat = [-73.95772933959961, 40.71623280185081];
  const user2LongLat = [-73.95927429199219, 40.71629785715124];
  const user3LongLat = [-73.99206161499023, 40.688708709249646];

  interface Group {
    userId: string;
    cellId: any;
  }

  const user1S2: [string, any] = [
    'user1',
    new s2.CellId(new s2.LatLng(user1LongLat[1], user1LongLat[0])).parent(13),
  ];
  const user2S2: [string, any] = [
    'user2',
    new s2.CellId(new s2.LatLng(user2LongLat[1], user2LongLat[0])).parent(13),
  ];
  const user3S2: [string, any] = [
    'user3',
    new s2.CellId(new s2.LatLng(user3LongLat[1], user3LongLat[0])).parent(13),
  ];

  let groups: any; // Initialize groups as an empty object

  [user1S2, user2S2, user3S2].forEach(([userId, cellId]) => {
    const group = groups[cellId.token()] || [];
    group.push(userId);
    groups[cellId.token()] = group;
  });

  const searchPointLongLat = [-73.98991584777832, 40.69528168934989];
  const searchPointS2 = new s2.CellId(
    new s2.LatLng(searchPointLongLat[1], searchPointLongLat[0])
  ).parent(13);

  console.log(searchPointS2.token()); // '89c25a4c'
  console.log(groups); // { '89c2595c': [ 'user1', 'user2' ], '89c25a4c': [ 'user3' ] }

  const closePoints = groups[searchPointS2.token()];
  console.log(closePoints); // [ 'user3' ]
  return res.status(200).json(closePoints);
};
