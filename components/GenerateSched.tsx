"use client";

import { useState, useRef } from "react";
import { CiSaveDown2 } from "react-icons/ci";
import { ParsedSchedule } from "@/utils/parseScheduleFromText";
import { daysOfWeek, groupSchedule } from "@/utils/groupSchedule";
import { toast } from "sonner";
import SupportedCOR from "./SupportedCOR";
import { toPng } from "html-to-image";

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
    setProgress(0);

    const simulatedSteps = [
      { step: "Getting things ready...", progress: 5 },
      { step: "Uploading your PDF...", progress: 15 },
      { step: "Converting PDF to image...", progress: 25 },
      { step: "Running OCR to extract text...", progress: 35 },
      { step: "Reading and cleaning extracted text...", progress: 45 },
      { step: "Identifying subject rows and schedule blocks...", progress: 55 },
      { step: "Fixing the time and days...", progress: 63 },
      { step: "Matching instructors and rooms...", progress: 70 },
      { step: "Structuring data into schedule format...", progress: 77 },
      { step: "Analyzing schedule with AI model...", progress: 84 },
      { step: "Making sure everything looks good...", progress: 90 },
      { step: "Getting it ready to show you...", progress: 93 },
      { step: "Adding design and layout...", progress: 95 },
      { step: "Optimizing for editability and clarity...", progress: 97 },
      { step: "Displaying final schedule preview...", progress: 99 },
    ];

    try {
      // Start the fetch while progress is simulating
      const fetchPromise = fetch("/api/generate-schedule", {
        method: "POST",
        body: formData,
      });

      // Simulate steps one by one with delay
      for (const step of simulatedSteps) {
        setLoadingMessage(step.step);
        setProgress(step.progress);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }

      const res = await fetchPromise;

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();

      console.log(data.schedule);
      setSchedule(data.schedule);
      toast.success("Schedule generated successfully!");
    } catch (err: unknown) {
      console.error("Client Error:", err);
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
            <section className="space-y-8 max-w-md mx-auto">
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
                  className={`w-12  cursor-pointer h-12 rounded-full font-[family-name:var(--font-handy)] text-base transition-colors duration-200 shadow-sm flex items-center justify-center
      ${
        isEditing
          ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
          : "bg-blue-50 text-blue-700 hover:bg-blue-100"
      }`}
                  title={isEditing ? "Done Editing" : "Edit Schedule"}
                >
                  {isEditing ? "✓" : "✎"}
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
                    <div className="space-y-4 p-4 pt-6">
                      {grouped[day].length > 0 ? (
                        grouped[day].map((item, idx) => {
                          const index = schedule.findIndex(
                            (s) => s.id === item.id
                          );

                          return (
                            <div
                              key={idx}
                              className="grid font-[family-name:var(--font-sans)] grid-cols-2 text-sm items-center gap-x-4"
                            >
                              {isEditing ? (
                                <>
                                  <div className="flex flex-col gap-2">
                                    <input
                                      className="border border-blue-300 bg-white rounded px-2 py-1 text-sm focus:outline-none text-blue-950 font-medium focus:ring-2 focus:ring-blue-400"
                                      value={item.code}
                                      onChange={(e) =>
                                        updateScheduleField(
                                          index,
                                          "code",
                                          e.target.value
                                        )
                                      }
                                    />
                                    <input
                                      className="border border-blue-300 bg-white rounded px-2 py-1 text-sm focus:outline-none text-gray-700 focus:ring-2 focus:ring-blue-400"
                                      value={item.subject}
                                      onChange={(e) =>
                                        updateScheduleField(
                                          index,
                                          "subject",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="flex flex-col gap-2 text-right">
                                    <input
                                      className="border border-blue-300 bg-white rounded px-2 py-1 text-sm text-blue-600 font-medium focus:outline-none focus:ring-2 focus:ring-blue-400"
                                      value={item.time}
                                      onChange={(e) =>
                                        updateScheduleField(
                                          index,
                                          "time",
                                          e.target.value
                                        )
                                      }
                                    />
                                    <input
                                      className="border border-blue-300 bg-white rounded px-2 py-1 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                      value={item.room}
                                      onChange={(e) =>
                                        updateScheduleField(
                                          index,
                                          "room",
                                          e.target.value
                                        )
                                      }
                                    />
                                    <input
                                      className="border border-blue-300 bg-white rounded px-2 py-1 text-xs text-gray-600 italic focus:outline-none focus:ring-2 focus:ring-blue-400"
                                      value={item.instructor}
                                      onChange={(e) =>
                                        updateScheduleField(
                                          index,
                                          "instructor",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Instructor name"
                                    />
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="flex flex-col font-[family-name:var(--font-sans)]">
                                    <span className="font-medium text-blue-950">
                                      {item.code}
                                    </span>
                                    <span className="text-gray-700">
                                      {item.subject}
                                    </span>
                                  </div>
                                  <div className="flex flex-col text-right font-[family-name:var(--font-sans)]">
                                    <span className="text-blue-600 font-medium">
                                      {item.time}
                                    </span>
                                    <span className="text-gray-600">
                                      {item.room}
                                    </span>
                                    <span className="text-gray-500 italic text-xs">
                                      {item.instructor}
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-gray-500 text-center italic font-[family-name:var(--font-sans)]">
                          No classes
                        </div>
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
