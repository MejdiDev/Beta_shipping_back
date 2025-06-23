# General Introduction

Access to efficient logistics and supply chain management is essential for companies involved in international trade. Freight forwarding companies, such as DocFlow, play a key role in ensuring the smooth movement of goods across borders. However, many of these companies still rely on manual processes, fragmented communication, and paper-based documentation, which can cause delays and reduce client satisfaction.

This end-of-studies project, completed at DocFlow, aims to solve these problems by developing a web application that digitizes and centralizes the company’s main operations. The application is designed to improve document management, provide real-time shipment tracking, and facilitate communication between the company and its clients. The project uses modern web technologies and follows the Agile Scrum methodology to ensure continuous improvement and alignment with the company’s needs.

The following chapters will present the context, objectives, methodology, and technical implementation of the project.

---

# Chapter 1: Context of the Project

## 1.1 Introduction

This chapter introduces the project, the host organization, the problems identified in its current operations, and the proposed digital solution. It also describes the development methodology and technical environment used for the project.

## 1.2 Presentation of the Host Organization

### 1.2.1 Host Organization

DocFlow is a young freight forwarding company based in Montplaisir, Tunis. Despite being new in the market, DocFlow has quickly gained important clients and manages many shipments through different ports. The company has a small team of six employees, including a manager, three sales agents, a financial officer, and an operations officer. As an intern, I contributed to both sales and business development.

### 1.2.2 Areas of Activity

DocFlow’s main activities include international import and export coordination, customs clearance, cargo management, truck reservations, and communication with port authorities and logistics partners. The company’s main goal is to manage all necessary documentation and logistics after securing freight, ensuring timely and efficient delivery for its clients.

## 1.3 Project Presentation

### 1.3.1 Project Framework

This project was carried out as part of my final-year academic requirements at Esprit Business School and as a professional internship at DocFlow. The main objective is to design and implement a web application that addresses real operational needs and applies the theoretical knowledge gained during my studies.

### 1.3.2 Study of the Existing Situation

Currently, DocFlow relies on manual processes, especially for document management and client communication. File storage is fragmented, making it difficult for staff and clients to access important shipment documents. The lack of a centralized digital system leads to inefficiencies, delays, and frequent client inquiries about shipment status.

### 1.3.3 Problematic

The main problems identified are:

*   Manual processes for document handling and client updates.
*   Disorganized documentation due to the absence of a centralized digital repository.
*   Limited traceability, as clients do not have real-time access to their shipment information.
*   Communication gaps between the company and its clients, as well as internally.

### 1.3.4 Proposed Solution

To solve these problems, the project proposes a web application that will:

*   Automate key workflows, such as cargo booking, document management, and truck reservations.
*   Provide clients with secure, real-time access to their shipment information.
*   Centralize communication and document sharing.
*   Implement role-based access control for different user types (clients, sales agents, operational officers, financial officers, admins, and managers).

The application aims to improve DocFlow’s efficiency and client satisfaction, and to give the company a competitive advantage.

## 1.4 Work Methodology and Architecture

### 1.4.1 Agile Method

The Agile methodology was chosen for its flexibility and focus on iterative development and continuous feedback. This approach allowed the project team to adapt to changing requirements and ensure the final product met DocFlow’s needs.

### 1.4.2 Choice of Scrum

Within Agile, the Scrum framework was used. The project was divided into short sprints, each with specific goals. Regular meetings and sprint reviews ensured close collaboration with DocFlow and allowed for early detection and resolution of issues.

### 1.4.3 Software Environment

The project was developed using the MERN stack:

*   **Frontend:** React.js for the user interface, with React Router for navigation and [state management library, e.g., Redux or Context API].
*   **Backend:** Node.js and Express.js for server-side logic and RESTful APIs.
*   **Database:** MongoDB, managed with Mongoose.
*   **Authentication:** JSON Web Tokens (JWT) for secure authentication and role-based access.
*   **Development Tools:** Visual Studio Code, Git, GitHub, and Postman.
*   **Deployment:** [Specify deployment platform, e.g., Netlify, Heroku, or Vercel].

## 1.5 Conclusion

This chapter has described the context and motivation for the project, the host organization, the main problems, and the proposed solution. The next chapters will provide details on the system’s architecture, functional specifications, and technical implementation.
