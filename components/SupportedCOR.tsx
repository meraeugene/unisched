"use client";

const schoolList = ["USTP", "CMU"];

const SupportedCOR = () => {
  return (
    <div className="max-w-xs mx-auto z-10 text-center">
      <div className="grid grid-cols-2 gap-4">
        {schoolList.map((school) => (
          <button
            key={school}
            className="flex cursor-pointer items-center  gap-2  justify-center py-3 px-5 text-2xl bg-blue-50 border-b-4 text-blue-600 rounded-xl border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 font-[family-name:var(--font-handy)]"
          >
            <img
              src={`/logos/${school.toLowerCase()}.webp`} // e.g., public/logos/ustp.png
              alt={`${school} Logo`}
              className="w-6 h-6"
            />

            {school}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SupportedCOR;
