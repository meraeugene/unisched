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

const GreenThemeSchedule: React.FC<Props> = ({
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
        backgroundImage: `radial-gradient(125% 125% at 50% 90%, #ffffff 40%, #22c55e 100%)`,
        backgroundSize: "100% 100%",
        color: "black",
      }}
      className="relative rounded-lg shadow-lg p-6"
    >
      <section className="space-y-10 max-w-sm lg:max-w-md mx-auto">
        <h1 className="text-center text-5xl xl:text-6xl text-black font-[family-name:var(--font-handy)] mb-8 md:mb-10 ">
          Class Schedule
        </h1>

        {daysOfWeek
          .filter((day) => grouped[day]?.length > 0)
          .map((day) => (
            <div key={day} className="relative w-full">
              {/* Shadow Border Layer */}
              <div className="absolute top-2 left-2 w-full h-full bg-black  z-0" />

              {/* Main Card */}
              <div
                key={day}
                className="relative border-2 border-black bg-green-50  z-10"
              >
                {/* Day Label */}
                <div className="absolute -top-5 left-5 bg-green-200 px-10 py-[0.1em] rounded-full font-[family-name:var(--font-handy)] text-xl  text-black border border-black ">
                  {day}
                </div>

                {/* Schedule Entries */}
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
                              color="green"
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

                  {/* Add Button */}
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
                      className="mt-2 flex items-center justify-center gap-2 w-full rounded bg-green-100 border border-green-200 text-green-700 cursor-pointer py-1 hover:bg-green-200 transition-colors font-[family-name:var(--font-handy)]"
                    >
                      <IoMdAdd />
                      Add class to {day}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
      </section>
    </div>
  );
};

export default GreenThemeSchedule;
