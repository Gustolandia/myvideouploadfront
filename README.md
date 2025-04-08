# My Video Upload Frontend

A React-based frontend application for managing video uploads, designed to interface with our Node.js backend. This application provides a responsive UI for users to authenticate, upload videos, and interact with various scheduling and processing features offered by the backend.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
- [Available Scripts](#available-scripts)
- [Development](#development)
- [Deployment](#deployment)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Overview

The **My Video Upload Frontend** application is built with [React](https://reactjs.org/) and [Create React App](https://create-react-app.dev/). It offers an intuitive UI for uploading videos, scheduling uploads via cron jobs, and interfacing with various external APIs through a secure backend.

This project is structured to work seamlessly with our Node.js backend service, ensuring smooth communication via REST APIs and secure authentication.

## Features

- **Video Upload Interface**: Easily upload videos with drag-and-drop or file selection.
- **Responsive Design**: Built with Bootstrap and React-Bootstrap for a modern, responsive layout.
- **API Integration**: Connects to backend endpoints for handling video processing and scheduling.
- **Environment Configuration**: Uses environment variables for API URLs and keys.
- **Testing Framework**: Integrated with Testing Library for unit and component testing.

## Technologies Used

- **React** and **React-DOM**: For building the user interface.
- **Create React App**: Bootstrap application setup.
- **Bootstrap & React-Bootstrap**: Styling and layout components.
- **Testing Library**: For unit and integration testing of UI components.
- **ESLint**: Ensures code quality and maintainability.

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

Make sure you have the following installed on your machine:

- [Node.js](https://nodejs.org/en/) (version 14 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/myvideouploadfront.git
   cd myvideouploadfront
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

### Environment Configuration

Create a `.env` file in the project root with the following configuration:

```dotenv
REACT_APP_BACKEND_URL=https://miserably-light-wallaby.ngrok-free.app
PORT=3001
REACT_APP_CRON_JOB_API_KEY=MgzLumx3jiolk+DOAXlFRY6pae1/JvRmc1RT9vFYBKc=
```

> **Note:**  
> Environment variables in Create React App must be prefixed with `REACT_APP_` to be available in your application. Ensure that `.env` is added to your `.gitignore` file if it contains sensitive information.

## Available Scripts

In the project directory, you can run:

- **Start the development server:**

  ```bash
  npm start
  ```

- **Build the app for production:**

  ```bash
  npm run build
  ```

- **Run tests:**

  ```bash
  npm test
  ```

- **Eject:**

  ```bash
  npm run eject
  ```

## Development

During development, you’ll primarily use the `npm start` script. If you need to configure any additional tools, consider integrating your own ESLint or Prettier configurations.

### Proxy Setup (Optional)

If your React app makes frequent API calls to your backend during development, consider adding a proxy field to your `package.json`:

```json
"proxy": "http://localhost:3000"
```

## Deployment

To deploy your application:

1. Build the project using:

   ```bash
   npm run build
   ```

2. Serve the content of the `build` directory with a static server:

   ```bash
   npm install -g serve
   serve -s build
   ```

## Testing

This project utilizes [Testing Library](https://testing-library.com/) for component testing. To run the tests:

```bash
npm test
```

## Contributing

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push the branch: `git push origin feature/your-feature-name`
5. Open a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For any questions or support, please open an issue or contact the project maintainer at [your.email@example.com](mailto:your.email@example.com).