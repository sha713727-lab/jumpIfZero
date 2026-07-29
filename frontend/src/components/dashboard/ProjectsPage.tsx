import { demoProjects } from "@/constants/dashboard";

const statusClass: Record<(typeof demoProjects)[number]["status"], string> = {
  "In progress": "bg-[rgba(116,129,95,0.14)] text-brand",
  Review: "bg-[rgba(249,161,55,0.18)] text-[#e8891a]",
};

export function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[clamp(1.6rem,3vw,2rem)] font-extrabold tracking-[-0.04em] text-[#0d120b]">
          Projects
        </h1>
        <p className="mt-2 text-[0.95rem] font-medium text-black/50">
          Track status, progress, and upcoming milestones.
        </p>
      </div>

      <div className="grid gap-4">
        {demoProjects.map((project) => (
          <article
            key={project.id}
            className="rounded-2xl border border-black/8 bg-white p-5 shadow-[0_8px_24px_rgba(47,58,40,0.04)] md:p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                  {project.service}
                </p>
                <h2 className="mt-1 text-[1.15rem] font-extrabold tracking-[-0.02em] text-[#0d120b]">
                  {project.name}
                </h2>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-[0.72rem] font-extrabold tracking-[0.08em] uppercase ${statusClass[project.status]}`}
              >
                {project.status}
              </span>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-[0.8rem] font-semibold">
                <span className="text-black/45">Progress</span>
                <span className="text-[#0d120b]">{project.progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-black/[0.06]">
                <div
                  className="h-full rounded-full bg-logo-gradient"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            <dl className="mt-5 grid gap-3 sm:grid-cols-3">
              <div>
                <dt className="text-[0.72rem] font-bold tracking-[0.1em] text-black/40 uppercase">
                  Manager
                </dt>
                <dd className="mt-1 text-[0.9rem] font-semibold">{project.manager}</dd>
              </div>
              <div>
                <dt className="text-[0.72rem] font-bold tracking-[0.1em] text-black/40 uppercase">
                  Updated
                </dt>
                <dd className="mt-1 text-[0.9rem] font-semibold">{project.updated}</dd>
              </div>
              <div>
                <dt className="text-[0.72rem] font-bold tracking-[0.1em] text-black/40 uppercase">
                  Next milestone
                </dt>
                <dd className="mt-1 text-[0.9rem] font-semibold">
                  {project.nextMilestone}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}
