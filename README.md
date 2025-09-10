# GitHub Visualizer

GitHub Visualizer lets you visualize your GitHub account in a cool and modern way. Explore your profile, repositories, contributions, and activity with interactive charts and detailed stats. Built with Next.js, Typescript, Tailwind CSS, and Chart.js, it provides a sleek, intuitive interface to see your GitHub data at a glance.

---
# User Interface

### Dashboard
<img width="1885" height="906" alt="Screenshot 2025-09-04 144706" src="https://github.com/user-attachments/assets/6012164b-e670-4bf1-9335-90ebb8b1a017" />

---

### Contributions Graph
<img width="1878" height="922" alt="image" src="https://github.com/user-attachments/assets/6a69af9f-3ea1-4d95-97b6-273445126d6a" />

---

### Github Insights
<img width="1900" height="917" alt="image" src="https://github.com/user-attachments/assets/9e0f77df-49c9-4e8e-84b5-8d9e87f6d929" />

---

<img width="1897" height="917" alt="image" src="https://github.com/user-attachments/assets/533052f8-4b9f-4e73-8c18-fa63380ea5ce" />

---

### Repositeries Page

<img width="1885" height="915" alt="image" src="https://github.com/user-attachments/assets/800a3274-129d-4c5e-a8a2-6102fe66a0f1" />


---
## Features

- **User Dashboard**: Displays profile info, stats, and activity feed.
- **Activity Feed**: Commits, pull requests, stars, issues with timestamps and icons.
- **Contribution Graph**: Monthly contributions visualized in a bar chart.
- **Repository Insights**: Total stars, public/private repos, pinned repos.
- **Authentication**: GitHub OAuth for secure access.

---

## Tech Stack

- **Frontend:** Typescript, Next.js, Tailwind CSS  
- **Charts:** Chart.js  
- **API Requests:** Axios  
- **Authentication:** GitHub OAuth  

---

## Setup & Installation

You can run the following **bash script** to clone, install dependencies, and set up environment variables automatically:

```bash
#!/bin/bash

🔹 Setting up GitHub Visualizer project...

# 1. Clone repository
git clone https://github.com/your-username/github-visualizer.git
cd github-visualizer

# 2. Install Node dependencies
npm install

# 3. Create environment variables file for frontend
NEXT_PUBLIC_CLIENT_ID=your_client_id
NEXT_PUBLIC_API_URL=http://localhost:5000


# 4. Create environment variables file for backend
JWT_SECRET=your_jwt_secret
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret

# 5. Inform user
✅ Environment file created. Please replace 'your_client_id' and 'your_client_secret' with your GitHub OAuth credentials.

# 6. Run the development server
Starting development server...
npm run dev

🎉 GitHub Visualizer is running at http://localhost:3000
