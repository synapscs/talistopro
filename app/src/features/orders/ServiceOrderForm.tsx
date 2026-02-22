import React from 'react';
import { ServiceOrderWizard } from './ServiceOrderWizard';

export const ServiceOrderForm = ({ onSuccess }: { onSuccess?: () => void }) => {
    return <ServiceOrderWizard onSuccess={onSuccess} />;
};
