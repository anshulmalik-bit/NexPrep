import { Outlet, useLocation } from 'react-router-dom';
import { Footer } from './Footer';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from './PageTransition';

export function MainLayout() {
    const location = useLocation();

    return (
        <div className="flex flex-col min-h-screen">
            <AnimatePresence mode="wait">
                <PageTransition key={location.pathname}>
                    <Outlet />
                </PageTransition>
            </AnimatePresence>
            <Footer />
        </div>
    );
}
