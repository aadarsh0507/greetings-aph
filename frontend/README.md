# Patient Birthday Manager - Frontend Only

A React + Vite frontend application for managing patient birthday greetings.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start the application**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   - The app will automatically open at `http://localhost:5173`

## 📝 Available Scripts

- `npm run dev` - Start development server on port 5173
- `npm start` - Start development server on port 5173
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## ✨ Features

- **Patient Birthday Management**: View and manage patient birthdays
- **Template Management**: Create and manage greeting message templates
- **Birthday Filtering**: Filter patients by today's, tomorrow's, and upcoming birthdays
- **Responsive Design**: Modern, mobile-friendly UI built with Tailwind CSS
- **Sample Data**: Includes sample patients and templates for demonstration

## 🎯 How to Use

1. **View Birthdays**: Click "Today", "Tomorrow", or "Upcoming" to filter patients
2. **Manage Templates**: Use "Create Template" to add new greeting message templates
3. **Send Greetings**: Select a template and click "Send Greetings" to simulate sending messages
4. **Check Console**: Greeting messages are logged to the browser console

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## 📁 Project Structure

```
frontend/
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## 🌐 Access

- **Local**: `http://localhost:5173`
- **Network**: Available on your local network (host: true)

## 📝 Notes

- This is a frontend-only application with sample data
- No backend server required
- All data is stored in local state
- Perfect for demonstrations and UI testing