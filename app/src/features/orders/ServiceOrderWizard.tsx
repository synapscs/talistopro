import React, { useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { getEffectiveTerminology } from '../../lib/terminology';
import { ChevronRight, Check, Save, Loader2, ClipboardList, PenTool, User, Laptop } from 'lucide-react';
import { useCreateOrder } from '../../hooks/useApi';

// Steps
import { Step1Customer } from './steps/Step1Customer';
import { Step2Asset } from './steps/Step2Asset';
import { Step3Diagnosis } from './steps/Step3Diagnosis';
import { Step4Quote } from './steps/Step4Quote';

export const ServiceOrderWizard = ({ onSuccess }: { onSuccess?: () => void }) => {
    const { organization } = useAuthStore();

    // Obtener terminología dinámica sincronizada
    const terminology = getEffectiveTerminology(organization?.businessType, organization?.customTerminology);
    const { orderLabel, assetLabel } = terminology;

    // Global Wizard State
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<any>({
        customer: null,
        asset: null,
        assignedToId: '',
        priority: 2,
        estimatedDate: '',
        description: '',
        diagnosis: '',
        internalNotes: '',
        checklist: [],
        items: [],
        subtotal: 0,
        taxAmount: 0,
        discountAmount: 0,
        total: 0,
        photos: [] // Array of URLs
    });
    const [success, setSuccess] = useState(false);

    const createOrder = useCreateOrder();

    // Navigation Handlers
    const updateFormData = (newData: any) => {
        setFormData((prev: any) => ({ ...prev, ...newData }));
    };

    const nextStep = () => {
        if (currentStep < 4) setCurrentStep(prev => prev + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
    };

    const goToStep = (step: number) => {
        if (step < currentStep) setCurrentStep(step);
    };

    // Final Submission
    const handleSubmit = async () => {
        if (!formData.customer?.id || !formData.asset?.id) return;

        try {
            await createOrder.mutateAsync({
                customerId: formData.customer.id,
                assetId: formData.asset.id,
                assignedToId: formData.assignedToId,
                description: formData.description,
                diagnosis: formData.diagnosis,
                internalNotes: formData.internalNotes,
                priority: formData.priority,
                estimatedDate: formData.estimatedDate,

                // Financials
                subtotal: formData.subtotal,
                taxAmount: formData.taxAmount,
                discountAmount: formData.discountAmount,
                total: formData.total,

                checklist: formData.checklist,
                items: formData.items,
                photos: formData.photos
            });

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                if (onSuccess) {
                    onSuccess();
                } else {
                    // Fallback to reset if no onSuccess provided
                    setCurrentStep(1);
                    setFormData({
                        customer: null,
                        asset: null,
                        assignedToId: '',
                        priority: 2,
                        estimatedDate: '',
                        description: '',
                        diagnosis: '',
                        internalNotes: '',
                        checklist: [],
                        items: [],
                        subtotal: 0,
                        taxAmount: 0,
                        discountAmount: 0,
                        total: 0,
                        photos: []
                    });
                }
            }, 2000);
        } catch (error) {
            console.error('Error creating order:', error);
        }
    };

    // Steps Configuration
    const steps = [
        { id: 1, label: 'Cliente', icon: User, isValid: !!formData.customer },
        { id: 2, label: assetLabel, icon: Laptop, isValid: !!formData.asset },
        { id: 3, label: 'Diagnóstico', icon: ClipboardList, isValid: !!formData.description },
        { id: 4, label: 'Cotización', icon: PenTool, isValid: true }
    ];

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[600px]">

            {/* Top Bar: Progress & Title */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/50">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                            Crear {orderLabel}
                        </h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                            Paso {currentStep} de 4: {steps[currentStep - 1].label}
                        </p>
                    </div>
                    {success && (
                        <div className="flex items-center space-x-2 text-green-600 bg-green-50 dark:bg-green-500/10 px-4 py-2 rounded-xl animate-bounce">
                            <Check size={18} strokeWidth={3} />
                            <span className="text-xs font-bold uppercase tracking-widest">¡Orden Creada!</span>
                        </div>
                    )}
                </div>

                {/* Progress Indicators */}
                <div className="flex items-center justify-between relative">
                    {/* Connecting Line */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-slate-800 -z-10 rounded-full"></div>
                    <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary-600 -z-10 rounded-full transition-all duration-500"
                        style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                    ></div>
                    
                    {steps.map((step) => (
                        <div
                            key={step.id}
                            className={`
                                flex flex-col items-center justify-center w-10 h-10 rounded-full border-4 transition-all z-10 cursor-default
                                ${currentStep === step.id
                                    ? 'bg-primary-600 border-primary-200 dark:border-primary-900 text-white scale-110 shadow-lg shadow-primary-600/30'
                                    : step.id < currentStep
                                        ? 'bg-primary-600 border-primary-600 text-white'
                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-300'}
                            `}
                        >
                            {step.id < currentStep ? <Check size={16} strokeWidth={3} /> : <step.icon size={16} />}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                {currentStep === 1 && (
                    <Step1Customer
                        data={formData}
                        onUpdate={updateFormData}
                        onNext={nextStep}
                    />
                )}
                {currentStep === 2 && (
                    <Step2Asset
                        data={formData}
                        onUpdate={updateFormData}
                        onNext={nextStep}
                    />
                )}
                {currentStep === 3 && (
                    <Step3Diagnosis
                        data={formData}
                        onUpdate={updateFormData}
                        onNext={nextStep}
                    />
                )}
                {currentStep === 4 && (
                    <Step4Quote
                        data={formData}
                        onUpdate={updateFormData}
                        onNext={nextStep}
                    />
                )}
            </div>

            {/* Footer: Navigation Buttons */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center backdrop-blur-md">
                <button
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                    Atrás
                </button>

                {currentStep < 4 ? (
                    <button
                        onClick={nextStep}
                        disabled={!steps[currentStep - 1].isValid}
                        className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-500 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-primary-600/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        <span>Siguiente</span>
                        <ChevronRight size={16} />
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={createOrder.isPending}
                        className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-500 text-white px-10 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-primary-600/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                    >
                        {createOrder.isPending ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        <span>{createOrder.isPending ? 'Guardando...' : `Registrar ${orderLabel}`}</span>
                    </button>
                )}
            </div>

        </div>
    );
};
