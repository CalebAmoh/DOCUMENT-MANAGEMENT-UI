import React,{ useState, useCallback } from 'react';

import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Checkbox from '@mui/joy/Checkbox';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Link from '@mui/joy/Link';
import { Result,notification } from "antd";
import Input from '@mui/joy/Input';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import useAuth from '../hooks/useAuth';
import bgimg from '../utils/images/organised-documents-references_23-2149396678.avif'
import { useLocation, useNavigate } from 'react-router-dom';
import {API_SERVER1, headers} from '../constant'
import axios from 'axios';


interface FormElements extends HTMLFormControlsCollection {
  email: HTMLInputElement;
  password: HTMLInputElement;
  persistent: HTMLInputElement;
}
interface SignInFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}


const Login = () =>{ 

  // this handles the state of the component
  const [state, setState] = useState({
          email: "", // user email
          password: "", // user password
  });

  // Initialize notification
  const [api, contextHolder] = notification.useNotification();

  //handles error notifications
  const openErrorNotification = (pauseOnHover:any) => (message:any) => {
      api.open({
          message: 'ERROR MESSAGE',
          description:message,
          showProgress: true,
          duration: 20,
          pauseOnHover,
          icon: <CancelOutlinedIcon style={{ color: '#c0392b' }} />
      });
  };

  //handles success notifications
  const openNotification = (pauseOnHover:any) => (message:any) => {
      api.open({
      message: 'SUCCESS MESSAGE',
      description:message,
      showProgress: true,
      duration: 20,
      pauseOnHover,
      icon: <CheckCircleOutlineOutlinedIcon style={{ color: '#45b39d' }} />
      });
  };

  //opens success notification
  const notifySuccess = openNotification(true);

  //opens error notification
  const notifyError = openErrorNotification(true);


  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || { pathname: '/dashboard' };

  const {setUser} = useAuth();  // Get the setUser function from the AuthContext


  //this function is used to update the state when input changes
  const handleInputChange = useCallback((key:string, value:string) => {
      setState((prevState) => ({
          ...prevState,
          [key]: value
      }));
  }, []);

  //function to setAuth to true
  const handleLogin = useCallback(async () => {
    try {
      // Validate required fields
      if (!state.email?.trim() || !state.password) {
        notifyError("Please provide email and password");
        return;
      }

      const response = await axios.post(`${API_SERVER1}/user/login`, {
        email: state.email.trim(),
        password: state.password
      }, { 
        headers,
        withCredentials: true  // Add this to handle cookies
      });

      if (response.data.code === "200") {
        const userData = response.data.user[0];
        setUser({
          id: userData.id,
          employee: userData.employee,
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          roles: userData.name,
          accessToken: response.data.accessToken
        });
        
        notifySuccess(response.data.message || "Login successful");
        navigate('/dashboard');
      } else {
        notifyError(response.data.result || "Login failed");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      notifyError(error.response?.data?.result || "An error occurred during login");
    }
  }, [state.email, state.password, setUser, navigate, notifySuccess, notifyError]);

  return (
    <div>
      {contextHolder}
      <Box
        sx={(theme) => ({
          width: { xs: '100%', md: '50vw' },
          transition: 'width var(--Transition-duration)',
          transitionDelay: 'calc(var(--Transition-duration) + 0.1s)',
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          justifyContent: 'flex-end',
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255 255 255 / 0.2)',
          [theme.getColorSchemeSelector('dark')]: {
            backgroundColor: 'rgba(19 19 24 / 0.4)',
          },
        })}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100dvh',
            width: '100%',
            px: 2,
          }}
        >
          <Box
            component="header"
            sx={{ py: 3, display: 'flex', justifyContent: 'space-between' }}
          >
            <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
              
              {/* <Typography level="title-lg">Company logo</Typography> */}
            </Box>
            {/* <ColorSchemeToggle /> */}
          </Box>
          <Box
            component="main"
            sx={{
              my: 'auto',
              py: 2,
              pb: 5,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              width: 400,
              maxWidth: '100%',
              mx: 'auto',
              borderRadius: 'sm',
              '& form': {
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              },
              [`& .MuiFormLabel-asterisk`]: {
                visibility: 'hidden',
              },
            }}
          >
            {/* <Stack sx={{ gap: 4, mb: 2 }}>
              <Stack sx={{ gap: 1 }}>
                <Typography component="h1" level="h3">
                  Sign in
                </Typography>
                <Typography level="body-sm">
                  New to company?{' '}
                  <Link href="#replace-with-a-link" level="title-sm">
                    Sign up!
                  </Link>
                </Typography>
              </Stack>
              <Button
                variant="soft"
                color="neutral"
                fullWidth
              >
                Continue with Google
              </Button>
            </Stack> */}
            <Divider
              sx={(theme) => ({
                [theme.getColorSchemeSelector('light')]: {
                  color: { xs: '#FFF', md: 'text.tertiary' },
                },
              })}
            >
              {/* or */}
            </Divider>
            <Stack sx={{ gap: 4, mt: 2 }}>
              <form>
                <FormControl required>
                  <FormLabel>Email</FormLabel>
                  <Input type="email" name="email" value={state.email} onChange={(e) => handleInputChange("email",e.target.value)} />
                </FormControl>
                <FormControl required>
                  <FormLabel>Password</FormLabel>
                  <Input type="password" name="password" value={state.password} onChange={(e) => handleInputChange("password",e.target.value)} />
                </FormControl>
                <Stack sx={{ gap: 4, mt: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Checkbox size="sm" label="Remember me" name="persistent" />
                    <Link level="title-sm" href="#replace-with-a-link">
                      Forgot your password?
                    </Link>
                  </Box>
                  <Button onClick={handleLogin} fullWidth>
                    Sign in
                  </Button>
                </Stack>
              </form>
            </Stack>
          </Box>
          <Box component="footer" sx={{ py: 3 }}>
            <Typography level="body-xs" sx={{ textAlign: 'center' }}>
              © Your company {new Date().getFullYear()}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box
        sx={(theme) => ({
          height: '100%',
          position: 'fixed',
          right: 0,
          top: 0,
          bottom: 0,
          left: { xs: 0, md: '50vw' },
          transition:
            'background-image var(--Transition-duration), left var(--Transition-duration) !important',
          transitionDelay: 'calc(var(--Transition-duration) + 0.1s)',
          backgroundColor: 'background.level1',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundImage:
            'url(https://www.storagemart.com.ph/wp/wp-content/uploads/2020/03/storage.jpg)',
          [theme.getColorSchemeSelector('dark')]: {
            backgroundImage:
              'url(https://images.unsplash.com/photo-1572072393749-3ca9c8ea0831?auto=format&w=1000&dpr=2)',
          },
        })}
      />
    </div>
  );
}

export default Login;
