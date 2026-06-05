import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AlertCircle, Clock } from 'lucide-react';
import InvoiceDetailSheet from '@/components/business/details/InvoiceDetailSheet';
import { BusinessDivider } from '@/components/business/BusinessChrome';

export default function InvoiceList({ invoices: initialInvoices }) {
  const [invoices, setInvoices] = useState(initialInvoices || []);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setInvoices(initialInvoices || []);
  }, [initialInvoices]);

  const total = invoices.reduce((s, i) => s + i.amount, 0);

  const handleMarkPaid = (id) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
  };

  if (invoices.length === 0) {
    return <p className="text-[14px] text-[#9AA5B4] py-4">Inga utestående fakturor</p>;
  }

  return (
    <>
      <p className="text-[15px] font-semibold text-[#1A2332] tabular-nums mb-3">
        {total.toLocaleString('sv-SE')} kr totalt
      </p>
      <div>
        {invoices.map((inv, i) => {
          const isOverdue = inv.status === 'overdue';
          const isSoon = inv.daysLeft <= 7 && inv.daysLeft >= 0;
          return (
            <React.Fragment key={inv.id}>
              {i > 0 && <BusinessDivider />}
              <button
                type="button"
                onClick={() => setSelected(inv)}
                className="w-full flex items-center gap-3 py-3.5 text-left active:opacity-60"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: isOverdue ? 'rgba(229,62,62,0.1)' : '#F0F2F5' }}
                >
                  {isOverdue ? (
                    <AlertCircle className="w-4 h-4 text-[#E53E3E]" />
                  ) : (
                    <Clock className="w-4 h-4" style={{ color: isSoon ? '#D69E2E' : '#9AA5B4' }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-[#1A2332] truncate">{inv.client}</p>
                  <p className="text-[13px] text-[#9AA5B4]">
                    {inv.id} · {inv.due}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[15px] font-semibold text-[#1A2332] tabular-nums">
                    {inv.amount.toLocaleString('sv-SE')} kr
                  </p>
                  <p
                    className={`text-[12px] font-medium mt-0.5 ${isOverdue ? 'text-[#E53E3E]' : isSoon ? 'text-[#D69E2E]' : 'text-[#0D7377]'}`}
                  >
                    {isOverdue ? 'Förfallen' : `${inv.daysLeft}d`}
                  </p>
                </div>
              </button>
            </React.Fragment>
          );
        })}
      </div>

      <AnimatePresence>
        {selected && (
          <InvoiceDetailSheet
            invoice={selected}
            onClose={() => setSelected(null)}
            onMarkPaid={(id) => {
              handleMarkPaid(id);
              setSelected(null);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
