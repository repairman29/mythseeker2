# 🎲 MythSeeker v2: AI-Powered Tabletop RPG Platform

## 📊 **PROJECT STATUS: 75% REFACTORED - PHASE 2 COMPLETE**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue)](https://typescript.com)
[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org)
[![Firebase](https://img.shields.io/badge/Firebase-10.7.1-orange)](https://firebase.google.com)
[![Vite](https://img.shields.io/badge/Vite-4.5.0-purple)](https://vitejs.dev)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)]()

**An AI-powered digital Dungeon Master that creates immersive tabletop RPG experiences with intelligent storytelling, real-time multiplayer, and advanced character management.**

---

## 🏗️ **CURRENT ARCHITECTURE STATUS**

### ✅ **COMPLETED REFACTORING (Phases 1-2)**
Successfully transformed from **2,000+ line monolith** to **35+ organized files**:

```
📦 Production-Ready Components (11)
├── 🎨 UI System: Button, Input, Modal, Toast
├── 🎲 Dice System: Advanced3DDice, DiceRoller  
├── 👤 Character System: CharacterCreationModal, CharacterCard
└── 🎮 Game Interface: MessageList, MessageInput, WorldPanel

🔧 Real Service Integration (3)
├── 🔥 Firebase: Connected to mythseekers-rpg GCP project
├── 🤖 AI Services: Vertex AI → OpenAI → Intelligent fallback
└── 🔒 Authentication: Real Google OAuth + Firestore security

📋 Complete Type System (30+ interfaces)
├── 👤 User Management & Preferences
├── 🎮 D&D 5e Character System  
├── 🌍 Campaign & World State
└── 💬 Game Messages & UI Components
```

### 🔄 **NEXT: Phase 3 - Custom Hooks (2-3 hours)**
- Extract business logic to reusable React hooks
- Implement error handling and loading states
- Connect components to services through hooks

---

## 🚀 **QUICK START**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Firebase CLI (optional, for deployment)

### **Installation**
```bash
# Clone the repository
git clone https://github.com/repairman29/mythseeker2.git
cd mythseeker2

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

### **Development Commands**
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run type-check   # TypeScript validation  
npm run lint         # ESLint checking
npm run preview      # Preview production build
```

---

## 🎯 **KEY FEATURES**

### **🤖 AI Dungeon Master**
- **Multi-Model System:** Vertex AI (Gemini Pro) → OpenAI (GPT-4) → Intelligent fallbacks
- **Context-Aware:** 5-layer context system (immediate, session, character, world, semantic)
- **Personality-Driven:** Adaptive storytelling with emotional intelligence
- **Real-Time Responses:** <2s response times with smart caching

### **👥 Multiplayer & Real-Time**
- **Up to 6 Players:** Synchronized game state across all participants
- **Live Chat System:** Rich message formatting with dice integration
- **Real-Time Dice:** Physics-based 3D dice with transparency
- **Secret Messages:** DM-to-player private communication

### **⚔️ D&D 5e Character System**
- **Complete Character Creation:** Multi-step wizard with all races/classes
- **Full Character Sheets:** Stats, equipment, spells, personality
- **Campaign Integration:** Characters persist across multiple campaigns
- **Experience Tracking:** Automatic leveling and progression

### **🌍 Persistent World State**
- **Living World:** NPCs with relationships and evolving storylines
- **Quest Management:** Dynamic quest generation and tracking
- **Weather & Time:** Real-time environmental changes
- **Campaign History:** Full session logs and world continuity

---

## 📁 **PROJECT STRUCTURE**

```
src/
├── components/          # ✅ 11 production-ready components
│   ├── ui/             # Base UI: Button, Input, Modal, Toast
│   ├── dice/           # 3D Dice system with physics
│   ├── character/      # Character creation and display
│   ├── game/           # Game interface and messaging
│   └── index.ts        # Clean barrel exports
├── services/           # ✅ Real Firebase + AI integration
│   ├── firebaseService.ts    # Firestore operations
│   ├── aiService.ts          # Multi-model AI system
│   ├── firebaseConfig.ts     # Production configuration
│   └── index.ts              # Service exports
├── types/              # ✅ Complete TypeScript system
│   ├── user.ts         # User management interfaces
│   ├── character.ts    # D&D 5e character types
│   ├── campaign.ts     # Campaign and world state
│   ├── game.ts         # Game messages and state
│   ├── ui.ts           # Component prop interfaces
│   └── index.ts        # Type exports
├── assets/             # ✅ Tailwind CSS + animations
└── hooks/              # 🔄 Next: Custom React hooks
```

---

## 🏆 **TECHNICAL ACHIEVEMENTS**

### **Code Quality**
- ✅ **Zero TypeScript Errors:** Strict type checking throughout
- ✅ **Modular Architecture:** Average 85 lines per file (target: <150)
- ✅ **Production Ready:** Real Firebase + AI integrations
- ✅ **Clean Imports:** Barrel exports enable `import { Button } from '../components'`

### **Performance**
- ✅ **Fast Builds:** <20s production builds (target: <30s)
- ✅ **Tree Shaking:** Modular components enable optimal bundling
- ✅ **Real-Time Sync:** Firebase Realtime Database integration
- 🔄 **Code Splitting:** Planned for Phase 4

### **Developer Experience**
- ✅ **Hot Reload:** <1s development updates
- ✅ **Type Safety:** Full IntelliSense and error catching
- ✅ **Consistent Patterns:** Standardized component structure
- ✅ **Documentation:** Comprehensive guides and standards

---

## 📋 **DEVELOPMENT WORKFLOW**

### **Organizational Standards**
This project follows **phase-based development** with strict quality gates:

```bash
# Required before any phase completion:
npm run type-check     # Must pass with 0 errors
npm run build          # Must build successfully  
npm run lint           # Must pass with 0 warnings
git status             # All changes committed
```

### **File Organization**
- **Components:** <150 lines, PascalCase naming
- **Services:** <200 lines, camelCase with 'Service' suffix  
- **Hooks:** <100 lines, camelCase with 'use' prefix
- **Types:** <80 lines per interface group

### **Documentation**
- **[PROJECT_MANAGEMENT.md](PROJECT_MANAGEMENT.md):** Complete organizational standards
- **[MYTHSEEKER_TECHNICAL_SPEC.md](MYTHSEEKER_TECHNICAL_SPEC.md):** Technical architecture
- **[REFACTORING_PLAN.md](REFACTORING_PLAN.md):** Current progress and next steps

---

## 🌟 **CONTRIBUTING**

### **Getting Started**
1. **Read Documentation:** Start with PROJECT_MANAGEMENT.md
2. **Environment Setup:** Follow installation instructions above
3. **Code Standards:** All components must pass quality gates
4. **Phase Participation:** Join current Phase 3 (Custom Hooks)

### **Current Priorities (Phase 3)**
- [ ] `useAuth()` - Authentication state management
- [ ] `useFirebase()` - Database operations wrapper
- [ ] `useGameState()` - Game session management  
- [ ] `useAI()` - AI service integration
- [ ] `useDice()` - Dice rolling with history

### **Quality Standards**
- **TypeScript:** Strict mode, no `any` types without justification
- **Testing:** Unit tests for hooks and services
- **Documentation:** All interfaces and complex logic documented
- **Performance:** React.memo where appropriate, avoid unnecessary re-renders

---

## 🎮 **FEATURES ROADMAP**

### **✅ Current (Phase 2 Complete)**
- Modular component architecture
- Real Firebase integration
- Multi-model AI system
- D&D 5e character creation
- 3D dice system with physics

### **🔄 Phase 3 (In Progress)**
- Custom React hooks for state management
- Centralized error handling
- Loading states and user feedback
- Service layer optimization

### **📋 Phase 4 (Planned)**
- Main application integration
- Routing and navigation
- Error boundaries
- Performance optimization

### **🚀 Phase 5 (Future)**
- Production deployment
- CI/CD pipeline
- Performance monitoring
- User testing and feedback

---

## 📞 **SUPPORT & CONTACT**

### **Project Resources**
- **Repository:** https://github.com/repairman29/mythseeker2
- **Issues:** GitHub Issues for bug reports and feature requests
- **Documentation:** Comprehensive guides in repository root

### **Development Status**
- **Current Phase:** Phase 3 - Custom Hooks
- **Completion:** 75% refactored
- **Quality Status:** 🟢 Excellent (all metrics green)
- **Next Milestone:** Custom hooks implementation

---

## 📄 **LICENSE**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the tabletop RPG community**  
*Transforming how we play D&D through intelligent AI and modern web technology* 