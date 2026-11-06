# SmartAttend – Smart Classroom Attendance System

SmartAttend is a web-based attendance management system designed to simplify the process of recording and managing classroom attendance.

In a traditional classroom, teachers often spend valuable time taking attendance manually. SmartAttend aims to reduce this effort by using facial recognition to assist with attendance marking. Teachers can create classrooms, manage student enrollments, start attendance sessions, and upload classroom photos for recognition.

The system also provides separate dashboards for teachers and students, making attendance information easier to access and manage.

## Features

### Teacher Portal
- Teacher registration and login.
- Create and manage classrooms.
- Add students to classrooms through classroom joining.
- Start attendance sessions for individual classrooms.
- Upload classroom photos for facial recognition.
- View attendance records with student names and attendance statuses.
- Manually review or correct attendance records.
- Finalize attendance sessions.
- View attendance summaries and dashboard statistics.

### Student Portal
- Student registration and login.
- Biometric face registration with consent.
- Join classrooms using the classroom joining process.
- View personal attendance history.
- Check attendance status across enrolled classrooms.

### Attendance Recognition
- Face detection using OpenCV's YuNet model.
- Face recognition using the SFace model.
- Compare detected faces with registered student face representations.
- Use similarity thresholds to identify potential matches.
- Mark recognized students as present.
- Keep uncertain or unmatched cases available for review.
- Create attendance records for enrolled students who were not detected.

## Technology Stack

| Area | Technologies |
|---|---|
| Frontend | Next.js, React, JavaScript |
| Styling | Tailwind CSS |
| Backend | Python, FastAPI |
| Database | PostgreSQL (Supabase) |
| ORM | SQLAlchemy |
| Database Migrations | Alembic |
| Authentication | JWT-based authentication |
| Face Detection | OpenCV YuNet |
| Face Recognition | OpenCV SFace |
| Deployment | Vercel, Render |

## How It Works

The application follows a classroom-based attendance workflow.

1. **Account Registration:** Teachers and students create accounts and log in to their respective portals.
2. **Biometric Registration:** Students register their facial data after providing consent.
3. **Classroom Creation:** Teachers create classrooms and share the joining process with students.
4. **Student Enrollment:** Students join the appropriate classroom.
5. **Attendance Session:** The teacher starts an attendance session for a selected classroom.
6. **Photo Upload:** The teacher uploads a classroom photograph.
7. **Face Recognition:** The backend detects faces and compares them with registered student face representations.
8. **Attendance Processing:** Recognized students are marked present, while unmatched or uncertain cases remain available for review.
9. **Review and Finalization:** Teachers can manually correct attendance records and finalize the session.
10. **Attendance History:** Students and teachers can view the relevant attendance information through their dashboards.

## Application Architecture

SmartAttend uses a separate frontend and backend.

- **Frontend:** The Next.js application handles user interaction, authentication flows, dashboards, classroom management, and attendance records.
- **Backend:** FastAPI provides the REST API, handles authentication, manages classroom and attendance operations, and connects the application to the recognition service.
- **Database:** PostgreSQL stores user accounts, teacher and student profiles, classrooms, enrollments, biometric profiles, attendance sessions, and attendance records.
- **Recognition Service:** OpenCV-based models process uploaded classroom images and compare detected faces against registered biometric representations.

## Face Recognition Approach

SmartAttend uses two OpenCV models for its facial recognition workflow:

**1. YuNet – Face Detection**

YuNet is used to detect faces in an uploaded classroom image.

**2. SFace – Face Recognition**

SFace is used to generate and compare facial representations to identify potential student matches.

The recognition service returns matching information and similarity scores. The attendance service applies configurable thresholds before marking a student as present.

Uncertain matches are not automatically treated as confirmed attendance. They can be reviewed by the teacher.

> The current matching thresholds are provisional and intended for testing. Recognition accuracy must be evaluated further before using the system for consequential attendance decisions.

## Project Links

- **Live Application:** [SmartAttend](https://make-me-present.vercel.app/)
- **Backend API:** [SmartAttend API](https://smart-attend-5uuw.onrender.com)
- **API Documentation:** [FastAPI Swagger UI](https://smart-attend-5uuw.onrender.com/docs)
- **GitHub Repository:** [SmartAttend](https://github.com/SmithKadu09/smart-attend)

## Local Setup

Follow these steps to run the project locally.

### Prerequisites

Make sure you have the following installed:

- Node.js and npm
- Python 3.11
- PostgreSQL database or a Supabase PostgreSQL project
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/SmithKadu09/smart-attend.git
cd smart-attend
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create and activate a virtual environment.

**Windows:**

```powershell
python -m venv smartattend
smartattend\Scripts\activate
```

Install the backend dependencies:

```bash
pip install -r requirements.txt
```

Configure the required environment variables for your database connection, authentication, and other backend settings.

Run database migrations:

```bash
alembic upgrade head
```

Start the FastAPI development server:

```bash
uvicorn app.main:app --reload
```

The backend API will be available at:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

### 3. Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install the dependencies:

```bash
npm install
```

Configure the frontend environment variable:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:3000
```

**Note:** Configure the environment variables according to the actual settings used in the backend and frontend. Keep database credentials, JWT secrets, and other private keys out of the repository.

## Current Development Status

SmartAttend has working implementations of its core authentication, classroom, enrollment, and attendance workflows. The teacher and student portals are connected to the backend, and the facial recognition pipeline has been integrated into the attendance process.

The project is still under development. Recognition thresholds, accuracy, performance, and handling of difficult classroom images require further testing.

## Future Improvements

- Improve recognition accuracy in different lighting conditions and classroom environments.
- Evaluate recognition performance with larger groups of students.
- Improve handling of overlapping faces and partially visible faces.
- Add more detailed attendance analytics and reports.
- Improve the attendance review workflow.
- Strengthen biometric data protection and privacy controls.
- Add automated testing for important attendance workflows.

## Privacy and Security

SmartAttend works with facial biometric data, so privacy and security are important considerations.

The application includes consent-based biometric registration and authenticated access to its portals. Further work is required to strengthen biometric data protection, access controls, retention policies, and overall security before broader deployment.

## Author

**Smith Kadu**

BCA Student | GH Raisoni Skill Tech University

[GitHub](https://github.com/SmithKadu09)

---

SmartAttend is an academic project developed to explore the practical use of web technologies, database management, and computer vision in classroom attendance management.