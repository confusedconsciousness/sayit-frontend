'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {useUser} from '@/components/UserProvider';

export default function AuthPage() {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const {login} = useUser();
    const router = useRouter();

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const user = {email: email.trim(), name: name.trim(), username: username.trim()};
        if (!user.email || !user.name || !user.username) return;
        login(user);
        router.push('/'); // go home after sign-in
    };

    return (
        <div style={{maxWidth: 420}}>
            <h2>Sign up / Sign in</h2>
            <form onSubmit={onSubmit} style={{display: 'grid', gap: 10}}>
                <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}/>
                <input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)}/>
                <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}/>
                <button type="submit">Continue</button>
            </form>
            <p style={{color: '#666', marginTop: 12}}>
                Demo-only local storage login. Do not use for sensitive data.
            </p>
        </div>
    );
}
