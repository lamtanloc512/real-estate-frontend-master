# Real Estate Management System
## 📄 Description
### This project is a Real Estate Management System that includes a backend (Spring Boot, Java) and frontend (Node.js, Express, EJS, Bootstrap).

## 🧱 Project Structure

### Backend (Spring Boot, Java)

Located in real-estate-backend/.

Folder Structure:

```bash
real-estate-backend/
├── src/
│   ├── main/java/com/devcamp/real_estate_backend/
│   │   ├── auth/
│   │   │   ├── controller/
│   │   │   ├── dto/
│   │   │   ├── entity/
│   │   │   ├── repository/
│   │   │   ├── security/
│   │   │   ├── service/
│   │   ├── controller/
│   │   ├── model/
│   │   ├── repository/
│   │   ├── service/
│   │   ├── specification/
│   │   ├── RealEstateBackendApplication.java
│   │   ├── ServletInitializer.java
│   ├── resources/
│   │   ├── static/
│   │   ├── templates/
│   │   │   ├── project_realestate_db.sql
│   │   ├── application.properties
├── pom.xml (Maven dependencies)

```

### Frontend (Node.js, Express, EJS)

Located in real-estate-frontend/.

Folder Structure:

```bash
real-estate-frontend/
├── adminviews/
│   ├── dist/ (adminLTE)
│   ├── partials/ (EJS templates)
│   ├── plugins/ (adminLTE)
│   ├── src/ (Javascripts)
│   ├── styles/
│   ├── admin-login.ejs
│   ├── customer.ejs
│   ├── employee.ejs
│   ├── user-properties.ejs
│   ├── project.ejs
│   ├── property.ejs
│   ├── user-properties.ejs
│   ├── ......
├── public/
│   ├── css/
│   ├── images/
│   ├── js/ (common JS functions)
├── routes/ (router)
├── src/
│   ├── js/
│   ├── styles/ (User page's styles)
├── views/
│   ├── partials/ (EJS templates)
│   ├── user/ (User pages)
│   ├── about.ejs
│   ├── add-property.ejs
│   ├── contact-us.ejs
│   ├── property-detail.ejs
│   ├── realestate.ejs
├── app.js (Main Express server)
├── package.json (Node dependencies)

```

## 🧱Technology
### Backend (Real Estate API): 
- **Programming Language:** Java 17
- **Framework:** Spring Boot
- **Security:** Spring Security, JWT Authentication
- **Database:** MySQL
- **ORM:** Hibernate (JPA)
- **Build Tool:** Maven
- **Dependency Management:** Spring Boot Starter
- **Validation:** Spring Boot Validation
### Frontend (Real Estate Web App):
- **Programming Language:** JavaScript (ES6)
- **Framework:** Node.js
- **Templating Engine:** EJS
- **Styling:** Bootstrap, SCSS
- **AJAX Handling:** jQuery
- **Routing:** Express.js
- **AdminLTE**

## 🚀 Installation & Setup

### Backend Setup (Spring Boot)

- **Prerequisites:**
    + Java 17+
    + Maven
    + MySQL (or any compatible database)

#### Setup Steps:
1. Clone the repository:
``` bash 
git clone git@gitlab.com:devcamp120.j2465/exercise/ngatk/task-83-finalproject1.02.12/real-estate-backend.git
```
2. Configure the database in application.properties
``` bash
spring.datasource.url=jdbc:mysql://localhost:3306/realestate_db
spring.datasource.username=root
spring.datasource.password=yourpassword
```

 3. Run the application:
``` bash
mvn clean install
mvn spring-boot:run
```
### Frontend Setup (Node.js & Express)

- **Prerequisites:**
    + Node.js 16+
    + npm

#### Setup Steps:
1. Clone the repository:
``` bash 
git clone git@gitlab.com:devcamp120.j2465/exercise/ngatk/task-83-finalproject1.02.12/real-estate-frontend.git
cd real-estate-frontend
```
2. Install dependencies:
``` bash 
npm install
```
3. Run the application: Generate CSS then run the application:
```bash
npm build-sass
npm start
```
## 🔐 API Endpoints

### User Authentication

- POST /auth/register - Register a new user
- POST /api/v1/user/login - User login
- POST /api/v1/auth/reset-password/user - Reset user password
- POST /api/v1/auth/reset-password/employee - Reset employee password
- POST /api/v1/user/logout - Logout

### User & Employee Management

- GET /api/v1/user - Get all users
- GET /api/v1/employees - Get all employees
- GET /api/v1/user/{id} - Get user by ID
- GET /api/v1/employee/{id} - Get employee by ID

### Real Estate Management

- GET /api/v1/realestate - Get all properties
- GET /api/v1/realestate/{id} - Get property by ID
- POST /api/v1/realestate - Create a new property
- PUT /api/v1/realestate/{id} - Update property details
- DELETE /api/v1/realestate/{id} - Delete a property
- GET /api/v1/realestate/filter?{conditions} - Filter properties by conditions

## ✨Features
### Backend
- Authentication & Authorization (JWT-based security for users and employees)
- User Management (Registration, login, role-based access control)
- Property Management (CRUD operations for properties, filtering, sorting)
- Employee Management (Handling admin functionalities)
- Database Integration (MySQL with JPA/Hibernate)
### Frontend
- User & Admin Dashboards
- Property Listings & Management
- User Authentication & Profile Management
- Responsive UI with Bootstrap & SCSS
- Dynamic Content Rendering with EJS

## 🌼 Screenshots
### User Dashboard
+ *Login page*
![Login](/public/images/login.png)
+ *Register page*
![Register user](/public/images/register.png)
+ *Property filter page*
![Property list](/public/images/property.png)
+ *Add Property page*
![Add Property](/public/images/addproperty.png)
+ *Contact us page*
![Contact Us](/public/images/contact.png)
### Admin Dashboard
+ *LogProperty Management page*
![Property Management](/public/images/propertymng.png)
+ *Property Approval page*
![Property Approval](/public/images/propertyapprove.png)
+ *User List page*
![User list](/public/images/user.png)
+ *User's Properties page*
![User Property](/public/images/userproperty.png)