import React from 'react';
import { Check, ChevronRight } from 'lucide-react';

interface WorkflowStatusBarProps {
    currentStageId: string;
    stages: any[];
}

export const WorkflowStatusBar: React.FC<WorkflowStatusBarProps> = ({ currentStageId, stages }) => {
    // Encontrar el índice de la etapa actual
    const currentStageIndex = stages.findIndex(s => s.id === currentStageId);

    return (
        <div className="flex items-center w-full justify-between relative px-4 py-8">
            {/* Línea de fondo */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 z-0 mx-12"></div>

            {stages.map((stage, index) => {
                const isCompleted = index < currentStageIndex;
                const isCurrent = index === currentStageIndex;
                const isPending = index > currentStageIndex;

                return (
                    <div key={stage.id} className="relative z-10 flex flex-col items-center group">
                        {/* Círculo de la etapa */}
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${isCompleted
                                    ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                    : isCurrent
                                        ? 'bg-white dark:bg-slate-900 border-indigo-500 text-indigo-500 scale-125 shadow-xl shadow-indigo-500/10'
                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-300'
                                }`}
                        >
                            {isCompleted ? (
                                <Check size={18} strokeWidth={3} />
                            ) : (
                                <span className={`text-xs font-black ${isCurrent ? 'animate-pulse' : ''}`}>
                                    {index + 1}
                                </span>
                            )}
                        </div>

                        {/* Etiqueta */}
                        <div className="absolute top-14 text-center min-w-[100px]">
                            <p className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isCurrent ? 'text-indigo-500' : 'text-slate-400'
                                }`}>
                                {stage.name}
                            </p>
                            {isCurrent && (
                                <div className="h-1 w-1 bg-indigo-500 rounded-full mx-auto mt-1 animate-bounce"></div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
