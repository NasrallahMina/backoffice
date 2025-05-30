# User Management System

A React-based user management system with authentication and CRUD operations.

## Features

- User authentication (login/logout)
- User listing
- Add new users
- Edit existing users
- Delete users
- Protected routes
- Form validation
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

To start the development server:

```bash
npm start
```

The application will be available at `http://localhost:3000`

## Demo Credentials

For testing purposes, use the following credentials:

- Email: admin@example.com
- Password: admin123

## Technologies Used

- React
- TypeScript
- Material-UI
- React Router
- Formik
- Yup
- Axios

## Project Structure

```
src/
  ├── components/     # Reusable components
  ├── contexts/       # React contexts
  ├── pages/         # Page components
  ├── services/      # API services
  ├── types/         # TypeScript types
  └── App.tsx        # Main application component
```

## Development

This is a demo application with mock data. In a production environment, you would need to:

1. Implement proper API integration
2. Add proper error handling
3. Implement proper security measures
4. Add unit tests
5. Add environment configuration
