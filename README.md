# Stylish

A mock backend system for a fashion e-commerce platform.  
Built with **Node.js**, **MySQL**, **Docker**, **Redis**, and **AWS S3**.

## Project Overview

**Stylish** is a backend system simulating the core features of a fashion e-commerce platform. It supports:

- User registration, login, and authentication
- Product browsing and categorization
- Order processing and transaction handling
- Comprehensive API documentation via Swagger
- Redis caching for performance optimization
- AWS S3 for storing product images
- Automated deployment pipeline and Nginx-based server with SSL


## Tech Stack

- **Backend Framework**: Node.js + Express  
- **Database**: MySQL  
- **API Documentation**: Swagger  
- **Caching**: Redis  
- **File Storage**: AWS S3  
- **Deployment & CI/CD**: Docker, GitHub Actions, Nginx + SSL  



## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/stylish-backend.git
cd stylish-backend
```

### 2. Create a `.env` file

```env
PORT=3000
DB_HOST=your_mysql_host
DB_USER=your_mysql_user
DB_PASSWORD=your_password
DB_NAME=stylish
REDIS_URL=redis://localhost:6379
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret
S3_BUCKET_NAME=your_bucket_name
JWT_SECRET=your_jwt_secret
```

### 3. Start the application (with Docker Compose)

```bash
docker-compose up --build
```

The backend API will be running at `http://localhost:3000`.

### 4. Access Swagger API Docs

Open your browser and go to:

```
http://localhost:3000/docs
```
