# Planning Guide

A terminal-style developer portfolio that analyzes GitHub repositories and presents developer skills, projects, and stats in a retro pixel-art aesthetic with a red color scheme, designed for embedding in GitHub profiles.

**Experience Qualities**:
1. **Nostalgic** - Evokes memories of classic terminal interfaces and retro computing with pixel-perfect typography and CRT-monitor effects
2. **Immersive** - Creates the feeling of interacting with an actual command-line interface with realistic typing animations and terminal responses
3. **Professional** - Despite the retro aesthetic, maintains credibility and showcases technical expertise through data-driven insights

**Complexity Level**: Light Application (multiple features with basic state)
This is a portfolio showcase with interactive terminal commands, GitHub API integration for repo analysis, and multiple sections (about, skills, projects, stats) with persistent command history.

## Essential Features

### GitHub Repository Analysis
- **Functionality**: Fetches and analyzes user's GitHub repositories to extract languages, technologies, commit patterns, and project descriptions. Automatically refreshes data every 5 minutes.
- **Purpose**: Automatically generates portfolio content based on actual work, showcasing real expertise with up-to-date information
- **Trigger**: On app load, fetches data for the authenticated GitHub user, then refreshes every 5 minutes automatically
- **Progression**: Load app → Authenticate with spark.user() → Fetch repos via GitHub API → Analyze languages/topics → Display in terminal format → Auto-refresh every 5 minutes with toast notification
- **Success criteria**: Displays accurate repo count, top languages, recent projects, and contribution stats. Shows last update timestamp in header. Displays success/error toast on refresh.

### Interactive Terminal Commands
- **Functionality**: Users can type commands like `about`, `skills`, `projects`, `contact`, `help` to navigate
- **Purpose**: Creates engaging, memorable interaction that stands out from traditional portfolio sites
- **Trigger**: User types command and presses Enter
- **Progression**: Type command → Parse input → Validate command → Execute corresponding action → Display formatted response with typing effect
- **Success criteria**: All commands respond correctly, invalid commands show helpful error messages

### Command History
- **Functionality**: Stores and displays previous commands with full session persistence, supports arrow key navigation through history
- **Purpose**: Mimics real terminal behavior with authentic session persistence, improves UX for repeated commands, maintains continuity across page refreshes and browser sessions
- **Trigger**: Any command execution adds to history, up/down arrows navigate, session initialization preserves previous history
- **Progression**: Execute command → Store in KV with useKV hook → Display in terminal scrollback → Navigate with arrow keys → Persist across sessions → Restore on next visit
- **Success criteria**: History persists indefinitely across sessions and browser restarts, arrow keys cycle through all previous commands from all sessions, session initialization flag prevents duplicate welcome messages

### Auto-Complete Suggestions
- **Functionality**: Shows available commands as user types, tab to complete
- **Purpose**: Guides users who are unfamiliar with available commands
- **Trigger**: User starts typing in terminal input
- **Progression**: Keypress → Match against command list → Display suggestions → Tab key completes
- **Success criteria**: Suggestions appear instantly, tab completion works smoothly

## Edge Case Handling

- **No GitHub repos**: Display encouraging message with placeholder content and instructions to create first repository
- **API rate limits**: Show cached data with timestamp, notify user of stale data gracefully
- **Mobile users**: Provide button-based command shortcuts above terminal for touch interaction
- **Long output**: Implement scrollable terminal window with smooth scroll to bottom on new output
- **Invalid commands**: Show ASCII art error message with `command not found` and suggest `help`

## Design Direction

The design should evoke the feeling of a vintage terminal from the 1980s-90s computing era—think monochromatic CRT monitors, phosphor glow effects, scanlines, and pixel-perfect bitmap fonts. The red color scheme should feel technical and slightly dangerous, like accessing a mainframe or hacking into a system. Every element should maintain the illusion of being inside a real terminal, with careful attention to authentic terminal behaviors (cursor blinking, text wrapping, prompt symbols).

## Color Selection

A retro terminal palette dominated by red phosphor glow on near-black backgrounds, evoking classic monochrome monitors.

- **Primary Color**: Deep red (oklch(0.5 0.25 30)) - The main terminal text color representing classic red phosphor CRT displays, communicates technical expertise and retro computing
- **Secondary Colors**: 
  - Darker red (oklch(0.35 0.2 30)) for dimmed/muted text like comments and timestamps
  - Black with slight red tint (oklch(0.12 0.05 30)) for the terminal background
  - Bright red (oklch(0.65 0.28 30)) for highlights, errors, and active elements
- **Accent Color**: Neon red (oklch(0.7 0.3 30)) for important elements, cursor, active command, and success messages
- **Foreground/Background Pairings**:
  - Primary red (oklch(0.5 0.25 30)): On dark background (oklch(0.12 0.05 30)) - Ratio 5.2:1 ✓
  - Bright red (oklch(0.65 0.28 30)): On dark background (oklch(0.12 0.05 30)) - Ratio 7.8:1 ✓
  - Neon red accent (oklch(0.7 0.3 30)): On dark background (oklch(0.12 0.05 30)) - Ratio 9.1:1 ✓

## Font Selection

Typography must be authentically monospace and pixel-perfect to maintain the terminal aesthetic, with every character occupying equal width and displaying crisp pixel edges.

- **Primary Font**: JetBrains Mono for terminal text - Monospace font with excellent readability and programming ligatures, maintains authentic terminal feel
- **Typographic Hierarchy**:
  - Terminal text (body): JetBrains Mono Regular / 16px / 1.5 line-height / letter-spacing: 0.5px
  - Command prompt: JetBrains Mono Bold / 16px / bright red color
  - Headers (ASCII art): JetBrains Mono Bold / 18px / neon red
  - Small text (timestamps): JetBrains Mono Regular / 14px / muted red
  - Error messages: JetBrains Mono Bold / 16px / bright red

## Animations

Animations should reinforce the terminal aesthetic with typing effects, cursor blinking, and subtle CRT monitor characteristics that feel authentic rather than gimmicky.

- **Typing Effect**: Character-by-character reveal for command responses using staggered delays (30-50ms per character) to simulate real-time terminal output
- **Cursor Blink**: Square block cursor with 530ms interval blink (matching classic terminal timing)
- **Scanline Overlay**: Subtle horizontal scanlines that slowly drift down the screen with CSS animation for CRT effect
- **Text Glow**: Soft red glow on text using text-shadow to simulate phosphor bloom
- **Scroll Behavior**: Smooth auto-scroll to bottom when new content appears, with slight ease-out
- **Command Entry**: Brief flash when command executes before output begins

## Component Selection

- **Components**: 
  - Card for main terminal window container with CRT monitor-style bezel effect
  - ScrollArea for terminal output with custom scrollbar styled as retro slider
  - Input for command line with custom styling to remove modern browser chrome
  - Button (minimal variant) for mobile command shortcuts, styled with bracket characters `[ command ]`
  - Badge for skill tags and language labels in ASCII style with borders
  - Separator for dividing sections with ASCII line characters (─, ═, etc.)
  
- **Customizations**: 
  - Custom terminal prompt component with user@host format and directory path
  - ASCII art generator component for headers and decorative elements
  - Typing animation component wrapper for progressive text reveal
  - Custom scrollbar with retro terminal aesthetic (thin red bar)
  - CRT effect overlay component with scanlines and slight chromatic aberration
  
- **States**: 
  - Input: Focus state with brighter cursor glow, no outline or border change
  - Buttons: Hover adds brackets intensity, active inverts colors briefly
  - Loading: Spinning ASCII spinner characters (|, /, ─, \)
  - Error: Red flash animation with ASCII error box
  
- **Icon Selection**: 
  - Prefer ASCII characters over icons: `>` for prompt, `$` for command, `#` for comments, `[x]` for status
  - Use Phosphor icons only sparingly for GitHub, email, links in minimal weight
  - Terminal symbols: `~` for home, `>>` for output, `//` for comments
  
- **Spacing**: 
  - Terminal padding: p-6 around main window, p-4 for terminal content
  - Line spacing: space-y-2 between command outputs, space-y-1 within command blocks
  - Command prompt margin: mb-4 between prompt and previous output
  - Section dividers: my-6 for major sections, my-3 for minor breaks
  
- **Mobile**: 
  - Terminal window fills viewport with minimal padding (p-2)
  - Command shortcuts displayed as button grid above terminal input (grid-cols-2 gap-2)
  - Font size reduces slightly to 14px on mobile for more content visibility
  - Touch input gets larger hit area with py-4
  - Scrollable terminal content with fixed input at bottom using sticky positioning
