# Logic Flow

## Overview

A data viewer for Ovis Loop game content, displaying CSV-based game data (skills, items, weapons, etc.) in a searchable, sortable, and groupable table with multi-language support.

## Data Flow

```
CSV Files (public/) → fetch() → Papa.parse() → React State → DataTable → UI
```

## Core Components

### 1. App.tsx (Root)
- Manages global state: `activeTab` (category), `selectedLanguage`
- Persists language preference to localStorage
- Renders tabs for each data category

### 2. useGameData.ts (Hook)
- Fetches CSV files from `/public/` based on selected category
- Parses CSV with PapaParse library
- Returns `{ data, loading, error }`

### 3. DataTable.tsx (Component)
- **Search**: Filters rows by any field match
- **Sort**: Click column headers to toggle asc/desc
- **Group By**: Organizes rows by GroupID, TextID, or Comment
- Displays columns: GroupID, TextID, Comment, [selectedLanguage]

## Data Categories

Defined in `types/game.ts`:
- Skills → skills.csv
- Items → items.csv
- Boosters → boosters.csv
- Metaprogress → metaprogress.csv
- Weapons → weapons.csv
- Weapon Modify → weapon_modify.csv

## Supported Languages

English, Korean, Japanese, Chinese (and others in CSV columns)
