"use client"

import { useState, useCallback } from "react"

import Box from "@mui/joy/Box"
import Button from "@mui/joy/Button"
import Checkbox from "@mui/joy/Checkbox"
import Divider from "@mui/joy/Divider"
import FormControl from "@mui/joy/FormControl"
import FormLabel from "@mui/joy/FormLabel"
import Link from "@mui/joy/Link"
import { notification } from "antd"
import Input from "@mui/joy/Input"
import Typography from "@mui/joy/Typography"
import Stack from "@mui/joy/Stack"
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined"
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined"
import useAuth from "../hooks/useAuth"
import { useLocation, useNavigate } from "react-router-dom"
import { headers } from "../constant"
import axios from "../constant"
import bgimg from "../utils/images/doc_logo-removebg-preview.png"

interface FormElements extends HTMLFormControlsCollection {
  email: HTMLInputElement
  password: HTMLInputElement
  persistent: HTMLInputElement
}
interface SignInFormElement extends HTMLFormElement {
  readonly elements: FormElements
}

const Login = () => {
  // this handles the state of the component
  const [state, setState] = useState({
    email: "", // user email
    password: "", // user password
  })

  // Initialize notification
  const [api, contextHolder] = notification.useNotification()

  //handles error notifications
  const openErrorNotification = (pauseOnHover: any) => (message: any) => {
    api.open({
      message: "ERROR MESSAGE",
      description: message,
      showProgress: true,
      duration: 20,
      pauseOnHover,
      icon: <CancelOutlinedIcon style={{ color: "#c0392b" }} />,
    })
  }

  //handles success notifications
  const openNotification = (pauseOnHover: any) => (message: any) => {
    api.open({
      message: "SUCCESS MESSAGE",
      description: message,
      showProgress: true,
      duration: 20,
      pauseOnHover,
      icon: <CheckCircleOutlineOutlinedIcon style={{ color: "#45b39d" }} />,
    })
  }

  //opens success notification
  const notifySuccess = openNotification(true)

  //opens error notification
  const notifyError = openErrorNotification(true)

  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from || { pathname: "/dashboard" }

  const { setUser } = useAuth() // Get the setUser function from the AuthContext

  //this function is used to update the state when input changes
  const handleInputChange = useCallback((key: string, value: string) => {
    setState((prevState) => ({
      ...prevState,
      [key]: value,
    }))
  }, [])

  //function to setAuth to true
  const handleLogin = useCallback(async () => {
    try {
      // Validate required fields
      if (!state.email?.trim() || !state.password) {
        notifyError("Please provide email and password")
        return
      }

      const response = await axios.post(
        "/user/login",
        {
          email: state.email.trim(),
          password: state.password,
        },
        {
          headers,
          withCredentials: true, // Add this to handle cookies
        },
      )

      if (response.data.code === "200") {
        const userData = response.data.user[0]
        console.log("User data:", userData.user_id)
        setUser({
          id: userData.user_id,
          employee: userData.employee_id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          roles: [userData.role_name],
          accessToken: response.data.accessToken,
        })

        notifySuccess(response.data.message || "Login successful")
        navigate(from, { replace: true })
      } else {
        notifyError(response.data.result || "Login failed")
      }
    } catch (error: any) {
      console.error("Login error:", error)
      notifyError(error.response?.data?.result || "An error occurred during login")
    }
  }, [state.email, state.password, setUser, navigate, notifySuccess, notifyError, from])

  return (
    <div className="login-container" style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>
      {contextHolder}
      <Box
        sx={(theme) => ({
          width: { xs: "100%", md: "50%" },
          height: "100%",
          transition: "width var(--Transition-duration)",
          transitionDelay: "calc(var(--Transition-duration) + 0.1s)",
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "center",
          backdropFilter: "blur(12px)",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          [theme.getColorSchemeSelector("dark")]: {
            backgroundColor: "rgba(19, 19, 24, 0.9)",
          },
        })}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100%",
            width: "100%",
            maxWidth: "600px",
            px: 4,
            position: "relative", // Add position relative
          }}
        >
          <Box
            component="header"
            sx={{
              py: 3,
              display: "flex",
              justifyContent: "flex-start",
              pl: 2, // Add left padding to ensure the logo isn't flush against the edge
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {/* <img
                src={bgimg || "/placeholder.svg"}
                alt="Company Logo"
                style={{
                  maxWidth: "150px",
                  height: "auto",
                  objectFit: "contain",
                }}
              /> */}
            </Box>
          </Box>
          <Box
            component="main"
            sx={{
              my: "auto",
              py: 2,
              pb: 5,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              width: "100%",
              maxWidth: "400px",
              mx: "auto",
              borderRadius: "sm",
              "& form": {
                display: "flex",
                flexDirection: "column",
                gap: 2,
              },
              [`& .MuiFormLabel-asterisk`]: {
                visibility: "hidden",
              },
            }}
          >
            <Stack sx={{ gap: 1, mb: 2 }}>
              <Typography component="h1" level="h3">
                Sign in
              </Typography>
              <Typography level="body-sm">Enter your credentials to access your account</Typography>
            </Stack>
            <Divider />
            <Stack sx={{ gap: 4, mt: 1 }}>
              <form>
                <FormControl required>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    name="email"
                    value={state.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </FormControl>
                <FormControl required>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    name="password"
                    value={state.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                  />
                </FormControl>
                <Stack sx={{ gap: 4, mt: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
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
            <Typography level="body-xs" sx={{ textAlign: "center" }}>
              © Your company {new Date().getFullYear()}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          display: { xs: "none", md: "block" },
          position: "relative",
          width: "50%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: "url(https://www.storagemart.com.ph/wp/wp-content/uploads/2020/03/storage.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              zIndex: 1,
            },
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "10%",
            left: "10%",
            zIndex: 2,
            color: "white",
            maxWidth: "80%",
          }}
        >
          <Typography
            level="h2"
            sx={{ color: "white", mb: 2, fontWeight: "bold", textShadow: "1px 1px 3px rgba(0,0,0,0.6)" }}
          >
            Document & Expense Management System
          </Typography>
          <Typography level="body-lg" sx={{ color: "white", textShadow: "1px 1px 2px rgba(0,0,0,0.6)" }}>
            Organize, store, and access your documents securely from anywhere.
          </Typography>
        </Box>
      </Box>
    </div>
  )
}

export default Login

