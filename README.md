# Pet Adoption Platform API

REST API for the Pet Adoption Platform. It provides user authentication, pet listings for adoption and lost/found animals, and directory management for NGOs and veterinary partners.

## Implemented capabilities

- Email/password registration and login, plus a Google sign-in endpoint.
- JWT authentication and role-based admin middleware.
- Create, browse, update, and delete pet listings, with filtering and pagination.
- Public NGO and veterinary partner directories with admin-only management endpoints.
- PostgreSQL persistence through Prisma ORM.
- Zod request validation in the user, session, and pet controllers.
- Health check and static-file route for uploaded assets.

Adoption applications, messaging, notifications, visit scheduling, and adoption approvals are **not currently implemented** in this API. There is no Swagger/OpenAPI specification or test script in `package.json`.

## Technology

- Node.js and TypeScript (`strict` mode; ES2022 target)
- Express 4
- PostgreSQL and Prisma ORM 6
- Zod for request validation
- JWT (`jsonwebtoken`) and bcrypt for password authentication
- Multer for pet-photo multipart uploads
- Helmet, CORS, dotenv, and `express-async-errors`

The package does not declare a supported Node.js version. Use a modern Node.js release compatible with the dependencies and the built-in `fetch` used by Google sign-in.

## Requirements and setup

1. Install a supported Node.js release and make a PostgreSQL database available.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root and set the database connection string:

   ```dotenv
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
   ```

   `DATABASE_URL` is read by Prisma. The server also loads `.env` with dotenv.

4. For a local development database, apply the Prisma schema:

   ```bash
   npx prisma db push
   ```

   This synchronizes the schema without creating a migration history. Use a reviewed, versioned migration process for shared and production databases.

5. Start the development server:

   ```bash
   npm run dev
   ```

The server listens on port `3333` by default. Set `PORT` to override it. The development script runs `tsx watch src/server.ts`.

## Available scripts

| Command         | Description                                                                                              |
| --------------- | -------------------------------------------------------------------------------------------------------- |
| `npm run dev`   | Run the TypeScript server with file watching.                                                            |
| `npm run build` | Generate the Prisma client, compile TypeScript, and rewrite TypeScript path aliases in the build output. |
| `npm start`     | Run the compiled server at `dist/server.js`; run the build first.                                        |

There are currently no test, lint, seed, or database migration scripts defined in `package.json`.

## API

All routes are mounted at the root; there is no `/api/v1` prefix. JSON request bodies are supported up to 10 MB. Private routes require an `Authorization: Bearer <JWT>` header. Tokens are issued with a one-day expiry and include the user's role.

### Health

| Method | Path      | Access | Description                                                          |
| ------ | --------- | ------ | -------------------------------------------------------------------- |
| `GET`  | `/health` | Public | Returns `{ "status": "ok", "uptime": number, "timestamp": string }`. |

### Sessions

| Method | Path               | Access | Description                                                                                                                                   |
| ------ | ------------------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST` | `/sessions`        | Public | Email/password login. Body: `{ "email": "person@example.com", "password": "..." }`. Returns a JWT and user object without the password field. |
| `POST` | `/sessions/google` | Public | Accepts `{ "token": "<Google credential>" }`, obtains Google user information, and returns an application JWT, user, and `isNewUser` flag.    |

### Users

| Method   | Path              | Access                 | Description                                                                                                      |
| -------- | ----------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `POST`   | `/users`          | Public                 | Register a user. Requires `name`, `email`, and a password of at least six characters; `role` defaults to `user`. |
| `GET`    | `/users`          | Admin                  | List users.                                                                                                      |
| `PUT`    | `/users/me`       | Authenticated          | Update the current user's name, email, phone, city, state, bio, or avatar.                                       |
| `PATCH`  | `/users/password` | Authenticated          | Change password with `oldPassword` and `newPassword`; both must be at least six characters.                      |
| `DELETE` | `/users/me`       | Authenticated          | Delete the current user's account.                                                                               |
| `DELETE` | `/users/:id`      | Admin for another user | Delete a user by ID. The controller also allows a user to delete their own ID.                                   |

The user controller contains a profile-read handler, but no route currently exposes it.

### Pets

| Method   | Path        | Access                    | Description                                                                           |
| -------- | ----------- | ------------------------- | ------------------------------------------------------------------------------------- |
| `GET`    | `/pets`     | Public                    | List pets with optional filters and pagination.                                       |
| `GET`    | `/pets/me`  | Authenticated             | List the current user's listings.                                                     |
| `GET`    | `/pets/:id` | Public                    | Return a listing by UUID.                                                             |
| `POST`   | `/pets`     | Authenticated             | Create a listing. Accepts JSON or multipart form data with up to five `photos` files. |
| `PUT`    | `/pets/:id` | Authenticated, owner only | Update a listing; accepts the same `photos` upload field.                             |
| `DELETE` | `/pets/:id` | Authenticated, owner only | Delete a listing.                                                                     |

`GET /pets` accepts these query parameters:

| Parameter | Behavior                                                         |
| --------- | ---------------------------------------------------------------- |
| `type`    | Filter by `adoption`, `lost`, or `found`.                        |
| `species` | Filter by `dog`, `cat`, or `other`.                              |
| `size`    | Filter by `small`, `medium`, or `large`.                         |
| `gender`  | Filter by `male` or `female`.                                    |
| `city`    | Case-insensitive partial match.                                  |
| `search`  | Case-insensitive partial match against pet name, breed, or city. |
| `page`    | Page number; defaults to `1`.                                    |
| `perPage` | Page size; defaults to `9`.                                      |

The response contains a `pets` array and a `pagination` object with `page`, `perPage`, `totalRecords`, and `totalPages`. Listings are ordered newest first.

Pet records include species, optional breed/age/gender/size, type and status, city/state, contact details, description, photo and photos fields, optional reward/date, and the owning user ID. New listings default to type `adoption` and status `active`. Status values are `active`, `resolved`, and `adopted`.

Example:

```http
GET /pets?type=adoption&species=dog&city=Curitiba&page=1&perPage=9
```

### NGOs

| Method   | Path        | Access              | Description              |
| -------- | ----------- | ------------------- | ------------------------ |
| `GET`    | `/ngos`     | Public              | List NGOs, newest first. |
| `POST`   | `/ngos`     | Authenticated admin | Create an NGO.           |
| `PUT`    | `/ngos/:id` | Authenticated admin | Update an NGO.           |
| `DELETE` | `/ngos/:id` | Authenticated admin | Delete an NGO.           |

NGO records support name, image, city, state, phone, website, Pix key, and description.

### Veterinary partners

| Method   | Path        | Access              | Description                             |
| -------- | ----------- | ------------------- | --------------------------------------- |
| `GET`    | `/vets`     | Public              | List veterinary partners, newest first. |
| `POST`   | `/vets`     | Authenticated admin | Create a partner.                       |
| `PUT`    | `/vets/:id` | Authenticated admin | Update a partner.                       |
| `DELETE` | `/vets/:id` | Authenticated admin | Delete a partner.                       |

Partner records support name, type (`clinic` or `veterinarian`), image, city, state, phone, address, hours, specialty, CRMV registration, website, and description.

## Data model

Prisma maps the following models to PostgreSQL tables:

- **User** (`users`): unique email, bcrypt password hash, role (`user` or `admin`), optional contact/profile fields, and relations to owned pets, NGOs, and veterinary partners.
- **Pet** (`pets`): listing information and a required owner relation. Deleting a user cascades to their pets.
- **NGO** (`ngos`): organization/contact information and a required admin-user relation.
- **VetPartner** (`vet_partners`): provider/contact information and a required admin-user relation.

IDs are UUID strings. `createdAt` is set on creation and `updatedAt` is maintained by Prisma. NGO and veterinary partner owner relations restrict deletion of the related user while those records exist.

## Project layout

```text
src/
  configs/       # Authentication and upload configuration
  controllers/   # Request handlers and Prisma operations
  database/      # Prisma client
  middlewares/   # Authentication, admin authorization, and error handling
  providers/     # Disk storage helper
  routes/        # Express route registration
  types/         # Express request type augmentation
  utils/         # Application error type
  server.ts      # Express application setup and listener
prisma/
  schema.prisma  # PostgreSQL schema and Prisma models
```

TypeScript path alias `@/*` points to `src/*`; the build uses `tsc-alias` to rewrite those imports.

## Request handling and uploads

- `helmet` is enabled, with cross-origin resource policy set to `cross-origin`; CORS uses the package defaults.
- JSON and URL-encoded request bodies are limited to 10 MB.
- `express-async-errors` forwards rejected async route handlers to the global error middleware.
- The error middleware serializes application errors as `{ "message": "..." }`, Zod validation errors as a 400 response with `issues`, and other errors as 500 responses.
- Multer's pet routes accept up to five files under the multipart field name `photos`. Its configured disk destination is the project `tmp/` directory and it generates a random filename prefix.
- The server exposes the `tmp/uploads/` directory at `/uploads`. A `DiskStorage` helper can move a file from `tmp/` into that directory, but pet create/update handlers do not currently call this helper. File persistence and public image URLs therefore need additional integration.
- Upload configuration defines a 1 MiB size constant and JPEG/PNG MIME-type constants, but these are not wired into Multer's active upload options.

## Current implementation notes

Review these items before deploying beyond a local development environment:

- The JWT signing secret is currently hard-coded in `src/configs/auth.ts` instead of being read from an environment variable; replace it with a securely managed secret before deployment.
- Public registration accepts an optional `role` field, including `admin`. Admin accounts should not be assignable through public self-registration.
- The admin user-list handler returns Prisma user records without removing their password hashes.
- The Google sign-in handler returns the Prisma user object directly; for existing password-authenticated users, this includes the password hash.
- Zod validation is used in sessions, users, and pet handlers, but NGO and veterinary partner handlers do not currently validate request bodies with Zod.
- Public pet listing/detail handlers include the related user record; review which profile fields should be exposed by the API.

## License and contact

The `package.json` declares the ISC license.

**Mario Ohashi** · [LinkedIn](https://www.linkedin.com/in/marioohashi)
