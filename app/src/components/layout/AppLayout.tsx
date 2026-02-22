import React from 'react';
import { useNavigation } from '../../hooks/use-navigation';
import { DesktopShell } from './shells/DesktopShell';
import { MobileShell } from './shells/MobileShell';

interface AppLayoutProps {
    children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    const { isMobile } = useNavigation();

    if (isMobile) {
        return <MobileShell>{children}</MobileShell>;
    }

    return <DesktopShell>{children}</DesktopShell>;
};
