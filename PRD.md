# Planning Guide

A smart shopping list manager that helps users prioritize purchases within a monthly budget by organizing items into three priority tiers, with intelligent budget-based recommendations and manual reordering capabilities.

**Experience Qualities**:
1. **Empowering** - Users feel in control of their spending with clear budget visibility and flexible prioritization tools
2. **Intuitive** - Priority-based organization makes decision-making effortless, with drag-and-drop simplicity for reordering
3. **Trustworthy** - All data stored locally on device, providing security and privacy while working offline-first

**Complexity Level**: Light Application (multiple features with basic state)
This is a focused task management application with persistent state (shopping items, budget, priorities) that requires multiple interactive features (adding/removing items, reordering, budget calculations) but maintains a single-view interface with straightforward data operations.

## Essential Features

### Budget Management
- **Functionality**: Set and track monthly shopping budget with real-time spending calculations
- **Purpose**: Provides financial guardrails and context for prioritization decisions
- **Trigger**: User accesses budget settings or views budget header
- **Progression**: Click budget display → Edit budget amount → Save → See updated recommendations
- **Success criteria**: Budget persists across sessions, accurately reflects remaining funds, updates instantly when items are purchased

### Three-Tier Priority System
- **Functionality**: Categorize items as "Need to Have" (essentials), "Good to Have" (important but flexible), or "Nice to Have" (wants)
- **Purpose**: Creates a decision framework that aligns spending with actual priorities
- **Trigger**: User adds new item or edits existing item
- **Progression**: Add item → Enter name and price → Select priority category → Item appears in correct section
- **Success criteria**: Items stay within their assigned category, visual hierarchy makes priorities immediately clear

### Price-Based Sorting & Manual Reordering
- **Functionality**: Items automatically sort by price (lowest to highest) within each category, with drag-and-drop for manual reordering when needed
- **Purpose**: Helps users see cheapest options first within each priority level, making budget-conscious decisions easier while allowing flexibility for shopping sequence
- **Trigger**: Items automatically sort by price on load and after edits; users can touch/click and drag the six-dot handle icon for manual reordering
- **Progression**: Items appear sorted by price → Optional: Touch/click drag handle → Drag item vertically within category → Item position updates in real-time → Release to drop → Manual order persists until price changes
- **Success criteria**: Items display cheapest-first by default, smooth drag interaction with visual feedback (shadow, slight scale), items cannot cross category boundaries, haptic-like animations, order maintained after refresh, works on both touch and mouse inputs

### Smart Budget Recommendations
- **Functionality**: System suggests which items fit within remaining budget, highlighting affordable items in priority order
- **Purpose**: Takes mental math out of shopping decisions, guides optimal spending
- **Trigger**: Automatic calculation based on budget and item prices
- **Progression**: Set budget → Add items with prices → System shows affordability indicators → User sees which items fit budget
- **Success criteria**: Recommendations update in real-time, prioritize "Need to Have" items first, clearly show budget impact

### Purchase Completion
- **Functionality**: Mark items as purchased to remove from list and deduct from budget
- **Purpose**: Keeps list current and budget accurate as shopping happens
- **Trigger**: User taps checkbox or purchase button on item
- **Progression**: Select item → Confirm purchase → Item removed → Budget updated → Remaining items re-evaluated
- **Success criteria**: Instant removal, budget recalculation happens immediately, action is reversible via undo toast

### Search and Filtering
- **Functionality**: Search items by name and filter by priority categories with real-time results
- **Purpose**: Quickly locate specific items in long lists and focus on specific priority levels
- **Trigger**: User types in search bar or clicks filter button
- **Progression**: Type search query → Items filter instantly across all categories → Select category filters → View filtered results → Clear filters to reset
- **Success criteria**: Search is case-insensitive and matches partial text, filters show item count, active filters display as removable badges, search works across all visible categories simultaneously

### Dark Mode
- **Functionality**: Toggle between light and dark color themes with a single tap
- **Purpose**: Reduces eye strain in low-light environments and provides user preference flexibility
- **Trigger**: User taps the sun/moon icon in the header
- **Progression**: Tap theme toggle → Smooth transition to dark/light theme → Theme preference persists across sessions
- **Success criteria**: Theme applies instantly across all UI elements, preference is saved and restored on app reload, smooth animated transition between themes, all text maintains proper contrast ratios in both themes

## Edge Case Handling

- **Empty Categories**: Display helpful empty state with "Add your first [priority] item" prompt
- **Budget Exceeded**: Show warning indicator when total exceeds budget, highlight which items to defer
- **No Budget Set**: Prompt user to set budget on first launch, allow skipping for budget-free mode
- **Zero or Negative Prices**: Validate price inputs, require positive numbers, show error for invalid entries
- **Offline Usage**: App works completely offline using local storage, no network dependency
- **Long Item Names**: Truncate with ellipsis, show full name on hover/tap
- **Many Items**: Implement scroll within categories, sticky category headers for context
- **No Search Results**: Display "No items found" message with option to clear search/filters
- **Single Category Filter**: Prevent deselecting the last category to ensure at least one is always visible

## Design Direction

The design should feel like a practical financial tool with a warm, approachable personality—trustworthy enough for budget management but friendly enough for everyday grocery shopping. Think of a smart assistant that helps you make confident purchasing decisions without judgment or complexity.

## Color Selection

A budget-conscious palette that uses color strategically to communicate priority and financial status, with earth tones that feel grounded and reliable. The design features both light and dark themes to accommodate different lighting conditions and user preferences.

### Light Theme
- **Primary Color**: Deep Forest Green (`oklch(0.45 0.08 160)`) - Represents financial stability and "go ahead" confidence for purchases within budget
- **Secondary Colors**: 
  - Warm Terracotta (`oklch(0.65 0.12 35)`) for "Good to Have" items - Important but flexible
  - Soft Sage (`oklch(0.75 0.06 150)`) for secondary actions and muted backgrounds
- **Accent Color**: Vibrant Coral (`oklch(0.68 0.17 25)`) - Draws attention to "Need to Have" priorities and budget warnings
- **Foreground/Background Pairings**: 
  - Background (Cream `oklch(0.97 0.01 85)`): Deep Charcoal text (`oklch(0.25 0.02 260)`) - Ratio 12.1:1 ✓
  - Primary (Deep Forest Green `oklch(0.45 0.08 160)`): White text (`oklch(1 0 0)`) - Ratio 6.8:1 ✓
  - Accent (Vibrant Coral `oklch(0.68 0.17 25)`): Deep Charcoal text (`oklch(0.25 0.02 260)`) - Ratio 5.2:1 ✓
  - Terracotta (`oklch(0.65 0.12 35)`): Deep Charcoal text (`oklch(0.25 0.02 260)`) - Ratio 4.9:1 ✓

### Dark Theme
- **Primary Color**: Lighter Forest Green (`oklch(0.55 0.10 160)`) - Adjusted for dark background while maintaining brand identity
- **Secondary Colors**: 
  - Warm Terracotta (`oklch(0.68 0.13 37)`) for "Good to Have" items - Slightly brighter for visibility
  - Muted Sage (`oklch(0.35 0.04 150)`) for secondary UI elements
- **Accent Color**: Bright Coral (`oklch(0.72 0.18 28)`) - Enhanced luminosity for dark mode readability
- **Foreground/Background Pairings**: 
  - Background (Deep Charcoal `oklch(0.15 0.01 260)`): Light Cream text (`oklch(0.95 0.01 85)`) - Ratio 11.8:1 ✓
  - Primary (Lighter Forest Green `oklch(0.55 0.10 160)`): Light text (`oklch(0.98 0.01 85)`) - Ratio 6.5:1 ✓
  - Accent (Bright Coral `oklch(0.72 0.18 28)`): Deep background (`oklch(0.15 0.01 260)`) - Ratio 5.8:1 ✓
  - Card backgrounds (`oklch(0.20 0.01 260)`) provide subtle elevation over main background

## Font Selection

Typography should feel modern and highly legible for scanning lists quickly, with a slight geometric quality that suggests organization and precision without feeling cold.

- **Typographic Hierarchy**: 
  - H1 (App Title): Space Grotesk Bold/32px/tight letter-spacing (-0.02em)
  - H2 (Category Headers): Space Grotesk SemiBold/20px/normal letter-spacing
  - Body (Item Names): Inter Medium/16px/normal letter-spacing, 1.5 line-height
  - Caption (Prices, Budget Info): JetBrains Mono Regular/14px/normal letter-spacing
  - Button Text: Inter SemiBold/15px/slight letter-spacing (0.01em)

## Animations

Animations should reinforce the tangible feeling of organizing physical items and provide satisfying feedback for budget-conscious decisions. Keep movements snappy (under 300ms) to maintain productivity flow, with moments of delight when budget goals are met.

Key animation moments: Item addition slides in from category header with a gentle bounce; purchase completion fades out with a subtle scale-down; drag reordering shows smooth position swapping with other items shifting aside (using framer-motion's layout animations); dragged items lift with increased shadow and slight scale (1.02x); budget progress bar fills/empties with spring physics; crossing budget threshold triggers a gentle shake on the total.

## Component Selection

- **Components**: 
  - Cards with shadows for each shopping item (visual weight suggests importance)
  - Badge components for priority labels with category-specific colors
  - Input with label for adding items and prices (number input with currency formatting)
  - Progress bar for budget visualization with gradient fill
  - Dialog for budget settings and item editing
  - Button variants: Primary (add item), Ghost (item actions), Destructive (remove/cancel)
  - Checkbox for purchase completion (large touch target)
  - Separator between categories for clear visual grouping
  
- **Customizations**: 
  - Drag handle component (three horizontal lines icon) on item cards
  - Budget header component with circular progress indicator
  - Empty state illustrations for each category
  - Price input with auto-formatting for currency
  - Custom color-coded category headers with item count badges
  
- **States**: 
  - Items: Default, Hover (lift shadow), Dragging (elevated shadow + opacity), Purchased (strikethrough + fade out)
  - Buttons: Rest, Hover (lighten), Active (darken), Disabled (low opacity)
  - Budget indicator: Under budget (green), Approaching limit (yellow), Over budget (red pulse)
  - Inputs: Empty, Focused (border highlight), Error (red border + message), Valid (subtle checkmark)
  
- **Icon Selection**: 
  - Plus (add item)
  - DotsSixVertical (drag handle)
  - Check (purchase/complete)
  - Pencil (edit item)
  - Trash (delete item)
  - CurrencyDollar (budget settings)
  - ArrowUp/ArrowDown (manual reorder buttons as fallback)
  - Warning (budget exceeded)
  - MagnifyingGlass (search)
  - Funnel (filter)
  - X (clear/remove filters)
  - Sun (light mode indicator)
  - Moon (dark mode indicator)
  
- **Spacing**: 
  - Container padding: 6 (24px) on desktop, 4 (16px) on mobile
  - Card gaps: 3 (12px) for tight list feel
  - Category spacing: 8 (32px) between sections
  - Input field spacing: 4 (16px) vertical, 2 (8px) internal padding
  - Button padding: 3 (12px) vertical, 6 (24px) horizontal
  
- **Mobile**: 
  - Single column layout throughout (no desktop multi-column)
  - Sticky budget header at top with collapse option
  - Larger touch targets (min 44px) for drag handles and checkboxes
  - Touch-optimized drag-and-drop with pointer events and touch-action controls
  - Drag handle always visible and easy to grab on touch devices
  - Bottom-anchored "Add Item" button (floating action button style)
  - Category headers stick to top during scroll for context
  - Full-screen dialogs for forms on mobile, centered modals on desktop
