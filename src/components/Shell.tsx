import { ReactNode } from "react";

type ShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function Shell({ title, subtitle, children }: ShellProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-8">
      <section className="fade-up glass rounded-3xl p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-300">LEIF Workforce Hub</p>
        <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-white md:text-5xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300 md:text-base">{subtitle}</p>
      </section>
      <section className="fade-up [animation-delay:120ms]">{children}</section>
    </main>
  );
}
