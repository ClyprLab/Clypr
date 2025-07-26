# Contributing to Clypr

Thank you for your interest in contributing to Clypr! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

Please read and follow our [Code of Conduct](./CODE_OF_CONDUCT.md) to foster an open and welcoming environment.

## How Can I Contribute?

There are many ways you can contribute to Clypr:

- Reporting bugs
- Suggesting enhancements
- Writing documentation
- Submitting code changes
- Reviewing pull requests
- Providing feedback

## Reporting Bugs

Before submitting a bug report:

1. Check the [issue tracker](https://github.com/yourusername/clypr/issues) to see if the issue has already been reported.
2. If you're unable to find an open issue addressing the problem, [open a new one](https://github.com/yourusername/clypr/issues/new).

When submitting a bug report, please include:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots or error messages (if applicable)
- Environment information (OS, browser, etc.)

## Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

1. Use a clear and descriptive title
2. Provide a detailed description of the proposed functionality
3. Explain why this enhancement would be useful
4. Include mockups or examples if applicable

## Development Process

### Setting Up the Development Environment

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/yourusername/clypr.git
   cd clypr
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up the development environment as described in the [Developer Guide](./DEVELOPER_GUIDE.md)

### Making Changes

1. Create a new branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes, following the code style and conventions
3. Add tests for your changes
4. Run the test suite to ensure everything passes:
   ```bash
   npm test
   ```
5. Commit your changes with a descriptive commit message

### Submitting a Pull Request

1. Push your changes to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
2. Open a pull request against the `main` branch of the original repository
3. Provide a clear description of the changes and their purpose
4. Link any relevant issues

## Pull Request Review Process

All pull requests will be reviewed by project maintainers. During the review process:

1. Automated tests will run to verify your changes
2. Maintainers will review your code for quality and adherence to guidelines
3. Feedback may be provided for necessary changes
4. Once approved, your changes will be merged into the main codebase

## Code Style and Guidelines

### Motoko

- Follow the [Motoko Style Guide](https://internetcomputer.org/docs/current/developer-docs/build/cdks/motoko-dfinity/style/)
- Use meaningful variable and function names
- Write clear comments for complex logic
- Include doc comments for public functions

### JavaScript/TypeScript

- Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use TypeScript for type safety
- Format code using Prettier
- Lint code using ESLint

### React

- Use functional components and hooks
- Follow component composition patterns
- Maintain proper prop types
- Optimize renders where appropriate

## Testing Guidelines

- Write unit tests for all new functionality
- Maintain or improve test coverage
- Test both success and failure cases
- Mock external dependencies

## Documentation Guidelines

- Keep documentation up to date with code changes
- Use clear, concise language
- Include examples for API usage
- Document both what and why

## Git Workflow

- Make small, focused commits
- Use descriptive commit messages
- Reference issue numbers in commit messages when applicable
- Rebase your branch before submitting a pull request
- Squash commits if necessary to maintain a clean history

## License

By contributing to Clypr, you agree that your contributions will be licensed under the project's [MIT License](../LICENSE).

## Questions?

If you have any questions about contributing, please join our [Discord community](https://discord.gg/clypr-dev) or open an issue on GitHub.
