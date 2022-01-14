import { BrowserRouter, Route, Routes } from 'react-router-dom'
import {Login} from './components/Login'
import Profile from './components/Profile'
import useToken from './components/useToken'
import './App.css'

function App() {
  const { token, removeToken, setToken } = useToken();
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;