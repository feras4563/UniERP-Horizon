# 🎓 UniERP-Horizon - University Management System

A comprehensive, modern university management system built with Vue.js 3, featuring a clean Arabic interface and robust backend integration.

## ✨ Features

### 🏫 Core Modules
- **👥 Students Management** - Complete student lifecycle management with QR code generation
- **👨‍🏫 Teachers Management** - Faculty member administration and profiles
- **📚 Majors & Subjects** - Academic program and course management
- **📊 Attendance Tracking** - Student attendance monitoring system
- **💰 Fees Management** - Comprehensive fee collection and tracking
- **📅 Timetable Management** - Class scheduling and time management
- **🏦 Finance Module** - Chart of accounts, journal entries, and general ledger
- **⚙️ System Settings** - Configurable system parameters and preferences

### 🚀 Technical Features
- **Modern Vue.js 3** - Built with Composition API for optimal performance
- **Responsive Design** - Mobile-first approach with Arabic RTL support
- **Supabase Integration** - Real-time database with Row Level Security
- **QR Code Generation** - Student identification and tracking
- **Professional UI/UX** - Clean, enterprise-grade interface design
- **Modular Architecture** - Component-based structure for maintainability

## 🛠️ Technology Stack

- **Frontend**: Vue.js 3, Vue Router, Pinia
- **Build Tool**: Vite
- **Database**: Supabase (PostgreSQL)
- **Styling**: CSS3 with CSS Variables
- **Icons**: Font Awesome
- **QR Codes**: qrcode library

## 📋 Prerequisites

- Node.js 16+ or Bun
- Git
- Supabase account (for database)

## 🚀 Installation

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd UniERP-Horizon
```

### 2. Install dependencies
```bash
npm install
# or
bun install
```

### 3. Environment setup
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database setup
Run the provided SQL scripts in your Supabase dashboard:
- `system_settings.sql` - System configuration table
- `database-optimization.sql` - Performance optimization

### 5. Start development server
```bash
npm run dev
# or
bun run dev
```

## 📁 Project Structure

```
UniERP-Horizon/
├── src/
│   ├── components/          # Vue components
│   │   ├── students/        # Student management
│   │   ├── teachers/        # Teacher management
│   │   ├── majors/          # Major management
│   │   ├── subjects/        # Subject management
│   │   ├── attendance/      # Attendance tracking
│   │   ├── fees/           # Fee management
│   │   ├── timetable/      # Timetable management
│   │   ├── finance/        # Financial modules
│   │   └── Settings.vue    # System settings
│   ├── router/             # Vue Router configuration
│   ├── styles/             # Global CSS and components
│   └── main.js             # Application entry point
├── supabase.ts             # Supabase client configuration
├── vite.config.js          # Vite build configuration
└── package.json            # Project dependencies
```

## 🎨 UI/UX Features

- **Arabic RTL Support** - Full right-to-left language support
- **Professional Design** - Enterprise-grade interface with consistent styling
- **Responsive Layout** - Optimized for all device sizes
- **Accessibility** - Keyboard navigation and screen reader support
- **Modern Components** - Professional action buttons and form controls

## 🔧 Configuration

### System Settings
Access the Settings module to configure:
- General system parameters
- Academic year settings
- Notification preferences
- Security settings
- Maintenance options

### Database Optimization
The system includes performance optimization features:
- Database indexing for faster queries
- Materialized views for complex reports
- Query optimization recommendations

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

## 🗺️ Roadmap

- [ ] Advanced reporting and analytics
- [ ] Mobile application
- [ ] API documentation
- [ ] Unit and integration tests
- [ ] Performance monitoring
- [ ] Multi-language support

---

**Built with ❤️ for modern university management**
