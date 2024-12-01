# VoiceRecorder.live

A modern, feature-rich online voice recording application built with React, TypeScript, and Supabase. Record, save, and manage your voice notes directly in your browser with a beautiful, intuitive interface.

![VoiceRecorder.live](https://github.com/your-username/voice-recorder/raw/main/preview.png)

## Features

- 🎙️ **Browser-Based Recording**: Record audio directly in your browser with no installation required
- 🔒 **Secure Authentication**: Google OAuth integration for secure user authentication
- 💾 **Cloud Storage**: Automatic saving of recordings to Supabase storage
- ⚡ **Real-Time Waveform**: Visual feedback during recording with dynamic waveform display
- ⏯️ **Playback Controls**: Play, pause, and download your recordings
- 🎛️ **Device Selection**: Choose between multiple audio input devices
- 🔍 **Recording Management**: View and manage all your saved recordings
- 🎨 **Modern UI**: Beautiful, responsive design with Tailwind CSS
- 📱 **Mobile-Friendly**: Fully responsive layout that works on all devices

## Tech Stack

- **Frontend Framework**: React with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Backend & Storage**: Supabase
- **Authentication**: Supabase Auth with Google OAuth
- **Icons**: Lucide React
- **Routing**: React Router
- **Build Tool**: Vite
- **Deployment**: Netlify

## Development

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/voice-recorder.git
   cd voice-recorder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── components/         # React components
│   ├── Auth/          # Authentication components
│   ├── Landing/       # Landing page components
│   ├── Layout/        # Layout components
│   └── VoiceRecorder/ # Voice recorder components
├── contexts/          # React contexts
├── hooks/             # Custom React hooks
├── lib/              # Library configurations
├── pages/            # Page components
└── utils/            # Utility functions
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Supabase](https://supabase.io/) for backend services
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide](https://lucide.dev/) for icons
- [React](https://reactjs.org/) for the UI framework