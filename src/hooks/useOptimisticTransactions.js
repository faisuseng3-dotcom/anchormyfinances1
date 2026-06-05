// @ts-nocheck
import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
const OPTIMISTIC_PREFIX = 'opt-tx-';

export function buildOptimisticTransaction(data) {
  const amount = Math.abs(Number(data.amount) || 0);
  const isExpense = data.type === 'expense' || (data.type !== 'income' && data.amount < 0);
  return {
    id: `${OPTIMISTIC_PREFIX}${Date.now()}`,
    type: data.type || (isExpense ? 'expense' : 'income'),
    amount: isExpense ? -amount : amount,
    label: data.label || data.vendor || 'Ny transaktion',
    vendor: data.vendor,
    category: data.category || 'other',
    paymentMethod: data.paymentMethod,
    note: data.note,
    context: data.context || 'PERSONAL',
    created_date: data.created_date || new Date().toISOString(),
    _optimistic: true,
  };
}

function patchAllTransactionCaches(queryClient, updater) {
  queryClient.setQueriesData({ queryKey: ['transactions'] }, (old) => {
    if (!Array.isArray(old)) return old;
    return updater(old);
  });
}

function snapshotTransactionCaches(queryClient) {
  return queryClient.getQueriesData({ queryKey: ['transactions'] });
}

function restoreTransactionCaches(queryClient, snapshot) {
  snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data));
}

function invalidateTransactionDerived(queryClient) {
  queryClient.invalidateQueries({ queryKey: ['transactions'] });
  queryClient.invalidateQueries({ queryKey: ['insightsBundle'] });
  queryClient.invalidateQueries({ queryKey: ['futurePulse'] });
}

/**
 * Optimistisk create/update/delete — UI uppdateras direkt, API i bakgrunden.
 */
export function useOptimisticTransactions() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    /** @param {Record<string, unknown>} data */
    mutationFn: (data) => base44.entities.Transaction.create({ ...data, context: data.context || 'PERSONAL' }),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ['transactions'] });
      const snapshot = snapshotTransactionCaches(queryClient);
      const optimistic = buildOptimisticTransaction(data);
      patchAllTransactionCaches(queryClient, (list) => [optimistic, ...list]);
      return { snapshot, optimisticId: optimistic.id };
    },
    onError: (_err, _data, ctx) => {
      if (ctx?.snapshot) restoreTransactionCaches(queryClient, ctx.snapshot);
      toast.error('Kunde inte spara transaktionen', {
        description: 'Kontrollera nätverket och försök igen.',
        duration: 4500,
      });
    },
    onSuccess: (created, _data, ctx) => {
      if (!ctx?.optimisticId) return;
      patchAllTransactionCaches(queryClient, (list) =>
        list.map((t) => (t.id === ctx.optimisticId ? { ...created, _optimistic: false } : t)),
      );
    },
    onSettled: () => invalidateTransactionDerived(queryClient),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Transaction.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['transactions'] });
      const snapshot = snapshotTransactionCaches(queryClient);
      patchAllTransactionCaches(queryClient, (list) =>
        list.map((t) => (t.id === id ? { ...t, ...data, _optimistic: true } : t)),
      );
      return { snapshot };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.snapshot) restoreTransactionCaches(queryClient, ctx.snapshot);
      toast.error('Kunde inte uppdatera', { duration: 4000 });
    },
    onSettled: () => invalidateTransactionDerived(queryClient),
  });

  const deleteMutation = useMutation({
    /** @param {string} id */
    mutationFn: (id) => base44.entities.Transaction.delete(id),
    onMutate: async (id) => {
      if (String(id).startsWith(OPTIMISTIC_PREFIX)) return { snapshot: [] };
      await queryClient.cancelQueries({ queryKey: ['transactions'] });
      const snapshot = snapshotTransactionCaches(queryClient);
      patchAllTransactionCaches(queryClient, (list) => list.filter((t) => t.id !== id));
      return { snapshot };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.snapshot) restoreTransactionCaches(queryClient, ctx.snapshot);
      toast.error('Kunde inte ta bort', { duration: 4000 });
    },
    onSettled: () => invalidateTransactionDerived(queryClient),
  });

  const createTransaction = useCallback(
    (data) => createMutation.mutateAsync(data),
    [createMutation],
  );

  const updateTransaction = useCallback(
    (id, data) => updateMutation.mutateAsync({ id, data }),
    [updateMutation],
  );

  const deleteTransaction = useCallback(
    (id) => deleteMutation.mutateAsync(id),
    [deleteMutation],
  );

  return {
    createTransaction,
    updateTransaction,
    deleteTransaction,
    isCreating: createMutation.isPending,
  };
}
