import { useMemo } from 'react';
import { useMediaQuery } from './use-media-query';
import { getNavigationConfig, NavItem } from '../config/navigation';
import { useAuthStore } from '../stores/useAuthStore';
import { getEffectiveTerminology } from '../lib/terminology';

export const useNavigation = () => {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const { organization } = useAuthStore();

    const menuItems = useMemo(() => {
        if (!organization) return [];

        const terminology = getEffectiveTerminology(
            organization.businessType,
            organization.customTerminology
        );

        const config = getNavigationConfig(terminology, organization.slug);

        return config.filter(item =>
            isMobile
                ? item.platforms.includes('mobile')
                : item.platforms.includes('desktop')
        );
    }, [isMobile, organization]);

    return {
        isMobile,
        menuItems,
        organization
    };
};
