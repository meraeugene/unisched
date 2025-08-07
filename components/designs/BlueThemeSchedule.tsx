"use client";

import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { SortableItem } from "../SortableItem";
import { IoMdAdd } from "react-icons/io";
import { ParsedSchedule } from "@/utils/parseScheduleFromText";

interface Props {
  schedule: ParsedSchedule[];
  grouped: Record<string, ParsedSchedule[]>;
  daysOfWeek: string[];
  isEditing: boolean;
  setSchedule: React.Dispatch<React.SetStateAction<ParsedSchedule[]>>;
  updateScheduleField: (
    index: number,
    key: keyof ParsedSchedule,
    value: string
  ) => void;
  deleteScheduleEntry: (id: string) => void;
  moveEntry: (index: number, direction: -1 | 1) => void;
  scheduleRef: React.RefObject<HTMLDivElement | null>;
}

const BlueThemeSchedule: React.FC<Props> = ({
  schedule,
  grouped,
  daysOfWeek,
  isEditing,
  setSchedule,
  updateScheduleField,
  deleteScheduleEntry,
  moveEntry,
  scheduleRef,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    })
  );

  const getItemsForDay = (day: string) => grouped[day].map((item) => item.id);

  const handleDragEnd = (event: DragEndEvent, day: string) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const currentItems = grouped[day];
    const oldIndex = currentItems.findIndex((i) => i.id === active.id);
    const newIndex = currentItems.findIndex((i) => i.id === over.id);

    const activeItem = currentItems[oldIndex];
    const reordered = [...currentItems];
    reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, activeItem);

    const newSchedule = schedule.filter((s) => s.day !== day);
    setSchedule([...newSchedule, ...reordered]);
  };

  return (
    <div
      ref={scheduleRef}
      style={{
        backgroundImage: `radial-gradient(125% 125% at 50% 90%, #ffffff 40%, #2563eb 100%)`,
        backgroundSize: "100% 100%",
        color: "black",
      }}
      className="relative rounded-lg shadow-lg p-6"
    >
      <section className="space-y-10 max-w-sm lg:max-w-md mx-auto">
        <h1 className="text-center text-4xl lg:text-5xl xl:text-6xl text-white font-[family-name:var(--font-apricot)] mb-10 md:mb-14">
          Class Schedule
        </h1>

        {daysOfWeek
          .filter((day) => grouped[day]?.length > 0)
          .map((day) => (
            <div
              key={day}
              className="relative border border-blue-200 rounded-md bg-blue-50"
            >
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-white px-10 py-1 rounded-full font-[family-name:var(--font-apricot)] font-semibold text-blue-800 border border-blue-200">
                {day}
              </div>

              <div className="flex flex-col gap-y-4 p-4 pt-6">
                {grouped[day].length > 0 ? (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(event) => handleDragEnd(event, day)}
                  >
                    <SortableContext
                      items={getItemsForDay(day)}
                      strategy={verticalListSortingStrategy}
                    >
                      {grouped[day].map((item) => {
                        const index = schedule.findIndex(
                          (s) => s.id === item.id
                        );

                        return (
                          <SortableItem
                            color="blue"
                            key={item.id}
                            item={item}
                            deleteScheduleEntry={deleteScheduleEntry}
                            index={index}
                            isEditing={isEditing}
                            moveEntry={moveEntry}
                            updateScheduleField={updateScheduleField}
                          />
                        );
                      })}
                    </SortableContext>
                  </DndContext>
                ) : (
                  <div className="text-gray-500 text-center italic font-[family-name:var(--font-sans)]">
                    No classes
                  </div>
                )}

                {isEditing && (
                  <button
                    onClick={() =>
                      setSchedule((prev) => [
                        ...prev,
                        {
                          id: Date.now().toString(),
                          code: "",
                          subject: "",
                          day,
                          time: "",
                          room: "",
                          instructor: "TBA",
                        },
                      ])
                    }
                    className="mt-2 flex items-center justify-center gap-2 w-full rounded bg-blue-100 text-blue-700 cursor-pointer py-1 hover:bg-blue-200 transition-colors font-[family-name:var(--font-handy)]"
                  >
                    <IoMdAdd />
                    Add class to {day}
                  </button>
                )}
              </div>
            </div>
          ))}
      </section>
    </div>
  );
};

export default BlueThemeSchedule;
