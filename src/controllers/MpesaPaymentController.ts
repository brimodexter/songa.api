import { Response, Request } from 'express';

export const MpesaValidation = async (req: Request, res: Response) => {
  console.log(req.body);
  // {
  //     "TransactionType": "Pay Bill",
  //     "TransID":"RKTQDM7W6S",
  //     "TransTime":"20191122063845",
  //     "TransAmount":"10"
  //     "BusinessShortCode": "600638",
  //     "BillRefNumber":"invoice008",
  //     "InvoiceNumber":"",
  //     "OrgAccountBalance":""
  //     "ThirdPartyTransID": "",
  //     "MSISDN":"hashed",
  //     "FirstName":"John",
  //     "MiddleName":""
  //     "LastName":"Doe"
  // }
  return res.status(200).json({
    ResultCode: '0',
    ResultDesc: 'Accepted',
  });
};

export const MpesaConfirmation = async (req: Request, res: Response) => {
  console.log(req.body);
  return res.status(200).json({
    ResultCode: '0',
    ResultDesc: 'Accepted',
  });
};
