import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Login =() => {
    const [user, setUser] = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData, [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(formData.email, formData.password);
    };



    return (
        
        <div>
            <h2>Login</h2>

        </div>
    );
}

export default Login;