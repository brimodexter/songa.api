import {CustomerCareAgent, PrismaClient, RiderStatusEnum} from "@prisma/client";
import {Response} from "express";
import {CheckCCA, checkCustomerCareAgent, checkRider} from "../helpers/user";

const prisma = new PrismaClient({
    log: [
        {
            emit: "event",
            level: "query",
        },
    ],
});

prisma.$on("query", async (e) => {
    console.log(`${e.query} ${e.params}`)
});

export const AssignCCAOnRiderCreation = async (req: any, res: Response) => {
    // select all customer agents who are active and verified and have pending approvals
    let id = req.params['id'];
    const checkRiderResult = await checkRider(
        {id},
    );
    if (!(checkRiderResult && checkRiderResult.riderPresent))
        return res.status(404).json({message: "Rider not found"})

    let rider_status = await prisma.riderStatus.findFirst({
        where: {
            riderId : id
        }
    })
    let {data} = req;
    if (rider_status){
        rider_status = await prisma.riderStatus.update({
            where: {
                id: rider_status.id
            },
            data : data
        })
    }else{
        rider_status = await UpdateRiderStatusOnRegistration(id)
    }
    if(data.status == 'APPROVED' && rider_status.cca_id){
        // Assign CCA to the earliest Rider who is not approved
        AssignCCATORiderApproval(rider_status.cca_id)
    }
    return res.status(200).json(rider_status);
}

const AssignCCATORiderApproval = async (id: string) => {
    const userExists: CheckCCA | undefined = await checkCustomerCareAgent({id});
    if (!(userExists && userExists.user))
        return
    const rider_status = await prisma.riderStatus.findFirst({
        where:{
            status: RiderStatusEnum.PENDING
        },
        orderBy: {
            created_at: 'asc',
        },
    })
    if(rider_status){
        await prisma.riderStatus.update({
            where: {
                id: rider_status.id
            },
            data : {
                cca_id:id
            }
        })
    }
}

export const UpdateRiderStatusOnRegistration = async (riderId: string) => {
    // get one Customer Care Agent who doesn't have a pending approval else do not assign any approver
    const cca = await prisma.customerCareAgent.findFirst({
        where: {
            is_active: true,
            verified: true,
            riderApproval: {
                every: {
                    status: {
                        not: RiderStatusEnum.PENDING
                    }
                }

            }
        },
        select: {
            id: true,
            riderApproval: {
                select: {
                    status: true
                },
            }
        }
    });
    return prisma.riderStatus.create({
        data: {
            message: "Created automatically on user creation",
            riderId: riderId,
            cca_id: cca ? cca['id'] : null
        }
    });
}