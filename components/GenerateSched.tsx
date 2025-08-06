"use client";

import { useState, useRef } from "react";
import { CiSaveDown2 } from "react-icons/ci";
import { ParsedSchedule } from "@/utils/parseScheduleFromText";
import { daysOfWeek, groupSchedule } from "@/utils/groupSchedule";
import { toast } from "sonner";
import SupportedCOR from "./SupportedCOR";
import { toPng } from "html-to-image";
import { extractMinutes } from "@/utils/extractMinutes";
import { IoMdAdd } from "react-icons/io";
import { ScheduleWithId } from "@/types";
import { IoCheckmark } from "react-icons/io5";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { FiEdit2 } from "react-icons/fi";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";

const GenerateSched = () => {
  const [schedule, setSchedule] = useState<ParsedSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("Class Schedule");
  const [isEditing, setIsEditing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const scheduleRef = useRef<HTMLDivElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setProgress(10); // Start
    setLoadingMessage("Extracting text from pdf...");

    try {
      // Step 1: OCR
      const ocrRes = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });

      setProgress(40); // halfway through OCR

      if (!ocrRes.ok) {
        throw new Error("OCR failed");
      }

      const ocrData = await ocrRes.json();
      const extractedText = ocrData.text;

      const cleanedText = extractedText
        .replace(/(\r\n|\r|\n)/g, " ") // collapse newlines
        .replace(/\s{2,}/g, " ") // remove extra spaces
        .trim();

      setProgress(50);
      setLoadingMessage("Generating schedule with AI...");

      // Step 2: AI parsing
      const genRes = await fetch("/api/generate-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanedText }),
      });

      setProgress(80);

      if (!genRes.ok) {
        throw new Error("Failed to generate schedule");
      }

      const data = await genRes.json();

      data.schedule.sort(
        (a: ScheduleWithId, b: ScheduleWithId) =>
          extractMinutes(a.time) - extractMinutes(b.time)
      );

      setSchedule(data.schedule);
      toast.success("Schedule generated successfully!");

      setProgress(100);
    } catch (err) {
      console.error("Error:", err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
      setProgress(0);
      setLoadingMessage("");
    }
  };

  const updateScheduleField = (
    index: number,
    key: keyof ParsedSchedule,
    value: string
  ) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[index] = {
      ...updatedSchedule[index],
      [key]: value,
    };
    setSchedule(updatedSchedule);
  };

  const grouped = groupSchedule(schedule);

  const handleExportImage = async () => {
    if (!scheduleRef.current) {
      toast.error("Schedule not found for export");
      return;
    }

    try {
      const dataUrl = await toPng(scheduleRef.current, {
        cacheBust: true,
        filter: (node) => !node.classList?.contains("hide-when-exporting"),
      });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${title || "schedule"}.png`;
      link.click();
      toast.success("Schedule saved as image!");
    } catch (error) {
      console.error("Export error", error);
      toast.error("Failed to export image.");
    }
  };

  const sensors = useSensors(useSensor(PointerSensor));

  // Utility to get items by day (used in DnD sortable context)
  const getItemsForDay = (day: string) =>
    schedule.filter((item) => item.day === day).map((item) => item.id);

  // Handler when drag ends
  const handleDragEnd = (event: DragEndEvent, currentDay: string) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const currentItems = schedule.filter((s) => s.day === currentDay);
    const oldIndex = currentItems.findIndex((item) => item.id === active.id);
    const newIndex = currentItems.findIndex((item) => item.id === over.id);

    const movedItems = arrayMove(currentItems, oldIndex, newIndex);

    // Replace the reordered items into the full schedule
    const newSchedule = [
      ...schedule.filter((s) => s.day !== currentDay),
      ...movedItems,
    ];

    setSchedule(newSchedule);
  };

  const deleteScheduleEntry = (id: string) => {
    setSchedule((prev) => prev.filter((entry) => entry.id !== id));
  };

  return (
    <main className="min-h-screen     flex flex-col items-center justify-center  text-gray-900 overflow-hidden ">
      <div className="w-full   space-y-8 z-10 ">
        {/* Title */}
        {schedule.length === 0 && !loading && (
          <div className=" text-blue-700 text-center  mb-0">
            <h1 className="font-[family-name:var(--font-handy)]  text-5xl font-extrabold">
              Ai Sched Generator
            </h1>
            <span className="text-blue-900 font-[family-name:var(--font-handy)] text-lg">
              {" "}
              Upload Your Class Schedule (PDF)
            </span>
          </div>
        )}

        {/* Upload Input */}
        {!loading && schedule.length === 0 && (
          <div className="flex justify-center mt-6 mb-8 ">
            <input
              type="file"
              accept=".pdf"
              onChange={handleUpload}
              className="block w-full  max-w-xs text-sm text-gray-700 border border-blue-300 rounded-lg cursor-pointer bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        )}

        {/* COR Example Preview */}
        {schedule.length === 0 && !loading && (
          <div className="flex flex-col items-center ">
            <SupportedCOR />
            <p className="mt-4 text-lg text-blue-900 max-w-[250px] mx-auto font-[family-name:var(--font-handy)] text-center">
              These are the supported class schedule formats (COR) you can
              upload.
            </p>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center gap-3 text-blue-700">
            <div className="relative w-12 h-12">
              <svg
                className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"
                viewBox="0 0 24 24"
              ></svg>
              {progress > 0 && (
                <span className="font-[family-name:var(--font-handy)] text-lg absolute top-1/2 left-1/2  text-blue-700 transform -translate-x-1/2 -translate-y-1/2 font-semibold">
                  {progress}%
                </span>
              )}
            </div>
            <p className="font-medium text-xl  font-[family-name:var(--font-handy)]">
              {loadingMessage}
            </p>
          </div>
        )}

        {/* Generated Schedule */}
        {!loading && schedule.length > 0 && (
          <div
            ref={scheduleRef}
            style={{
              backgroundImage: `radial-gradient(125% 125% at 50% 90%, #ffffff 40%, #2563eb 100%)`,
              backgroundSize: "100% 100%",
              color: "black", // ensure text is readable
            }}
            className="relative rounded-lg shadow-lg p-6"
          >
            <section className="space-y-10 max-w-sm lg:max-w-md  mx-auto">
              {isEditing ? (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-center text-4xl lg:text-5xl xl:text-6xl text-white font-[family-name:var(--font-apricot)] mb-10 md:mb-14 focus:ring-2 focus:ring-blue-400 border border-blue-300 rounded   outline-none py-1 h-full w-full"
                />
              ) : (
                <h1 className="text-center text-4xl  lg:text-5xl xl:text-6xl text-white font-[family-name:var(--font-apricot)] mb-10 md:mb-14 ">
                  {title}
                </h1>
              )}

              {/* Buttons */}
              <div className="floating-buttons hide-when-exporting fixed bottom-0 right-6 z-50 flex flex-col items-end space-y-2">
                <button
                  onClick={() => setSchedule([])}
                  className="w-12 cursor-pointer  h-12 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors duration-200 shadow-sm font-[family-name:var(--font-handy)]"
                  title="Reset Schedule"
                >
                  ↻
                </button>

                <button
                  onClick={() => {
                    const editingNow = !isEditing;
                    setIsEditing(editingNow);

                    if (!editingNow) {
                      toast.success("Schedule updated successfully!");
                    }
                  }}
                  className={`w-12  cursor-pointer h-12 rounded-full font-[family-name:var(--font-handy)] text-sm transition-colors duration-200 shadow-sm flex items-center justify-center
      ${
        isEditing
          ? "bg-blue-200 text-blue-800 hover:bg-blue-200"
          : "bg-blue-50 text-blue-700 hover:bg-blue-100"
      }`}
                  title={isEditing ? "Done Editing" : "Edit Schedule"}
                >
                  {isEditing ? <IoCheckmark /> : <FiEdit2 />}
                </button>

                <button
                  onClick={handleExportImage}
                  className="w-12 cursor-pointer h-12 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors duration-200 shadow-sm flex items-center justify-center font-[family-name:var(--font-handy)]"
                  title="Save Schedule as Image"
                >
                  <CiSaveDown2 />
                </button>
              </div>

              {daysOfWeek
                .filter((day) => grouped[day]?.length > 0)
                .map((day) => (
                  <div
                    key={day}
                    className="relative border border-blue-200 rounded-md bg-blue-50"
                  >
                    {/* Day Label */}
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-white px-10 py-1 rounded-full font-[family-name:var(--font-apricot)] font-semibold text-blue-800 border border-blue-200">
                      {day}
                    </div>

                    {/* Entries */}
                    <div
                      // className="space-y-4  pt-6"
                      className="flex flex-col gap-y-4 p-4 pt-6"
                    >
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
                                  key={item.id}
                                  item={item}
                                  deleteScheduleEntry={deleteScheduleEntry}
                                  index={index}
                                  isEditing={isEditing}
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
                                day, // ← this ensures the entry goes to the correct day
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
        )}
      </div>
    </main>
  );
};

export default GenerateSched;
