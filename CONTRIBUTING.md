# Contributing to Product Development Process Manager

Thank you for your interest in contributing to the Product Development Process Manager! We welcome all contributions, whether it's bug reports, feature requests, documentation improvements, or code contributions.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Your First Code Contribution](#your-first-code-contribution)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Code Style Guide](#code-style-guide)
- [Commit Message Guidelines](#commit-message-guidelines)
- [License](#license)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [your-email@example.com].

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the [existing issues](https://github.com/your-username/product-development-process/issues) to see if the problem has already been reported. If it hasn't, please open a new issue with the following information:

1. **Describe the bug** - A clear and concise description of what the bug is.
2. **To Reproduce** - Steps to reproduce the behavior:
   1. Go to '...'
   2. Click on '....'
   3. Scroll down to '....'
   4. See error
3. **Expected behavior** - A clear and concise description of what you expected to happen.
4. **Screenshots** - If applicable, add screenshots to help explain your problem.
5. **Desktop (please complete the following information):**
   - OS: [e.g., iOS]
   - Browser [e.g., chrome, safari]
   - Version [e.g., 22]
6. **Additional context** - Add any other context about the problem here.

### Suggesting Enhancements

We welcome suggestions for enhancements and new features. Please open an issue with the following information:

1. **Is your feature request related to a problem? Please describe.**
2. **Describe the solution you'd like**
3. **Describe alternatives you've considered**
4. **Additional context**

### Your First Code Contribution

Unsure where to begin contributing? You can start by looking through the `good first issue` and `help wanted` issues:

- [Good first issues](https://github.com/your-username/product-development-process/labels/good%20first%20issue) - issues which should only require a few lines of code, and a test or two.
- [Help wanted](https://github.com/your-username/product-development-process/labels/help%20wanted) - issues which should be a bit more involved than `beginner` issues.

## Development Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/product-development-process.git
   cd product-development-process
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b bugfix/issue-number-short-description
   ```
5. Start the development server:
   ```bash
   npm start
   ```
6. Make your changes and ensure tests pass:
   ```bash
   npm test
   ```
7. Commit your changes following the [commit message guidelines](#commit-message-guidelines)
8. Push your branch and open a Pull Request

## Pull Request Process

1. Ensure any install or build dependencies are removed before the end of the layer when doing a build.
2. Update the README.md with details of changes to the interface, this includes new environment variables, exposed ports, useful file locations, and container parameters.
3. Increase the version numbers in any examples files and the README.md to the new version that this Pull Request would represent. The versioning scheme we use is [SemVer](http://semver.org/).
4. You may merge the Pull Request once you have the sign-off of two other developers, or if you do not have permission to do that, you may request the second reviewer to merge it for you.

## Code Style Guide

- Use TypeScript for all new code
- Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use functional components with hooks instead of class components
- Use Redux Toolkit for state management
- Keep components small and focused on a single responsibility
- Write tests for new features and bug fixes
- Document complex logic with comments
- Use meaningful variable and function names

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for our commit messages. Please format your commit messages as follows:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc.)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries

### Examples

```
feat(auth): add login functionality

Add login form with email and password validation

Closes #123
```

```
fix(api): handle null values in user profile

Prevent null reference errors when user profile data is missing

Fixes #456
```

## License

By contributing, you agree that your contributions will be licensed under its MIT License.
