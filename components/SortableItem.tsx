"use client";
import { ScheduleEntry } from "@/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AiOutlineDelete } from "react-icons/ai";
import { MdOutlineDragHandle } from "react-icons/md";
import { FaCaretUp, FaCaretDown } from "react-icons/fa";
import { motion } from "framer-motion";
import {
  borderColorMap,
  codeColorTextMap,
  ringColorMap,
  timeColorTextMap,
} from "@/utils/schedColors";

interface SortableItemProps {
  item: ScheduleEntry;
  color: string;
  index: number;
  isEditing: boolean;
  updateScheduleField: (
    index: number,
    field: keyof ScheduleEntry,
    value: string
  ) => void;
  deleteScheduleEntry: (id: string) => void;
  moveEntry: (index: number, direction: -1 | 1) => void;
}

export function SortableItem({
  item,
  index,
  isEditing,
  updateScheduleField,
  deleteScheduleEntry,
  moveEntry,
  color,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isDragging = !!transform;
  const Component = isDragging ? "div" : motion.div;

  const codeTextColor = codeColorTextMap[color] ?? "text-gray-900";
  const timeTextColor = timeColorTextMap[color] ?? "text-gray-700";
  const borderColor = borderColorMap[color] ?? "border-gray-300";
  const ringColor = ringColorMap[color] ?? "focus:ring-gray-400";

  return (
    <Component
      ref={setNodeRef}
      style={style}
      {...(!isDragging && {
        layout: true,
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
        transition: { type: "spring", stiffness: 300, damping: 30 },
      })}
      className="grid grid-cols-2 mb-0 gap-y-4 gap-x-1  items-start  text-sm font-[family-name:var(--font-sans)] group "
    >
      {/* Left Column */}
      <div className="flex flex-col  gap-1  relative">
        {/* DESKTOP DRAG AND DROP SORT */}
        {isEditing && (
          <div className="absolute hidden lg:flex top-0 -left-16  gap-1 items-center ">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab text-black hover:text-gray-600"
              title="Drag to reorder"
            >
              <MdOutlineDragHandle size={18} />
            </div>
            <button
              onClick={() => deleteScheduleEntry(item.id)}
              className="text-red-400 cursor-pointer hover:text-red-500"
              title="Delete class"
            >
              <AiOutlineDelete size={18} />
            </button>
          </div>
        )}

        {/* MOBILE SORT */}
        {isEditing && (
          <div className="flex lg:hidden gap-1 mb-1">
            <button
              onClick={() => moveEntry(index, -1)}
              title="Move up"
              className="w-4 h-4 flex items-center justify-center border border-gray-200 rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 active:bg-gray-200 shadow transition"
            >
              <FaCaretUp />
            </button>

            <button
              onClick={() => moveEntry(index, 1)}
              title="Move down"
              className="w-4 h-4 flex items-center justify-center border border-gray-200 rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 active:bg-gray-200 shadow transition"
            >
              <FaCaretDown />
            </button>

            <button
              onClick={() => deleteScheduleEntry(item.id)}
              className="w-4 h-4 flex items-center justify-center  text-red-500 hover:text-red-600 active:text-red-600  transition"
              title="Delete class"
            >
              <AiOutlineDelete />
            </button>
          </div>
        )}

        {isEditing ? (
          <>
            <input
              className={`border  bg-white rounded px-2 py-1 text-sm focus:outline-none  font-medium focus:ring-2 ${codeTextColor} ${borderColor} ${ringColor}`}
              value={item.code}
              placeholder="Code"
              onChange={(e) =>
                updateScheduleField(index, "code", e.target.value)
              }
            />
            <input
              className={`border  bg-white rounded px-2 py-1 text-sm focus:outline-none text-gray-700 focus:ring-2  ${borderColor} ${ringColor}`}
              value={item.subject}
              placeholder="Subject"
              onChange={(e) =>
                updateScheduleField(index, "subject", e.target.value)
              }
            />
          </>
        ) : (
          <>
            <span className={`font-medium ${codeTextColor}`}>{item.code}</span>
            <span className="text-gray-700">{item.subject}</span>
          </>
        )}
      </div>

      {/* Right Column */}
      <div className="flex flex-col gap-1 text-right">
        {isEditing ? (
          <>
            <input
              className={`border  bg-white rounded px-2 py-1 text-sm  font-medium focus:outline-none focus:ring-2  ${timeTextColor} ${borderColor} ${ringColor}`}
              value={item.time}
              placeholder="Time"
              onChange={(e) =>
                updateScheduleField(index, "time", e.target.value)
              }
            />
            <input
              className={`border  bg-white rounded px-2 py-1 text-sm text-gray-600 focus:outline-none focus:ring-2 ${borderColor} ${ringColor}`}
              value={item.room}
              placeholder="Room"
              onChange={(e) =>
                updateScheduleField(index, "room", e.target.value)
              }
            />
            <input
              className={`border  bg-white rounded px-2 py-1 text-xs text-gray-600 italic focus:outline-none focus:ring-2  ${borderColor} ${ringColor}`}
              value={item.instructor ?? ""}
              onChange={(e) =>
                updateScheduleField(index, "instructor", e.target.value)
              }
              placeholder="Instructor name"
            />
          </>
        ) : (
          <>
            <span className={` ${timeTextColor} font-medium `}>
              {item.time}
            </span>
            <span className="text-gray-600">{item.room}</span>
            <span className="text-gray-500 italic text-xs">
              {item.instructor}
            </span>
          </>
        )}
      </div>
    </Component>
  );
}
