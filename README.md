# bndc-pms-be

Express API base for calling Turso/libSQL from Vercel.

## Environment

Copy `.env.example` to `.env` for local development, and set the same values in Vercel Project Settings.

Required in production:

- `API_KEY`: current bearer value. Existing clients can call with `Authorization: Bearer <API_KEY>`.
- `JWT_SECRET`: secret used to sign and verify JWTs.
- `TURSO_DATABASE_URL`: Turso database URL, for example `libsql://...turso.io`.
- `TURSO_AUTH_TOKEN`: Turso database token.

Optional:

- `JWT_EXPIRES_IN`: access token lifetime, default `15m`.
- `JWT_REFRESH_EXPIRES_IN`: refresh token lifetime, default `30d`.
- `AUTH_ROLE`: role claim for login JWTs, default `admin`.
- `AUTH_COOKIE_NAME`: HttpOnly auth cookie name, default `access_token`.
- `AUTH_REFRESH_COOKIE_NAME`: HttpOnly refresh cookie name, default `refresh_token`.
- `ACCOUNT_PASSWORD_SALT_ROUNDS`: bcrypt salt rounds for account passwords, default `12`.
- `CORS_ORIGIN`: `*` or comma-separated origins.
- `ALLOW_WRITE_SQL`: default `false`. When false, `/api/db/query` only accepts `SELECT`, `WITH`, and `PRAGMA`.

## Run

```bash
npm install
npm run dev
```

## Vercel

After deploying, open `/api/health/config`.

If `configured` is `false`, set every key in `missingEnv` in Vercel Project Settings, then redeploy. Missing env vars should not crash the whole function; protected auth/database routes will return JSON errors until configured.

## Routes

- `GET /`: service info.
- `GET /api/health`: service health.
- `GET /api/health/config`: shows whether required Vercel env vars are configured.
- `GET /api/health/db`: checks Turso with `select 1 as healthy`.
- `POST /api/account`: creates a user account with bcrypt password hash. Body: `{ "username": "...", "password": "...", "addressId": "...", "createdBy": "..." }`.
- `POST /api/auth/login`: exchanges `{ "username": "...", "password": "..." }` for a JWT and sets an HttpOnly cookie.
- `POST /api/auth/token`: exchanges `Authorization: Bearer <API_KEY>` or `{ "apiKey": "..." }` for a JWT.
- `GET /api/auth/me`: validates API key, JWT bearer, or login cookie.
- `POST /api/db/query`: protected SQL endpoint.
- `PUT /api/address`: creates or updates an address. Body: `{ "id": "...", "tenDiaDanh": "...", "capBac": 1, "idParent": "...", "tenVietTat": "AB" }`. Use `id` to identify the address when editing; if `id` is missing or not found, it creates a new address.
- `GET /api/addresses`: lists addresses from the Swagger contract. Supports `parentId`, `cap_bac`, `tenDiaDanh`, and `q`.
- `POST /api/addresses`: creates an address from the Swagger contract.
- `GET /api/households`: lists households from the Swagger contract. Supports `addressId`, `tenChuHo`, and `q`.
- `GET /api/household-members`: lists household members from the Swagger contract. Supports `householdId`, `personId`, and `q`.
- `GET /api/nienhoc`: lists school years from the Swagger contract. Supports `q`.
- `POST /api/nienhoc`: creates a school year from the Swagger contract.
- `GET /api/person`: finds people from the Swagger contract. Supports `q`.
- `GET /api/tntt`: lists TNTT units from the Swagger contract. Supports `addressLevelId` and `q`.
- `GET /api/tntt/class`: lists TNTT classes from the Swagger contract. Supports `xuDoanId`, `nienHocId`, `nganh`, and `q`.
- `GET /api/tntt/class-member`: lists TNTT class members from the Swagger contract. Supports `classId`, `personId`, and `q`.

List/search endpoints return paged results:

```json
{
  "total": 42,
  "page": 1,
  "limit": 20,
  "offset": 0,
  "items": []
}
```

They support `page`, `limit`, `offset`, and endpoint-specific filters, for example `/api/addresses?parentId=abc&limit=20`.

## Structure

- `src/routes`: endpoint definitions only.
- `src/controllers`: HTTP request/response orchestration.
- `src/services`: reusable business logic for auth and database calls.
- `src/middleware`: Express middleware.
- `src/validators`: request validation and normalization.
- `src/utils`: small reusable helpers.

## Examples

Use the current API key bearer:

```bash
curl -X POST http://localhost:3000/api/db/query \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"sql\":\"select * from users limit ?\",\"args\":[10]}"
```

Exchange API key for JWT:

```bash
curl -X POST http://localhost:3000/api/auth/token \
  -H "Authorization: Bearer $API_KEY"
```

Login with username/password:

```bash
curl -i -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"demo\",\"password\":\"secret\"}"
```

Then use the returned JWT:

```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <JWT>"
```
