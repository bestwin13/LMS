import LoginForm from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-5">
      <div className="relative hidden flex-col justify-between bg-ink p-12 text-white lg:col-span-2 lg:flex">
        <span className="font-serif text-xl tracking-tight">Meridian</span>

        <div>
          <p className="font-serif text-4xl leading-tight italic text-slate-light">
            “Pipeline visibility changed how fast our team closes.”
          </p>
          <p className="mt-6 text-sm text-white/60">
            Every lead, owner, and stage — in one place your whole team trusts.
          </p>
        </div>

        <p className="text-xs text-white/40">
          © {new Date().getFullYear()} Meridian CRM
        </p>
      </div>

      <div className="flex items-center justify-center p-8 lg:col-span-3">
        <LoginForm />
      </div>
    </div>
  );
}
