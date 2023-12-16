import { useIdToken } from 'react-firebase-hooks/auth';
import { auth } from "./firebase";
import { useEffect, useState } from 'react';
import { Route } from 'react-router-dom';

interface Props {
    path: string;
    exact?: boolean;
    component: React.FC;
}

const PrivateRoute: React.FC<Props> = ({ component: Component, ...rest }) => {
    const [user, loading, error] = useIdToken(auth);
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        if (user) {
            setIsAuth(true);
        } else {
            setIsAuth(false);
        }
    }, [user]);

    if (loading) {
        return <div>Loading...</div>;
    }
    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <Route
            {...rest}
        />
    );
}

export default PrivateRoute;
