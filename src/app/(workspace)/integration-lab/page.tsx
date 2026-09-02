import { PageTitle } from "@/components/workspace-server";
import { RazorpayCheckout } from "@/components/razorpay-checkout";

export default function IntegrationLabPage() {
  return (
    <div className="space-y-6">
      <PageTitle eyebrow="Integration Lab" title="Razorpay Test Environment">
        <p className="max-w-md text-sm leading-6 text-slate-500 text-right">
          Simulate standard checkout flows in Razorpay Test Mode to verify signature and webhook deduplication logic.
        </p>
      </PageTitle>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-2">Test Checkout</h3>
            <p className="text-sm text-slate-600 mb-6">
              Use standard Razorpay Test credentials (e.g., any card number like 4111 1111 1111 1111).
              A successful payment will dispatch a <code>payment.captured</code> webhook to credit recovery.
            </p>
            <RazorpayCheckout amount={25000} caseId="DEMO-CHK-01" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <h4 className="font-semibold text-emerald-900 mb-1">Success Flow</h4>
            <p className="text-sm text-emerald-800 leading-relaxed">
              When a checkout succeeds, it is marked as &quot;awaiting verified webhook&quot;. We never credit recovery instantly 
              based on client success to prevent tampering. Only the verified <code>payment.captured</code> webhook 
              triggers the actual credit.
            </p>
          </div>
          
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <h4 className="font-semibold text-amber-900 mb-1">Dismissal & Failure</h4>
            <p className="text-sm text-amber-800 leading-relaxed">
              If the checkout modal is dismissed or payment fails, it generates an internal failure metric but does 
              not compromise the case state. The recovery agent remains aware and can sequence a fallback action 
              if the policy permits.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
