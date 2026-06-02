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
- `GET /api/addresses`: lists addresses from the Swagger contract. Supports `parentId` and `tenDiaDanh`.
- `POST /api/addresses`: creates an address from the Swagger contract.
- `GET /api/households`: lists households from the Swagger contract. Supports `addressId` and `tenChuHo`.
- `GET /api/household-members`: lists household members from the Swagger contract. Supports `householdId` and `personId`.
- `GET /api/tntt`: lists TNTT units from the Swagger contract. Supports `addressLevelId`.
- `GET /api/tntt/class`: lists TNTT classes from the Swagger contract. Supports `xuDoanId`, `nienHocId`, and `nganh`.
- `GET /api/tntt/class-member`: lists TNTT class members from the Swagger contract. Supports `classId` and `personId`.
- `GET /api/:resource`: lists a protected database resource.
- `GET /api/:resource/:id`: gets one resource row by primary key.
- `POST /api/:resource`: creates one resource row.
- `PUT/PATCH /api/:resource/:id`: updates one resource row.
- `DELETE /api/:resource/:id`: soft deletes one resource row. Add `?hard=true` for hard delete.

Supported resources:

- `address` / `addresses`
- `baptismal_name` / `baptismal_names`
- `class` / `classes`
- `class_member` / `class_members`
- `diem_danh`
- `giao_ly_vien`
- `household` / `households`
- `household_member` / `household_members`
- `linh_muc_doan`
- `nien_hoc`
- `person` / `persons` / `people`
- `role` / `roles`
- `tntt`
- `user` / `users`
- `user_role` / `user_roles`

List endpoints support `limit`, `offset`, `sortBy`, `sortDir`, `includeDeleted=true`, and exact-match filters for any column, for example `/api/person?gioi_tinh=1&limit=20`.

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
