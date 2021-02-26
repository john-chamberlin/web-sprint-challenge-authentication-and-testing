const db = require('../../data/dbConfig')

function find() {
	return db('users')
}

function findById(id) {
	return db('users').where('id', id).first()
}

function findBy(filter) {
	return db('users').where(filter).orderBy('id')
}

function insert(user) {
	return db('users')
		.insert(user)
		.then(([id]) => {
			return db('users').where('id', id).first()
		})
}

module.exports = {
	find,
	findBy,
	findById,
	insert
}
