# Product Development Process Manager

A comprehensive application for managing product development processes, including project tracking, experience mapping, and story mapping.

## Features

### Project Management
- Create, read, update, and delete projects
- Track project status (Draft, In Progress, Review, Completed)
- Manage team members and their roles
- Set and track success metrics
- Document business problems and target audience

### Experience Mapping
- Create and manage user personas
- Define experience phases
- Map user journeys with emotional tracking
- Identify opportunities for improvement
- Document evidence and research

### Story Mapping
- Organize work into releases and epics
- Create and prioritize user stories
- Track story status and assignments
- Visualize product roadmap
- Manage development workflow

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **State Management**: Redux Toolkit
- **UI Framework**: Material-UI v7
- **Routing**: React Router v7
- **Build Tool**: Create React App

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm (v8 or later) or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/product-development-process.git
   cd product-development-process
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

In the project directory, you can run:

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (use with caution)

## Project Structure

```
src/
├── assets/               # Static assets (images, fonts, etc.)
├── components/           # Reusable UI components
├── features/             # Feature modules
│   ├── experience-map/   # Experience mapping feature
│   └── story-map/        # Story mapping feature
├── layouts/              # Layout components
├── pages/                # Page components
├── services/             # API and service layer
├── store/                # Redux store configuration
│   └── slices/           # Redux slices
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

## State Management

The application uses Redux Toolkit for state management with the following slices:

- `projectSlice`: Manages projects and related data
- `experienceMapSlice`: Handles experience mapping functionality
- `storyMapSlice`: Manages story mapping features

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Create React App](https://create-react-app.dev/)
- UI components powered by [Material-UI](https://mui.com/)
- State management with [Redux Toolkit](https://redux-toolkit.js.org/)
