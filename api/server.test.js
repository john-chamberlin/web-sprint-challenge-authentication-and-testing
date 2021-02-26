// Write your tests here
const request = require('supertest')
const db = require('../data/dbConfig')
const server = require('./server')
const bcrypt = require('bcryptjs')

const newUser = {
	username: 'johnny boy',
	password: 'splooooie'
}

it('correct env', () => {
	expect(process.env.NODE_ENV).toBe('testing')
})

beforeAll(async () => {
	await db.migrate.rollback()
	await db.migrate.latest()
})

beforeEach(async () => {
	await db('users').truncate()
})

afterAll(async () => {
	await db.destroy()
})

describe('api tests', () => {
	describe('post to /register', () => {
		it('responds with status 201', async () => {
			const res = await request(server).post('/api/auth/register').send(newUser)
			expect(res.status).toBe(201)
		})
		it('responds with correct password', async () => {
			const res = await request(server).post('/api/auth/register').send(newUser)
			const hash = bcrypt.compareSync(newUser.password, res.body.password)
			expect(hash).toBe(true)
		})
	})
	describe('post to /login', () => {
		it('responds with status 200', async () => {
			await request(server).post('/api/auth/register').send(newUser)
			const res = await request(server).post('/api/auth/login').send(newUser)
			expect(res.status).toBe(200)
		})
		it('returns token', async () => {
			await request(server).post('/api/auth/register').send(newUser)
			const res = await request(server).post('/api/auth/login').send(newUser)
			expect(res.body).toHaveProperty('token')
		})
	})
	describe('get to /api/jokes', () => {
		it('responds with status 401 when not logged in', async () => {
			const res = await request(server).get('/api/jokes')
			expect(res.status).toBe(401)
		})
		it('gives status 200 when logged in', async () => {
			await request(server).post('/api/auth/register').send(newUser)
			const logRes = await request(server).post('/api/auth/login').send(newUser)
			const token = logRes.body.token
			const res = await request(server)
				.get('/api/jokes')
				.set('authorization', token)
			expect(res.status).toBe(200)
		})
	})
})
