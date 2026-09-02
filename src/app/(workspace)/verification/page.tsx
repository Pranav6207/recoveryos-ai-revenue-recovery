import { PageTitle, ModePill } from "@/components/workspace-server";
import { getIntegrationHealth } from "@/lib/integrations";

export default function VerificationPage() {
  const health = getIntegrationHealth();

  return (
    <div className="space-y-6">
      <PageTitle eyebrow="Verification" title="Integration Health">
        <p className="max-w-md text-sm leading-6 text-slate-500 text-right">
          Ensuring zero-cost and compliant demonstration bounds. Fallbacks activate dynamically if providers are unconfigured.
        </p>
      </PageTitle>

      <div className="grid gap-6 md:grid-cols-2">
        {health.map((integration) => (
          <div key={integration.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900">{integration.name}</h3>
              <ModePill mode={integration.mode} />
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              {integration.detail}
            </p>
          </div>
        ))}
      </div>

      <section className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-6">
        <h4 className="font-semibold text-blue-900 mb-2">Zero-Config Demo Promise</h4>
        <p className="text-sm text-blue-800 leading-relaxed">
          The RecoveryOS demo is designed to run entirely without credentials. If you haven&apos;t supplied a Gemini API Key, 
          a Supabase connection string, or a Razorpay Secret, the application gracefully degrades to seeded synthetic 
          data, deterministic AI responses, and local-only audits. 
        </p>
      </section>
    </div>
  );
}
