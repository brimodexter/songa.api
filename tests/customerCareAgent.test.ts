import request from 'supertest'
import app from '../src/app'
import {PrismaClient} from "@prisma/client";

const SIGNUP_URL = '/api/users/customer_agent/create-user-account'
const LOGIN_URL = '/api/users/customer_agent/login'
const UPDATE_URL = '/api/users/customer_agent/create-user-account/'

const prisma = new PrismaClient()
beforeEach(async () => {
    await prisma.customerCareAgent.deleteMany({})
})
describe('#1 Test customer care authentications', () => {
    test('show error when no signup information is provided', async () => {
        const res = await request(app).post(SIGNUP_URL).send({})
        expect(res.body.email._errors[0]).toBe('Invalid email')
        expect(res.body.first_name._errors[0]).toBe('Required')
        expect(res.body.last_name._errors[0]).toBe('Required')
        expect(res.body.password._errors[0]).toBe('Required')
    })
    test('show error when blank data is provided', async () => {
        const data = {
            "email": "",
            "first_name": "",
            "last_name": "",
            "password": ""
        }
        const res = await request(app).post(SIGNUP_URL).send(data)
        expect(res.body.email._errors).toStrictEqual([
            "Invalid email",
            "Email is required"
        ])
        expect(res.body.first_name._errors[0]).toBe('First name is required')
        expect(res.body.last_name._errors[0]).toBe('Last name is required')
        expect(res.body.password._errors).toStrictEqual([
            "Minimum eight characters, at least one number and one special character:",
            "Password is required"
        ])
    })
    test('Success when correct data is passed', async () => {
        const data = {
            "email": "dennisngeno@gmail.com",
            "first_name": "Dennis",
            "last_name": "Ngeno",
            "password": "bsyus&673"
        }
        const res = await request(app).post(SIGNUP_URL).send(data)
        expect(res.body.email).toBe('dennisngeno@gmail.com')
        expect(res.body.first_name).toBe('Dennis')
        expect(res.body.last_name).toBe('Ngeno')
        expect(res.body.is_active).toBe(false)
        expect(res.body.created_at).toBeDefined()
        expect(res.body.id).toBeDefined()

    })
    test('Error when same email is used twice', async () => {
        const data = {
            "email": "dennisngeno@gmail.com",
            "first_name": "Dennis",
            "last_name": "Ngeno",
            "password": "bsyus&673"
        }
        await request(app).post(SIGNUP_URL).send(data)
        const res = await request(app).post(SIGNUP_URL).send(data)
        expect(res.body.email).toBe('user already exists')
    })
})

describe("Test user login", () => {
    test('show error when no login information is provided', async () => {
        const res = await request(app).post(LOGIN_URL).send({})
        expect(res.body.email._errors[0]).toBe('Invalid email')
        expect(res.body.password._errors[0]).toBe('Required')
    })
    test('show error when blank data is provided', async () => {
        const data = {
            "email": "",
            "password": ""
        }
        const res = await request(app).post(LOGIN_URL).send(data)
        expect(res.body.email._errors).toStrictEqual([
            "Invalid email",
            "Email is required"
        ])
        expect(res.body.password._errors).toStrictEqual([
            "Password is required"
        ])
    })
    test('Success when correct data is passed', async () => {
        const signupData = {
            "email": "dennisngeno@gmail.com",
            "first_name": "Dennis",
            "last_name": "Ngeno",
            "password": "bsyus&673"
        }
        await request(app).post(SIGNUP_URL).send(signupData)
        const data = {
            "email": "dennisngeno@gmail.com",
            "password": "bsyus&673"
        }
        const res = await request(app).post(LOGIN_URL).send(data)
        expect(res.body.message).toBe("login successfully, new token assigned")
        expect(res.body.user.email).toBe('dennisngeno@gmail.com')
        expect(res.body.user.first_name).toBe('Dennis')
        expect(res.body.user.last_name).toBe('Ngeno')
        expect(res.body.user.is_active).toBe(false)
        expect(res.body.user.created_at).toBeDefined()
        expect(res.body.user.updated_at).toBeDefined()
        expect(res.body.user.id).toBeDefined()
        expect(res.body.user.sessionToken).toBeDefined()
        const res2 = await request(app).post(LOGIN_URL).send(data)
        // ensure user is able to used old password for login
        expect(res2.body.message).toBe("login successfully, using old token")

    })
    test('Error when no email is found', async () => {
        const data = {
            "email": "dennisngeno@gmail.com",
            "password": "bsyus&673"
        }
        const res = await request(app).post(LOGIN_URL).send(data)
        expect(res.body.message).toBe("unauthorized")
    })
    test('Error when wrong password is passed', async () => {
        const signupData = {
            "email": "dennisngeno@gmail.com",
            "first_name": "Dennis",
            "last_name": "Ngeno",
            "password": "bsyus&673"
        }
        await request(app).post(SIGNUP_URL).send(signupData)
        const data = {
            "email": "dennisngeno@gmail.com",
            "password": "password"
        }
        const res = await request(app).post(LOGIN_URL).send(data)
        expect(res.body.message).toBe("unauthorized")
    })
})

describe("Test user update", () => {
    test('successful update of user', async () => {
        const signupData = {
            "email": "dennisngeno@gmail.com",
            "first_name": "Dennnis",
            "last_name": "Ngeno",
            "password": "bsyus&673"
        }
        const userRes = await request(app).post(SIGNUP_URL).send(signupData)
        const res = await request(app).patch(UPDATE_URL + userRes.body.id).send({
            "first_name": "Adonis",
            "last_name": "walker",
        })
        expect(res.body.first_name).toBe('Adonis')
        expect(res.body.last_name).toBe('walker')
    })
    test('show error when data is not provided', async () => {
        const res = await request(app).patch(UPDATE_URL + 1).send({
            "first_name": "Adonis",
            "last_name": "walker",
        })
        expect(res.body.message).toBe('user not found')
        expect(res.statusCode).toBe(404)
    })
});