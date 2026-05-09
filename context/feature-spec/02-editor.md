Read `Agents.md before starting.

We need the base chrome components that frame every editor screen - the top navbar and the left sidebar shell. These will be reused and extended in the every chapter that follows. 

### Editor Navbar 

Create `components/editor/Navbar.tsx` with the following features:
- Logo (Ghost AI RuizTech)
- User profile dropdown
- Dark/light mode toggle
- Notifications bell
- Search bar
- Help button
- fixed-height top navbar
- left, center, and right sections
- left section contains sidebar toggle button
- use `PanelLeftOpen` / `PanelLeftClose` icons based on sidebar state
- right section contains user profile dropdown, dark/light mode toggle, notifications bell, and search bar
- dark background with subtle gradient and subtly bottom border

### Editor Sidebar 

Create `components/editor/Sidebar.tsx` with the following features:
- sidebar should float above the editor canvas
- opening it should not push page content
- it slides in from the left
- accepts 'isOpen' prop to control visibility
- accepts 'onClose' callback to notify parent when closed
- header with `Projects` title + close button 
- shadcn `Tabs`:
 - Projects tab
 - Shared tab
- both tabs show empty placeholder state for now
- full-width layout with proper spacing
- full-width `New Project` button with the `Plus` icon
- clicking on the `New Project` button should open a dialog

### Dialog Pattern

Use existing shadcn dialog components for modals and popups throughout the editor.

Support:

- title
- description
- footer actions

do not build actual dialogs yet, just the pattern.

### check when done

- [x] Navbar component created
- [x] Sidebar component created
- [x] Dialog pattern documented
- [x] dialog pattern is ready for future use
- [x] no lint errors
- [x] no visual errors based on user testing(ask Gio how it looks and if he says it looks good, then mark this as complete)
