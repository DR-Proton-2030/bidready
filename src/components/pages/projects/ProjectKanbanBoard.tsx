"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    defaultDropAnimationSideEffects,
    DropAnimation,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IProject } from "@/@types/interface/project.interface";
import { BoardCard } from "@/components/shared";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import {
    Zap,
    Clock,
    Calendar,
    CheckCircle2,
    Plus,
    MoreHorizontal
} from "lucide-react";

// --- Types ---
type ColumnId = "active" | "in-progress" | "planning" | "completed" | "on-hold";

interface ProjectKanbanBoardProps {
    projects: IProject[];
}

interface Column {
    id: ColumnId;
    title: string;
    icon: React.ReactNode;
    gradient: string;
    accentColor: string;
    bgColor: string;
}

const COLUMNS: Column[] = [
    {
        id: "active",
        title: "Active",
        icon: <Zap className="w-4 h-4" />,
        gradient: "from-emerald-500 to-teal-600",
        accentColor: "text-emerald-600",
        bgColor: "bg-white emerald-50"
    },
    {
        id: "in-progress",
        title: "In Progress",
        icon: <Clock className="w-4 h-4" />,
        gradient: "from-amber-500 to-orange-600",
        accentColor: "text-amber-600",
        bgColor: "bg-white amber-200"
    },

    {
        id: "completed",
        title: "Completed",
        icon: <CheckCircle2 className="w-4 h-4" />,
        gradient: "from-slate-400 to-slate-600",
        accentColor: "text-slate-600",
        bgColor: "bg-white slate-200"
    },
    {
        id: "on-hold",
        title: "On Hold",
        icon: <Clock className="w-4 h-4" />,
        gradient: "from-orange-400 to-orange-500",
        accentColor: "text-orange-600",
        bgColor: "bg-white orange-50"
    },
];

// --- Sortable Item Component ---
const SortableProjectItem = ({ project }: { project: IProject }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: project._id || '' });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 50 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="touch-none"
        >
            <BoardCard {...project} isDragging={isDragging} />
        </div>
    );
};

// --- Column Component ---
const KanbanColumn = ({
    column,
    projects,
    isOver = false,
}: {
    column: Column;
    projects: IProject[];
    isOver?: boolean;
}) => {
    const { setNodeRef } = useSortable({
        id: column.id,
        data: {
            type: "Column",
            column,
        },
        disabled: true,
    });

    return (
        <div
            ref={setNodeRef}
            className={`
                flex flex-col
                min-w-[280px] w-full
                h-full
                rounded-2xl
                transition-all duration-300
                ${isOver ? 'ring-2 ring-orange-400 ring-offset-2' : ''}
            `}
        >
            {/* Column Header */}
            <div className={`
                flex items-center justify-between
                p-4 mb-3
                rounded-xl
                ${column.bgColor}
                backdrop-blur-sm
                border border-white/60
            `}>
                <div className="flex items-center gap-3">
                    {/* Icon with gradient background */}
                    <div className={`
                        p-2 rounded-lg
                        bg-gradient-to-br ${column.gradient}
                        text-white
                        shadow-lg shadow-${column.id === 'active' ? 'emerald' : column.id === 'in-progress' ? 'amber' : column.id === 'planning' ? 'blue' : column.id === 'on-hold' ? 'orange' : 'slate'}-500/25
                    `}>
                        {column.icon}
                    </div>

                    <div>
                        <h3 className={`font-semibold text-sm ${column.accentColor}`}>
                            {column.title}
                        </h3>
                        <p className="text-xs text-slate-400">
                            {projects.length} {projects.length === 1 ? 'project' : 'projects'}
                        </p>
                    </div>
                </div>

                {/* More Options */}
                <button className="
                    p-1.5 rounded-lg
                    hover:bg-white/60
                    text-slate-400 hover:text-slate-600
                    transition-colors
                ">
                    <MoreHorizontal className="w-4 h-4" />
                </button>
            </div>

            {/* Cards Container */}
            <div className={`
                flex-1
                overflow-y-auto
                space-y-3
                p-1
                pb-4
                min-h-[200px]
                max-h-[calc(100vh-320px)]
                transition-colors duration-200
                rounded-xl
                ${isOver ? 'bg-orange-50/50' : ''}
            `}>
                <SortableContext
                    items={projects.map((p) => p._id || '').filter(Boolean)}
                    strategy={verticalListSortingStrategy}
                >
                    {projects.map((project) => (
                        <SortableProjectItem key={project._id} project={project} />
                    ))}
                </SortableContext>

                {/* Empty State */}
                {projects.length === 0 && (
                    <div className={`
                        h-32 rounded-xl
                        border-2 border-dashed
                        ${isOver ? 'border-orange-300 bg-orange-50' : 'border-slate-200'}
                        flex flex-col items-center justify-center
                        text-slate-400
                        transition-all duration-200
                    `}>
                        <Plus className={`w-5 h-5 mb-1 ${isOver ? 'text-orange-400' : ''}`} />
                        <span className={`text-xs ${isOver ? 'text-orange-500 font-medium' : ''}`}>
                            {isOver ? 'Drop here' : 'No projects'}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Main Board Component ---
const ProjectKanbanBoard: React.FC<ProjectKanbanBoardProps> = ({
    projects: initialProjects,
}) => {
    const router = useRouter();
    const [projects, setProjects] = useState<IProject[]>(initialProjects);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [overId, setOverId] = useState<string | null>(null);

    useEffect(() => {
        setProjects(initialProjects);
    }, [initialProjects]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const projectsByStatus = useMemo(() => {
        const grouped: Record<ColumnId, IProject[]> = {
            active: [],
            "in-progress": [],
            planning: [],
            completed: [],
            "on-hold": [],
        };

        projects.forEach((project) => {
            const status = (project.status || "planning").toLowerCase() as ColumnId;
            if (grouped[status]) {
                grouped[status].push(project);
            } else {
                grouped["planning"].push(project);
            }
        });
        return grouped;
    }, [projects]);

    const findContainer = (id: string): ColumnId | undefined => {
        if ((COLUMNS.map(c => c.id) as string[]).includes(id)) {
            return id as ColumnId;
        }

        const project = projects.find((p) => p._id === id);
        if (project) {
            return (project.status || "planning").toLowerCase() as ColumnId;
        }
        return undefined;
    };


    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { over } = event;
        setOverId(over?.id as string || null);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        const activeId = active.id as string;
        const overId = over?.id as string;

        setActiveId(null);
        setOverId(null);

        if (!overId) return;

        const activeContainer = findContainer(activeId);
        let overContainer = findContainer(overId);

        if (!activeContainer || !overContainer) return;

        if (activeContainer !== overContainer) {
            const project = projects.find(p => p._id === activeId);
            if (!project) return;

            const newStatus = overContainer;

            // Optimistic Update
            setProjects((prev) =>
                prev.map((p) =>
                    p._id === activeId ? { ...p, status: newStatus } : p
                )
            );

            // API Call
            try {
                const res = await fetch(`/api/projects/${activeId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: newStatus }),
                });

                if (!res.ok) {
                    throw new Error("Failed to update status");
                }

                const columnTitle = COLUMNS.find(c => c.id === newStatus)?.title;
                toast.success(
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Moved to <strong>{columnTitle}</strong></span>
                    </div>
                );
                router.refresh();

            } catch (error) {
                console.error(error);
                toast.error("Failed to update project status");
                setProjects(initialProjects);
            }

        } else {
            const oldIndex = projects.findIndex((p) => p._id === activeId);
            const newIndex = projects.findIndex((p) => p._id === overId);
            if (oldIndex !== newIndex) {
                setProjects((items) => arrayMove(items, oldIndex, newIndex));
            }
        }
    };

    const activeProject = activeId ? projects.find((p) => p._id === activeId) : null;

    const dropAnimation: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    // Determine which column is being hovered
    const getOverColumn = (): ColumnId | null => {
        if (!overId) return null;
        const container = findContainer(overId);
        return container || null;
    };

    const overColumn = getOverColumn();

    return (
        <div className="
            flex 
            min-h-[400px]
            overflow-y-auto 
            gap-5 
            pb-6 
            items-start
            px-1
        ">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                {COLUMNS.map((col) => (
                    <KanbanColumn
                        key={col.id}
                        column={col}
                        projects={projectsByStatus[col.id]}
                        isOver={overColumn === col.id && activeId !== null}
                    />
                ))}

                <DragOverlay dropAnimation={dropAnimation}>
                    {activeProject ? (
                        <div className="rotate-3 scale-105">
                            <BoardCard {...activeProject} isDragging={true} />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
};

export default ProjectKanbanBoard;
