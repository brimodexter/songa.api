import request from 'supertest'
import app from '../app'
import {PrismaClient} from "@prisma/client";

const AUTH_ROUTE = '/api/users/customer_agent/create-user-account'

beforeEach(async () => {
    const prisma = new PrismaClient()
    await prisma.customerCareAgent.deleteMany({}) //delete posts first
})


const mockCallback = jest.fn( mailOptions=> 42);

describe('#1 Test customer care authentications', () => {
    test('show error when no data is provided', async () => {
        const res = await request(app).post(AUTH_ROUTE).send({})
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
        const res = await request(app).post(AUTH_ROUTE).send(data)
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
        const res = await request(app).post(AUTH_ROUTE).send(data)
        expect(res.body.email).toBe('dennisngeno@gmail.com')
        expect(res.body.first_name).toBe('Dennis')
        expect(res.body.last_name).toBe('Ngeno')
        expect(res.body.is_active).toBe(false)
        expect(res.body.created_at).toBeDefined()
        expect(res.body.id).toBeDefined()

    })
    test('Success when correct data is passed', async () => {
        const data = {
            "email": "dennisngeno@gmail.com",
            "first_name": "Dennis",
            "last_name": "Ngeno",
            "password": "bsyus&673"
        }
        await request(app).post(AUTH_ROUTE).send(data)
        const res = await request(app).post(AUTH_ROUTE).send(data)
        expect(res.body.email).toBe('user already exists')
    })
})
