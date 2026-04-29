import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
    setAuthStatus: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Login = ({ setAuthStatus }: LoginProps) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    // NEW: State to hold the error message
    const [errorMsg, setErrorMsg] = useState(''); 
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(''); // Clear any previous errors on new attempt
        
        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const data = await response.json();
                setAuthStatus(true); 
                navigate('/bats');   
            } else {
                // If we get a 401 or 403, we trigger the visual error
                setErrorMsg('Signal rejected: Invalid credentials.');
                console.error("Signal rejected: Invalid credentials.");
            }
        } catch (err) {
             // Catch network failures (e.g., if Node server crashes)
             setErrorMsg('Comm link failure: Backend unreachable.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-gray-200">
            <h2 className="text-2xl font-bold mb-6 tracking-widest text-gray-400">RESTRICTED SECTOR</h2>
            <form onSubmit={handleLogin} className="flex flex-col gap-4 w-80">
                <input 
                    type="text" 
                    placeholder="Username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="p-2 bg-neutral-800 border border-gray-600 rounded outline-none focus:border-blue-500"
                />
                <input 
                    type="password" 
                    placeholder="Passcode" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="p-2 bg-neutral-800 border border-gray-600 rounded outline-none focus:border-blue-500"
                />
                <button type="submit" className="mt-4 p-2 bg-gray-700 hover:bg-gray-600 rounded font-semibold transition-colors">
                    INITIATE HANDSHAKE
                </button>

                {/* NEW: Conditional rendering for the error message */}
                {errorMsg && (
                    <div className="mt-2 text-center text-[#e2001a] text-sm font-semibold tracking-wide">
                        {errorMsg}
                    </div>
                )}
            </form>
        </div>
    );
};
