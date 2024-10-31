<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
<p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
</p>

<h2>Description</h2>
<p><a href="https://github.com/nestjs/nest">Nest</a> framework TypeScript starter repository.</p>

<h2>Project Setup</h2>
<p>This project leverages the NestJS framework with TypeScript and includes configurations for testing, migrations, webhook handling, and Docker setup. The following sections guide you through the complete setup, testing, migration steps, and Docker usage.</p>

<h3>Prerequisites</h3>
<p>Ensure the following are installed:</p>
<ul>
  <li><a href="https://nodejs.org/en/">Node.js (v16 or later)</a></li>
  <li><a href="https://pnpm.io/installation">pnpm</a></li>
  <li><a href="https://www.docker.com/get-started">Docker</a></li>
  <li>Proxy service like <a href="https://ngrok.com/">ngrok</a> to test webhooks</li>
</ul>

<h3>Running with Docker</h3>
<p>The project includes a <code>docker-compose.yml</code> file for setting up MySQL as a service. To start MySQL with Docker:</p>
<p>Start MySQL service with Docker Compose</p>

<pre><code>
$ docker-compose up -d
</code></pre>

<h4>Docker Compose Configuration</h4>
<p>The <code>docker-compose.yml</code> file sets up the following MySQL service:</p>
<pre><code>
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: lendersqr-mysql
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: lendersqr_db
      MYSQL_USER: lendersqr_user
      MYSQL_PASSWORD: lendersqr_password
    ports:
      - '3306:3306'
    networks:
      - lendersqr-network
    volumes:
      - mysql_data:/var/lib/mysql

networks:
  lendersqr-network:

volumes:
  mysql_data:
</code></pre>

<h3>Setting up Environment Variables</h3>
<p>Create a <code>.env</code> file with the following configurations:</p>
<pre><code>
DATABASE_URL=mysql://lendersqr_user:lendersqr_password@localhost:3306/lendersqr_db
FLW_SECRET_KEY=your_flutterwave_secret_key
FLW_REDIRECT_URL=your_redirect_url_for_funding
PORT=3000
</code></pre>

<h3>Database Migration</h3>
<p>Run migrations using Knex:</p>

<pre><code>
# Run migrations
$ pnpm run migrate

# Rollback migrations
$ pnpm run migrate:rollback

# Reset migrations
$ pnpm run migrate:reset
</code></pre>

<h3>Running the Application</h3>
<pre><code>
# Development mode
$ pnpm run start:dev
# Production mode
$ pnpm run start:prod
# Production mode
$ pnpm run start:prod

</code></pre>

<h3>Running Tests</h3>
<p>Run tests:</p>
<pre><code>
# Unit tests
$ pnpm run test
# End-to-end tests
$ pnpm run test:e2e
# Test coverage
$ pnpm run test:cov
</code></pre>

<h3>Using a Proxy for Webhook Testing</h3>
<p>To test webhooks locally:</p>
<pre><code>
# Start your application (e.g., port 3000)
$ ngrok http 3000
</code></pre>
<p>Set the generated <code>ngrok</code> URL as the webhook endpoint in your third-party service (e.g., Flutterwave).</p>

<h2>Available Endpoints</h2>
<p>Here’s a list of the currently implemented endpoints, as well as a TODO section for additional endpoints:</p>

<h3>Completed Endpoints</h3>
<ul>
  <li><strong>POST /auth/register</strong> - Registers a new user, checking Adjutor Karma blacklist. Requires <code>name</code>, <code>email</code>, <code>password</code>.</li>
  <li><strong>POST /auth/login</strong> - Logs in a user and returns tokens. Requires <code>email</code>, <code>password</code>.</li>
  <li><strong>POST /auth/logout</strong> - Logs out the user (JWT required).</li>
  <li><strong>POST /auth/refresh-token</strong> - Refreshes access token using <code>refreshToken</code>.</li>
  <li><strong>PATCH /auth/change-password</strong> - Changes user’s password (JWT required).</li>
  <li><strong>POST /wallet/fund</strong> - Initiates wallet funding. Requires <code>amount</code>.</li>
  <li><strong>GET /wallet/balance</strong> - Retrieves current wallet balance (JWT required).</li>
  <li><strong>PATCH /wallet/transfer</strong> - Transfers funds to another user’s wallet. Requires <code>toUserId</code> and <code>amount</code>.</li>
  <li><strong>PATCH /wallet/withdraw</strong> - Withdraws funds to a bank. Requires <code>amount</code>, <code>accountNumber</code>, <code>bankCode</code>.</li>
  <li><strong>GET /wallet/banks</strong> - Lists supported banks for transfers.</li>
  <li><strong>POST /webhook/flutterwave</strong> - Listens for Flutterwave payment events to verify and fund the user’s wallet.</li>
</ul>

<h3>TODO: Additional Endpoints</h3>
<p>For future implementation to enhance the MVP:</p>
<ul>
  <li><strong>GET /wallet/transactions</strong> - Retrieves a list of all transactions for a user’s wallet, including funding, transfers, and withdrawals.</li>
  <li><strong>GET /wallet/audit-logs</strong> - Retrieves audit logs, including significant actions like account creation, funding, transfers, and withdrawals.</li>
  <li><strong>GET /auth/users</strong> - Retrieves a list of all registered users (Admin only).</li>
</ul>

<h2>License</h2>
<p>Nest is <a href="https://github.com/nestjs/nest/blob/master/LICENSE">MIT licensed</a>.</p>