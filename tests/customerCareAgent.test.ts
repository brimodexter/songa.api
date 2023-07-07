import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';

const SIGNUP_URL = '/api/customer_agent/';
const LOGIN_URL = '/api/customer_agent/login';
const UPDATE_URL = '/api/customer_agent/';

const prisma = new PrismaClient();

const sendMailMock = jest.fn(); // this will return undefined if .sendMail() is called

// In order to return a specific value you can use this instead
// const sendMailMock = jest.fn().mockReturnValue(/* Whatever you would expect as return value */);

jest.mock('nodemailer');

const nodemailer = require('nodemailer'); //doesn't work with import. idk why
nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });

beforeEach(async () => {
  await prisma.customerCareAgent.deleteMany({});
  sendMailMock.mockClear();
  nodemailer.createTransport.mockClear();
});
describe('#1 Test customer care authentication Signup', () => {
  test('show error when no signup information is provided', async () => {
    const res = await request(app).post(SIGNUP_URL).send({});
    expect(res.body.email._errors[0]).toBe('Invalid email');
    expect(res.body.first_name._errors[0]).toBe('Required');
    expect(res.body.last_name._errors[0]).toBe('Required');
    expect(res.body.password._errors[0]).toBe('Required');
  });
  test('show error when blank data is provided', async () => {
    const data = {
      email: '',
      first_name: '',
      last_name: '',
      password: '',
    };
    const res = await request(app).post(SIGNUP_URL).send(data);
    expect(res.body.email._errors).toStrictEqual([
      'Invalid email',
      'Email is required',
    ]);
    expect(res.body.first_name._errors[0]).toBe('First name is required');
    expect(res.body.last_name._errors[0]).toBe('Last name is required');
    expect(res.body.password._errors).toStrictEqual([
      'Minimum eight characters, at least one number and one special character:',
      'Password is required',
    ]);
  });
  test('Success when correct data is passed', async () => {
    const data = {
      email: 'dennisngeno@gmail.com',
      first_name: 'Dennis',
      last_name: 'Ngeno',
      password: 'bsyus&673',
    };
    const res = await request(app).post(SIGNUP_URL).send(data);
    expect(res.body.email).toBe('dennisngeno@gmail.com');
    expect(res.body.first_name).toBe('Dennis');
    expect(res.body.last_name).toBe('Ngeno');
    expect(res.body.is_active).toBe(false);
    expect(res.body.created_at).toBeDefined();
    expect(res.body.id).toBeDefined();
    expect(sendMailMock).toHaveBeenCalled();
  });
  test('Error when same email is used twice', async () => {
    const data = {
      email: 'dennisngeno@gmail.com',
      first_name: 'Dennis',
      last_name: 'Ngeno',
      password: 'bsyus&673',
    };
    await request(app).post(SIGNUP_URL).send(data);
    const res = await request(app).post(SIGNUP_URL).send(data);
    expect(res.body.email).toBe('user already exists');
  });
});

describe('Test user login', () => {
  test('show error when no login information is provided', async () => {
    const res = await request(app).post(LOGIN_URL).send({});
    expect(res.body.email._errors[0]).toBe('Invalid email');
    expect(res.body.password._errors[0]).toBe('Required');
  });
  test('show error when blank data is provided', async () => {
    const data = {
      email: '',
      password: '',
    };
    const res = await request(app).post(LOGIN_URL).send(data);
    expect(res.body.email._errors).toStrictEqual([
      'Invalid email',
      'Email is required',
    ]);
    expect(res.body.password._errors).toStrictEqual(['Password is required']);
  });
  test('Success when correct data is passed', async () => {
    const signupData = {
      email: 'dennisngeno@gmail.com',
      first_name: 'Dennis',
      last_name: 'Ngeno',
      password: 'bsyus&673',
    };
    await request(app).post(SIGNUP_URL).send(signupData);
    const data = {
      email: 'dennisngeno@gmail.com',
      password: 'bsyus&673',
    };
    // User not able to login until email is verified
    const res = await request(app).post(LOGIN_URL).send(data);
    expect(res.body.message).toBe('Kindly verify your email');
    await prisma.customerCareAgent.update({
      where: { email: signupData['email'] },
      data: { verified: true },
    });
    const res1 = await request(app).post(LOGIN_URL).send(data);
    // Ensure user is active
    expect(res1.body.message).toBe(
      'User is currently inactive. Contact support'
    );
    await prisma.customerCareAgent.update({
      where: { email: signupData['email'] },
      data: { is_active: true },
    });
    const res2 = await request(app).post(LOGIN_URL).send(data);
    expect(res2.body.message).toBe('login successfully, new token assigned');
    expect(res2.body.user.email).toBe('dennisngeno@gmail.com');
    expect(res2.body.user.first_name).toBe('Dennis');
    expect(res2.body.user.last_name).toBe('Ngeno');
    expect(res2.body.user.is_active).toBe(true);
    expect(res2.body.user.created_at).toBeDefined();
    expect(res2.body.user.updated_at).toBeDefined();
    expect(res2.body.user.id).toBeDefined();
    expect(res2.body.user.sessionToken).toBeDefined();
    const res3 = await request(app).post(LOGIN_URL).send(data);
    // ensure user is able to used old password for login
    expect(res3.body.message).toBe('login successfully, using old token');
  });
  test('Error when no email is found', async () => {
    const data = {
      email: 'dennisngeno@gmail.com',
      password: 'bsyus&673',
    };
    const res = await request(app).post(LOGIN_URL).send(data);
    expect(res.body.message).toBe('unauthorized');
  });
  test('Error when wrong password is passed', async () => {
    const signupData = {
      email: 'dennisngeno@gmail.com',
      first_name: 'Dennis',
      last_name: 'Ngeno',
      password: 'bsyus&673',
    };
    await request(app).post(SIGNUP_URL).send(signupData);
    const data = {
      email: 'dennisngeno@gmail.com',
      password: 'password',
    };
    const res = await request(app).post(LOGIN_URL).send(data);
    expect(res.body.message).toBe('unauthorized');
  });
});

describe('Test user update', () => {
  let userRes = {};
  beforeEach(async function () {
    const signupData = {
      email: 'dennisngeno@gmail.com',
      first_name: 'Dennnis',
      last_name: 'Ngeno',
      password: 'bsyus&673',
    };
    await request(app).post(SIGNUP_URL).send(signupData);
    await prisma.customerCareAgent.update({
      where: { email: signupData['email'] },
      data: { is_active: true, verified: true },
    });
    this.user = await request(app).post(LOGIN_URL).send(signupData);
  });
  test('Unsuccessful update of user when no token is passed', async function () {
    const res = await request(app)
      .patch(UPDATE_URL + this.user.body.id)
      .send({
        first_name: 'Adonis',
        last_name: 'walker',
      })
      .expect(401)
      .then(response => {
        expect(response.body.message).toBe('Please pass authentication token');
      });
  });

  test('successful update of user', async function () {
    const res = await request(app)
      .patch(UPDATE_URL + this.user.body.user.id)
      .set('Authorization', `Bearer ${this.user.body.user.sessionToken}`)
      .send({
        first_name: 'Adonis',
        last_name: 'walker',
      })
      .expect(200);
    expect(res.body.first_name).toBe('Adonis');
    expect(res.body.last_name).toBe('walker');
  });
  test('show error when data is not provided', async function () {
    const res = await request(app)
      .patch(UPDATE_URL + 1)
      .set('Authorization', `Bearer ${this.user.body.user.sessionToken}`)
      .expect(404)
      .send({
        first_name: 'Adonis',
        last_name: 'walker',
      });
    expect(res.body.message).toBe('user not found');
  });
});
