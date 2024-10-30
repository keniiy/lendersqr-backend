/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('audit_logs', function (table) {
    table.increments('id').primary();

    table
      .integer('user_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    table
      .integer('wallet_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('wallets')
      .onDelete('CASCADE');

    table.string('action').notNullable(); // Action type, e.g., "USER_CREATED"
    table.json('details');
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('audit_logs');
};
