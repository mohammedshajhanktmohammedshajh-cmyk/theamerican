import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, TextField, InputAdornment, IconButton, Button } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import axios from 'axios';






const Register = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);


  const [userDetails, setUserDetails] = useState({
    username: '',
    lastname: '',
    email: '',
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');








  console.log("userDetails::::", userDetails);

  /**
   * 处理输入框变化的函数
   * @param {Event} event - 输入框变化事件对象
   */
  const handleChange = (event) => {
    // 从事件对象中获取输入框的name和value
    const { name, value } = event.target;

    setUserDetails((prevstate) => ({
      ...prevstate,
      [name]: value,


    }));
  };

  const handleRegister = async () => {
    console.log("all details", userDetails);
    console.log(!userDetails.username, !userDetails.lastname, !userDetails.email, !userDetails.password,
    );
    if (
      !userDetails.username ||
      !userDetails.lastname ||
      !userDetails.email ||
      !userDetails.password
    ) {
      alert("Please fill in all the required fields.");
      return;
    }

    if (userDetails.password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    const payload = {
      username: userDetails.username,

      email: userDetails.email,
      password: userDetails.password,
    };
    try {
      const response = await axios.post(`${API_URL}/auth/register`, payload);
      alert(response.data?.message || 'Registration successful.');
      navigate("/");
    } catch (error) {
      console.error('Registration error:', error);
      alert(error.response?.data?.message || error.message || 'registration failed!');
    }





  };


  // useEffect(() => {
  //  console.log('register mounted');//
  //return () => {

  // console.log('register unmounted');
  // };
  //  }, []);

  return (
    <>
      <h1>Register page</h1>
      <Box>
        <TextField
          name="username"
          label="username"
          placeholder="enter your username"
          value={userDetails.username}
          onChange={handleChange}
          sx={{ width: '260px' }}
        />
      </Box>

      <br />

      <Box>
        <TextField
          name="lastname"
          label="lastname"
          placeholder="enter your lastname"
          value={userDetails.lastname}
          onChange={handleChange}
          sx={{ width: '260px' }}
        />
      </Box>

      <br />

      <Box>
        <TextField
          name="email"
          label="email"
          placeholder="enter your email"
          value={userDetails.email}
          onChange={handleChange}
          sx={{ width: '260px' }}
        />
      </Box>
      <br />
      {/* PASSWORD */}
      <Box>
        <TextField
          name="password"
          label="password"
          placeholder="enter your password"
          type={showPassword ? 'text' : 'password'}
          value={userDetails.password}
          onChange={handleChange}
          sx={{ width: '260px' }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={handleClickShowPassword}
                    edge="end"
                    sx={{ color: 'text.secondary' }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <br />

      {/* CONFIRM PASSWORD */}
      <Box>
        <TextField
          name="confirmPassword"
          label="confirm password"
          placeholder="re-enter your password"
          type={showConfirmPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          sx={{ width: '260px' }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    type="button"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    onClick={handleClickShowConfirmPassword}
                    edge="end"
                    sx={{ color: 'text.secondary' }}
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>
      <br />
      <Box>
        <button type="button" onClick={() => navigate('/login')}>
          Login
        </button>
      </Box>

      <br />
      <Box>
        <Button variant="contained" color="primary" onClick={handleRegister}>
          Register
        </Button>
      </Box>
    </>
  );

};

export default Register;
