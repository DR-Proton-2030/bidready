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
import { ProjectCard } from "@/components/shared";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

// --- Types ---
type ColumnId = "active" | "in-progress" | "planning" | "completed";

interface ProjectKanbanBoardProps {
    projects: IProject[];
}

interface Column {
    id: ColumnId;
    title: string;
}

const COLUMNS: Column[] = [
    { id: "active", title: "Active" },
    { id: "in-progress", title: "In Progress" },
    { id: "planning", title: "Planning" },
    { id: "completed", title: "Completed" },
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
    } = useSortable({ id: project._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="touch-none" // Essential for pointer events on touch devices
        >
            <div className={isDragging ? "cursor-grabbing" : "cursor-grab"}>
                <ProjectCard {...project} />
            </div>
        </div>
    );
};

// --- Column Component ---
const KanbanColumn = ({
    column,
    projects,
}: {
    column: Column;
    projects: IProject[];
}) => {
    const { setNodeRef } = useSortable({
        id: column.id,
        data: {
            type: "Column",
            column,
        },
        disabled: true, // Disable sorting the column itself
    });

    return (
        <div
            ref={setNodeRef}
            className="flex flex-col bg-slate-100/50 rounded-2xl p-4 min-w-[320px] max-w-[320px] h-full"
        >
            <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="font-semibold text-slate-700">{column.title}</h3>
                <span className="bg-white px-2 py-0.5 rounded-full text-xs font-medium text-slate-500 shadow-sm">
                    {projects.length}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 min-h-[100px]">
                <SortableContext
                    items={projects.map((p) => p._id)}
                    strategy={verticalListSortingStrategy}
                >
                    {projects.map((project) => (
                        <SortableProjectItem key={project._id} project={project} />
                    ))}
                </SortableContext>
                {projects.length === 0 && (
                    <div className="h-24 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-sm">
                        Drop here
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
        };

        projects.forEach((project) => {
            const status = (project.status || "planning").toLowerCase() as ColumnId;
            if (grouped[status]) {
                grouped[status].push(project);
            } else {
                // Fallback for unknown statuses
                grouped["planning"].push(project);
            }
        });
        return grouped;
    }, [projects]);

    const findContainer = (id: string): ColumnId | undefined => {
        if ((COLUMNS.map(c => c.id) as string[]).includes(id)) {
            return id as ColumnId;
        }

        // Find column containing the project
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
        const { active, over } = event;
        const overId = over?.id;

        if (!overId || active.id === overId) return;

        // This part is visual only handled by SortableContext usually,
        // but for swapping between columns we might need 'dragOver' logic if using arrayMove 
        // across different states.
        // simpler to just handle drop for status change.
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        const activeId = active.id as string;
        const overId = over?.id as string;

        setActiveId(null);

        if (!overId) return;

        const activeContainer = findContainer(activeId);
        let overContainer = findContainer(overId);

        if (!activeContainer || !overContainer) return;

        if (activeContainer !== overContainer) {
            // Moved to a different column (Status Change)
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
                toast.success(`Project moved to ${COLUMNS.find(c => c.id === newStatus)?.title}`);
                router.refresh();

            } catch (error) {
                console.error(error);
                toast.error("Failed to update project status");
                // Revert optimistic update
                setProjects(initialProjects);
            }

        } else {
            // Reordering within the same column is not persistent but visuals
            // If we want reordering, we need an 'order' field in backend.
            // For now, we just update local state to show reorder effect until refresh
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

    return (
        <div className="flex h-full overflow-x-auto gap-6 pb-4 items-start">
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
                    />
                ))}

                <DragOverlay dropAnimation={dropAnimation}>
                    {activeProject ? (
                        <div className="opacity-80 rotate-2 scale-105">
                            <ProjectCard {...activeProject} />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
};

export default ProjectKanbanBoard;
