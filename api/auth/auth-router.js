const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Users = require('../users/users-model')

const checkPayload = (req, res, next) => {
	if (!req.body.username || !req.body.password) {
		res.status(401).json('username and password required')
	} else {
		next()
	}
}

const checkIfUserExists = (req, res, next) => {
	Users.findBy({ username: req.body.username })
		.then(user => {
			if (!user.length) {
				next()
			} else {
				res.status(401).json('username taken')
			}
		})
		.catch(err => {
			res.status(500).json(` error: ${err}`)
		})
}

const loginCheckUser = (req, res, next) => {
	Users.findBy({ username: req.body.username })
		.then(user => {
			if (user.length) {
				req.userData = user[0]
				next()
			} else {
				res.status(401).json('invalid credentials')
			}
		})
		.catch(err => {
			res.status(500).json(` error: ${err}`)
		})
}

router.post('/register', checkPayload, checkIfUserExists, (req, res) => {
	const hash = bcrypt.hashSync(req.body.password, 8)
	Users.insert({ username: req.body.username, password: hash })
		.then(user => {
			res.status(201).json(user)
		})
		.catch(err => {
			res.status(500).json(`Server error: ${err}`)
		})
})

router.post('/login', checkPayload, loginCheckUser, (req, res) => {
	const verified = bcrypt.compareSync(req.body.password, req.userData.password)
	if (verified) {
		const token = makeToken(req.userData)
		res.status(200).json({
			message: `welcome, ${req.userData.username}`,
			token
		})
	} else {
		res.status(401).json('invalid credentials')
	}
	/*
    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */
})

const makeToken = user => {
	const payload = {
		subject: user.id,
		username: user.username
	}
	const options = {
		expiresIn: '20m'
	}
	return jwt.sign(payload, 'splooie', options)
}

module.exports = router
