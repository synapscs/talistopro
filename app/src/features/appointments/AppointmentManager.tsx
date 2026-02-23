import React from 'react';
import { AppointmentManagerDesktop } from './AppointmentManagerDesktop';
import { AppointmentManagerMobile } from './AppointmentManagerMobile';
import { useNavigation } from '../../hooks/use-navigation';

export const AppointmentManager = () => {
    const { isMobile } = useNavigation();

    if (isMobile) {
        return <AppointmentManagerMobile />;
    }

    return <AppointmentManagerDesktop />;
};
