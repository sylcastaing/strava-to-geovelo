# Strava to Geovelo

An application to automate the transfer of rides (with GPX files) between [Strava](https://www.strava.com) and [Geovelo](https://geovelo.app) (a French app for cycling travel).

## Overview

This application leverages [Strautomator](https://strautomator.com/) to trigger a webhook when a new activity is created on Strava. The webhook processes the activity data, extracts the GPX file, and transfers it to Geovelo.

## Features

- Automatic synchronization of activities from Strava to Geovelo
- Serverless deployment using cloud functions
- Secure credential storage using S3-compatible storage
- Webhook integration with Strautomator

## Architecture

The application uses a serverless architecture:

1. Strautomator detects new activities on Strava and triggers the webhook
2. The webhook function processes the request
3. The application authenticates with Strava to retrieve the GPX data
4. The GPX is processed and uploaded to Geovelo
5. Credentials are securely stored in S3-compatible storage

## Setup

### Prerequisites

- Node.js 22 or higher
- Strava API credentials (Client ID and Secret)
- Geovelo account
- S3-compatible storage (like Scaleway Object Storage)
- Strautomator account configured to trigger webhooks for new Strava activities

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/strava-to-geovelo.git
   cd strava-to-geovelo
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Create a `.env` file based on the provided `.env.example`

   ```bash
   cp .env.example .env
   ```

4. Fill in your environment variables in the `.env` file

### Development

```bash
# Run in development mode with auto-reload
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint
```

### Strava credentials

**Important:** To run the application, you need to have a valid `credentials.json` file in your S3-compatible storage with Strava OAuth tokens. This file contains the OAuth tokens required for authenticating with Strava and accessing activity data.

See [Strava OAuth documentation](https://developers.strava.com/docs/getting-started/#oauth) for more details about the OAuth flow.

#### Generating Strava Credentials

The application will automatically refresh tokens when they expire, but you need to generate the initial credentials. You can use the helpers in `tests/e2e.test.ts` to do this:
Replace the `.skip` before trying to running it.

1. First, generate an authorization URL with `"print strava auth link"` test

2. Open the generated URL in your browser and authorize the application when prompted

3. After authorizing, you'll be redirected to `localhost:3000`. The page will show an error, but that's expected.
   - Look at the URL in your browser's address bar
   - Copy the `code` parameter value from the URL (e.g., `http://localhost:3000?state=&code=abcd1234...` → copy "abcd1234...")

4. Generate the credential file automatically by running the `"create strava credentialscreate strava credentials"` test after updated the `CODE` constant in this test/

This process will create and store the OAuth credentials in your configured S3 storage at the path specified by `STORAGE_CREDENTIAL_PATH`. The tokens will be automatically refreshed when they expire, so you only need to do this setup once.

### Building

```bash
npm run build
```

## Deployment

The application can be deployed to a cloud provider with:

- A function to receive webhook calls from Strautomator
- S3-compatible storage to securely store Strava OAuth credentials

### Terraform/OpenTofu Configuration

A ready-to-use Terraform/OpenTofu configuration is available in the `tofu` directory. This configuration is specifically designed for [Scaleway](https://www.scaleway.com) infrastructure and sets up:

- A Scaleway project for the application
- An Object Storage bucket for storing credentials
- IAM policies and API keys for secure access
- A serverless function to handle webhook requests

To deploy using the provided Terraform configuration:

```bash
cd tofu
tofu init
tofu plan
tofu apply
```

You'll need to provide the required variables for Scaleway authentication and service configuration. See the `variables.tf` file for details.

### Strautomator config

When your application is deployed, you can configure the Strautomator automation.
Create an automation, filter Sport type on all ride types you want, and attach a webhook action on it with `POST` for action and your function url.
A pro account is needed to use Strautomator webhooks.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

### Strava API Configuration

- `STRAVA_CLIENT_ID`: Your Strava API application client ID
- `STRAVA_CLIENT_SECRET`: Your Strava API application client secret

See [this doc](https://developers.strava.com/docs/getting-started/#basic) for more information about strava api and application creation.

### Geovelo API Configuration

**Note:** This application does not use an official Geovelo API as none exists publicly. The implementation is based on reverse engineering the Geovelo public website. Constants were found using web developer tools on the Geovelo web application.

- `GEOVELO_AUTHENTIFICATION`: Base64 encoded string of your Geovelo login and password in the format `login;password`. You can generate this value by running the test `get geovelo authentication code` in `tests/e2e.test.ts`
- `GEOVELO_API_KEY`: Geovelo API key found via browser developer console (default: `0f8c781a-b4b4-4d19-b931-1e82f22e769f`)
- `GEOVELO_SOURCE`: Source identifier for Geovelo requests (default: `website`)

### Storage Configuration (S3/Scaleway)

- `STORAGE_ENDPOINT`: URL endpoint for your S3-compatible storage
- `STORAGE_REGION`: Region for your storage (e.g., fr-par)
- `STORAGE_ACCESS_KEY_ID`: Access key ID for your storage
- `STORAGE_SECRET_ACCESS_KEY`: Secret access key for your storage
- `STORAGE_CREDENTIAL_PATH`: Path where credentials will be stored (default: /credentials.json)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
