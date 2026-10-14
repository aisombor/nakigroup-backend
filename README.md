# Naki Group Recruitment & Job Application Backend API

Backend API សរសេរដោយ **Node.js + Express** និង **PostgreSQL** សម្រាប់គ្រប់គ្រងប្រព័ន្ធជ្រើសរើសបុគ្គលិក (Recruitment / Careers), ការដាក់ពាក្យ និង Upload CV របស់បេក្ខជន, និងផ្ទាំងគ្រប់គ្រងសម្រាប់ HR Manager។

---

## 📁 រចនាសម្ព័ន្ធ Folder (Structure)

```text
backend/
├── .env                  # Environment Variables (Database password, Port, JWT Secret)
├── .env.example          # Template គំរូសម្រាប់ .env
├── .gitignore
├── package.json          # Node.js dependencies & scripts
├── README.md
└── src/
    ├── app.js            # Express app configuration & middlewares
    ├── server.js         # Entry point (port 5000)
    ├── config/
    │   ├── db.js         # PostgreSQL connection pool
    │   ├── schema.sql    # SQL Schema (tables: users, jobs, applications)
    │   └── initDb.js     # Script បង្កើត Table និង Seed ទិន្នន័យគំរូ
    ├── controllers/
    │   ├── authController.js        # HR Login & Profile
    │   ├── jobController.js         # Jobs CRUD
    │   └── applicationController.js # Apply Job, Upload CV & Download
    ├── middleware/
    │   ├── authMiddleware.js        # JWT Token Protection
    │   └── uploadMiddleware.js      # Multer File Upload (PDF/DOC/DOCX)
    ├── routes/
    │   ├── authRoutes.js
    │   ├── jobRoutes.js
    │   └── applicationRoutes.js
    └── uploads/
        └── cvs/          # កន្លែងរក្សាទុកឯកសារ CV ដែលបេក្ខជន Upload
```

---

## 🚀 របៀបដំឡើង និងដំណើរការ (Quick Start)

### ជំហានទី ១៖ បើក Terminal ហើយចូលទៅកាន់ folder backend
```bash
cd backend
```

### ជំហានទី ២៖ ដំឡើង Packages
```bash
npm install
```

### ជំហានទី ៣៖ កំណត់ព័ត៌មាន Database ក្នុង `.env`
បើក file `.env` រួចបញ្ចូល Password របស់ PostgreSQL របស់ប្រូ៖
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=naki_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here
JWT_SECRET=naki_group_secret_jwt_token_2026_xyz
```

> **ចំណាំ៖** មុននឹង Run ជំហានទី ៤ សូមប្រាកដថាប្រូបានបង្កើត Database ឈ្មោះ `naki_db` នៅក្នុង PostgreSQL (pgAdmin ឬ psql) រួចហើយ៖
> ```sql
> CREATE DATABASE naki_db;
> ```

### ជំហានទី ៤៖ បង្កើត Tables និងបញ្ចូលទិន្នន័យគំរូ
```bash
npm run init-db
```
ពាក្យបញ្ជានេះនឹងបង្កើត៖
- Table `users` + បង្កើតគណនី HR លំនាំដើម៖ Username: `admin` | Password: `admin123`
- Table `jobs` + បញ្ចូលការងារគំរូចំនួន ៣
- Table `applications`

### ជំហានទី ៥៖ បើកដំណើរការ Server (Development Mode)
```bash
npm run dev
```
Server នឹង Run នៅលើ **`http://localhost:5000`** 🎉

---

## 📡 API Endpoints

### 1. Public Endpoints (សម្រាប់ទំព័រ `careers.html` និងបេក្ខជន)
| Method | Endpoint | ការពិពណ៌នា |
|---|---|---|
| `GET` | `/api/health` | ពិនិត្យមើលស្ថានភាព Server និង Database |
| `GET` | `/api/jobs` | ទាញយកបញ្ជីការងារបើកចំហរទាំងអស់ |
| `GET` | `/api/jobs/:id` | មើលព័ត៌មានលម្អិតនៃការងារមួយ |
| `POST` | `/api/applications` | បេក្ខជនដាក់ពាក្យ + Upload ឯកសារ CV (multipart/form-data) |

### 2. HR / Admin Endpoints (ទាមទារ Bearer Token)
| Method | Endpoint | ការពិពណ៌នា |
|---|---|---|
| `POST` | `/api/auth/login` | HR Login ដើម្បីយក JWT Token |
| `GET` | `/api/auth/me` | មើលព័ត៌មានគណនី HR បច្ចុប្បន្ន |
| `GET` | `/api/jobs/admin/all` | មើលការងារទាំងអស់ + ចំនួនបេក្ខជនដែលបានដាក់ពាក្យ |
| `POST` | `/api/jobs` | បង្កើតការងារថ្មី |
| `PUT` | `/api/jobs/:id` | កែប្រែព័ត៌មានការងារ |
| `DELETE` | `/api/jobs/:id` | លុបការងារ |
| `GET` | `/api/applications` | មើលបញ្ជីពាក្យសុំទាំងអស់របស់បេក្ខជន |
| `GET` | `/api/applications/:id` | មើលពាក្យសុំ និងព័ត៌មានបេក្ខជន |
| `GET` | `/api/applications/:id/download-cv` | ទាញយក (Download) ឯកសារ CV របស់បេក្ខជន |
| `PATCH` | `/api/applications/:id/status` | ប្តូរ Status (`reviewed`, `shortlisted`, `rejected`) |
| `DELETE` | `/api/applications/:id` | លុបពាក្យសុំ និងឯកសារ CV ចេញពី Server |

