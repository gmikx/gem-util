# GemUtil

A sophisticated, highly responsive web application implementing a systematic dual-momentum framework for ETF selection, based on the Global Equity Momentum (GEM) strategy. 

GemUtil integrates a modern React frontend with a robust Express backend to dynamically analyze ETF performance using the Yahoo Finance API. It provides an intuitive platform for investors to track momentum across selected markets to discover the current best-performing ETF according to the GEM strategy logic.

## Features

- **Systematic Selection**: Calculates asset performance based on the specific rules of the Global Equity Momentum strategy.
- **Real-Time Data**: Integrates seamlessly with the `yahoo-finance2` API to fetch up-to-date historical market data.
- **Interactive Visualizations**: High-quality, interactive charts built with `recharts`.
- **Sleek UI/UX**: Designed using Tailwind CSS and Lucide React icons, featuring smooth micro-animations powered by `motion`.
- **Optimized Builds**: Leverages Vite for extremely fast development servers and optimized production builds.

## Tech Stack

### Frontend
- **React 19**
- **Vite**
- **Tailwind CSS (v4)**
- **Recharts**
- **Framer Motion/Motion**
- **Lucide React**

### Backend
- **Node.js**
- **Express.js**
- **yahoo-finance2**
- **TypeScript & TSX**

## Getting Started

### Prerequisites

You need Node.js (v18 or newer recommended) and npm installed on your machine.

### Installation

1. Clone the repository and navigate to the project root:
   ```bash
   cd gem-util
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development Server

Run the fully integrated development server (frontend & backend) concurrently using `tsx`:

```bash
npm run dev
```

### Production Build

To build the project for production:

```bash
npm run build
```

To run the production server:

```bash
npm run start:prod
```

### Additional Commands

- `npm run preview` - Preview the built application locally.
- `npm run clean` - Remove the `dist` directory.
- `npm run lint` - Run the TypeScript compiler to catch type errors.

## Acknowledgments

This project applies the systematic rules of the Global Equity Momentum (GEM) strategy as popularized by Gary Antonacci. The strategies analyze relative strength (cross-sectional momentum) and absolute momentum (trend-following) to identify prevailing market trends.
