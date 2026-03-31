# MERN Student Portal Platform

Full-stack Student Portal with JWT auth, RBAC, student profile management, and admin dashboard.

## Tech Stack

- Backend: Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs
- Frontend: React.js, React Router, Tailwind CSS, Context API, Axios

## Project Structure

```text
backend/
  config/
  controllers/
  middleware/
  models/
  routes/
frontend/
  src/
    components/
    context/
    pages/
    services/
    utils/
```

## Backend Setup

1. Open `backend/.env.example`, copy it to `.env`, and fill values.
2. Install dependencies:
   - `cd backend`
   - `npm install`
3. Run server:
   - `npm run dev`

Backend runs on `http://localhost:5000`.

## Frontend Setup

1. Open `frontend/.env.example`, copy it to `.env`.
2. Install dependencies:
   - `cd frontend`
   - `npm install`
3. Run app:
   - `npm run dev`

Frontend runs on `http://localhost:5173`.

## Run with Docker (One Command)

From project root:

- `docker compose up --build`

Services:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- MongoDB: `mongodb://localhost:27017/student_portal`

Stop:

- `docker compose down`

Stop + remove DB volume:

- `docker compose down -v`

## API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Students

- `GET /api/students` (admin only)
- `GET /api/students/:id` (admin or profile owner)
- `POST /api/students` (student/admin)
- `PUT /api/students/:id` (admin or profile owner)
- `DELETE /api/students/:id` (admin only)

## Postman Examples

### Register (Student)

`POST http://localhost:5000/api/auth/register`

```json
{
  "name": "Varun Student",
  "email": "varun.student@example.com",
  "password": "Password123",
  "role": "student"
}
```

### Register (Admin)

`POST http://localhost:5000/api/auth/register`

```json
{
  "name": "Varun Admin",
  "email": "varun.admin@example.com",
  "password": "Password123",
  "role": "admin"
}
```

### Login

`POST http://localhost:5000/api/auth/login`

```json
{
  "email": "varun.student@example.com",
  "password": "Password123"
}
```

Use the `token` from response in Authorization header:

`Authorization: Bearer <JWT_TOKEN>`

### Create Student Profile

`POST http://localhost:5000/api/students`

```json
{
  "class": "B.Tech CSE",
  "gender": "male",
  "skills": ["React", "Node.js", "MongoDB"],
  "certifications": ["https://example.com/cert1"],
  "hackathons": ["https://example.com/hackathon1"]
}
```

### Get All Students (Admin)

`GET http://localhost:5000/api/students`

### Get Student by ID

`GET http://localhost:5000/api/students/<profileId-or-userId>`

### Update Student Profile

`PUT http://localhost:5000/api/students/<profileId>`

```json
{
  "class": "B.Tech AI",
  "skills": ["React", "Express", "Tailwind CSS"]
}
```

### Delete Student Profile (Admin)

`DELETE http://localhost:5000/api/students/<profileId>`

## Deployment Notes

- Backend: deploy on Render
- Frontend: deploy on Vercel
- Database: MongoDB Atlas
- Set production environment variables on hosting platforms
