import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/Layout/PrivateRoute';
import Header from './components/Layout/Header';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import EventList from './components/Events/EventList';
import EventDetails from './components/Events/EventDetails';
import CreateEvent from './components/Events/CreateEvent';
import CreateTeam from './components/Teams/CreateTeam';
import MyTeams from './components/Teams/MyTeams';
import TeamIntroList from './components/Teams/TeamIntroList';
import ApproveTeam from './components/Teams/ApproveTeam';
import ResultsList from './components/Results/ResultsList';
import CreateResults from './components/Results/CreateResults';
import Profile from './components/Profile/Profile';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div 
          className="min-h-screen bg-cover bg-center bg-fixed"
          style={{ 
            backgroundImage: `
              linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75)),
              url('/background.jpg')
            `
          }}
        >
          <Header />
          <Routes>
            {/* Публичные */}
            <Route path="/" element={<EventList />} />
            <Route path="/event/:id" element={<EventDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Только авторизованные */}
            <Route path="/teams/create" element={
              <PrivateRoute>
                <CreateTeam />
              </PrivateRoute>
            } />
            <Route path="/my/teams" element={
              <PrivateRoute>
                <MyTeams />
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />

            {/* Только модератор/админ */}
            <Route path="/events/create" element={
              <PrivateRoute roles={['moderator', 'admin']}>
                <CreateEvent />
              </PrivateRoute>
            } />
            <Route path="/teams/intro" element={
              <PrivateRoute roles={['moderator', 'admin']}>
                <TeamIntroList />
              </PrivateRoute>
            } />
            <Route path="/teams/approve/:id" element={
              <PrivateRoute roles={['moderator', 'admin']}>
                <ApproveTeam />
              </PrivateRoute>
            } />
            <Route path="/results" element={
              <PrivateRoute roles={['moderator', 'admin']}>
                <ResultsList />
              </PrivateRoute>
            } />
            <Route path="/results/create" element={
              <PrivateRoute roles={['moderator', 'admin']}>
                <CreateResults />
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;