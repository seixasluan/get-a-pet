import api from '../../../utils/api';

import { useState, useEffect } from 'react';

import styles from './Profile.module.css';
import formStyles from '../../form/Form.module.css';

import Input from '../../form/Input';
import RoundedImage from '../../layout/RoundedImage';

import useFlashMessage from  '../../../hooks/useFlashMessage';

function Profile() {  
  const [user, setUser] = useState({});
  const [token] = useState(localStorage.getItem('token') || '');
  const { setFlashMessage } = useFlashMessage();
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    api.get('/users/checkuser', {
      headers: {
        Authorization: `Bearer ${JSON.parse(token)}`,
      },
    }).then((response) => {
      setUser(response.data);
    });
  }, [token]);

  function onFileChange(e) {
    setPreview(e.target.files[0]);
    setUser({ ...user, [e.target.name]: e.target.files[0] });
  }

  function handleChange(e) {
    setUser({ ...user, [e.target.name]: e.target.value });
  }

  async function handleSubmit (e) {
    e.preventDefault();
    let msgType = 'success';

    const formData = new FormData();

    await Object.keys(user).forEach((key) => formData.append(key, user[key]));

    const data = await api.patch(`/users/edit/${user._id}`, formData, {
      headers: {
        Authorization: `Bearer ${JSON.parse(token)}`,
        'Content-Type': 'multipart/form-data',
      },
    }).then((response) => {
      return response.data;
    }).catch((err) => {
      msgType = 'error';
      return err.response.data
    });

    setFlashMessage(data.message, msgType);

  }

  return (
    <section>
      <div className={styles.profile_header}>
        <h1>Profile</h1>
        {(user.image || preview) && (
          <RoundedImage
            src={
              preview 
              ?  URL.createObjectURL(preview)
              : `${process.env.REACT_APP_API}/images/users/${user.image}`
            }
            alt={user.name}
          />
        )}
      </div>
      <form onSubmit={handleSubmit} className={formStyles.form_container}>
        <Input
          name='image'
          type='file'
          text='Imagem'
          handleOnChange={onFileChange}
        />
        <Input
          name='email'
          type='email'
          text='Email'
          placeholder='Digite o seu email'
          handleOnChange={handleChange}
          value={user.email || ''}
        />
        <Input
          name='name'
          type='text'
          text='Nome'
          placeholder='Digite o novo nome'
          handleOnChange={handleChange}
          value={user.name || ''}
        />
        <Input
          name='phone'
          type='text'
          text='Telefone'
          placeholder='Digite o novo telefone'
          handleOnChange={handleChange}
          value={user.phone || ''}
        />
        <Input
          name='password'
          type='password'
          text='Senha'
          placeholder='Digite a sua senha'
          handleOnChange={handleChange}
        />
        <Input
          name='confirmPassword'
          type='password'
          text='Confirmação de senha'
          placeholder='Confirme a sua senha'
          handleOnChange={handleChange}
        />
        <input type='submit' value='Editar'/>
      </form>
    </section>
  );
}

export default Profile;