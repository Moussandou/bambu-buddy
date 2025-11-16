import { useState } from 'react';
import type {
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { Job, JobState, Filament } from '../../types';
import { KanbanColumn } from './KanbanColumn';
import { JobCard } from './JobCard';

interface KanbanBoardProps {
  jobs: Job[];
  filaments: Filament[];
  onJobStateChange: (jobId: string, newState: JobState) => void;
  onJobView: (job: Job) => void;
  onJobEdit: (job: Job) => void;
  onJobDelete: (jobId: string) => void;
  currency?: string;
}

const COLUMNS: { id: JobState; title: string; color: string }[] = [
  { id: 'en impression', title: 'En impression', color: 'bg-blue-100 dark:bg-blue-900/20' },
  { id: 'fini', title: 'Terminé', color: 'bg-green-100 dark:bg-green-900/20' },
  { id: 'en vente', title: 'En vente', color: 'bg-yellow-100 dark:bg-yellow-900/20' },
  { id: 'vendu', title: 'Vendu', color: 'bg-purple-100 dark:bg-purple-900/20' },
];

export function KanbanBoard({
  jobs,
  filaments,
  onJobStateChange,
  onJobView,
  onJobEdit,
  onJobDelete,
  currency,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Organise les jobs par colonne
  const jobsByColumn = COLUMNS.reduce((acc, column) => {
    acc[column.id] = jobs.filter((job) => job.state === column.id);
    return acc;
  }, {} as Record<JobState, Job[]>);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Si on drag sur une colonne
    const overColumn = COLUMNS.find((col) => col.id === overId);
    if (overColumn) {
      const job = jobs.find((j) => j.id === activeId);
      if (job && job.state !== overColumn.id) {
        onJobStateChange(activeId, overColumn.id);
      }
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Si on drag sur une colonne
    const overColumn = COLUMNS.find((col) => col.id === overId);
    if (overColumn) {
      const job = jobs.find((j) => j.id === activeId);
      if (job && job.state !== overColumn.id) {
        onJobStateChange(activeId, overColumn.id);
      }
    }
  }

  const activeJob = activeId ? jobs.find((j) => j.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            color={column.color}
            count={jobsByColumn[column.id].length}
          >
            <SortableContext items={jobsByColumn[column.id].map((j) => j.id)}>
              <div className="space-y-3">
                {jobsByColumn[column.id].map((job) => (
                  <div key={job.id} id={job.id}>
                    <JobCard
                      job={job}
                      filaments={filaments}
                      onView={onJobView}
                      onEdit={onJobEdit}
                      onDelete={onJobDelete}
                      onStateChange={onJobStateChange}
                      currency={currency}
                      isDragging={activeId === job.id}
                    />
                  </div>
                ))}
              </div>
            </SortableContext>
          </KanbanColumn>
        ))}
      </div>

      <DragOverlay>
        {activeJob && (
          <JobCard
            job={activeJob}
            filaments={filaments}
            onView={onJobView}
            onEdit={onJobEdit}
            onDelete={onJobDelete}
            currency={currency}
            isDragging
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
