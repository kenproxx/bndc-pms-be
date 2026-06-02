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

- `JWT_EXPIRES_IN`: default `7d`.
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
- `POST /api/auth/token`: exchanges `Authorization: Bearer <API_KEY>` or `{ "apiKey": "..." }` for a JWT.
- `GET /api/auth/me`: validates API key or JWT bearer.
- `POST /api/db/query`: protected SQL endpoint.

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

Then use the returned JWT:

```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <JWT>"
```
