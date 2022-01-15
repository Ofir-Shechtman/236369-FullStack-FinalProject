import { BrowserRouter, Route, Routes } from 'react-router-dom'
import {Login} from './components/Login'
import Profile from './components/Profile'
import useToken from './components/useToken'
import './App.css'
import { ThemeProvider, useTheme } from '@mui/material/styles';


function App() {
  const { token, removeToken, setToken } = useToken();
  const theme = useTheme();

  return (
    <BrowserRouter>
        <ThemeProvider theme={theme}>
            <div className="App">
              {!token && token!=="" &&token!== undefined?
              <Login setToken={setToken} />
              :(
                <>
                  <Routes>
                    <Route index element={<Profile removeToken={removeToken} token={token}/>}/>
                  </Routes>
                </>
              )}
            </div>
        </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;