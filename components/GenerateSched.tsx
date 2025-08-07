"use client";

import { useState, useRef } from "react";
import { ParsedSchedule } from "@/utils/parseScheduleFromText";
import { daysOfWeek, groupSchedule } from "@/utils/groupSchedule";
import { toast } from "sonner";
import SupportedCOR from "./SupportedCOR";
import { toPng } from "html-to-image";
import { extractMinutes } from "@/utils/extractMinutes";
import { ScheduleWithId } from "@/types";
import BlueThemeSchedule from "./designs/BlueThemeSchedule";
import GreenThemeSchedule from "./designs/GreenThemeSchedule";
import { IoCheckmark, IoColorPaletteOutline } from "react-icons/io5";
import { FiEdit2 } from "react-icons/fi";
import { FaPalette } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { CiSaveDown2 } from "react-icons/ci";

const GenerateSched = () => {
  const [schedule, setSchedule] = useState<ParsedSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const scheduleRef = useRef<HTMLDivElement>(null);
  const [selectedTheme, setSelectedTheme] = useState<"blue" | "green">("blue");
  const [showThemeModal, setShowThemeModal] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setProgress(25);
    setLoadingMessage("Processing your PDF...");

    try {
      // Step 1: OCR
      const ocrRes = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });

      if (!ocrRes.ok) {
        throw new Error("OCR failed");
      }

      const ocrData = await ocrRes.json();
      const extractedText = ocrData.text;

      const cleanedText = extractedText
        .replace(/(\r\n|\r|\n)/g, " ") // collapse newlines
        .replace(/\s{2,}/g, " ") // remove extra spaces
        .trim();

      setProgress(99);
      setLoadingMessage("Generating schedule with AI...");

      // Step 2: AI parsing
      const genRes = await fetch("/api/generate-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanedText }),
      });

      if (!genRes.ok) {
        throw new Error("Failed to generate schedule");
      }

      const data = await genRes.json();

      data.schedule.sort(
        (a: ScheduleWithId, b: ScheduleWithId) =>
          extractMinutes(a.time) - extractMinutes(b.time)
      );

      setProgress(95);
      setLoadingMessage("Finalizing schedule...");

      setSchedule(data.schedule);
      toast.success("Schedule generated successfully!");
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
        // width: 1080,
        // height: 1920,
        pixelRatio: 2,
      });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "schedule.png";
      link.click();
      toast.success("Schedule saved as image!");
    } catch (error) {
      console.error("Export error", error);
      toast.error("Failed to export image.");
    }
  };

  const deleteScheduleEntry = (id: string) => {
    setSchedule((prev) => prev.filter((entry) => entry.id !== id));
  };

  const moveEntry = (index: number, direction: -1 | 1) => {
    const entry = schedule[index];
    const sameDayItems = schedule.filter((s) => s.day === entry.day);
    const sameDayIndices = sameDayItems.map((item) =>
      schedule.findIndex((s) => s.id === item.id)
    );

    const posInDay = sameDayIndices.indexOf(index);
    const newPosInDay = posInDay + direction;

    if (newPosInDay < 0 || newPosInDay >= sameDayIndices.length) {
      return; // Do nothing if out of bounds
    }

    const targetIndex = sameDayIndices[newPosInDay];
    const newSchedule = [...schedule];

    const temp = newSchedule[index];
    newSchedule[index] = newSchedule[targetIndex];
    newSchedule[targetIndex] = temp;

    setSchedule(newSchedule);
  };

  const sharedProps = {
    schedule,
    grouped,
    daysOfWeek,
    isEditing,
    setSchedule,
    updateScheduleField,
    deleteScheduleEntry,
    moveEntry,
    scheduleRef,
  };

  return (
    <main className="min-h-screen     flex flex-col items-center justify-center  text-gray-900 overflow-hidden ">
      <div className="w-full   space-y-8 z-10 ">
        {/* Title */}
        {schedule.length === 0 && !loading && (
          <div className=" text-blue-700 text-center  mb-0">
            <h1 className="font-[family-name:var(--font-handy)]  text-5xl font-extrabold">
              AI Schedule
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

        {/* Supported University CORS*/}
        {schedule.length === 0 && !loading && (
          <div className="flex flex-col items-center ">
            <SupportedCOR />
            <p className="mt-4 text-lg text-blue-900 max-w-[250px] mx-auto font-[family-name:var(--font-handy)] text-center">
              These are the supported class schedule formats (COR) you can
              upload.
            </p>
            <p className="mt-4 text-xs font-[family-name:var(--font-sans)] text-gray-700 max-w-[250px] mx-auto  text-center">
              Please download the pdf before uploading.
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
            <div className="text-center space-y-1">
              <p className="font-medium text-xl animate-pulse  font-[family-name:var(--font-handy)]">
                {loadingMessage}
              </p>

              <p className="font-medium text-xs mt-0 max-w-sm  text-blue-600  font-[family-name:var(--font-sans)]">
                Please wait while we process your schedule.
              </p>

              <p className="font-medium text-xs mt-2 max-w-xs  text-black/60 font-[family-name:var(--font-sans)]">
                This schedule is AI-generated and may not be 100% accurate — but
                don’t worry, you can review and edit it as needed.
              </p>
            </div>
          </div>
        )}

        {/* Generated Schedule */}
        {!loading && schedule.length > 0 && (
          <>
            {/* Floating Buttons */}
            <div className="floating-buttons hide-when-exporting fixed bottom-0 right-6 z-50 flex flex-col items-end space-y-2">
              <button
                onClick={() => setShowThemeModal(true)}
                className="w-12 flex flex-col items-center justify-center h-12 cursor-pointer rounded-full bg-white text-black hover:bg-gray-100 text-sm shadow-sm font-[family-name:var(--font-handy)]"
                title="Change Theme"
              >
                <IoColorPaletteOutline />
                <span className="text-xs text-gray-600">Theme</span>
              </button>

              <button
                onClick={() => setSchedule([])}
                className="w-12 h-12   flex flex-col items-center justify-center  cursor-pointer rounded-full bg-white text-black hover:bg-gray-100 text-sm shadow-sm font-[family-name:var(--font-handy)]"
                title="Reset Schedule"
              >
                ↻<span className="text-xs text-gray-600">Reset</span>
              </button>

              <button
                onClick={() => {
                  const editingNow = !isEditing;
                  setIsEditing(editingNow);
                  if (!editingNow)
                    toast.success("Schedule updated successfully!");
                }}
                className={`w-12 h-12 flex-col cursor-pointer rounded-full text-sm shadow-sm flex items-center justify-center font-[family-name:var(--font-handy)] ${
                  isEditing
                    ? "bg-green-200 text-black hover:bg-green-300"
                    : "bg-white text-black hover:bg-gray-100"
                }`}
                title={isEditing ? "Done Editing" : "Edit Schedule"}
              >
                {isEditing ? (
                  <IoCheckmark className="text-xs" />
                ) : (
                  <FiEdit2 className="text-[11px]" />
                )}
                <span className="text-xs text-gray-600">Edit</span>
              </button>

              <button
                onClick={handleExportImage}
                className="w-12 h-12 cursor-pointer rounded-full bg-white text-black hover:bg-gray-100 shadow-sm flex-col flex items-center justify-center font-[family-name:var(--font-handy)]"
                title="Save Schedule as Image"
              >
                <CiSaveDown2 className="text-sm" />
                <span className="text-xs text-gray-600">Save</span>
              </button>
            </div>

            {selectedTheme === "blue" && <BlueThemeSchedule {...sharedProps} />}
            {selectedTheme === "green" && (
              <GreenThemeSchedule {...sharedProps} />
            )}
          </>
        )}

        {showThemeModal && (
          <div className="fixed  inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur-md p-4 ">
            <div className="bg-white/30  border border-white/20 shadow-xl rounded-2xl p-6 w-full max-w-md backdrop-blur-md transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-700 font-[family-name:var(--font-handy)]">
                  Choose a Schedule Theme
                </h2>
                <button
                  onClick={() => setShowThemeModal(false)}
                  className="text-gray-600 cursor-pointer hover:text-gray-800 transition"
                  aria-label="Close"
                >
                  <IoClose className="text-2xl" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setSelectedTheme("blue");
                    setShowThemeModal(false);
                  }}
                  className="flex font-[family-name:var(--font-apricot)] items-center justify-center gap-2 px-5 cursor-pointer py-3 rounded-lg bg-gradient-to-tr text-xl  from-blue-300 to-blue-500 text-white font-medium hover:scale-[1.03] hover:shadow-lg transition-all duration-200"
                >
                  <FaPalette />
                  Blue Theme
                </button>

                <button
                  onClick={() => {
                    setSelectedTheme("green");
                    setShowThemeModal(false);
                  }}
                  className="flex items-center cursor-pointer  font-[family-name:var(--font-handy)] text-xl justify-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-tr from-green-300 to-green-500 text-black font-medium hover:scale-[1.03] hover:shadow-lg transition-all duration-200"
                >
                  <FaPalette />
                  Green Theme
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default GenerateSched;
