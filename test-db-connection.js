/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();
const knex = require('knex');

const db = knex({
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
});

db.raw('SELECT 1')
  .then(() => {
    console.log('Database connection successful');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
    process.exit(1);
  });
