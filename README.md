# Bill Splitting App

A modern, mobile-friendly app for splitting bills with friends. Features photo-based bill parsing using LLM and flexible splitting options.

## Features

- **Photo Bill Parsing**: Upload a photo of your bill and let AI extract items automatically
- **Manual Entry**: Add items manually if preferred
- **Editable Items**: Review and edit all items, prices, and quantities
- **Two Split Methods**:
  - **Equal Split**: Divide the total equally among all people
  - **By Item**: Assign specific items to specific people
- **Smart Calculations**: Automatic tax and tip distribution
- **Mobile Responsive**: Optimized for mobile use when out with friends

## Setup

### Backend (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   export ANTHROPIC_API_KEY="your-anthropic-api-key"
   # Or create a .env file with ANTHROPIC_API_KEY=your-key
   ```

5. Run the backend:
   ```bash
   python run.py
   ```

The backend will be available at `http://localhost:8000`

### Frontend (React + Vite)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## Usage

1. **Upload or Enter Bill**: Take a photo of your bill or enter items manually
2. **Review Items**: Edit item names, prices, and quantities as needed
3. **Choose Split Method**: Select equal split or by-item split
4. **Configure Split**: Set tip amount and number of people
5. **For By-Item**: Assign items to people using the interactive grid
6. **View Results**: See the breakdown with tax and tip distributed per person

## API Endpoints

- `POST /parse-bill`: Upload bill image for LLM parsing
- `POST /split-equal`: Calculate equal split among people
- `POST /split-by-item`: Calculate split based on item assignments

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: FastAPI, Python
- **AI**: Anthropic Claude for bill parsing
- **Styling**: Modern CSS with mobile-first responsive design