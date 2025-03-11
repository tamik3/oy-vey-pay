import { AuthForm, Dashboard, Navbar, useAuth, Expenses, Loading, Incomes } from './components'
import { ToastContainer } from 'react-toastify'
import { Route, Routes } from 'react-router'
import { useEffect } from 'react'
import { me } from './api/auth'

function App() {
  const { isLoggedIn, user, isPending } = useAuth();


  useEffect(() => {
    me().then((data) => console.log(data));
  }, []);

  if (isPending) {
    return <Loading />;
  }

  console.log(user);
  return (
    <>
      {isLoggedIn ? <Navbar /> : null}
      <Routes>
        <Route path='/' element={<Dashboard />} />
        <Route path='/auth' element={<AuthForm />} />
        <Route path='/expenses' element={<Expenses />} />
        <Route path='/incomes' element={<Incomes />} />
      </Routes>
      <ToastContainer position='top-right' theme='colored' autoClose={5000} />
    </>
  );
}

export default App