import { ReactNode } from "react";

type ShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function Shell({ title, subtitle, children }: ShellProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-8">
      <section className="fade-up glass rounded-3xl p-6 md:p-8 text-center">
        <p className="text-lg font-extrabold uppercase tracking-[0.24em] text-teal-300 font-display">LEIF Workforce Hub</p>
        <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-white md:text-6xl">{title}</h1>
        <p className="mt-4 max-w-2xl mx-auto text-[10px] text-slate-400 md:text-xs font-engage">{subtitle}</p>
      </section>
      <section className="fade-up [animation-delay:120ms]">{children}</section>
    </main>
  );
}
