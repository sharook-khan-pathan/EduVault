# EduVault - College Academic Material Management System

A full-stack web application that replaces WhatsApp-based material sharing with a structured, role-based academic repository.

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 18, Tailwind CSS, React Router v6, Axios |
| Backend    | Java 17, Spring Boot 3.2, Spring Security, JWT |
| Database   | MySQL 8+                                |
| Storage    | Local filesystem (S3-ready architecture)|

---

## Project Structure

```
CollegeProject/
├── backend/
│   └── src/main/java/com/college/cms/
│       ├── config/          # SecurityConfig, DataInitializer
│       ├── controller/      # REST controllers
│       ├── dto/             # Request/Response DTOs
│       ├── entity/          # JPA entities
│       ├── exception/       # Global exception handler
│       ├── repository/      # Spring Data JPA repos
│       ├── security/        # JWT utils, filters, UserDetails
│       ├── service/         # Business logic
│       └── storage/         # StorageService (local/S3)
├── frontend/
│   └── src/
│       ├── api/             # Axios instance + service functions
│       ├── components/      # Reusable UI components
│       ├── context/         # Auth + Theme context
│       ├── pages/           # All page components
│       └── utils/           # Helper functions
└── database/
    └── schema.sql           # MySQL schema
```

---

## Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8+
- Maven 3.8+

---

### 1. Database Setup

```sql
CREATE DATABASE college_cms;
```

Or run the schema file:
```bash
mysql -u root -p < database/schema.sql
```

---

### 2. Backend Setup

```bash
cd backend
```

Edit `src/main/resources/application.properties`:
```properties
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

Run:
```bash
mvn spring-boot:run
```

Backend starts at: `http://localhost:8080`

On first run, sample data is auto-seeded:
| Role    | Username  | Password    |
|---------|-----------|-------------|
| Admin   | admin     | admin123    |
| Faculty | faculty1  | faculty123  |
| Student | student1  | student123  |

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend starts at: `http://localhost:3000`

---

## REST API Endpoints

### Authentication
| Method | Endpoint            | Description        | Auth |
|--------|---------------------|--------------------|------|
| POST   | /api/auth/login     | Login              | No   |
| POST   | /api/auth/register  | Student register   | No   |

### Admin
| Method | Endpoint                                      | Description           |
|--------|-----------------------------------------------|-----------------------|
| GET    | /api/admin/dashboard                          | System stats          |
| GET    | /api/admin/departments                        | List departments      |
| POST   | /api/admin/departments                        | Create department     |
| PUT    | /api/admin/departments/{id}                   | Update department     |
| DELETE | /api/admin/departments/{id}                   | Delete department     |
| GET    | /api/admin/courses                            | List courses          |
| POST   | /api/admin/courses                            | Create course         |
| GET    | /api/admin/subjects                           | List subjects         |
| POST   | /api/admin/subjects                           | Create subject        |
| PUT    | /api/admin/subjects/{id}/assign-faculty/{fid} | Assign faculty        |
| POST   | /api/admin/users                              | Create user           |
| GET    | /api/admin/users/students                     | List students         |
| GET    | /api/admin/users/faculty                      | List faculty          |
| PUT    | /api/admin/users/{id}/toggle-status           | Toggle active status  |
| DELETE | /api/admin/users/{id}                         | Delete user           |

### Subjects
| Method | Endpoint                                    | Description                  |
|--------|---------------------------------------------|------------------------------|
| GET    | /api/subjects                               | All subjects                 |
| GET    | /api/subjects/{id}                          | Subject by ID                |
| GET    | /api/subjects/course/{courseId}             | Subjects by course           |
| GET    | /api/subjects/course/{id}/semester/{sem}    | Filter by course + semester  |
| GET    | /api/subjects/my-subjects                   | Faculty's assigned subjects  |

### Materials
| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| POST   | /api/materials/upload           | Upload file (multipart)  |
| GET    | /api/materials/subject/{id}     | Materials by subject     |
| GET    | /api/materials/search?query=    | Search materials         |
| GET    | /api/materials/recent           | Recently uploaded        |
| GET    | /api/materials/{id}             | Material by ID           |
| GET    | /api/materials/download/{id}    | Download file            |
| PUT    | /api/materials/{id}             | Update material metadata |
| DELETE | /api/materials/{id}             | Delete material          |

### Announcements
| Method | Endpoint                              | Description              |
|--------|---------------------------------------|--------------------------|
| POST   | /api/announcements                    | Post announcement        |
| GET    | /api/announcements                    | All announcements        |
| GET    | /api/announcements/department/{deptId}| Dept announcements       |
| DELETE | /api/announcements/{id}               | Delete announcement      |

---

## JWT Authentication Flow

```
1. POST /api/auth/login  →  { username, password }
2. Server validates credentials
3. Returns JWT token (24h expiry)
4. Client stores token in localStorage
5. All subsequent requests: Authorization: Bearer <token>
6. JwtAuthFilter validates token on every request
7. Role-based access enforced via @PreAuthorize
```

---

## File Upload Flow

```
1. Faculty selects file (PDF/PPT/DOC, max 50MB)
2. POST /api/materials/upload (multipart/form-data)
3. LocalStorageService stores file at:
   uploads/dept-{id}/sem-{n}/subject-{id}/{uuid}.ext
4. File metadata saved to materials table
5. Download via GET /api/materials/download/{id}
   → increments download_count
   → streams file with Content-Disposition header
```

---

## Deployment

### Recommended free hosting setup
- Frontend: Vercel or Netlify
- Backend: Railway or Fly.io
- Database: Railway MySQL plugin or PlanetScale (MySQL-compatible)

### Frontend deployment
1. In `frontend`, create `.env` from `.env.example`
2. Set `REACT_APP_API_BASE_URL=https://<your-backend-url>/api`
3. Run:
   ```bash
   cd frontend
   npm install
   npm run build
   ```
4. Deploy the generated `build` folder to Vercel or Netlify.

### Backend deployment
1. In `backend`, create `.env` from `.env.example`
2. Set database and JWT values to the hosted service credentials
3. Build or run with Maven:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```
4. On Railway, set these env vars:
   - `SPRING_DATASOURCE_URL`
   - `SPRING_DATASOURCE_USERNAME`
   - `SPRING_DATASOURCE_PASSWORD`
   - `APP_JWT_SECRET`
   - `APP_UPLOAD_DIR=./uploads`
   - `APP_CORS_ALLOWED_ORIGINS=https://<your-frontend-url>`

### Notes
- The backend currently stores uploads in the local filesystem.
- Free hosts may not persist uploaded files permanently.
- For public testing, this is fine, but for production use consider cloud storage.

## Switching to AWS S3

The storage layer is abstracted via `StorageService` interface.
To use S3:

1. Add AWS SDK dependency to pom.xml:
```xml
<dependency>
    <groupId>software.amazon.awssdk</groupId>
    <artifactId>s3</artifactId>
    <version>2.21.0</version>
</dependency>
```

2. Create `S3StorageService implements StorageService` with `@Primary`
3. Add to application.properties:
```properties
aws.s3.bucket=your-bucket-name
aws.s3.region=ap-south-1
```

---

## User Roles & Permissions

| Feature              | Admin | Faculty | Student |
|----------------------|-------|---------|---------|
| Manage departments   | ✅    | ❌      | ❌      |
| Manage courses       | ✅    | ❌      | ❌      |
| Manage subjects      | ✅    | ❌      | ❌      |
| Create user accounts | ✅    | ❌      | ❌      |
| Upload materials     | ✅    | ✅      | ❌      |
| Edit own materials   | ✅    | ✅      | ❌      |
| Delete any material  | ✅    | ❌      | ❌      |
| Post announcements   | ✅    | ✅      | ❌      |
| Browse materials     | ✅    | ✅      | ✅      |
| Download materials   | ✅    | ✅      | ✅      |
| Search materials     | ✅    | ✅      | ✅      |

---

## Environment Variables

### Backend (application.properties)
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/college_cms
spring.datasource.username=root
spring.datasource.password=root
app.jwt.secret=<64-char-hex-string>
app.jwt.expiration=86400000
app.upload.dir=./uploads
app.cors.allowed-origins=http://localhost:3000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:8080
```

---

## Deployment

### Backend (JAR)
```bash
cd backend
mvn clean package -DskipTests
java -jar target/cms-1.0.0.jar
```

### Frontend (Build)
```bash
cd frontend
npm run build
# Serve build/ with nginx or any static server
```

### Docker (optional)
```dockerfile
# Backend
FROM eclipse-temurin:17-jre
COPY target/cms-1.0.0.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]

# Frontend
FROM node:18-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
```

---

## Features Summary

- JWT-secured login with role-based dashboards
- Admin: full CRUD for departments, courses, subjects, users
- Faculty: upload/edit/delete materials, post announcements
- Student: browse by dept/course/semester, search, download
- Download count tracking per material
- Dark/light mode toggle
- Mobile-responsive sidebar layout
- Toast notifications + loading states
- Global exception handling with proper HTTP codes
- Pagination on all list endpoints
- S3-ready storage abstraction
