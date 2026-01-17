import { Outlet } from 'react-router-dom';
import { Footer } from './Footer';

export function MainLayout() {
    return (
        <div className="flex flex-col min-h-screen">
            <Outlet />
            <Footer />
        </div>
    );
}
