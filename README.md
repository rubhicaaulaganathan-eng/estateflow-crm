# EstateFlow CRM

EstateFlow CRM is a full-stack Real Estate Customer Relationship Management application built to manage leads, sales employees, properties, units, bookings, follow-ups, and sales information in one place.

The main goal of this project is to provide a simple CRM system where sales teams can manage customer leads, track their progress, assign leads to employees, manage available properties, and create bookings.

## 1. Features

### 1.1 Lead Management

1. Create new leads
2. Search and view leads
3. Assign leads to Sales Employees
4. Track lead stages
5. Add notes
6. Add follow-up dates

### 1.2 Lead Stages

1. New
2. Contacted
3. Site Visit
4. Interested
5. Negotiation
6. Booked
7. Lost

### 1.3 Property Management

1. Create and manage projects
2. Add buildings under projects
3. Add units under buildings
4. Store unit number, floor, type, price, and availability
5. Track available and booked units

### 1.4 Booking Management

1. Create bookings by connecting a lead with an available unit
2. Store booking amount and booking notes
3. Prevent the same unit from being booked at the same time
4. Update unit availability after booking
5. Cancel bookings and make the unit available again

### 1.5 Employee Management

1. Create Sales Employees
2. Manage Admin and Sales Employee roles
3. View employee information
4. Track assigned leads

### 1.6 Dashboard

The dashboard displays information from the database, including:

1. Total leads
2. Lead pipeline
3. Available units
4. Booked units
5. Confirmed bookings
6. Upcoming follow-ups
7. Recent leads
8. Recent bookings

## 2. Technology Used

### 2.1 Frontend

1. React
2. Vite
3. React Router
4. Tailwind CSS
5. Lucide React

### 2.2 Backend

1. Node.js
2. Express.js
3. PostgreSQL
4. JWT Authentication
5. bcrypt

### 2.3 Database

1. PostgreSQL

## 3. Project Structure

```text
estateflow-crm/
│
├── backend/
│   ├── middleware/
│   ├── routes/
│   ├── auth.js
│   ├── db.js
│   ├── seedAdmin.js
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   └── pages/
│   ├── package.json
│   └── vite.config.js
│
├── database/
│   └── schema.sql
│
├── .gitignore
└── README.md
```

## 4. Database Overview

The application uses PostgreSQL to store application data.

### 4.1 Employees

Stores Admin and Sales Employee accounts.

Main fields:

1. employee_id
2. full_name
3. email
4. password_hash
5. role
6. status

### 4.2 Projects

Stores real-estate projects.

Main fields:

1. project_id
2. project_name
3. location
4. description
5. status

### 4.3 Buildings

Stores buildings belonging to projects.

Main fields:

1. building_id
2. project_id
3. building_name
4. total_floors

### 4.4 Units

Stores individual property units.

Main fields:

1. unit_id
2. building_id
3. unit_number
4. floor_number
5. unit_type
6. price
7. status

### 4.5 Leads

Stores customer and prospect information.

Main fields:

1. lead_id
2. full_name
3. phone
4. email
5. project_id
6. assigned_employee_id
7. stage
8. notes
9. next_follow_up

### 4.6 Bookings

Stores booking information and connects a lead with a property unit.

Main fields:

1. booking_id
2. lead_id
3. unit_id
4. booking_amount
5. booked_by
6. status
7. notes

The database structure is available in:

```text
database/schema.sql
```

## 5. API Overview

The backend provides REST APIs for the frontend.

Base API:

```text
/api
```

### 5.1 Authentication

```text
POST /api/auth/login
GET  /api/auth/me
```

Used for employee login and authentication.

### 5.2 Projects

```text
GET    /api/projects
GET    /api/projects/:id
POST   /api/projects
PUT    /api/projects/:id
DELETE /api/projects/:id
```

### 5.3 Buildings

```text
GET  /api/buildings
POST /api/buildings
```

### 5.4 Units

```text
GET  /api/units
POST /api/units
```

### 5.5 Leads

```text
GET   /api/leads
POST  /api/leads
PATCH /api/leads/:id/assign
```

### 5.6 Bookings

```text
GET   /api/bookings
POST  /api/bookings
PATCH /api/bookings/:id/cancel
```

### 5.7 Employees

```text
GET  /api/employees
POST /api/employees
```

### 5.8 Health Check

```text
GET /api/health
```

This endpoint is used to check whether the backend and PostgreSQL database are connected.

## 6. Authentication and Roles

EstateFlow CRM supports two main roles.

### 6.1 Admin

The Admin can:

1. Manage employees
2. Manage projects
3. Manage buildings
4. Manage units
5. Assign leads to Sales Employees

### 6.2 Sales Employee

Sales Employees can:

1. Work with leads
2. Track lead stages
3. Add follow-up information
4. Create bookings based on the application permissions

Authentication is handled using JWT tokens, and passwords are stored using bcrypt hashing.

## 7. Booking Flow

The booking process follows this flow:

```text
Select Lead
    ↓
Select Available Unit
    ↓
Enter Booking Amount
    ↓
Create Booking
    ↓
Unit Status becomes BOOKED
    ↓
Booking is stored in PostgreSQL
    ↓
Dashboard reflects the updated data
```

### Booking Process

1. Select an existing lead
2. Select an available unit
3. Enter the booking amount
4. Submit the booking
5. Unit status is updated
6. Booking details are stored in PostgreSQL
7. Dashboard information is refreshed

The backend uses a database transaction and row locking when creating a booking so that the same available unit cannot be successfully booked twice at the same time.

## 8. Data Persistence

The application uses PostgreSQL as the source of stored application data.

For example, when a user creates a lead:

```text
React Frontend
      ↓
Express API
      ↓
PostgreSQL
```

The lead is stored in the database rather than being kept only in the frontend.

The same approach is used for:

1. Employees
2. Projects
3. Buildings
4. Units
5. Leads
6. Bookings

Therefore, application data remains available after refreshing the page.

## 9. Local Setup

### 9.1 Requirements

1. Node.js
2. PostgreSQL
3. Git

### 9.2 Clone the Repository

```bash
git clone https://github.com/rubhicaaulaganathan-eng/estateflow-crm.git
cd estateflow-crm
```

### 9.3 Install Backend Dependencies

```bash
cd backend
npm install
```

### 9.4 Configure Environment Variables

Create:

```text
backend/.env
```

Example:

```env
PORT=5000
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
```

The actual `.env` file should not be uploaded to GitHub.

### 9.5 Create the Database

Create a PostgreSQL database and run:

```text
database/schema.sql
```

This creates the required database structure.

### 9.6 Start the Backend

From the `backend` folder:

```bash
npm start
```

The backend will run locally on:

```text
http://localhost:5000
```

### 9.7 Install Frontend Dependencies

Open another terminal:

```bash
cd frontend
npm install
```

### 9.8 Start the Frontend

```bash
npm run dev
```

The frontend will run locally on:

```text
http://localhost:5173
```

## 10. Application Flow

```text
Login
  ↓
Dashboard
  ↓
Employees
  ↓
Projects
  ↓
Buildings
  ↓
Units
  ↓
Leads
  ↓
Lead Assignment
  ↓
Follow-ups and Lead Stages
  ↓
Bookings
  ↓
Dashboard Updates
```

### Step-by-step application flow

1. Login using an authorized employee account
2. Open the dashboard
3. Create or manage Sales Employees
4. Create a project
5. Add buildings under the project
6. Add units under buildings
7. Create leads
8. Assign leads to Sales Employees
9. Track lead stages and follow-ups
10. Create bookings using available units
11. Verify the updated information on the dashboard

## 11. Deployment

The final deployed application will use:

```text
Live Frontend
      ↓
Live Backend API
      ↓
Hosted PostgreSQL Database
```

This allows the application to be accessed through a browser without requiring the evaluator to run PostgreSQL or the backend locally.

### 11.1 Live Application

To be added after deployment.

### 11.2 Backend API

To be added after deployment.

## 12. Security

1. Passwords are hashed using bcrypt
2. Protected APIs use JWT authentication
3. Role-based authorization is used for restricted operations
4. Database credentials and secrets are stored using environment variables
5. `.env` files are excluded from GitHub

## 13. Data and Database Testing

The application can be tested through the live interface.

An evaluator can:

1. Add a new employee
2. Add a project
3. Add a building
4. Add a unit
5. Add a lead
6. Assign the lead
7. Add follow-up details
8. Create a booking
9. Refresh the application
10. Verify that the data is still available

The application uses the hosted PostgreSQL database in the deployed environment, so newly created records are persisted in the database.

## 14. Author

**Rubhicaa U**

GitHub:

https://github.com/rubhicaaulaganathan-eng

