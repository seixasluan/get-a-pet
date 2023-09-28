import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';

// components
import Input from '../../form/Input';

import styles from '../../form/Form.module.css';

// context
import { Context } from '../../../context/UserContext';

function Login () {

  const [user, setUser] = useState({});
  const { login } = useContext(Context);

  function handleSubmit(e) {
    e.preventDefault();
    login(user);
  }

  function handleChange(e) {
    setUser({...user, [e.target.name]: e.target.value});
    console.log(user);
  }

  return (
    <section className={styles.form_container}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <Input
          type='email'
          name='email'
          placeholder='Digite seu email'
          text='Email'
          handleOnChange={handleChange}
        />
        <Input
          type='password'
          name='password'
          placeholder='Digite sua senha'
          text='Senha'
          handleOnChange={handleChange}
        />

        <input type='submit' value='Entrar'/>
      </form>
      <p>
        Não possui uma conta? <Link to='/register'>Clique Aqui!</Link>
      </p>
    </section>
  );
}

export default Login;