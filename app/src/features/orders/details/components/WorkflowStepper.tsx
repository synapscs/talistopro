import React from 'react';
import { Check, Circle } from 'lucide-react';

interface Stage {
    id: string;
    name: string;
    order: number;
    color?: string;
}

interface WorkflowStepperProps {
    stages: Stage[];
    currentStageId?: string;
}

export const WorkflowStepper = ({ stages, currentStageId }: WorkflowStepperProps) => {
    // Sort stages by order
    const sortedStages = [...stages].sort((a, b) => a.order - b.order);

    // Find current index
    const currentIndex = sortedStages.findIndex(s => s.id === currentStageId);

    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between relative">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0" />

                {sortedStages.map((stage, index) => {
                    const isCompleted = index < currentIndex;
                    const isCurrent = index === currentIndex;
                    const isLastStage = (index === sortedStages.length - 1) && (index === currentIndex);

                    return (
                        <div key={stage.id} className="relative z-10 flex flex-col items-center group">
                            {/* Node */}
                            <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500
                                ${isLastStage
                                    ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20'
                                    : isCompleted
                                        ? 'bg-amber-500 border-amber-500 text-white'
                                        : isCurrent
                                            ? 'bg-white dark:bg-slate-900 border-primary-600 text-primary-600 shadow-lg shadow-primary-600/20 scale-110'
                                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'}
                            `}>
                                {isLastStage || isCompleted ? (
                                    <Check size={18} strokeWidth={3} />
                                ) : isCurrent ? (
                                    <div className="w-2.5 h-2.5 rounded-full bg-primary-600 animate-pulse" />
                                ) : (
                                    <span className="text-[10px] font-black">{index + 1}</span>
                                )}
                            </div>

                            {/* Label */}
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                <span className={`
                                    text-[9px] font-black uppercase tracking-widest transition-colors
                                    ${isLastStage ? 'text-green-600 dark:text-green-400' : isCurrent ? 'text-primary-600 dark:text-primary-400' : isCompleted ? 'text-amber-600 dark:text-amber-500' : 'text-slate-400 dark:text-slate-600'}
                                `}>
                                    {stage.name}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
