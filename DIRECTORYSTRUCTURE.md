# Directory Structure

Please follow the directory structure below for implementation:

```
/
├── src/                          # Source directory
│   ├── api/                      # API related implementations
│   ├── components/               # Shared UI Components
│   ├── constants/                # Constant values and configurations
│   ├── contexts/                 # React Context providers
│   ├── features/                 # Feature-specific implementations
│   │   └── options/              # Option feature specific components
│   │       └── components/       # Option specific UI components
│   ├── hooks/                    # Custom React hooks
│   ├── mappers/                  # Data transformation utilities
│   ├── models/                   # Data models and interfaces
│   ├── pages/                    # Page implementations
│   │   ├── ServiceWorker.ts      # ServiceWorker script
│   │   ├── Offscreen.ts          # Offscreen document
│   │   └── Options.tsx           # Option page
│   ├── stores/                   # State management (Zustand)
│   ├── styles/                   # Global styles
│   ├── types/                    # TypeScript type definitions
│   └── utils/                    # Utility functions
├── public/                       # Static assets
├── dist/                         # Output directory
├── node_modules/                 # Dependency packages
├── .gitignore                    # Git ignore patterns
├── .prettierrc                   # Prettier configuration
├── .prettierignore               # Prettier ignore patterns
├── .eslintignore                 # ESLint ignore patterns
├── manifest.json                 # Chrome Extension manifest configuration
├── package.json                  # Project settings
├── package-script.sh             # Build and development scripts
├── pnpm-lock.yaml                # Dependency lock file
├── tsconfig.json                 # TypeScript settings
├── webpack.config.ts             # Webpack configuration
├── postcss.config.js             # PostCSS configuration
├── mise.toml                     # Development environment settings
├── TECHNOLOGSTACK.md             # Technology stack documentation
├── DIRECTORYSTRUCTURE.md         # Directory structure documentation
├── LICENSE                       # License information
└── README.md                     # Project documentation

### Directory Descriptions

#### Source Code (`src/`)
- `api/`: API related implementations and services
- `components/`: Shared UI component implementations
- `constants/`: Constant values and configuration definitions
- `contexts/`: React Context providers and implementations
- `features/`: Feature-specific implementations
  - `options/`: Option feature specific components and logic
- `hooks/`: Custom React hooks
- `mappers/`: Data transformation and mapping utilities
- `models/`: Data models and interfaces
- `pages/`: Page implementations
  - `background/`: Background script implementation
  - `offscreen/`: Offscreen document implementation
  - `options/`: Option page implementation
- `stores/`: State management implementations (Zustand)
- `styles/`: Global style definitions
- `types/`: TypeScript type definitions
- `utils/`: General utility functions

#### Configuration Files
- `.prettierrc`: Prettier formatting rules
- `.eslintignore`: ESLint ignore patterns
- `tsconfig.json`: TypeScript compiler configuration
- `webpack.config.ts`: Webpack build configuration
- `postcss.config.js`: PostCSS configuration

#### Build and Dependencies
- `dist/`: Compiled output files
- `public/`: Static assets
- `node_modules/`: Third-party dependencies
- `package.json`: Project metadata and dependencies
- `pnpm-lock.yaml`: Dependency version lock file
- `package-script.sh`: Build and development scripts

#### Documentation
- `TECHNOLOGSTACK.md`: Technology stack specifications
- `DIRECTORYSTRUCTURE.md`: Directory structure guide
- `README.md`: Project overview and setup instructions
- `LICENSE`: Project license information
```
