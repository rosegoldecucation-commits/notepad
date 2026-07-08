import { Routes, Route } from 'react-router-dom'
import Auth from './screens/Auth.jsx'
import Welcome from './screens/Welcome.jsx'
import Main from './screens/Main.jsx'
import Trash from './screens/Trash.jsx'
import Settings from './screens/Settings.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/notes" element={<Main />} />
      <Route path="/trash" element={<Trash />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  )
}
