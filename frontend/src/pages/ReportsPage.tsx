import { useNavigate } from "react-router-dom";

export function ReportsPage() {
  const navigate = useNavigate();
  const imageUrl: string | null = null;
  const userCode = "U21";
  const username = "User21";
  const timeAgo = "11d ago";
  const pointsText = "102pts";

  return (
    <>
      <div className="min-h-screen bg-background">
        <section className="relative left-1/2 h-[32dvh] w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden bg-[#252e25]">
          <button
            type="button"
            className="absolute left-3 top-3 z-10 text-emerald-300"
            aria-label="Back"
            onClick={() => navigate(-1)}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M11.03 3.22a1 1 0 0 1 0 1.41L5.66 10H21a1 1 0 1 1 0 2H5.66l5.37 5.37a1 1 0 1 1-1.41 1.41l-7.1-7.1a1 1 0 0 1 0-1.41l7.1-7.1a1 1 0 0 1 1.41 0Z"
                fill="currentColor"
              />
            </svg>
          </button>

          {imageUrl ? (
            <img src={imageUrl} alt="Report" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center">
              <div className="translate-y-10 text-base font-medium text-slate-200">
                Report Photo
              </div>
            </div>
          )}
        </section>

        <section className="relative min-h-[calc(100dvh-32dvh)] px-4 pb-28 pt-4">
          <div className="absolute left-0 right-0 top-4 mx-auto flex max-w-[240px] items-center justify-between px-4">
            <div className="text-yellow-400">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M12 2.2l2.92 6.26 6.88.62-5.2 4.5 1.56 6.72L12 16.9 5.84 20.3l1.56-6.72-5.2-4.5 6.88-.62L12 2.2Z"
                  fill="currentColor"
                />
              </svg>
            </div>

            <div className="text-2xl font-normal text-emerald-300">{pointsText}</div>
          </div>

          <div className="absolute left-0 right-0 top-16 px-4">
            <div className="flex h-16 w-full items-center gap-3 rounded-xl border border-slate-700 bg-[#252e25] px-3">
              <div
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-emerald-300 ring-1 ring-slate-600"
              >
                <span className="text-sm font-semibold text-emerald-800">{userCode}</span>
              </div>

              <div className="flex flex-1 flex-col items-center leading-tight">
                <div className="text-sm font-medium text-emerald-300">{username}</div>
                <div className="ml-3 text-xs text-slate-300">{timeAgo}</div>
              </div>
            </div>
          </div>

          <div className="absolute left-0 right-0 top-36 px-4">
            <div className="flex items-center text-sm text-slate-300">
              <span>Location:</span>
              <span className="ml-12">Type:</span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
