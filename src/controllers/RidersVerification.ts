import { PrismaClient, RiderStatus, RiderStatusEnum } from '@prisma/client';
import { Response } from 'express';
import { checkRider } from '../helpers/user';

const prisma = new PrismaClient({
  // log: [
  //     {
  //         emit: "event",
  //         level: "query",
  //     },
  // ],
});

// prisma.$on("query", async (e) => {
//     console.log(`${e.query} ${e.params}`)
// });
/**
 *
 * @param req
 * @param res
 * @return res 200 on success and 500 in failure, 404 when rider is not found
 */
export const AssignCCAOnRiderCreation = async (req: any, res: Response) => {
  // select all customer agents who are active and verified and have pending approvals
  const id = req.params['id'];
  const { data } = req;
  const checkRiderResult = await checkRider({ id });
  if (!(checkRiderResult && checkRiderResult.riderPresent))
    return res.status(404).json({ message: 'Rider not found' });
  // todo change this one to unique when we update the relationship to one on one
  //first check if we have RiderStatus model created
  const old_rider_status = await prisma.riderStatus.findUnique({
    where: {
      rider_id: id,
    },
  });
  let new_rider_status: undefined | RiderStatus;
  if (old_rider_status) {
    new_rider_status = await prisma.riderStatus.update({
      where: {
        id: old_rider_status.id,
      },
      data: data,
    });
    // Assign CCA only when status is being approved and avoid when it was approved before
    if (
      data.status == 'APPROVED' &&
      new_rider_status.cca_id &&
      old_rider_status.status != 'APPROVED'
    ) {
      // Assign CCA to the earliest Rider who is not approved
      AssignCCATORiderApproval(new_rider_status.cca_id);
    }
  } else {
    new_rider_status = await UpdateRiderStatusOnRegistration(id, data);
  }

  return res.status(200).json(new_rider_status);
};

/**
 * @param {id} id of customer care agent
 * Look for the oldest rider who is not approved and doesn't have customer care agent assigned
 * and assign the current customer care agent to him/her
 * @return void since it should run async
 */
const AssignCCATORiderApproval = async (id: string) => {
  const rider_status = await prisma.riderStatus.findFirst({
    where: {
      status: RiderStatusEnum.PENDING,
      cca_id: null,
    },
    orderBy: {
      created_at: 'asc',
    },
  });
  if (rider_status) {
    await prisma.riderStatus.update({
      where: {
        id: rider_status.id,
      },
      data: {
        cca_id: id,
      },
    });
  }
};

export const UpdateRiderStatusOnRegistration = async (
  riderId: string,
  {
    status = RiderStatusEnum.PENDING,
    message = 'Created automatically on user creation',
  }
) => {
  // get one Customer Care Agent who doesn't have a pending approval else do not assign any approver
  const cca = await prisma.customerCareAgent.findFirst({
    where: {
      is_active: true,
      verified: true,
      riderApproval: {
        every: {
          status: {
            not: RiderStatusEnum.PENDING,
          },
        },
      },
    },
    select: {
      id: true,
      riderApproval: {
        select: {
          status: true,
        },
      },
    },
  });
  return prisma.riderStatus.create({
    data: {
      message: message,
      rider_id: riderId,
      cca_id: cca ? cca['id'] : null,
      status: status,
    },
  });
};
