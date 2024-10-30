/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('transactions', function (table) {
    table.increments('id').primary();
    table
      .integer('wallet_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('wallets')
      .onDelete('CASCADE');
    table.enu('type', ['fund', 'withdraw', 'transfer']).notNullable();
    table.decimal('amount', 10, 2).notNullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('transactions');
};
