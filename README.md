# Bookmarks Sync

Bookmarks Sync is a web application that allows users to synchronize their Chrome bookmarks across multiple devices.

## Features

- User authentication
- Device registration
- Bookmark synchronization
- Chrome extension for easy syncing

## Prerequisites

- Node.js (v14 or later)
- MySQL (v8 or later)
- Chrome browser (for extension)

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/bookmarks-sync.git
   cd bookmarks-sync
   ```

2. Install dependencies for both backend and frontend:

   ```
   cd bookmarks-backend
   npm install
   cd ../bookmarks-frontend
   npm install
   ```

3. Set up the database:

   - Create a MySQL database named `bookmarks`
   - Update the database configuration in `bookmarks-backend/.env` file

4. Set up environment variables:

   - Create a `.env` file in the `bookmarks-backend` directory
   - Add the following variables:
     ```
     PORT=5000
     DB_HOST=localhost
     DB_USER=your_mysql_username
     DB_PASSWORD=your_mysql_password
     DB_NAME=bookmarks
     JWT_SECRET=your_jwt_secret
     ```

5. Run database migrations:

   ```
   cd bookmarks-backend
   npx sequelize-cli db:migrate
   ```

6. Build the frontend:

   ```
   cd bookmarks-frontend
   npm run build
   ```

7. Start the backend server:

   ```
   cd bookmarks-backend
   npm start
   ```

8. (Optional) Install the Chrome extension:
   - Open Chrome and go to `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `bookmarks-extension` directory

## Usage

1. Access the web application at `http://localhost:5000`
2. Register a new account or log in
3. Add devices and start syncing bookmarks
4. Use the Chrome extension for easy syncing from your browser

## Deployment

For production deployment, consider the following:

1. Use a process manager like PM2 to run the Node.js server
2. Set up a reverse proxy with Nginx or Apache
3. Use HTTPS for secure communication
4. Set up proper database backups
5. Configure environment variables for production settings

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
